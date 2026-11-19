import { jest } from "@jest/globals";
import { getAllDocumentTypeProperties } from "../document-type-properties-resolver.js";
import { UmbracoManagementClient } from "@umb-management-client";

const ROOT_ID = "11111111-1111-1111-1111-111111111111";
const COMPOSITION_ID = "22222222-2222-2222-2222-222222222222";

function docType(overrides: {
  variesByCulture: boolean;
  variesBySegment: boolean;
  properties?: Array<{ alias: string; name: string; dataTypeId: string; variesByCulture: boolean; variesBySegment: boolean }>;
  compositions?: Array<{ documentTypeId: string }>;
}) {
  return {
    variesByCulture: overrides.variesByCulture,
    variesBySegment: overrides.variesBySegment,
    properties: (overrides.properties ?? []).map(p => ({
      alias: p.alias,
      name: p.name,
      dataType: { id: p.dataTypeId },
      variesByCulture: p.variesByCulture,
      variesBySegment: p.variesBySegment,
    })),
    compositions: (overrides.compositions ?? []).map(c => ({ documentType: { id: c.documentTypeId } })),
  };
}

describe("getAllDocumentTypeProperties", () => {
  let clientSpy: jest.SpiedFunction<typeof UmbracoManagementClient.getClient>;

  afterEach(() => {
    clientSpy.mockRestore();
  });

  it("narrows an invariant root document type's effective culture AND segment variance to false, even when a composition's property declares both true (issue #605)", async () => {
    const getDocumentTypeById = jest.fn(async (id: string) => {
      if (id === ROOT_ID) {
        return docType({
          variesByCulture: false,
          variesBySegment: false,
          compositions: [{ documentTypeId: COMPOSITION_ID }],
        });
      }
      return docType({
        variesByCulture: true,
        variesBySegment: true,
        properties: [
          { alias: "seoTitle", name: "Seo Title", dataTypeId: "dt-1", variesByCulture: true, variesBySegment: true },
        ],
      });
    });
    clientSpy = jest.spyOn(UmbracoManagementClient, "getClient").mockReturnValue({
      getDocumentTypeById,
    } as any);

    const properties = await getAllDocumentTypeProperties(ROOT_ID);

    const seoTitle = properties.find(p => p.alias === "seoTitle");
    expect(seoTitle).toBeDefined();
    expect(seoTitle?.variesByCulture).toBe(false);
    expect(seoTitle?.variesBySegment).toBe(false);
  });

  it("keeps a composition property's full variance when the root document type varies by both culture and segment", async () => {
    const getDocumentTypeById = jest.fn(async (id: string) => {
      if (id === ROOT_ID) {
        return docType({
          variesByCulture: true,
          variesBySegment: true,
          compositions: [{ documentTypeId: COMPOSITION_ID }],
        });
      }
      return docType({
        variesByCulture: true,
        variesBySegment: true,
        properties: [
          { alias: "seoTitle", name: "Seo Title", dataTypeId: "dt-1", variesByCulture: true, variesBySegment: true },
        ],
      });
    });
    clientSpy = jest.spyOn(UmbracoManagementClient, "getClient").mockReturnValue({
      getDocumentTypeById,
    } as any);

    const properties = await getAllDocumentTypeProperties(ROOT_ID);

    const seoTitle = properties.find(p => p.alias === "seoTitle");
    expect(seoTitle?.variesByCulture).toBe(true);
    expect(seoTitle?.variesBySegment).toBe(true);
  });

  it("ANDs culture and segment independently, so a root that varies by only one axis narrows just that axis", async () => {
    const getDocumentTypeById = jest.fn(async (id: string) => {
      if (id === ROOT_ID) {
        return docType({
          // Root varies by culture but not by segment.
          variesByCulture: true,
          variesBySegment: false,
          compositions: [{ documentTypeId: COMPOSITION_ID }],
        });
      }
      return docType({
        variesByCulture: true,
        variesBySegment: true,
        properties: [
          { alias: "seoTitle", name: "Seo Title", dataTypeId: "dt-1", variesByCulture: true, variesBySegment: true },
        ],
      });
    });
    clientSpy = jest.spyOn(UmbracoManagementClient, "getClient").mockReturnValue({
      getDocumentTypeById,
    } as any);

    const properties = await getAllDocumentTypeProperties(ROOT_ID);

    const seoTitle = properties.find(p => p.alias === "seoTitle");
    expect(seoTitle?.variesByCulture).toBe(true);
    expect(seoTitle?.variesBySegment).toBe(false);
  });

  it("resolves a direct (non-composition) property's variance using only the root's own flags", async () => {
    const getDocumentTypeById = jest.fn(async () =>
      docType({
        variesByCulture: false,
        variesBySegment: false,
        properties: [
          { alias: "title", name: "Title", dataTypeId: "dt-2", variesByCulture: true, variesBySegment: true },
        ],
      })
    );
    clientSpy = jest.spyOn(UmbracoManagementClient, "getClient").mockReturnValue({
      getDocumentTypeById,
    } as any);

    const properties = await getAllDocumentTypeProperties(ROOT_ID);

    const title = properties.find(p => p.alias === "title");
    expect(title?.variesByCulture).toBe(false);
    expect(title?.variesBySegment).toBe(false);
  });

  it("only fetches the root document type once, reusing it for the recursive root-level resolution", async () => {
    const getDocumentTypeById = jest.fn(async (id: string) => {
      if (id === ROOT_ID) {
        return docType({ variesByCulture: false, variesBySegment: false });
      }
      return docType({ variesByCulture: false, variesBySegment: false });
    });
    clientSpy = jest.spyOn(UmbracoManagementClient, "getClient").mockReturnValue({
      getDocumentTypeById,
    } as any);

    await getAllDocumentTypeProperties(ROOT_ID);

    expect(getDocumentTypeById).toHaveBeenCalledTimes(1);
    expect(getDocumentTypeById).toHaveBeenCalledWith(ROOT_ID);
  });
});
