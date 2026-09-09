import { expect, test, type Page } from '@playwright/test'

async function ready(page: Page) {
  await page.goto('/')
  await expect(page.locator('.duo-device')).toHaveAttribute('data-ready', 'true')
  await expect(page.locator('.duo-status')).toHaveCount(0)
}

async function seek(page: Page, value: string) {
  await page.getByRole('slider', { name: 'Fold angle', exact: true }).fill(value)
  await expect(page.locator('.duo-device')).toHaveAttribute('data-progress', Number(value).toFixed(3))
}

test('loads the Apple model, folds, reverses, and credits its source', async ({ page }) => {
  const errors: string[] = []
  page.on('pageerror', error => errors.push(error.message))
  await ready(page)
  await expect(page.getByRole('link', { name: 'Model by Apple' })).toHaveAttribute('href', 'https://www.apple.com/iphone-duo/')
  await page.getByRole('button', { name: 'Unfold', exact: true }).click()
  await expect(page.locator('.duo-device')).toHaveAttribute('data-progress', '1.000')
  await page.getByRole('button', { name: 'Fold', exact: true }).click()
  await expect.poll(async () => Number(await page.locator('.duo-device').getAttribute('data-progress'))).toBeLessThan(0.9)
  await page.getByRole('button', { name: 'Fold or unfold phone', exact: true }).click()
  await expect(page.locator('.duo-device')).toHaveAttribute('data-progress', '1.000')
  expect(errors).toEqual([])
})

test('keyboard controls are immediate and fold amount persists', async ({ page }) => {
  await ready(page)
  await page.getByRole('button', { name: 'Unfold', exact: true }).focus()
  await page.keyboard.press('Enter')
  await expect(page.locator('.duo-device')).toHaveAttribute('data-progress', '1.000')
  await seek(page, '0.35')
  await page.reload()
  await expect(page.locator('.duo-device')).toHaveAttribute('data-progress', '0.350')
  const slider = page.getByRole('slider', { name: 'Fold angle', exact: true })
  await slider.focus()
  await page.keyboard.press('Home')
  await expect(slider).toHaveValue('0')
  await page.keyboard.press('End')
  await expect(slider).toHaveValue('1')
})

test('progressive blur changes screen pixels while hardware stays sharp', async ({ page }) => {
  await ready(page)
  await seek(page, '0.2')
  await page.getByRole('button', { name: 'Tune', exact: true }).click()
  const blur = page.getByRole('slider', { name: 'Blur', exact: true })
  await expect(blur).toBeVisible()
  const blurred = await page.locator('.duo-device canvas').screenshot()
  await blur.focus()
  await page.keyboard.press('Home')
  const sharp = await page.locator('.duo-device canvas').screenshot()
  expect(blurred.equals(sharp)).toBe(false)
  await page.keyboard.press('End')
  await page.locator('.duo-device canvas').screenshot({ path: 'test-results/blur-maximum.png' })
})

test('dragging reverses without snapping and cancellation restores its start', async ({ page }) => {
  await ready(page)
  const target = page.getByRole('button', { name: 'Fold or unfold phone' })
  const bounds = await target.boundingBox()
  if (!bounds) throw new Error('Missing phone hit area')
  const x = bounds.x + bounds.width * 0.65
  const y = bounds.y + bounds.height / 2
  await page.mouse.move(x, y)
  await page.mouse.down()
  await page.mouse.move(x - 100, y, { steps: 8 })
  const first = Number(await page.locator('.duo-device').getAttribute('data-progress'))
  expect(first).toBeGreaterThan(0.1)
  await page.mouse.move(x - 40, y, { steps: 5 })
  expect(Number(await page.locator('.duo-device').getAttribute('data-progress'))).toBeLessThan(first)
  await target.dispatchEvent('pointercancel')
  await page.mouse.up()
  await expect(page.locator('.duo-device')).toHaveAttribute('data-progress', '0.000')
})

test('wallpapers and theme change without resetting fold', async ({ page }) => {
  await ready(page)
  await seek(page, '0.7')
  await page.getByRole('button', { name: 'tide wallpaper' }).click()
  await expect(page.getByRole('button', { name: 'tide wallpaper' })).toHaveAttribute('aria-pressed', 'true')
  await page.getByRole('button', { name: 'Light mode' }).click()
  await expect(page.getByRole('button', { name: 'Dark mode' })).toBeVisible()
  await expect(page.locator('.duo-device')).toHaveAttribute('data-progress', '0.700')
  await page.screenshot({ path: 'test-results/light-half.png', fullPage: true })
})

test('reduced motion settles on the endpoint immediately', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await ready(page)
  await page.getByRole('button', { name: 'Unfold', exact: true }).click()
  await expect(page.locator('.duo-device')).toHaveAttribute('data-progress', '1.000')
  await page.getByRole('button', { name: 'Fold', exact: true }).click()
  await expect(page.locator('.duo-device')).toHaveAttribute('data-progress', '0.000')
})

test('mobile contains controls and supports tapping', async ({ browser }) => {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true, colorScheme: 'dark' })
  const page = await context.newPage()
  await ready(page)
  await page.getByRole('button', { name: 'Unfold', exact: true }).tap()
  await expect(page.locator('.duo-device')).toHaveAttribute('data-progress', '1.000')
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
  await expect(page.getByRole('link', { name: 'Model by Apple' })).toBeInViewport()
  await page.screenshot({ path: 'test-results/mobile.png', fullPage: true })
  await context.close()
})

test('model failure is explicit', async ({ page }) => {
  await page.route('**/models/iphone-duo.glb', route => route.abort())
  await page.goto('/')
  await expect(page.locator('.duo-status')).toContainText('Apple model could not load')
  await expect(page.getByRole('button', { name: 'Fold or unfold phone' })).toBeDisabled()
})
