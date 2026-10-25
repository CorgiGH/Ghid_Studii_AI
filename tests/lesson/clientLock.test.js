import { describe, expect, it } from 'vitest';
import { exclusive } from '../../src/components/blocks/test/clientLock.js';

describe('exclusive', () => {
  it('runs tasks one after another, in order, even when one throws', async () => {
    const log = [];
    const slow = exclusive(async () => { log.push('a-start'); await new Promise((r) => setTimeout(r, 20)); log.push('a-end'); return 1; });
    const bad = exclusive(async () => { log.push('b'); throw new Error('x'); });
    const last = exclusive(async () => { log.push('c'); return 3; });
    expect(await slow).toBe(1);
    await expect(bad).rejects.toThrow('x');
    expect(await last).toBe(3);
    expect(log).toEqual(['a-start', 'a-end', 'b', 'c']);
  });
});
