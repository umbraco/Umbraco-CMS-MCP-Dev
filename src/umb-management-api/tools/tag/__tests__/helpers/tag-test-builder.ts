import { UmbracoManagementClient } from "@umb-management-client";
import { getTagResponse } from "@/umb-management-api/umbracoManagementAPI.zod.js";

export interface TagSearchModel {
  query?: string;
  tagGroup?: string;
}

export class TagTestBuilder {
  private model: Partial<TagSearchModel> = {};

  withQuery(query: string): TagTestBuilder {
    this.model.query = query;
    return this;
  }

  withTagGroup(tagGroup: string): TagTestBuilder {
    this.model.tagGroup = tagGroup;
    return this;
  }

  build(): TagSearchModel {
    return this.model as TagSearchModel;
  }

  async findTag(tagText: string): Promise<any> {
    const client = UmbracoManagementClient.getClient();
    const response = await client.getTag({ query: tagText });
    const result = getTagResponse.parse(response);
    return result.items.find(tag =>
      tag.text?.toLowerCase() === tagText.toLowerCase()
    );
  }

  async searchTags(): Promise<any[]> {
    const model = this.build();
    const client = UmbracoManagementClient.getClient();

    const params: any = {};
    if (model.query) params.query = model.query;
    if (model.tagGroup) params.tagGroup = model.tagGroup;

    const response = await client.getTag(params);
    const result = getTagResponse.parse(response);
    return result.items;
  }
}