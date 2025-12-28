/**
 * Python Parser Tests
 *
 * Tests for Python script AST analysis without execution.
 */

import { describe, it, expect } from 'vitest'
import { PythonParser, parsePython } from '../PythonParser'
import type { PythonScript } from '../PythonParser'

describe('Python Parser', () => {
  describe('Basic parsing', () => {
    it('should parse empty script', () => {
      const script = PythonParser.parse('')

      expect(script).toBeDefined()
      expect(script.functions).toHaveLength(0)
      expect(script.classes).toHaveLength(0)
      expect(script.imports).toHaveLength(0)
    })

    it('should detect encoding declaration', () => {
      const source = '# -*- coding: utf-8 -*-\n\nprint("hello")'
      const script = PythonParser.parse(source)

      expect(script.encoding).toBe('utf-8')
    })

    it('should extract module docstring', () => {
      const source = `"""
This is a module docstring.
It describes what the module does.
"""

def hello():
    pass`
      const script = PythonParser.parse(source)

      expect(script.docstring).toBeTruthy()
      expect(script.docstring).toContain('module docstring')
    })
  })

  describe('Import parsing', () => {
    it('should parse simple import', () => {
      const source = 'import os'
      const script = PythonParser.parse(source)

      expect(script.imports).toHaveLength(1)
      expect(script.imports[0].type).toBe('import')
      expect(script.imports[0].module).toBe('os')
    })

    it('should parse multiple imports', () => {
      const source = 'import os, sys, json'
      const script = PythonParser.parse(source)

      expect(script.imports).toHaveLength(1)
      expect(script.imports[0].names.length).toBeGreaterThanOrEqual(1)
    })

    it('should parse from import', () => {
      const source = 'from pathlib import Path, PurePath'
      const script = PythonParser.parse(source)

      expect(script.imports).toHaveLength(1)
      expect(script.imports[0].type).toBe('from')
      expect(script.imports[0].module).toBe('pathlib')
      expect(script.imports[0].names).toContain('Path')
    })

    it('should parse import with alias', () => {
      const source = 'import numpy as np'
      const script = PythonParser.parse(source)

      expect(script.imports).toHaveLength(1)
    })

    it('should track import line numbers', () => {
      const source = `import os
import sys
import json`
      const script = PythonParser.parse(source)

      expect(script.imports[0].line).toBe(1)
      expect(script.imports[1].line).toBe(2)
      expect(script.imports[2].line).toBe(3)
    })
  })

  describe('Function parsing', () => {
    it('should parse simple function', () => {
      const source = 'def hello():\n    pass'
      const script = PythonParser.parse(source)

      expect(script.functions).toHaveLength(1)
      expect(script.functions[0].name).toBe('hello')
      expect(script.functions[0].parameters).toHaveLength(0)
    })

    it('should parse function with parameters', () => {
      const source = 'def greet(name, age):\n    pass'
      const script = PythonParser.parse(source)

      expect(script.functions[0].parameters).toContain('name')
      expect(script.functions[0].parameters).toContain('age')
    })

    it('should parse async function', () => {
      const source = 'async def fetch_data():\n    pass'
      const script = PythonParser.parse(source)

      expect(script.functions[0].isAsync).toBe(true)
      expect(script.metadata.hasAsync).toBe(true)
    })

    it('should parse function with decorators', () => {
      const source = `@property
@staticmethod
def get_value():
    pass`
      const script = PythonParser.parse(source)

      expect(script.functions[0].decorators).toHaveLength(2)
      expect(script.functions[0].decorators[0]).toContain('@property')
    })

    it('should parse function with docstring', () => {
      const source = `def calculate(x, y):
    """Add two numbers together."""
    return x + y`
      const script = PythonParser.parse(source)

      expect(script.functions[0].docstring).toContain('Add two numbers')
    })

    it('should track function line numbers', () => {
      const source = `
def first():
    pass

def second():
    pass`
      const script = PythonParser.parse(source)

      expect(script.functions[0].line).toBeGreaterThan(0)
      expect(script.functions[1].line).toBeGreaterThan(script.functions[0].line)
    })
  })

  describe('Class parsing', () => {
    it('should parse simple class', () => {
      const source = 'class MyClass:\n    pass'
      const script = PythonParser.parse(source)

      expect(script.classes).toHaveLength(1)
      expect(script.classes[0].name).toBe('MyClass')
    })

    it('should parse class with base classes', () => {
      const source = 'class MyClass(BaseClass, Mixin):\n    pass'
      const script = PythonParser.parse(source)

      expect(script.classes[0].baseClasses).toContain('BaseClass')
      expect(script.classes[0].baseClasses).toContain('Mixin')
    })

    it('should parse class with methods', () => {
      const source = `class MyClass:
    def method1(self):
        pass

    def method2(self, arg):
        pass`
      const script = PythonParser.parse(source)

      expect(script.classes[0].methods.length).toBeGreaterThanOrEqual(2)
    })

    it('should parse class docstring', () => {
      const source = `class MyClass:
    """This is a class docstring."""
    def method(self):
        pass`
      const script = PythonParser.parse(source)

      expect(script.classes[0].docstring).toContain('class docstring')
    })

    it('should track class line numbers', () => {
      const source = `
class First:
    pass

class Second:
    pass`
      const script = PythonParser.parse(source)

      expect(script.classes[0].line).toBeGreaterThan(0)
      expect(script.classes[1].line).toBeGreaterThan(script.classes[0].line)
    })
  })

  describe('Tuning injector detection', () => {
    it('should detect tuning decorator', () => {
      const source = `@tuning.Tuning.start
def inject():
    pass`
      const script = PythonParser.parse(source)

      expect(script.metadata.hasTuningInjector).toBe(true)
    })

    it('should detect inject_into decorator', () => {
      const source = `@tuning_instance('tuning_id')
def modify_tuning():
    pass`
      const script = PythonParser.parse(source)

      expect(script.metadata.hasTuningInjector).toBe(true)
    })

    it('should detect tuning_injection keyword', () => {
      const source = `
injections = []
def apply_tuning_injection():
    pass`
      const script = PythonParser.parse(source)

      expect(script.metadata.hasTuningInjector).toBe(true)
    })

    it('should not detect tuning in regular script', () => {
      const source = `def regular_function():
    print("hello")
    return 42`
      const script = PythonParser.parse(source)

      expect(script.metadata.hasTuningInjector).toBe(false)
    })
  })

  describe('Complex scripts', () => {
    it('should parse realistic Sims 4 script', () => {
      const source = `# -*- coding: utf-8 -*-
"""
Sims 4 Mod Script.
Provides custom tuning modifications.
"""

import services
import tuning
from event_testing.importer import import_tests

@tuning.Tuning.start
def inject_tuning():
    """Inject custom tuning into the game."""
    pass

class CustomBuff:
    """A custom buff implementation."""

    def __init__(self, sim_info):
        self.sim_info = sim_info

    def on_add(self):
        pass`

      const script = PythonParser.parse(source)

      expect(script.imports.length).toBeGreaterThan(0)
      expect(script.functions.length).toBeGreaterThan(0)
      expect(script.classes.length).toBeGreaterThan(0)
      expect(script.metadata.hasTuningInjector).toBe(true)
    })

    it('should handle single-line function definition with many params', () => {
      const source = `def function_with_many_params(param1, param2, param3, param4):
    pass`
      const script = PythonParser.parse(source)

      expect(script.functions.length).toBeGreaterThan(0)
      expect(script.functions[0].parameters.length).toBe(4)
    })

    it('should handle nested classes', () => {
      const source = `class Outer:
    class Inner:
        def method(self):
            pass`
      const script = PythonParser.parse(source)

      expect(script.classes.length).toBeGreaterThan(0)
    })
  })

  describe('Edge cases', () => {
    it('should handle comments', () => {
      const source = `# This is a comment
def hello():  # inline comment
    pass`
      const script = PythonParser.parse(source)

      expect(script.functions).toHaveLength(1)
    })

    it('should handle string literals containing def', () => {
      const source = `some_str = "def fake_function(): pass"
def real_function():
    pass`
      const script = PythonParser.parse(source)

      expect(script.functions).toHaveLength(1)
    })

    it('should handle default parameter values', () => {
      const source = 'def func(a, b=10, c="default"):\n    pass'
      const script = PythonParser.parse(source)

      expect(script.functions[0].parameters).toContain('a')
      expect(script.functions[0].parameters).toContain('b')
      expect(script.functions[0].parameters).toContain('c')
    })

    it('should handle type annotations', () => {
      const source = 'def func(a: int, b: str) -> str:\n    pass'
      const script = PythonParser.parse(source)

      expect(script.functions[0].parameters).toContain('a')
      expect(script.functions[0].parameters).toContain('b')
    })
  })

  describe('Performance', () => {
    it('should parse 1000-line script quickly', () => {
      let source = '"""Module docstring."""\n\nimport os\nimport sys\n\n'
      for (let i = 0; i < 50; i++) {
        source += `
def function_${i}(arg1, arg2):
    """Function ${i} docstring."""
    return arg1 + arg2

class Class_${i}:
    """Class ${i} docstring."""

    def method1(self):
        pass

    def method2(self, x):
        return x * 2
`
      }

      const start = performance.now()
      const script = PythonParser.parse(source)
      const duration = performance.now() - start

      expect(script).toBeDefined()
      expect(duration).toBeLessThan(100) // Should parse in < 100ms
    })
  })

  describe('Metadata tracking', () => {
    it('should track line count', () => {
      const source = 'def a():\n    pass\n\ndef b():\n    pass'
      const script = PythonParser.parse(source)

      expect(script.metadata.lineCount).toBe(5)
    })

    it('should detect async usage', () => {
      const source = `
def normal():
    pass

async def async_func():
    await something()
`
      const script = PythonParser.parse(source)

      expect(script.metadata.hasAsync).toBe(true)
    })

    it('should track parse time', () => {
      const source = 'def hello():\n    pass'
      const script = PythonParser.parse(source)

      expect(script.metadata.parseTime).toBeGreaterThanOrEqual(0)
      expect(script.metadata.parseTime).toBeLessThan(100)
    })
  })
})
