---
root: false
targets:
  - '*'
description: Should be referenced when working with testing
globs: []
cursorRuleType: intelligently
---

# Model Context Providers Testing Guide

## Dictionary = gold standard

The Dictionary entity is the gold standard for testing. Use it as a reference for
creating new feature testing suites — both in terms of the splitting between
logical API endpoints and the number of tests created.

## Entity build ordering

Always follow this process when asked to create testing for a new feature. Complete
these one at a time, always stop between each step.

- always build the builder first for the entities present in the feature. There may be more than one, e.g Document Blueprints have Document Blueprint and Document Blueprint folders
- before actual testing create a helper alongside the builder that will allow easy arrangement. This likely includes methods to
    - normalise ids: convert all generated ids to the blank for snapshotting
    - cleanup: remove any added items for tests
    - find: find an item from the search / items, dependant on the feature. be careful
- next start by creating one test for creating an entity then stop and test that
- then create the CRUD operations
- then add items tests (ancestor, children, root)
- then add folder tests
