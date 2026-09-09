import { Material, Mesh, Texture } from 'three'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import { createScreenMaterial } from './screen-material'

export async function loadPhone(url: string) {
  const source = await new GLTFLoader().loadAsync(url)
  const body = source.scene
  const left = body.getObjectByName('folding-half')
  if (!left) throw new Error('Model is missing the folding half.')
  const screen = createScreenMaterial(false)
  const cover = createScreenMaterial(true)
  const materials = new Set<Material>([screen, cover])
  body.traverse(object => {
    if (!(object instanceof Mesh)) return
    const originals = Array.isArray(object.material) ? object.material : [object.material]
    originals.forEach(material => materials.add(material))
    if (object.material.name === 'inner-screen') object.material = screen
    if (object.material.name === 'cover-screen') object.material = cover
  })
  return { body, left, screen, cover, dispose() {
    body.traverse(object => { if (object instanceof Mesh) object.geometry.dispose() })
    const textures = new Set<Texture>()
    for (const material of materials) {
      for (const value of Object.values(material)) if (value instanceof Texture) textures.add(value)
      material.dispose()
    }
    for (const texture of textures) texture.dispose()
  } }
}
