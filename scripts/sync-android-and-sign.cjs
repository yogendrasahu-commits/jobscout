const fs = require('fs');
const path = require('path');
const cp = require('child_process');
const AdmZip = require('adm-zip');

const rootDir = path.resolve(__dirname, '..');
const clientDist = path.join(rootDir, 'client', 'dist');
const androidAssetsPublic = path.join(rootDir, 'client', 'android', 'app', 'src', 'main', 'assets', 'public');
const clientApk = path.join(rootDir, 'client', 'public', 'downloads', 'jobscout-mobile.apk');
const serverApk = path.join(rootDir, 'server', 'public', 'downloads', 'jobscout-mobile.apk');
const keystorePath = path.join(rootDir, 'client', 'android', 'debug.keystore');
const javaBin = 'C:\\Program Files\\Microsoft\\jdk-17.0.21.21-hotspot\\bin';
const keytoolExe = path.join(javaBin, 'keytool.exe');
const apksignerBat = 'C:\\Users\\yogen\\AppData\\Local\\Android\\Sdk\\build-tools\\36.0.0\\apksigner.bat';

console.log('🔄 Step 1: Syncing client/dist into client/android assets/public...');
if (!fs.existsSync(androidAssetsPublic)) {
  fs.mkdirSync(androidAssetsPublic, { recursive: true });
}

// Helper to copy directory recursively
function copyDirSync(src, dest) {
  if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });
  const entries = fs.readdirSync(src, { withFileTypes: true });
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDirSync(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

// Clean old android assets and copy fresh
if (fs.existsSync(androidAssetsPublic)) {
  fs.rmSync(androidAssetsPublic, { recursive: true, force: true });
}
copyDirSync(clientDist, androidAssetsPublic);
console.log('✅ Android assets/public synchronized with latest client build.');

// Step 2: Inject fresh assets into jobscout-mobile.apk
console.log('📦 Step 2: Updating assets/public inside jobscout-mobile.apk...');
if (fs.existsSync(clientApk)) {
  const zip = new AdmZip(clientApk);
  
  // Remove existing assets/public entries
  const entries = zip.getEntries();
  for (const entry of entries) {
    if (entry.entryName.startsWith('assets/public/')) {
      zip.deleteFile(entry.entryName);
    }
  }

  // Add all new files from client/dist into assets/public/
  function addDirToZip(dirPath, zipPrefix) {
    const items = fs.readdirSync(dirPath, { withFileTypes: true });
    for (const item of items) {
      const fullPath = path.join(dirPath, item.name);
      if (item.isDirectory()) {
        addDirToZip(fullPath, `${zipPrefix}/${item.name}`);
      } else {
        const content = fs.readFileSync(fullPath);
        zip.addFile(`${zipPrefix}/${item.name}`, content);
      }
    }
  }
  addDirToZip(clientDist, 'assets/public');

  // Write updated zip
  zip.writeZip(clientApk);
  console.log('✅ APK web assets updated to latest release.');
}

// Step 3: Sign the APK using JDK 17 keytool & Android SDK apksigner
console.log('🔐 Step 3: Generating debug keystore if not present and signing APK...');
if (!fs.existsSync(keystorePath)) {
  console.log('Creating standard Android debug keystore...');
  cp.execSync(`"${keytoolExe}" -genkey -v -keystore "${keystorePath}" -storepass android -alias androiddebugkey -keypass android -keyalg RSA -keysize 2048 -validity 10000 -dname "CN=Android Debug,O=Android,C=US"`, { stdio: 'inherit' });
}

// Run apksigner sign
const env = Object.assign({}, process.env, {
  JAVA_HOME: 'C:\\Program Files\\Microsoft\\jdk-17.0.21.21-hotspot',
  PATH: `${javaBin};${process.env.PATH}`
});

console.log('Signing APK with APK Signature Scheme v1 (JAR) and v2 (Full APK)...');
cp.execSync(`"${apksignerBat}" sign --ks "${keystorePath}" --ks-pass pass:android --ks-key-alias androiddebugkey --key-pass pass:android --v1-signing-enabled true --v2-signing-enabled true "${clientApk}"`, { env, stdio: 'inherit' });

console.log('Verifying signed APK...');
const verifyOutput = cp.execSync(`"${apksignerBat}" verify --verbose "${clientApk}"`, { env }).toString();
console.log(verifyOutput);

// Step 4: Copy signed APK to server downloads
fs.copyFileSync(clientApk, serverApk);
console.log('✅ Synchronized signed APK to server/public/downloads/jobscout-mobile.apk');

// Step 5: Update Android project zip
const projectZipClient = path.join(rootDir, 'client', 'public', 'downloads', 'jobscout-android-project.zip');
const projectZipServer = path.join(rootDir, 'server', 'public', 'downloads', 'jobscout-android-project.zip');
const androidDir = path.join(rootDir, 'client', 'android');

console.log('📦 Step 5: Packaging Android Studio project zip...');
const projZip = new AdmZip();
const ignoreList = ['build', '.gradle', 'downloads', '.idea', 'debug.keystore'];

function addAndroidToZip(dirPath, zipPrefix) {
  const items = fs.readdirSync(dirPath, { withFileTypes: true });
  for (const item of items) {
    if (ignoreList.includes(item.name)) continue;
    const fullPath = path.join(dirPath, item.name);
    if (item.isDirectory()) {
      addAndroidToZip(fullPath, `${zipPrefix}/${item.name}`);
    } else {
      projZip.addLocalFile(fullPath, zipPrefix);
    }
  }
}
addAndroidToZip(androidDir, 'android');
projZip.writeZip(projectZipClient);
fs.copyFileSync(projectZipClient, projectZipServer);
console.log(`✅ Android Studio project zip generated: ${(fs.statSync(projectZipClient).size / (1024*1024)).toFixed(2)} MB`);

console.log('🎉 ALL MOBILE AND ANDROID BUILDS SUCCESSFULLY SYNCHRONIZED AND SIGNED!');
