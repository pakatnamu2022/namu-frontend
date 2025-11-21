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
  let changed = false;

  // Verificar si el archivo usa notFound
  if (!content.includes('notFound')) {
    return;
  }

  // Reemplazar import de notFound
  const oldImportPattern1 = /import\s+{\s*notFound\s*}\s+from\s+["']next\/navigation["'];?\s*\n/g;
  const oldImportPattern2 = /import\s+{\s*notFound,\s*/g;
  const oldImportPattern3 = /,\s*notFound\s*}/g;

  // Caso 1: Solo notFound
  if (content.match(oldImportPattern1)) {
    content = content.replace(oldImportPattern1, '');
    changed = true;
  }

  // Caso 2: notFound con otros imports (notFound, useRouter)
  if (content.match(oldImportPattern2)) {
    content = content.replace(oldImportPattern2, 'import { ');
    changed = true;
  }

  // Caso 3: otros imports seguidos de notFound (useRouter, notFound)
  if (content.match(oldImportPattern3)) {
    content = content.replace(oldImportPattern3, ' }');
    changed = true;
  }

  // Si todavía queda alguna referencia a notFound después de limpiar imports
  if (content.includes('notFound')) {
    // Agregar el import del hook personalizado
    const importStatement = 'import { useNotFound } from "@/shared/hooks/useNotFound";\n';

    // Buscar la última línea de imports
    const lines = content.split('\n');
    let lastImportIndex = -1;

    for (let i = 0; i < lines.length; i++) {
      if (lines[i].trim().startsWith('import ')) {
        lastImportIndex = i;
      }
    }

    // Insertar el nuevo import después del último import
    if (lastImportIndex !== -1) {
      lines.splice(lastImportIndex + 1, 0, importStatement);
      content = lines.join('\n');
      changed = true;
    }

    // Agregar const notFound = useNotFound(); después de otros hooks
    // Buscar el patrón de componente function
    const functionPattern = /export default function \w+\([^)]*\)\s*{\s*\n/;
    const match = content.match(functionPattern);

    if (match) {
      // Buscar la posición después de la declaración de función
      const funcStartIndex = content.indexOf(match[0]) + match[0].length;

      // Buscar si ya hay otros hooks (const ... = use...)
      const beforeFunc = content.substring(0, funcStartIndex);
      const afterFunc = content.substring(funcStartIndex);
      const afterFuncLines = afterFunc.split('\n');

      // Encontrar la última línea que contiene un hook
      let insertIndex = 0;
      for (let i = 0; i < afterFuncLines.length; i++) {
        if (afterFuncLines[i].trim().match(/const\s+\w+\s*=\s*use\w+/)) {
          insertIndex = i + 1;
        } else if (afterFuncLines[i].trim() && !afterFuncLines[i].trim().startsWith('//')) {
          // Si encontramos una línea no vacía que no es un hook, detener
          break;
        }
      }

      // Insertar el hook
      afterFuncLines.splice(insertIndex, 0, '  const notFound = useNotFound();');
      content = beforeFunc + afterFuncLines.join('\n');
      changed = true;
    }
  }

  if (changed) {
    writeFileSync(file, content, 'utf-8');
    totalChanges++;
  }
});

