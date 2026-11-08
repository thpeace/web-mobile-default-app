const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const distPath = path.resolve(__dirname, '../apps/mobile/dist');
const zipPath = path.resolve(__dirname, '../mobile-app-package.zip');

if (!fs.existsSync(distPath)) {
  console.error(`Error: ${distPath} does not exist. Run "pnpm package:mobile" first.`);
  process.exit(1);
}

console.log('📦 Archiving mobile application package...');

try {
  if (process.platform === 'win32') {
    // Windows PowerShell Compress-Archive
    execSync(`powershell -NoProfile -Command "Compress-Archive -Path '${distPath}/*' -DestinationPath '${zipPath}' -Force"`, {
      stdio: 'inherit',
    });
  } else {
    // Unix/Linux zip command, or fallback to tar
    try {
      execSync(`zip -r "${zipPath}" .`, { cwd: distPath, stdio: 'inherit' });
    } catch {
      console.log('zip utility not found, falling back to tar.gz...');
      execSync(`tar -czf "${path.resolve(__dirname, '../mobile-app-package.tar.gz')}" -C "${distPath}" .`, {
        stdio: 'inherit',
      });
    }
  }
  console.log(`✅ Mobile application package created successfully at: ${zipPath}`);
} catch (err) {
  console.error('Failed to create mobile application archive:', err.message);
  process.exit(1);
}
