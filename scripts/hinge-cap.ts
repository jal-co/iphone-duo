import { BufferGeometry, Float32BufferAttribute, ShapeUtils, Vector2 } from 'three'

export function hingeCap(geometry: BufferGeometry, side: number) {
  const positions = geometry.attributes.position
  const edgeCounts = new Map<string, { a: string; b: string; count: number }>()
  const points = new Map<string, Vector2>()
  const key = (index: number) => `${Math.round(positions.getY(index) * 100000)},${Math.round(positions.getZ(index) * 100000)}`
  const count = geometry.index?.count ?? positions.count
  for (let i = 0; i < count; i += 3) {
    const triangle = [0, 1, 2].map(offset => geometry.index ? geometry.index.getX(i + offset) : i + offset)
    for (let edge = 0; edge < 3; edge++) {
      const a = triangle[edge], b = triangle[(edge + 1) % 3]
      if (Math.abs(positions.getX(a)) > 0.00001 || Math.abs(positions.getX(b)) > 0.00001) continue
      const ak = key(a), bk = key(b)
      if (ak === bk) continue
      points.set(ak, new Vector2(positions.getY(a), positions.getZ(a)))
      points.set(bk, new Vector2(positions.getY(b), positions.getZ(b)))
      const edgeKey = [ak, bk].sort().join(':')
      const existing = edgeCounts.get(edgeKey)
      if (existing) existing.count++
      else edgeCounts.set(edgeKey, { a: ak, b: bk, count: 1 })
    }
  }
  const adjacency = new Map<string, string[]>()
  for (const { a, b, count } of edgeCounts.values()) {
    if (count !== 1) continue
    adjacency.set(a, [...(adjacency.get(a) ?? []), b])
    adjacency.set(b, [...(adjacency.get(b) ?? []), a])
  }
  const visited = new Set<string>()
  const contours: Vector2[][] = []
  for (const start of adjacency.keys()) {
    if (visited.has(start)) continue
    const path: string[] = []
    let current = start, previous = ''
    while (!visited.has(current)) {
      visited.add(current)
      path.push(current)
      const neighbors = adjacency.get(current)
      if (!neighbors || neighbors.length !== 2) break
      const next = neighbors.find(value => value !== previous)
      if (!next) break
      previous = current
      current = next
    }
    if (current === start && path.length >= 3) contours.push(path.map(value => points.get(value)!))
  }
  const inside = (point: Vector2, polygon: Vector2[]) => {
    let result = false
    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
      const a = polygon[i], b = polygon[j]
      if ((a.y > point.y) !== (b.y > point.y) && point.x < (b.x - a.x) * (point.y - a.y) / (b.y - a.y) + a.x) result = !result
    }
    return result
  }
  const depth = contours.map(contour => contours.filter(other => other !== contour && inside(contour[0], other)).length)
  const vertices: number[] = [], normals: number[] = []
  contours.forEach((contour, index) => {
    if (depth[index] % 2 !== 0) return
    const holes = contours.filter((hole, holeIndex) => depth[holeIndex] === depth[index] + 1 && inside(hole[0], contour))
    const flat = [contour, ...holes].flat()
    for (const face of ShapeUtils.triangulateShape(contour, holes)) {
      const [a, b, c] = face.map(i => flat[i])
      const cross = (b.x - a.x) * (c.y - a.y) - (b.y - a.y) * (c.x - a.x)
      for (const point of cross * side > 0 ? [a, c, b] : [a, b, c]) {
        vertices.push(0, point.x, point.y)
        normals.push(-side, 0, 0)
      }
    }
  })
  return new BufferGeometry().setAttribute('position', new Float32BufferAttribute(vertices, 3)).setAttribute('normal', new Float32BufferAttribute(normals, 3))
}
