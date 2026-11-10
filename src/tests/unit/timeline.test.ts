import { describe, expect, it } from 'vitest';
import { chapterAt, chapters, WINDOWS } from '../../data/timeline';

describe('Living Archive — capítulos por scroll', () => {
  it('três marcos na ordem 2001, 2019, 2021', () => {
    expect(chapters.map((c) => c.year)).toEqual(['2001', '2019', '2021']);
  });
  it('introdução antes do primeiro capítulo e cobertura contínua até o fim', () => {
    expect(chapterAt(0)).toBe(-1);
    expect(chapterAt(0.05)).toBe(-1);
    expect(chapterAt(0.2)).toBe(0);
    expect(chapterAt(0.55)).toBe(1);
    expect(chapterAt(0.9)).toBe(2);
    expect(chapterAt(1)).toBe(2);
    for (let p = 0.12; p <= 1; p += 0.005) expect(chapterAt(p)).toBeGreaterThanOrEqual(0);
  });
  it('cada capítulo tem tempo de leitura suficiente', () => {
    WINDOWS.forEach(([a, b]) => expect(Math.min(b, 1) - a).toBeGreaterThan(0.25));
  });
});
