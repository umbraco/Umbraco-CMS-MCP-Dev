import { sections } from "auth/umbraco-auth-policies.js";
import { DataTypeCollection } from "../index.js";
import { CurrentUserResponseModel } from "@/umb-management-api/schemas/currentUserResponseModel.js";

describe("data-type-tool-index", () => {

    it("should have tools when user meets TreeAccessDocumentsOrMediaOrMembersOrContentTypes policy", () => {
        const userMock = {
            allowedSections: [sections.content]
        } as Partial<CurrentUserResponseModel>;

        const tools = DataTypeCollection.tools(userMock as CurrentUserResponseModel);
        expect(tools.map(t => t.name)).toMatchSnapshot();
    });

    it("should have tools when user meets TreeAccessDataTypes policy", () => {
        const userMock = {
            allowedSections: [sections.settings]
        } as Partial<CurrentUserResponseModel>;

        const tools = DataTypeCollection.tools(userMock as CurrentUserResponseModel);
        expect(tools.map(t => t.name)).toMatchSnapshot();
    });

    it("should have tools when user meets multiple policies", () => {
        const userMock = {
            allowedSections: [sections.content, sections.settings]
        } as Partial<CurrentUserResponseModel>;

        const tools = DataTypeCollection.tools(userMock as CurrentUserResponseModel);
        expect(tools.map(t => t.name)).toMatchSnapshot();
    });

    it("should only have search tool when user meets no policies", () => {
        const userMock = {
            allowedSections: []
        } as Partial<CurrentUserResponseModel>;

        const tools = DataTypeCollection.tools(userMock as CurrentUserResponseModel);
        expect(tools.map(t => t.name)).toMatchSnapshot();
    });

});