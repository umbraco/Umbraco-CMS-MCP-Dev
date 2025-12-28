import { sections } from "@/helpers/auth/umbraco-auth-policies.js";
import { HealthCollection } from "../index.js";
import { CurrentUserResponseModel } from "@/umb-management-api/schemas/currentUserResponseModel.js";

describe("health-collection", () => {

    it("should have empty tools when user has no settings access", () => {
        const userMock = {
            allowedSections: []
        } as Partial<CurrentUserResponseModel>;

        const tools = HealthCollection.tools(userMock as CurrentUserResponseModel);
        expect(tools.map(t => t.name)).toMatchSnapshot();
    });

    it("should have health check tools when user has settings access", () => {
        const userMock = {
            allowedSections: [sections.settings]
        } as Partial<CurrentUserResponseModel>;

        const tools = HealthCollection.tools(userMock as CurrentUserResponseModel);
        expect(tools.map(t => t.name)).toMatchSnapshot();
    });

    it("should have correct collection metadata", () => {
        expect(HealthCollection.metadata).toMatchSnapshot();
    });

});