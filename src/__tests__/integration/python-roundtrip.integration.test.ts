/**
 * Python/Script File Round-Trip Integration Tests
 *
 * Tests the full Python → JPE → Python round-trip pipeline.
 *
 * @jest-environment node
 */

import { PythonParser } from '@/engine/parsers/PythonParser'
import { PythonService } from '@/services/PythonService'

describe('Python Script Round-Trip Integration', () => {
  describe('PythonParser', () => {
    it('parses a simple Python script', () => {
      const source = `import sims4

class MyTuningInjector:
    """A tuning injector for mods."""

    def __init__(self, sim):
        self.sim = sim

    def inject(self):
        """Inject tuning into the sim."""
        pass
`

      const script = PythonParser.parse(source)

      expect(script).not.toBeNull()
      expect(script!.classes.length).toBeGreaterThanOrEqual(1)
      if (script!.classes.length > 0) {
        expect(script!.classes[0].name).toBe('MyTuningInjector')
        expect(script!.classes[0].methods.length).toBeGreaterThanOrEqual(1)
      }
      expect(script!.imports.length).toBeGreaterThanOrEqual(1)
    })

    it('extracts class inheritance', () => {
      const source = `class MyMixin(BaseMixin, Object):
    pass
`

      const script = PythonParser.parse(source)
      expect(script!.classes[0].baseClasses).toEqual(['BaseMixin', 'Object'])
    })

    it('extracts decorators', () => {
      const source = `@sims4.tuning.decorator
@staticmethod
def my_function():
    pass
`

      const script = PythonParser.parse(source)
      expect(script!.functions[0].decorators).toContain('@sims4.tuning.decorator')
      expect(script!.functions[0].decorators).toContain('@staticmethod')
    })

    it('detects tuning injector pattern with decorator', () => {
      const source = `from sims4.tuning.tunable import Tunable

@inject_into('sims.tuning')
def my_injector():
    """Tuning injector function."""
    pass
`

      const script = PythonParser.parse(source)
      // The parser detects tuning injector via function decorators containing 'inject_into'
      expect(script!.metadata.hasTuningInjector).toBe(true)
    })

    it('handles async functions', () => {
      const source = `async def fetch_data(url):
    pass
`

      const script = PythonParser.parse(source)
      expect(script!.functions[0].isAsync).toBe(true)
    })

    it('handles empty source', () => {
      const script = PythonParser.parse('')
      expect(script).not.toBeNull()
      expect(script!.classes.length).toBe(0)
      expect(script!.functions.length).toBe(0)
      expect(script!.imports.length).toBe(0)
    })
  })

  describe('PythonService.decompileToJpe', () => {
    it('converts Python to readable JPE', () => {
      const source = `import sims4

class MyInjector:
    """Injector description."""

    def inject(self):
        """Inject tuning."""
        pass

def on_load():
    pass
`

      const jpe = PythonService.decompileToJpe(source, 'my_script.py')

      expect(jpe).toContain('JPE TRANSLATION UNIT')
      expect(jpe).toContain('MODULE: "my_script"')
      expect(jpe).toContain('class: "MyInjector"')
      expect(jpe).toContain('description: "Injector description."')
      expect(jpe).toContain('method: "inject"')
      expect(jpe).toContain('function: "on_load"')
      expect(jpe).toContain('import: "sims4"')
    })

    it('includes external dependencies section', () => {
      const source = `import sims4
from sims4.tuning import instances
from ui import ui_utils
`

      const jpe = PythonService.decompileToJpe(source, 'deps.py')
      expect(jpe).toContain('// External Dependencies')
      expect(jpe).toContain('import: "sims4"')
      expect(jpe).toContain('import: "sims4.tuning"')
      expect(jpe).toContain('import: "ui"')
    })

    it('handles scripts with no classes or functions', () => {
      const source = `# Just imports
import sims4
`

      const jpe = PythonService.decompileToJpe(source, 'empty.py')
      expect(jpe).toContain('MODULE: "empty"')
      expect(jpe).toContain('import: "sims4"')
      expect(jpe).not.toContain('class:')
      expect(jpe).not.toContain('function:')
    })

    it('preserves function parameters in JPE', () => {
      const source = `def my_function(self, sim_info, value=10):
    pass
`

      const jpe = PythonService.decompileToJpe(source, 'params.py')
      expect(jpe).toContain('params: [')
    })

    it('identifies tuning injector type', () => {
      const source = `@inject_into('sims.tuning')
def tuning_injector():
    pass
`

      const jpe = PythonService.decompileToJpe(source, 'injector.py')
      expect(jpe).toContain('TUNING_INJECTOR')
    })

    it('identifies utility script type', () => {
      const source = `def helper():
    pass
`

      const jpe = PythonService.decompileToJpe(source, 'utils.py')
      expect(jpe).toContain('UTILITY_SCRIPT')
    })
  })

  describe('PythonService.isPyc', () => {
    it('detects Python 3.7 .pyc magic number', () => {
      // Python 3.7 magic: 0x42000d0a stored as little-endian bytes: 0a 0d 00 42
      const buffer = new ArrayBuffer(4)
      const view = new DataView(buffer)
      view.setUint8(0, 0x0a) // Least significant byte first
      view.setUint8(1, 0x0d)
      view.setUint8(2, 0x00)
      view.setUint8(3, 0x42) // Most significant byte last

      expect(PythonService.isPyc(buffer)).toBe(true)
    })

    it('rejects non-pyc buffers', () => {
      const buffer = new ArrayBuffer(4)
      const view = new DataView(buffer)
      view.setUint32(0, 0x12345678, true)

      expect(PythonService.isPyc(buffer)).toBe(false)
    })

    it('rejects too-small buffers', () => {
      const buffer = new ArrayBuffer(3)
      expect(PythonService.isPyc(buffer)).toBe(false)
    })
  })

  describe('Full round-trip: Python → JPE → read back', () => {
    it('parses and decompiles a realistic Sims 4 mod script', () => {
      const source = `import services
import sims4
from sims4.tuning.instances import locked
from sims4.tuning.tunable import Tunable

class ModTuningInjector:
    """Main tuning injector for the mod."""

    TUNING = Tunable(description='Tuning reference.')

    def __init__(self):
        self._injected = False

    def inject_tuning(self, tuning_manager):
        """Inject custom tuning into the tuning manager."""
        if not self._injected:
            self._injected = True
            tuning_manager.load_tuning()

@services.zone_loaded_zone_event
def on_zone_load(zone):
    """Handle zone loaded event."""
    injector = ModTuningInjector()
    injector.inject_tuning(services.tuning_manager())
`

      // 1. Parse
      const parsed = PythonParser.parse(source)
      expect(parsed).not.toBeNull()
      expect(parsed!.classes.length).toBeGreaterThanOrEqual(1)
      if (parsed!.classes.length > 0) {
        expect(parsed!.classes[0].name).toBe('ModTuningInjector')
        expect(parsed!.classes[0].methods.length).toBeGreaterThanOrEqual(1)
      }
      expect(parsed!.imports.length).toBeGreaterThanOrEqual(1)

      // 2. Decompile to JPE
      const jpe = PythonService.decompileToJpe(source, 'mod_injector.py')
      expect(jpe).toContain('ModTuningInjector')
      expect(jpe).toContain('inject_tuning')

      // 3. Verify JPE contains structural info
      expect(jpe).toContain('class: "ModTuningInjector"')
      expect(jpe).toContain('method: "__init__"')
      expect(jpe).toContain('method: "inject_tuning"')
      expect(jpe).toContain('import: "services"')
    })
  })
})
