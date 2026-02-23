import fs from 'fs';
import path from 'path';

const findVueFiles = (dir) => {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach((file) => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(findVueFiles(file));
    } else if (file.endsWith('.vue')) {
      results.push(file);
    }
  });
  return results;
};

const getComponentType = (filePath) => {
  if (filePath.includes('/pages/')) return 'PAGE';
  if (filePath.includes('/layouts/')) return 'LAYOUT';
  if (filePath.includes('/components/ui/')) return 'UI_ATOM';
  if (filePath.includes('/components/layout/')) return 'LAYOUT';
  if (filePath.includes('/components/playground/')) return 'UI_MOLECULE';
  if (filePath.includes('/components/sections/')) return 'FEATURE';
  return 'COMPONENT';
};

const files = findVueFiles(path.join(process.cwd(), 'app'));

files.forEach((file) => {
  let content = fs.readFileSync(file, 'utf-8');
  const basename = path.basename(file, '.vue');
  const type = getComponentType(file);
  const nameUpper = basename
    .replace(/([A-Z])/g, ' $1')
    .trim()
    .toUpperCase();

  // Check if it already has a Dog Tag
  if (!content.includes('* █ [')) {
    // Generate default dog tag
    const dogTag = `/**
 * █ [${type}] :: ${nameUpper}
 * =====================================================================
 * DESC:   [TODO] Añadir descripción telegráfica del propósito.
 * STATUS: STABLE
 * =====================================================================
 */\n`;

    // Insert right after <script setup lang="ts">
    const scriptTagMatch = content.match(/<script[^>]*>/);
    if (scriptTagMatch) {
      const splitIdx = scriptTagMatch.index + scriptTagMatch[0].length;
      content =
        content.slice(0, splitIdx) + '\n' + dogTag + content.slice(splitIdx).replace(/^\n+/, '');
      fs.writeFileSync(file, content, 'utf-8');
      console.log(`Added Dog Tag: ${file}`);
    }
  }
});
console.log('Finished checking Dog Tags.');
