import { UmbracoManagementClient } from "@umb-management-client";
import { CreateUserRequestModel } from "@/umb-management-api/schemas/index.js";
import { postUserBody } from "@/umb-management-api/umbracoManagementAPI.zod.js";

export class UserBuilder {
  private model: Partial<CreateUserRequestModel> = {
    email: "",
    userName: "",
    name: "",
    userGroupIds: [],
    kind: "Default"
  };
  private id: string | null = null;
  private createdUser: any = null;

  withName(name: string): UserBuilder {
    this.model.name = name;
    return this;
  }

  withUserName(userName: string): UserBuilder {
    this.model.userName = userName;
    return this;
  }

  withEmail(email: string): UserBuilder {
    this.model.email = email;
    return this;
  }

  withUserGroups(groupIds: string[]): UserBuilder {
    this.model.userGroupIds = groupIds.map(id => ({ id }));
    return this;
  }

  withKind(kind: "Default" | "Api"): UserBuilder {
    this.model.kind = kind;
    return this;
  }

  build(): CreateUserRequestModel {
    return postUserBody.parse(this.model);
  }

  async create(): Promise<UserBuilder> {
    const client = UmbracoManagementClient.getClient();

    // Get a default user group to assign to test users if none specified
    if (!this.model.userGroupIds || this.model.userGroupIds.length === 0) {
      try {
        const userGroups = await client.getUserGroup({ skip: 0, take: 1 });
        if (userGroups.items && userGroups.items.length > 0) {
          this.model.userGroupIds = [{ id: userGroups.items[0].id }];
        }
      } catch (error) {
        // If we can't get user groups, use empty array - API will handle validation
        this.model.userGroupIds = [];
      }
    }

    const validatedModel = postUserBody.parse(this.model);
    await client.postUser(validatedModel);

    // Find the created user by email since postUser returns location but not user data
    const users = await client.getUser({ skip: 0, take: 100 });
    const createdUser = users.items?.find(user => user.email === validatedModel.email);
    if (!createdUser) {
      throw new Error(
        `Failed to find created user with email: ${validatedModel.email}`
      );
    }
    this.id = createdUser.id;
    this.createdUser = createdUser;
    return this;
  }

  async verify(): Promise<boolean> {
    if (!this.id) {
      throw new Error("No user has been created yet");
    }
    try {
      const client = UmbracoManagementClient.getClient();
      await client.getUserById(this.id);
      return true;
    } catch (error) {
      return false;
    }
  }

  getId(): string {
    if (!this.id) {
      throw new Error("No user has been created yet");
    }
    return this.id;
  }

  getItem(): any {
    if (!this.createdUser) {
      throw new Error("No user has been created yet");
    }
    return this.createdUser;
  }

  async cleanup(): Promise<void> {
    if (this.id) {
      try {
        const client = UmbracoManagementClient.getClient();
        await client.deleteUserById(this.id);
      } catch (error) {
        console.error("Error cleaning up user:", error);
      }
    }
  }
}