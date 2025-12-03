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

interface ToolInfo {
  name: string;
  filePath: string;
}

interface CollectionCount {
  name: string;
  count: number;
  tools: ToolInfo[];
}

/**
 * Extract the tool name from a file's content.
 * Looks for CreateUmbracoTool("tool-name", ...) or CreateUmbracoResource("tool-name", ...)
 */
function extractToolName(content: string, filePath: string): string | null {
  // Match CreateUmbracoTool("name", ...) or CreateUmbracoResource("name", ...)
  const toolMatch = content.match(/CreateUmbracoTool\(\s*["']([^"']+)["']/);
  if (toolMatch) {
    return toolMatch[1];
  }

  const resourceMatch = content.match(/CreateUmbracoResource\(\s*["']([^"']+)["']/);
  if (resourceMatch) {
    return resourceMatch[1];
  }

  // Fallback to filename without extension
  return path.basename(filePath, '.ts');
}

/**
 * Count tools in each collection directory.
 */
function countTools(toolsDirPath: string): { collections: CollectionCount[]; total: number; allTools: ToolInfo[] } {
  const toolsDir = path.resolve(toolsDirPath);
  let total = 0;
  const collections: CollectionCount[] = [];
  const allTools: ToolInfo[] = [];

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
    const tools: ToolInfo[] = [];
    for (const tsFile of tsFiles) {
      const content = fs.readFileSync(tsFile, 'utf-8');
      if (content.includes('CreateUmbracoTool') || content.includes('CreateUmbracoResource')) {
        const toolName = extractToolName(content, tsFile);
        if (toolName) {
          const relativePath = path.relative(toolsDir, tsFile);
          tools.push({ name: toolName, filePath: relativePath });
        }
      }
    }

    // Sort tools alphabetically by name
    tools.sort((a, b) => a.name.localeCompare(b.name));

    collections.push({ name: dirName, count: tools.length, tools });
    allTools.push(...tools);
    total += tools.length;
  }

  return { collections, total, allTools };
}

/**
 * Format results as console output.
 */
function formatConsoleOutput(collections: CollectionCount[], total: number, showTools: boolean = false): string {
  const lines: string[] = [];
  lines.push('MCP Tools by Collection:');
  lines.push('='.repeat(60));

  for (const { name, count, tools } of collections) {
    const padding = '.'.repeat(Math.max(1, 50 - name.length));
    lines.push(`${name}${padding}${count.toString().padStart(4)}`);

    if (showTools && tools.length > 0) {
      for (const tool of tools) {
        lines.push(`    - ${tool.name}`);
      }
    }
  }

  lines.push('='.repeat(60));
  const padding = '.'.repeat(Math.max(1, 50 - 'Total tools'.length));
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
  lines.push('## Summary');
  lines.push('');
  lines.push('| Collection | Tool Count |');
  lines.push('|------------|------------|');

  for (const { name, count } of collections) {
    lines.push(`| ${name} | ${count} |`);
  }

  lines.push('');
  lines.push(`**Total MCP Tools**: ${total}`);
  lines.push('');

  // Add detailed tool listing by collection
  lines.push('## Tools by Collection');
  lines.push('');

  for (const { name, count, tools } of collections) {
    if (count > 0) {
      lines.push(`### ${name} (${count})`);
      lines.push('');
      for (const tool of tools) {
        lines.push(`- \`${tool.name}\``);
      }
      lines.push('');
    }
  }

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
  const showTools = process.env.SHOW_TOOLS === 'true';

  const { collections, total } = countTools(toolsDir);

  // Print to console
  const consoleOutput = formatConsoleOutput(collections, total, showTools);
  console.log(consoleOutput);

  // Save to markdown file if OUTPUT_FILE is specified (always includes tools)
  if (outputFile) {
    const markdownOutput = formatMarkdownOutput(collections, total);
    saveToFile(markdownOutput, outputFile);
  }
}

main().catch(error => {
  console.error('Error:', error);
  process.exit(1);
});
