import { BLANK_UUID } from "@/constants/constants.js";
import { CallToolResult } from "@modelcontextprotocol/sdk/types.js";

export function createSnapshotResult(result: any, idToReplace?: string) {
  if (!result?.content) {
    return result;
  }

  function normalizeItem(i: any) {
    const item = { ...i, id: BLANK_UUID };
    if (item.parent) {
      item.parent = { ...item.parent, id: BLANK_UUID };
      // Normalize parent path as well
      if (item.parent.path && typeof item.parent.path === "string") {
        item.parent.path = item.parent.path.replace(/_\d{13}(?=_|\.js$|\/|$)/g, "_NORMALIZED_TIMESTAMP");
      }
    }
    // Normalize document reference in document versions
    if (item.document) {
      item.document = { ...item.document, id: BLANK_UUID };
    }
    // Normalize documentType reference
    if (item.documentType) {
      item.documentType = { ...item.documentType, id: BLANK_UUID };
    }
    // Normalize mediaType reference
    if (item.mediaType) {
      item.mediaType = { ...item.mediaType, id: BLANK_UUID };
    }
    // Normalize user reference
    if (item.user) {
      item.user = { ...item.user, id: BLANK_UUID };
    }
    if (item.ancestors && Array.isArray(item.ancestors)) {
      item.ancestors = item.ancestors.map((ancestor: any) => ({
        ...ancestor,
        id: BLANK_UUID
      }));
    }
    if (item.createDate) {
      item.createDate = "NORMALIZED_DATE";
    }
    if (item.publishDate) {
      item.publishDate = "NORMALIZED_DATE";
    }
    if (item.updateDate) {
      item.updateDate = "NORMALIZED_DATE";
    }
    if (item.versionDate) {
      item.versionDate = "NORMALIZED_DATE";
    }
    if (item.lastLoginDate) {
      item.lastLoginDate = "NORMALIZED_DATE";
    }
    if (item.lastPasswordChangeDate) {
      item.lastPasswordChangeDate = "NORMALIZED_DATE";
    }
    if (item.lastLockoutDate) {
      item.lastLockoutDate = "NORMALIZED_DATE";
    }
    // Normalize variants array if present
    if (item.variants && Array.isArray(item.variants)) {
      item.variants = item.variants.map((variant: any) => {
        const normalizedVariant = { ...variant };
        if (normalizedVariant.createDate) normalizedVariant.createDate = "NORMALIZED_DATE";
        if (normalizedVariant.publishDate) normalizedVariant.publishDate = "NORMALIZED_DATE";
        if (normalizedVariant.updateDate) normalizedVariant.updateDate = "NORMALIZED_DATE";
        if (normalizedVariant.versionDate) normalizedVariant.versionDate = "NORMALIZED_DATE";
        return normalizedVariant;
      });
    }
    // Normalize test names that contain timestamps
    if (item.name && typeof item.name === "string") {
      item.name = item.name.replace(/_\d{13}(?=_|\.js$|$)/, "_NORMALIZED_TIMESTAMP");
    }
    if (item.path && typeof item.path === "string") {
      item.path = item.path.replace(/_\d{13}(?=_|\.js$|\/|$)/g, "_NORMALIZED_TIMESTAMP");
    }
    // Normalize email addresses with random numbers
    if (item.email && typeof item.email === "string") {
      item.email = item.email.replace(/-\d+@/, "-NORMALIZED@");
    }
    if (item.userName && typeof item.userName === "string") {
      item.userName = item.userName.replace(/-\d+@/, "-NORMALIZED@");
    }
    // Normalize avatar URLs that contain dynamic file hashes
    if (item.avatarUrls && Array.isArray(item.avatarUrls)) {
      item.avatarUrls = item.avatarUrls.map((url: string) =>
        url.replace(/\/[a-f0-9]{40}\.jpg/, "/NORMALIZED_AVATAR.jpg")
      );
    }
    // Normalize media URLs that contain dynamic path segments
    if (item.urlInfos && Array.isArray(item.urlInfos)) {
      item.urlInfos = item.urlInfos.map((urlInfo: any) => ({
        ...urlInfo,
        url: urlInfo.url ? urlInfo.url.replace(/\/media\/[a-z0-9]+\//i, "/media/NORMALIZED_PATH/") : urlInfo.url
      }));
    }
    return item;
  }

  return {
    ...result,
    content: result.content.map((item: any) => {
      if (item.type === "text") {
        if (idToReplace) {
          // For single item responses
          let text = item.text.replace(idToReplace, BLANK_UUID);
          try {
            const parsed = JSON.parse(text);
            if (parsed.createDate) {
              parsed.createDate = "NORMALIZED_DATE";
            }
            if (parsed.availableUntil) {
              parsed.availableUntil = "NORMALIZED_DATE";
            }
            if (parsed.publishDate) {
              parsed.publishDate = "NORMALIZED_DATE";
            }
            if (parsed.updateDate) {
              parsed.updateDate = "NORMALIZED_DATE";
            }
            if (parsed.versionDate) {
              parsed.versionDate = "NORMALIZED_DATE";
            }
            if (parsed.lastLoginDate) {
              parsed.lastLoginDate = "NORMALIZED_DATE";
            }
            if (parsed.lastPasswordChangeDate) {
              parsed.lastPasswordChangeDate = "NORMALIZED_DATE";
            }
            if (parsed.lastLockoutDate) {
              parsed.lastLockoutDate = "NORMALIZED_DATE";
            }
            // Normalize email addresses with random numbers
            if (parsed.email && typeof parsed.email === "string") {
              parsed.email = parsed.email.replace(/-\d+@/, "-NORMALIZED@");
            }
            if (parsed.userName && typeof parsed.userName === "string") {
              parsed.userName = parsed.userName.replace(/-\d+@/, "-NORMALIZED@");
            }
            // Normalize avatar URLs that contain dynamic file hashes
            if (parsed.avatarUrls && Array.isArray(parsed.avatarUrls)) {
              parsed.avatarUrls = parsed.avatarUrls.map((url: string) =>
                url.replace(/\/[a-f0-9]{40}\.jpg/, "/NORMALIZED_AVATAR.jpg")
              );
            }
            // Normalize media URLs that contain dynamic path segments
            if (parsed.urlInfos && Array.isArray(parsed.urlInfos)) {
              parsed.urlInfos = parsed.urlInfos.map((urlInfo: any) => ({
                ...urlInfo,
                url: urlInfo.url ? urlInfo.url.replace(/\/media\/[a-z0-9]+\//i, "/media/NORMALIZED_PATH/") : urlInfo.url
              }));
            }
            // Normalize block update results
            if (parsed.results && Array.isArray(parsed.results)) {
              parsed.results = parsed.results.map((r: any) => ({
                ...r,
                contentKey: r.contentKey ? BLANK_UUID : undefined
              }));
            }
            // Normalize availableBlocks
            if (parsed.availableBlocks && Array.isArray(parsed.availableBlocks)) {
              parsed.availableBlocks = parsed.availableBlocks.map((b: any) => ({
                ...b,
                key: BLANK_UUID
              }));
            }
            // Normalize document version references
            if (parsed.document) {
              parsed.document = { ...parsed.document, id: BLANK_UUID };
              // Normalize nested variants in document
              if (parsed.document.variants && Array.isArray(parsed.document.variants)) {
                parsed.document.variants = parsed.document.variants.map((variant: any) => {
                  if (variant.createDate) variant.createDate = "NORMALIZED_DATE";
                  if (variant.publishDate) variant.publishDate = "NORMALIZED_DATE";
                  if (variant.updateDate) variant.updateDate = "NORMALIZED_DATE";
                  if (variant.versionDate) variant.versionDate = "NORMALIZED_DATE";
                  return variant;
                });
              }
              // Normalize documentType within document
              if (parsed.document.documentType) {
                parsed.document.documentType = { ...parsed.document.documentType, id: BLANK_UUID };
              }
            }
            if (parsed.documentType) {
              parsed.documentType = { ...parsed.documentType, id: BLANK_UUID };
            }
            if (parsed.user) {
              parsed.user = { ...parsed.user, id: BLANK_UUID };
            }
            if (parsed.variants && Array.isArray(parsed.variants)) {
              parsed.variants = parsed.variants.map((variant: any) => {
                if (variant.createDate) variant.createDate = "NORMALIZED_DATE";
                if (variant.publishDate)
                  variant.publishDate = "NORMALIZED_DATE";
                if (variant.updateDate) variant.updateDate = "NORMALIZED_DATE";
                if (variant.versionDate) variant.versionDate = "NORMALIZED_DATE";
                return variant;
              });
            }
            text = JSON.stringify(parsed, null, 2);
          } catch {}
          return {
            ...item,
            text,
          };
        } else {
          // For list responses
          const parsed = JSON.parse(item.text);
          if (Array.isArray(parsed)) {
            // Handle ancestors API response and other array responses
            const normalized = parsed.map(normalizeItem);
            return {
              ...item,
              text: JSON.stringify(normalized),
            };
          }
          // Handle other list responses
          if (parsed.items) {
            parsed.items = parsed.items.map(normalizeItem);
          }
          if (parsed.variants && Array.isArray(parsed.variants)) {
            parsed.variants = parsed.variants.map((variant: any) => {
              if (variant.createDate) variant.createDate = "NORMALIZED_DATE";
              if (variant.publishDate) variant.publishDate = "NORMALIZED_DATE";
              if (variant.updateDate) variant.updateDate = "NORMALIZED_DATE";
              return variant;
            });
          }
          return {
            ...item,
            text: JSON.stringify(parsed),
          };
        }
      }
      return item;
    }),
  };
}

export function normalizeErrorResponse(result: CallToolResult): CallToolResult {
  if (Array.isArray(result.content) && result.content[0]) {
    const firstContent = result.content[0];
    if (firstContent.type === "text" && typeof firstContent.text === "string") {
      // Replace any traceId in the text with a normalized version
      firstContent.text = firstContent.text.replace(
        /00-[0-9a-f]{32}-[0-9a-f]{16}-00/g,
        "normalized-trace-id"
      );
    }
  }
  return result;
}
