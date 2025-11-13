#!/usr/bin/env ts-node
/**
 * Count MCP tools in the Umbraco MCP Server project.
 *
 * This script counts all TypeScript tool files that define actual MCP tools
 * (containing CreateUmbracoTool or CreateUmbracoResource) and provides a
 * breakdown by collection.
 */

import * as fs from 'fs';
import * as path from 'path';
import { glob } from 'glob';

interface CollectionCount {
  name: string;
  count: number;
}

/**
 * Count tools in each collection directory.
 */
function countTools(toolsDirPath: string): { collections: CollectionCount[]; total: number } {
  const toolsDir = path.resolve(toolsDirPath);
  let total = 0;
  const collections: CollectionCount[] = [];

  // Get all subdirectories
  const entries = fs.readdirSync(toolsDir, { withFileTypes: true });
  const directories = entries
    .filter(entry => entry.isDirectory())
    .map(entry => entry.name)
    .sort();

  for (const dirName of directories) {
    const collectionDir = path.join(toolsDir, dirName);

    // Find all TypeScript files in this collection
    const tsFiles = glob.sync('**/*.ts', {
      cwd: collectionDir,
      absolute: true,
      ignore: ['**/index.ts', '**/__tests__/**']
    });

    // Only count files that define actual MCP tools or resources
    let count = 0;
    for (const tsFile of tsFiles) {
      const content = fs.readFileSync(tsFile, 'utf-8');
      if (content.includes('CreateUmbracoTool') || content.includes('CreateUmbracoResource')) {
        count++;
      }
    }

    collections.push({ name: dirName, count });
    total += count;
  }

  return { collections, total };
}

/**
 * Format results as console output.
 */
function formatConsoleOutput(collections: CollectionCount[], total: number): string {
  const lines: string[] = [];
  lines.push('MCP Tools by Collection:');
  lines.push('='.repeat(40));

  for (const { name, count } of collections) {
    const padding = '.'.repeat(Math.max(1, 30 - name.length));
    lines.push(`${name}${padding}${count.toString().padStart(4)}`);
  }

  lines.push('='.repeat(40));
  const padding = '.'.repeat(Math.max(1, 30 - 'Total tools'.length));
  lines.push(`Total tools${padding}${total.toString().padStart(4)}`);

  return lines.join('\n');
}

/**
 * Format results as markdown.
 */
function formatMarkdownOutput(collections: CollectionCount[], total: number): string {
  const lines: string[] = [];
  const now = new Date().toISOString().split('T')[0];

  lines.push('# API Endpoints Analysis');
  lines.push('');
  lines.push(`**Last Updated**: ${now}`);
  lines.push('');
  lines.push('## MCP Tools by Collection');
  lines.push('');
  lines.push('| Collection | Tool Count |');
  lines.push('|------------|------------|');

  for (const { name, count } of collections) {
    lines.push(`| ${name} | ${count} |`);
  }

  lines.push('');
  lines.push(`**Total MCP Tools**: ${total}`);
  lines.push('');
  lines.push('## Notes');
  lines.push('');
  lines.push('- This count includes only files that contain `CreateUmbracoTool` or `CreateUmbracoResource`');
  lines.push('- Excludes `index.ts` files and test files (`__tests__` directories)');
  lines.push('- Helper files, constants, and utilities are not counted');

  return lines.join('\n');
}

/**
 * Save results to markdown file.
 */
function saveToFile(content: string, outputPath: string): void {
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, content, 'utf-8');
  console.log(`\n✅ Analysis saved to: ${outputPath}`);
}

/**
 * Main function
 */
async function main() {
  // Get tools directory from environment or default
  const toolsDir = process.env.TOOLS_DIR || '.';
  const outputFile = process.env.OUTPUT_FILE;

  const { collections, total } = countTools(toolsDir);

  // Print to console
  const consoleOutput = formatConsoleOutput(collections, total);
  console.log(consoleOutput);

  // Save to markdown file if OUTPUT_FILE is specified
  if (outputFile) {
    const markdownOutput = formatMarkdownOutput(collections, total);
    saveToFile(markdownOutput, outputFile);
  }
}

main().catch(error => {
  console.error('Error:', error);
  process.exit(1);
});
