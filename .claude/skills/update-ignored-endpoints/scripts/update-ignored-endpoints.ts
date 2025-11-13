#!/usr/bin/env ts-node
/**
 * Update the IGNORED_ENDPOINTS.md file with current endpoint coverage analysis.
 *
 * This script:
 * 1. Extracts all API endpoint names from the generated Umbraco Management API client
 * 2. Identifies which endpoints have corresponding MCP tools implemented
 * 3. Updates the IGNORED_ENDPOINTS.md file with the current list of unimplemented endpoints
 * 4. Preserves the rationale sections from the existing documentation
 */

import * as fs from 'fs';
import * as path from 'path';
import { glob } from 'glob';

interface ToolToEndpointMap {
  [endpoint: string]: string;
}

interface CategorizedEndpoints {
  [category: string]: string[];
}

/**
 * Extract all API endpoint function names from the generated API client.
 */
function extractApiEndpoints(apiFilePath: string): string[] {
  const content = fs.readFileSync(apiFilePath, 'utf-8');
  const endpoints: string[] = [];

  // Find all Result type exports which correspond to API endpoints
  // Pattern: export type GetXxxResult = ...
  const pattern = /export type ((?:Get|Post|Put|Delete)[A-Z][a-zA-Z0-9]*)Result/g;
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(content)) !== null) {
    // Convert from PascalCase to the actual endpoint name
    // GetUserById -> getUserById
    const endpoint = match[1][0].toLowerCase() + match[1].slice(1);
    endpoints.push(endpoint);
  }

  return Array.from(new Set(endpoints)).sort();
}

/**
 * Map MCP tools to their corresponding API endpoints.
 */
function mapToolsToEndpoints(toolsDir: string): ToolToEndpointMap {
  const mapping: ToolToEndpointMap = {};

  // Find all TypeScript files in the tools directory
  const tsFiles = glob.sync('**/*.ts', {
    cwd: toolsDir,
    absolute: true,
    ignore: ['**/index.ts', '**/__tests__/**']
  });

  for (const tsFile of tsFiles) {
    const content = fs.readFileSync(tsFile, 'utf-8');

    // Look for API client method calls
    // Pattern: client.getXxx or client.postXxx
    const apiCallPattern = /client\.((?:get|post|put|delete)[A-Z][a-zA-Z0-9]*)/g;
    let match: RegExpExecArray | null;

    while ((match = apiCallPattern.exec(content)) !== null) {
      const endpoint = match[1];
      mapping[endpoint] = path.basename(tsFile, '.ts');
    }
  }

  return mapping;
}

/**
 * Categorize ignored endpoints by their API group.
 */
function categorizeIgnoredEndpoints(
  allEndpoints: string[],
  toolToEndpointMap: ToolToEndpointMap
): CategorizedEndpoints {
  const implementedEndpoints = new Set(Object.keys(toolToEndpointMap));
  const ignoredEndpoints = allEndpoints.filter(e => !implementedEndpoints.has(e));

  const categories: CategorizedEndpoints = {};

  for (const endpoint of ignoredEndpoints) {
    // Extract category from endpoint name - check most specific patterns first
    const endpointLower = endpoint.toLowerCase();
    let category: string;

    // Check for specific patterns first (most specific to least specific)
    // Order matters! Check most specific first
    if (endpointLower.includes('recyclebindocument')) {
      category = 'Document';
    } else if (endpointLower.includes('recyclebinmedia')) {
      category = 'Media';
    } else if (endpointLower.includes('publishedcache')) {
      category = 'Published Cache';
    } else if (endpointLower.includes('dynamicroot')) {
      category = 'Dynamic Root';
    } else if (endpointLower.includes('objecttypes')) {
      category = 'Object Types';
    } else if (endpointLower.includes('relationtype')) {
      category = 'Relation Type';
    } else if (endpointLower.includes('modelsbuilder')) {
      category = 'Models Builder';
    } else if (endpointLower.includes('documenttype')) {
      category = 'Document Type';
    } else if (endpointLower.includes('mediatype')) {
      category = 'Media Type';
    } else if (endpointLower.includes('membertype')) {
      category = 'Member Type';
    } else if (endpointLower.includes('membergroup')) {
      category = 'Member Group';
    } else if (endpointLower.includes('datatype')) {
      category = 'Data Type';
    } else if (endpointLower.includes('usergroup')) {
      category = 'User Group';
    } else if (endpointLower.includes('user')) {
      // User-related endpoints (but not UserGroup which was caught above)
      category = 'User';
    } else if (endpointLower.includes('dictionary')) {
      category = 'Dictionary';
    } else if (endpointLower.includes('document')) {
      category = 'Document';
    } else if (endpointLower.includes('media')) {
      category = 'Media';
    } else if (endpointLower.includes('member')) {
      category = 'Member';
    } else if (endpointLower.includes('language')) {
      category = 'Language';
    } else if (endpointLower.includes('package')) {
      category = 'Package';
    } else if (endpointLower.includes('security') || endpointLower.includes('forgotpassword')) {
      category = 'Security';
    } else if (endpointLower.includes('telemetry')) {
      category = 'Telemetry';
    } else if (endpointLower.includes('upgrade')) {
      category = 'Upgrade';
    } else if (endpointLower.includes('install')) {
      category = 'Install';
    } else if (endpointLower.includes('profiling')) {
      category = 'Profiling';
    } else if (endpointLower.includes('preview')) {
      category = 'Preview';
    } else if (endpointLower.includes('oembed')) {
      category = 'Oembed';
    } else if (endpointLower.includes('import') || endpointLower.includes('export')) {
      category = 'Import/Export';
    } else if (endpointLower.includes('segment')) {
      category = 'Segment';
    } else if (endpointLower.includes('help')) {
      category = 'Help';
    } else {
      category = 'Other';
    }

    if (!categories[category]) {
      categories[category] = [];
    }
    categories[category].push(endpoint);
  }

  // Sort endpoints within each category
  for (const category in categories) {
    categories[category].sort();
  }

  return categories;
}

/**
 * Read existing rationale sections from the documentation.
 */
function readExistingRationales(ignoredEndpointsFile: string): string {
  if (!fs.existsSync(ignoredEndpointsFile)) {
    return '';
  }

  const content = fs.readFileSync(ignoredEndpointsFile, 'utf-8');

  // Extract rationale section
  const rationaleMatch = content.match(/## Rationale\n\n([\s\S]*)$/);
  if (rationaleMatch) {
    return rationaleMatch[0];
  }
  return '';
}

/**
 * Convert endpoint name to human-readable description.
 */
function humanizeEndpointName(endpoint: string): string {
  // Remove get/post/put/delete prefix
  let name = endpoint.replace(/^(get|post|put|delete)/, '');

  // Add spaces before capitals
  name = name.replace(/([A-Z])/g, ' $1').trim();

  // Determine operation type
  let operation: string;
  if (endpoint.startsWith('get')) {
    operation = 'Get';
  } else if (endpoint.startsWith('post')) {
    operation = 'Create/Execute';
  } else if (endpoint.startsWith('put')) {
    operation = 'Update';
  } else if (endpoint.startsWith('delete')) {
    operation = 'Delete';
  } else {
    operation = 'Operation';
  }

  return `${operation} ${name.toLowerCase()}`;
}

/**
 * Generate the updated IGNORED_ENDPOINTS.md content.
 */
function generateUpdatedDoc(
  categories: CategorizedEndpoints,
  totalIgnored: number,
  existingRationale: string
): string {
  const lines: string[] = [
    '# Ignored Endpoints',
    '',
    'These endpoints are intentionally not implemented in the MCP server, typically because they:',
    '- Are related to import/export functionality that may not be suitable for MCP operations',
    '- Have security implications',
    '- Are deprecated or have better alternatives',
    '- Are not applicable in the MCP context',
    '',
    '## Ignored by Category',
    ''
  ];

  // Sort categories alphabetically
  const sortedCategories = Object.keys(categories).sort();

  for (const category of sortedCategories) {
    const endpoints = categories[category];
    lines.push(`### ${category} (${endpoints.length} endpoints)`);
    for (const endpoint of endpoints) {
      lines.push(`- \`${endpoint}\` - ${humanizeEndpointName(endpoint)}`);
    }
    lines.push('');
  }

  lines.push(`## Total Ignored: ${totalIgnored} endpoints`);
  lines.push('');

  // Preserve existing rationale if present
  if (existingRationale) {
    lines.push(existingRationale);
  }

  return lines.join('\n');
}

/**
 * Main function
 */
async function main() {
  // Paths
  const projectRoot = process.env.PROJECT_ROOT || '/Users/philw/Projects/umbraco-mcp';
  const apiFile = path.join(projectRoot, 'src/umb-management-api/api/api/umbracoManagementAPI.ts');
  const toolsDir = path.join(projectRoot, 'src/umb-management-api/tools');
  const ignoredEndpointsFile = path.join(projectRoot, 'docs/analysis/IGNORED_ENDPOINTS.md');

  console.log(`Analyzing API endpoints from: ${apiFile}`);
  const allEndpoints = extractApiEndpoints(apiFile);
  console.log(`Found ${allEndpoints.length} total API endpoints`);

  console.log(`\nAnalyzing implemented tools from: ${toolsDir}`);
  const toolToEndpointMap = mapToolsToEndpoints(toolsDir);
  console.log(`Found ${Object.keys(toolToEndpointMap).length} implemented endpoints`);

  console.log('\nCategorizing ignored endpoints...');
  const categories = categorizeIgnoredEndpoints(allEndpoints, toolToEndpointMap);
  const totalIgnored = Object.values(categories).reduce((sum, arr) => sum + arr.length, 0);
  console.log(`Found ${totalIgnored} ignored endpoints across ${Object.keys(categories).length} categories`);

  console.log('\nReading existing rationales...');
  const existingRationale = readExistingRationales(ignoredEndpointsFile);

  console.log(`\nGenerating updated documentation...`);
  const updatedContent = generateUpdatedDoc(categories, totalIgnored, existingRationale);

  console.log(`Writing to: ${ignoredEndpointsFile}`);
  fs.mkdirSync(path.dirname(ignoredEndpointsFile), { recursive: true });
  fs.writeFileSync(ignoredEndpointsFile, updatedContent);

  // Count actual tool files (with CreateUmbracoTool/Resource)
  const toolFiles = glob.sync('**/*.ts', {
    cwd: toolsDir,
    absolute: true,
    ignore: ['**/index.ts', '**/__tests__/**']
  });

  let actualToolCount = 0;
  for (const tsFile of toolFiles) {
    const content = fs.readFileSync(tsFile, 'utf-8');
    if (content.includes('CreateUmbracoTool') || content.includes('CreateUmbracoResource')) {
      actualToolCount++;
    }
  }

  console.log('\n✅ IGNORED_ENDPOINTS.md has been updated successfully!');
  console.log(`\nSummary:`);
  console.log(`  Total API endpoints: ${allEndpoints.length}`);
  console.log(`  Implemented (unique endpoints): ${Object.keys(toolToEndpointMap).length}`);
  console.log(`  Ignored: ${totalIgnored}`);
  console.log(`  Coverage: ${(Object.keys(toolToEndpointMap).length / allEndpoints.length * 100).toFixed(1)}%`);
  console.log(`\nNote: ${actualToolCount} MCP tools implement ${Object.keys(toolToEndpointMap).length} unique API endpoints`);
  console.log(`      Some tools use multiple endpoints, and some endpoints are used by multiple tools.`);
}

main().catch(error => {
  console.error('Error:', error);
  process.exit(1);
});
