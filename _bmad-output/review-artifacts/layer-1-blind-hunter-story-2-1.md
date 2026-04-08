# Code Review Layer 1: Blind Hunter (Adversarial)

You are an elite code reviewer performing a **Blind Search**. You receive ONLY THE DIFF of the JPE Lexer changes. Your goal is to find bugs, logical inconsistencies, code smells, and potential security issues without knowing the project context.

## The Diff

```diff
--- a/src/services/translation/types.ts
+++ b/src/services/translation/types.ts
@@ -0,0 +1,28 @@
+export enum TokenType {
+  WHEN = 'WHEN',
+  DO = 'DO',
+  ONLY_IF = 'ONLY_IF',
+  CONDITIONS = 'CONDITIONS',
+  LOCALIZATION = 'LOCALIZATION',
+  IDENTIFIER = 'IDENTIFIER',
+  STRING = 'STRING',
+  NUMBER = 'NUMBER',
+  BOOLEAN = 'BOOLEAN',
+  COLON = 'COLON',      // :
+  LPAREN = 'LPAREN',    // (
+  RPAREN = 'RPAREN',    // )
+  COMMA = 'COMMA',      // ,
+  EQUALS = 'EQUALS',    // =
+  EOF = 'EOF',
+  ERROR = 'ERROR'
+}
+
+export interface Token {
+  type: TokenType
+  value: string
+  line: number
+  column: number
+  start: number
+  end: number
+}

--- a/src/services/translation/lexer.ts
+++ b/src/services/translation/lexer.ts
@@ -0,0 +1,167 @@
+import { Token, TokenType } from './types'
+
+export class JPELexer {
+  private source: string
+  private pos: number = 0
+  private line: number = 1
+  private column: number = 1
+  private tokens: Token[] = []
+
+  private static KEYWORDS: Record<string, TokenType> = {
+    'WHEN': TokenType.WHEN,
+    'DO': TokenType.DO,
+    'ONLY_IF': TokenType.ONLY_IF,
+    'CONDITIONS': TokenType.CONDITIONS,
+    'LOCALIZATION': TokenType.LOCALIZATION,
+    'true': TokenType.BOOLEAN,
+    'false': TokenType.BOOLEAN,
+  }
+
+  constructor(source: string) {
+    this.source = source
+  }
+
+  tokenize(): Token[] {
+    while (!this.isAtEnd()) {
+      this.scanToken()
+    }
+    this.addToken(TokenType.EOF, '')
+    return this.tokens
+  }
+
+  private scanToken() {
+    const char = this.advance()
+    switch (char) {
+      case '(': this.addToken(TokenType.LPAREN, '('); break
+      case ')': this.addToken(TokenType.RPAREN, ')'); break
+      case ':': this.addToken(TokenType.COLON, ':'); break
+      case ',': this.addToken(TokenType.COMMA, ','); break
+      case '=': this.addToken(TokenType.EQUALS, '='); break
+      case '#': while (this.peek() !== '\n' && !this.isAtEnd()) this.advance(); break
+      case ' ': case '\r': case '\t': break
+      case '\n': this.line++; this.column = 1; break
+      case '"': this.string(); break
+      default:
+        if (this.isDigit(char)) this.number()
+        else if (this.isAlpha(char)) this.identifier()
+        else this.addToken(TokenType.ERROR, `Unexpected character: ${char}`)
+        break
+    }
+  }
+
+  private identifier() {
+    let value = this.source[this.pos - 1]
+    while (this.isAlphaNumeric(this.peek()) || this.peek() === '_') value += this.advance()
+    const type = JPELexer.KEYWORDS[value] || TokenType.IDENTIFIER
+    this.addToken(type, value)
+  }
+
+  private number() {
+    let value = this.source[this.pos - 1]
+    while (this.isDigit(this.peek())) value += this.advance()
+    if (this.peek() === '.' && this.isDigit(this.peekNext())) {
+      value += this.advance()
+      while (this.isDigit(this.peek())) value += this.advance()
+    }
+    this.addToken(TokenType.NUMBER, value)
+  }
+
+  private string() {
+    let value = ''
+    while (this.peek() !== '"' && !this.isAtEnd()) {
+      if (this.peek() === '\n') { this.line++; this.column = 1; }
+      value += this.advance()
+    }
+    if (this.isAtEnd()) { this.addToken(TokenType.ERROR, 'Unterminated string.'); return; }
+    this.advance()
+    this.addToken(TokenType.STRING, value)
+  }
+
+  private addToken(type: TokenType, value: string) {
+    const end = this.pos
+    const start = end - value.length - (type === TokenType.STRING ? 2 : 0)
+    this.tokens.push({ type, value, line: this.line, column: this.column - value.length, start, end })
+  }
+
+  private advance(): string { const char = this.source[this.pos++]; this.column++; return char; }
+  private peek(): string { if (this.isAtEnd()) return '\0'; return this.source[this.pos]; }
+  private peekNext(): string { if (this.pos + 1 >= this.source.length) return '\0'; return this.source[this.pos + 1]; }
+  private isAtEnd(): boolean { return this.pos >= this.source.length; }
+  private isDigit(char: string): boolean { return char >= '0' && char <= '9' }
+  private isAlpha(char: string): boolean { return (char >= 'a' && char <= 'z') || (char >= 'A' && char <= 'Z') || char === '_' }
+  private isAlphaNumeric(char: string): boolean { return this.isAlpha(char) || this.isDigit(char) }
+}
+```

**Review Goals:**
1.  **Logical Correctness**: How are strings and numbers handled?
2.  **Side-effects**: Are there indexing or infinite loop risks?
3.  **Boundary Conditions**: Look at `peek()` and `peekNext()`.

**Please provide your findings as an adversarial report.**
