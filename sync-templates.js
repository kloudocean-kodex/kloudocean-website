const fs = require('fs');
const path = require('path');

const TEMPLATE_DIR = path.join(__dirname, 'templates');
const DIRECTORIES_TO_SCAN = ['.', 'services', 'blog']; // Scan root, services/ and blog/ subdirectories

// Load template contents
const templates = {
  HEAD_COMMON: fs.readFileSync(path.join(TEMPLATE_DIR, 'head-common.html'), 'utf8').trim(),
  NAV: fs.readFileSync(path.join(TEMPLATE_DIR, 'nav.html'), 'utf8').trim(),
  FOOTER: fs.readFileSync(path.join(TEMPLATE_DIR, 'footer.html'), 'utf8').trim(),
  COOKIE_BANNER: fs.readFileSync(path.join(TEMPLATE_DIR, 'cookie-banner.html'), 'utf8').trim()
};

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let originalContent = content;
  let modified = false;

  Object.entries(templates).forEach(([name, templateContent]) => {
    // Regex matches: <!-- TEMPLATE: name --> [any content] <!-- TEMPLATE_END -->
    // with lazy matching dotAll mode
    const regex = new RegExp(`<!--\\s*TEMPLATE:\\s*${name}\\s*-->([\\s\\S]*?)<!--\\s*TEMPLATE_END\\s*-->`, 'g');
    
    if (regex.test(content)) {
      content = content.replace(regex, (match, p1) => {
        // Check if content actually needs updating to prevent unnecessary writes
        if (p1.trim() === templateContent) {
          return match;
        }
        modified = true;
        console.log(`[Update] Updating template ${name} in ${path.relative(__dirname, filePath)}`);
        return `<!-- TEMPLATE: ${name} -->\n${templateContent}\n<!-- TEMPLATE_END -->`;
      });
      // Reset regex index
      regex.lastIndex = 0;
    }
  });

  if (modified) {
    fs.writeFileSync(filePath, content, 'utf8');
  }
}

function scanDirectories() {
  DIRECTORIES_TO_SCAN.forEach(dirName => {
    const dirPath = path.resolve(__dirname, dirName);
    if (!fs.existsSync(dirPath)) return;

    const files = fs.readdirSync(dirPath);
    files.forEach(file => {
      const filePath = path.join(dirPath, file);
      const stat = fs.statSync(filePath);

      if (stat.isFile() && file.endsWith('.html')) {
        processFile(filePath);
      }
    });
  });
}

console.log('Starting template synchronization...');
scanDirectories();
console.log('Synchronization complete!');
