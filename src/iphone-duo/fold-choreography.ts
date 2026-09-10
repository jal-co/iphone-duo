export const FOLD_DURATION = 2

export function foldChoreography(progress: number) {
  const p = Math.max(0, Math.min(1, progress))
  const hinge = Math.min(1, p / 0.96)
  return {
    angle: (1 - hinge) * Math.PI,
    coverFocusEdge: 1.25 - Math.min(1, p / 0.45) * 1.1,
    innerDefocus: (1 - p) ** 0.65,
  }
}
