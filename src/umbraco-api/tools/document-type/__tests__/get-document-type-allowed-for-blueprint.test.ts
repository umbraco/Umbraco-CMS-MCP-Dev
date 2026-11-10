import GetDocumentTypeAllowedForBlueprintTool from "../get/get-document-type-allowed-for-blueprint.js";
import { DocumentTypeBuilder } from "./helpers/document-type-builder.js";
import { DocumentTypeTestHelper } from "./helpers/document-type-test-helper.js";
import {
  createMockRequestHandlerExtra,
  setupTestEnvironment,
  validateToolResponse,
} from "@umbraco-cms/mcp-server-sdk/testing";

const TEST_DOCTYPE_NAME = "_Test DocumentType AllowedForBlueprint";

describe("get-document-type-allowed-for-blueprint", () => {
  setupTestEnvironment();

  afterEach(async () => {
    await DocumentTypeTestHelper.cleanup(TEST_DOCTYPE_NAME);
  });

  it("should include a newly created document type at the root", async () => {
    const builder = await new DocumentTypeBuilder()
      .withName(TEST_DOCTYPE_NAME)
      .withIcon("icon-document")
      .create();

    const result = await GetDocumentTypeAllowedForBlueprintTool.handler(
      { take: 500 } as any,
      createMockRequestHandlerExtra()
    );

    const data = validateToolResponse(GetDocumentTypeAllowedForBlueprintTool, result) as {
      total: number;
      items: { id: string; name: string; icon?: string | null }[];
    };
    const match = data.items.find((i) => i.id === builder.getId());
    expect(match).toBeDefined();
    expect({ name: match!.name, icon: match!.icon }).toMatchSnapshot();
  });
});
