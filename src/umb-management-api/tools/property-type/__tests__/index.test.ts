import { sections } from "@/helpers/auth/umbraco-auth-policies.js";
import { PropertyTypeTools } from "../index.js";
import { CurrentUserResponseModel } from "@/umb-management-api/schemas/currentUserResponseModel.js";

describe("property-type-tool-index", () => {
    it("should have property type is used tool by default", () => {
        const userMock = {
            allowedSections: []
        } as Partial<CurrentUserResponseModel>;

        const tools = PropertyTypeTools(userMock as CurrentUserResponseModel);
        expect(tools.map(t => t.name)).toMatchSnapshot();
    });
});
