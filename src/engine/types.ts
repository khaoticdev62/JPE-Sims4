/**
 * Type Definitions for JPE Mod Translator
 *
 * These types define the structure of:
 * - XML files (before parsing)
 * - AST (Abstract Syntax Tree - intermediate format)
 * - JPE format (human-readable)
 * - Validation errors
 *
 * LEARNING NOTE: Types are like blueprints. They tell you what shape
 * data will be. When you see `ast: ASTNode`, you know ast will have
 * the properties defined in ASTNode.
 */

/**
 * An AST Node represents one piece of the XML structure
 *
 * Example:
 * ```xml
 * <ModPackage>
 *   <Name>My Mod</Name>
 * </ModPackage>
 * ```
 *
 * Becomes:
 * ```
 * ASTNode {
 *   type: 'ModPackage',
 *   attributes: {},
 *   children: [
 *     ASTNode {
 *       type: 'Name',
 *       value: 'My Mod',
 *       children: []
 *     }
 *   ]
 * }
 * ```
 */
export interface ASTNode {
  /**
   * The tag name (e.g., "ModPackage", "Name", "Description")
   * This tells us what type of data this node contains
   */
  type: string

  /**
   * The text content inside the tag
   * For <Name>MyMod</Name>, value = "MyMod"
   * For tags with no text, value = ""
   */
  value?: string

  /**
   * Attributes from the XML tag
   * For <Item id="123">, attributes = { id: "123" }
   */
  attributes: Record<string, string>

  /**
   * Child nodes (tags inside this tag)
   * For nested XML, this array contains child AST nodes
   */
  children: ASTNode[]

  /**
   * Which line in the file this node appeared
   * Useful for error messages: "Error on line 5"
   */
  lineNumber?: number
}

/**
 * A validation error found in JPE text
 *
 * When validation fails, we create error objects that tell the user
 * what went wrong and where
 */
export interface ValidationError {
  /**
   * Which line has the error (1-based)
   * "Line 5: Missing DESCRIPTION"
   */
  line: number

  /**
   * Human-readable error message
   * "Missing DESCRIPTION field"
   */
  message: string

  /**
   * How bad is it?
   * 'error' = can't save, must fix
   * 'warning' = might work, but probably wrong
   * 'info' = just a note
   */
  severity: 'error' | 'warning' | 'info'

  /**
   * Why did this error happen?
   * Helps user understand and fix it
   */
  reason?: string

  /**
   * The actual line of code that has the error
   * Helps user see exactly what's wrong
   */
  lineContent?: string
}

/**
 * A JPE attribute (key: value pair)
 *
 * In JPE format:
 * ```
 * MODULE: MyModule
 * DESCRIPTION: "My description"
 * VERSION: 1.0
 * ```
 *
 * Each line is a JPEAttribute:
 * - key: "MODULE", value: "MyModule"
 * - key: "DESCRIPTION", value: "My description"
 * - etc.
 */
export interface JPEAttribute {
  key: string
  value: string
  lineNumber?: number
}

/**
 * Parsing result
 *
 * When you parse XML, you get either:
 * - success: true + the AST
 * - success: false + error message
 */
export interface ParseResult {
  success: boolean
  ast?: ASTNode
  error?: string
}

/**
 * Translation result
 *
 * When you translate XML to JPE, you get either:
 * - success: true + the JPE text
 * - success: false + error message
 */
export interface TranslationResult {
  success: boolean
  jpe?: string
  error?: string
}

/**
 * Compilation result
 *
 * When you compile JPE back to XML, you get either:
 * - success: true + the XML
 * - success: false + error message
 */
export interface CompilationResult {
  success: boolean
  xml?: string
  error?: string
}

/**
 * Validation result
 *
 * When you validate JPE, you get:
 * - errors: array of errors found (empty if valid)
 * - isValid: true if no errors
 */
export interface ValidationResult {
  isValid: boolean
  errors: ValidationError[]
}
