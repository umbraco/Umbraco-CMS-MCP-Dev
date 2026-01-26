import {
  PostTemporaryFileBody,
  TemporaryFileResponseModel,
  TemporaryFileConfigurationResponseModel,
} from "./schemas/index.js";
import { UmbracoManagementClient } from "@umbraco-cms/mcp-server-sdk";
import FormData from "form-data";

type SecondParameter<T extends (...args: never) => unknown> = Parameters<T>[1];

export const getTemporaryFileAPI = () => ({
  postTemporaryFile: (
    postTemporaryFileBody: PostTemporaryFileBody,
    options?: SecondParameter<typeof UmbracoManagementClient>
  ) => {
    const formData = new FormData();
    formData.append("Id", postTemporaryFileBody.Id);
    formData.append("File", postTemporaryFileBody.File);

    const headers = {
      ...formData.getHeaders(),
      ...options?.headers,
    };

    return UmbracoManagementClient<void>(
      {
        url: `/umbraco/management/api/v1/temporary-file`,
        method: "POST",
        headers: headers,
        data: formData,
      },
      options
    );
  },
  getTemporaryFileById: (
    id: string,
    options?: SecondParameter<typeof UmbracoManagementClient>
  ) => {
    return UmbracoManagementClient<TemporaryFileResponseModel>(
      { url: `/umbraco/management/api/v1/temporary-file/${id}`, method: "GET" },
      options
    );
  },

  deleteTemporaryFileById: (
    id: string,
    options?: SecondParameter<typeof UmbracoManagementClient>
  ) => {
    return UmbracoManagementClient<void>(
      {
        url: `/umbraco/management/api/v1/temporary-file/${id}`,
        method: "DELETE",
      },
      options
    );
  },

  getTemporaryFileConfiguration: (
    options?: SecondParameter<typeof UmbracoManagementClient>
  ) => {
    return UmbracoManagementClient<TemporaryFileConfigurationResponseModel>(
      {
        url: `/umbraco/management/api/v1/temporary-file/configuration`,
        method: "GET",
      },
      options
    );
  },
});
