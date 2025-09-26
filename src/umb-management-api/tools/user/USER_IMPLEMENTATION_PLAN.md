# User Endpoint Implementation Plan

## Overview

This document outlines the complete 4-step implementation plan for User endpoint tools in the Umbraco MCP server, implementing **32 safe endpoints** out of 53 total (21 excluded for security).

## Implementation Strategy

### Template Source: User Group Collection
- **Primary Template**: `/src/umb-management-api/tools/user-group/`
- **Reason**: Nearly identical authorization patterns, same `SectionAccessUsers` permission
- **Pattern**: Copy structure, authorization, and testing patterns directly

### Security Classification:
- **Low Risk**: 27 endpoints - Standard `SectionAccessUsers` authorization
- **Medium Risk**: 5 endpoints - Self-service + admin override pattern
- **High Risk**: 21 endpoints - **PERMANENTLY EXCLUDED**

---

## Step 1: Create MCP Tools

**Agent**: `mcp-tool-creator`
**Template**: User Group tools (`/src/umb-management-api/tools/user-group/`)
**Timeline**: Complete all tools before proceeding to Step 2

### Tool Organization (RESTful by HTTP verb):

#### Phase 1A: Low-Risk GET Operations (7 tools)
```
get/get-user.ts                    # getUser - List users with pagination
get/get-user-by-id.ts             # getUserById - Get user by ID
get/find-user.ts                  # getFilterUser - Search/filter users
get/get-item-user.ts              # getItemUser - Get user items for selection
get/get-user-current.ts           # getUserCurrent - Get current user information
get/get-user-data.ts              # getUserData - Get user data records
get/get-user-data-by-id.ts        # getUserDataById - Get specific user data record
```

#### Phase 1B: Configuration & Permissions (11 tools)
```
get/get-user-configuration.ts                    # ✅ Already implemented
get/get-user-current-configuration.ts            # ✅ Already implemented
get/get-user-current-login-providers.ts          # getUserCurrentLoginProviders
get/get-user-current-permissions.ts              # getUserCurrentPermissions
get/get-user-current-permissions-document.ts     # getUserCurrentPermissionsDocument
get/get-user-current-permissions-media.ts        # getUserCurrentPermissionsMedia
get/get-user-by-id-calculate-start-nodes.ts      # getUserByIdCalculateStartNodes
```

#### Phase 1C: Medium-Risk Operations (5 tools)
```
post/upload-user-avatar-by-id.ts          # postUserAvatarById - Self-service + admin
delete/delete-user-avatar-by-id.ts        # deleteUserAvatarById - Self-service + admin
post/upload-user-current-avatar.ts        # postUserCurrentAvatar - Self-service only
put/update-user-by-id.ts                  # putUserById - Self-service + admin override
post/create-user-data.ts                  # postUserData - Create user data
put/update-user-data.ts                   # putUserData - Update user data
```

### Authorization Patterns:

#### Standard Authorization (27 endpoints):
```typescript
if (AuthorizationPolicies.SectionAccessUsers(user)) {
  // Administrative user management tools
}
// Public/self-service tools outside permission check
```

#### Self-Service with Admin Override (5 endpoints):
```typescript
const isSelfEdit = user.id === targetUserId;
const hasAdminAccess = AuthorizationPolicies.SectionAccessUsers(user);

if (!isSelfEdit && !hasAdminAccess) {
  return { error: "Can only modify your own profile or require admin access" };
}
```

### Tool Collection Structure:
```typescript
// src/umb-management-api/tools/user/index.ts
export const UserCollection: ToolCollectionExport = {
  metadata: {
    name: 'user',
    displayName: 'Users',
    description: 'User account management and administration',
    dependencies: []
  },
  tools: (user: CurrentUserResponseModel) => {
    const tools: ToolDefinition<any>[] = [];

    // Self-service tools (available to all authenticated users)
    tools.push(GetUserCurrentTool());
    tools.push(GetUserCurrentConfigurationTool());
    tools.push(GetUserCurrentLoginProvidersTool());
    tools.push(UploadUserCurrentAvatarTool());

    // Administrative tools (require SectionAccessUsers permission)
    if (AuthorizationPolicies.SectionAccessUsers(user)) {
      tools.push(GetUserTool());
      tools.push(GetUserByIdTool());
      tools.push(FindUserTool());
      tools.push(GetItemUserTool());
      tools.push(UploadUserAvatarByIdTool());
      tools.push(DeleteUserAvatarByIdTool());
      tools.push(UpdateUserByIdTool());
      tools.push(CreateUserDataTool());
      tools.push(UpdateUserDataTool());
      // ... all other administrative tools
    }

    return tools;
  }
};
```

**Deliverable**: 32 TypeScript tool files with proper Zod validation and error handling

---

## Step 2: Create Test Builders and Helpers

**Agent**: `test-builder-helper-creator`
**Template**: User Group builders and helpers
**Timeline**: Complete builders and helpers before Step 3

### Files to Create:

#### Test Builder:
```
__tests__/helpers/user-builder.ts
```

**Pattern**: Copy `/user-group/__tests__/helpers/user-group-builder.ts`

```typescript
export class UserBuilder {
  private model: Partial<CreateUserRequestModel> = {
    // Default user model setup
  };
  private id: string | null = null;

  withName(name: string): UserBuilder;
  withEmail(email: string): UserBuilder;
  withUserGroups(groups: string[]): UserBuilder;
  withLanguages(languages: string[]): UserBuilder;

  async create(): Promise<UserBuilder>;
  async verify(): Promise<boolean>;
  getId(): string;
  async cleanup(): Promise<void>;
}
```

#### Test Helper:
```
__tests__/helpers/user-helper.ts
```

**Pattern**: Copy `/user-group/__tests__/helpers/user-group-helper.ts`

```typescript
export class UserTestHelper {
  static async verifyUser(id: string): Promise<boolean>;
  static async findUsers(name: string);
  static async cleanup(name: string): Promise<void>;
  static normalizeUserIds(result: any): any; // For snapshot testing
}
```

#### Builder Integration Tests:
```
__tests__/helpers/user-builder.test.ts
__tests__/helpers/user-helper.test.ts
```

**Requirements**:
- All builder tests must pass
- All helper tests must pass
- TypeScript compilation must pass
- Test the integration between builders and API

**Deliverable**: 4 TypeScript test infrastructure files with passing tests

---

## Step 3: Verify Infrastructure

**Manual Checkpoint** - All prerequisites must be green before proceeding:

### Requirements Checklist:
- [ ] All 32 MCP tools compile without TypeScript errors
- [ ] Builder tests pass (`user-builder.test.ts`)
- [ ] Helper tests pass (`user-helper.test.ts`)
- [ ] Integration between builders and API verified
- [ ] Zod schema validation working correctly
- [ ] Authorization patterns implemented correctly

**Deliverable**: Verified working infrastructure ready for integration testing

---

## Step 4: Create Integration Tests

**Agent**: `integration-test-creator`
**Template**: User Group integration tests
**Timeline**: Complete comprehensive test suite

### Test Files to Create:

#### CRUD Tests (following Dictionary gold standard):
```
__tests__/get-user.test.ts                           # List users
__tests__/get-user-by-id.test.ts                     # Get specific user
__tests__/find-user.test.ts                          # Search/filter users
__tests__/get-user-current.test.ts                   # Current user info
__tests__/get-user-configuration.test.ts             # ✅ Already exists
__tests__/get-user-current-configuration.test.ts     # ✅ Already exists
__tests__/upload-user-avatar.test.ts                 # Avatar management
__tests__/update-user.test.ts                        # User updates
__tests__/user-data-management.test.ts               # User data CRUD
```

### Test Patterns:

#### Standard Test Structure:
```typescript
describe("get-user", () => {
  beforeEach(() => {
    console.error = jest.fn();
  });

  afterEach(async () => {
    // Cleanup using UserTestHelper
  });

  it("should list users", async () => {
    // Arrange: Use UserBuilder to create test data
    // Act: Call tool handler
    // Assert: Use snapshot testing with createSnapshotResult()
  });
});
```

#### Self-Service Test Pattern:
```typescript
describe("upload-user-current-avatar", () => {
  it("should allow user to update own avatar", async () => {
    // Test self-service functionality
  });

  it("should prevent user from updating others' avatars", async () => {
    // Test security restrictions
  });
});

describe("update-user-by-id", () => {
  it("should allow admin to update any user", async () => {
    // Test admin override functionality
  });

  it("should allow user to update own profile", async () => {
    // Test self-service functionality
  });

  it("should prevent non-admin from updating others", async () => {
    // Test security restrictions
  });
});
```

### Testing Standards:
- **Arrange-Act-Assert** pattern
- **Snapshot testing** with `createSnapshotResult()` helper
- **Proper cleanup** using builders and helpers
- **Constants** for entity names (no magic strings)
- **Security testing** for self-service vs admin access patterns

**Deliverable**: Complete integration test suite with proper cleanup and validation

---

## Security Implementation Details

### Excluded Endpoints (21 total):
```typescript
// NEVER implement these endpoints - security risks:
// User CRUD: postUser, deleteUser, deleteUserById
// Password: postUserByIdChangePassword, postUserByIdResetPassword, postUserCurrentChangePassword
// API Keys: postUserByIdClientCredentials, getUserByIdClientCredentials, deleteUserByIdClientCredentialsByClientId
// 2FA: getUserById2fa, deleteUserById2faByProviderName, etc.
// Invitations: postUserInvite, postUserInviteCreatePassword, etc.
// State: postUserDisable, postUserEnable, postUserUnlock
```

### Self-Service Controls:
```typescript
// For avatar and profile updates
const isSelfEdit = user.id === targetUserId;
const hasAdminAccess = AuthorizationPolicies.SectionAccessUsers(user);

if (!isSelfEdit && !hasAdminAccess) {
  return {
    content: [{
      type: "text",
      text: JSON.stringify({ error: "Can only modify your own profile or require admin access" })
    }],
    isError: true
  };
}
```

---

## Success Criteria

### Coverage Goals:
- **32/32 safe endpoints implemented** (100% of implementable endpoints)
- **21 high-risk endpoints permanently excluded** (documented security decision)
- **Comprehensive test coverage** following Dictionary gold standard
- **Consistent authorization patterns** matching User Group implementation

### Quality Standards:
- TypeScript compilation without errors
- All tests passing with proper cleanup
- Snapshot testing with normalization
- Security controls verified through testing
- Documentation of security exclusions

### File Structure:
```
src/umb-management-api/tools/user/
├── index.ts                                    # Tool collection with authorization
├── get/                                        # Read operations
│   ├── get-user.ts
│   ├── get-user-by-id.ts
│   ├── find-user.ts
│   └── ...
├── post/                                       # Create operations
│   ├── upload-user-avatar-by-id.ts
│   ├── upload-user-current-avatar.ts
│   └── create-user-data.ts
├── put/                                        # Update operations
│   ├── update-user-by-id.ts
│   └── update-user-data.ts
├── delete/                                     # Delete operations
│   └── delete-user-avatar-by-id.ts
└── __tests__/                                  # Testing infrastructure
    ├── helpers/
    │   ├── user-builder.ts
    │   ├── user-builder.test.ts
    │   ├── user-helper.ts
    │   └── user-helper.test.ts
    ├── get-user.test.ts
    ├── find-user.test.ts
    ├── update-user.test.ts
    └── ...
```

This implementation plan provides a complete roadmap for safely implementing User endpoint tools while following established patterns and maintaining the project's high security and testing standards.