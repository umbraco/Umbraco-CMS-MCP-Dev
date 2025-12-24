export interface PropertyValueTemplate {
  editorAlias: string;
  value: any;
  _notes?: string;
}

export const propertyValueTemplates: Record<string, PropertyValueTemplate> = {
  "BlockList": {
    editorAlias: "Umbraco.BlockList",
    value: {
      layout: {
        "Umbraco.BlockList": [
          {
            contentKey: "7a61b31c-792f-4f6b-a665-960a90b49853"
          }
        ]
      },
      contentData: [
        {
          key: "7a61b31c-792f-4f6b-a665-960a90b49853",
          contentTypeKey: "3a7ec32d-7fd4-49f8-aae6-d9259d5bfee1",
          values: [
            {
              editorAlias: "Umbraco.MediaPicker3",
              culture: null,
              segment: null,
              alias: "recipeImage",
              value: [
                {
                  key: "9bac772d-cd63-4bb6-b2db-1449042129a7",
                  mediaKey: "3c6c415c-35a0-4629-891e-683506250c31",
                  mediaTypeAlias: "",
                  crops: [],
                  focalPoint: null
                }
              ]
            }
          ]
        }
      ],
      settingsData: [],
      expose: [
        {
          contentKey: "7a61b31c-792f-4f6b-a665-960a90b49853",
          culture: null,
          segment: null
        }
      ]
    },
    _notes: "Complex structure with layout, contentData, settingsData, and expose arrays. contentData.values contains nested property values. All keys must be unique UUIDs."
  },
  "BlockGrid": {
    editorAlias: "Umbraco.BlockGrid",
    value: {
      layout: {
        "Umbraco.BlockGrid": [
          {
            contentKey: "d8fa3d28-79aa-4c60-8e73-5819ed313ea2",
            columnSpan: 12,
            rowSpan: 1,
            areas: [
              {
                key: "43743e78-0f2b-465e-a3ce-f381c90b68e0",
                items: [
                  {
                    contentKey: "3145f922-7ec1-41e0-99a5-d9677e558163",
                    settingsKey: "6248d134-4657-4605-b0d5-ae804858bb88",
                    columnSpan: 6,
                    rowSpan: 1
                  }
                ]
              }
            ]
          }
        ]
      },
      contentData: [
        {
          key: "d8fa3d28-79aa-4c60-8e73-5819ed313ea2",
          contentTypeKey: "6960aaca-0b26-4fae-9cee-db73405d7a3e",
          values: [
            {
              editorAlias: "Umbraco.TextBox",
              culture: null,
              segment: null,
              alias: "title",
              value: "Title"
            },
            {
              editorAlias: "Umbraco.RichText",
              culture: null,
              segment: null,
              alias: "bodyText",
              value: {
                markup: "<p>Content here</p>",
                blocks: {
                  layout: {},
                  contentData: [],
                  settingsData: [],
                  expose: []
                }
              }
            },
            {
              editorAlias: "Umbraco.MediaPicker3",
              culture: null,
              segment: null,
              alias: "image",
              value: [
                {
                  key: "40edd153-31eb-4c61-82fc-1ec2e695197b",
                  mediaKey: "3c6c415c-35a0-4629-891e-683506250c31",
                  mediaTypeAlias: "",
                  crops: [],
                  focalPoint: null
                }
              ]
            }
          ]
        },
        {
          key: "3145f922-7ec1-41e0-99a5-d9677e558163",
          contentTypeKey: "c80027e5-7e87-49c1-9b4f-1b9d3fbc2e90",
          values: [
            {
              editorAlias: "Umbraco.TextBox",
              culture: null,
              segment: null,
              alias: "title",
              value: "Nested Title"
            },
            {
              editorAlias: "Umbraco.RichText",
              culture: null,
              segment: null,
              alias: "content",
              value: {
                markup: "<p>Nested content</p>",
                blocks: {
                  layout: {},
                  contentData: [],
                  settingsData: [],
                  expose: []
                }
              }
            }
          ]
        }
      ],
      settingsData: [
        {
          key: "6248d134-4657-4605-b0d5-ae804858bb88",
          contentTypeKey: "06200e23-1c29-4298-9582-48b2eaa81fbf",
          values: []
        }
      ],
      expose: [
        {
          contentKey: "d8fa3d28-79aa-4c60-8e73-5819ed313ea2",
          culture: null,
          segment: null
        },
        {
          contentKey: "3145f922-7ec1-41e0-99a5-d9677e558163",
          culture: null,
          segment: null
        }
      ]
    },
    _notes: "Complex hierarchical structure with areas and nested items. Layout defines structure with columnSpan/rowSpan. contentData stores actual content. All keys must be unique UUIDs."
  },
  "Decimal": {
    editorAlias: "Umbraco.Decimal",
    value: 1.2
  },
  "EmailAddress": {
    editorAlias: "Umbraco.EmailAddress",
    value: "admin@admin.co.uk"
  },
  "Integer": {
    editorAlias: "Umbraco.Integer",
    value: 1
  },
  "Tags": {
    editorAlias: "Umbraco.Tags",
    value: [
      "Tag 1",
      "Tag 2"
    ]
  },
  "ColorPicker": {
    editorAlias: "Umbraco.ColorPicker",
    value: {
      label: "Green",
      value: "#00FF00"
    }
  },
  "TrueFalse": {
    editorAlias: "Umbraco.TrueFalse",
    value: true
  },
  "CheckBoxList": {
    editorAlias: "Umbraco.CheckBoxList",
    value: [
      "item 1",
      "items 2"
    ]
  },
  "Dropdown": {
    editorAlias: "Umbraco.DropDown.Flexible",
    value: [
      "Item 3"
    ]
  },
  "MultipleTextstring": {
    editorAlias: "Umbraco.MultipleTextstring",
    value: [
      "Item 1",
      "item 2"
    ]
  },
  "RadioButtonList": {
    editorAlias: "Umbraco.RadioButtonList",
    value: "item 1"
  },
  "ImageCropper": {
    editorAlias: "Umbraco.ImageCropper",
    value: {
      temporaryFileId: "b45eb1dd-2959-4b0b-a675-761b6a19824c",
      src: "",
      crops: [],
      focalPoint: {
        left: 0.5,
        top: 0.5
      }
    },
    _notes: "IMPORTANT: Requires a temporary file uploaded first. Use the temporaryFileId from the upload response."
  },
  "MediaPicker3": {
    editorAlias: "Umbraco.MediaPicker3",
    value: [
      {
        key: "4c82123c-cd3e-4d92-84b8-9c79ad5a5319",
        mediaKey: "3c6c415c-35a0-4629-891e-683506250c31",
        mediaTypeAlias: "",
        crops: [],
        focalPoint: null
      }
    ],
    _notes: "The key is generated by you. The mediaKey relates to an existing media item id."
  },
  "UploadField": {
    editorAlias: "Umbraco.UploadField",
    value: {
      src: "blob:http://localhost:56472/0884388b-41a3-46c2-a224-9b9ff02de24a",
      temporaryFileId: "fc76f270-83c2-4daa-ba8b-fde4554dda2a"
    },
    _notes: "IMPORTANT: Requires a temporary file uploaded first. Use the temporaryFileId from the upload response."
  },
  "Slider": {
    editorAlias: "Umbraco.Slider",
    value: {
      from: 31,
      to: 31
    }
  },
  "MemberGroupPicker": {
    editorAlias: "Umbraco.MemberGroupPicker",
    value: "9815503d-a5a9-487f-aee3-827ca43fdb2c",
    _notes: "The value relates to an existing member group id."
  },
  "MemberPicker": {
    editorAlias: "Umbraco.MemberPicker",
    value: "f8abd31e-c78d-46ea-bb6b-c00cb9107bfb",
    _notes: "The value relates to an existing member id."
  },
  "UserPicker": {
    editorAlias: "Umbraco.UserPicker",
    value: "1e70f841-c261-413b-abb2-2d68cdb96094",
    _notes: "The value relates to an existing user id."
  },
  "MultiNodeTreePicker": {
    editorAlias: "Umbraco.MultiNodeTreePicker",
    value: [
      {
        type: "document",
        unique: "dcf18a51-6919-4cf8-89d1-36b94ce4d963"
      }
    ],
    _notes: "The unique property relates to an existing document, media, or member id. Type can be 'document', 'media', or 'member'."
  },
  "DateTime": {
    editorAlias: "Umbraco.DateTime",
    value: "2025-05-23 00:00:00"
  },
  "ContentPicker": {
    editorAlias: "Umbraco.ContentPicker",
    value: "dcf18a51-6919-4cf8-89d1-36b94ce4d963",
    _notes: "The value relates to an existing document id."
  },
  "ColorPickerEyeDropper": {
    editorAlias: "Umbraco.ColorPicker.EyeDropper",
    value: "#982020"
  },
  "MultiUrlPicker": {
    editorAlias: "Umbraco.MultiUrlPicker",
    value: [
      {
        icon: "icon-home color-blue",
        name: "Home",
        type: "document",
        unique: "dcf18a51-6919-4cf8-89d1-36b94ce4d963",
        url: "/"
      },
      {
        icon: "icon-picture",
        name: "Chairs lamps",
        type: "media",
        unique: "3c6c415c-35a0-4629-891e-683506250c31",
        url: "http://localhost:56472/media/0ofdvcwj/chairs-lamps.jpg"
      },
      {
        name: "Title",
        target: "_blank",
        type: "external",
        url: "www.google.com"
      }
    ],
    _notes: "Can contain document, media, or external link entries. For document/media, unique is the content id."
  },
  "MarkdownEditor": {
    editorAlias: "Umbraco.MarkdownEditor",
    value: "Markdown"
  },
  "CodeEditor": {
    editorAlias: "Umbraco.CodeEditor",
    value: "Code"
  },
  "Textbox": {
    editorAlias: "Umbraco.TextBox",
    value: "some string"
  },
  "TextArea": {
    editorAlias: "Umbraco.TextArea",
    value: "some string"
  },
  "RichTextEditor": {
    editorAlias: "Umbraco.RichText",
    value: {
      markup: "<p>some string</p>",
      blocks: {
        layout: {},
        contentData: [],
        settingsData: [],
        expose: []
      }
    },
    _notes: "The blocks property has the same structure as BlockList. Can include nested block content within the rich text."
  }
};
