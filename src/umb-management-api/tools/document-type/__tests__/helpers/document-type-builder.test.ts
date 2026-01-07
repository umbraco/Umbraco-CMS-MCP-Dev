import { CompositionTypeModel } from "@/umb-management-api/schemas/compositionTypeModel.js";
import { DocumentTypeBuilder } from "./document-type-builder.js";
import { DocumentTypeTestHelper } from "./document-type-test-helper.js";
import { TextString_DATA_TYPE_ID, MEDIA_PICKER_DATA_TYPE_ID } from "@/constants/constants.js";
import { setupTestEnvironment } from "@/test-helpers/setup-test-environment.js";

describe('DocumentTypeBuilder', () => {
  const TEST_DOCTYPE_NAME = '_Test Builder DocumentType';
  const TEST_PARENT_NAME = '_Test Parent DocumentType';
  setupTestEnvironment();

  afterEach(async () => {
    await DocumentTypeTestHelper.cleanup(TEST_DOCTYPE_NAME);
    await DocumentTypeTestHelper.cleanup(TEST_PARENT_NAME);
  });

  describe('construction', () => {
    it('should create a builder with default values', () => {
      const builder = new DocumentTypeBuilder();
      const model = builder.build();

      expect(model).toEqual({
        alias: "",
        name: "",
        icon: "icon-document",
        allowedAsRoot: false,
        variesByCulture: false,
        variesBySegment: false,
        isElement: false,
        properties: [],
        containers: [],
        allowedTemplates: [],
        cleanup: {
          preventCleanup: false,
        },
        allowedDocumentTypes: [],
        compositions: []
      });
    });
  });

  describe('builder methods', () => {
    let builder: DocumentTypeBuilder;

    beforeEach(() => {
      builder = new DocumentTypeBuilder();
    });

    it('should set name and generate alias', () => {
      builder.withName(TEST_DOCTYPE_NAME);
      const model = builder.build();

      expect(model.name).toBe(TEST_DOCTYPE_NAME);
      expect(model.alias).toBe(TEST_DOCTYPE_NAME.toLowerCase().replace(/\s+/g, ""));
    });

    it('should set alias independently', () => {
      const alias = 'customAlias';
      builder.withAlias(alias);
      const model = builder.build();

      expect(model.alias).toBe(alias);
    });

    it('should set description', () => {
      const description = 'Test description';
      builder.withDescription(description);
      const model = builder.build();

      expect(model.description).toBe(description);
    });

    it('should set icon', () => {
      const icon = 'icon-test';
      builder.withIcon(icon);
      const model = builder.build();

      expect(model.icon).toBe(icon);
    });

    it('should set allowedAsRoot', () => {
      builder.allowAsRoot();
      const model = builder.build();

      expect(model.allowedAsRoot).toBe(true);
    });

    it('should set variesByCulture', () => {
      builder.variesByCulture();
      const model = builder.build();

      expect(model.variesByCulture).toBe(true);
    });

    it('should set variesBySegment', () => {
      builder.variesBySegment();
      const model = builder.build();

      expect(model.variesBySegment).toBe(true);
    });

    it('should set isElement', () => {
      builder.asElement();
      const model = builder.build();

      expect(model.isElement).toBe(true);
    });

    it('should add parent', () => {
      const parentId = '123-456';
      builder.withParentId(parentId);
      const model = builder.build();

      expect(model.parent).toEqual({ id: parentId });
    });

    it('should add allowed template', () => {
      const templateId = '123-456';
      builder.withAllowedTemplate(templateId);
      const model = builder.build();

      expect(model.allowedTemplates).toContainEqual({ id: templateId });
    });

    it('should set default template', () => {
      const templateId = '123-456';
      builder.withDefaultTemplate(templateId);
      const model = builder.build();

      expect(model.defaultTemplate).toEqual({ id: templateId });
    });

    it('should add allowed document type', () => {
      const contentTypeId = '123-456';
      const sortOrder = 1;
      builder.withAllowedDocumentType(contentTypeId, sortOrder);
      const model = builder.build();

      expect(model.allowedDocumentTypes).toContainEqual({ documentType: { id: contentTypeId }, sortOrder });
    });

    it('should add composition', () => {
      const contentTypeId = '123-456';
      builder.withComposition(contentTypeId);
      const model = builder.build();

      expect(model.compositions).toContainEqual({ compositionType: CompositionTypeModel.Composition, documentType: { id: contentTypeId } });
    });

    it('should add a simple property', () => {
      builder.withProperty('title', 'Title', TextString_DATA_TYPE_ID);
      const model = builder.build();

      expect(model.properties).toHaveLength(1);
      expect(model.properties[0]).toMatchObject({
        alias: 'title',
        name: 'Title',
        dataType: { id: TextString_DATA_TYPE_ID },
        variesByCulture: false,
        variesBySegment: false,
        sortOrder: 0,
        validation: {
          mandatory: false,
          mandatoryMessage: null,
          regEx: null,
          regExMessage: null,
        },
        appearance: {
          labelOnTop: false,
        }
      });
      expect(model.properties[0].id).toBeDefined();
    });

    it('should add property with all options', () => {
      const containerId = 'container-123';
      builder.withProperty('mediaPicker', 'Media Picker', MEDIA_PICKER_DATA_TYPE_ID, {
        description: 'Select an image',
        variesByCulture: true,
        variesBySegment: false,
        mandatory: true,
        mandatoryMessage: 'Please select an image',
        validationRegEx: '^.+$',
        validationRegExMessage: 'Invalid selection',
        sortOrder: 5,
        container: containerId
      });
      const model = builder.build();

      expect(model.properties).toHaveLength(1);
      expect(model.properties[0]).toMatchObject({
        alias: 'mediaPicker',
        name: 'Media Picker',
        description: 'Select an image',
        dataType: { id: MEDIA_PICKER_DATA_TYPE_ID },
        variesByCulture: true,
        variesBySegment: false,
        sortOrder: 5,
        container: { id: model.containers[0].id },
        validation: {
          mandatory: true,
          mandatoryMessage: 'Please select an image',
          regEx: '^.+$',
          regExMessage: 'Invalid selection',
        },
        appearance: {
          labelOnTop: false,
        }
      });
    });

    it('should add multiple properties with correct sort order', () => {
      builder
        .withProperty('title', 'Title', TextString_DATA_TYPE_ID)
        .withProperty('description', 'Description', TextString_DATA_TYPE_ID)
        .withProperty('image', 'Image', MEDIA_PICKER_DATA_TYPE_ID);

      const model = builder.build();

      expect(model.properties).toHaveLength(3);
      expect(model.properties[0].alias).toBe('title');
      expect(model.properties[0].sortOrder).toBe(0);
      expect(model.properties[1].alias).toBe('description');
      expect(model.properties[1].sortOrder).toBe(1);
      expect(model.properties[2].alias).toBe('image');
      expect(model.properties[2].sortOrder).toBe(2);
    });

    it('should override auto sort order when specified', () => {
      builder
        .withProperty('first', 'First', TextString_DATA_TYPE_ID)
        .withProperty('second', 'Second', TextString_DATA_TYPE_ID, { sortOrder: 10 })
        .withProperty('third', 'Third', TextString_DATA_TYPE_ID);

      const model = builder.build();

      expect(model.properties[0].sortOrder).toBe(0);
      expect(model.properties[1].sortOrder).toBe(10);
      expect(model.properties[2].sortOrder).toBe(2);
    });

    it('should chain builder methods', () => {
      const description = 'Test description';
      const icon = 'icon-test';
      const parentId = '123-456';
      
      builder
        .withName(TEST_DOCTYPE_NAME)
        .withDescription(description)
        .withIcon(icon)
        .allowAsRoot()
        .variesByCulture()
        .withParentId(parentId);

      const model = builder.build();

      expect(model).toMatchObject({
        name: TEST_DOCTYPE_NAME,
        alias: TEST_DOCTYPE_NAME.toLowerCase().replace(/\s+/g, ""),
        description,
        icon,
        allowedAsRoot: true,
        variesByCulture: true,
        parent: { id: parentId }
      });
    });
  });

  describe('creation and retrieval', () => {
    it('should create and retrieve a document type', async () => {
      const builder = await new DocumentTypeBuilder()
        .withName(TEST_DOCTYPE_NAME)
        .create();

      expect(builder.getId()).toBeDefined();

      const item = builder.getCreatedItem();
      expect(item).toBeDefined();
      expect(item.name).toBe(TEST_DOCTYPE_NAME);
      expect(item.isFolder).toBe(false);
    });

    it('should create document type with properties', async () => {
      const testName = '_Test DocType With Properties';
      await DocumentTypeTestHelper.cleanup(testName);

      const builder = await new DocumentTypeBuilder()
        .withName(testName)
        .allowAsRoot()
        .withProperty('title', 'Title', TextString_DATA_TYPE_ID, {
          mandatory: true,
          mandatoryMessage: 'Title is required'
        })
        .withProperty('mediaPicker', 'Featured Image', MEDIA_PICKER_DATA_TYPE_ID, {
          description: 'Select a featured image'
        })
        .create();

      expect(builder.getId()).toBeDefined();

      const item = builder.getCreatedItem();
      expect(item).toBeDefined();
      expect(item.name).toBe(testName);

      // Clean up
      await DocumentTypeTestHelper.cleanup(testName);
    });

    it('should require name and alias for creation', async () => {
      const builder = new DocumentTypeBuilder();
      await expect(builder.create()).rejects.toThrow();
    });
  });

  describe('error handling', () => {
    it('should handle invalid parent ID', async () => {
      const builder = new DocumentTypeBuilder()
        .withName(TEST_DOCTYPE_NAME)
        .withParentId('invalid-id');

      await expect(builder.create()).rejects.toThrow();
    });

    it('should throw error when getting created item before creation', () => {
      const builder = new DocumentTypeBuilder()
        .withName(TEST_DOCTYPE_NAME);

      expect(() => builder.getCreatedItem()).toThrow('No document type has been created yet');
    });

    it('should throw error when getting ID before creation', () => {
      const builder = new DocumentTypeBuilder()
        .withName(TEST_DOCTYPE_NAME);

      expect(() => builder.getId()).toThrow('No document type has been created yet');
    });
  });

  describe('update', () => {
    it('should update an existing document type', async () => {
      const initialName = '_Test Update DocumentType';
      const initialIcon = 'icon-document';
      const updatedDescription = 'Updated description';
      const updatedIcon = 'icon-updated';

      // Clean up before test
      await DocumentTypeTestHelper.cleanup(initialName);

      // Create the document type
      const builder = await new DocumentTypeBuilder()
        .withName(initialName)
        .withIcon(initialIcon)
        .create();

      // Update description and icon
      builder.withDescription(updatedDescription).withIcon(updatedIcon);
      await builder.update();

      // Fetch the updated document type
      const updated = await DocumentTypeTestHelper.findDocumentType(initialName);
      expect(updated).toBeDefined();
      expect(updated?.icon).toBe(updatedIcon);
      // Description is not always present in the tree item, but we can check the builder's model
      expect(builder.build().description).toBe(updatedDescription);

      // Clean up after test
      await DocumentTypeTestHelper.cleanup(initialName);
    });
  });
}); 