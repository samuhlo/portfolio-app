import fs from 'fs';
import path from 'path';

// Recursivamente encuentra todos los .vue en app/
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

const files = findVueFiles(path.join(process.cwd(), 'app'));

files.forEach((file) => {
  let content = fs.readFileSync(file, 'utf-8');

  // Match template, script, style
  const templateRegex = /(<template>[\s\S]*?<\/template>)/m;
  const scriptRegex = /(<script.*?>[\s\S]*?<\/script>)/m;
  const styleRegex = /(<style.*?>[\s\S]*?<\/style>)/m;

  const tMatch = content.match(templateRegex);
  const scMatch = content.match(scriptRegex);
  const stMatch = content.match(styleRegex);

  const tContent = tMatch ? tMatch[0] : '';
  const scContent = scMatch ? scMatch[0] : '';
  const stContent = stMatch ? stMatch[0] : '';

  if (!tContent && !scContent && !stContent) return; // Empty or unparseable

  // Check if they exist
  let newContentPairs = [];
  if (scContent) newContentPairs.push(scContent);
  if (tContent) newContentPairs.push(tContent);
  if (stContent) newContentPairs.push(stContent);

  // We want to combine them with standard empty lines instead of arbitrary spacing
  let finalContent = newContentPairs.join('\n\n') + '\n';

  if (content !== finalContent) {
    fs.writeFileSync(file, finalContent, 'utf-8');
    console.log(`Formatted: ${file}`);
  }
});
console.log('Finished formatting Vue files.');
