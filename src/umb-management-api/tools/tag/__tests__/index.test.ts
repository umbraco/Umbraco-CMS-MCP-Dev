import { sections } from "@/helpers/auth/umbraco-auth-policies.js";
import { TagCollection } from "../index.js";
import { CurrentUserResponseModel } from "@/umb-management-api/schemas/currentUserResponseModel.js";

describe("tag-tool-index", () => {

    it("should only have get-tags tool when user meets no policies", () => {
        const userMock = {
            allowedSections: []
        } as Partial<CurrentUserResponseModel>;

        const tools = TagCollection.tools(userMock as CurrentUserResponseModel);
        expect(tools.map(t => t.name)).toMatchSnapshot();
    });

    it("should have get-tags tool when user meets settings section policy", () => {
        const userMock = {
            allowedSections: [sections.settings]
        } as Partial<CurrentUserResponseModel>;

        const tools = TagCollection.tools(userMock as CurrentUserResponseModel);
        expect(tools.map(t => t.name)).toMatchSnapshot();
    });

    it("should have get-tags tool when user meets content section policy", () => {
        const userMock = {
            allowedSections: [sections.content]
        } as Partial<CurrentUserResponseModel>;

        const tools = TagCollection.tools(userMock as CurrentUserResponseModel);
        expect(tools.map(t => t.name)).toMatchSnapshot();
    });

    it("should have get-tags tool when user meets multiple policies", () => {
        const userMock = {
            allowedSections: [sections.settings, sections.content, sections.translation]
        } as Partial<CurrentUserResponseModel>;

        const tools = TagCollection.tools(userMock as CurrentUserResponseModel);
        expect(tools.map(t => t.name)).toMatchSnapshot();
    });

});