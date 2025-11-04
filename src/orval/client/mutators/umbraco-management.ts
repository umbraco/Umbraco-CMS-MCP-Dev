import Axios, { AxiosRequestConfig, AxiosResponse } from "axios";
import { UmbracoAxios } from "../umbraco-axios.js";

export interface UmbracoManagementClientOptions extends AxiosRequestConfig {
  returnFullResponse?: boolean;
}

// add a second `options` argument here if you want to pass extra options to each generated query
export const UmbracoManagementClient = <T>(
  config: AxiosRequestConfig,
  options?: UmbracoManagementClientOptions
): Promise<T> => {
  const source = Axios.CancelToken.source();
  const returnFullResponse = options?.returnFullResponse;

  const promise = UmbracoAxios({
    ...config,
    ...options,
    cancelToken: source.token,
  }).then((response: AxiosResponse) => {
    // If returnFullResponse is requested, return the entire response
    // Otherwise return just the data (default behavior)
    return returnFullResponse ? response : response.data;
  });

  // @ts-ignore
  promise.cancel = () => {
    source.cancel("Query was cancelled");
  };

  return promise;
};
