const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');
const androidDir = path.join(rootDir, 'android');
const pkg = JSON.parse(fs.readFileSync(path.join(rootDir, 'package.json'), 'utf8'));
const version = pkg.version || '1.0.0';

const modeArg = (process.argv[2] || 'dual').toLowerCase(); // 'dual', 'verticons', 'standard'

console.log(`\n📦 INICIANDO PIPELINE DE COMPILACIÓN RELEASE DE PASOS (v${version}) [Modo: ${modeArg.toUpperCase()}]...\n`);

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
  process.env.JAVA_HOME,
].filter(Boolean);

let javaHome = candidateJdks.find((p) => fs.existsSync(p)) || process.env.JAVA_HOME;
const androidSdk = path.join(process.env.LOCALAPPDATA, 'Android', 'Sdk');

console.log(`☕ Usando JDK: ${javaHome}`);
console.log(`📱 Usando Android SDK: ${androidSdk}`);

const psExe = fs.existsSync('C:\\Windows\\System32\\WindowsPowerShell\\v1.0\\powershell.exe')
  ? 'C:\\Windows\\System32\\WindowsPowerShell\\v1.0\\powershell.exe'
  : 'powershell';

const env = {
  ...process.env,
  JAVA_HOME: javaHome,
  ANDROID_HOME: androidSdk,
  ANDROID_SDK_ROOT: androidSdk,
  Path: `${path.join(javaHome, 'bin')};${process.env.Path || ''}`,
};

// 3. Sincronizar assets web a Android y fuera de OneDrive
const distDir = path.join(rootDir, 'dist');
const androidAssetsPublic = path.join(androidDir, 'app', 'src', 'main', 'assets', 'public');
if (fs.existsSync(distDir)) {
  if (!fs.existsSync(androidAssetsPublic)) {
    fs.mkdirSync(androidAssetsPublic, { recursive: true });
  }
  fs.cpSync(distDir, androidAssetsPublic, { recursive: true });
  console.log('⚡ Web dist sincronizado en assets de Android.');
}

const externalAssetsDir = 'C:\\Users\\dace8\\.gradle_builds\\Pasos\\assets';
try {
  if (fs.existsSync(externalAssetsDir)) {
    fs.rmSync(externalAssetsDir, { recursive: true, force: true });
  }
  fs.mkdirSync(externalAssetsDir, { recursive: true });
  if (fs.existsSync(path.join(androidDir, 'app', 'src', 'main', 'assets'))) {
    fs.cpSync(path.join(androidDir, 'app', 'src', 'main', 'assets'), externalAssetsDir, { recursive: true });
    console.log('⚡ Assets sincronizados en almacenamiento local fuera de OneDrive:', externalAssetsDir);
  }
} catch (e) {
  console.warn('⚠️ Advertencia al copiar assets:', e.message);
}

const releaseDir = path.join(androidDir, 'app', 'release');
if (!fs.existsSync(releaseDir)) {
  fs.mkdirSync(releaseDir, { recursive: true });
}

const possibleSigners = [
  path.join(androidSdk, 'build-tools', '34.0.0', 'apksigner.bat'),
  path.join(androidSdk, 'build-tools', '35.0.0', 'apksigner.bat'),
];
const sdkBuildTools = possibleSigners.find((p) => fs.existsSync(p)) || possibleSigners[0];
const keystore = path.join(process.env.USERPROFILE, '.android', 'debug.keystore');

function getUnsignedApk() {
  const possibleUnsigned = [
    'C:\\Users\\dace8\\.gradle_builds\\Pasos\\app\\outputs\\apk\\release\\app-release-unsigned.apk',
    path.join(androidDir, 'app', 'build', 'outputs', 'apk', 'release', 'app-release-unsigned.apk'),
    path.join(androidDir, 'app', 'build', 'outputs', 'apk', 'release', 'app-unsigned.apk'),
  ];
  return possibleUnsigned.find((p) => fs.existsSync(p));
}

function cleanGradleBuildArtifacts() {
  const possibleUnsigned = [
    'C:\\Users\\dace8\\.gradle_builds\\Pasos\\app\\outputs\\apk\\release\\app-release-unsigned.apk',
    path.join(androidDir, 'app', 'build', 'outputs', 'apk', 'release', 'app-release-unsigned.apk'),
  ];
  for (const apkPath of possibleUnsigned) {
    if (fs.existsSync(apkPath)) {
      try {
        fs.unlinkSync(apkPath);
      } catch (err) {}
    }
  }
}

const results = [];

// =========================================================================
// BLOQUE A: COMPILAR VERSIÓN ESTÁNDAR
// =========================================================================
if (modeArg === 'dual' || modeArg === 'standard') {
  console.log('\n------------------------------------------------------------');
  console.log('🎨 COMPILANDO APK CON ICONO ESTÁNDAR (Squircle)');
  console.log('------------------------------------------------------------');

  cleanGradleBuildArtifacts();

  execSync(`"${psExe}" -ExecutionPolicy Bypass -File .\\scripts\\generate-standard-icons.ps1`, {
    cwd: rootDir,
    env,
    stdio: 'inherit',
  });

  console.log('⚡ Ejecutando gradlew assembleRelease...');
  execSync('.\\gradlew.bat assembleRelease --no-daemon', {
    cwd: androidDir,
    env,
    stdio: 'inherit',
  });

  const unsignedStandard = getUnsignedApk();
  if (!unsignedStandard) {
    console.error('❌ No se encontró app-release-unsigned.apk para versión estándar.');
    process.exit(1);
  }

  const targetStandardApk = path.join(releaseDir, `pasos-v${version}-standard-release.apk`);
  console.log('🔑 Firmando APK Estándar con apksigner...');
  const signCmdStandard = `"${sdkBuildTools}" sign --ks "${keystore}" --ks-pass pass:android --key-pass pass:android --ks-key-alias androiddebugkey --out "${targetStandardApk}" "${unsignedStandard}"`;
  execSync(signCmdStandard, { env, stdio: 'inherit' });

  const rootStandardApk = path.join(rootDir, `pasos-v${version}-standard-release.apk`);
  fs.copyFileSync(targetStandardApk, rootStandardApk);

  const statsStandard = fs.statSync(targetStandardApk);
  const sizeMb = (statsStandard.size / (1024 * 1024)).toFixed(2);
  results.push({
    name: 'Estándar (Squircle)',
    file: path.basename(targetStandardApk),
    rootPath: rootStandardApk,
    size: sizeMb,
  });
}

// =========================================================================
// BLOQUE B: COMPILAR VERSIÓN VERTICONS (Tarjeta 2:3 estilo CronoCash)
// =========================================================================
if (modeArg === 'dual' || modeArg === 'verticons') {
  console.log('\n------------------------------------------------------------');
  console.log('💎 COMPILANDO APK CON ICONO VERTICONS (Card 2:3)');
  console.log('------------------------------------------------------------');

  cleanGradleBuildArtifacts();

  execSync(`"${psExe}" -ExecutionPolicy Bypass -File .\\scripts\\generate-verticon-icons.ps1`, {
    cwd: rootDir,
    env,
    stdio: 'inherit',
  });

  console.log('⚡ Ejecutando gradlew assembleRelease para Verticons...');
  execSync('.\\gradlew.bat assembleRelease --no-daemon', {
    cwd: androidDir,
    env,
    stdio: 'inherit',
  });

  const unsignedVerticon = getUnsignedApk();
  if (!unsignedVerticon) {
    console.error('❌ No se encontró app-release-unsigned.apk para versión Verticons.');
    process.exit(1);
  }

  const targetVerticonApk = path.join(releaseDir, `pasos-v${version}-verticons-release.apk`);
  const targetVerticonShort = path.join(releaseDir, `pasos-v${version}-verticon-release.apk`);
  const defaultVersionedApk = path.join(releaseDir, `pasos-v${version}-release.apk`);
  const defaultReleaseApk = path.join(releaseDir, 'pasos-release.apk');

  console.log('🔑 Firmando APK Verticons con apksigner...');
  const signCmdVerticon = `"${sdkBuildTools}" sign --ks "${keystore}" --ks-pass pass:android --key-pass pass:android --ks-key-alias androiddebugkey --out "${targetVerticonApk}" "${unsignedVerticon}"`;
  execSync(signCmdVerticon, { env, stdio: 'inherit' });

  // Copias adicionales canónicas y versionadas
  fs.copyFileSync(targetVerticonApk, targetVerticonShort);
  fs.copyFileSync(targetVerticonApk, defaultVersionedApk);
  fs.copyFileSync(targetVerticonApk, defaultReleaseApk);

  const rootVerticonApk = path.join(rootDir, `pasos-v${version}-verticons-release.apk`);
  const rootReleaseApk = path.join(rootDir, 'pasos-release.apk');
  const rootVersionedApk = path.join(rootDir, `pasos-v${version}-release.apk`);

  fs.copyFileSync(targetVerticonApk, rootVerticonApk);
  fs.copyFileSync(targetVerticonApk, rootReleaseApk);
  fs.copyFileSync(targetVerticonApk, rootVersionedApk);

  const statsVerticon = fs.statSync(targetVerticonApk);
  const sizeMb = (statsVerticon.size / (1024 * 1024)).toFixed(2);
  results.push({
    name: 'Verticons (Card 2:3)',
    file: path.basename(targetVerticonApk),
    rootPath: rootVerticonApk,
    size: sizeMb,
  });
}

// Mantener los iconos Verticons activos en el proyecto por defecto
execSync(`"${psExe}" -ExecutionPolicy Bypass -File .\\scripts\\generate-verticon-icons.ps1`, {
  cwd: rootDir,
  env,
  stdio: 'inherit',
});

console.log('\n============================================================');
console.log('🎉 ¡COMPILACIÓN Y FIRMA DE APKs COMPLETADA CON ÉXITO!');
console.log('============================================================');
results.forEach((r, idx) => {
  console.log(`${idx + 1}. 📦 Versión ${r.name}:`);
  console.log(`   - Archivo: ${r.file} (${r.size} MB)`);
  console.log(`   - Acceso Directo: ${r.rootPath}`);
});
console.log(`\n🔑 Keystore: debug.keystore (firmado con apksigner Android)`);
console.log(`📱 Versión SemVer: v${version} (versionCode: ${versionCode})`);
console.log('============================================================\n');
