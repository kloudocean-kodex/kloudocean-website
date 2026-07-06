const fs = require('fs');
const path = require('path');

const TEMPLATE_DIR = path.join(__dirname, 'templates');
const DIRECTORIES_TO_SCAN = ['.', 'services', 'blog'];

const templates = {
  HEAD_COMMON: fs.readFileSync(path.join(TEMPLATE_DIR, 'head-common.html'), 'utf8').trim(),
  NAV: fs.readFileSync(path.join(TEMPLATE_DIR, 'nav.html'), 'utf8').trim(),
  FOOTER: fs.readFileSync(path.join(TEMPLATE_DIR, 'footer.html'), 'utf8').trim(),
  COOKIE_BANNER: fs.readFileSync(path.join(TEMPLATE_DIR, 'cookie-banner.html'), 'utf8').trim()
};

function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
}

function processFile(filePath) {
  if (filePath.endsWith('index.html')) return; // Already processed manually

  let content = fs.readFileSync(filePath, 'utf8');
  let originalContent = content;
  
  // 1. NAV
  if (!content.includes('<!-- TEMPLATE: NAV -->')) {
    content = content.replace(/<nav class="nav">[\s\S]*?<\/nav>/, match => `<!-- TEMPLATE: NAV -->\n${templates.NAV}\n<!-- TEMPLATE_END -->`);
  }

  // 2. FOOTER
  if (!content.includes('<!-- TEMPLATE: FOOTER -->')) {
    content = content.replace(/<footer>[\s\S]*?<\/footer>/, match => `<!-- TEMPLATE: FOOTER -->\n${templates.FOOTER}\n<!-- TEMPLATE_END -->`);
  }

  // 3. COOKIE_BANNER
  if (!content.includes('<!-- TEMPLATE: COOKIE_BANNER -->')) {
    content = content.replace(/<div class="cookie-banner"[\s\S]*?<\/div>\s*<\/div>/, match => `<!-- TEMPLATE: COOKIE_BANNER -->\n${templates.COOKIE_BANNER}\n<!-- TEMPLATE_END -->`);
  }

  // 4. HEAD_COMMON
  // This is tricky because the JSON-LD schemas need to stay.
  // We'll look for `<link rel="preconnect" href="https://fonts.googleapis.com">` up to `<script src="https://challenges.cloudflare.com/turnstile/v0/api.js" async defer></script>`
  if (!content.includes('<!-- TEMPLATE: HEAD_COMMON -->')) {
     const headRegex = /<link rel="preconnect" href="https:\/\/fonts\.googleapis\.com">[\s\S]*?<script src="https:\/\/challenges\.cloudflare\.com\/turnstile\/v0\/api\.js" async defer><\/script>/;
     content = content.replace(headRegex, match => `<!-- TEMPLATE: HEAD_COMMON -->\n${templates.HEAD_COMMON}\n<!-- TEMPLATE_END -->`);
  }

  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Injected comments into ${filePath}`);
  }
}

DIRECTORIES_TO_SCAN.forEach(dirName => {
  const dirPath = path.resolve(__dirname, dirName);
  if (!fs.existsSync(dirPath)) return;

  const files = fs.readdirSync(dirPath);
  files.forEach(file => {
    const filePath = path.join(dirPath, file);
    if (fs.statSync(filePath).isFile() && file.endsWith('.html')) {
      processFile(filePath);
    }
  });
});
