import { sections } from "@/helpers/auth/umbraco-auth-policies.js";
import { ImagingTools } from "../index.js";
import { CurrentUserResponseModel } from "@/umb-management-api/schemas/currentUserResponseModel.js";

describe("imaging-tool-index", () => {
    it("should have tools when user has no permissions", () => {
        const userMock = {
            allowedSections: []
        } as Partial<CurrentUserResponseModel>;

        const tools = ImagingTools(userMock as CurrentUserResponseModel);
        expect(tools.map(t => t.name)).toMatchSnapshot();
    });

    it("should have tools when user has settings section access", () => {
        const userMock = {
            allowedSections: [sections.content, sections.media]
        } as Partial<CurrentUserResponseModel>;

        const tools = ImagingTools(userMock as CurrentUserResponseModel);
        expect(tools.map(t => t.name)).toMatchSnapshot();
    });
});