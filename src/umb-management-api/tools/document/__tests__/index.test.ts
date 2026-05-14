import { sections } from "auth/umbraco-auth-policies.js";
import { DocumentTools } from "../index.js";
import { CurrentUserResponseModel } from "@/umb-management-api/schemas/currentUserResponseModel.js";
import { setUmbracoVersion } from "../../../runtime-context.js";

describe("document-tool-index", () => {
    it("should have no tools when user meets no policies", () => {
        const userMock = {
            allowedSections: []
        } as Partial<CurrentUserResponseModel>;

        const tools = DocumentTools(userMock as CurrentUserResponseModel);
        expect(tools.map(t => t.name)).toMatchSnapshot();
    });

    it("should have tools when user meets TreeAccessDocuments policy", () => {
        const userMock = {
            allowedSections: [sections.content],
            fallbackPermissions: ["Umb.Document.Delete"]
        } as Partial<CurrentUserResponseModel>;

        const tools = DocumentTools(userMock as CurrentUserResponseModel);
        expect(tools.map(t => t.name)).toMatchSnapshot();
    });

    it("should have tree tools when user meets SectionAccessForContentTree policy", () => {
        const userMock = {
            allowedSections: [sections.settings]
        } as Partial<CurrentUserResponseModel>;

        const tools = DocumentTools(userMock as CurrentUserResponseModel);
        expect(tools.map(t => t.name)).toMatchSnapshot();
    });

    it("should have all tools when user meets multiple policies", () => {
        const userMock = {
            allowedSections: [sections.content, sections.settings],
            fallbackPermissions: ["Umb.Document.Delete"]
        } as Partial<CurrentUserResponseModel>;

        const tools = DocumentTools(userMock as CurrentUserResponseModel);
        expect(tools.map(t => t.name)).toMatchSnapshot();
    });
});

describe("document-tool-index — pre-17.4 fallback", () => {
    beforeAll(() => setUmbracoVersion("17.3.0"));
    afterAll(() => setUmbracoVersion("17.4.0"));

    it("registers the legacy property-value-template tool and omits the Schema-API tool", () => {
        const userMock = {
            allowedSections: [sections.content],
            fallbackPermissions: ["Umb.Document.Delete"]
        } as Partial<CurrentUserResponseModel>;

        const names = DocumentTools(userMock as CurrentUserResponseModel).map(t => t.name);
        expect(names).toContain("get-document-property-value-template");
        expect(names).not.toContain("get-document-type-schema");
    });
});
