import { compareAppVersions } from '@/lib/app-version';

describe('compareAppVersions', () => {
  it.each([
    ['1.0.0', '1.0.0', 0],
    ['1.0.1', '1.0.0', 1],
    ['1.0.0', '1.0.1', -1],
    ['2.0.0', '1.9.9', 1],
    ['1.10.0', '1.9.0', 1],
    ['1.2', '1.2.0', 0],
    ['1', '1.0.1', -1],
  ])('compares %s with %s as %d', (a, b, expected) => {
    expect(compareAppVersions(a, b)).toBe(expected);
  });

  it('only looks at the first three numeric parts', () => {
    expect(compareAppVersions('1.2.3.9', '1.2.3')).toBe(0);
    expect(compareAppVersions('1.2.3-beta.4', '1.2.3')).toBe(0);
  });

  it('ignores non-digit characters inside a part and treats empty parts as zero', () => {
    expect(compareAppVersions('v2.0.0', '2.0.0')).toBe(0);
    expect(compareAppVersions('1.x.0', '1.0.0')).toBe(0);
  });

  it('is antisymmetric', () => {
    const pairs: [string, string][] = [
      ['1.0.0', '1.0.1'],
      ['3.1.4', '3.1.0'],
      ['0.9', '1.0'],
    ];
    for (const [a, b] of pairs) {
      expect(compareAppVersions(a, b)).toBe(-compareAppVersions(b, a));
    }
  });
});
