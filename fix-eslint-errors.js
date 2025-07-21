#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

// Function to fix common ESLint errors
function fixFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let changed = false;

  // Fix empty interfaces
  content = content.replace(/interface\s+(\w+)\s*\{\s*\/\/[^\}]*\}/g, (match, interfaceName) => {
    changed = true;
    return `type ${interfaceName} = Record<string, never>;`;
  });

  // Fix missing curly braces around if statements
  content = content.replace(/if\s*\([^)]+\)\s*([^{][^;]*;)/g, (match, statement) => {
    changed = true;
    return match.replace(statement, `{ ${statement.trim()} }`);
  });

  // Fix type imports
  content = content.replace(/import\s*\{\s*([^}]+)\s*\}\s*from\s*(['"][^'"]+['"])/g, (match, imports, from) => {
    // Check if all imports are types (this is a simple heuristic)
    const importList = imports.split(',').map(i => i.trim());
    const typeOnlyImports = importList.filter(imp => 
      imp.includes('Props') || 
      imp.includes('Type') || 
      imp.includes('Interface') ||
      imp.match(/^[A-Z][a-zA-Z]*$/) // PascalCase (likely types)
    );
    
    if (typeOnlyImports.length === importList.length && importList.length > 0) {
      changed = true;
      return `import type { ${imports} } from ${from}`;
    }
    return match;
  });

  if (changed) {
    fs.writeFileSync(filePath, content);
    console.log(`Fixed: ${filePath}`);
  }
}

// Get all TypeScript files
function getAllTsFiles(dir) {
  const files = [];
  const items = fs.readdirSync(dir);
  
  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
      files.push(...getAllTsFiles(fullPath));
    } else if (item.endsWith('.ts') || item.endsWith('.tsx')) {
      files.push(fullPath);
    }
  }
  
  return files;
}

// Main execution
const srcFiles = getAllTsFiles('./src');
srcFiles.forEach(fixFile);

console.log('Fixed common ESLint errors. Running ESLint with --fix...');

try {
  execSync('npm run lint -- --fix', { stdio: 'inherit' });
} catch (error) {
  console.log('Some errors remain that need manual fixing.');
}