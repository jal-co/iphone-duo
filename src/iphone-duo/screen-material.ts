import { Matrix4, ShaderMaterial, Vector2 } from 'three'

export function createScreenMaterial(cover: boolean) {
  return new ShaderMaterial({
    uniforms: { bodyInverse: { value: new Matrix4() }, screenMap: { value: undefined }, overlayMap: { value: undefined }, hasOverlay: { value: 0 }, revealMap: { value: undefined }, hasReveal: { value: 0 }, resolution: { value: new Vector2(1600, 1200) }, progress: { value: 0 }, focusEdge: { value: cover ? 1.25 : 0.5 }, defocus: { value: 1 }, blur: { value: 28 }, parallax: { value: 1 }, cover: { value: cover ? 1 : 0 } },
    vertexShader: `
      uniform mat4 bodyInverse;
      varying vec2 screenUv;
      varying vec3 displayPosition;
      varying vec3 displayCamera;
      varying vec3 coverStart;
      varying vec3 coverEnd;
      void main() {
        displayPosition = (bodyInverse * modelMatrix * vec4(position, 1.0)).xyz;
        displayCamera = (bodyInverse * vec4(cameraPosition, 1.0)).xyz;
        coverStart = (bodyInverse * modelMatrix * vec4(-0.233961, 0.0, -0.524105, 1.0)).xyz;
        coverEnd = (bodyInverse * modelMatrix * vec4(-7.973315, 0.0, -0.524105, 1.0)).xyz;
        screenUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform sampler2D screenMap;
      uniform sampler2D overlayMap;
      uniform float hasOverlay;
      uniform sampler2D revealMap;
      uniform float hasReveal;
      uniform float parallax;
      uniform vec2 resolution;
      uniform float progress;
      uniform float focusEdge;
      uniform float defocus;
      uniform float blur;
      uniform float cover;
      varying vec2 screenUv;
      varying vec3 displayPosition;
      varying vec3 displayCamera;
      varying vec3 coverStart;
      varying vec3 coverEnd;
      vec4 sampleLayer(sampler2D layer, vec2 uv, float lod) {
        return mix(texture2D(layer, uv), textureLod(layer, uv, lod), smoothstep(0.0, 1.0, lod));
      }
      vec4 sampleScreen(vec2 uv, float lod) {
        vec2 backgroundUv = clamp((uv - 0.5) * 0.97 + 0.5, vec2(0.001), vec2(0.999));
        vec4 background = sampleLayer(screenMap, backgroundUv, lod);
        vec2 revealUv = uv;
        vec4 reveal = sampleLayer(revealMap, clamp(revealUv, vec2(0.001), vec2(0.999)), lod);
        float revealInside = step(0.0, revealUv.x) * step(revealUv.x, 1.0) * step(0.0, revealUv.y) * step(revealUv.y, 1.0);
        background.rgb = mix(background.rgb, reveal.rgb, reveal.a * hasReveal * revealInside);
        vec2 contentUv = uv;
        vec4 content = sampleLayer(overlayMap, clamp(contentUv, vec2(0.001), vec2(0.999)), lod);
        float inside = step(0.0, contentUv.x) * step(contentUv.x, 1.0) * step(0.0, contentUv.y) * step(contentUv.y, 1.0);
        return vec4(mix(background.rgb, content.rgb, content.a * hasOverlay * inside), 1.0);
      }
      void main() {
        vec3 ray = displayPosition - displayCamera;
        float rayDepth = min(ray.z, -0.001);
        vec3 intersection = displayCamera + ray * (-displayCamera.z / rayDepth);
        vec2 planeUv = vec2(intersection.x / mix(15.798708, 7.739354, cover) + 0.5 * (1.0 - cover), intersection.y / mix(11.10349, 11.251288, cover) + 0.5);
        vec3 startRay = coverStart - displayCamera;
        vec3 endRay = coverEnd - displayCamera;
        float startX = displayCamera.x - startRay.x * displayCamera.z / min(startRay.z, -0.001);
        float endX = displayCamera.x - endRay.x * displayCamera.z / min(endRay.z, -0.001);
        if (cover > 0.5) {
          float span = endX - startX;
          planeUv.x = abs(span) > 0.001 ? (intersection.x - startX) / span : screenUv.x;
        }
        float projection = mix((1.0 - smoothstep(0.18, 0.5, screenUv.x)) * (1.0 - smoothstep(0.9, 1.0, progress)), smoothstep(0.0, 0.08, progress), cover);
        vec2 projectedUv = mix(screenUv, planeUv, clamp(parallax, 0.0, 1.0) * projection);
        float coverage = smoothstep(-0.01, 0.018, projectedUv.x) * (1.0 - smoothstep(0.982, 1.01, projectedUv.x));
        coverage = mix(coverage, 1.0, cover);
        coverage *= smoothstep(-0.035, 0.015, projectedUv.y) * (1.0 - smoothstep(0.985, 1.035, projectedUv.y));
        float coverWave = smoothstep(focusEdge - 0.2, focusEdge + 0.18, screenUv.x);
        float innerWave = defocus * (1.0 - smoothstep(0.2, 0.49, screenUv.x));
        float amount = mix(innerWave, coverWave, cover);
        float radius = blur * amount * mix(3.5, 1.8, cover);
        float lod = max(0.0, log2(max(1.0, radius / 3.0)));
        vec4 color = sampleScreen(projectedUv, lod);
        float weight = 1.0;
        for (int i = 1; i <= 4; i++) {
          float f = float(i);
          float distance = sqrt(f / 4.0);
          float angle = f * 2.399963;
          vec2 offset = vec2(cos(angle), sin(angle)) * distance * radius * 0.35 / resolution;
          float w = exp(-distance * distance * 2.0);
          color += sampleScreen(clamp(projectedUv + offset, vec2(0.001), vec2(0.999)), lod) * w;
          weight += w;
        }
        color /= weight;
        float foldShade = sin(progress * 3.14159265);
        float innerShade = foldShade * 0.18 * (1.0 - smoothstep(0.3, 0.5, screenUv.x));
        float coverShade = foldShade * 0.52 * smoothstep(0.05, 0.95, screenUv.x);
        color.rgb *= mix(1.0, coverage, projection) * (1.0 - mix(innerShade, coverShade, cover));
        gl_FragColor = color;
        #include <colorspace_fragment>
      }
    `,
    toneMapped: false,
  })
}
