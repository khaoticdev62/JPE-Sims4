# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: dialog.e2e.ts >> Dialog Component >> confirm button should close dialog
- Location: src\__tests__\e2e\specs\dialog.e2e.ts:134:7

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: locator.click: Test timeout of 30000ms exceeded.
Call log:
  - waiting for getByTestId('dialog-confirm')

```

# Page snapshot

```yaml
- generic [ref=e1]:
  - generic [ref=e2]:
    - heading "JPE Studio — Component Showcase" [level=1] [ref=e3]
    - paragraph [ref=e4]: All design system components rendered for E2E testing.
    - generic [ref=e5]:
      - heading "Button" [level=2] [ref=e6]
      - generic [ref=e7]:
        - generic [ref=e8]:
          - generic [ref=e9]: primary
          - generic [ref=e10]:
            - button "Primary" [ref=e11] [cursor=pointer]
            - button "JPE Primary" [ref=e12] [cursor=pointer]
        - generic [ref=e13]:
          - generic [ref=e14]: secondary
          - button "Secondary" [ref=e16] [cursor=pointer]
        - generic [ref=e17]:
          - generic [ref=e18]: ghost
          - button "Ghost" [ref=e20] [cursor=pointer]
        - generic [ref=e21]:
          - generic [ref=e22]: danger
          - generic [ref=e23]:
            - button "Danger" [ref=e24] [cursor=pointer]
            - button "JPE Danger" [ref=e25] [cursor=pointer]
        - generic [ref=e26]:
          - generic [ref=e27]: success
          - generic [ref=e28]:
            - button "Success" [ref=e29] [cursor=pointer]
            - button "JPE Success" [ref=e30] [cursor=pointer]
        - generic [ref=e31]:
          - generic [ref=e32]: icon
          - generic [ref=e33]:
            - button "Add Item" [ref=e34] [cursor=pointer]:
              - img
            - button [ref=e35] [cursor=pointer]:
              - img
        - generic [ref=e36]:
          - generic [ref=e37]: sizes
          - generic [ref=e38]:
            - button "XS" [ref=e39] [cursor=pointer]
            - button "SM" [ref=e40] [cursor=pointer]
            - button "MD" [ref=e41] [cursor=pointer]
            - button "LG" [ref=e42] [cursor=pointer]
        - generic [ref=e43]:
          - generic [ref=e44]: disabled
          - generic [ref=e45]:
            - button "Disabled" [disabled]
        - generic [ref=e46]:
          - generic [ref=e47]: loading
          - generic [ref=e48]:
            - button "Loading Loading" [disabled]:
              - img "Loading"
              - text: Loading
            - button "Loading JPE Loading" [disabled]:
              - img "Loading"
              - text: JPE Loading
    - generic [ref=e49]:
      - heading "Input" [level=2] [ref=e50]
      - generic [ref=e52]:
        - generic [ref=e53]:
          - generic [ref=e54]: Text Input
          - textbox "Text Input" [ref=e55]:
            - /placeholder: Enter text...
        - generic [ref=e56]:
          - generic [ref=e57]: Disabled Input
          - textbox "Disabled Input" [disabled]:
            - /placeholder: Disabled...
        - generic [ref=e58]:
          - generic [ref=e59]: Error Input
          - textbox "Error Input" [ref=e60]:
            - /placeholder: Invalid value...
          - alert [ref=e61]: This field is required
    - generic [ref=e62]:
      - heading "Card" [level=2] [ref=e63]
      - generic [ref=e64]:
        - generic [ref=e65]:
          - heading "Card Title" [level=4] [ref=e67]
          - paragraph [ref=e69]: Card content with glassmorphic background.
          - button "Action" [ref=e71] [cursor=pointer]
        - paragraph [ref=e74]: Solid background card variant.
    - generic [ref=e75]:
      - heading "Dropdown" [level=2] [ref=e76]
      - generic [ref=e77]:
        - button "Select Option" [ref=e78] [cursor=pointer]:
          - text: Select Option
          - img
        - generic [ref=e79]:
          - generic [ref=e80]: JPE Dropdown
          - button "Select JPE item..." [ref=e82] [cursor=pointer]:
            - generic [ref=e84]: Select JPE item...
            - img [ref=e85]
    - generic [ref=e88]:
      - heading "Dialog / Modal" [level=2] [ref=e89]
      - button "Open Dialog" [active] [ref=e91] [cursor=pointer]
    - generic [ref=e92]:
      - heading "Badge" [level=2] [ref=e93]
      - generic [ref=e94]:
        - generic [ref=e95]:
          - generic [ref=e96]: default
          - generic [ref=e97]:
            - generic [ref=e98]: Default
            - generic [ref=e99]: JPE Default
        - generic [ref=e100]:
          - generic [ref=e101]: secondary
          - generic [ref=e103]: Secondary
        - generic [ref=e104]:
          - generic [ref=e105]: destructive
          - generic [ref=e107]: Destructive
        - generic [ref=e108]:
          - generic [ref=e109]: outline
          - generic [ref=e111]: Outline
        - generic [ref=e112]:
          - generic [ref=e113]: status
          - generic [ref=e115]: OK
    - generic [ref=e116]:
      - heading "Progress Bar" [level=2] [ref=e117]
      - generic [ref=e119]:
        - generic [ref=e120]:
          - generic [ref=e121]: Default Progress
          - progressbar [ref=e122]
          - paragraph [ref=e124]: 65%
        - generic [ref=e125]:
          - generic [ref=e126]: JPE Progress Bar
          - progressbar [ref=e129]
        - generic [ref=e130]:
          - generic [ref=e131]: Common Progress
          - progressbar [ref=e134]
        - generic [ref=e135]:
          - button "-10%" [ref=e136] [cursor=pointer]
          - button "+10%" [ref=e137] [cursor=pointer]
    - generic [ref=e138]:
      - heading "Status Indicators" [level=2] [ref=e139]
      - generic [ref=e140]:
        - generic [ref=e141]:
          - generic [ref=e142]: ok
          - generic [ref=e143]:
            - 'status "Status: ok" [ref=e145]'
            - 'status "Status: ok" [ref=e146]'
            - status [ref=e147]: Operational
        - generic [ref=e149]:
          - generic [ref=e150]: warning
          - generic [ref=e151]:
            - 'status "Status: warning" [ref=e153]'
            - 'status "Status: warning" [ref=e154]'
            - status [ref=e155]: Degraded
        - generic [ref=e157]:
          - generic [ref=e158]: error
          - generic [ref=e159]:
            - 'status "Status: error" [ref=e161]'
            - 'status "Status: error" [ref=e162]'
            - status [ref=e163]: Down
        - generic [ref=e165]:
          - generic [ref=e166]: info
          - generic [ref=e167]:
            - 'status "Status: info" [ref=e169]'
            - 'status "Status: info" [ref=e170]'
        - generic [ref=e171]:
          - generic [ref=e172]: idle
          - generic [ref=e173]:
            - 'status "Status: idle" [ref=e175]'
            - 'status "Status: idle" [ref=e176]'
        - generic [ref=e177]:
          - generic [ref=e178]: running
          - generic [ref=e179]:
            - 'status "Status: running" [ref=e181]'
            - 'status "Status: running" [ref=e182]'
        - generic [ref=e183]:
          - generic [ref=e184]: pulse
          - 'status "Status: ok" [ref=e186]'
        - generic [ref=e187]:
          - generic [ref=e188]: compact
          - status [ref=e190]: OK
    - generic [ref=e192]:
      - heading "Notifications" [level=2] [ref=e193]
      - generic [ref=e194]:
        - alert [ref=e195]:
          - generic [ref=e197]:
            - img [ref=e198]
            - generic [ref=e200]:
              - paragraph [ref=e201]: Info Notification
              - paragraph [ref=e202]: This is an informational notification.
              - generic [ref=e204]: Just now
            - button "Dismiss notification" [ref=e205] [cursor=pointer]:
              - img [ref=e206]
        - alert [ref=e209]:
          - generic [ref=e211]:
            - img [ref=e212]
            - generic [ref=e215]:
              - paragraph [ref=e216]: Success
              - paragraph [ref=e217]: Operation completed successfully.
              - generic [ref=e219]: 2 min ago
        - alert [ref=e220]:
          - generic [ref=e222]:
            - img [ref=e223]
            - generic [ref=e225]:
              - paragraph [ref=e226]: Warning
              - paragraph [ref=e227]: Please review your settings.
              - generic [ref=e229]: 5 min ago
        - alert [ref=e230]:
          - generic [ref=e232]:
            - img [ref=e233]
            - generic [ref=e237]:
              - paragraph [ref=e238]: Error
              - paragraph [ref=e239]: An error occurred during processing.
              - generic [ref=e240]:
                - button "Retry" [ref=e241] [cursor=pointer]
                - generic [ref=e242]: 10 min ago
        - alert [ref=e243]:
          - generic [ref=e245]:
            - img [ref=e246]
            - generic [ref=e248]:
              - paragraph [ref=e249]: Toast Title
              - paragraph [ref=e250]: Toast notification message
    - generic [ref=e251]:
      - heading "Spinner" [level=2] [ref=e252]
      - generic [ref=e253]:
        - generic [ref=e254]:
          - generic [ref=e255]: default
          - generic [ref=e256]:
            - img "Loading" [ref=e257]
            - img "Loading" [ref=e259]
        - generic [ref=e261]:
          - generic [ref=e262]: small
          - img "Loading" [ref=e264]
        - generic [ref=e266]:
          - generic [ref=e267]: large
          - img "Loading" [ref=e269]
        - generic [ref=e271]:
          - generic [ref=e272]: custom-color
          - img "Loading" [ref=e274]
    - heading "Skeleton Loader" [level=2] [ref=e277]
    - generic [ref=e286]:
      - heading "Tabs" [level=2] [ref=e287]
      - generic [ref=e288]:
        - tablist [ref=e290]:
          - tab "General" [ref=e291] [cursor=pointer]
          - tab "Settings" [ref=e292] [cursor=pointer]
          - tab "Advanced" [ref=e293] [cursor=pointer]
        - generic [ref=e294]:
          - generic [ref=e295]: JPE File Tabs
          - generic [ref=e296]:
            - tab "file1.jpe" [selected] [ref=e297] [cursor=pointer]:
              - img [ref=e299]
              - generic [ref=e302]: file1.jpe
              - img [ref=e303]
            - tab "file2.jpe" [ref=e306] [cursor=pointer]:
              - img [ref=e307]
              - generic [ref=e310]: file2.jpe
              - img [ref=e312]
            - tab "file3.jpe" [ref=e315] [cursor=pointer]:
              - img [ref=e316]
              - img [ref=e319]
              - generic [ref=e321]: file3.jpe
              - img [ref=e322]
    - generic [ref=e325]:
      - heading "Tool Panel" [level=2] [ref=e326]
      - generic [ref=e327]:
        - generic [ref=e328]:
          - button "Explorer 12" [expanded] [ref=e329] [cursor=pointer]:
            - generic [ref=e330]:
              - img [ref=e331]
              - generic [ref=e334]: Explorer
              - generic [ref=e335]: "12"
            - img [ref=e337]
          - generic [ref=e340]: Panel content area.
        - button "Collapsed Panel" [ref=e342] [cursor=pointer]:
          - generic [ref=e343]:
            - img [ref=e344]
            - generic [ref=e347]: Collapsed Panel
          - img [ref=e349]
    - generic [ref=e351]:
      - heading "Switch / Toggle" [level=2] [ref=e352]
      - generic [ref=e353]:
        - generic [ref=e354]:
          - switch [ref=e355] [cursor=pointer]
          - checkbox
          - generic [ref=e356]: "Off"
        - generic [ref=e357]:
          - switch [disabled] [ref=e358]
          - checkbox [disabled]
          - generic [ref=e359]: Disabled
    - generic [ref=e360]:
      - heading "Checkbox" [level=2] [ref=e361]
      - generic [ref=e363]:
        - generic [ref=e364]:
          - checkbox [ref=e365] [cursor=pointer]
          - checkbox
          - generic [ref=e366]: Accept terms
        - generic [ref=e367]:
          - checkbox [disabled] [ref=e368]
          - checkbox [disabled]
          - generic [ref=e369]: Disabled
        - generic [ref=e370]:
          - checkbox [checked=mixed] [ref=e371] [cursor=pointer]:
            - generic:
              - img
          - checkbox
          - generic [ref=e372]: Indeterminate
    - generic [ref=e373]:
      - heading "Slider" [level=2] [ref=e374]
      - generic [ref=e375]:
        - generic [ref=e377]: "Volume: 30%"
        - generic [ref=e382]: Step 10
    - generic [ref=e386]:
      - heading "Data Table" [level=2] [ref=e387]
      - table [ref=e390]:
        - rowgroup [ref=e391]:
          - row "Name Status Role" [ref=e392]:
            - columnheader "Name" [ref=e393]
            - columnheader "Status" [ref=e394]
            - columnheader "Role" [ref=e395]
        - rowgroup [ref=e396]:
          - row "Alice Active Admin" [ref=e397]:
            - cell "Alice" [ref=e398]
            - cell "Active" [ref=e399]:
              - generic [ref=e400]: Active
            - cell "Admin" [ref=e401]
          - row "Bob Idle Editor" [ref=e402]:
            - cell "Bob" [ref=e403]
            - cell "Idle" [ref=e404]:
              - generic [ref=e405]: Idle
            - cell "Editor" [ref=e406]
          - row "Charlie Error Viewer" [ref=e407]:
            - cell "Charlie" [ref=e408]
            - cell "Error" [ref=e409]:
              - generic [ref=e410]: Error
            - cell "Viewer" [ref=e411]
    - generic [ref=e412]:
      - heading "Breadcrumb" [level=2] [ref=e413]
      - navigation "breadcrumb" [ref=e415]:
        - list [ref=e416]:
          - listitem [ref=e417]:
            - link [ref=e418] [cursor=pointer]:
              - /url: "#"
              - img [ref=e419]
          - listitem [ref=e422]:
            - img [ref=e423]
          - listitem [ref=e425]:
            - link "Components" [ref=e426] [cursor=pointer]:
              - /url: "#"
          - listitem [ref=e427]:
            - img [ref=e428]
          - listitem [ref=e430]:
            - link "Button" [disabled] [ref=e431]
    - generic [ref=e432]:
      - heading "Pagination" [level=2] [ref=e433]
      - navigation "pagination" [ref=e435]:
        - list [ref=e436]:
          - listitem [ref=e437]:
            - generic "Go to previous page" [ref=e438]:
              - img
              - generic [ref=e439]: Previous
          - listitem [ref=e440]:
            - generic [ref=e441]: "1"
          - listitem [ref=e442]:
            - generic [ref=e443]: "2"
          - listitem [ref=e444]:
            - generic [ref=e445]: "3"
          - listitem [ref=e446]:
            - generic [ref=e447]:
              - img [ref=e448]
              - generic [ref=e452]: More pages
          - listitem [ref=e453]:
            - generic [ref=e454]: "10"
          - listitem [ref=e455]:
            - generic "Go to next page" [ref=e456]:
              - generic [ref=e457]: Next
              - img
    - generic [ref=e458]:
      - heading "Select" [level=2] [ref=e459]
      - generic [ref=e461]:
        - generic [ref=e462]: Framework
        - combobox [ref=e463] [cursor=pointer]:
          - generic: Select a framework...
          - img
        - combobox [ref=e464]
    - generic [ref=e465]:
      - heading "Textarea" [level=2] [ref=e466]
      - generic [ref=e467]:
        - generic [ref=e468]:
          - generic [ref=e469]: Description
          - textbox "Description" [ref=e470]:
            - /placeholder: Enter description...
        - generic [ref=e471]:
          - generic [ref=e472]: Disabled
          - textbox "Disabled" [disabled] [ref=e473]:
            - /placeholder: Disabled textarea...
    - generic [ref=e474]:
      - heading "Alert" [level=2] [ref=e475]
      - generic [ref=e476]:
        - alert [ref=e477]:
          - img [ref=e478]
          - generic [ref=e480]: Information
          - generic [ref=e481]: This is an info alert message.
        - alert [ref=e482]:
          - img [ref=e483]
          - generic [ref=e486]: Success
          - generic [ref=e487]: Operation completed.
        - alert [ref=e488]:
          - img [ref=e489]
          - generic [ref=e491]: Warning
          - generic [ref=e492]: Please review.
        - alert [ref=e493]:
          - img [ref=e494]
          - generic [ref=e498]: Error
          - generic [ref=e499]: Something went wrong.
    - generic [ref=e500]:
      - heading "Accordion" [level=2] [ref=e501]
      - generic [ref=e503]:
        - generic [ref=e504]:
          - heading "Section One" [level=3] [ref=e505]:
            - button "Section One" [expanded] [ref=e506] [cursor=pointer]:
              - text: Section One
              - img
          - region "Section One" [ref=e507]:
            - generic [ref=e508]: Content for section one.
        - heading "Section Two" [level=3] [ref=e510]:
          - button "Section Two" [ref=e511] [cursor=pointer]:
            - text: Section Two
            - img
        - heading "Section Three" [level=3] [ref=e513]:
          - button "Section Three" [ref=e514] [cursor=pointer]:
            - text: Section Three
            - img
    - generic [ref=e515]:
      - heading "Radio Group" [level=2] [ref=e516]
      - radiogroup [ref=e518]:
        - generic [ref=e519]:
          - radio "Option One" [checked] [ref=e520] [cursor=pointer]:
            - img [ref=e521]
          - radio [checked]
          - generic [ref=e523]: Option One
        - generic [ref=e524]:
          - radio "Option Two" [ref=e525] [cursor=pointer]
          - radio
          - generic [ref=e526]: Option Two
        - generic [ref=e527]:
          - radio "Option Three" [ref=e528] [cursor=pointer]
          - radio
          - generic [ref=e529]: Option Three
    - generic [ref=e530]:
      - heading "Toggle Group" [level=2] [ref=e531]
      - generic [ref=e533]:
        - generic [ref=e534]:
          - generic [ref=e535]: Single Selection
          - group [ref=e536]:
            - radio "Bold" [checked] [ref=e537] [cursor=pointer]:
              - img
            - radio "Italic" [ref=e538] [cursor=pointer]:
              - img
            - radio "Underline" [ref=e539] [cursor=pointer]:
              - img
        - generic [ref=e540]:
          - generic [ref=e541]: Multiple Selection
          - group [ref=e542]:
            - button "Bold" [pressed] [ref=e543] [cursor=pointer]:
              - img
            - button "Italic" [pressed] [ref=e544] [cursor=pointer]:
              - img
            - button "Underline" [ref=e545] [cursor=pointer]:
              - img
    - generic [ref=e546]:
      - heading "Popover" [level=2] [ref=e547]
      - button "Open Popover" [ref=e549] [cursor=pointer]
    - generic [ref=e550]:
      - heading "Sheet" [level=2] [ref=e551]
      - generic [ref=e552]:
        - button "Open Sheet (Right)" [ref=e553] [cursor=pointer]
        - button "Open Sheet (Left)" [ref=e554] [cursor=pointer]
    - generic [ref=e555]:
      - heading "Tooltip" [level=2] [ref=e556]
      - button "Hover for Tooltip" [ref=e558] [cursor=pointer]
    - generic [ref=e559]:
      - heading "Hover Card" [level=2] [ref=e560]
      - button "@jpe-studio" [ref=e562] [cursor=pointer]
    - generic [ref=e563]:
      - heading "Context Menu" [level=2] [ref=e564]
      - generic [ref=e567]: Right-click here
    - generic [ref=e568]:
      - heading "Navigation Menu" [level=2] [ref=e569]
      - navigation "Main" [ref=e571]:
        - list [ref=e573]:
          - listitem [ref=e574]:
            - button "Products" [ref=e575] [cursor=pointer]:
              - text: Products
              - img [ref=e576]
          - listitem [ref=e578]:
            - link "Docs" [ref=e579] [cursor=pointer]:
              - /url: "#"
    - generic [ref=e580]:
      - heading "Form Field" [level=2] [ref=e581]
      - generic [ref=e583]:
        - generic [ref=e584]:
          - generic [ref=e585]: Username
          - textbox "Username" [ref=e586]:
            - /placeholder: Enter username
          - paragraph [ref=e587]: This is your display name.
        - generic [ref=e588]:
          - generic [ref=e589]: Email
          - textbox "Email" [ref=e590]:
            - /placeholder: Invalid email
          - alert [ref=e591]: Please enter a valid email.
        - generic [ref=e592]:
          - generic [ref=e593]:
            - text: Password
            - generic [ref=e594]: "*"
          - textbox "Password *" [ref=e595]:
            - /placeholder: Enter password
    - heading "Graph Viewer" [level=2] [ref=e597]
    - heading "Code Editor" [level=2] [ref=e601]
    - generic [ref=e604]:
      - heading "Sidebar" [level=2] [ref=e605]
      - generic [ref=e607]:
        - paragraph [ref=e609]: Navigation
        - navigation [ref=e610]:
          - button "Home" [ref=e611] [cursor=pointer]:
            - img [ref=e612]
            - text: Home
          - button "Settings" [ref=e615] [cursor=pointer]:
            - img [ref=e616]
            - text: Settings
          - button "Users" [ref=e619] [cursor=pointer]:
            - img [ref=e620]
            - text: Users
    - generic [ref=e625]:
      - heading "Calendar" [level=2] [ref=e626]
      - generic [ref=e628]:
        - generic [ref=e629]:
          - button [ref=e630] [cursor=pointer]:
            - img
          - paragraph [ref=e631]: January 2026
          - button [ref=e632] [cursor=pointer]:
            - img
        - generic [ref=e633]:
          - generic [ref=e634]: Su
          - generic [ref=e635]: Mo
          - generic [ref=e636]: Tu
          - generic [ref=e637]: We
          - generic [ref=e638]: Th
          - generic [ref=e639]: Fr
          - generic [ref=e640]: Sa
          - button "1" [ref=e641] [cursor=pointer]
          - button "2" [ref=e642] [cursor=pointer]
          - button "3" [ref=e643] [cursor=pointer]
          - button "4" [ref=e644] [cursor=pointer]
          - button "5" [ref=e645] [cursor=pointer]
          - button "6" [ref=e646] [cursor=pointer]
          - button "7" [ref=e647] [cursor=pointer]
          - button "8" [ref=e648] [cursor=pointer]
          - button "9" [ref=e649] [cursor=pointer]
          - button "10" [ref=e650] [cursor=pointer]
          - button "11" [ref=e651] [cursor=pointer]
          - button "12" [ref=e652] [cursor=pointer]
          - button "13" [ref=e653] [cursor=pointer]
          - button "14" [ref=e654] [cursor=pointer]
          - button "15" [ref=e655] [cursor=pointer]
          - button "16" [ref=e656] [cursor=pointer]
          - button "17" [ref=e657] [cursor=pointer]
          - button "18" [ref=e658] [cursor=pointer]
          - button "19" [ref=e659] [cursor=pointer]
          - button "20" [ref=e660] [cursor=pointer]
          - button "21" [ref=e661] [cursor=pointer]
          - button "22" [ref=e662] [cursor=pointer]
          - button "23" [ref=e663] [cursor=pointer]
          - button "24" [ref=e664] [cursor=pointer]
          - button "25" [ref=e665] [cursor=pointer]
          - button "26" [ref=e666] [cursor=pointer]
          - button "27" [ref=e667] [cursor=pointer]
          - button "28" [ref=e668] [cursor=pointer]
          - button "29" [ref=e669] [cursor=pointer]
          - button "30" [ref=e670] [cursor=pointer]
          - button "31" [ref=e671] [cursor=pointer]
    - generic [ref=e672]:
      - heading "Command Palette" [level=2] [ref=e673]
      - paragraph [ref=e675]: Press Ctrl+K to open the command palette.
  - region "Notifications alt+T"
```

# Test source

```ts
  38  | 
  39  |     const desc = page.getByTestId('dialog-description')
  40  |     await expect(desc).toBeVisible()
  41  |     await expect(desc).toContainText('dialog description with glassmorphic styling')
  42  |   })
  43  | 
  44  |   test('should render dialog action buttons', async ({ page }) => {
  45  |     await page.getByTestId('dialog-trigger').click()
  46  |     await page.waitForTimeout(300)
  47  | 
  48  |     const dialog = page.getByTestId('dialog-content')
  49  |     const cancelBtn = dialog.getByRole('button', { name: 'Cancel' })
  50  |     const confirmBtn = page.getByTestId('dialog-confirm')
  51  | 
  52  |     await expect(cancelBtn).toBeVisible()
  53  |     await expect(confirmBtn).toBeVisible()
  54  |   })
  55  | 
  56  |   test('should close dialog with close button', async ({ page }) => {
  57  |     await page.getByTestId('dialog-trigger').click()
  58  |     await page.waitForTimeout(300)
  59  | 
  60  |     const dialog = page.getByTestId('dialog-content')
  61  |     const closeBtn = dialog.locator('[class*="DialogClose"], button[aria-label*="Close"]').first()
  62  |     await closeBtn.click()
  63  |     await page.waitForTimeout(200)
  64  | 
  65  |     await expect(dialog).not.toBeVisible()
  66  |   })
  67  | 
  68  |   test('should close dialog with Escape key', async ({ page }) => {
  69  |     await page.getByTestId('dialog-trigger').click()
  70  |     await page.waitForTimeout(300)
  71  | 
  72  |     await page.keyboard.press('Escape')
  73  |     await page.waitForTimeout(200)
  74  | 
  75  |     const dialog = page.getByTestId('dialog-content')
  76  |     await expect(dialog).not.toBeVisible()
  77  |   })
  78  | 
  79  |   test('should close dialog on backdrop click', async ({ page }) => {
  80  |     await page.getByTestId('dialog-trigger').click()
  81  |     await page.waitForTimeout(300)
  82  | 
  83  |     // Click on overlay/backdrop
  84  |     const overlay = page.locator('[class*="DialogOverlay"]').first()
  85  |     await overlay.click()
  86  |     await page.waitForTimeout(200)
  87  | 
  88  |     const dialog = page.getByTestId('dialog-content')
  89  |     await expect(dialog).not.toBeVisible()
  90  |   })
  91  | 
  92  |   test('should have open animation', async ({ page }) => {
  93  |     await page.getByTestId('dialog-trigger').click()
  94  | 
  95  |     const dialog = page.getByTestId('dialog-content')
  96  |     // Dialog should become visible after animation
  97  |     await expect(dialog).toBeVisible({ timeout: 5000 })
  98  |   })
  99  | 
  100 |   test('should trap focus inside dialog', async ({ page }) => {
  101 |     await page.getByTestId('dialog-trigger').click()
  102 |     await page.waitForTimeout(300)
  103 | 
  104 |     // Tab through elements
  105 |     await page.keyboard.press('Tab')
  106 |     await page.waitForTimeout(100)
  107 | 
  108 |     // Focus should be inside dialog
  109 |     const focusedElement = await page.evaluate(() => document.activeElement?.closest('[data-testid="dialog-content"]'))
  110 |     // After Tab, focus should be within the dialog or on a dialog element
  111 |     expect(focusedElement !== null || document.activeElement?.tagName === 'BUTTON').toBeTruthy()
  112 |   })
  113 | 
  114 |   test('should have glassmorphic background', async ({ page }) => {
  115 |     await page.getByTestId('dialog-trigger').click()
  116 |     await page.waitForTimeout(300)
  117 | 
  118 |     const dialog = page.getByTestId('dialog-content')
  119 |     const backdropFilter = await dialog.evaluate((el) => {
  120 |       const style = window.getComputedStyle(el)
  121 |       return style.backdropFilter || (style as any).webkitBackdropFilter
  122 |     })
  123 |     expect(backdropFilter).toContain('blur')
  124 |   })
  125 | 
  126 |   test('should have backdrop overlay', async ({ page }) => {
  127 |     await page.getByTestId('dialog-trigger').click()
  128 |     await page.waitForTimeout(300)
  129 | 
  130 |     const overlay = page.locator('[class*="DialogOverlay"]').first()
  131 |     await expect(overlay).toBeVisible()
  132 |   })
  133 | 
  134 |   test('confirm button should close dialog', async ({ page }) => {
  135 |     await page.getByTestId('dialog-trigger').click()
  136 |     await page.waitForTimeout(300)
  137 | 
> 138 |     await page.getByTestId('dialog-confirm').click()
      |                                              ^ Error: locator.click: Test timeout of 30000ms exceeded.
  139 |     await page.waitForTimeout(200)
  140 | 
  141 |     const dialog = page.getByTestId('dialog-content')
  142 |     await expect(dialog).not.toBeVisible()
  143 |   })
  144 | 
  145 |   test('should have correct ARIA role', async ({ page }) => {
  146 |     await page.getByTestId('dialog-trigger').click()
  147 |     await page.waitForTimeout(300)
  148 | 
  149 |     const dialog = page.getByTestId('dialog-content')
  150 |     await expect(dialog).toHaveAttribute('role', 'dialog')
  151 |   })
  152 | })
  153 | 
```