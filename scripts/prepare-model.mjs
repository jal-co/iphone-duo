import { chromium } from '@playwright/test'
import { writeFile } from 'node:fs/promises'

const browser = await chromium.launch()
try {
  const page = await browser.newPage()
  await page.goto('http://127.0.0.1:5201/')
  const base64 = await page.evaluate(async () => {
    const { loadPhone } = await import('/scripts/prepare-geometry.ts')
    const { GLTFExporter } = await import('/node_modules/three/examples/jsm/exporters/GLTFExporter.js')
    const { MeshBasicMaterial } = await import('/node_modules/three/build/three.module.js')
    const model = await loadPhone('/models/iphone-duo.usdz')
    model.left.name = 'folding-half'
    model.body.name = 'iphone-duo'
    model.body.children[1].name = 'stationary-half'
    const screen = new MeshBasicMaterial({ color: 'white' })
    screen.name = 'inner-screen'
    const cover = new MeshBasicMaterial({ color: 'white' })
    cover.name = 'cover-screen'
    model.body.traverse(object => {
      if (object.material === model.screen) object.material = screen
      if (object.material === model.cover) object.material = cover
    })
    const result = await new GLTFExporter().parseAsync(model.body, { binary: true, maxTextureSize: 512 })
    const bytes = new Uint8Array(result)
    let binary = ''
    for (let i = 0; i < bytes.length; i += 8192) binary += String.fromCharCode(...bytes.subarray(i, i + 8192))
    return btoa(binary)
  })
  await writeFile('public/models/iphone-duo.glb', Buffer.from(base64, 'base64'))
} finally {
  await browser.close()
}
