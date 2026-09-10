import { chromium } from '@playwright/test'
import { mkdir, writeFile } from 'node:fs/promises'

const directory = 'test-results/motion-match'
await mkdir(directory, { recursive: true })
const browser = await chromium.launch()
try {
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 }, colorScheme: 'dark' })
  await page.goto('http://127.0.0.1:5201/')
  await page.locator('[data-ready="true"]').waitFor()
  await page.waitForLoadState('networkidle')
  await page.clock.install({ time: new Date('2026-09-09T12:00:00Z') })
  await page.clock.pauseAt(new Date('2026-09-09T12:00:01Z'))
  const bounds = await page.getByRole('button', { name: 'Unfold', exact: true }).boundingBox()
  if (!bounds) throw new Error('Missing unfold button')
  await page.mouse.click(bounds.x + bounds.width / 2, bounds.y + bounds.height / 2)
  const observations = []
  for (let frame = 1; frame <= 62; frame++) {
    await page.clock.runFor(1000 / 30)
    const progress = Number(await page.locator('.duo-device').getAttribute('data-progress'))
    if (frame % 10 === 0 || frame >= 54) {
      await page.locator('.duo-device').screenshot({ path: `${directory}/${String(frame).padStart(3, '0')}.png` })
    }
    observations.push({ frame, elapsed: frame / 30, progress })
  }
  await writeFile(`${directory}/frames.json`, JSON.stringify(observations, null, 2))
} finally {
  await browser.close()
}
