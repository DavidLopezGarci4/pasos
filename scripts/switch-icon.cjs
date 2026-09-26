const fs = require('fs');
const path = require('path');

const mode = (process.argv[2] || 'normal').toLowerCase();
const rootDir = path.resolve(__dirname, '..');
const androidRes = path.join(rootDir, 'android', 'app', 'src', 'main', 'res');
const publicDir = path.join(rootDir, 'public');

console.log(`\n🎨 Cambiando icono activo de Pasos a: ${mode.toUpperCase()}...\n`);

const sourceResDir = mode === 'verticons'
  ? path.join(rootDir, 'android', 'app', 'src', 'main', 'res-verticons')
  : path.join(rootDir, 'android', 'app', 'src', 'main', 'res-normal');

if (!fs.existsSync(sourceResDir)) {
  console.error(`❌ No existe el directorio de recursos fuente: ${sourceResDir}`);
  process.exit(1);
}

// 1. Copiar mipmap folders
const mipmaps = ['mipmap-mdpi', 'mipmap-hdpi', 'mipmap-xhdpi', 'mipmap-xxhdpi', 'mipmap-xxxhdpi'];
for (const mm of mipmaps) {
  const srcMm = path.join(sourceResDir, mm);
  const destMm = path.join(androidRes, mm);
  if (fs.existsSync(srcMm)) {
    fs.cpSync(srcMm, destMm, { recursive: true });
    console.log(`  ✓ ${mm} actualizado`);
  }
}

// 2. Sincronizar fondo adaptativo según modo
const normalBgXml = `<?xml version="1.0" encoding="utf-8"?>
<shape xmlns:android="http://schemas.android.com/apk/res/android" android:shape="rectangle">
    <gradient
        android:type="linear"
        android:angle="315"
        android:startColor="#4a7359"
        android:centerColor="#335641"
        android:endColor="#1b3024" />
</shape>
`;

const verticonsBgXml = `<?xml version="1.0" encoding="utf-8"?>
<shape xmlns:android="http://schemas.android.com/apk/res/android" android:shape="rectangle">
    <gradient
        android:type="linear"
        android:angle="315"
        android:startColor="#1a3224"
        android:centerColor="#112218"
        android:endColor="#0a150f" />
</shape>
`;

const bgDrawablePath = path.join(androidRes, 'drawable', 'ic_launcher_background.xml');
fs.writeFileSync(bgDrawablePath, mode === 'verticons' ? verticonsBgXml : normalBgXml, 'utf8');
console.log('  ✓ drawable/ic_launcher_background.xml sincronizado');

// 3. Copiar icono web/pwa principal
const srcSvg = mode === 'verticons'
  ? path.join(publicDir, 'icon-verticons.svg')
  : path.join(publicDir, 'icon-normal.svg');

const srcPng = mode === 'verticons'
  ? path.join(publicDir, 'icon-verticons.png')
  : path.join(publicDir, 'icon-normal.png');

if (fs.existsSync(srcSvg)) {
  fs.copyFileSync(srcSvg, path.join(publicDir, 'icon.svg'));
  console.log('  ✓ public/icon.svg sincronizado');
}
if (fs.existsSync(srcPng)) {
  fs.copyFileSync(srcPng, path.join(publicDir, 'icon.png'));
  console.log('  ✓ public/icon.png sincronizado');
}

console.log(`\n✨ Icono activo configurado exitosamente como: [${mode}]\n`);
