import { FIELDS_ADDED_IN_MINORS, relaxMinorAddedFields } from "../relax-minor-added-fields.js";

// Builds a spec in which every listed field is required, alongside a field
// that must stay required.
const specWithAllListedFieldsRequired = () => ({
  components: {
    schemas: Object.fromEntries(
      Object.entries(FIELDS_ADDED_IN_MINORS).map(([name, entries]) => [
        name,
        { type: "object", required: ["id", ...entries.flatMap((e) => e.fields)] },
      ]),
    ),
  },
});

describe("relaxMinorAddedFields", () => {
  it("drops only the listed fields from each schema's required list", () => {
    const spec = relaxMinorAddedFields(specWithAllListedFieldsRequired());
    for (const name of Object.keys(FIELDS_ADDED_IN_MINORS)) {
      expect(spec.components.schemas[name].required).toEqual(["id"]);
    }
  });

  it("throws when a listed field is no longer required, so stale entries are noticed", () => {
    const spec = specWithAllListedFieldsRequired();
    spec.components.schemas.DocumentUrlInfoModel.required = ["id"];
    expect(() => relaxMinorAddedFields(spec)).toThrow(/DocumentUrlInfoModel\.isExternal/);
  });

  it("throws when a listed schema is missing from the spec", () => {
    const spec = specWithAllListedFieldsRequired();
    delete (spec.components.schemas as Record<string, unknown>).MediaCollectionResponseModel;
    expect(() => relaxMinorAddedFields(spec)).toThrow(/MediaCollectionResponseModel\.hasChildren/);
  });
});
