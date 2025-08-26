---
root: false
targets:
  - '*'
description: ''
globs:
  - '**/*'
cursorRuleType: always
---

# Model Context Providers Development Guide

You are an expert in TypeScript and Model Context Protocol implementation.

## Core Concepts and Architecture

- Follow the [Model Context Protocol](mdc:https:/modelcontextprotocol.io/introduction) specifications for implementing context providers.
- Creates standardized interfaces between LLMs and your application's context.
- Use TypeScript for all implementations to ensure type safety and better developer experience.
- Structure providers to handle different types of context: resource retieval, prompt creation, tool invocation, etc.
- Model context providers are made up of resources, prompts and tools. For the rest of this document we will use the name provider files to logically group these different types.

## Provider Structure and Organization

- Organize providers in a modular, composable architecture.
- Structure files: exported provider, context handling logic, retrieval methods, serialization, types.

## Naming Conventions

- Use descriptive, consistent naming for provider files (e.g., `DocumentContextProvider`, `ConversationHistoryProvider`).
- Use descriptive, consistent file naming for provider files (e.g., `DocumentContextProvider`, `ConversationHistoryProvider`).
- Follow camelCase for methods and PascalCase for interface names.

## Umbraco API Integration

- **Reference `wtf.md`** for documented API quirks, known issues, and limitations
- The Umbraco API exposes the management API for Umbraco
    - It contains Gets, Posts, Puts, Deletes for interacting with Umbraco
    - It contains groups of endpoints including Culture, Data Type, Dictionary, Document Blueprint, Document Type, Document Version, Document, Dynamic Root, Health Check, Help, Imaging, Import Indexer, Install, Language, Log Viewer, Manifest, Media Type, Media, Member Group, Member Type, Member, Models Builder, Object Types, oEmbed, Package, Partial View, Preview, Profiling, Property Type, Published Cache, Redirect Management, Relation Type, Scripts, Search, Security, Segment, Server, Static File, Stylesheet, Segment, Telemetry, Template, Temporary File, Upgrade, User Data, User Group, User, Webhook
- The Umbraco API client and models are generated using Orval. 
- The Umbraco API is in the /src/api/umbraco
- Use the UmbracoManagmentClient to make an instance of the client
```
    const client = UmbracoManagementClient.getClient();
```
- All schemas are generated for all data, params, requests and responses.
- Zod schemas have been generated for all data, params, requests and responses. 
- Zod schemas should always be used to validate any params into provider files 
- When placing tools or resources in folders use the rest verb to group the files e.g put actions in the put folder
- When placing tools in folders also group by common types, so folder actions and item action gets groups together. Also group items by rest verb as above within sub folders.

## Resources Intergration
In MCP resources are readonly endpoints for LLM's to query and provide context. They should be used for Get requests.

- There are 2 types of resource calls, static resource and dynamic resource. Dynamic resources can be filtered and changed using params, static resources always return the same data.

## Read Resource
- Static resources using CreateUmbracoReadResource 
    - they always have a url that starts with umbraco:// and breaks down the logical path for the endpoint e.g getItemLanguageDefault is umbraco://item/language/default
    - they always use a name that respresents the umbraco endpoint
    - they always use a description that represents the endpoint 
    - they always use a try catch to catch reponse errors 
- here is an example of the implementation
```
import { UmbracoManagementClient } from "@/clients/umbraco-management-client.js";
import { CreateUmbracoReadResource } from "@/helpers/create-umbraco-read-resource.js";

const GetLangagueDefaultResource = CreateUmbracoReadResource(
  "umbraco://item/langage/default",
  "List default language",
  "List the default language for the current Umbraco instance",
  async (uri) => {
    try {
      const client = UmbracoManagementClient.getClient();
      const response = await client.getItemLanguageDefault();
      return {
        contents: [{
          uri: uri.href,
          text: JSON.stringify(response, null, 2),
          mimeType: "application/json"
        }]
      };
    } catch (error) {
      console.error('Error in GetItemLanguageDefault:', error);
      throw error;
    }
  }
);

export default GetLangagueDefaultResource;
```

## Resource Template
- Resource templates using CreateUmbracoTemplateResource 
    - they always use a name that respresents the umbraco endpoint
    - they always use a description that represents the endpoint 
    - they always have a url that starts with umbraco:// and breaks down the logical path for the endpoint e.g getItemLanguageDefault is umbraco://item/language/default
    - the url always contains query strings for the params that are taken from the zod schema definition i.e params of skip, take and foldersOnly become ?skip={skip}&take={take}&foldersOnly={foldersOnly}
    - valid options for the params are shown in the complete property on the ResourceTemplate definition, they always match the param type i.e true and false for boolen but the value is always string. e.g
    ```
        new ResourceTemplate("umbraco://data-type/root?skip={skip}&take={take}&foldersOnly={foldersOnly}", {
            list: undefined,
            complete: {
            skip: (value: string) => ["0", "10", "20", "30", "40", "50", "60", "70", "80", "90", "100"],
            take: (value: string) => ["10", "20", "50", "100"],
            foldersOnly: (value: string) => ["true", "false"]
            }
        }),
    ```
    - they always use the zod schema to parse the raw passed variables
    - they always use a try catch to catch reponse errors 
- here is an example of the implementation
```
import { UmbracoManagementClient } from "@/clients/umbraco-management-client.js";
import { CreateUmbracoTemplateResource } from "@/helpers/create-umbraco-template-resource.js";
import { getTreeDataTypeRootQueryParams } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import { ResourceTemplate } from "@modelcontextprotocol/sdk/server/mcp.js";

const GetDataTypeRootResource = CreateUmbracoTemplateResource(
  "List Data Types at Root",
  "List the data types at the root of the Umbraco instance",
  new ResourceTemplate("umbraco://data-type/root?skip={skip}&take={take}&foldersOnly={foldersOnly}", {
    list: undefined,
    complete: {
      skip: (value: string) => ["0", "10", "20", "30", "40", "50", "60", "70", "80", "90", "100"],
      take: (value: string) => ["10", "20", "50", "100"],
      foldersOnly: (value: string) => ["true", "false"]
    }
  }),
  async (uri, variables) => {
    try {
      const client = UmbracoManagementClient.getClient();
      const params = getTreeDataTypeRootQueryParams.parse(variables);
      const response = await client.getTreeDataTypeRoot(params);
      return {
        contents: [{
          uri: uri.href,
          text: JSON.stringify(response, null, 2),
          mimeType: "application/json"
        }]
      };
    } catch (error) {
      console.error('Error in GetDataTypeRootResource:', error);
      throw error;
    }
  }
);

export default GetDataTypeRootResource;
```

## Tool Intergration
In MCP tools are endpoints for LLM's to query and perform actions against a resource. They should be used for Get, Post, Put, Delete requests.

- There are 1 types of tool calls. Dynamic tools can be used to query or change the resource by using params.
    - they always use a name that respresents the umbraco endpoint
    - they always use a description that represents the endpoint 
    - they always of the shape of the zod definition to define how the tool interacts with the LLM.
    - the handler always has a parameter that matches the model for the zod schema definition
- here is an example of the implementation
```
import { UmbracoManagementClient } from "@/clients/umbraco-management-client.js";
import { CreateUmbracoTool } from "@/helpers/create-umbraco-tool.js";
import { GetFilterDataTypeParams } from "@/umb-management-api/schemas/index.js";
import { getFilterDataTypeQueryParams } from "@/umb-management-api/umbracoManagementAPI.zod.js";

const FindDataTypeTool = CreateUmbracoTool(
  "find-data-type",
  "Finds a data type by Id or Name",
  getFilterDataTypeQueryParams.shape,
  async (model: GetFilterDataTypeParams) => {
      const client = UmbracoManagementClient.getClient();
      var response = await client.getFilterDataType(model);

      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify(response),
          },
        ],
      };
  }
);

export default FindDataTypeTool;
```

## TypeScript Implementation

- Define clear interfaces for all context objects and provider methods.
- Use generics to create flexible, reusable provider implementations.
- Implement proper error handling with custom error types.
- Use TypeScript's discriminated unions for context type differentiation.

## Key Conventions

1. Follow the Model Context Protocol specifications rigorously.
2. Prioritize type safety throughout the implementation.
3. Design for composability and extensibility.
4. Optimize for relevant context retrieval rather than volume.
5. Implement robust error handling and fallback mechanisms.
6. Test with multiple model providers to ensure compatibility.
7. Document all providers, interfaces, and integration patterns.

## Additional Resources

- [Model Context Protocol Specification](mdc:https:/modelcontextprotocol.io/specification)
- [Retrieval Augmented Generation Best Practices](mdc:https:/modelcontextprotocol.io/rag)
- [Tool Integration Guidelines](mdc:https:/modelcontextprotocol.io/tools)
- [Context Window Management](mdc:https:/modelcontextprotocol.io/context-window)