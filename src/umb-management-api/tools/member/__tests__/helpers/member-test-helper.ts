import { UmbracoManagementClient } from "@umb-management-client";

export class MemberTestHelper {
  static async findMember(username: string): Promise<any> {
    const client = UmbracoManagementClient.getClient();
    const response = await client.getFilterMember({ filter: username });
    return response.items.find((item: any) => item.username === username);
  }

  static async cleanup(username: string): Promise<void> {
    // Small delay to avoid database lock contention
    await new Promise(resolve => setTimeout(resolve, 100));

    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const member = await this.findMember(username);
        if (!member) return;

        const client = UmbracoManagementClient.getClient();
        await client.deleteMemberById(member.id);
        return; // Success
      } catch (error) {
        const isDeadlock = String(error).toLowerCase().includes('deadlock');
        if (isDeadlock && attempt === 0) {
          await new Promise(resolve => setTimeout(resolve, 2000));
        } else {
          return; // Give up
        }
      }
    }
  }

  static normalize(member: any): any {
    const normalized = this.normaliseIds(member);
    normalized.createDate = "<normalized>";
    normalized.updateDate = "<normalized>";
    normalized.variants?.forEach((variant: any) => {
      variant.createDate = "<normalized>";
      variant.updateDate = "<normalized>";
    });
    return normalized;
  }

  static normaliseIds(member: any): any {
    if (!member) return member;

    const normalized = { ...member };

    // Normalize member ID
    if (normalized.id) {
      normalized.id = "normalized-id";
    }

    // Normalize member type ID
    if (normalized.memberType?.id) {
      normalized.memberType.id = "normalized-member-type-id";
    }

    // Normalize group IDs
    if (normalized.groups) {
      normalized.groups = normalized.groups.map(() => "normalized-group-id");
    }

    return normalized;
  }
}
