# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: 04-validation-flow.e2e.ts >> E2E: Real-Time Validation Flow >> should display editor pane
- Location: src\__tests__\e2e\specs\04-validation-flow.e2e.ts:53:7

# Error details

```
TimeoutError: locator.click: Timeout 15000ms exceeded.
Call log:
  - waiting for locator('[data-testid="nav-code"]')
    - locator resolved to <button data-testid="nav-code" class="group relative w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 outline-none text-text-secondary hover:text-text-primary">…</button>
  - attempting click action
    2 × waiting for element to be visible, enabled and stable
      - element is visible, enabled and stable
      - scrolling into view if needed
      - done scrolling
      - <div class="fixed inset-0 z-[9999] flex">…</div> intercepts pointer events
    - retrying click action
    - waiting 20ms
    2 × waiting for element to be visible, enabled and stable
      - element is visible, enabled and stable
      - scrolling into view if needed
      - done scrolling
      - <div class="fixed inset-0 z-[9999] flex">…</div> intercepts pointer events
    - retrying click action
      - waiting 100ms
    25 × waiting for element to be visible, enabled and stable
       - element is visible, enabled and stable
       - scrolling into view if needed
       - done scrolling
       - <div class="fixed inset-0 z-[9999] flex">…</div> intercepts pointer events
     - retrying click action
       - waiting 500ms

```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - generic [ref=e2]:
    - navigation [ref=e3]:
      - generic [ref=e5]:
        - img [ref=e7]
        - generic [ref=e9]:
          - heading "JPE STUDIO" [level=2] [ref=e10]
          - paragraph [ref=e11]: SPECTRAL OVERHAUL
      - generic [ref=e13]:
        - button "HOME DASHBOARD" [ref=e14] [cursor=pointer]:
          - img [ref=e16]
          - generic [ref=e19]: HOME DASHBOARD
        - button "PROJECTS EXPLORER" [ref=e20] [cursor=pointer]:
          - img [ref=e22]
          - generic [ref=e24]: PROJECTS EXPLORER
        - button "STUDIO WORKSPACE" [ref=e25] [cursor=pointer]:
          - img [ref=e28]
          - generic [ref=e30]: STUDIO WORKSPACE
        - button "TS4REBELS PORTAL" [ref=e31] [cursor=pointer]:
          - img [ref=e33]
          - generic [ref=e35]: TS4REBELS PORTAL
        - button "JPE MANUAL" [ref=e36] [cursor=pointer]:
          - img [ref=e38]
          - generic [ref=e41]: JPE MANUAL
        - button "JPE PLAYGROUND" [ref=e42] [cursor=pointer]:
          - img [ref=e44]
          - generic [ref=e46]: JPE PLAYGROUND
        - button "APP SETTINGS" [ref=e47] [cursor=pointer]:
          - img [ref=e49]
          - generic [ref=e52]: APP SETTINGS
      - generic [ref=e54]:
        - generic [ref=e55]:
          - generic [ref=e56]: "SYS_STATUS:"
          - generic [ref=e59]: NOMINAL
        - paragraph [ref=e60]: "Build v4.2.0 • Build ID: 56884"
    - generic [ref=e61]:
      - generic [ref=e62]:
        - generic [ref=e63]:
          - generic [ref=e64]:
            - button "File" [ref=e65] [cursor=pointer]
            - button "Edit" [ref=e66] [cursor=pointer]
            - button "View" [ref=e67] [cursor=pointer]
            - button "Project" [disabled] [ref=e68]
            - button "Help" [ref=e69] [cursor=pointer]
          - generic [ref=e71]:
            - img [ref=e72]
            - img [ref=e77]
            - heading "JPE STUDIO" [level=1] [ref=e79]
          - generic [ref=e80]:
            - button "IGNITION" [ref=e82] [cursor=pointer]:
              - img [ref=e83]
              - generic [ref=e85]: IGNITION
            - button "Build" [disabled] [ref=e88]
            - generic [ref=e89]:
              - button "norm" [ref=e90] [cursor=pointer]
              - button "zen" [ref=e91] [cursor=pointer]
              - button "focu" [ref=e92] [cursor=pointer]
        - generic [ref=e94]:
          - button "Keyboard" [ref=e95] [cursor=pointer]
          - button "Virtual" [ref=e96] [cursor=pointer]
      - generic [ref=e98]:
        - complementary [ref=e100]:
          - generic [ref=e102]:
            - button "BUILD" [ref=e103] [cursor=pointer]:
              - img [ref=e106]
              - generic [ref=e110]: BUILD
            - button "GENIE" [ref=e111] [cursor=pointer]:
              - img [ref=e112]
              - generic [ref=e122]: GENIE
            - button "WIKI" [ref=e123] [cursor=pointer]:
              - img [ref=e124]
              - generic [ref=e126]: WIKI
            - button "TELEMETRY" [ref=e127] [cursor=pointer]:
              - img [ref=e128]
              - generic [ref=e131]: TELEMETRY
          - generic [ref=e134]:
            - generic [ref=e135]:
              - generic [ref=e136]:
                - img [ref=e137]
                - generic [ref=e142]: Workspace
              - button [ref=e143] [cursor=pointer]:
                - img [ref=e144]
            - generic [ref=e147]:
              - img [ref=e148]
              - paragraph [ref=e151]: No project loaded
          - generic [ref=e152]:
            - generic [ref=e153]:
              - img [ref=e154] [cursor=pointer]
              - img [ref=e157] [cursor=pointer]
            - generic [ref=e162]: KDBS_LINK:OK
        - generic [ref=e165]:
          - generic [ref=e167]: No files open
          - generic [ref=e169]:
            - generic [ref=e171]:
              - img [ref=e175]
              - heading "STUDIO_NEXUS" [level=1] [ref=e178]
              - generic [ref=e179]:
                - img [ref=e180]
                - paragraph [ref=e182]: Initialization Pending
            - generic [ref=e184]:
              - generic [ref=e186]:
                - img [ref=e187]
                - generic [ref=e189]: SYSTEM_COMMANDS
              - generic [ref=e191]:
                - generic [ref=e192]:
                  - generic [ref=e193]:
                    - img [ref=e195]
                    - generic [ref=e199]: Save file
                  - generic [ref=e200]:
                    - generic [ref=e201]: Ctrl
                    - generic [ref=e202]: S
                - generic [ref=e203]:
                  - generic [ref=e204]:
                    - img [ref=e206]
                    - generic [ref=e210]: Compile Logic
                  - generic [ref=e211]:
                    - generic [ref=e212]: Ctrl
                    - generic [ref=e213]: Shift
                    - generic [ref=e214]: B
                - generic [ref=e215]:
                  - generic [ref=e216]:
                    - img [ref=e218]
                    - generic [ref=e221]: Search Block
                  - generic [ref=e222]:
                    - generic [ref=e223]: Ctrl
                    - generic [ref=e224]: F
                - generic [ref=e225]:
                  - generic [ref=e226]:
                    - img [ref=e228]
                    - generic [ref=e237]: Diagnostics
                  - generic [ref=e238]:
                    - generic [ref=e239]: Ctrl
                    - generic [ref=e240]: J
            - generic [ref=e241]:
              - generic [ref=e244]: Core_Stable
              - generic [ref=e247]: Sync_Active
        - generic [ref=e248]:
          - tablist "Panel Navigation" [ref=e249]:
            - tab "Diag (0)" [selected] [ref=e250] [cursor=pointer]
            - tab "XML" [ref=e251] [cursor=pointer]
            - tab "Docs" [ref=e252] [cursor=pointer]
            - tab "AI" [ref=e253] [cursor=pointer]
          - tabpanel "Diag (0)" [ref=e255]:
            - generic [ref=e256]:
              - generic [ref=e257]:
                - generic [ref=e258]:
                  - img [ref=e259]
                  - heading "editor.diagnostics" [level=2] [ref=e261]
                  - generic [ref=e262]: "0"
                - generic [ref=e263]:
                  - button "Filter diagnostics" [ref=e264] [cursor=pointer]:
                    - img
                  - button "Diagnostics settings" [ref=e265] [cursor=pointer]:
                    - img
                - generic [ref=e266]: 0 diagnostics found
              - group "Diagnostic severity filters" [ref=e267]:
                - button "Show all diagnostics" [pressed] [ref=e268] [cursor=pointer]: all
                - button "Show error diagnostics" [ref=e269] [cursor=pointer]: error
                - button "Show warning diagnostics" [ref=e270] [cursor=pointer]: warning
                - button "Show info diagnostics" [ref=e271] [cursor=pointer]: info
              - generic [ref=e273]:
                - generic [ref=e274]: 🌿
                - heading "All Clear" [level=3] [ref=e275]
                - paragraph [ref=e276]: No issues detected in the current scope.
  - generic [ref=e278]:
    - button "Skip tutorial" [ref=e279] [cursor=pointer]:
      - img [ref=e280]
    - img [ref=e285]
    - 'heading "Mission: My First Mod" [level=2] [ref=e289]'
    - paragraph [ref=e290]: Welcome to JPE Studio, recruit. Today you will build your very first Sims 4 mod using the Just Plain English (JPE) engine. Ready to ignite the grid?
    - generic [ref=e298]:
      - button "Previous" [disabled] [ref=e299]:
        - img [ref=e300]
        - generic [ref=e302]: Previous
      - button "Next" [ref=e303] [cursor=pointer]:
        - img [ref=e304]
        - generic [ref=e306]: Next
        - img [ref=e307]
    - generic [ref=e309]: MISSION 1 of 6
  - region "Notifications alt+T"
  - button "Open Next.js Dev Tools" [ref=e315] [cursor=pointer]:
    - img [ref=e316]
  - alert [ref=e319]
```

# Test source

```ts
  1   | import { test, expect } from '@playwright/test'
  2   | 
  3   | test.describe('E2E: Real-Time Validation Flow', () => {
  4   |   test.beforeEach(async ({ context, page }) => {
  5   |     // Inject localStorage to skip tutorial globally for all tests
  6   |     await context.addInitScript(() => {
  7   |       window.localStorage.setItem('jpe_onboarding_seen', 'true')
  8   |       window.localStorage.setItem('jpe-splash-dismissed', 'true')
  9   |       window.localStorage.setItem('jpe-ui-store', JSON.stringify({
  10  |         version: 0,
  11  |         state: { hasCompletedTour: true, workspaceMode: 'dashboard' }
  12  |       }))
  13  |     })
  14  | 
  15  |     // Navigate to the studio
  16  |     await page.goto('/studio', { waitUntil: 'domcontentloaded' })
  17  | 
  18  |     // Wait for app to load
  19  |     await page.waitForSelector('[data-testid="app-root"]', { timeout: 10000 })
  20  |   })
  21  | 
  22  |   test('should display app on load', async ({ page }) => {
  23  |     // Verify app loads
  24  |     const appRoot = page.locator('[data-testid="app-root"]')
  25  |     await expect(appRoot).toBeVisible()
  26  | 
  27  |     // Navigation should be visible
  28  |     const navHome = page.locator('[data-testid="nav-dashboard"]')
  29  |     await expect(navHome).toBeVisible()
  30  |   })
  31  | 
  32  |   test('should navigate to studio view', async ({ page }) => {
  33  |     // Click studio nav and wait for it to be stable
  34  |     const navCode = page.locator('[data-testid="nav-code"]')
  35  |     await navCode.waitFor({ state: 'visible' })
  36  |     await navCode.click()
  37  |     
  38  |     // Explicitly wait for the workspace mode to change and layout items to appear
  39  |     const viewport = page.locator('[data-testid="editor-main-viewport"]')
  40  |     await expect(viewport).toBeVisible({ timeout: 15000 })
  41  |   })
  42  | 
  43  |   test('should display editor layout', async ({ page }) => {
  44  |     // Go to studio
  45  |     await page.locator('[data-testid="nav-code"]').click()
  46  |     await page.waitForTimeout(500)
  47  | 
  48  |     // Check for three-pane layout
  49  |     const threePane = page.locator('[data-testid="editor-main-viewport"]')
  50  |     await expect(threePane).toBeVisible({ timeout: 10000 })
  51  |   })
  52  | 
  53  |   test('should display editor pane', async ({ page }) => {
  54  |     // Go to studio
  55  |     const navCode = page.locator('[data-testid="nav-code"]')
  56  |     await navCode.waitFor({ state: 'visible' })
> 57  |     await navCode.click()
      |                   ^ TimeoutError: locator.click: Timeout 15000ms exceeded.
  58  |     
  59  |     await page.waitForSelector('[data-testid="editor-pane"]', { timeout: 10000 })
  60  |     const editorPane = page.locator('[data-testid="editor-pane"]')
  61  |     const isVisible = await editorPane.isVisible().catch(() => false)
  62  | 
  63  |     expect(isVisible).toBe(true)
  64  |   })
  65  | 
  66  |   test('should show Monaco editor when files open', async ({ page }) => {
  67  |     // Navigate to studio
  68  |     await page.locator('[data-testid="nav-code"]').click()
  69  |     await page.waitForTimeout(500)
  70  | 
  71  |     // Monaco editor might be visible if files are open
  72  |     const monacoEditor = page.locator('[data-testid="monaco-editor"]')
  73  |     const isVisible = await monacoEditor.isVisible().catch(() => false)
  74  | 
  75  |     // Editor visibility depends on whether files are open
  76  |     expect(typeof isVisible).toBe('boolean')
  77  |   })
  78  | 
  79  |   test('should handle navigation between views', async ({ page }) => {
  80  |     // Navigate through different views
  81  |     await page.locator('[data-testid="nav-dashboard"]').click()
  82  |     await page.waitForTimeout(300)
  83  | 
  84  |     await page.locator('[data-testid="nav-code"]').click()
  85  |     await page.waitForTimeout(300)
  86  | 
  87  |     await page.locator('[data-testid="nav-projects"]').click()
  88  |     await page.waitForTimeout(300)
  89  | 
  90  |     // App should still be responsive
  91  |     const appRoot = page.locator('[data-testid="app-root"]')
  92  |     await expect(appRoot).toBeVisible()
  93  |   })
  94  | 
  95  |   test('should maintain state during navigation', async ({ page }) => {
  96  |     // Get initial project count
  97  |     const initialCount = await page.locator('[data-testid*="project-card"]').count()
  98  | 
  99  |     // Navigate away and back
  100 |     await page.locator('[data-testid="nav-code"]').click()
  101 |     await page.waitForTimeout(300)
  102 | 
  103 |     await page.locator('[data-testid="nav-dashboard"]').click()
  104 |     await page.waitForTimeout(300)
  105 | 
  106 |     // Project count should be the same
  107 |     const finalCount = await page.locator('[data-testid*="project-card"]').count()
  108 | 
  109 |     expect(finalCount).toBe(initialCount)
  110 |   })
  111 | 
  112 |   test('should handle keyboard input', async ({ page }) => {
  113 |     // Type some keyboard input
  114 |     await page.keyboard.type('test', { delay: 50 })
  115 |     await page.waitForTimeout(200)
  116 | 
  117 |     // App should still be responsive
  118 |     const appRoot = page.locator('[data-testid="app-root"]')
  119 |     await expect(appRoot).toBeVisible()
  120 |   })
  121 | 
  122 |   test('should respond to click events', async ({ page }) => {
  123 |     // Navigate to projects to see some actual content
  124 |     await page.locator('[data-testid="nav-projects"]').click()
  125 |     
  126 |     // Check for nav items
  127 |     const navItems = page.locator('[data-testid*="nav-"]')
  128 |     const count = await navItems.count()
  129 |     expect(count).toBeGreaterThan(0)
  130 | 
  131 |     // Click first nav item
  132 |     if (count > 0) {
  133 |       await navItems.first().click()
  134 |       await page.waitForTimeout(300)
  135 | 
  136 |       // App should still be loaded
  137 |       const appRoot = page.locator('[data-testid="app-root"]')
  138 |       await expect(appRoot).toBeVisible()
  139 |     }
  140 |   })
  141 | })
  142 | 
```