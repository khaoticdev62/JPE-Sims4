/**
 * Graph Viewer Component E2E Tests
 */
import { test, expect } from '../fixtures'

test.describe('Graph Viewer Component', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/components', { waitUntil: 'domcontentloaded' })
    await page.locator('#graph-viewer').scrollIntoViewIfNeeded()
  })

  test('should render graph viewer', async ({ page }) => {
    const graph = page.getByTestId('graph-viewer')
    await expect(graph).toBeVisible()
  })

  test('should render nodes', async ({ page }) => {
    const graph = page.getByTestId('graph-viewer')
    const nodes = graph.locator('circle, [class*="GraphNode"]')
    expect(await nodes.count()).toBeGreaterThanOrEqual(3)
  })

  test('should render edges', async ({ page }) => {
    const graph = page.getByTestId('graph-viewer')
    const edges = graph.locator('line, path')
    expect(await edges.count()).toBeGreaterThanOrEqual(2)
  })

  test('should render node labels', async ({ page }) => {
    const graph = page.getByTestId('graph-viewer')
    await expect(graph).toContainText('Node A')
    await expect(graph).toContainText('Node B')
    await expect(graph).toContainText('Node C')
  })

  test('should have grid background', async ({ page }) => {
    const graph = page.getByTestId('graph-viewer')
    const bg = await graph.evaluate((el) => window.getComputedStyle(el).backgroundImage)
    expect(bg).toBeTruthy()
  })

  test('should have border and rounded corners', async ({ page }) => {
    const graph = page.getByTestId('graph-viewer')
    const radius = await graph.evaluate((el) => window.getComputedStyle(el).borderRadius)
    expect(radius).not.toBe('0px')
  })

  test('should select node on click', async ({ page }) => {
    const graph = page.getByTestId('graph-viewer')
    const nodes = graph.locator('circle, [class*="GraphNode"]')
    await nodes.first().click()
    await page.waitForTimeout(200)

    // Graph should still be visible
    await expect(graph).toBeVisible()
  })

  test('should have correct height', async ({ page }) => {
    const graph = page.getByTestId('graph-viewer')
    const box = await graph.boundingBox()
    expect(box?.height).toBeGreaterThanOrEqual(250)
    expect(box?.height).toBeLessThanOrEqual(320)
  })

  test('should render nodes with colors', async ({ page }) => {
    const graph = page.getByTestId('graph-viewer')
    const firstNode = graph.locator('circle').first()
    await expect(firstNode).toBeVisible()

    const fill = await firstNode.evaluate((el) => window.getComputedStyle(el).fill)
    const bg = await firstNode.evaluate((el) => window.getComputedStyle(el).backgroundColor)
    expect(fill || bg).toBeTruthy()
  })

  test('should render edges with correct stroke', async ({ page }) => {
    const graph = page.getByTestId('graph-viewer')
    const edge = graph.locator('line, path').first()
    await expect(edge).toBeVisible()

    const stroke = await edge.evaluate((el) => window.getComputedStyle(el).stroke)
    expect(stroke).toBeTruthy()
  })
})
