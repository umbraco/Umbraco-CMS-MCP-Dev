import { AdminGroupKeyString } from "auth/umbraco-auth-policies.js";
import { ServerTools } from "../index.js";
import { CurrentUserResponseModel } from "@/umb-management-api/schemas/currentUserResponseModel.js";

describe("server-tool-index", () => {
    it("should have basic tools when user is not admin", () => {
        const userMock = {
            allowedSections: [],
            userGroupIds: []
        } as Partial<CurrentUserResponseModel>;

        const tools = ServerTools(userMock as CurrentUserResponseModel);
        expect(tools.map(t => t.name)).toMatchSnapshot();
    });

    it("should have all tools when user is admin", () => {
        const userMock = {
            allowedSections: [],
            userGroupIds: [{ id: AdminGroupKeyString.toLowerCase() }]
        } as Partial<CurrentUserResponseModel>;

        const tools = ServerTools(userMock as CurrentUserResponseModel);
        expect(tools.map(t => t.name)).toMatchSnapshot();
    });
});
