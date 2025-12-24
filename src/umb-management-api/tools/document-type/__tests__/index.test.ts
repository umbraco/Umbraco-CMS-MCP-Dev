import { sections } from "@/helpers/auth/umbraco-auth-policies.js";
import { DocumentTypeTools } from "../index.js";
import { CurrentUserResponseModel } from "@/umb-management-api/schemas/currentUserResponseModel.js";

describe("document-type-tool-index", () => {
    it("should have basic query tool by default", () => {
        const userMock = {
            allowedSections: []
        } as Partial<CurrentUserResponseModel>;

        const tools = DocumentTypeTools(userMock as CurrentUserResponseModel);
        expect(tools.map(t => t.name)).toMatchSnapshot();
    });

    it("should have configuration tools when user has documents or document types access", () => {
        const userMock = {
            allowedSections: [sections.content]
        } as Partial<CurrentUserResponseModel>;

        const tools = DocumentTypeTools(userMock as CurrentUserResponseModel);
        expect(tools.map(t => t.name)).toMatchSnapshot();
    });

    it("should have all management tools when user has document types access", () => {
        const userMock = {
            allowedSections: [sections.settings]
        } as Partial<CurrentUserResponseModel>;

        const tools = DocumentTypeTools(userMock as CurrentUserResponseModel);
        expect(tools.map(t => t.name)).toMatchSnapshot();
    });

    it("should have all tools when user has all required access", () => {
        const userMock = {
            allowedSections: [sections.content, sections.settings]
        } as Partial<CurrentUserResponseModel>;

        const tools = DocumentTypeTools(userMock as CurrentUserResponseModel);
        expect(tools.map(t => t.name)).toMatchSnapshot();
    });
});
