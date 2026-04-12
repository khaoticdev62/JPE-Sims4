/* eslint-disable no-undef */
// Minimal monaco-editor mock for Jest tests
const CompletionItemKind = {
  Text: 0,
  Method: 1,
  Function: 2,
  Constructor: 3,
  Field: 4,
  Variable: 5,
  Class: 6,
  Interface: 7,
  Module: 8,
  Property: 9,
  Unit: 10,
  Value: 11,
  Enum: 12,
  Keyword: 13,
  Snippet: 14,
  Color: 15,
  File: 16,
  Reference: 17,
  Folder: 18,
  EnumMember: 19,
  Constant: 20,
  Struct: 21,
  Event: 22,
  Operator: 23,
  TypeParameter: 24,
};

module.exports = {
  languages: {
    CompletionItemKind,
    registerCompletionItemProvider: jest.fn(),
  },
  Uri: {
    parse: jest.fn((uri) => ({ toString: () => uri })),
  },
  Range: jest.fn(),
};
