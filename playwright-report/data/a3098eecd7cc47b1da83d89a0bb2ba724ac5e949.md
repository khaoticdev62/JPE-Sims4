# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: playground.e2e.ts >> E2E: JPE Playground Full-Screen Verification >> should navigate back to dashboard via the Return button
- Location: src\__tests__\e2e\specs\playground.e2e.ts:54:7

# Error details

```
Test timeout of 30000ms exceeded while running "beforeEach" hook.
```

```
Error: locator.click: Test timeout of 30000ms exceeded.
Call log:
  - waiting for locator('[data-testid="nav-playground"]')
    - locator resolved to <button data-testid="nav-playground" class="group relative w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 outline-none text-text-secondary hover:text-text-primary hover:bg-white/5">…</button>
  - attempting click action
    2 × waiting for element to be visible, enabled and stable
      - element is visible, enabled and stable
      - scrolling into view if needed
      - done scrolling
      - <div class="fixed inset-0 z-[9000] flex items-center justify-center cursor-pointer">…</div> intercepts pointer events
    - retrying click action
    - waiting 20ms
    2 × waiting for element to be visible, enabled and stable
      - element is visible, enabled and stable
      - scrolling into view if needed
      - done scrolling
      - <div class="fixed inset-0 z-[9000] flex items-center justify-center cursor-pointer">…</div> intercepts pointer events
    - retrying click action
      - waiting 100ms
    55 × waiting for element to be visible, enabled and stable
       - element is visible, enabled and stable
       - scrolling into view if needed
       - done scrolling
       - <div class="fixed inset-0 z-[9000] flex items-center justify-center cursor-pointer">…</div> intercepts pointer events
     - retrying click action
       - waiting 500ms

```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - generic [ref=e2]:
    - generic [ref=e3] [cursor=pointer]:
      - generic [ref=e4]:
        - img [ref=e5]
        - text: click to skip · 3s
      - generic [ref=e8]:
        - img [ref=e13]
        - generic [ref=e17]:
          - generic [ref=e18]: JPE Studio
          - generic [ref=e19]: SIMS 4 MOD DEVELOPMENT ENVIRONMENT
          - generic [ref=e20]: v4.2.0 · Phase 20 Complete
        - generic [ref=e21]:
          - generic [ref=e26]: Initializing workspace…
          - generic [ref=e29]: Loading project index…
          - generic [ref=e32]: Parsing STBL databases…
          - generic [ref=e35]: Resolving dependency graph…
          - generic [ref=e38]: Applying workspace profile…
          - generic [ref=e41]: Ready.
        - generic [ref=e44]:
          - generic [ref=e45]: RECENT PROJECTS
          - generic [ref=e46]:
            - button "Evil_Trait_Override today" [ref=e47]:
              - img [ref=e48]
              - generic [ref=e51]:
                - generic [ref=e52]: Evil_Trait_Override
                - generic [ref=e53]: today
              - img [ref=e54]
            - button "VillainCareer_v2 2 days ago" [ref=e56]:
              - img [ref=e57]
              - generic [ref=e60]:
                - generic [ref=e61]: VillainCareer_v2
                - generic [ref=e62]: 2 days ago
              - img [ref=e63]
            - button "HauntedLot_Expansion 1 week ago" [ref=e65]:
              - img [ref=e66]
              - generic [ref=e69]:
                - generic [ref=e70]: HauntedLot_Expansion
                - generic [ref=e71]: 1 week ago
              - img [ref=e72]
            - button "MischiefSkill_Overhaul 2 weeks ago" [ref=e74]:
              - img [ref=e75]
              - generic [ref=e78]:
                - generic [ref=e79]: MischiefSkill_Overhaul
                - generic [ref=e80]: 2 weeks ago
              - img [ref=e81]
        - generic [ref=e84]:
          - img [ref=e85]
          - generic [ref=e87]:
            - generic [ref=e88]: TIP OF THE DAY
            - paragraph [ref=e89]: The Translation Memory (Ctrl+Shift+N) automatically suggests re-usable translations.
    - navigation [ref=e90]:
      - generic [ref=e92]:
        - img [ref=e94]
        - generic [ref=e96]:
          - heading "JPE STUDIO" [level=2] [ref=e97]
          - paragraph [ref=e98]: SPECTRAL OVERHAUL
      - generic [ref=e100]:
        - button "HOME DASHBOARD" [ref=e101] [cursor=pointer]:
          - img [ref=e104]
          - generic [ref=e107]: HOME DASHBOARD
        - button "PROJECTS EXPLORER" [ref=e108] [cursor=pointer]:
          - img [ref=e110]
          - generic [ref=e112]: PROJECTS EXPLORER
        - button "STUDIO WORKSPACE" [ref=e113] [cursor=pointer]:
          - img [ref=e115]
          - generic [ref=e117]: STUDIO WORKSPACE
        - button "TS4REBELS PORTAL" [ref=e118] [cursor=pointer]:
          - img [ref=e120]
          - generic [ref=e122]: TS4REBELS PORTAL
        - button "JPE MANUAL" [ref=e123] [cursor=pointer]:
          - img [ref=e125]
          - generic [ref=e128]: JPE MANUAL
        - button "JPE PLAYGROUND" [ref=e129] [cursor=pointer]:
          - img [ref=e131]
          - generic [ref=e133]: JPE PLAYGROUND
        - button "APP SETTINGS" [ref=e134] [cursor=pointer]:
          - img [ref=e136]
          - generic [ref=e139]: APP SETTINGS
      - generic [ref=e141]:
        - generic [ref=e142]:
          - generic [ref=e143]: "SYS_STATUS:"
          - generic [ref=e146]: NOMINAL
        - paragraph [ref=e147]: "Build v4.2.0 • Build ID: 56884"
    - generic [ref=e148]:
      - generic [ref=e149]:
        - generic [ref=e150]:
          - generic [ref=e151]:
            - button "File" [ref=e152] [cursor=pointer]
            - button "Edit" [ref=e153] [cursor=pointer]
            - button "View" [ref=e154] [cursor=pointer]
            - button "Project" [disabled] [ref=e155]
            - button "Help" [ref=e156] [cursor=pointer]
          - generic [ref=e158]:
            - img [ref=e159]
            - img [ref=e164]
            - heading "JPE STUDIO" [level=1] [ref=e166]
          - generic [ref=e167]:
            - button "IGNITION" [ref=e169] [cursor=pointer]:
              - img [ref=e170]
              - generic [ref=e172]: IGNITION
            - button "Build" [disabled] [ref=e175]
            - generic [ref=e176]:
              - button "norm" [ref=e177] [cursor=pointer]
              - button "zen" [ref=e178] [cursor=pointer]
              - button "focu" [ref=e179] [cursor=pointer]
        - generic [ref=e181]:
          - button "Keyboard" [ref=e182] [cursor=pointer]
          - button "Virtual" [ref=e183] [cursor=pointer]
      - generic [ref=e185]:
        - generic [ref=e186]:
          - img "JPE Studio Dashboard" [ref=e187]
          - generic [ref=e190]:
            - generic [ref=e191]:
              - img [ref=e193]
              - generic [ref=e196]:
                - text: INDUSTRIAL ENGINE v4.2.0
                - heading "KHAOTIC DEV STUDIO" [level=1] [ref=e197]
            - generic [ref=e198]:
              - generic [ref=e199]:
                - generic [ref=e200]: "0"
                - generic [ref=e201]: FILES
              - generic [ref=e202]:
                - generic [ref=e203]: "0"
                - generic [ref=e204]: STRINGS
              - generic [ref=e205]:
                - generic [ref=e206]: 0%
                - generic [ref=e207]: COMPLETED
              - generic [ref=e208]:
                - generic [ref=e209]: "0"
                - generic [ref=e210]: CONFLICTS
        - generic [ref=e211]:
          - generic [ref=e212]:
            - generic [ref=e213]:
              - img [ref=e214]
              - generic [ref=e216]: QUICK ACCESS MODULES
            - generic [ref=e217]:
              - button "Translate Files Run AI translation" [ref=e218] [cursor=pointer]:
                - generic [ref=e221]:
                  - img [ref=e223]
                  - generic [ref=e227]: Translate Files
                  - generic [ref=e228]: Run AI translation
              - button "Build Package Export .package" [ref=e229] [cursor=pointer]:
                - generic [ref=e231]:
                  - img [ref=e233]
                  - generic [ref=e238]: Build Package
                  - generic [ref=e239]: Export .package
              - button "Scan Conflicts Detect issues" [ref=e240] [cursor=pointer]:
                - generic [ref=e242]:
                  - img [ref=e244]
                  - generic [ref=e246]: Scan Conflicts
                  - generic [ref=e247]: Detect issues
              - button "Open Editor Code workspace" [ref=e248] [cursor=pointer]:
                - generic [ref=e250]:
                  - img [ref=e252]
                  - generic [ref=e256]: Open Editor
                  - generic [ref=e257]: Code workspace
              - button "View Graph Dependency map" [ref=e258] [cursor=pointer]:
                - generic [ref=e260]:
                  - img [ref=e262]
                  - generic [ref=e267]: View Graph
                  - generic [ref=e268]: Dependency map
              - button "AI Assistant Get AI help" [ref=e269] [cursor=pointer]:
                - generic [ref=e271]:
                  - img [ref=e273]
                  - generic [ref=e275]: AI Assistant
                  - generic [ref=e276]: Get AI help
          - generic [ref=e277]:
            - generic [ref=e278]:
              - img [ref=e279]
              - generic [ref=e281]: L2D TELEMETRY
            - generic [ref=e283]:
              - generic [ref=e285]:
                - generic [ref=e286]: TRANSLATION
                - generic [ref=e287]: 0%
              - generic [ref=e291]:
                - generic [ref=e292]: SCHEMA_VAL
                - generic [ref=e293]: 100%
              - generic [ref=e298]:
                - generic [ref=e299]: CONFLICT_RES
                - generic [ref=e300]: 100%
              - generic [ref=e305]: Real-time synchronization active. All components monitored via KDBS pipeline.
          - generic [ref=e307]:
            - generic [ref=e308]:
              - generic [ref=e309]:
                - img [ref=e310]
                - generic [ref=e313]: RECENT_RESOURCES
              - button "EXPLORE" [ref=e314] [cursor=pointer]
            - generic [ref=e317]: No recent data blocks detected.
          - generic [ref=e319]:
            - generic [ref=e321]:
              - img [ref=e322]
              - generic [ref=e325]: CORE_LOAD
            - generic [ref=e328]:
              - generic [ref=e331]: 8-THREAD CPU
              - generic [ref=e332]: 0.01ms LATENCY
          - generic [ref=e336]:
            - img [ref=e337]
            - generic [ref=e340]: REGIONAL_DIST
          - generic [ref=e346]:
            - img [ref=e347]
            - generic [ref=e350]: SYSTEM_LOG
  - region "Notifications alt+T"
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test'
  2  | 
  3  | test.describe('E2E: JPE Playground Full-Screen Verification', () => {
  4  |   test.beforeEach(async ({ context, page }) => {
  5  |     // 1. Programmatically dismiss onboarding tour via localStorage
  6  |     await context.addInitScript(() => {
  7  |       window.localStorage.setItem('jpe_onboarding_seen', 'true')
  8  |     })
  9  | 
  10 |     // 2. Navigate to the studio
  11 |     await page.goto('/studio', { waitUntil: 'domcontentloaded' })
  12 | 
  13 |     // 3. Wait for app to load
  14 |     await page.waitForSelector('[data-testid="app-root"]', { timeout: 15000 })
  15 |     
  16 |     // 4. Navigate to Playground mode via Projects page first to ensure a project context exists if needed,
  17 |     // or just use the nav item if available
  18 |     const navPlayground = page.locator('[data-testid="nav-playground"]')
  19 |     if (await navPlayground.isVisible()) {
> 20 |       await navPlayground.click()
     |                           ^ Error: locator.click: Test timeout of 30000ms exceeded.
  21 |     } else {
  22 |       // Navigate to playground via URL if nav is hidden or not yet available
  23 |       await page.goto('/studio', { waitUntil: 'networkidle' })
  24 |       // Trigger mode switch via UI if possible, but for this test we'll assume direct navigation works
  25 |       // or we click the "Playground" action on the dashboard if we add one.
  26 |       // Current Dashboard has "Open Editor" (mode: code).
  27 |       // Let's assume the nav item IS visible on the dashboard/studio root.
  28 |     }
  29 |     
  30 |     await expect(page.locator('[data-testid="playground-view"]')).toBeVisible({ timeout: 15000 })
  31 |   })
  32 | 
  33 |   test('should hide global title bar and navigation in playground mode', async ({ page }) => {
  34 |     // Verify that the global TitleBar is NOT visible
  35 |     // The TitleSection is hidden in playground mode
  36 |     const titleSection = page.locator('div:has(> [data-testid="title-bar-logo"])').first()
  37 |     if (await titleSection.count() > 0) {
  38 |       await expect(titleSection).toBeHidden()
  39 |     }
  40 | 
  41 |     // Verify that AppNavigation is NOT visible
  42 |     const appNav = page.locator('[data-testid="app-navigation"]')
  43 |     await expect(appNav).toBeHidden()
  44 |   })
  45 | 
  46 |   test('should fill the entire viewport without internal padding', async ({ page }) => {
  47 |     // Check playground container padding - Spectral PlaygroundView uses p-0
  48 |     const playgroundView = page.locator('[data-testid="playground-view"]')
  49 |     const padding = await playgroundView.evaluate((el) => window.getComputedStyle(el).padding)
  50 |     // p-0 means 0px or similar
  51 |     expect(padding === '0px' || padding === '0px 0px 0px 0px').toBeTruthy()
  52 |   })
  53 | 
  54 |   test('should navigate back to dashboard via the Return button', async ({ page }) => {
  55 |     const backButton = page.locator('button:has-text("Back to Dashboard")')
  56 |     await expect(backButton).toBeVisible()
  57 |     
  58 |     await backButton.click()
  59 |     
  60 |     // Should see the Home Dashboard again
  61 |     await expect(page.locator('[data-testid="dashboard-root"]')).toBeVisible({ timeout: 10000 })
  62 |     
  63 |     // Global AppNavigation should return
  64 |     await expect(page.locator('[data-testid="nav-dashboard"]')).toBeVisible()
  65 |   })
  66 | })
  67 | 
```