# Phase 1: Getting Started with v0.1 Development

**Timeline**: Weeks 1-2
**Goal**: Understand the architecture and get the XML parser working
**What You'll Learn**: How parsing works, how to read code, how we work together

---

## What Just Happened

I've created:

1. **CLAUDE_CODE_PARTNERSHIP_GUIDE.md**
   - How we'll work together
   - How to read code and learn
   - Communication strategy
   - What to expect at each week

2. **V01_SIMPLIFIED_ARCHITECTURE.md**
   - The 3-layer architecture (super simple)
   - What we're building and not building
   - Success criteria for v0.1
   - Feature list (very focused)

3. **Code Files**:
   - `src/engine/types.ts` - Type definitions
   - `src/engine/xmlParser.ts` - XML → AST parser
   - `src/engine/xmlParser.test.ts` - Tests showing how to use it

---

## Right Now: Your Assignment

### Step 1: Read the Guides (1 hour)
- [ ] Read CLAUDE_CODE_PARTNERSHIP_GUIDE.md
- [ ] Read V01_SIMPLIFIED_ARCHITECTURE.md
- [ ] Take notes on things you don't understand

### Step 2: Read the Code (2-3 hours)
This is the most important part. Don't try to understand 100%, just:

**First Pass - High Level (30 min)**:
```typescript
// Open src/engine/types.ts
// Read the comments explaining each type
// You're learning: "These are the shapes data takes"
```

**Second Pass - The Parser (1 hour)**:
```typescript
// Open src/engine/xmlParser.ts
// Read the COMMENTS first, ignore the code details
// Questions to answer:
// - What does parseXML() do?
// - What is an AST?
// - What are the helper functions?
// - Can you explain the flow in your own words?
```

**Third Pass - The Tests (1 hour)**:
```typescript
// Open src/engine/xmlParser.test.ts
// Read the tests to see how to USE the parser
// Each test shows: input → expected output
// Questions to answer:
// - What XML structures can it parse?
// - What errors does it catch?
// - How do you call the parser?
```

### Step 3: Try It Out (1-2 hours)

Create a file called `LEARNING_NOTES.md` in your project root:

```markdown
# My Learning Notes

## Week 1-2: XML Parser

### What I Learned
(Fill in as you read the code)

### Questions I Have
- Question 1?
- Question 2?

### Code I Don't Understand
- The parseNode() function - I don't understand recursion yet
- The regex in parseAttributes - what does \w+ mean?

### Concepts I Now Understand
- What an AST is
- How parsers work
```

Start filling this in as you read. Bring your questions to Friday's call.

---

## How to Work With This Code

### Reading the XML Parser

The parser has several functions. In order of importance:

#### 1. **parseXML()** - The main function
```typescript
export function parseXML(xmlContent: string): ParseResult {
  // This is the entry point
  // Give it XML text, get back a ParseResult
  // ParseResult is either:
  // - success: true + ast (the tree)
  // - success: false + error (what went wrong)
}
```

**LEARNING**: This is what you call when you have XML and want to convert it.

#### 2. **parseNode()** - The recursive parser
```typescript
function parseNode(content: string, startPos: number) {
  // This reads one tag and all its children
  // It calls itself recursively for nested tags
}
```

**LEARNING**: This is the complex part. It's called recursively because XML nests (tags inside tags inside tags...).

#### 3. **Helper functions** - Make life easier
```typescript
findChild()     // Find first child with tag name
findChildren()  // Find all children with tag name
getChildValue() // Get text value of a child
```

**LEARNING**: These are shortcuts for common operations. After parsing, you'll use these to navigate the tree.

---

## What the Parser Does (In Plain English)

```
INPUT: Raw XML text
       "<Root><Name>Test</Name></Root>"

STEP 1: Find opening tag
       "Root" (now we know what this node is)

STEP 2: Read children
       Find "<Name>Test</Name>" inside

STEP 3: Find closing tag
       "</Root>" (confirm this was the right tag)

OUTPUT: Tree structure (AST)
        {
          type: "Root",
          children: [
            { type: "Name", value: "Test" }
          ]
        }
```

The parser is like reading a legal document:
- Find the opening statement: "This contract between..."
- Read the body: all the clauses
- Find the closing: "Signed this date..."
- Result: you understand the structure

---

## Understanding the Tests

Tests are how you learn to USE code.

### Example Test
```typescript
it('should parse simple XML', () => {
  const xml = '<Root><Name>Test</Name></Root>'

  const result = parseXML(xml)

  expect(result.success).toBe(true)
  expect(result.ast!.children[0].value).toBe('Test')
})
```

This shows:
- INPUT: Simple XML
- ACTION: Call parseXML()
- EXPECTED: success:true and the value "Test"

**LEARNING**: When you want to know how something works, look at a test. Tests are clean examples.

---

## Key Concepts to Understand This Week

### 1. What is an AST?
**Abstract Syntax Tree** = a tree representation of code/data structure

```
XML:                    AST:
<A>                     A
  <B>val</B>         ├─ B (value: "val")
  <C/>               └─ C (no value)
</A>
```

The tree structure makes it easy to work with.

### 2. What is Recursion?
A function that calls itself to handle nested structures

```
Parse(text):
  Read opening tag (A)
  For each child:
    Parse(child)  ← calls itself!
  Read closing tag
```

With recursion, you handle any nesting depth with the same code.

### 3. What is a Type?
A type is a shape/blueprint:

```typescript
interface ASTNode {
  type: string        // Every node has a type
  value?: string      // Sometimes has a value
  children: ASTNode[] // Can have child nodes
}
```

When you see `ast: ASTNode`, you know it has `.type`, `.value`, and `.children`.

---

## Debugging Tips (When you get stuck)

### If you don't understand a function:
1. Find a test that uses it
2. Read the test first (simpler than the code)
3. Now the code makes more sense

### If the code feels complicated:
1. Read the COMMENTS first, skip the code
2. Understand WHAT it does, not HOW it works
3. You can learn HOW later

### If you see an error:
1. The error message usually tells you the problem
2. It often tells you the line number
3. Read that line in context
4. If confused, ask me

---

## This Week's Milestones

### By Wednesday:
- [ ] I've read the partnership guide
- [ ] I've read the simplified architecture
- [ ] I understand what the parser does (at high level)
- [ ] I've started reading the code

### By Friday:
- [ ] I've read all three code files
- [ ] I've taken notes on confusing parts
- [ ] I can explain (in simple terms) what parseXML() does
- [ ] I have questions ready for the code review

### By Next Week:
- [ ] I understand how parsing works
- [ ] I can read the test file and follow it
- [ ] I know what the next module (JPE Translator) will do
- [ ] I'm excited to keep going

---

## Questions You Should Be Able to Answer by Friday

1. **What does parseXML() take as input?**
   - Answer: A string containing XML text

2. **What does it return?**
   - Answer: A ParseResult with success flag and either ast or error

3. **What is an AST?**
   - Answer: A tree structure representing the XML hierarchy

4. **How does the parser handle nested tags?**
   - Answer: With recursion - parseNode calls itself for children

5. **What do the helper functions (findChild, getChildValue) do?**
   - Answer: They help navigate the AST tree to find specific nodes

If you can answer these, you understand the core concept.

---

## Common Confusions (Addressed)

### "Why is the code so commented?"
Because you're learning! Comments explain the WHY. Regular code only shows the HOW.

### "Why is parsing so complicated?"
Because XML nesting is complex. To handle `<a><b><c>` at any depth, you need recursion.

### "Do I need to understand every line?"
No. Understand the overall flow. Details come later.

### "Will this code work with real Sims 4 mods?"
Yes! It handles nested structures, attributes, text content, self-closing tags, all the things real mods have.

### "What if I break something?"
You can't break anything permanently. Git lets you undo changes. Experiment freely.

---

## How to Ask Questions

When you're confused about the parser, ask like this:

**INSTEAD OF**: "I don't understand parseNode"

**SAY**: "In parseNode(), why does it call itself recursively? I see `parseNode(content, pos)` inside parseNode. How does that work? Can you walk me through an example?"

The second one gives me enough context to help you properly.

---

## What Comes Next (Preview)

Next week (after you understand the parser), I'll build:

**jpeTranslator.ts** - Converts AST to JPE text

It will be simpler than the parser because:
- No recursion needed (we just walk the tree)
- No error handling (parser already found errors)
- Just format the data nicely

You'll see how we take the output of parseXML() and turn it into human-readable JPE.

---

## Ready?

1. Read the guides
2. Read the code (use the reading strategy above)
3. Take notes
4. Save your questions

Friday we'll do a code review where I explain everything and you ask questions.

Let's do this! 🚀

---

## Quick Reference

| File | What | Read When |
|------|------|-----------|
| types.ts | Type definitions | Need to understand data shapes |
| xmlParser.ts | XML → AST parser | Learning how parsing works |
| xmlParser.test.ts | Tests/examples | Want to see how to use the parser |
| LEARNING_NOTES.md | Your notes | You want to track your learning |

---

**Next Checkpoint**: Friday code review
**Estimated Time**: 4-5 hours of reading/learning
**Difficulty**: Medium (parsing is a real concept, but well-explained)
**Confusion Level**: Normal (should be confused sometimes - means you're learning)

You got this! 💪
