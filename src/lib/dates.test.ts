import {describe,it,expect} from 'vitest';
import {formatDate,parseDate} from './dates';
describe('MM/DD/YYYY dates',()=>{
  it('formats calendar dates with padded month and day',()=>expect(formatDate('2026-01-09')).toBe('01/09/2026'));
  it('formats timestamp dates consistently',()=>expect(formatDate('2026-11-14T23:00:00Z')).toBe('11/14/2026'));
  it('reads MM/DD/YYYY without timezone shifts',()=>expect(parseDate('11/14/2026')).toBe('2026-11-14'));
  it('rejects impossible dates',()=>{expect(parseDate('02/29/2026')).toBeUndefined();expect(parseDate('13/01/2026')).toBeUndefined();});
  it('accepts leap days',()=>expect(parseDate('02/29/2028')).toBe('2028-02-29'));
});