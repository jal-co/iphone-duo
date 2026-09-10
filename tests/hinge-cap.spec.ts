import { expect, test } from '@playwright/test'
import { BoxGeometry } from 'three'
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js'
import { hingeCap } from '../scripts/hinge-cap'

function openBox(side: number, height = 2, depth = 0.5) {
  const geometry = new BoxGeometry(1, height, depth).translate(side * 0.5, 0, 0)
  const positions = geometry.attributes.position
  const indices = Array.from(geometry.index!.array)
  const retained: number[] = []
  for (let i = 0; i < indices.length; i += 3) {
    const triangle = indices.slice(i, i + 3)
    if (triangle.every(index => Math.abs(positions.getX(index)) < 0.00001)) continue
    retained.push(...triangle)
  }
  geometry.setIndex(retained)
  return geometry
}

for (const side of [-1, 1]) {
  test(`closes an open chassis edge with outward winding on side ${side}`, () => {
    const cap = hingeCap(openBox(side), side)
    const p = cap.attributes.position
    expect(p.count).toBe(6)
    for (let i = 0; i < p.count; i += 3) {
      const cross = (p.getY(i + 1) - p.getY(i)) * (p.getZ(i + 2) - p.getZ(i)) - (p.getZ(i + 1) - p.getZ(i)) * (p.getY(i + 2) - p.getY(i))
      expect(Math.sign(cross)).toBe(-side)
      expect(cap.attributes.normal.getX(i)).toBe(-side)
    }
  })
}

test('does not duplicate an existing closed face', () => {
  expect(hingeCap(new BoxGeometry(1, 2, 0.5).translate(0.5, 0, 0), 1).attributes.position.count).toBe(0)
})

test('preserves an enclosed hole instead of sealing through it', () => {
  const geometry = mergeGeometries([openBox(1), openBox(1, 1, 0.2)])
  const cap = hingeCap(geometry, 1)
  const p = cap.attributes.position
  let area = 0
  for (let i = 0; i < p.count; i += 3) area += Math.abs((p.getY(i + 1) - p.getY(i)) * (p.getZ(i + 2) - p.getZ(i)) - (p.getZ(i + 1) - p.getZ(i)) * (p.getY(i + 2) - p.getY(i))) / 2
  expect(area).toBeCloseTo(0.8, 5)
})
