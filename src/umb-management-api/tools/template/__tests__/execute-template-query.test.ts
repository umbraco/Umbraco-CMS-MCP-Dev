import { postTemplateQueryExecuteBody } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import ExecuteTemplateQueryTool from "../post/execute-template-query.js";
import { createSnapshotResult } from "@/test-helpers/create-snapshot-result.js";
import { createMockRequestHandlerExtra } from "@/test-helpers/create-mock-request-handler-extra.js";
import { setupTestEnvironment } from "@/test-helpers/setup-test-environment.js";

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

    expect(createSnapshotResult(result)).toMatchSnapshot();
  });
});
