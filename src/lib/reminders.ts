import {daysUntil,reminderStatus,today,type Contact} from './contacts';
export type ReminderTiming={reminder_initial_days:number;reminder_reply_days:number;reminder_talking_days:number;reminder_keep_days:number};
export const DEFAULT_TIMING:ReminderTiming={reminder_initial_days:5,reminder_reply_days:7,reminder_talking_days:7,reminder_keep_days:90};
export type Reminder={kind:'next-step'|'stage';days:number;label:string};
export function validTiming(n:number){return Number.isSafeInteger(n)&&n>0;}
export function timingFor(p:Partial<ReminderTiming>):ReminderTiming{return Object.fromEntries(Object.entries(DEFAULT_TIMING).map(([k,v])=>[k,validTiming(p[k as keyof ReminderTiming]??0)?p[k as keyof ReminderTiming]:v])) as ReminderTiming;}
function elapsed(date:string,from:string){return Math.max(0,-daysUntil(date.slice(0,10),from));}
function activity(c:Contact){return c.interactions.map(i=>i.date).sort().at(-1)||c.last_contact||c.tracking_started||c.created_at.slice(0,10);}
function afterStart(c:Contact,date:string){return c.tracking_started&&c.tracking_started>date?c.tracking_started:date;}
export function reminders(c:Contact,p:Partial<ReminderTiming>={},from=today()):Reminder[]{
 if(c.tracked===false||(c.snoozed_until&&from<c.snoozed_until))return [];
 const settings=timingFor(p);const result:Reminder[]=[];const due=reminderStatus(c,from);
 if(due)result.push({...due,kind:'next-step'});
 let days=0;let label='';let threshold=Infinity;
 if(c.stage==='Not contacted'){days=elapsed(afterStart(c,c.created_at.slice(0,10)),from);threshold=settings.reminder_initial_days;label=`Added ${days} days ago. Reach out.`;}
 if(c.stage==='Reached out'){
  const outreach=c.interactions.filter(i=>i.kind==='outreach').sort((a,b)=>b.date.localeCompare(a.date));
  days=elapsed(afterStart(c,outreach[0]?.date||activity(c)),from);threshold=settings.reminder_reply_days;
  const count=Math.max(0,outreach.length-1);label=count?`Followed up ${count} ${count===1?'time':'times'}. No reply in ${days} days.`:`No reply in ${days} days. Follow up.`;
 }
 if(c.stage==='Talking'){days=elapsed(afterStart(c,activity(c)),from);threshold=settings.reminder_talking_days;label=`Your turn. ${days} days.`;}
 if(c.stage==='Keep in touch'){days=elapsed(afterStart(c,activity(c)),from);threshold=({'2 weeks':14,Monthly:30,Quarterly:90} as Record<string,number>)[c.reconnect_cadence]??settings.reminder_keep_days;label=`Last activity ${days} days ago. Keep in touch.`;}
 if(Number.isFinite(days)&&days>=threshold)result.push({kind:'stage',days,label});
 return result;
}