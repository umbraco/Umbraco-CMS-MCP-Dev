import { sections } from "auth/umbraco-auth-policies.js";
import { MemberTools } from "../index.js";
import { CurrentUserResponseModel } from "@/umbraco-api/schemas/currentUserResponseModel.js";

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

    it("registers the Schema-API tool for members-section access", () => {
        const userMock = {
            allowedSections: [sections.members]
        } as Partial<CurrentUserResponseModel>;

        const names = MemberTools(userMock as CurrentUserResponseModel).map(t => t.name);
        expect(names).toContain("get-member-type-schema");
    });
});
