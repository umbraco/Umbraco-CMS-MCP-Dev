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
    // Normalize user reference
    if (item.user) {
      item.user = { ...item.user, id: BLANK_UUID };
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
    // Normalize test names that contain timestamps
    if (item.name && typeof item.name === "string") {
      item.name = item.name.replace(/_\d{13}(?=_|\.js$|$)/, "_NORMALIZED_TIMESTAMP");
    }
    if (item.path && typeof item.path === "string") {
      item.path = item.path.replace(/_\d{13}(?=_|\.js$|\/|$)/g, "_NORMALIZED_TIMESTAMP");
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
            // Normalize document version references
            if (parsed.document) {
              parsed.document = { ...parsed.document, id: BLANK_UUID };
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
            text = JSON.stringify(parsed);
          } catch {}
          return {
            ...item,
            text,
          };
        } else {
          // For list responses
          const parsed = JSON.parse(item.text);
          if (Array.isArray(parsed)) {
            // Handle ancestors API response
            return {
              ...item,
              text: JSON.stringify(parsed.map(normalizeItem)),
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
  if (
    Array.isArray(result.content) &&
    result.content[0]?.text &&
    typeof result.content[0].text === "string"
  ) {
    // Replace any traceId in the text with a normalized version
    result.content[0].text = result.content[0].text.replace(
      /00-[0-9a-f]{32}-[0-9a-f]{16}-00/g,
      "normalized-trace-id"
    );
  }
  return result;
}
