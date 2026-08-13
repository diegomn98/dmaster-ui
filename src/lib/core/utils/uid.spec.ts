import { dmUid } from './uid';

/** Extracts the trailing numeric sequence from a generated id. */
function sequenceOf(id: string): number {
  return Number(id.slice(id.lastIndexOf('-') + 1));
}

describe('dmUid', () => {
  it('builds ids as `<prefix>-<sequence>`', () => {
    expect(dmUid('dm-switch')).toMatch(/^dm-switch-\d+$/);
    expect(dmUid('dm-tooltip')).toMatch(/^dm-tooltip-\d+$/);
  });

  it('returns strictly increasing sequences for the same prefix', () => {
    const first = sequenceOf(dmUid('dm-checkbox'));
    const second = sequenceOf(dmUid('dm-checkbox'));
    const third = sequenceOf(dmUid('dm-checkbox'));

    expect(second).toBe(first + 1);
    expect(third).toBe(second + 1);
  });

  it('shares a single global sequence across prefixes so ids never collide', () => {
    const a = sequenceOf(dmUid('dm-a'));
    const b = sequenceOf(dmUid('dm-b'));

    expect(b).toBe(a + 1);
  });

  it('never repeats an id', () => {
    const ids = Array.from({ length: 100 }, () => dmUid('dm-item'));

    expect(new Set(ids).size).toBe(ids.length);
  });
});
