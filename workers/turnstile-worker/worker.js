// Cloudflare Worker: Turnstile verification + forwarder for Formspree
// Usage: deploy to Cloudflare Workers and set secrets: TURNSTILE_SECRET, FORMSPREE_ENDPOINT

addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request));
});

async function handleRequest(request) {
  if (request.method !== 'POST') return new Response('Method Not Allowed', { status: 405 });

  const contentType = request.headers.get('content-type') || '';
  let form;
  if (contentType.includes('application/json')) {
    const json = await request.json();
    form = new Map(Object.entries(json));
  } else {
    form = await request.formData();
  }

  // Accept common turnstile token names
  const token = form.get ? form.get('cf-turnstile-response') || form.get('turnstile_response') || form.get('turnstileToken') : form.get('turnstile_response');
  const fallback = form.get ? form.get('fallback_captcha') : null;

  // Access global environment variables/secrets safely without shadowing ReferenceErrors
  const turnstileSecret = typeof TURNSTILE_SECRET !== 'undefined' ? TURNSTILE_SECRET : null;
  const formspreeEndpoint = typeof FORMSPREE_ENDPOINT !== 'undefined' ? FORMSPREE_ENDPOINT : null;

  if (!formspreeEndpoint) {
    return new Response(JSON.stringify({ ok: false, error: 'Formspree endpoint not configured' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }

  let passed = false;
  if (token && turnstileSecret) {
    // verify with Cloudflare Turnstile
    const verifyUrl = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';
    const body = new URLSearchParams();
    body.append('secret', turnstileSecret);
    body.append('response', token);

    try {
      const res = await fetch(verifyUrl, { method: 'POST', body });
      const payload = await res.json();
      // payload.success is boolean, payload['error-codes'] may exist
      if (payload && payload.success) passed = true;
    } catch (e) {
      // network error verifying turnstile - leave passed=false and allow fallback logic below
      console.error('Turnstile verify error', e);
    }
  }

  // If fallback marker present, we still accept but tag submission for review
  const isFallback = !!fallback && !passed;

  // Minimal server-side guard for fallback: require an email and reasonable length content
  if (isFallback) {
    const email = form.get('email');
    if (!email || String(email).length < 5) {
      return new Response(JSON.stringify({ ok: false, error: 'Fallback submissions require an email' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }
  }

  // Forward to Formspree preserving fields and adding verification metadata
  try {
    const forwardBody = new URLSearchParams();
    // iterate form values
    if (form.entries) {
      for (const [k, v] of form.entries()) {
        // skip any large files
        if (typeof v === 'string') forwardBody.append(k, v);
      }
    } else if (form.forEach) {
      form.forEach((v, k) => { if (typeof v === 'string') forwardBody.append(k, v); });
    }

    forwardBody.append('x_submitted_via', 'turnstile-worker');
    forwardBody.append('x_turnstile_verified', passed ? '1' : '0');
    if (isFallback) forwardBody.append('x_fallback_marker', '1');

    // Crucial: redirect manual ensures redirect is intercepted and sent to browser correctly
    const forwardRes = await fetch(formspreeEndpoint, {
      method: 'POST',
      body: forwardBody,
      redirect: 'manual'
    });

    // If Formspree redirects, pass the redirect headers back to the browser
    if (forwardRes.status === 301 || forwardRes.status === 302 || forwardRes.status === 303) {
      const redirectLocation = forwardRes.headers.get('location');
      return Response.redirect(redirectLocation || 'https://thekloudocean.com/thank-you', 302);
    }

    // Relay Formspree response
    const text = await forwardRes.text();
    return new Response(text, { status: forwardRes.status, headers: { 'Content-Type': forwardRes.headers.get('content-type') || 'text/plain' } });
  } catch (e) {
    console.error('Forward error', e);
    return new Response(JSON.stringify({ ok: false, error: 'Forward failed' }), { status: 502, headers: { 'Content-Type': 'application/json' } });
  }
}
