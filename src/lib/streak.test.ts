import {describe,expect,it} from 'vitest';
import {blankContact,outreachStreak,snooze} from './contacts';
const met=(date:string)=>({...blankContact(),interactions:[{id:date,date,channel:'Email',summary:'',meeting_notes:''}]});
describe('outreach streak',()=>{
  it('counts consecutive past weeks that met the goal',()=>{expect(outreachStreak([met('2026-11-03'),met('2026-10-27')],1,'2026-11-11')).toBe(2);});
  it('includes the current week once the goal is met',()=>{expect(outreachStreak([met('2026-11-10'),met('2026-11-03')],1,'2026-11-11')).toBe(2);});
  it('breaks at a missed week',()=>{expect(outreachStreak([met('2026-10-27')],1,'2026-11-11')).toBe(0);});
});
describe('snooze',()=>{it('moves the follow-up 3 days out',()=>{expect(snooze(blankContact(),3,'2026-11-11').next_step_date).toBe('2026-11-14');});});
