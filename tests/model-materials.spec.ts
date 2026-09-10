import { readFileSync } from 'node:fs'
import { expect, test } from '@playwright/test'

test('inner bezel exports opaque smooth glass instead of noisy surface maps', () => {
  const buffer = readFileSync('public/models/iphone-duo.glb')
  const document = JSON.parse(buffer.subarray(20, 20 + buffer.readUInt32LE(12)).toString())
  const names = ['JnJdTkxbQgUtLwU', 'gjdjMOcCfrwBMYH', 'svvOILdVxasRAOk', 'xdyyaajWsatVNxN']
  for (const name of names) {
    const nodes = document.nodes.filter((node: { name?: string }) => node.name?.startsWith(name) && !node.name.includes('hinge-cap'))
    expect(nodes.length).toBeGreaterThan(0)
    for (const node of nodes) {
      for (const primitive of document.meshes[node.mesh].primitives) {
        const material = document.materials[primitive.material]
        expect(material.name).toBe('inner-bezel-glass')
        expect(material.normalTexture).toBeUndefined()
        expect(material.pbrMetallicRoughness.metallicRoughnessTexture).toBeUndefined()
        expect(material.pbrMetallicRoughness.metallicFactor).toBe(0)
        expect(material.pbrMetallicRoughness.roughnessFactor).toBeCloseTo(0.08)
        expect(material.alphaMode ?? 'OPAQUE').toBe('OPAQUE')
      }
    }
  }
})

test('continuous bezel covers the perimeter and hinge ends in flat and book poses', async ({ page }) => {
  await page.goto('/')
  const hits = await page.evaluate(async () => {
    const modulePath = '/node_modules/three/examples/jsm/loaders/GLTFLoader.js'
    const threePath = '/node_modules/three/build/three.module.js'
    const { GLTFLoader } = await import(modulePath)
    const { Raycaster, Vector3 } = await import(threePath)
    const model = (await new GLTFLoader().loadAsync('/models/iphone-duo.glb')).scene
    const left = model.getObjectByName('folding-half')
    const right = model.getObjectByName('stationary-half')
    const results: string[] = []
    for (const angle of [0, 0.6, 1.1]) {
      left.rotation.y = angle
      model.updateMatrixWorld(true)
      for (const [side, half] of [[-1, left], [1, right]]) {
        for (const end of [-1, 1]) {
          for (const [x, y] of [[side * 0.2, end * 5.7], [side * 4, end * 5.7], [side * 8.04, end * 3]]) {
            const point = new Vector3(x, y, 0.045).applyMatrix4(half.matrixWorld)
            const origin = new Vector3(point.x, point.y, 20)
            const ray = new Raycaster(origin, new Vector3(0, 0, -1))
            results.push(ray.intersectObject(model, true)[0]?.object.name ?? 'no surface')
          }
        }
      }
    }
    return results
  })
  expect(hits).toHaveLength(36)
  expect(hits.every(name => name.startsWith('continuous-inner-bezel-'))).toBe(true)
})
