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

// Copiar mipmap folders
const mipmaps = ['mipmap-mdpi', 'mipmap-hdpi', 'mipmap-xhdpi', 'mipmap-xxhdpi', 'mipmap-xxxhdpi'];
for (const mm of mipmaps) {
  const srcMm = path.join(sourceResDir, mm);
  const destMm = path.join(androidRes, mm);
  if (fs.existsSync(srcMm)) {
    fs.cpSync(srcMm, destMm, { recursive: true });
    console.log(`  ✓ ${mm} actualizado`);
  }
}

// Copiar icono web/pwa principal
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
