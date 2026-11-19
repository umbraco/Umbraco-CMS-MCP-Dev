import { jest } from "@jest/globals";
import PublishDocumentWithDescendantsTool from "../put/publish-document-with-descendants.js";
import { DocumentBuilder } from "./helpers/document-builder.js";
import { DocumentTestHelper } from "./helpers/document-test-helper.js";
import { UmbracoManagementClient } from "@umb-management-client";
import {
  BLANK_UUID,
} from "@umbraco-cms/mcp-server-sdk";
import {
  createMockRequestHandlerExtra,
  setupTestEnvironment,
} from "@umbraco-cms/mcp-server-sdk/testing";

const TEST_ROOT_NAME = "_Test PublishWithDescendants Root";
const TEST_CHILD_NAMES = [
  "_Test PublishWithDescendants Child 1",
  "_Test PublishWithDescendants Child 2",
];

describe("publish-document-with-descendants", () => {
  setupTestEnvironment();

  let rootId: string;
  let childIds: string[];

  beforeEach(async () => {
    // Create root
    const rootBuilder = await new DocumentBuilder()
      .withName(TEST_ROOT_NAME)
      .withRootDocumentType()
      .create();
    rootId = rootBuilder.getId();
    // Create children
    childIds = [];
    for (const name of TEST_CHILD_NAMES) {
      const childBuilder = await new DocumentBuilder()
        .withName(name)
        .withContentDocumentType()
        .withParent(rootId)
        .create();
      childIds.push(childBuilder.getId());
    }
  });

  afterEach(async () => {
    await DocumentTestHelper.cleanup(TEST_ROOT_NAME);
    for (const name of TEST_CHILD_NAMES) {
      await DocumentTestHelper.cleanup(name);
    }
  });

  it("should publish a document and its descendants", async () => {
    const result = await PublishDocumentWithDescendantsTool.handler(
      {
        id: rootId,
        data: { includeUnpublishedDescendants: true, cultures: [] },
      },
      createMockRequestHandlerExtra()
    );
    expect(result).toMatchSnapshot();

    // Check published state of root and children
    const root = await DocumentTestHelper.findDocument(TEST_ROOT_NAME);
    expect(root).toBeDefined();
    if (!root) throw new Error("Root document not found");

    expect(root.documentType).toBeDefined();
    expect(root.variants.some((v: any) => v.state === "Published")).toBe(true);
    for (const name of TEST_CHILD_NAMES) {
      const child = await DocumentTestHelper.findDocument(name);
      expect(child).toBeDefined();
      if (!child) throw new Error(`Child document '${name}' not found`);
      expect(child.documentType).toBeDefined();
      expect(child.variants.some((v: any) => v.state === "Published")).toBe(
        true
      );
    }
  });

  it("should handle publishing a non-existent document", async () => {
    const result = await PublishDocumentWithDescendantsTool.handler(
      {
        id: "1234567890",
        data: { includeUnpublishedDescendants: true, cultures: [] },
      },
      createMockRequestHandlerExtra()
    );
    expect(result).toMatchSnapshot();
  });
});

describe("publish-document-with-descendants - polling failure modes", () => {
  setupTestEnvironment();

  const TASK_ID = "11111111-1111-1111-1111-111111111111";
  const DOC_ID = "22222222-2222-2222-2222-222222222222";

  let clientSpy: jest.SpiedFunction<typeof UmbracoManagementClient.getClient>;

  beforeEach(() => {
    clientSpy = jest.spyOn(UmbracoManagementClient, "getClient");
    // Speed through the 1-second poll interval without waiting for real time.
    jest.spyOn(global, "setTimeout").mockImplementation(((fn: () => void) => {
      fn();
      return 0 as any;
    }) as any);
  });

  afterEach(() => {
    clientSpy.mockRestore();
    jest.restoreAllMocks();
  });

  it("returns an error result carrying the ProblemDetails when some branch items fail to publish", async () => {
    const failedBranchProblem = {
      type: "Error",
      title: "Branch publish partially failed",
      status: 400,
      detail: "Some descendants failed to publish",
      failedBranchItems: [
        { id: "33333333-3333-3333-3333-333333333333", operationStatus: "CancelledByEvent" },
      ],
    };

    clientSpy.mockReturnValue({
      putDocumentByIdPublishWithDescendants: jest.fn(async () => ({
        taskId: TASK_ID,
        isComplete: false,
      })),
      getDocumentByIdPublishWithDescendantsResultByTaskId: jest.fn(async () => ({
        status: 400,
        statusText: "Bad Request",
        data: failedBranchProblem,
      })),
    } as any);

    const result: any = await PublishDocumentWithDescendantsTool.handler(
      {
        id: DOC_ID,
        data: { includeUnpublishedDescendants: true, cultures: [] },
      },
      createMockRequestHandlerExtra()
    );

    expect(result.isError).toBe(true);
    expect(JSON.parse(result.content[0].text)).toEqual({
      ...failedBranchProblem,
      documentId: DOC_ID,
      taskId: TASK_ID,
    });
  });

  it("returns a sane fallback (with status present) when the non-2xx response body is empty/falsy", async () => {
    clientSpy.mockReturnValue({
      putDocumentByIdPublishWithDescendants: jest.fn(async () => ({
        taskId: TASK_ID,
        isComplete: false,
      })),
      getDocumentByIdPublishWithDescendantsResultByTaskId: jest.fn(async () => ({
        status: 500,
        statusText: "Internal Server Error",
        data: undefined,
      })),
    } as any);

    const result: any = await PublishDocumentWithDescendantsTool.handler(
      {
        id: DOC_ID,
        data: { includeUnpublishedDescendants: true, cultures: [] },
      },
      createMockRequestHandlerExtra()
    );

    expect(result.isError).toBe(true);
    const body = JSON.parse(result.content[0].text);
    expect(body.status).toBe(500);
    expect(body.taskId).toBe(TASK_ID);
    expect(body.documentId).toBe(DOC_ID);
  });

  it("returns the silent success result once polling reaches isComplete: true", async () => {
    const getResult = jest
      .fn()
      .mockImplementationOnce(async () => ({
        status: 200,
        statusText: "OK",
        data: { taskId: TASK_ID, isComplete: false },
      }))
      .mockImplementationOnce(async () => ({
        status: 200,
        statusText: "OK",
        data: { taskId: TASK_ID, isComplete: true },
      }));

    clientSpy.mockReturnValue({
      putDocumentByIdPublishWithDescendants: jest.fn(async () => ({
        taskId: TASK_ID,
        isComplete: false,
      })),
      getDocumentByIdPublishWithDescendantsResultByTaskId: getResult,
    } as any);

    const result: any = await PublishDocumentWithDescendantsTool.handler(
      {
        id: DOC_ID,
        data: { includeUnpublishedDescendants: true, cultures: [] },
      },
      createMockRequestHandlerExtra()
    );

    expect(result.isError).toBeFalsy();
    expect(result.content[0].text).toBe("\"\"");
    expect(getResult).toHaveBeenCalledTimes(2);
  });

  it("returns an error result when the poll HTTP call itself fails", async () => {
    clientSpy.mockReturnValue({
      putDocumentByIdPublishWithDescendants: jest.fn(async () => ({
        taskId: TASK_ID,
        isComplete: false,
      })),
      getDocumentByIdPublishWithDescendantsResultByTaskId: jest.fn(async () => {
        throw new Error("network boom");
      }),
    } as any);

    const result: any = await PublishDocumentWithDescendantsTool.handler(
      {
        id: DOC_ID,
        data: { includeUnpublishedDescendants: true, cultures: [] },
      },
      createMockRequestHandlerExtra()
    );

    expect(result.isError).toBe(true);
    const body = JSON.parse(result.content[0].text);
    expect(body.taskId).toBe(TASK_ID);
    expect(body.detail).toContain("network boom");
    expect(body.status).toBe(500);
  });

  it("reports that publishing is still in progress (not an error) once the 60-attempt limit is reached", async () => {
    clientSpy.mockReturnValue({
      putDocumentByIdPublishWithDescendants: jest.fn(async () => ({
        taskId: TASK_ID,
        isComplete: false,
      })),
      getDocumentByIdPublishWithDescendantsResultByTaskId: jest.fn(async () => ({
        status: 200,
        statusText: "OK",
        data: { taskId: TASK_ID, isComplete: false },
      })),
    } as any);

    const result: any = await PublishDocumentWithDescendantsTool.handler(
      {
        id: DOC_ID,
        data: { includeUnpublishedDescendants: true, cultures: [] },
      },
      createMockRequestHandlerExtra()
    );

    expect(result.isError).toBeFalsy();
    const body = JSON.parse(result.content[0].text);
    expect(body.status).toBe("in-progress");
    expect(body.taskId).toBe(TASK_ID);
    expect(body.message).toContain("get-document-publish-with-descendants-result");
    expect(body.message).toContain(TASK_ID);
  });
});
