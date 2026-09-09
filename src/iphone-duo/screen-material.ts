import { ShaderMaterial, Vector2 } from 'three'

export function createScreenMaterial(cover: boolean) {
  return new ShaderMaterial({
    uniforms: { screenMap: { value: undefined }, overlayMap: { value: undefined }, hasOverlay: { value: 0 }, revealMap: { value: undefined }, hasReveal: { value: 0 }, resolution: { value: new Vector2(1600, 1200) }, progress: { value: 0 }, blur: { value: 28 }, parallax: { value: 1 }, cover: { value: cover ? 1 : 0 } },
    vertexShader: `
      varying vec2 screenUv;
      void main() {
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
      uniform float blur;
      uniform float cover;
      varying vec2 screenUv;
      vec4 sampleScreen(vec2 uv) {
        float arrival = smoothstep(0.48, 1.0, progress);
        vec2 backgroundUv = clamp((uv - 0.5) * 0.97 + 0.5 + vec2((1.0 - arrival) * 0.012 * parallax, 0.0), vec2(0.001), vec2(0.999));
        vec4 background = texture2D(screenMap, backgroundUv);
        vec2 center = vec2(0.245, 0.5);
        vec2 revealUv = (uv - center) / (1.0 + (1.0 - arrival) * 0.075 * parallax) + center;
        revealUv.x += (1.0 - arrival) * 0.12 * parallax;
        vec4 reveal = texture2D(revealMap, clamp(revealUv, vec2(0.001), vec2(0.999)));
        float revealInside = step(0.0, revealUv.x) * step(revealUv.x, 1.0) * step(0.0, revealUv.y) * step(revealUv.y, 1.0);
        background.rgb = mix(background.rgb, reveal.rgb, reveal.a * hasReveal * revealInside);
        vec2 contentUv = uv;
        contentUv.x -= (1.0 - smoothstep(0.25, 0.9, progress)) * 0.018 * parallax * (1.0 - cover);
        vec4 content = texture2D(overlayMap, clamp(contentUv, vec2(0.001), vec2(0.999)));
        float inside = step(0.0, contentUv.x) * step(contentUv.x, 1.0) * step(0.0, contentUv.y) * step(contentUv.y, 1.0);
        return vec4(mix(background.rgb, content.rgb, content.a * hasOverlay * inside), 1.0);
      }
      void main() {
        float coverWave = smoothstep(0.0, 0.22, progress) * smoothstep(-0.15, 0.95, screenUv.x + progress * 0.55);
        float innerWave = (1.0 - smoothstep(0.65, 1.0, progress)) * (1.0 - smoothstep(0.42, 0.48, screenUv.x));
        float amount = mix(innerWave, coverWave, cover);
        float radius = blur * amount;
        vec4 color = sampleScreen(screenUv);
        float weight = 1.0;
        for (int i = 1; i <= 48; i++) {
          float f = float(i);
          float distance = sqrt(f / 48.0);
          float angle = f * 2.399963;
          vec2 offset = vec2(cos(angle), sin(angle)) * distance * radius / resolution;
          float w = exp(-distance * distance * 2.0);
          color += sampleScreen(clamp(screenUv + offset, vec2(0.001), vec2(0.999))) * w;
          weight += w;
        }
        color /= weight;
        float foldShade = sin(progress * 3.14159265) * 0.24;
        color.rgb *= 1.0 - mix(foldShade * (1.0 - smoothstep(0.25, 0.75, screenUv.x)), foldShade, cover);
        gl_FragColor = color;
        #include <colorspace_fragment>
      }
    `,
    toneMapped: false,
  })
}
