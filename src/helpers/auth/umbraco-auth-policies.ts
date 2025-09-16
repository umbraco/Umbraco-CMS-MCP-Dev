import { CurrentUserResponseModel } from "@/umb-management-api/schemas/index.js"

// matches hardcoded value in Umbraco source code
export const AdminGroupKeyString = "E5E7F6C8-7F9C-4B5B-8D5D-9E1E5A4F7E4D";

export const sections = {
    content: "Umb.Section.Content",
    forms: "Umb.Section.Forms",
    media: "Umb.Section.Media",
    members: "Umb.Section.Members",
    packages: "Umb.Section.Packages",
    settings: "Umb.Section.Settings",
    translation: "Umb.Section.Translation",
    users: "Umb.Section.Users"
}

export const AuthorizationPolicies = {
    RequireAdminAccess: (user: CurrentUserResponseModel) =>
        user.userGroupIds.some((groupId) => groupId.id.toUpperCase() === AdminGroupKeyString),

    SectionAccessContent: (user: CurrentUserResponseModel) =>
        user.allowedSections.some((section) => section === sections.content),

    SectionAccessContentOrMedia: (user: CurrentUserResponseModel) =>
        user.allowedSections.some((section) => section === sections.content
            || section === sections.media),

    SectionAccessForContentTree: (user: CurrentUserResponseModel) =>
        user.allowedSections.some((section) => section === sections.content
            || section === sections.media
            || section === sections.users
            || section === sections.settings
            || section === sections.packages
            || section === sections.members),

    SectionAccessForMediaTree: (user: CurrentUserResponseModel) =>
        user.allowedSections.some((section) => section === sections.content
            || section === sections.media
            || section === sections.users
            || section === sections.settings
            || section === sections.packages
            || section === sections.members),

    SectionAccessForMemberTree: (user: CurrentUserResponseModel) =>
        user.allowedSections.some((section) => section === sections.content
            || section === sections.media
            || section === sections.members),

    SectionAccessMedia: (user: CurrentUserResponseModel) =>
        user.allowedSections.some((section) => section === sections.media),

    SectionAccessMembers: (user: CurrentUserResponseModel) =>
        user.allowedSections.some((section) => section === sections.members),

    SectionAccessPackages: (user: CurrentUserResponseModel) =>
        user.allowedSections.some((section) => section === sections.packages),

    SectionAccessSettings: (user: CurrentUserResponseModel) =>
        user.allowedSections.some((section) => section === sections.settings),

    SectionAccessUsers: (user: CurrentUserResponseModel) =>
        user.allowedSections.some((section) => section === sections.users),

    TreeAccessDataTypes: (user: CurrentUserResponseModel) =>
        user.allowedSections.some((section) => section === sections.settings),

    TreeAccessDictionary: (user: CurrentUserResponseModel) =>
        user.allowedSections.some((section) => section === sections.translation),

    TreeAccessDictionaryOrTemplates: (user: CurrentUserResponseModel) =>
        user.allowedSections.some((section) => section === sections.translation
            || section === sections.settings),

    TreeAccessDocuments: (user: CurrentUserResponseModel) =>
        user.allowedSections.some((section) => section === sections.content),

    TreeAccessDocumentsOrDocumentTypes: (user: CurrentUserResponseModel) =>
        user.allowedSections.some((section) => section === sections.content
            || section === sections.settings),

    TreeAccessDocumentOrMediaOrContentTypes: (user: CurrentUserResponseModel) =>
        user.allowedSections.some((section) => section === sections.content
            || section === sections.settings
            || section === sections.media),

    TreeAccessDocumentsOrMediaOrMembersOrContentTypes: (user: CurrentUserResponseModel) =>
        user.allowedSections.some((section) => section === sections.content
            || section === sections.settings
            || section === sections.media
            || section === sections.members),

    TreeAccessDocumentTypes: (user: CurrentUserResponseModel) =>
        user.allowedSections.some((section) => section === sections.settings),

    TreeAccessLanguages: (user: CurrentUserResponseModel) =>
        user.allowedSections.some((section) => section === sections.settings),

    TreeAccessMediaTypes: (user: CurrentUserResponseModel) =>
        user.allowedSections.some((section) => section === sections.settings),

    TreeAccessMediaOrMediaTypes: (user: CurrentUserResponseModel) =>
        user.allowedSections.some((section) => section === sections.media
            || section === sections.settings),

    TreeAccessMemberGroups: (user: CurrentUserResponseModel) =>
        user.allowedSections.some((section) => section === sections.members),

    TreeAccessMemberTypes: (user: CurrentUserResponseModel) =>
        user.allowedSections.some((section) => section === sections.settings),

    TreeAccessMembersOrMemberTypes: (user: CurrentUserResponseModel) =>
        user.allowedSections.some((section) => section === sections.settings
            || section === sections.members),

    TreeAccessPartialViews: (user: CurrentUserResponseModel) =>
        user.allowedSections.some((section) => section === sections.settings),

    TreeAccessRelationTypes: (user: CurrentUserResponseModel) =>
        user.allowedSections.some((section) => section === sections.settings),

    TreeAccessScripts: (user: CurrentUserResponseModel) =>
        user.allowedSections.some((section) => section === sections.settings),

    TreeAccessStylesheets: (user: CurrentUserResponseModel) =>
        user.allowedSections.some((section) => section === sections.settings),

    TreeAccessStylesheetsOrDocumentOrMediaOrMember: (user: CurrentUserResponseModel) =>
        user.allowedSections.some((section) => section === sections.settings
            || section === sections.content
            || section === sections.media
            || section === sections.members),

    TreeAccessTemplates: (user: CurrentUserResponseModel) =>
        user.allowedSections.some((section) => section === sections.settings
            || section === sections.content),
    TreeAccessWebhooks: (user: CurrentUserResponseModel) =>
        user.allowedSections.some((section) => section === sections.settings),
};