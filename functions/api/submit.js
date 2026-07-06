export async function onRequestPost(context) {
  const { request, env } = context;

  const contentType = request.headers.get('content-type') || '';
  let form;
  if (contentType.includes('application/json')) {
    const json = await request.json();
    form = new Map(Object.entries(json));
  } else {
    form = await request.formData();
  }

  // Access environment variables securely from env binding
  const turnstileSecret = env.TURNSTILE_SECRET || null;
  const formspreeEndpoint = env.FORMSPREE_ENDPOINT || null;

  if (!formspreeEndpoint) {
    return new Response(
      JSON.stringify({ ok: false, error: 'Formspree endpoint not configured' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }

  // Support common Turnstile token names
  const token = form.get ? form.get('cf-turnstile-response') || form.get('turnstile_response') || form.get('turnstileToken') : form.get('turnstile_response');
  const fallback = form.get ? form.get('fallback_captcha') : null;

  let passed = false;
  if (token && turnstileSecret) {
    const verifyUrl = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';
    const body = new URLSearchParams();
    body.append('secret', turnstileSecret);
    body.append('response', token);

    try {
      const res = await fetch(verifyUrl, { method: 'POST', body });
      const payload = await res.json();
      if (payload && payload.success) passed = true;
    } catch (e) {
      console.error('Turnstile verification failed', e);
    }
  }

  const isFallback = !!fallback && !passed;

  // Minimal server-side guard for fallback: require an email and reasonable length content
  if (isFallback) {
    const email = form.get('email');
    if (!email || String(email).length < 5) {
      return new Response(
        JSON.stringify({ ok: false, error: 'Fallback submissions require an email' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }
  }

  // Forward to Formspree preserving fields and adding verification metadata
  try {
    const forwardBody = new URLSearchParams();
    if (form.entries) {
      for (const [k, v] of form.entries()) {
        if (typeof v === 'string') forwardBody.append(k, v);
      }
    } else if (form.forEach) {
      form.forEach((v, k) => { if (typeof v === 'string') forwardBody.append(k, v); });
    }

    forwardBody.append('x_submitted_via', 'pages-function');
    forwardBody.append('x_turnstile_verified', passed ? '1' : '0');
    if (isFallback) forwardBody.append('x_fallback_marker', '1');

    // Crucial: set redirect to manual so we can intercept and relay the redirect headers
    const forwardRes = await fetch(formspreeEndpoint, {
      method: 'POST',
      body: forwardBody,
      redirect: 'manual'
    });

    // If Formspree returns a redirect (301, 302, 303), pass it directly back to the client
    if (forwardRes.status === 301 || forwardRes.status === 302 || forwardRes.status === 303) {
      const redirectLocation = forwardRes.headers.get('location');
      return Response.redirect(redirectLocation || 'https://thekloudocean.com/thank-you', 302);
    }

    // Relay other responses (e.g. 200, 400, 500)
    const text = await forwardRes.text();
    return new Response(text, {
      status: forwardRes.status,
      headers: { 'Content-Type': forwardRes.headers.get('content-type') || 'text/plain' }
    });
  } catch (e) {
    console.error('Forward error', e);
    return new Response(
      JSON.stringify({ ok: false, error: 'Forward failed' }),
      { status: 502, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
