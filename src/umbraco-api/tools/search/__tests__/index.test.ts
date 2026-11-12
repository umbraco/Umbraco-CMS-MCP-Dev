import { AdminGroupKeyString, sections } from "auth/umbraco-auth-policies.js";
import { SearchTools } from "../index.js";
import { CurrentUserResponseModel } from "@/umbraco-api/schemas/currentUserResponseModel.js";

describe("search-tool-index", () => {
  it("should have no tools when user has no permissions", () => {
    const userMock = {
      allowedSections: [],
      userGroupIds: [],
    } as Partial<CurrentUserResponseModel>;

    const tools = SearchTools(userMock as CurrentUserResponseModel);
    expect(tools.map(t => t.name)).toMatchSnapshot();
  });

  it("should have index tools but not search when user has settings access only", () => {
    const userMock = {
      allowedSections: [sections.settings],
      userGroupIds: [],
    } as Partial<CurrentUserResponseModel>;

    const tools = SearchTools(userMock as CurrentUserResponseModel);
    expect(tools.map(t => t.name)).toMatchSnapshot();
  });

  it("should have all tools when user has settings access and is an admin", () => {
    const userMock = {
      allowedSections: [sections.settings],
      userGroupIds: [{ id: AdminGroupKeyString }],
    } as Partial<CurrentUserResponseModel>;

    const tools = SearchTools(userMock as CurrentUserResponseModel);
    expect(tools.map(t => t.name)).toMatchSnapshot();
  });
});
