import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs';
import { join } from 'path';

// Función para encontrar archivos recursivamente
function findFiles(dir, pattern, fileList = []) {
  const files = readdirSync(dir);

  files.forEach(file => {
    const filePath = join(dir, file);
    const stat = statSync(filePath);

    if (stat.isDirectory()) {
      findFiles(filePath, pattern, fileList);
    } else if (file.endsWith(pattern)) {
      fileList.push(filePath);
    }
  });

  return fileList;
}

// Encontrar todos los archivos .tsx en la carpeta app
const files = findFiles('app', '.tsx');

let totalChanges = 0;

files.forEach(file => {
  let content = readFileSync(file, 'utf-8');
  let originalContent = content;

  // Remover imports duplicados de useNotFound
  const lines = content.split('\n');
  const seenImports = new Set();
  const cleanedLines = [];

  lines.forEach(line => {
    if (line.includes('import { useNotFound }')) {
      if (!seenImports.has('useNotFound')) {
        seenImports.add('useNotFound');
        cleanedLines.push(line);
      }
    } else {
      cleanedLines.push(line);
    }
  });

  content = cleanedLines.join('\n');

  // Remover declaraciones duplicadas de const notFound
  const notFoundPattern = /const notFound = useNotFound\(\);/g;
  const matches = [...content.matchAll(notFoundPattern)];

  if (matches.length > 1) {
    // Mantener solo la primera ocurrencia
    let count = 0;
    content = content.replace(notFoundPattern, () => {
      count++;
      return count === 1 ? 'const notFound = useNotFound();' : '';
    });

    // Limpiar líneas vacías múltiples
    content = content.replace(/\n\n\n+/g, '\n\n');
  }

  if (content !== originalContent) {
    writeFileSync(file, content, 'utf-8');
    totalChanges++;
  }
});