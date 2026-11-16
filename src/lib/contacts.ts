export const STAGES = ['Not contacted','Reached out','Talking','Met','Keep in touch'] as const;
export const CONNECTIONS = ['Alumni','Classmate','Professor or speaker','Recruiter','Cold outreach','Introduction','Other'];
export const GOALS = ['Job/referral','Advice','Industry insight','Mentorship','Peer'];
export const CHANNELS = ['LinkedIn','Email','Coffee','Call','Meeting','Event','Other'];
export function conversationChannel(channel:string,custom:string){const value=(channel==='Other'?custom:channel).trim();if(!value)throw new Error('Choose a conversation type.');return value;}
export const CADENCES = ['None','2 weeks','Monthly','Quarterly'];
export const ASK_TYPES = ['None','Advice call','Intro','Referral'];
export const ASK_STATUSES = ['Not asked','Planned','Asked','Received','Declined'];
export type Stage = typeof STAGES[number] | 'Dormant';
export type Interaction = { id: string; date: string; channel: string; summary: string; meeting_notes: string; kind?: 'outreach'|'conversation'; outreach_type?: 'connection-request'|'message'; follow_up?: boolean };
export type Contact = { id: string; name: string; company: string; title: string; linkedin_url: string; email: string; phone: string; city: string; connection_type: string; connection_types?: string[]; introduced_by: string; goals: string[]; stage: Stage; ask_type: string; ask_status: string; next_step: string; next_step_date: string; reconnect_cadence: string; personal_notes: string; chat_link: string; calendly_link?: string; last_contact: string; created_at: string; interactions: Interaction[]; tracked?: boolean; tracking_started?: string; snoozed_until?: string; revived_at?: string };
/** Preserve legacy single-type contacts while allowing an explicitly empty selection. */
export function connectionTypes(c:Contact):string[]{return [...new Set(c.connection_types??(c.connection_type?[c.connection_type]:[]))];}
export function hasConnectionType(c:Contact,type:string){return !type||connectionTypes(c).includes(type);}
export function today() { const d=new Date(); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`; }
export function blankContact(): Contact { return {id:crypto.randomUUID(),name:'',company:'',title:'',linkedin_url:'',email:'',phone:'',city:'',connection_type:'Other',introduced_by:'',goals:[],stage:'Not contacted',ask_type:'None',ask_status:'Not asked',next_step:'',next_step_date:'',reconnect_cadence:'None',personal_notes:'',chat_link:'',last_contact:'',created_at:new Date().toISOString(),interactions:[],tracked:true}; }
export function dueDate(c: Contact) { if(c.next_step_date) return c.next_step_date; const n: Record<string,number>={'2 weeks':14,Monthly:30,Quarterly:90}; const days=n[c.reconnect_cadence]; if(!days||!c.last_contact)return ''; const d=new Date(c.last_contact+'T12:00:00Z');d.setUTCDate(d.getUTCDate()+days);return d.toISOString().slice(0,10); }
export function daysUntil(date:string,from=today()) {return Math.round((Date.parse(date+'T12:00:00Z')-Date.parse(from+'T12:00:00Z'))/86400000);}
export function reminderStatus(c:Contact,from=today()) {const date=c.next_step_date;if(!date||c.stage==='Dormant'||c.tracked===false||(c.snoozed_until&&c.snoozed_until>from))return undefined;const days=daysUntil(date,from);if(!Number.isFinite(days)||days>0)return undefined;return {days,label:days<0?`Overdue by ${-days} days.`:days===0?'due':`due in ${days} ${days===1?'day':'days'}`};}
export function editConversation(c:Contact,interaction:Interaction):Contact {if(!c.interactions.some(i=>i.id===interaction.id))throw new Error('Conversation no longer exists.');const interactions=c.interactions.map(i=>i.id===interaction.id?interaction:i).sort((a,b)=>b.date.localeCompare(a.date));return {...c,interactions,last_contact:interactions[0]?.date??''};}
export function logConversation(c:Contact,i:Omit<Interaction,'id'>,_from=today()):Contact {const interactions=[{...i,kind:i.kind??'conversation',id:crypto.randomUUID()},...c.interactions].sort((a,b)=>b.date.localeCompare(a.date));return {...c,interactions,last_contact:interactions[0]?.date??'',snoozed_until:''};}
export function chatHref(s:string|undefined){if(!s)return undefined;try{const u=new URL(s);return ['http:','https:'].includes(u.protocol)?u.href:undefined;}catch{return undefined;}}
export function linkedinKey(s:string){const url=chatHref(s);if(!url)return '';const u=new URL(url);return (u.hostname.replace(/^www\./,'')+u.pathname.replace(/\/+$/,'')).toLowerCase();}
export function findDuplicate(list:Contact[],c:Contact){const k=linkedinKey(c.linkedin_url);return (k?list.find(x=>linkedinKey(x.linkedin_url)===k):undefined)??(c.email?list.find(x=>x.email.trim().toLowerCase()===c.email.trim().toLowerCase()):undefined);}
export function mergeBlanks(existing:Contact,incoming:Contact):Contact{const result={...existing};for(const field of ['name','company','title','linkedin_url','email','phone','city','chat_link'] as const){if(!result[field])result[field]=incoming[field];}return result;}
export function weeklyOutreach(list:Contact[],from=today()){const d=new Date(from+'T12:00:00Z');d.setUTCDate(d.getUTCDate()-((d.getUTCDay()+6)%7));const start=d.toISOString().slice(0,10);return list.filter(c=>c.interactions.some(i=>i.date>=start&&i.date<=from)).length;}
export function addDays(date:string,n:number){const d=new Date(date+'T12:00:00Z');d.setUTCDate(d.getUTCDate()+n);return d.toISOString().slice(0,10);}
/** Pause reminders without changing deadlines or activity. */
export function snooze(c:Contact,days=3,from=today()):Contact{return {...c,snoozed_until:addDays(from,days)};}
/** Consecutive weeks (Mon–Sun) where distinct contacts reached met the goal. The current week counts only once met. */
export function outreachStreak(list:Contact[],goal:number,from=today()){let streak=0;let end=from;const thisWeek=weeklyOutreach(list,from);if(thisWeek>=goal)streak++;const d=new Date(from+'T12:00:00Z');d.setUTCDate(d.getUTCDate()-((d.getUTCDay()+6)%7)-1);end=d.toISOString().slice(0,10);for(let i=0;i<520;i++){if(weeklyOutreach(list,end)<goal)break;streak++;end=addDays(end,-7);}return streak;}

export function normalizeStage(stage:string):Stage {if(stage==='Replied')return 'Talking';if(stage==='Ongoing')return 'Keep in touch';return stage==='Dormant'||STAGES.some(s=>s===stage)?stage as Stage:'Not contacted';}
export function migrateContact(c:Contact):Contact{return {...c,stage:normalizeStage(c.stage)};}
export function startTracking(c:Contact,from=today()):Contact{return c.tracked===false?{...c,tracked:true,tracking_started:from}:c;}
export function logOutreach(c:Contact,i:Omit<Interaction,'id'>):Contact {const logged=logConversation(c,{...i,kind:'outreach',outreach_type:i.outreach_type??'message',follow_up:c.stage==='Reached out'&&i.outreach_type!=='connection-request'});return {...logged,stage:c.stage==='Not contacted'?'Reached out':c.stage};}

/** Completion is saved with its reviewed history entry, never when the form opens. */
export function nextStepDraft(c:Contact,from=today()):Omit<Interaction,'id'>{return {date:from,channel:'',summary:c.next_step,meeting_notes:'',kind:'conversation'};}
export function completeNextStep(c:Contact,i:Omit<Interaction,'id'>,step:Pick<Contact,'next_step'|'next_step_date'>):Contact{const logged=i.kind==='outreach'?logOutreach(c,i):logConversation(c,i);return c.next_step===step.next_step&&c.next_step_date===step.next_step_date?{...logged,next_step:'',next_step_date:''}:logged;}

export function reviveContact(c:Contact,from=today()):Contact{return c.stage==='Dormant'?{...c,stage:'Reached out',revived_at:from,snoozed_until:''}:c;}
