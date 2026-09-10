import { expect, test } from '@playwright/test'
import { foldChoreography } from '../src/iphone-duo/fold-choreography'

test('hardware settles before focus reaches the outside edge', () => {
  const nearlyOpen = foldChoreography(0.975)
  const settled = foldChoreography(1)
  expect(nearlyOpen.angle).toBe(0)
  expect(nearlyOpen.innerDefocus).toBeGreaterThan(0)
  expect(settled.innerDefocus).toBe(0)
})

test('focus fronts reverse continuously with scrubbing', () => {
  const samples = Array.from({ length: 101 }, (_, index) => foldChoreography(index / 100))
  for (let index = 1; index < samples.length; index++) {
    expect(samples[index].angle).toBeLessThanOrEqual(samples[index - 1].angle)
    expect(samples[index].coverFocusEdge).toBeLessThanOrEqual(samples[index - 1].coverFocusEdge)
    expect(samples[index].innerDefocus).toBeLessThanOrEqual(samples[index - 1].innerDefocus)
    expect(Math.abs(samples[index].angle - samples[index - 1].angle)).toBeLessThan(0.08)
  }
  expect(foldChoreography(0).angle).toBe(Math.PI)
  expect(foldChoreography(0).coverFocusEdge).toBe(1.25)
})

test('late screen settling leaves the right grid and hardware unchanged', async ({ page }) => {
  await page.goto('/')
  await expect(page.locator('.duo-device')).toHaveAttribute('data-ready', 'true')
  await page.waitForLoadState('networkidle')
  const canvas = page.locator('.duo-device canvas')
  const bounds = await canvas.boundingBox()
  if (!bounds) throw new Error('Missing device canvas')
  const left = { x: bounds.x + bounds.width * 0.24, y: bounds.y + bounds.height * 0.3, width: bounds.width * 0.23, height: bounds.height * 0.35 }
  const right = { x: bounds.x + bounds.width * 0.57, y: bounds.y + bounds.height * 0.3, width: bounds.width * 0.15, height: bounds.height * 0.35 }
  const slider = page.getByRole('slider', { name: 'Fold angle', exact: true })
  await slider.fill('0.975')
  await expect(page.locator('.duo-device')).toHaveAttribute('data-progress', '0.975')
  const leftBefore = await page.screenshot({ clip: left })
  const rightBefore = await page.screenshot({ clip: right })
  await slider.fill('1')
  await expect(page.locator('.duo-device')).toHaveAttribute('data-progress', '1.000')
  expect(leftBefore.equals(await page.screenshot({ clip: left }))).toBe(false)
  expect(rightBefore.equals(await page.screenshot({ clip: right }))).toBe(true)
})
