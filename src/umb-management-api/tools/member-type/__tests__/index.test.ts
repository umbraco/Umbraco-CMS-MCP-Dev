import { sections } from "@/helpers/auth/umbraco-auth-policies.js";
import { MemberTypeTools } from "../index.js";
import { CurrentUserResponseModel } from "@/umb-management-api/schemas/currentUserResponseModel.js";

describe("member-type-tool-index", () => {
    it("should have basic tools by default", () => {
        const userMock = {
            allowedSections: []
        } as Partial<CurrentUserResponseModel>;

        const tools = MemberTypeTools(userMock as CurrentUserResponseModel);
        expect(tools.map(t => t.name)).toMatchSnapshot();
    });

    it("should have all tools when user has member type access", () => {
        const userMock = {
            allowedSections: [sections.members]
        } as Partial<CurrentUserResponseModel>;

        const tools = MemberTypeTools(userMock as CurrentUserResponseModel);
        expect(tools.map(t => t.name)).toMatchSnapshot();
    });
});