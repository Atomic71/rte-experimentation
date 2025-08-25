import { readFileSync, writeFileSync } from 'fs';
const html = readFileSync('dist/index.html', 'utf8');
// basic escape for backticks
const safe = html.replace(/`/g, '\\`');
writeFileSync('dist/html.js', `export const EDITOR_HTML = \`${safe}\`;\n`);
