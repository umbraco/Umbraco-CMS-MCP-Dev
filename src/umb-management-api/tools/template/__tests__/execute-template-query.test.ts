import ExecuteTemplateQueryTool from "../post/execute-template-query.js";
import {
  createMockRequestHandlerExtra,
  createSnapshotResult,
  setupTestEnvironment,
  validateToolResponse,
} from "@umbraco-cms/mcp-server-sdk/testing";

describe("execute-template-query", () => {
  setupTestEnvironment();

  it("should execute a simple template query", async () => {
    const queryBody = {
      rootDocument: undefined,
      documentTypeAlias: undefined,
      filters: undefined,
      sort: undefined,
      take: 10
    };

    const result = await ExecuteTemplateQueryTool.handler(queryBody, createMockRequestHandlerExtra());

    const data = validateToolResponse(ExecuteTemplateQueryTool, result);
    expect(data).toBeDefined();
    expect(createSnapshotResult(result)).toMatchSnapshot();
  });

  it("should execute a template query with document type filter", async () => {
    const queryBody = {
      rootDocument: undefined,
      documentTypeAlias: "contentPage",
      filters: undefined,
      sort: undefined,
      take: 5
    };

    const result = await ExecuteTemplateQueryTool.handler(queryBody, createMockRequestHandlerExtra());

    const data = validateToolResponse(ExecuteTemplateQueryTool, result);
    expect(data).toBeDefined();
    expect(createSnapshotResult(result)).toMatchSnapshot();
  });

  it("should execute a template query with filters and sorting", async () => {
    const queryBody = {
      rootDocument: undefined,
      documentTypeAlias: undefined,
      filters: [
        {
          propertyAlias: "umbracoNaviHide",
          operator: "NotEquals" as const,
          constraintValue: "1"
        }
      ],
      sort: {
        propertyAlias: "createDate",
        direction: "Descending" as const
      },
      take: 10
    };

    const result = await ExecuteTemplateQueryTool.handler(queryBody, createMockRequestHandlerExtra());

    const data = validateToolResponse(ExecuteTemplateQueryTool, result);
    expect(data).toBeDefined();
    expect(createSnapshotResult(result)).toMatchSnapshot();
  });

  it("should handle invalid query gracefully", async () => {
    const queryBody = {
      rootDocument: undefined,
      documentTypeAlias: "nonExistentType",
      filters: undefined,
      sort: undefined,
      take: 10
    };

    const result = await ExecuteTemplateQueryTool.handler(queryBody, createMockRequestHandlerExtra());

    const data = validateToolResponse(ExecuteTemplateQueryTool, result);
    expect(data).toBeDefined();
    expect(createSnapshotResult(result)).toMatchSnapshot();
  });
});
