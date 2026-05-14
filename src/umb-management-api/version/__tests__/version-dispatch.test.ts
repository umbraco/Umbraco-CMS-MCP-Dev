import { describe, it, expect, beforeEach, jest } from "@jest/globals";
import { withVersionDispatch } from "../version-dispatch.js";
import {
  setUmbracoVersion,
  resetUmbracoVersion,
} from "../umbraco-version.js";

describe("withVersionDispatch", () => {
  beforeEach(() => {
    resetUmbracoVersion();
  });

  it("calls the pre174 handler when version is unknown (forward-default to fixture)", async () => {
    const pre174 = jest.fn(async () => "pre");
    const post174 = jest.fn(async () => "post");
    const handler = withVersionDispatch({ pre174, post174 });

    const result = await handler({ foo: "bar" });

    expect(result).toBe("pre");
    expect(pre174).toHaveBeenCalledWith({ foo: "bar" });
    expect(post174).not.toHaveBeenCalled();
  });

  it("calls the pre174 handler when version is below 17.4", async () => {
    setUmbracoVersion("17.3.5");
    const pre174 = jest.fn(async () => "pre");
    const post174 = jest.fn(async () => "post");
    const handler = withVersionDispatch({ pre174, post174 });

    const result = await handler({});

    expect(result).toBe("pre");
    expect(post174).not.toHaveBeenCalled();
  });

  it("calls the post174 handler when version is 17.4", async () => {
    setUmbracoVersion("17.4.0");
    const pre174 = jest.fn(async () => "pre");
    const post174 = jest.fn(async () => "post");
    const handler = withVersionDispatch({ pre174, post174 });

    const result = await handler({});

    expect(result).toBe("post");
    expect(pre174).not.toHaveBeenCalled();
  });

  it("calls the post174 handler when version is newer than 17.4", async () => {
    setUmbracoVersion("18.0.0");
    const pre174 = jest.fn(async () => "pre");
    const post174 = jest.fn(async () => "post");
    const handler = withVersionDispatch({ pre174, post174 });

    const result = await handler({});

    expect(result).toBe("post");
  });

  it("accepts sync handlers and awaits them", async () => {
    setUmbracoVersion("17.4.0");
    const handler = withVersionDispatch({
      pre174: () => "pre" as const,
      post174: () => "post" as const,
    });

    await expect(handler({})).resolves.toBe("post");
  });

  it("forwards arguments to whichever handler runs", async () => {
    setUmbracoVersion("17.4.0");
    const post174 = jest.fn(async (input: { id: string }) => input.id);
    const handler = withVersionDispatch({
      pre174: async () => "should not run",
      post174,
    });

    const result = await handler({ id: "abc" });

    expect(result).toBe("abc");
    expect(post174).toHaveBeenCalledWith({ id: "abc" });
  });
});
