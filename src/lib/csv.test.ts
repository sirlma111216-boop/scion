import { describe, expect, it } from 'vitest';
import { CSV_HEADER, toCsv } from './csv';
import { emptySession } from './model';

describe('CSV', () => {
  it('BOM과 열 순서', () => {
    const s = emptySession();
    s.experiments.irr.conditions[0].trials = [{ t: 0, V: 5, I: 0.2, P: 1, G: 900, T: 30, n: 10, unstable: true, source: 'sensor' }];
    const csv = toCsv(s);
    expect(csv.charCodeAt(0)).toBe(0xfeff);
    const lines = csv.slice(1).split('\r\n');
    expect(lines[0]).toBe(CSV_HEADER.join(','));
    const cols = lines[1].split(',');
    expect(cols[0]).toBe('일사량');
    expect(cols[3]).toBe('1');
    expect(cols[5]).toBe('5.000');
    expect(cols[11]).toBe('흔들림');
  });
});
