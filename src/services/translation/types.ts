export enum TokenType {
  // Keywords
  WHEN = 'WHEN',
  DO = 'DO',
  ONLY_IF = 'ONLY_IF',
  CONDITIONS = 'CONDITIONS',
  LOCALIZATION = 'LOCALIZATION',
  
  // Literals
  IDENTIFIER = 'IDENTIFIER',
  STRING = 'STRING',
  NUMBER = 'NUMBER',
  BOOLEAN = 'BOOLEAN',

  // Operators & Punctuation
  COLON = 'COLON',      // :
  LPAREN = 'LPAREN',    // (
  RPAREN = 'RPAREN',    // )
  LBRACE = 'LBRACE',    // {
  RBRACE = 'RBRACE',    // }
  COMMA = 'COMMA',      // ,
  EQUALS = 'EQUALS',    // =
  DASH = 'DASH',        // -
  NAMESPACE = 'NAMESPACE',
  
  // Special
  EOF = 'EOF',
  ERROR = 'ERROR'
}

export interface Token {
  type: TokenType
  value: string
  line: number
  column: number
  start: number
  end: number
}

// --- AST Definitions ---

export enum AstNodeType {
  PROGRAM = 'PROGRAM',
  INTERACTION = 'INTERACTION',
  PROPERTY = 'PROPERTY',
  BLOCK = 'BLOCK', // e.g., tests, effects
  TEST = 'TEST',
  ACTION = 'ACTION',
  LITERAL = 'LITERAL',
  LOCALIZATION = 'LOCALIZATION',
  LOCALIZATION_ENTRY = 'LOCALIZATION_ENTRY'
}

export interface BaseAstNode {
  type: AstNodeType
  line: number
  column: number
}

export interface LiteralNode extends BaseAstNode {
  type: AstNodeType.LITERAL
  value: string | number | boolean
}

export interface PropertyNode extends BaseAstNode {
  type: AstNodeType.PROPERTY
  name: string
  value: LiteralNode | BlockNode
}

export interface BlockNode extends BaseAstNode {
  type: AstNodeType.BLOCK
  name: string // e.g., "tests", "effects"
  children: (TestNode | ActionNode | PropertyNode | BlockNode)[]
}

export interface TestNode extends BaseAstNode {
  type: AstNodeType.TEST
  condition: string
  params?: string[] // Optional parameters extracted from the condition string
}

export interface ActionNode extends BaseAstNode {
  type: AstNodeType.ACTION
  action: string
  params?: string[] // Optional parameters extracted from the action string
}


export interface InteractionNode extends BaseAstNode {
  type: AstNodeType.INTERACTION
  name: string
  instanceId?: string // Meta: Sims 4 hex ID (e.g. 0x0123)
  className?: string // Meta: the Sims 4 class (e.g. SocialSuperInteraction)
  moduleName?: string // Meta: the module path (e.g. interactions.base.interaction)
  properties: (PropertyNode | BlockNode)[]
}

export interface LocalizationEntryNode extends BaseAstNode {
  type: AstNodeType.LOCALIZATION_ENTRY
  locale: string // e.g. "EN", "FR"
  text: string
}

export interface LocalizationNode extends BaseAstNode {
  type: AstNodeType.LOCALIZATION
  entries: LocalizationEntryNode[]
}

export interface ProgramNode extends BaseAstNode {
  type: AstNodeType.PROGRAM
  namespace?: string
  localization?: LocalizationNode
  children: InteractionNode[]
}

export type AstNode = 
  | ProgramNode 
  | InteractionNode 
  | PropertyNode 
  | BlockNode 
  | TestNode 
  | ActionNode 
  | LiteralNode
  | LocalizationNode
  | LocalizationEntryNode
