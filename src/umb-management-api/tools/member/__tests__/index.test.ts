import { sections } from "@/helpers/auth/umbraco-auth-policies.js";
import { MemberTools } from "../index.js";
import { CurrentUserResponseModel } from "@/umb-management-api/schemas/currentUserResponseModel.js";

describe("member-tool-index", () => {
    it("should only have find member tool when user meets no policies", () => {
        const userMock = {
            allowedSections: []
        } as Partial<CurrentUserResponseModel>;

        const tools = MemberTools(userMock as CurrentUserResponseModel);
        expect(tools.map(t => t.name)).toMatchSnapshot();
    });

    it("should have all tools when user has members section access", () => {
        const userMock = {
            allowedSections: [sections.members]
        } as Partial<CurrentUserResponseModel>;

        const tools = MemberTools(userMock as CurrentUserResponseModel);
        expect(tools.map(t => t.name)).toMatchSnapshot();
    });
});
