export const CHAPTER_COUNT = 4;

export function smoothstep(edge0: number, edge1: number, x: number) {
  const t = Math.min(1, Math.max(0, (x - edge0) / (edge1 - edge0)));
  return t * t * (3 - 2 * t);
}

/** Local 0-1 progress within chapter `index` (0-based), derived from total 0-1 scroll progress. */
export function chapterProgress(total: number, index: number) {
  const start = index / CHAPTER_COUNT;
  const end = (index + 1) / CHAPTER_COUNT;
  return smoothstep(start, end, total);
}

/**
 * Chapter-3-local progress points (0-1) where each of the 5 benefit lines
 * reveals. Shared by the DOM GSAP timeline (as `2 + point`, chapter index 2)
 * and the 3D scan-sweep's flash trigger (as `(2 + point) / CHAPTER_COUNT`,
 * total progress) so both read from one source instead of drifting apart.
 */
export const CHAPTER3_BENEFIT_POINTS = [0.66, 0.705, 0.75, 0.795, 0.84];
