import { sections } from "@/helpers/auth/umbraco-auth-policies.js";
import { MemberGroupTools } from "../index.js";
import { CurrentUserResponseModel } from "@/umb-management-api/schemas/currentUserResponseModel.js";

describe("member-group-tool-index", () => {
    it("should have basic tools by default", () => {
        const userMock = {
            allowedSections: []
        } as Partial<CurrentUserResponseModel>;

        const tools = MemberGroupTools(userMock as CurrentUserResponseModel);
        expect(tools.map(t => t.name)).toMatchSnapshot();
    });

    it("should have CRUD tools when user has members section access", () => {
        const userMock = {
            allowedSections: [sections.members]
        } as Partial<CurrentUserResponseModel>;

        const tools = MemberGroupTools(userMock as CurrentUserResponseModel);
        expect(tools.map(t => t.name)).toMatchSnapshot();
    });

    it("should have tree tools when user has member groups access", () => {
        const userMock = {
            allowedSections: [sections.settings]
        } as Partial<CurrentUserResponseModel>;

        const tools = MemberGroupTools(userMock as CurrentUserResponseModel);
        expect(tools.map(t => t.name)).toMatchSnapshot();
    });

    it("should have all tools when user has both accesses", () => {
        const userMock = {
            allowedSections: [sections.members, sections.settings]
        } as Partial<CurrentUserResponseModel>;

        const tools = MemberGroupTools(userMock as CurrentUserResponseModel);
        expect(tools.map(t => t.name)).toMatchSnapshot();
    });
});
