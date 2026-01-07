import { describe, it } from "@jest/globals";
import { setupConsoleMock, runScenarioTest } from "./helpers/index.js";

const MEDIA_LIFECYCLE_TOOLS = [
  // Creation
  "create-media-folder",
  "create-media",
  // Navigation
  "get-media-root",
  "get-media-children",
  "get-media-by-id",
  // Management
  "update-media",
  "move-media",
  // References
  "get-media-are-referenced",
  // Cleanup
  "move-media-to-recycle-bin",
  "restore-media-from-recycle-bin",
  "delete-media"
] as const;

describe("media lifecycle eval tests", () => {
  setupConsoleMock();

  it("should manage complete media folder and file workflow",
    runScenarioTest({
      prompt: `Complete these tasks in order:

1. Get the media root to see the current structure

2. Create a media folder called "_Test Media Folder" at the root
   - IMPORTANT: Save the folder ID returned from this call for later use

3. Create a test image media item INSIDE the new folder with name "_Test Image"
   - Use the folder ID from step 2 as the parentId
   - Use this base64 for a 1x1 pixel PNG: iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==
   - IMPORTANT: Save the image ID returned from this call - you will need it for ALL subsequent operations on the image

4. Update the IMAGE to change its name to "_Test Image Updated"
   - Use the image ID from step 3, NOT the folder ID

5. Check if the IMAGE is referenced anywhere using get-media-are-referenced
   - Use the image ID from step 3

6. Move the IMAGE (not the folder!) to the recycle bin
   - Use the image ID from step 3, NOT the folder ID

7. Restore the IMAGE from the recycle bin
   - Use the image ID from step 3

8. Delete the IMAGE permanently using delete-media
   - Use the image ID from step 3, NOT the folder ID
   - This deletes the IMAGE file, not the folder

9. Delete the FOLDER using delete-media
    - NOW use the folder ID from step 2
    - This deletes the empty folder

10. When all tasks are complete, say ONLY this exact string: 'The media lifecycle workflow has completed successfully'`,
      tools: MEDIA_LIFECYCLE_TOOLS,
      requiredTools: [
        "create-media-folder",
        "create-media",
        "update-media",
        "move-media-to-recycle-bin",
        "restore-media-from-recycle-bin",
        "delete-media"
      ],
      verbose: false,
      successPattern: "The media lifecycle workflow has completed successfully",
      options: { maxTurns: 25 }
    }),
    180000
  );
});
