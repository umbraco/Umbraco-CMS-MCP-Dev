import { DocumentBuilder } from "../../document/__tests__/helpers/document-builder.js";
import { DocumentTestHelper } from "../../document/__tests__/helpers/document-test-helper.js";
import GetRedirectByIdTool from "../get/get-redirect-by-id.js";
import DeleteRedirectTool from "../delete/delete-redirect.js";
import GetAllRedirectsTool from "../get/get-all-redirects.js";
import {
  BLANK_UUID,
  encodeCursor,
} from "@umbraco-cms/mcp-server-sdk";
import {
  createMockRequestHandlerExtra,
  createSnapshotResult,
  setupTestEnvironment,
  validateToolResponse,
  type CursorPaginatedResult,
} from "@umbraco-cms/mcp-server-sdk/testing";

const TEST_DOCUMENT_NAME = "_Test Redirect Document";
const RENAMED_DOCUMENT_NAME = "_Test Redirect Document Renamed";

describe("Redirect Management Tools", () => {
  setupTestEnvironment();

  let documentId: string;
  let redirectId: string;

  beforeEach(async () => {
    // Create and publish a test document
    const builder = await new DocumentBuilder()
      .withName(TEST_DOCUMENT_NAME)
      .withRootDocumentType()
      .create();

    await builder.publish();
    await builder.updateName(RENAMED_DOCUMENT_NAME);
    await builder.publish();

    documentId = builder.getId();

    // Get the redirect ID
    const result = await GetAllRedirectsTool.handler(
      { filter: undefined },
      createMockRequestHandlerExtra()
    );
    const data = validateToolResponse(GetAllRedirectsTool, result);
    const redirect = data.items.find((r: any) => r.document.id === documentId);
    if (!redirect) {
      throw new Error("Redirect not found after rename");
    }
    redirectId = redirect.id;
  });

  afterEach(async () => {
    // Clean up all redirects
    const result = await GetAllRedirectsTool.handler(
      { filter: undefined },
      createMockRequestHandlerExtra()
    );
    const data = validateToolResponse(GetAllRedirectsTool, result);
    for (const redirect of data.items) {
      await DeleteRedirectTool.handler(
        { id: redirect.id },
        createMockRequestHandlerExtra()
      );
    }

    // Clean up the test documents
    await DocumentTestHelper.cleanup(TEST_DOCUMENT_NAME);
    await DocumentTestHelper.cleanup(RENAMED_DOCUMENT_NAME);
  });

  describe("GetRedirectByIdTool", () => {
    it("should get a redirect by ID", async () => {
      const result = await GetRedirectByIdTool.handler(
        { id: documentId },
        createMockRequestHandlerExtra()
      );

      let snapshot = createSnapshotResult(result, redirectId);
      snapshot = createSnapshotResult(snapshot, documentId);

      expect(snapshot).toMatchSnapshot();
    });
  });

  describe("DeleteRedirectTool", () => {
    it("should delete a redirect", async () => {
      const result = await DeleteRedirectTool.handler(
        { id: redirectId },
        createMockRequestHandlerExtra()
      );

      expect(result).toMatchSnapshot();

      // Verify the redirect is deleted
      const getResult = await GetRedirectByIdTool.handler(
        { id: documentId },
        createMockRequestHandlerExtra()
      );

      const snapshot = createSnapshotResult(getResult, documentId);
      expect(snapshot).toMatchSnapshot();
    });
  });

  describe("GetAllRedirectsTool", () => {
    it("should filter redirects by a substring of their url, excluding non-matching redirects", async () => {
      // Get the unfiltered redirect to find a real URL substring to filter on
      const allResult = await GetAllRedirectsTool.handler(
        { filter: undefined },
        createMockRequestHandlerExtra()
      );
      const allData = validateToolResponse(GetAllRedirectsTool, allResult);
      const ours = allData.items.find((r: any) => r.id === redirectId);
      if (!ours) {
        throw new Error("Expected redirect not found in unfiltered results");
      }

      const urlFragment = (ours as any).originalUrl.replace(/^\//, "").slice(0, 8);

      // Create a second, unrelated redirect whose url does not contain urlFragment,
      // so a loose "is our redirect present" assertion can't pass by accident -
      // the filter must actually exclude it for this test to be meaningful.
      const secondName = "_Zzz Unrelated Filter Page";
      const secondRenamedName = "_Zzz Unrelated Filter Page Renamed";
      const secondBuilder = await new DocumentBuilder()
        .withName(secondName)
        .withRootDocumentType()
        .create();

      await secondBuilder.publish();
      await secondBuilder.updateName(secondRenamedName);
      await secondBuilder.publish();

      try {
        const unfilteredResult = await GetAllRedirectsTool.handler(
          { filter: undefined },
          createMockRequestHandlerExtra()
        );
        const unfilteredData = validateToolResponse(GetAllRedirectsTool, unfilteredResult);
        const secondRedirect = unfilteredData.items.find(
          (r: any) => r.document.id === secondBuilder.getId()
        );
        if (!secondRedirect) {
          throw new Error("Second redirect not found after rename");
        }
        expect((secondRedirect as any).originalUrl).not.toContain(urlFragment);

        const result = await GetAllRedirectsTool.handler(
          { filter: urlFragment },
          createMockRequestHandlerExtra()
        );
        const data = validateToolResponse(GetAllRedirectsTool, result);

        // The filter must include our matching redirect and exclude the unrelated one -
        // narrowing the result set, not just happening to still contain it.
        expect(data.items.some((r: any) => r.id === redirectId)).toBe(true);
        expect(data.items.some((r: any) => r.id === (secondRedirect as any).id)).toBe(false);
        expect(data.items.length).toBeLessThan(unfilteredData.items.length);
      } finally {
        await DocumentTestHelper.cleanup(secondName);
        await DocumentTestHelper.cleanup(secondRenamedName);
      }
    });

    it("should return no redirects for a filter that matches nothing", async () => {
      const result = await GetAllRedirectsTool.handler(
        { filter: "this-filter-should-not-match-any-redirect-zzz" },
        createMockRequestHandlerExtra()
      );
      const data = validateToolResponse(GetAllRedirectsTool, result);
      expect(data.items).toHaveLength(0);
      expect(data.total).toBe(0);
    });

    it("should page through redirects using a cursor when there are more than fit on one page", async () => {
      // Create a second redirect so there are at least two in total
      const secondName = "_Test Redirect Document 2";
      const secondRenamedName = "_Test Redirect Document 2 Renamed";
      const secondBuilder = await new DocumentBuilder()
        .withName(secondName)
        .withRootDocumentType()
        .create();

      await secondBuilder.publish();
      await secondBuilder.updateName(secondRenamedName);
      await secondBuilder.publish();

      try {
        // Request a page size of 1 (via a crafted cursor) so the two redirects span two pages
        const firstResult = await GetAllRedirectsTool.handler(
          { filter: undefined, cursor: encodeCursor({ s: 0, t: 1 }) },
          createMockRequestHandlerExtra()
        );
        const firstPage = validateToolResponse(GetAllRedirectsTool, firstResult) as CursorPaginatedResult;

        expect(firstPage.total).toBeGreaterThanOrEqual(2);
        expect(firstPage.items).toHaveLength(1);
        expect(firstPage.nextCursor).toBeDefined();

        const secondResult = await GetAllRedirectsTool.handler(
          { filter: undefined, cursor: firstPage.nextCursor },
          createMockRequestHandlerExtra()
        );
        const secondPage = validateToolResponse(GetAllRedirectsTool, secondResult) as CursorPaginatedResult;

        expect(secondPage.items.length).toBeGreaterThanOrEqual(1);

        // The pages should not overlap
        const firstIds = (firstPage.items as any[]).map((r) => r.id);
        const secondIds = (secondPage.items as any[]).map((r) => r.id);
        expect(new Set([...firstIds, ...secondIds]).size).toBe(firstIds.length + secondIds.length);
      } finally {
        await DocumentTestHelper.cleanup(secondName);
        await DocumentTestHelper.cleanup(secondRenamedName);
      }
    });

    it("should return an empty page when the cursor skip is beyond the available redirects", async () => {
      const result = await GetAllRedirectsTool.handler(
        { filter: undefined, cursor: encodeCursor({ s: 10000, t: 100 }) },
        createMockRequestHandlerExtra()
      );

      const parsed = validateToolResponse(GetAllRedirectsTool, result) as CursorPaginatedResult;
      expect(parsed.items).toHaveLength(0);
      expect(parsed.nextCursor).toBeFalsy();
    });
  });
});
