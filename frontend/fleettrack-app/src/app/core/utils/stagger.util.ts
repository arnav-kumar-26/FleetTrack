export function staggerDelay(i: number, step = 40, cap = 320): number {
  return Math.min(i * step, cap);
}