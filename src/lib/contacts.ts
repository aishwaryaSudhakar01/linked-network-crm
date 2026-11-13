export const STAGES = ['Not contacted','Reached out','Replied','Met','Ongoing','Dormant'] as const;
export const CONNECTIONS = ['Alumni','Classmate','Professor or speaker','Recruiter','Cold outreach','Introduction','Other'];
export const GOALS = ['Job/referral','Advice','Industry insight','Mentorship','Peer'];
export const CHANNELS = ['LinkedIn','Email','Coffee','Call','Meeting','Event','Other'];
export const CADENCES = ['None','2 weeks','Monthly','Quarterly'];
export const ASK_TYPES = ['None','Advice call','Intro','Referral'];
export const ASK_STATUSES = ['Not asked','Planned','Asked','Received','Declined'];
export type Stage = typeof STAGES[number];
export type Interaction = { id: string; date: string; channel: string; summary: string; meeting_notes: string };
export type Contact = { id: string; name: string; company: string; title: string; linkedin_url: string; email: string; phone: string; city: string; connection_type: string; introduced_by: string; met_at: string; goals: string[]; stage: Stage; ask_type: string; ask_status: string; next_step: string; next_step_date: string; reconnect_cadence: string; personal_notes: string; chat_link: string; last_contact: string; created_at: string; interactions: Interaction[] };
export function today() { const d=new Date(); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`; }
export function blankContact(): Contact { return {id:crypto.randomUUID(),name:'',company:'',title:'',linkedin_url:'',email:'',phone:'',city:'',connection_type:'Other',introduced_by:'',met_at:'',goals:[],stage:'Not contacted',ask_type:'None',ask_status:'Not asked',next_step:'',next_step_date:'',reconnect_cadence:'None',personal_notes:'',chat_link:'',last_contact:'',created_at:new Date().toISOString(),interactions:[]}; }
export function dueDate(c: Contact) { if(c.next_step_date) return c.next_step_date; const n: Record<string,number>={'2 weeks':14,Monthly:30,Quarterly:90}; const days=n[c.reconnect_cadence]; if(!days||!c.last_contact)return ''; const d=new Date(c.last_contact+'T12:00:00Z');d.setUTCDate(d.getUTCDate()+days);return d.toISOString().slice(0,10); }
export function daysUntil(date:string,from=today()) {return Math.round((Date.parse(date+'T12:00:00Z')-Date.parse(from+'T12:00:00Z'))/86400000);}
export function logConversation(c:Contact,i:Omit<Interaction,'id'>,from=today()):Contact {const interactions=[{...i,id:crypto.randomUUID()},...c.interactions].sort((a,b)=>b.date.localeCompare(a.date));return {...c,interactions,last_contact:interactions[0]?.date??'',next_step_date:c.next_step_date&&c.next_step_date<from?'':c.next_step_date,stage:c.stage==='Not contacted'?'Reached out':c.stage==='Reached out'?'Replied':c.stage};}
export function chatHref(s:string|undefined){if(!s)return undefined;try{const u=new URL(s);return ['http:','https:'].includes(u.protocol)?u.href:undefined;}catch{return undefined;}}
export function linkedinKey(s:string){const url=chatHref(s);if(!url)return '';const u=new URL(url);return (u.hostname.replace(/^www\./,'')+u.pathname.replace(/\/+$/,'')).toLowerCase();}
export function findDuplicate(list:Contact[],c:Contact){const k=linkedinKey(c.linkedin_url);return (k?list.find(x=>linkedinKey(x.linkedin_url)===k):undefined)??(c.email?list.find(x=>x.email.trim().toLowerCase()===c.email.trim().toLowerCase()):undefined);}
export function mergeBlanks(existing:Contact,incoming:Contact):Contact{const result={...existing};for(const field of ['name','company','title','linkedin_url','email','phone','city','met_at','chat_link'] as const){if(!result[field])result[field]=incoming[field];}return result;}
export function weeklyOutreach(list:Contact[],from=today()){const d=new Date(from+'T12:00:00Z');d.setUTCDate(d.getUTCDate()-((d.getUTCDay()+6)%7));const start=d.toISOString().slice(0,10);return list.filter(c=>c.interactions.some(i=>i.date>=start&&i.date<=from)).length;}
