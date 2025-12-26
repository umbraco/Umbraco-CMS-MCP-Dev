import { sections } from "@/helpers/auth/umbraco-auth-policies.js";
import { LanguageTools } from "../index.js";
import { CurrentUserResponseModel } from "@/umb-management-api/schemas/currentUserResponseModel.js";

describe("language-tool-index", () => {
    it("should have basic query tools by default", () => {
        const userMock = {
            allowedSections: []
        } as Partial<CurrentUserResponseModel>;

        const tools = LanguageTools(userMock as CurrentUserResponseModel);
        expect(tools.map(t => t.name)).toMatchSnapshot();
    });

    it("should have all tools when user has language access", () => {
        const userMock = {
            allowedSections: [sections.settings]
        } as Partial<CurrentUserResponseModel>;

        const tools = LanguageTools(userMock as CurrentUserResponseModel);
        expect(tools.map(t => t.name)).toMatchSnapshot();
    });
});
