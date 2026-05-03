import { describe, expect, it } from 'vitest';
import { stripUndefinedDeep } from './firestoreSanitize';

describe('stripUndefinedDeep', () => {
  it('removes undefined object fields recursively', () => {
    expect(stripUndefinedDeep({
      title: 'Example',
      subTitle: undefined,
      nested: {
        keep: 1,
        drop: undefined,
      },
    })).toEqual({
      title: 'Example',
      nested: {
        keep: 1,
      },
    });
  });

  it('removes undefined values from arrays', () => {
    expect(stripUndefinedDeep([
      'keep',
      undefined,
      { ok: true, skip: undefined },
    ])).toEqual([
      'keep',
      { ok: true },
    ]);
  });
});
