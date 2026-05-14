import { sections } from "auth/umbraco-auth-policies.js";
import { MemberTools } from "../index.js";
import { CurrentUserResponseModel } from "@/umb-management-api/schemas/currentUserResponseModel.js";
import { setUmbracoVersion } from "../../../runtime-context.js";

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

describe("member-tool-index — pre-17.4 fallback", () => {
    beforeAll(() => setUmbracoVersion("17.3.0"));
    afterAll(() => setUmbracoVersion("17.4.0"));

    it("omits the Schema-API tool (no legacy equivalent exists)", () => {
        const userMock = {
            allowedSections: [sections.members]
        } as Partial<CurrentUserResponseModel>;

        const names = MemberTools(userMock as CurrentUserResponseModel).map(t => t.name);
        expect(names).not.toContain("get-member-type-schema");
    });
});
