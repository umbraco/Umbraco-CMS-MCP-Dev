import { sections } from "@/helpers/umbraco-auth-policies.js";
import { CultureTools } from "../index.js";
import { CurrentUserResponseModel } from "@/umb-management-api/schemas/currentUserResponseModel.js";

describe("culture-tool-index", () => {
    it("should have basic query tools by default", () => {
        const userMock = {
            allowedSections: []
        } as Partial<CurrentUserResponseModel>;

        const tools = CultureTools(userMock as CurrentUserResponseModel);
        expect(tools.map(t => t.name)).toMatchSnapshot();
    });

    it("should have all tools when user has settings access", () => {
        const userMock = {
            allowedSections: [sections.settings]
        } as Partial<CurrentUserResponseModel>;

        const tools = CultureTools(userMock as CurrentUserResponseModel);
        expect(tools.map(t => t.name)).toMatchSnapshot();
    });
});
