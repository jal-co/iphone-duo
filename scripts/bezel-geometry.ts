import { BufferGeometry, ExtrudeGeometry, Shape, Vector2 } from 'three'

export function bezelGeometry(display: BufferGeometry, inset: number, depth: number) {
  const positions = display.attributes.position
  const unique = new Map<string, Vector2>()
  for (let i = 0; i < positions.count; i++) {
    const point = new Vector2(positions.getX(i), positions.getY(i))
    unique.set(`${point.x},${point.y}`, point)
  }
  const points = [...unique.values()].sort((a, b) => a.x - b.x || a.y - b.y)
  const cross = (a: Vector2, b: Vector2, c: Vector2) => (b.x - a.x) * (c.y - a.y) - (b.y - a.y) * (c.x - a.x)
  const halfHull = (ordered: Vector2[]) => {
    const hull: Vector2[] = []
    for (const point of ordered) {
      while (hull.length >= 2 && cross(hull[hull.length - 2], hull[hull.length - 1], point) <= 0) hull.pop()
      hull.push(point)
    }
    return hull.slice(0, -1)
  }
  const inner = [...halfHull(points), ...halfHull([...points].reverse())]
  const outer = inner.map((point, i) => {
    const previous = inner[(i + inner.length - 1) % inner.length]
    const next = inner[(i + 1) % inner.length]
    const before = new Vector2(point.y - previous.y, previous.x - point.x).normalize()
    const after = new Vector2(next.y - point.y, point.x - next.x).normalize()
    const miter = before.clone().add(after).normalize()
    return point.clone().addScaledVector(miter, inset / miter.dot(after))
  })
  const perimeter = new Shape(outer)
  perimeter.holes.push(new Shape(inner))
  return new ExtrudeGeometry(perimeter, { depth, bevelEnabled: false })
}
