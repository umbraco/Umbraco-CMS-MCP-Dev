import { sections } from "auth/umbraco-auth-policies.js";
import { UserTools } from "../index.js";
import { CurrentUserResponseModel } from "@/umb-management-api/schemas/currentUserResponseModel.js";

describe("user-tool-index", () => {
    it("should only have self-service tools when user has no user section access", () => {
        const userMock = {
            allowedSections: []
        } as Partial<CurrentUserResponseModel>;

        const tools = UserTools(userMock as CurrentUserResponseModel);
        expect(tools.map(t => t.name)).toMatchSnapshot();
    });

    it("should have all tools when user has users section access", () => {
        const userMock = {
            allowedSections: [sections.users]
        } as Partial<CurrentUserResponseModel>;

        const tools = UserTools(userMock as CurrentUserResponseModel);
        expect(tools.map(t => t.name)).toMatchSnapshot();
    });
});