# Similar Endpoints for User Management

## Best Match: User Group Collection
- **Similarity**: Extremely high - both are user management entities with identical security requirements
- **Location**: `/src/umb-management-api/tools/user-group/`
- **Copy Strategy**: Use the exact same authorization patterns and tool structure
- **Authorization**: Both require `SectionAccessUsers` permission for administrative operations
- **Patterns**: Same CRUD operations, same permission checking, same organizational structure

## Alternative Matches:

1. **Member Collection**: High similarity for user account management patterns
   - **Location**: `/src/umb-management-api/tools/member/`
   - **Similarity**: User account lifecycle management, validation patterns
   - **Authorization**: Uses `SectionAccessMembers` but similar pattern structure

2. **Dictionary Collection**: Good reference for self-service patterns
   - **Location**: `/src/umb-management-api/tools/dictionary/`
   - **Similarity**: Mixed authorization levels with some tools available to all users
   - **Pattern**: Shows how to layer different permission levels

## Key Files to Copy:

### Tools Structure:
- **Index Pattern**: `/user-group/index.ts` - Authorization wrapper with tool collection
- **CRUD Organization**:
  - `get/` folder for read operations
  - `post/` folder for create operations
  - `put/` folder for update operations
  - `delete/` folder for delete operations

### Testing Infrastructure:
- **Builder Pattern**: `/user-group/__tests__/helpers/user-group-builder.ts`
  - Methods: `withName()`, `withSections()`, `create()`, `verify()`, `cleanup()`
  - Zod validation: `postUserGroupBody.parse()`
  - Error handling and cleanup patterns

- **Test Helper**: `/user-group/__tests__/helpers/user-group-helper.ts`
  - Methods: `verifyUserGroup()`, `findUserGroups()`, `cleanup()`
  - Response parsing with Zod schemas
  - Error handling and bulk cleanup

- **Test Structure**: Individual test files for each operation
  - `create-user-group.test.ts`
  - `delete-user-group.test.ts`
  - `get-user-group.test.ts`
  - `update-user-group.test.ts`

## Authorization Patterns to Copy:

### Primary Pattern (from User Group):
```typescript
if (AuthorizationPolicies.SectionAccessUsers(user)) {
  // Add administrative user management tools
  tools.push(CreateUserTool());
  tools.push(UpdateUserTool());
  tools.push(DeleteUserTool());
}
// Add safe read-only tools outside the permission check
tools.push(GetUserCurrentTool());
```

### Self-Service Pattern (for User-specific operations):
```typescript
// For medium-risk operations requiring self-service + admin override
const isSelfEdit = user.id === targetUserId;
const hasAdminAccess = AuthorizationPolicies.SectionAccessUsers(user);

if (!isSelfEdit && !hasAdminAccess) {
  return { error: "Can only modify your own profile or require admin access" };
}
```

## Implementation Priority:

### Phase 1: Low-Risk Operations (27 endpoints)
- Copy user-group patterns exactly
- Standard `SectionAccessUsers` authorization
- Focus on read operations and configuration

### Phase 2: Medium-Risk Operations (5 endpoints)
- Implement self-service with admin override pattern
- Enhanced validation for avatar uploads and user updates
- Additional safety controls

### Phase 3: Never Implement (21 endpoints)
- Permanently excluded for security reasons
- Document exclusions in tool comments

## Key Differences from User Groups:

1. **Self-Service Requirements**: Users need to access their own data without admin permissions
2. **Enhanced Security**: User operations require more careful permission checking
3. **Data Sensitivity**: User data contains more sensitive information than user groups
4. **Validation Complexity**: User updates require more complex validation rules

## Testing Strategy:

1. **Copy Builder Pattern**: Use user-group builder as template, adapt for user model
2. **Copy Helper Pattern**: Use user-group helper as template, adapt for user operations
3. **Copy Test Structure**: Use same test organization and snapshot patterns
4. **Add Self-Service Tests**: Test both self-service and admin access patterns

This analysis provides a clear roadmap for implementing User endpoints by directly copying and adapting the well-established User Group patterns while adding the necessary self-service capabilities for medium-risk operations.