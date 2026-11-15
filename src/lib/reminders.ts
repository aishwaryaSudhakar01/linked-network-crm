import {daysUntil,reminderStatus,today,type Contact} from './contacts';
export type ReminderTiming={reminder_initial_days:number;reminder_reply_days:number;reminder_talking_days:number;reminder_keep_days:number;reminder_dormant_days:number};
export const DEFAULT_TIMING:ReminderTiming={reminder_initial_days:5,reminder_reply_days:7,reminder_talking_days:7,reminder_keep_days:90,reminder_dormant_days:14};
export type Reminder={kind:'next-step'|'stage';days:number;label:string};
export function validTiming(n:number){return Number.isSafeInteger(n)&&n>0;}
export function timingFor(p:Partial<ReminderTiming>):ReminderTiming{const value=Object.fromEntries(Object.entries(DEFAULT_TIMING).map(([k,v])=>[k,validTiming(p[k as keyof ReminderTiming]??0)?p[k as keyof ReminderTiming]:v])) as ReminderTiming;value.reminder_dormant_days=Math.max(value.reminder_dormant_days,value.reminder_reply_days+3);return value;}
export function validTimingPair(p:ReminderTiming){return Object.values(p).every(validTiming)&&p.reminder_dormant_days>=p.reminder_reply_days+3;}
export type OutreachFilter='follow-up'|'going-dormant';
export function noReply(c:Contact,p:Partial<ReminderTiming>={},from=today()){
 const settings=timingFor(p);const outreach=c.interactions.filter(i=>i.kind==='outreach').sort((a,b)=>b.date.localeCompare(a.date));const latest=outreach[0];
 const anchor=[latest?.date,c.revived_at,c.tracking_started].filter((s):s is string=>!!s).sort().at(-1);
 if(c.stage!=='Reached out'||c.tracked===false||!anchor||(!latest&&!c.revived_at))return undefined;
 const days=Math.max(0,-daysUntil(anchor,from));const remaining=settings.reminder_dormant_days-days;
 const followUps=outreach.filter((i,index)=>i.outreach_type!=='connection-request'&&(i.follow_up===true||(i.follow_up===undefined&&index<outreach.length-1))).length;
 const dormant=remaining<=0;const visible=!c.snoozed_until||c.snoozed_until<=from;
 return {days,remaining,followUps,dormant,followUp:visible&&!dormant&&latest?.outreach_type!=='connection-request'&&days>=settings.reminder_reply_days,goingDormant:visible&&!dormant&&remaining<=2};
}
export function effectiveContact(c:Contact,p:Partial<ReminderTiming>={},from=today()):Contact{return noReply(c,p,from)?.dormant?{...c,stage:'Dormant'}:c;}
export function matchesOutreach(c:Contact,filter:OutreachFilter,p:Partial<ReminderTiming>={},from=today()){const status=noReply(c,p,from);return filter==='follow-up'?!!status?.followUp:!!status?.goingDormant;}
export function outreachCounts(list:Contact[],p:Partial<ReminderTiming>={},from=today()){const follow=list.filter(c=>matchesOutreach(c,'follow-up',p,from));const going=list.filter(c=>matchesOutreach(c,'going-dormant',p,from));return {follow,going,unique:new Set([...follow,...going].map(c=>c.id)).size};}
export function outreachLines(list:Contact[],p:Partial<ReminderTiming>={},from=today()){const counts=outreachCounts(list,p,from);const n=counts.follow.length;const g=counts.going.length;const remaining=Math.min(...counts.going.map(c=>noReply(c,p,from)?.remaining??2));return [{filter:'follow-up' as const,count:n,label:`${n} ${n===1?"person hasn't":"people haven't"} replied in ${timingFor(p).reminder_reply_days}+ days. Follow up.`},{filter:'going-dormant' as const,count:g,label:`${g} ${g===1?'person goes':'people go'} dormant in ${remaining} ${remaining===1?'day':'days'}. Review.`}].filter(x=>x.count>0);}

function elapsed(date:string,from:string){return Math.max(0,-daysUntil(date.slice(0,10),from));}
function activity(c:Contact){return c.interactions.map(i=>i.date).sort().at(-1)||c.last_contact||c.tracking_started||c.created_at.slice(0,10);}
function afterStart(c:Contact,date:string){return c.tracking_started&&c.tracking_started>date?c.tracking_started:date;}
export function reminders(c:Contact,p:Partial<ReminderTiming>={},from=today()):Reminder[]{
 c=effectiveContact(c,p,from);
 if(c.stage==='Dormant'||c.tracked===false||(c.snoozed_until&&from<c.snoozed_until))return [];
 const settings=timingFor(p);const result:Reminder[]=[];const due=reminderStatus(c,from);
 if(due)result.push({...due,kind:'next-step'});
 let days=0;let label='';let threshold=Infinity;
 if(c.stage==='Not contacted'){days=elapsed(afterStart(c,c.created_at.slice(0,10)),from);threshold=settings.reminder_initial_days;label=`Added ${days} days ago. Reach out.`;}
 if(c.stage==='Reached out'){const status=noReply(c,p,from);if(status?.followUp){days=status.days;threshold=settings.reminder_reply_days;label=status.followUps?`Followed up ${status.followUps} ${status.followUps===1?'time':'times'}. No reply in ${days} days.`:`No reply in ${days} days. Follow up.`;}}
 if(c.stage==='Talking'){days=elapsed(afterStart(c,activity(c)),from);threshold=settings.reminder_talking_days;label=`Your turn. ${days} days.`;}
 if(c.stage==='Keep in touch'){days=elapsed(afterStart(c,activity(c)),from);threshold=({'2 weeks':14,Monthly:30,Quarterly:90} as Record<string,number>)[c.reconnect_cadence]??settings.reminder_keep_days;label=`Last activity ${days} days ago. Keep in touch.`;}
 if(Number.isFinite(days)&&days>=threshold)result.push({kind:'stage',days,label});
 return result;
}