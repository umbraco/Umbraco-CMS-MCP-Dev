import { postTemplateQueryExecuteBody } from "@/umb-management-api/umbracoManagementAPI.zod.js";
import ExecuteTemplateQueryTool from "../post/execute-template-query.js";
import { createSnapshotResult } from "@/test-helpers/create-snapshot-result.js";
import { createMockRequestHandlerExtra } from "@/test-helpers/create-mock-request-handler-extra.js";
import { setupTestEnvironment } from "@/test-helpers/setup-test-environment.js";

describe("execute-template-query", () => {
  setupTestEnvironment();

  it("should execute a simple template query", async () => {
    const queryBody = postTemplateQueryExecuteBody.parse({
      rootDocument: null,
      documentTypeAlias: null,
      filters: [],
      sort: null,
      take: 10
    });

    const result = await ExecuteTemplateQueryTool.handler(queryBody, createMockRequestHandlerExtra());

    expect(createSnapshotResult(result)).toMatchSnapshot();
  });

  it("should execute a template query with document type filter", async () => {
    const queryBody = postTemplateQueryExecuteBody.parse({
      rootDocument: null,
      documentTypeAlias: "contentPage",
      filters: [],
      sort: null,
      take: 5
    });

    const result = await ExecuteTemplateQueryTool.handler(queryBody, createMockRequestHandlerExtra());

    expect(createSnapshotResult(result)).toMatchSnapshot();
  });

  it("should execute a template query with filters and sorting", async () => {
    const queryBody = postTemplateQueryExecuteBody.parse({
      rootDocument: null,
      documentTypeAlias: null,
      filters: [
        {
          propertyAlias: "umbracoNaviHide",
          operator: "NotEquals",
          constraintValue: "1"
        }
      ],
      sort: {
        propertyAlias: "createDate",
        direction: "Descending"
      },
      take: 10
    });

    const result = await ExecuteTemplateQueryTool.handler(queryBody, createMockRequestHandlerExtra());

    expect(createSnapshotResult(result)).toMatchSnapshot();
  });

  it("should handle invalid query gracefully", async () => {
    const queryBody = postTemplateQueryExecuteBody.parse({
      rootDocument: null,
      documentTypeAlias: "nonExistentType",
      filters: [],
      sort: null,
      take: 10
    });

    const result = await ExecuteTemplateQueryTool.handler(queryBody, createMockRequestHandlerExtra());

    expect(createSnapshotResult(result)).toMatchSnapshot();
  });
});
