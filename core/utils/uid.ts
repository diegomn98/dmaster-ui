let sequence = 0;

/** Generates a unique, SSR-stable-enough id for ARIA wiring (`dm-switch-3`…). */
export function dmUid(prefix: string): string {
  return `${prefix}-${++sequence}`;
}
