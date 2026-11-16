const fs = require('fs');
const path = require('path');
const AdmZip = require('adm-zip');

const rootDir = path.resolve(__dirname, '..');
const androidDir = path.join(rootDir, 'client', 'android');
const clientDownloadsDir = path.join(rootDir, 'client', 'public', 'downloads');
const serverDownloadsDir = path.join(rootDir, 'server', 'public', 'downloads');

[clientDownloadsDir, serverDownloadsDir].forEach(dir => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

console.log('📦 Bundling Android Studio Project into ZIP archive...');

if (!fs.existsSync(androidDir)) {
  console.error('❌ client/android directory does not exist!');
  process.exit(1);
}

const zip = new AdmZip();

// Ignore build, .gradle, and large caches
const ignoreDirs = new Set(['.gradle', 'build', '.idea', 'captures']);

const addFilesRecursively = (currentDir, zipPrefix) => {
  const items = fs.readdirSync(currentDir);
  for (const item of items) {
    if (ignoreDirs.has(item)) continue;
    const fullPath = path.join(currentDir, item);
    const stat = fs.statSync(fullPath);
    const targetZipPath = zipPrefix ? `${zipPrefix}/${item}` : item;

    if (stat.isDirectory()) {
      addFilesRecursively(fullPath, targetZipPath);
    } else {
      zip.addLocalFile(fullPath, zipPrefix);
    }
  }
};

addFilesRecursively(androidDir, 'jobscout-android-project');

const outZipClient = path.join(clientDownloadsDir, 'jobscout-android-project.zip');
const outZipServer = path.join(serverDownloadsDir, 'jobscout-android-project.zip');

zip.writeZip(outZipClient);
fs.copyFileSync(outZipClient, outZipServer);

const stat = fs.statSync(outZipClient);
const sizeMb = (stat.size / (1024 * 1024)).toFixed(2);

console.log(`🎉 Successfully packaged Android Studio Project (${sizeMb} MB)`);
console.log(`📁 Download file: ${outZipClient}`);
