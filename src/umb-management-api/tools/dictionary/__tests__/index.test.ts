import { sections } from "@/helpers/auth/umbraco-auth-policies.js";
import { DictionaryTools } from "../index.js";
import { CurrentUserResponseModel } from "@/umb-management-api/schemas/currentUserResponseModel.js";

describe("dictionary-tool-index", () => {

    it("should only have search tool when user meets no policies", () => {
        const userMock = {
            allowedSections: []
        } as Partial<CurrentUserResponseModel>;

        const tools = DictionaryTools(userMock as CurrentUserResponseModel);
        expect(tools.map(t => t.name)).toMatchSnapshot();
    });

    it("should have additional tools when user meets TreeAccessDictionary policy", () => {
        const userMock = {
            allowedSections: [sections.translation]
        } as Partial<CurrentUserResponseModel>;

        const tools = DictionaryTools(userMock as CurrentUserResponseModel);
        expect(tools.map(t => t.name)).toMatchSnapshot();
    });

    it("should have tree tools when user meets TreeAccessDictionaryOrTemplates policy", () => {
        const userMock = {
            allowedSections: [sections.settings]
        } as Partial<CurrentUserResponseModel>;

        const tools = DictionaryTools(userMock as CurrentUserResponseModel);
        expect(tools.map(t => t.name)).toMatchSnapshot();
    });

    it("should have all tools when user meets multiple policies", () => {
        const userMock = {
            allowedSections: [sections.settings, sections.translation]
        } as Partial<CurrentUserResponseModel>;

        const tools = DictionaryTools(userMock as CurrentUserResponseModel);
        expect(tools.map(t => t.name)).toMatchSnapshot();
    });

});