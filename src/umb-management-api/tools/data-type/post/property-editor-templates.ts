export interface PropertyEditorTemplate {
  editorAlias?: string;
  editorUiAlias?: string;
  values?: Array<{ alias: string; value?: any }>;
  _notes?: string;
}

export const propertyEditorTemplates: Record<string, PropertyEditorTemplate> = 
{
  "Decimal": {
    "editorAlias": "Umbraco.Decimal",
    "editorUiAlias": "Umb.PropertyEditorUi.Decimal",
    "values": [
      {
        "alias": "step",
        "value": "0.01"
      },
      {
        "alias": "min",
        "value": 3
      },
      {
        "alias": "max",
        "value": 10
      },
      {
        "alias": "placeholder",
        "value": "Item"
      }
    ]
  },
  "Email": {
    "editorAlias": "Umbraco.EmailAddress",
    "editorUiAlias": "Umb.PropertyEditorUi.EmailAddress",
    "values": [
      {
        "alias": "inputType",
        "value": "email"
      }
    ]
  },
  "Label": {
    "editorAlias": "Umbraco.Label",
    "editorUiAlias": "Umb.PropertyEditorUi.Label",
    "values": [
      {
        "alias": "umbracoDataValueType",
        "value": "DECIMAL"
      }
    ],
    "_notes": "Label options: STRING, DECIMAL, DATETIME, TIME, INTEGER, BIGINT, TEXT"
  },
  "Numeric": {
    "editorAlias": "Umbraco.Label",
    "editorUiAlias": "Umb.PropertyEditorUi.Label",
    "values": [
      {
        "alias": "umbracoDataValueType",
        "value": "DECIMAL"
      }
    ]
  },
  "Slider": {
    "editorAlias": "Umbraco.Slider",
    "editorUiAlias": "Umb.PropertyEditorUi.Slider",
    "values": [
      {
        "alias": "minVal",
        "value": 0
      },
      {
        "alias": "maxVal",
        "value": 100
      },
      {
        "alias": "initVal1",
        "value": 0
      },
      {
        "alias": "initVal2",
        "value": 0
      },
      {
        "alias": "step",
        "value": 1
      }
    ]
  },
  "Tags": {
    "editorAlias": "Umbraco.Tags",
    "editorUiAlias": "Umb.PropertyEditorUi.Tags",
    "values": [
      {
        "alias": "group",
        "value": "default"
      },
      {
        "alias": "storageType",
        "value": "Json"
      }
    ],
    "_notes": "Storage options: Json, CSV"
  },
  "Textarea": {
    "editorAlias": "Umbraco.TextArea",
    "editorUiAlias": "Umb.PropertyEditorUi.TextArea",
    "values": [
      {
        "alias": "rows",
        "value": 10
      },
      {
        "alias": "maxChars",
        "value": 100
      },
      {
        "alias": "minHeight",
        "value": 200
      },
      {
        "alias": "maxHeight",
        "value": 100
      }
    ]
  },
  "Textbox": {
    "editorAlias": "Umbraco.TextBox",
    "editorUiAlias": "Umb.PropertyEditorUi.TextBox",
    "values": [
      {
        "alias": "maxChars",
        "value": 512
      },
      {
        "alias": "inputType",
        "value": "text"
      }
    ]
  },
  "Toggle": {
    "editorAlias": "Umbraco.TrueFalse",
    "editorUiAlias": "Umb.PropertyEditorUi.Toggle",
    "values": [
      {
        "alias": "default",
        "value": true
      },
      {
        "alias": "showLabels",
        "value": true
      },
      {
        "alias": "labelOn",
        "value": "On"
      },
      {
        "alias": "labelOff",
        "value": "Off"
      },
      {
        "alias": "ariaLabel",
        "value": "Reader"
      }
    ]
  },
  "BlockList": {
    "editorAlias": "Umbraco.BlockList",
    "editorUiAlias": "Umb.PropertyEditorUi.BlockList",
    "values": [
      {
        "alias": "blocks",
        "value": [
          {
            "contentElementTypeKey": "c80027e5-7e87-49c1-9b4f-1b9d3fbc2e90",
            "settingsElementTypeKey": "2e1a4fd4-b695-4033-8626-1a45b54e04cb",
            "backgroundColor": "#c05454",
            "iconColor": "#00ff6f"
          }
        ]
      },
      {
        "alias": "validationLimit",
        "value": {
          "max": 3
        }
      },
      {
        "alias": "useLiveEditing",
        "value": true
      },
      {
        "alias": "useInlineEditingAsDefault",
        "value": true
      },
      {
        "alias": "maxPropertyWidth",
        "value": "100px"
      }
    ],
    "_notes": "IMPORTANT - when creating new block list data types always create the required element types first before creating the data type"
  },
  "CheckBoxList": {
    "editorAlias": "Umbraco.BlockList",
    "editorUiAlias": "Umb.PropertyEditorUi.BlockList",
    "values": [
      {
        "alias": "blocks",
        "value": [
          {
            "contentElementTypeKey": "c80027e5-7e87-49c1-9b4f-1b9d3fbc2e90",
            "settingsElementTypeKey": "2e1a4fd4-b695-4033-8626-1a45b54e04cb",
            "backgroundColor": "#c05454",
            "iconColor": "#00ff6f"
          }
        ]
      },
      {
        "alias": "validationLimit",
        "value": {
          "max": 3
        }
      },
      {
        "alias": "useLiveEditing",
        "value": true
      },
      {
        "alias": "useInlineEditingAsDefault",
        "value": true
      },
      {
        "alias": "maxPropertyWidth",
        "value": "100px"
      }
    ]
  },
  "Collection": {
    "editorAlias": "Umbraco.BlockList",
    "editorUiAlias": "Umb.PropertyEditorUi.BlockList",
    "values": [
      {
        "alias": "blocks",
        "value": [
          {
            "contentElementTypeKey": "c80027e5-7e87-49c1-9b4f-1b9d3fbc2e90",
            "settingsElementTypeKey": "2e1a4fd4-b695-4033-8626-1a45b54e04cb",
            "backgroundColor": "#c05454",
            "iconColor": "#00ff6f"
          }
        ]
      },
      {
        "alias": "validationLimit",
        "value": {
          "max": 3
        }
      },
      {
        "alias": "useLiveEditing",
        "value": true
      },
      {
        "alias": "useInlineEditingAsDefault",
        "value": true
      },
      {
        "alias": "maxPropertyWidth",
        "value": "100px"
      }
    ]
  },
  "Dropdown": {
    "editorAlias": "Umbraco.DropDown.Flexible",
    "editorUiAlias": "Umb.PropertyEditorUi.Dropdown",
    "values": [
      {
        "alias": "items",
        "value": [
          "Item 1",
          "Item 2"
        ]
      },
      {
        "alias": "multiple",
        "value": true
      }
    ]
  },
  "MultipleTextString": {
    "editorAlias": "Umbraco.MultipleTextstring",
    "editorUiAlias": "Umb.PropertyEditorUi.MultipleTextString",
    "values": [
      {
        "alias": "min",
        "value": 3
      },
      {
        "alias": "max",
        "value": 10
      }
    ]
  },
  "RadioButtonList": {
    "editorAlias": "Umbraco.RadioButtonList",
    "editorUiAlias": "Umb.PropertyEditorUi.RadioButtonList",
    "values": [
      {
        "alias": "items",
        "value": [
          "Item 1",
          "Item 2"
        ]
      }
    ]
  },
  "ImageCropper": {
    "_notes": "Doesn't work"
  },
  "MediaPicker": {
    "editorAlias": "Umbraco.MediaPicker3",
    "editorUiAlias": "Umb.PropertyEditorUi.MediaPicker",
    "values": [
      {
        "alias": "filter",
        "value": "cc07b313-0843-4aa8-bbda-871c8da728c8"
      },
      {
        "alias": "multiple",
        "value": true
      },
      {
        "alias": "validationLimit",
        "value": {
          "max": 10
        }
      },
      {
        "alias": "startNodeId"
      },
      {
        "alias": "enableLocalFocalPoint",
        "value": true
      },
      {
        "alias": "ignoreUserStartNodes",
        "value": true
      }
    ]
  },
  "UploadField": {
    "editorAlias": "Umbraco.UploadField",
    "editorUiAlias": "Umb.PropertyEditorUi.UploadField",
    "values": [
      {
        "alias": "fileExtensions",
        "value": [
          "pdf"
        ]
      }
    ]
  },
  "MemberGroupPicker": {
    "editorAlias": "Umbraco.MemberGroupPicker",
    "editorUiAlias": "Umb.PropertyEditorUi.MemberGroupPicker",
    "values": []
  },
  "MemberPicker": {
    "editorAlias": "Umbraco.MemberPicker",
    "editorUiAlias": "Umb.PropertyEditorUi.MemberPicker",
    "values": []
  },
  "UserPicker": {
    "editorAlias": "Umbraco.UserPicker",
    "editorUiAlias": "Umb.PropertyEditorUi.UserPicker",
    "values": []
  },
  "ColorPicker": {
    "editorAlias": "Umbraco.ColorPicker",
    "editorUiAlias": "Umb.PropertyEditorUi.ColorPicker",
    "values": [
      {
        "alias": "useLabel",
        "value": true
      },
      {
        "alias": "items",
        "value": [
          {
            "value": "F00",
            "label": "Red"
          }
        ]
      }
    ]
  },
  "ContentPicker": {
    "editorAlias": "Umbraco.MultiNodeTreePicker",
    "editorUiAlias": "Umb.PropertyEditorUi.ContentPicker",
    "values": [
      {
        "alias": "minNumber",
        "value": 0
      },
      {
        "alias": "maxNumber",
        "value": 0
      },
      {
        "alias": "ignoreUserStartNodes",
        "value": true
      },
      {
        "alias": "startNode",
        "value": {
          "type": "content",
          "dynamicRoot": {
            "originAlias": "Current"
          }
        }
      },
      {
        "alias": "filter",
        "value": "0fde8472-7c10-4e8a-bd4a-fffc0306d0aa"
      },
      {
        "alias": "showOpenButton",
        "value": true
      }
    ]
  },
  "DatePicker": {
    "editorAlias": "Umbraco.DateTime",
    "editorUiAlias": "Umb.PropertyEditorUi.DatePicker",
    "values": [
      {
        "alias": "format",
        "value": "YYYY-MM-DD HH:mm:ss"
      }
    ]
  },
  "DocumentPicker": {
    "editorAlias": "Umbraco.ContentPicker",
    "editorUiAlias": "Umb.PropertyEditorUi.DocumentPicker",
    "values": [
      {
        "alias": "ignoreUserStartNodes",
        "value": true
      },
      {
        "alias": "startNodeId",
        "value": "dcf18a51-6919-4cf8-89d1-36b94ce4d963"
      },
      {
        "alias": "showOpenButton",
        "value": true
      }
    ]
  },
  "EyeDropper": {
    "editorAlias": "Umbraco.ColorPicker.EyeDropper",
    "editorUiAlias": "Umb.PropertyEditorUi.EyeDropper",
    "values": [
      {
        "alias": "showAlpha",
        "value": true
      },
      {
        "alias": "showPalette",
        "value": true
      }
    ]
  },
  "MultiUrlPicker": {
    "editorAlias": "Umbraco.MultiUrlPicker",
    "editorUiAlias": "Umb.PropertyEditorUi.MultiUrlPicker",
    "values": [
      {
        "alias": "minNumber",
        "value": 1
      },
      {
        "alias": "maxNumber",
        "value": 3
      },
      {
        "alias": "ignoreUserStartNodes",
        "value": true
      },
      {
        "alias": "hideAnchor",
        "value": false
      }
    ]
  },
  "BlockGrid": {
    "editorAlias": "Umbraco.BlockGrid",
    "editorUiAlias": "Umb.PropertyEditorUi.BlockGrid",
    "values": [
      {
        "alias": "gridColumns",
        "value": 12
      },
      {
        "alias": "blocks",
        "value": [
          {
            "contentElementTypeKey": "c80027e5-7e87-49c1-9b4f-1b9d3fbc2e90",
            "allowAtRoot": true,
            "allowInAreas": true,
            "settingsElementTypeKey": "93638715-f76c-4a11-86b1-6a9d66504901",
            "columnSpanOptions": [
              {
                "columnSpan": 12
              }
            ],
            "rowMinSpan": 0,
            "rowMaxSpan": 3
          }
        ]
      }
    ],
    "_notes": "IMPORTANT - when creating new block grid data types always create the required element types first before creating the data type"
  },
  "CodeEditor": {
    "editorAlias": "Umbraco.Plain.String",
    "editorUiAlias": "Umb.PropertyEditorUi.CodeEditor",
    "values": [
      {
        "alias": "language",
        "value": "javascript"
      },
      {
        "alias": "height",
        "value": 400
      },
      {
        "alias": "lineNumbers",
        "value": true
      },
      {
        "alias": "minimap",
        "value": true
      },
      {
        "alias": "wordWrap",
        "value": false
      }
    ]
  },
  "MarkdownEditor": {
    "editorAlias": "Umbraco.MarkdownEditor",
    "editorUiAlias": "Umb.PropertyEditorUi.MarkdownEditor",
    "values": [
      {
        "alias": "preview",
        "value": true
      },
      {
        "alias": "defaultValue",
        "value": "Default value"
      },
      {
        "alias": "overlaySize",
        "value": "small"
      }
    ]
  },
  "RichTextEditor_TinyMCE": {
    "editorAlias": "Umbraco.RichText",
    "editorUiAlias": "Umb.PropertyEditorUi.TinyMCE",
    "values": [
      {
        "alias": "toolbar",
        "value": [
          "styles",
          "bold",
          "italic",
          "alignleft",
          "aligncenter",
          "alignright",
          "bullist",
          "numlist",
          "outdent",
          "indent",
          "sourcecode",
          "link",
          "umbmediapicker",
          "umbembeddialog"
        ]
      },
      {
        "alias": "mode",
        "value": "Classic"
      },
      {
        "alias": "maxImageSize",
        "value": 500
      },
      {
        "alias": "blocks",
        "value": [
          {
            "contentElementTypeKey": "c80027e5-7e87-49c1-9b4f-1b9d3fbc2e90",
            "settingsElementTypeKey": "93638715-f76c-4a11-86b1-6a9d66504901",
            "label": "Appearance",
            "displayInline": true,
            "editorSize": "small",
            "backgroundColor": "#000000",
            "iconColor": "#000000"
          }
        ]
      },
      {
        "alias": "mediaParentId"
      },
      {
        "alias": "ignoreUserStartNodes",
        "value": true
      }
    ]
  },
  "RichTextEditor_Tiptap": {
    "editorAlias": "Umbraco.RichText",
    "editorUiAlias": "Umb.PropertyEditorUi.Tiptap",
    "values": [
      {
        "alias": "toolbar",
        "value": [
          [
            [
              "Umb.Tiptap.Toolbar.SourceEditor"
            ],
            [
              "Umb.Tiptap.Toolbar.Bold",
              "Umb.Tiptap.Toolbar.Italic",
              "Umb.Tiptap.Toolbar.Underline"
            ],
            [
              "Umb.Tiptap.Toolbar.TextAlignLeft",
              "Umb.Tiptap.Toolbar.TextAlignCenter",
              "Umb.Tiptap.Toolbar.TextAlignRight"
            ],
            [
              "Umb.Tiptap.Toolbar.BulletList",
              "Umb.Tiptap.Toolbar.OrderedList"
            ],
            [
              "Umb.Tiptap.Toolbar.Blockquote",
              "Umb.Tiptap.Toolbar.HorizontalRule"
            ],
            [
              "Umb.Tiptap.Toolbar.Link",
              "Umb.Tiptap.Toolbar.Unlink"
            ],
            [
              "Umb.Tiptap.Toolbar.MediaPicker",
              "Umb.Tiptap.Toolbar.EmbeddedMedia"
            ]
          ]
        ]
      },
      {
        "alias": "maxImageSize",
        "value": 500
      },
      {
        "alias": "overlaySize",
        "value": "medium"
      },
      {
        "alias": "extensions",
        "value": [
          "Umb.Tiptap.Embed",
          "Umb.Tiptap.Figure",
          "Umb.Tiptap.Image",
          "Umb.Tiptap.Link",
          "Umb.Tiptap.MediaUpload",
          "Umb.Tiptap.RichTextEssentials",
          "Umb.Tiptap.Subscript",
          "Umb.Tiptap.Superscript",
          "Umb.Tiptap.Table",
          "Umb.Tiptap.TextAlign",
          "Umb.Tiptap.TextDirection",
          "Umb.Tiptap.Underline"
        ]
      }
    ]
  }
};
