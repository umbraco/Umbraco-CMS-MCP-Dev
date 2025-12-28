import { sections } from "@/helpers/auth/umbraco-auth-policies.js";
import { MediaTools } from "../index.js";
import { CurrentUserResponseModel } from "@/umb-management-api/schemas/currentUserResponseModel.js";

describe("media-tool-index", () => {
    it("should have basic query tool by default", () => {
        const userMock = {
            allowedSections: []
        } as Partial<CurrentUserResponseModel>;

        const tools = MediaTools(userMock as CurrentUserResponseModel);
        expect(tools.map(t => t.name)).toMatchSnapshot();
    });

    it("should have tree tools when user has media tree access", () => {
        const userMock = {
            allowedSections: [sections.media]
        } as Partial<CurrentUserResponseModel>;

        const tools = MediaTools(userMock as CurrentUserResponseModel);
        expect(tools.map(t => t.name)).toMatchSnapshot();
    });

    it("should have management tools when user has media section access", () => {
        const userMock = {
            allowedSections: [sections.media]
        } as Partial<CurrentUserResponseModel>;

        const tools = MediaTools(userMock as CurrentUserResponseModel);
        expect(tools.map(t => t.name)).toMatchSnapshot();
    });

    it("should have all tools when user has all required access", () => {
        const userMock = {
            allowedSections: [sections.media]
        } as Partial<CurrentUserResponseModel>;

        const tools = MediaTools(userMock as CurrentUserResponseModel);
        expect(tools.map(t => t.name)).toMatchSnapshot();
    });
});
