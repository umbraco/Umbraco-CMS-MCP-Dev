# CLI Workflow Patterns

Common task patterns showing efficient CLI usage. Each pattern shows the minimum number of calls needed.

## Table of Contents

- [Finding a document by name](#finding-a-document-by-name)
- [Exploring available tools for a domain](#exploring-available-tools-for-a-domain)
- [Getting full details of an entity](#getting-full-details-of-an-entity)
- [Creating content](#creating-content)
- [Filtering combinations](#filtering-combinations)

---

## Finding a document by name

When the user asks about a specific document (e.g. "what does the Home page look like"):

```bash
# 1. Search by name — returns matching documents with IDs
<cli> --call search-document --call-args '{"query":"Home"}'

# 2. Only if search didn't return enough detail, get full document
<cli> --call get-document-by-id --call-args '{"id":"<id-from-search>"}'
```

Avoid the tree-walking pattern (`get-document-root` → scan for name → `get-document-by-id`) — it always takes more calls.

The same pattern applies to other searchable entities:
- `search-document-type` for document types
- `find-dictionary` for dictionary items
- `find-data-type` for data types
- `find-member` for members

## Exploring available tools for a domain

When the user asks "what can I do with media?" or "show me the document tools":

```bash
# One call — filter to the collection and optionally slices
<cli> --list-tools --umbraco-include-tool-collections media
```

To see only read operations:
```bash
<cli> --list-tools --umbraco-include-tool-collections media --umbraco-include-slices read,search,list
```

To see what the LLM would see in readonly mode:
```bash
<cli> --list-tools --umbraco-readonly
```

## Getting full details of an entity

When you need to understand a tool's parameters before calling it:

```bash
# Describe the tool first — shows full JSON schema
<cli> --describe-tool get-document-by-id

# Then call it with the right parameters
<cli> --call get-document-by-id --call-args '{"id":"..."}'
```

This is faster than guessing parameters and handling errors.

## Creating content

For create operations, describe the tool first to understand required fields:

```bash
# 1. Understand what's needed
<cli> --describe-tool create-document

# 2. Create with the right payload
<cli> --call create-document --call-args '{"name":"My Page","documentType":{"id":"..."},"parent":{"id":"..."}}'
```

If you need to find a document type ID first:
```bash
<cli> --call search-document-type --call-args '{"query":"Article"}'
```

## Filtering combinations

Filters combine — use them together to get precisely the tools you need.

| Goal | Flags |
|------|-------|
| All document tools | `--umbraco-include-tool-collections document` |
| Only read tools for documents | `--umbraco-include-tool-collections document --umbraco-include-slices read` |
| Everything except media | `--umbraco-exclude-tool-collections media` |
| Only search across all collections | `--umbraco-include-slices search` |
| Readonly view of everything | `--umbraco-readonly` |

Remember: exclude takes precedence over include when both are specified.
