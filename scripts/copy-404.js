import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Copy built index.html to 404.html for GitHub Pages SPA fallback.
// Try `dist` (Vite default) first, then fall back to `build` for older setups.
const candidates = ['dist', 'build'];
let buildDir = null;
for (const dir of candidates) {
  const p = path.resolve(__dirname, '..', dir);
  if (fs.existsSync(p)) {
    buildDir = p;
    break;
  }
}

if (!buildDir) {
  console.error('No build output directory found. Run `npm run build` first.');
  process.exit(1);
}

const indexPath = path.join(buildDir, 'index.html');
const destPath = path.join(buildDir, '404.html');

try {
  if (!fs.existsSync(indexPath)) {
    console.error(`index.html not found in ${buildDir}. Run \`npm run build\` first.`);
    process.exit(1);
  }

  fs.copyFileSync(indexPath, destPath);
  console.log(`Copied ${indexPath} -> ${destPath}`);
} catch (err) {
  console.error('Failed to create 404.html', err);
  process.exit(1);
}
