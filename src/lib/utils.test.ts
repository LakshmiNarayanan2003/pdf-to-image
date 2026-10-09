import { describe, expect, it } from 'vitest';
import {
  dimensions,
  outputName,
  parseRange,
  safeStem,
  MAX_PIXELS,
  friendlyError,
  UserError,
} from './utils';
describe('page ranges', () => {
  it('sorts, expands and deduplicates pages', () =>
    expect(parseRange('5, 1-3,2', 8)).toEqual([1, 2, 3, 5]));
  it.each([
    '',
    '0',
    '1-',
    '-1',
    '3-2',
    '9',
    '1,,2',
    '1.5',
    '1-999999999',
    'NaN',
    '2;4',
  ])('rejects %s', (value) => expect(() => parseRange(value, 8)).toThrow());
  it('accepts whitespace around range separators', () =>
    expect(parseRange('1 - 2', 2)).toEqual([1, 2]));
});
describe('safe deterministic filenames', () => {
  it.each([
    ['../../report.pdf', 'report'],
    ['A\u0000B.pdf', 'A-B'],
    ['.pdf', 'document'],
    ['report.PDF', 'report'],
    ['你好.pdf', 'document'],
    ['a/b\\c.pdf', 'a-b-c'],
  ])('sanitizes %s', (input, expected) =>
    expect(safeStem(input)).toBe(expected),
  );
  it('pads page numbers and uses jpg extension', () =>
    expect(outputName('report', 2, 12, 'jpeg')).toBe('report-page-002.jpg'));
  it('expands padding for huge documents', () =>
    expect(outputName('a', 2, 1000, 'png')).toBe('a-page-0002.png'));
  it('bounds stem length', () =>
    expect(safeStem('a'.repeat(300))).toHaveLength(80));
});
describe('safe DPI bounds', () => {
  it('converts points to exact pixels', () =>
    expect(dimensions(612, 792, 150)).toEqual({ width: 1275, height: 1650 }));
  it('preserves landscape dimensions', () =>
    expect(dimensions(792, 612, 72)).toEqual({ width: 792, height: 612 }));
  it.each([0, 35, 601, Infinity, NaN])('rejects DPI %s', (dpi) =>
    expect(() => dimensions(612, 792, dpi)).toThrow(),
  );
  it('rejects oversized canvases', () =>
    expect(() => dimensions(MAX_PIXELS, 100, 72)).toThrow());
});
it('never echoes raw parser messages', () =>
  expect(friendlyError(new Error('PRIVATE DOCUMENT TEXT'))).not.toContain(
    'PRIVATE DOCUMENT TEXT',
  ));
it('reports safe application errors', () =>
  expect(friendlyError(new UserError('Choose fewer pages.'))).toBe(
    'Choose fewer pages.',
  ));
