import { sections } from "@/helpers/auth/umbraco-auth-policies.js";
import { DocumentBlueprintTools } from "../index.js";
import { CurrentUserResponseModel } from "@/umb-management-api/schemas/currentUserResponseModel.js";

describe("document-blueprint-tool-index", () => {
    it("should have no tools when user meets no policies", () => {
        const userMock = {
            allowedSections: []
        } as Partial<CurrentUserResponseModel>;

        const tools = DocumentBlueprintTools(userMock as CurrentUserResponseModel);
        expect(tools.map(t => t.name)).toMatchSnapshot();
    });

    it("should have no tools when user does not have document type access", () => {
        const userMock = {
            allowedSections: [sections.content]
        } as Partial<CurrentUserResponseModel>;

        const tools = DocumentBlueprintTools(userMock as CurrentUserResponseModel);
        expect(tools.map(t => t.name)).toMatchSnapshot();
    });

    it("should have all blueprint tools when user has document type access", () => {
        const userMock = {
            allowedSections: [sections.settings]
        } as Partial<CurrentUserResponseModel>;

        const tools = DocumentBlueprintTools(userMock as CurrentUserResponseModel);
        expect(tools.map(t => t.name)).toMatchSnapshot();
    });
});
