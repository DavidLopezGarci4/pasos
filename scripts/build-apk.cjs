const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');
const androidDir = path.join(rootDir, 'android');
const pkg = JSON.parse(fs.readFileSync(path.join(rootDir, 'package.json'), 'utf8'));
const version = pkg.version || '1.0.0';

console.log(`\n📦 INICIANDO COMPILACIÓN Y EMPAQUETADO RELEASE DE PASOS (v${version})...\n`);

// 1. Sincronizar versiones SemVer en android/app/build.gradle
const parts = version.split('.').map((n) => parseInt(n, 10) || 0);
const versionCode = (parts[0] || 1) * 10000 + (parts[1] || 0) * 100 + (parts[2] || 0);
const buildGradlePath = path.join(androidDir, 'app', 'build.gradle');
if (fs.existsSync(buildGradlePath)) {
  let content = fs.readFileSync(buildGradlePath, 'utf8');
  content = content.replace(/versionCode\s+\d+/, `versionCode ${versionCode}`);
  content = content.replace(/versionName\s+["'][^"']+["']/, `versionName "${version}"`);
  fs.writeFileSync(buildGradlePath, content, 'utf8');
  console.log(`⚡ Sincronizado build.gradle: versionCode ${versionCode}, versionName "${version}"`);
}

// 2. JDK 21 / Java Resolution
const candidateJdks = [
  'C:\\Users\\dace8\\.jdks\\jbr-21.0.11',
  'C:\\Program Files\\Android\\Android Studio\\jbr',
  'C:\\Program Files\\Java\\jdk-21',
  'C:\\Program Files\\Java\\jdk-17',
];
let javaHome = process.env.JAVA_HOME;
if (!javaHome || !fs.existsSync(javaHome)) {
  const found = candidateJdks.find((p) => fs.existsSync(p));
  if (found) javaHome = found;
}
const env = { ...process.env };
if (javaHome && fs.existsSync(javaHome)) {
  env.JAVA_HOME = javaHome;
  env.Path = `${path.join(javaHome, 'bin')};${process.env.Path || ''}`;
}

// 2. Sincronizar dist web a Android assets
const distDir = path.join(rootDir, 'dist');
const androidAssetsPublic = path.join(androidDir, 'app', 'src', 'main', 'assets', 'public');
if (fs.existsSync(distDir)) {
  if (!fs.existsSync(androidAssetsPublic)) {
    fs.mkdirSync(androidAssetsPublic, { recursive: true });
  }
  fs.cpSync(distDir, androidAssetsPublic, { recursive: true });
  console.log('⚡ Web dist sincronizado en assets de Android.');
}

// Sincronizar assets fuera de OneDrive para evitar bloqueos de sincronización
const externalAssetsDir = 'C:\\Users\\dace8\\.gradle_builds\\Pasos\\assets';
try {
  if (fs.existsSync(externalAssetsDir)) {
    fs.rmSync(externalAssetsDir, { recursive: true, force: true });
  }
  fs.mkdirSync(externalAssetsDir, { recursive: true });
  if (fs.existsSync(path.join(androidDir, 'app', 'src', 'main', 'assets'))) {
    fs.cpSync(path.join(androidDir, 'app', 'src', 'main', 'assets'), externalAssetsDir, { recursive: true });
    console.log('⚡ Assets sincronizados en', externalAssetsDir);
  }
} catch (e) {
  console.warn('⚠️ Advertencia al copiar assets:', e.message);
}

console.log('⚡ Ejecutando gradlew assembleRelease...');
execSync('.\\gradlew.bat assembleRelease --no-daemon', {
  cwd: androidDir,
  env,
  stdio: 'inherit',
});

// 3. Localizar APK unsigned
const possibleUnsigned = [
  path.join('C:\\Users\\dace8\\.gradle_builds\\Pasos\\app\\outputs\\apk\\release\\app-release-unsigned.apk'),
  path.join(androidDir, 'app\\build\\outputs\\apk\\release\\app-release-unsigned.apk'),
  path.join(androidDir, 'app\\build\\outputs\\apk\\release\\app-unsigned.apk'),
];
const unsignedApk = possibleUnsigned.find((p) => fs.existsSync(p));
if (!unsignedApk) {
  console.error('❌ No se encontró app-release-unsigned.apk generado por Gradle.');
  process.exit(1);
}

// 4. Firmar con apksigner
const sdkBuildTools = path.join(process.env.LOCALAPPDATA, 'Android', 'Sdk', 'build-tools', '34.0.0', 'apksigner.bat');
const keystore = path.join(process.env.USERPROFILE, '.android', 'debug.keystore');
const releaseDir = path.join(androidDir, 'app', 'release');
if (!fs.existsSync(releaseDir)) {
  fs.mkdirSync(releaseDir, { recursive: true });
}

const targetVersionedApk = path.join(releaseDir, `pasos-v${version}-release.apk`);
const targetReleaseApk = path.join(releaseDir, 'pasos-release.apk');
const rootVersionedApk = path.join(rootDir, `pasos-v${version}-release.apk`);
const rootReleaseApk = path.join(rootDir, 'pasos-release.apk');

console.log('🔑 Firmando APK de producción con apksigner...');
const signCmd = `"${sdkBuildTools}" sign --ks "${keystore}" --ks-pass pass:android --key-pass pass:android --ks-key-alias androiddebugkey --out "${targetVersionedApk}" "${unsignedApk}"`;
execSync(signCmd, { env, stdio: 'inherit' });

// Generar copias con nombres canónicos y versionados en releaseDir y en raíz
fs.copyFileSync(targetVersionedApk, targetReleaseApk);
fs.copyFileSync(targetVersionedApk, rootReleaseApk);
fs.copyFileSync(targetVersionedApk, rootVersionedApk);

// 5. Verificación y reporte
const stats = fs.statSync(targetReleaseApk);
const sizeMb = (stats.size / (1024 * 1024)).toFixed(2);

console.log('\n============================================================');
console.log(`✅ ¡APK DE PASOS EMPAQUETADA CON ÉXITO!`);
console.log(`   - Archivo Principal:        ${path.basename(targetReleaseApk)} (${sizeMb} MB)`);
console.log(`   - Archivo Versionado:       ${path.basename(targetVersionedApk)}`);
console.log(`   - Copia Versionada en Raíz: ${rootVersionedApk}`);
console.log(`   - Copia Canónica en Raíz:   ${rootReleaseApk}`);
console.log(`   - Versión SemVer:           v${version} (versionCode ${versionCode})`);
console.log('============================================================\n');
