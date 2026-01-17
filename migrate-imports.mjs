#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Track issues
const issues = [];

// Helper imports that should come from toolkit (main package)
const toolkitHelperImports = new Set([
  'withStandardDecorators',
  'withErrorHandling',
  'withPreExecutionCheck',
  'executeGetApiCall',
  'executeVoidApiCall',
  'executeGetItemsApiCall',
  'executeVoidApiCallWithOptions',
  'CAPTURE_RAW_HTTP_RESPONSE',
  'createToolResult',
  'createToolResultError',
  'ToolValidationError',
  'createToolAnnotations',
  'processVoidResponse',
  'UmbracoApiError',
  'ToolDefinition',
  // Constants from main package
  'BLANK_UUID',
  'TRANSLATORS_USER_GROUP_ID',
  'WRITERS_USER_GROUP_ID',
  'Default_Memeber_TYPE_ID',
  'TextString_DATA_TYPE_ID',
  'MEDIA_PICKER_DATA_TYPE_ID',
  'MEMBER_PICKER_DATA_TYPE_ID',
  'TAG_DATA_TYPE_ID',
  'FOLDER_MEDIA_TYPE_ID',
  'IMAGE_MEDIA_TYPE_ID',
  'FILE_MEDIA_TYPE_ID',
  'VIDEO_MEDIA_TYPE_ID',
  'AUDIO_MEDIA_TYPE_ID',
  'ARTICLE_MEDIA_TYPE_ID',
  'VECTOR_GRAPHICS_MEDIA_TYPE_ID',
  'MEDIA_TYPE_FOLDER',
  'MEDIA_TYPE_IMAGE',
  'MEDIA_TYPE_FILE',
  'MEDIA_TYPE_VIDEO',
  'MEDIA_TYPE_AUDIO',
  'MEDIA_TYPE_ARTICLE',
  'MEDIA_TYPE_VECTOR_GRAPHICS',
  'STANDARD_MEDIA_TYPES',
]);

// Testing imports that should come from toolkit/testing
const toolkitTestingImports = new Set([
  'createSnapshotResult',
  'setupTestEnvironment',
  'createMockRequestHandlerExtra',
  'validateToolResponse',
  'getResultText',
  'getStructuredContent',
  'validateStructuredContent',
  'validateErrorResult',
  'normalizeErrorResponse',
  'normalizeObject',
  'problemDetailsSchema',
  'setupMswServer',
]);

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf-8');
  const originalContent = content;

  // Skip files that already have toolkit imports
  if (content.includes('from "@umbraco-cms/mcp-toolkit"') ||
      content.includes('from "@umbraco-cms/mcp-toolkit/testing"')) {
    return false;
  }

  // Skip the test helper source files themselves (they define, not use)
  const fileName = path.basename(filePath);
  if (fileName === 'setup-test-environment.ts' ||
      fileName === 'create-snapshot-result.ts' ||
      fileName === 'create-mock-request-handler-extra.ts') {
    return false;
  }

  // Track what needs to be imported from toolkit
  const toolkitImportsNeeded = new Set();
  const toolkitTestingImportsNeeded = new Set();

  // Regex to match imports - handles both single line and multiline
  const importRegex = /import\s*\{([^}]+)\}\s*from\s*["']([^"']+)["'];?\n?/g;

  // Track imports to modify/remove
  const importChanges = [];

  let match;
  while ((match = importRegex.exec(content)) !== null) {
    const imports = match[1];
    const importPath = match[2];
    const fullMatch = match[0];
    const matchStart = match.index;
    const matchEnd = match.index + fullMatch.length;

    // Check if this is an import we need to migrate
    const isMcpHelper = importPath.startsWith('@/helpers/mcp/');
    const isToolDefinition = importPath === 'types/tool-definition.js';
    const isTestHelper = importPath.startsWith('@/test-helpers/');
    const isConstants = importPath === '@/constants/constants.js' ||
                        importPath.endsWith('/constants/constants.js') ||
                        importPath.match(/\.\.\/.*constants\/constants\.js$/);

    if (isMcpHelper || isToolDefinition || isTestHelper || isConstants) {
      const importList = imports.split(',').map(i => i.trim()).filter(i => i);
      const toMigrate = [];
      const toKeep = [];

      for (const imp of importList) {
        const cleanImp = imp.replace(/^type\s+/, '');

        if (isTestHelper) {
          if (toolkitTestingImports.has(cleanImp)) {
            toolkitTestingImportsNeeded.add(cleanImp);
            toMigrate.push(imp);
          } else {
            toKeep.push(imp);
          }
        } else if (isConstants) {
          if (toolkitHelperImports.has(cleanImp)) {
            toolkitImportsNeeded.add(cleanImp);
            toMigrate.push(imp);
          } else {
            toKeep.push(imp);
          }
        } else if (isMcpHelper || isToolDefinition) {
          if (toolkitHelperImports.has(cleanImp)) {
            if (cleanImp === 'ToolDefinition') {
              toolkitImportsNeeded.add('type ToolDefinition');
            } else {
              toolkitImportsNeeded.add(cleanImp);
            }
            toMigrate.push(imp);
          } else {
            toKeep.push(imp);
          }
        }
      }

      if (toMigrate.length > 0) {
        importChanges.push({
          start: matchStart,
          end: matchEnd,
          keep: toKeep,
          importPath: importPath,
        });
      }
    }
  }

  // If nothing to change, return
  if (importChanges.length === 0) {
    return false;
  }

  // Apply changes in reverse order
  importChanges.sort((a, b) => b.start - a.start);
  for (const change of importChanges) {
    if (change.keep.length === 0) {
      // Remove the entire import
      content = content.slice(0, change.start) + content.slice(change.end);
    } else {
      // Rebuild the import with only the kept items
      const newImport = `import { ${change.keep.join(', ')} } from "${change.importPath}";\n`;
      content = content.slice(0, change.start) + newImport + content.slice(change.end);
    }
  }

  // Build the new import statements
  const newImports = [];

  if (toolkitImportsNeeded.size > 0) {
    const sortedImports = Array.from(toolkitImportsNeeded).sort((a, b) => {
      const aIsType = a.startsWith('type ');
      const bIsType = b.startsWith('type ');
      if (aIsType && !bIsType) return -1;
      if (!aIsType && bIsType) return 1;
      return a.localeCompare(b);
    });
    newImports.push(`import {\n  ${sortedImports.join(',\n  ')},\n} from "@umbraco-cms/mcp-toolkit";`);
  }

  if (toolkitTestingImportsNeeded.size > 0) {
    const sortedImports = Array.from(toolkitTestingImportsNeeded).sort();
    newImports.push(`import {\n  ${sortedImports.join(',\n  ')},\n} from "@umbraco-cms/mcp-toolkit/testing";`);
  }

  if (newImports.length === 0) {
    return false;
  }

  // Find the end of the last import
  let newLastImportEnd = 0;
  const newImportRegex = /import\s*(?:\{[^}]+\}|[^;]+)\s*from\s*["'][^"']+["'];?\n?/g;
  let newMatch;
  while ((newMatch = newImportRegex.exec(content)) !== null) {
    newLastImportEnd = newMatch.index + newMatch[0].length;
  }

  // Insert new imports after the last remaining import
  if (newLastImportEnd > 0) {
    content = content.slice(0, newLastImportEnd) + newImports.join('\n') + '\n' + content.slice(newLastImportEnd);
  } else {
    // No imports left, add at beginning
    content = newImports.join('\n') + '\n\n' + content;
  }

  // Clean up multiple blank lines
  content = content.replace(/\n{3,}/g, '\n\n');

  // Only write if content changed
  if (content !== originalContent) {
    fs.writeFileSync(filePath, content);
    return true;
  }
  return false;
}

function findFiles(dir, pattern) {
  const files = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory() && !entry.name.startsWith('.') && entry.name !== 'node_modules') {
      files.push(...findFiles(fullPath, pattern));
    } else if (entry.isFile() && pattern.test(entry.name)) {
      files.push(fullPath);
    }
  }

  return files;
}

// Main
const srcDir = path.join(__dirname, 'src');
const files = findFiles(srcDir, /\.ts$/);

console.log(`Found ${files.length} TypeScript files`);

let updated = 0;
for (const file of files) {
  try {
    if (processFile(file)) {
      updated++;
      console.log(`Updated: ${path.relative(__dirname, file)}`);
    }
  } catch (err) {
    console.error(`Error processing ${file}: ${err.message}`);
    issues.push(`${file}: ${err.message}`);
  }
}

console.log(`\nUpdated ${updated} files`);

if (issues.length > 0) {
  fs.writeFileSync(path.join(__dirname, 'migration-issues.txt'), issues.join('\n'));
  console.log(`\nWrote ${issues.length} issues to migration-issues.txt`);
}
