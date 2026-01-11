// JPE Language Configuration
// This file defines the language configuration for JPE (Just Plain English) syntax

export const jpeLanguageConfiguration = {
  // Set defaultToken to invalid to see what's not tokenized yet
  defaultToken: 'invalid',

  tokenPostfix: '.jpe',

  keywords: [
    'interaction',
    'buff',
    'trait',
    'available_when',
    'on_success',
    'target',
    'pie_menu',
    'id',
    'name',
    'duration',
    'apply',
    'modify',
    'set',
    'to',
    'for',
    'actor',
    'target',
    'is',
    'not',
    'and',
    'or',
    'has',
    'age',
    'sleeping',
    'relationship',
    'teen_or_older',
    'child',
    'toddler',
    'adult',
    'elder',
    'statistic',
    'commodity',
    'value',
    'delta',
    'hours',
    'minutes'
  ],

  typeKeywords: [
    'Sim',
    'Object'
  ],

  operators: [
    ':',
    '-',
    '->',
    '<-'
  ],

  // we include these common regular expressions
  symbols: /[=><!~?:&|+\-*\/\^%]+/,

  // JPE is usually not case sensitive
  ignoreCase: true,
  
  // The main tokenizer for our languages
  tokenizer: {
    root: [
      // identifiers and keywords
      [/[a-z_$][\w$]*/, {
        cases: {
          '@typeKeywords': 'keyword.type',
          '@keywords': 'keyword',
          '@default': 'identifier'
        }
      }],
      [/[A-Z][\w\$]*/, 'type.identifier'], // to show class names nicely
      
      // whitespace
      { include: '@whitespace' },

      // delimiters and operators
      [/[{}()\[\]]/, '@brackets'],
      [/[<>](?!@symbols)/, '@brackets'],
      [/@symbols/, {
        cases: {
          '@operators': 'operator',
          '@default': ''
        }
      }],

      // numbers
      [/\d*\.\d+([eE][\-+]?\d+)?/, 'number.float'],
      [/0[xX][0-9a-fA-F]+/, 'number.hex'],
      [/\d+/, 'number'],

      // delimiter: after number because of .\d floats
      [/[;,.]/, 'delimiter'],

      // strings
      [/"([^"\\]|\\.)*$/, 'string.invalid'],  // non-teminated string
      [/"/, 'string', '@string_double'],

      // comments
      [/#.*$/, 'comment'],
    ],

    comment: [
      [/[^\*]+/, 'comment'],
      [/\/\*/, 'comment', '@push'],    // nested comment
      [/\*\//, 'comment', '@pop'],
      [/[\*]/, 'comment']
    ],

    string_double: [
      [/[^\\"]+/, 'string'],
      [/\\./, 'string.escape.invalid'],
      [/"/, 'string', '@pop']
    ],

    whitespace: [
      [/[ \t\r\n]+/, 'white'],
      [/\/\*/, 'comment', '@comment'],
      [/\/\/.*$/, 'comment'],
    ],
  }
};