import { Box3, BufferGeometry, Float32BufferAttribute, Group, Mesh, MeshPhysicalMaterial, Vector3 } from 'three'
import { createScreenMaterial } from '../src/iphone-duo/screen-material'
import { USDLoader } from 'three/addons/loaders/USDLoader.js'

const displayNames = new Set(['UXtsBZYlaUvHoEh', 'hhgAIoCGsHXeDPY'])

type Vertex = Record<string, number[]>

function clipTriangle(vertices: Vertex[], side: number) {
  const output: Vertex[] = []
  for (let i = 0; i < vertices.length; i++) {
    const a = vertices[i]
    const b = vertices[(i + 1) % vertices.length]
    const insideA = a.position[0] * side >= 0
    const insideB = b.position[0] * side >= 0
    if (insideA) output.push(a)
    if (insideA === insideB) continue
    const t = a.position[0] / (a.position[0] - b.position[0])
    output.push(Object.fromEntries(Object.keys(a).map(key => [key, a[key].map((value, n) => value + (b[key][n] - value) * t)])))
  }
  return output
}

function halfGeometry(source: BufferGeometry, side: number) {
  source.computeBoundingBox()
  const bounds = source.boundingBox
  if (bounds && ((side > 0 && bounds.min.x >= -0.00001) || (side < 0 && bounds.max.x <= 0.00001))) return source.clone()
  if (bounds && ((side > 0 && bounds.max.x < 0) || (side < 0 && bounds.min.x > 0))) {
    return new BufferGeometry().setAttribute('position', new Float32BufferAttribute([], 3))
  }
  const geometry = source.index ? source.toNonIndexed() : source.clone()
  const attributes = Object.entries(geometry.attributes).filter(([name]) => ['position', 'normal', 'uv'].includes(name))
  const output: Record<string, number[]> = Object.fromEntries(attributes.map(([name]) => [name, []]))
  for (let i = 0; i < geometry.attributes.position.count; i += 3) {
    const triangle = [0, 1, 2].map(offset => Object.fromEntries(attributes.map(([name, attribute]) => [name, Array.from({ length: attribute.itemSize }, (_, n) => attribute.getComponent(i + offset, n))])))
    const polygon = clipTriangle(triangle, side)
    for (let j = 1; j < polygon.length - 1; j++) {
      for (const vertex of [polygon[0], polygon[j], polygon[j + 1]]) {
        for (const [name] of attributes) output[name].push(...vertex[name])
      }
    }
  }
  const result = new BufferGeometry()
  for (const [name, attribute] of attributes) result.setAttribute(name, new Float32BufferAttribute(output[name], attribute.itemSize))
  geometry.dispose()
  return result
}

export async function loadPhone(url: string) {
  const source = await new USDLoader().loadAsync(url)
  const body = new Group()
  const left = new Group()
  const right = new Group()
  const screen = createScreenMaterial(false)
  const cover = createScreenMaterial(true)
  const materials = new Set<MeshPhysicalMaterial>()
  body.add(left, right)
  source.updateMatrixWorld(true)
  source.traverse(object => {
    if (!(object instanceof Mesh) || ['lJPfQMFXvvcmdtA', 'xdyyaajWsatVNxN'].includes(object.name)) return
    const geometry = object.geometry.clone().applyMatrix4(object.matrixWorld)
    geometry.translate(0, -5.897, -0.24947828)
    const material = object.material
    if (material instanceof MeshPhysicalMaterial) {
      material.normalScale.setScalar(0.2)
      materials.add(material)
    }
    if (displayNames.has(object.name)) {
      const positions = geometry.attributes.position
      const bounds = new Box3().setFromBufferAttribute(positions)
      const size = bounds.getSize(new Vector3())
      const uv: number[] = []
      for (let i = 0; i < positions.count; i++) {
        const x = (positions.getX(i) - bounds.min.x) / size.x
        uv.push(object.name === 'hhgAIoCGsHXeDPY' ? 1 - x : x, (positions.getY(i) - bounds.min.y) / size.y)
      }
      geometry.setAttribute('uv', new Float32BufferAttribute(uv, 2))
    }
    for (const [side, group] of [[-1, left], [1, right]] as const) {
      const half = halfGeometry(geometry, side)
      if (half.attributes.position.count === 0) { half.dispose(); continue }
      const faceMaterial = object.name === 'UXtsBZYlaUvHoEh' ? screen : object.name === 'hhgAIoCGsHXeDPY' ? cover : material
      const mesh = new Mesh(half, faceMaterial)
      mesh.name = object.name
      group.add(mesh)
    }
    geometry.dispose()
  })
  source.traverse(object => { if (object instanceof Mesh) object.geometry.dispose() })
  return { body, left, screen, cover, dispose() {
    body.traverse(object => { if (object instanceof Mesh) object.geometry.dispose() })
    const textures = new Set<import('three').Texture>()
    for (const material of materials) {
      for (const value of Object.values(material)) if (value && typeof value === 'object' && 'isTexture' in value) textures.add(value)
      material.dispose()
    }
    for (const texture of textures) texture.dispose()
    screen.dispose()
    cover.dispose()
  } }
}
