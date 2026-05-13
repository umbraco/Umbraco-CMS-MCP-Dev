import { UmbracoManagementClient } from "@umb-management-client";
import type { DataTypeResponseModel } from "@/umb-management-api/schemas/index.js";

/**
 * Result of validating a property value
 */
export interface PropertyValueValidation {
  isValid: boolean;
  errors: string[];
}

/**
 * Configuration for how an editor validates values
 */
interface EditorFormatConfig {
  /** Expected value type */
  valueType: 'string' | 'string[]' | 'number' | 'boolean' | 'object';
  /** Config key in Data Type that contains allowed values (e.g., "items") */
  allowedValuesKey?: string;
  /** Whether to validate value against allowed values list */
  validateAllowedValues?: boolean;
}

/**
 * Mapping of editor alias → format configuration
 *
 * This map defines the expected value format and validation rules for each property editor.
 * Editors not in this map will skip validation (unknown editors are allowed through).
 */
const EDITOR_FORMAT_MAP: Record<string, EditorFormatConfig> = {
  // Editors with allowed values validation
  "Umbraco.DropDown.Flexible": { valueType: 'string[]', allowedValuesKey: 'items', validateAllowedValues: true },
  "Umbraco.RadioButtonList": { valueType: 'string', allowedValuesKey: 'items', validateAllowedValues: true },
  "Umbraco.CheckBoxList": { valueType: 'string[]', allowedValuesKey: 'items', validateAllowedValues: true },
  "Umbraco.ColorPicker": { valueType: 'object', allowedValuesKey: 'items', validateAllowedValues: true },

  // Editors with format-only validation
  "Umbraco.TextBox": { valueType: 'string' },
  "Umbraco.TextArea": { valueType: 'string' },
  "Umbraco.Integer": { valueType: 'number' },
  "Umbraco.Decimal": { valueType: 'number' },
  "Umbraco.TrueFalse": { valueType: 'boolean' },
  "Umbraco.Tags": { valueType: 'string[]' },
  "Umbraco.MultipleTextstring": { valueType: 'string[]' },
  "Umbraco.DateTime": { valueType: 'string' },
  "Umbraco.EmailAddress": { valueType: 'string' },
  "Umbraco.MarkdownEditor": { valueType: 'string' },
  "Umbraco.ColorPicker.EyeDropper": { valueType: 'string' },
};

/**
 * Validates that a value matches the expected type
 */
function validateValueType(value: unknown, expectedType: string, propertyAlias: string, editorAlias: string): string | null {
  // Null/undefined values are allowed (property can be empty)
  if (value === null || value === undefined) {
    return null;
  }

  switch (expectedType) {
    case 'string':
      if (typeof value !== 'string') {
        return `Property '${propertyAlias}': Value must be a string for ${editorAlias} editor, got ${typeof value}`;
      }
      break;
    case 'string[]':
      if (!Array.isArray(value)) {
        return `Property '${propertyAlias}': Value must be an array for ${editorAlias} editor, got ${typeof value}`;
      }
      if (!value.every(item => typeof item === 'string')) {
        return `Property '${propertyAlias}': All array items must be strings for ${editorAlias} editor`;
      }
      break;
    case 'number':
      if (typeof value !== 'number') {
        return `Property '${propertyAlias}': Value must be a number for ${editorAlias} editor, got ${typeof value}`;
      }
      break;
    case 'boolean':
      if (typeof value !== 'boolean') {
        return `Property '${propertyAlias}': Value must be a boolean for ${editorAlias} editor, got ${typeof value}`;
      }
      break;
    case 'object':
      if (typeof value !== 'object' || Array.isArray(value)) {
        return `Property '${propertyAlias}': Value must be an object for ${editorAlias} editor, got ${Array.isArray(value) ? 'array' : typeof value}`;
      }
      break;
  }
  return null;
}

/**
 * Extracts allowed values from Data Type configuration
 */
function extractAllowedValues(dataType: DataTypeResponseModel, configKey: string): string[] | null {
  const configItem = dataType.values.find(v => v.alias === configKey);
  if (!configItem || !configItem.value) {
    return null;
  }

  const value = configItem.value;

  // For most editors, items is a string array
  if (Array.isArray(value)) {
    // Check if it's an array of strings (dropdown, radio, checkbox)
    if (value.every(item => typeof item === 'string')) {
      return value as string[];
    }
    // Check if it's an array of objects with 'value' property (color picker)
    if (value.every(item => typeof item === 'object' && item !== null && 'value' in item)) {
      return value.map(item => (item as { value: string }).value);
    }
  }

  return null;
}

/**
 * Validates a value against allowed values list
 */
function validateAllowedValues(
  value: unknown,
  allowedValues: string[],
  propertyAlias: string,
  editorAlias: string,
  valueType: string
): string[] {
  const errors: string[] = [];

  // Null/undefined values are allowed
  if (value === null || value === undefined) {
    return errors;
  }

  // For ColorPicker, extract the value property
  if (editorAlias === 'Umbraco.ColorPicker' && typeof value === 'object' && value !== null && 'value' in value) {
    const colorValue = (value as { value: string }).value;
    if (!allowedValues.includes(colorValue)) {
      errors.push(`Property '${propertyAlias}': Color value '${colorValue}' is not in allowed values: [${allowedValues.map(v => `'${v}'`).join(', ')}]`);
    }
    return errors;
  }

  // For arrays, check each value
  if (valueType === 'string[]' && Array.isArray(value)) {
    for (const item of value) {
      if (!allowedValues.includes(item)) {
        errors.push(`Property '${propertyAlias}': Value '${item}' is not in allowed values: [${allowedValues.map(v => `'${v}'`).join(', ')}]`);
      }
    }
    return errors;
  }

  // For single string values
  if (valueType === 'string' && typeof value === 'string') {
    if (!allowedValues.includes(value)) {
      errors.push(`Property '${propertyAlias}': Value '${value}' is not in allowed values: [${allowedValues.map(v => `'${v}'`).join(', ')}]`);
    }
    return errors;
  }

  return errors;
}

/**
 * Validates a single property value against its Data Type configuration
 *
 * @param dataType - The Data Type configuration for this property
 * @param value - The value to validate
 * @param propertyAlias - The property alias (for error messages)
 * @returns Validation result with any errors
 */
export function validatePropertyValue(
  dataType: DataTypeResponseModel,
  value: unknown,
  propertyAlias: string
): PropertyValueValidation {
  const errors: string[] = [];
  const editorAlias = dataType.editorAlias;

  // Look up editor format configuration
  const formatConfig = EDITOR_FORMAT_MAP[editorAlias];

  // If editor is not in our map, skip validation (unknown editor)
  if (!formatConfig) {
    return { isValid: true, errors: [] };
  }

  // Validate value type
  const typeError = validateValueType(value, formatConfig.valueType, propertyAlias, editorAlias);
  if (typeError) {
    errors.push(typeError);
    // If type is wrong, don't continue with allowed values validation
    return { isValid: false, errors };
  }

  // Validate against allowed values if configured
  if (formatConfig.validateAllowedValues && formatConfig.allowedValuesKey) {
    const allowedValues = extractAllowedValues(dataType, formatConfig.allowedValuesKey);
    if (allowedValues && allowedValues.length > 0) {
      const allowedValueErrors = validateAllowedValues(
        value,
        allowedValues,
        propertyAlias,
        editorAlias,
        formatConfig.valueType
      );
      errors.push(...allowedValueErrors);
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Validates multiple properties before saving
 *
 * This is the main entry point for validation. It handles caching of Data Type
 * lookups to avoid repeated API calls for properties using the same Data Type.
 *
 * @param properties - Array of properties to validate with their Data Type IDs
 * @returns Aggregated validation result with all errors
 */
export async function validatePropertiesBeforeSave(
  properties: Array<{ alias: string; value: unknown; dataTypeId: string }>
): Promise<PropertyValueValidation> {
  const client = UmbracoManagementClient.getClient();
  const errors: string[] = [];

  // Cache Data Types to avoid repeated API calls
  const dataTypeCache = new Map<string, DataTypeResponseModel>();

  async function getCachedDataType(dataTypeId: string): Promise<DataTypeResponseModel | null> {
    if (!dataTypeCache.has(dataTypeId)) {
      try {
        const dataType = await client.getDataTypeById(dataTypeId);
        dataTypeCache.set(dataTypeId, dataType);
      } catch (error) {
        console.error(`Failed to fetch Data Type ${dataTypeId}:`, error);
        return null;
      }
    }
    return dataTypeCache.get(dataTypeId) ?? null;
  }

  // Validate each property
  for (const prop of properties) {
    if (!prop.dataTypeId) {
      continue; // Skip properties without Data Type ID
    }

    const dataType = await getCachedDataType(prop.dataTypeId);
    if (!dataType) {
      continue; // Skip if we couldn't fetch Data Type
    }

    const validation = validatePropertyValue(dataType, prop.value, prop.alias);
    if (!validation.isValid) {
      errors.push(...validation.errors);
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}
