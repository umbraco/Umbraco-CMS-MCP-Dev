import { sections } from "auth/umbraco-auth-policies.js";
import { DataTypeCollection } from "../index.js";
import { CurrentUserResponseModel } from "@/umbraco-api/schemas/currentUserResponseModel.js";
import { setUmbracoVersion } from "../../../runtime-context.js";

describe("data-type-tool-index", () => {
    // jest.setup.ts primes the version to 17.4.0, so the default suite below
    // exercises the modern Schema-API tools. Each test should leave the version
    // primed; the legacy-fallback suite further down explicitly swaps it.


    it("should have tools when user meets TreeAccessDocumentsOrMediaOrMembersOrContentTypes policy", () => {
        const userMock = {
            allowedSections: [sections.content]
        } as Partial<CurrentUserResponseModel>;

        const tools = DataTypeCollection.tools(userMock as CurrentUserResponseModel);
        expect(tools.map(t => t.name)).toMatchSnapshot();
    });

    it("should have tools when user meets TreeAccessDataTypes policy", () => {
        const userMock = {
            allowedSections: [sections.settings]
        } as Partial<CurrentUserResponseModel>;

        const tools = DataTypeCollection.tools(userMock as CurrentUserResponseModel);
        expect(tools.map(t => t.name)).toMatchSnapshot();
    });

    it("should have tools when user meets multiple policies", () => {
        const userMock = {
            allowedSections: [sections.content, sections.settings]
        } as Partial<CurrentUserResponseModel>;

        const tools = DataTypeCollection.tools(userMock as CurrentUserResponseModel);
        expect(tools.map(t => t.name)).toMatchSnapshot();
    });

    it("should only have search tool when user meets no policies", () => {
        const userMock = {
            allowedSections: []
        } as Partial<CurrentUserResponseModel>;

        const tools = DataTypeCollection.tools(userMock as CurrentUserResponseModel);
        expect(tools.map(t => t.name)).toMatchSnapshot();
    });

});

describe("data-type-tool-index — pre-17.4 fallback", () => {
    // Force the version below the Schema-API floor for these cases.
    beforeAll(() => setUmbracoVersion("17.3.0"));
    afterAll(() => setUmbracoVersion("17.4.0"));

    it("still registers get-data-type-schema (legacy synthesizer) but omits the batch Schema-API tool", () => {
        const userMock = {
            allowedSections: [sections.content]
        } as Partial<CurrentUserResponseModel>;

        const names = DataTypeCollection.tools(userMock as CurrentUserResponseModel).map(t => t.name);
        expect(names).toContain("get-data-type-schema");
        expect(names).not.toContain("get-data-type-schemas");
        expect(names).not.toContain("get-data-type-property-editor-template");
    });
});