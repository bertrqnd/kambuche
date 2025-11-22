#!/usr/bin/env node

/**
 * Script de minification CSS/JS
 * Usage: node minify.js
 *
 * Minifie tous les fichiers CSS et JS du dossier public/
 * Crée des versions .min.css et .min.js
 */

const fs = require('fs');
const path = require('path');

// === MINIFICATION CSS (simple mais efficace) ===
function minifyCSS(css) {
  return css
    // Supprimer les commentaires
    .replace(/\/\*[\s\S]*?\*\//g, '')
    // Supprimer les espaces inutiles
    .replace(/\s+/g, ' ')
    // Supprimer espaces autour de { } : ; ,
    .replace(/\s*{\s*/g, '{')
    .replace(/\s*}\s*/g, '}')
    .replace(/\s*:\s*/g, ':')
    .replace(/\s*;\s*/g, ';')
    .replace(/\s*,\s*/g, ',')
    // Supprimer le dernier ; avant }
    .replace(/;}/g, '}')
    .trim();
}

// === MINIFICATION JS (simple) ===
function minifyJS(js) {
  return js
    // Supprimer les commentaires //
    .replace(/\/\/.*$/gm, '')
    // Supprimer les commentaires /* */
    .replace(/\/\*[\s\S]*?\*\//g, '')
    // Supprimer espaces multiples
    .replace(/\s+/g, ' ')
    // Supprimer espaces autour des opérateurs (prudent)
    .replace(/\s*([{}();,=+\-*/<>!&|])\s*/g, '$1')
    .trim();
}

// === TRAITER UN DOSSIER ===
function processDirectory(dir) {
  const files = fs.readdirSync(dir);

  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      processDirectory(filePath); // Récursif
    } else if (file.endsWith('.css') && !file.endsWith('.min.css')) {
      // Minifier CSS
      const content = fs.readFileSync(filePath, 'utf8');
      const minified = minifyCSS(content);
      const minPath = filePath.replace('.css', '.min.css');
      fs.writeFileSync(minPath, minified, 'utf8');

      const originalSize = (content.length / 1024).toFixed(2);
      const minifiedSize = (minified.length / 1024).toFixed(2);
      const savings = (((content.length - minified.length) / content.length) * 100).toFixed(1);

      console.log(`✅ ${file} → ${path.basename(minPath)}`);
      console.log(`   ${originalSize} KB → ${minifiedSize} KB (${savings}% réduit)\n`);
    } else if (file.endsWith('.js') && !file.endsWith('.min.js') && file !== 'minify.js') {
      // Minifier JS
      const content = fs.readFileSync(filePath, 'utf8');
      const minified = minifyJS(content);
      const minPath = filePath.replace('.js', '.min.js');
      fs.writeFileSync(minPath, minified, 'utf8');

      const originalSize = (content.length / 1024).toFixed(2);
      const minifiedSize = (minified.length / 1024).toFixed(2);
      const savings = (((content.length - minified.length) / content.length) * 100).toFixed(1);

      console.log(`✅ ${file} → ${path.basename(minPath)}`);
      console.log(`   ${originalSize} KB → ${minifiedSize} KB (${savings}% réduit)\n`);
    }
  });
}

// === EXÉCUTION ===
console.log('🚀 Minification CSS/JS en cours...\n');

const publicDir = path.join(__dirname, 'public');
processDirectory(publicDir);

console.log('✨ Minification terminée !');
console.log('\n💡 Pour utiliser les fichiers minifiés :');
console.log('   Remplacez /css/style.css par /css/style.min.css dans vos templates');
console.log('   Remplacez /js/carousel.js par /js/carousel.min.js dans vos templates\n');
