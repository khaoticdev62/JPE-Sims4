/**
 * JPE Design System — Font & Typography Tests
 *
 * Ensures all design system components use consistent fonts, weights, and typography tokens.
 * Catches font regressions before they reach production.
 *
 * @jest-environment jsdom
 */

import { T } from '@/components/robust/jpe-theme'

// ─── Font Token Tests ───────────────────────────────────────────────

describe('JPE Design System: Font Tokens', () => {
  it('defines sans font family with Inter as primary', () => {
    expect(T.sans).toBeDefined()
    expect(T.sans).toContain('Inter')
    expect(T.sans).toContain('system-ui')
    expect(T.sans).toMatch(/^'Inter'/)
  })

  it('defines mono font family with JetBrains Mono as primary', () => {
    expect(T.mono).toBeDefined()
    expect(T.mono).toContain('JetBrains Mono')
    expect(T.mono).toContain('Fira Code')
    expect(T.mono).toMatch(/^'JetBrains Mono'/)
  })

  it('defines display font family with Outfit as primary', () => {
    expect(T.display).toBeDefined()
    expect(T.display).toContain('Outfit')
    expect(T.display).toContain('Inter')
    expect(T.display).toMatch(/^'Outfit'/)
  })

  it('defines consistent font weights', () => {
    expect(T.fontLight).toBe(300)
    expect(T.fontRegular).toBe(400)
    expect(T.fontMedium).toBe(500)
    expect(T.fontSemibold).toBe(600)
    expect(T.fontBold).toBe(700)
    expect(T.fontExtrabold).toBe(800)
  })

  it('defines font sizes in px format', () => {
    expect(T.textXs).toBe('9px')
    expect(T.textSm).toBe('10px')
    expect(T.textBase).toBe('11px')
    expect(T.textMd).toBe('12px')
    expect(T.textLg).toBe('13px')
    expect(T.textXl).toBe('14px')
    expect(T.text2Xl).toBe('16px')
  })

  it('defines letter spacing', () => {
    expect(T.trackingTight).toBe('0.02em')
    expect(T.trackingWide).toBe('0.14em')
  })

  it('has all required font properties', () => {
    const requiredFontProps = [
      'sans', 'mono', 'display',
      'fontLight', 'fontRegular', 'fontMedium', 'fontSemibold', 'fontBold', 'fontExtrabold',
      'textXs', 'textSm', 'textBase', 'textMd', 'textLg', 'textXl', 'text2Xl',
      'trackingTight', 'trackingWide',
    ]

    for (const prop of requiredFontProps) {
      expect(T).toHaveProperty(prop)
      expect((T as any)[prop]).toBeDefined()
    }
  })
})

// ─── Font Consistency Tests ─────────────────────────────────────────

describe('JPE Design System: Font Consistency', () => {
  it('mono font is suitable for code editors (monospace)', () => {
    expect(T.mono).toContain('monospace')
  })

  it('font stack includes proper fallbacks', () => {
    // Sans should have system-ui fallback
    expect(T.sans).toContain('system-ui')
    // Mono should have Fira Code fallback
    expect(T.mono).toContain('Fira Code')
    // Display should have Inter fallback
    expect(T.display).toContain('Inter')
  })

  it('font weights are within valid CSS range (100-900)', () => {
    const weights = [T.fontLight, T.fontRegular, T.fontMedium, T.fontSemibold, T.fontBold, T.fontExtrabold]
    for (const weight of weights) {
      expect(weight).toBeGreaterThanOrEqual(100)
      expect(weight).toBeLessThanOrEqual(900)
    }
  })

  it('font sizes are valid CSS values (px format)', () => {
    const sizes = [T.textXs, T.textSm, T.textBase, T.textMd, T.textLg, T.textXl, T.text2Xl]
    for (const size of sizes) {
      expect(typeof size).toBe('string')
      expect(size).toMatch(/^\d+px$/)
    }
  })

  it('letter spacing values are valid CSS em units', () => {
    expect(T.trackingTight).toMatch(/^\d+\.?\d*em$/)
    expect(T.trackingWide).toMatch(/^\d+\.?\d*em$/)
  })

  it('font families are properly quoted for multi-word fonts', () => {
    // Multi-word font names should be quoted
    expect(T.mono).toContain("'JetBrains Mono'")
    expect(T.mono).toContain("'Fira Code'")
    expect(T.sans).toContain("'Inter'")
    expect(T.display).toContain("'Outfit'")
  })
})

// ─── Font Usage Guidelines Tests ────────────────────────────────────

describe('JPE Design System: Font Usage Guidelines', () => {
  it('uses sans font for UI elements', () => {
    // T.sans should be used for buttons, labels, inputs
    expect(T.sans).toBe("'Inter', system-ui, sans-serif")
  })

  it('uses mono font for code/technical content', () => {
    // T.mono should be used for code, hashes, file paths
    expect(T.mono).toBe("'JetBrains Mono', 'Fira Code', monospace")
  })

  it('uses display font for headings/titles', () => {
    // T.display should be used for headers, hero text
    expect(T.display).toBe("'Outfit', 'Inter', system-ui, sans-serif")
  })

  it('has appropriate contrast between font sizes', () => {
    // Each size should be at least 1px larger than previous
    const sizes = [
      parseInt(T.textXs),
      parseInt(T.textSm),
      parseInt(T.textBase),
      parseInt(T.textMd),
      parseInt(T.textLg),
      parseInt(T.textXl),
      parseInt(T.text2Xl),
    ]
    
    for (let i = 1; i < sizes.length; i++) {
      expect(sizes[i]).toBeGreaterThan(sizes[i - 1])
    }
  })

  it('has proper font weight hierarchy', () => {
    const weights = [
      T.fontLight,
      T.fontRegular,
      T.fontMedium,
      T.fontSemibold,
      T.fontBold,
      T.fontExtrabold,
    ]
    
    for (let i = 1; i < weights.length; i++) {
      expect(weights[i]).toBeGreaterThan(weights[i - 1])
    }
  })
})
