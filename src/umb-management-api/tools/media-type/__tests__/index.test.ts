import { sections } from "@/helpers/auth/umbraco-auth-policies.js";
import { MediaTypeTools } from "../index.js";
import { CurrentUserResponseModel } from "@/umb-management-api/schemas/currentUserResponseModel.js";

describe("media-type-tool-index", () => {
    it("should have no tools by default", () => {
        const userMock = {
            allowedSections: []
        } as Partial<CurrentUserResponseModel>;

        const tools = MediaTypeTools(userMock as CurrentUserResponseModel);
        expect(tools.map(t => t.name)).toMatchSnapshot();
    });

    it("should have management tools when user has media type access", () => {
        const userMock = {
            allowedSections: [sections.settings]
        } as Partial<CurrentUserResponseModel>;

        const tools = MediaTypeTools(userMock as CurrentUserResponseModel);
        expect(tools.map(t => t.name)).toMatchSnapshot();
    });

    it("should have query tools when user has media or media type access", () => {
        const userMock = {
            allowedSections: [sections.media]
        } as Partial<CurrentUserResponseModel>;

        const tools = MediaTypeTools(userMock as CurrentUserResponseModel);
        expect(tools.map(t => t.name)).toMatchSnapshot();
    });

    it("should have all tools when user has all required access", () => {
        const userMock = {
            allowedSections: [sections.media, sections.settings]
        } as Partial<CurrentUserResponseModel>;

        const tools = MediaTypeTools(userMock as CurrentUserResponseModel);
        expect(tools.map(t => t.name)).toMatchSnapshot();
    });
});
