import Papa from 'papaparse';
import {blankContact,findDuplicate,mergeBlanks,type Contact} from './contacts';
import {parseDate} from './dates';
export type ImportFormat='linkedin'|'general';
export const CSV_SAMPLES:Record<ImportFormat,string>={
 linkedin:'First Name,Last Name,URL,Email Address,Company,Position,Connected On\nJane,Doe,https://www.linkedin.com/in/jane-doe,jane@example.com,Example Company,Analyst,01 Nov 2026\n',
 general:'Name,Email,Company,Title,LinkedIn URL,Chat Link,Calendly Link,Last Contact,Next Step Date,Notes\nJane Doe,jane@example.com,Example Company,Analyst,https://www.linkedin.com/in/jane-doe,https://mail.google.com/mail/u/0/#inbox/abc123,https://calendly.com/jane-doe/coffee,11/01/2026,11/20/2026,"Interested in product strategy, follow up after finals"\n',
};
const normalize=(s:string)=>s.trim().toLowerCase().replace(/[_\s-]+/g,' ');
export function parseContactsCsv(text:string,format:ImportFormat):Contact[]{
 const lines=text.replace(/^\uFEFF/,'').split(/\r?\n/);
 const start=format==='linkedin'?lines.findIndex(l=>/First Name/i.test(l)&&/Last Name/i.test(l)):0;
 if(start<0)throw new Error('Could not find First Name and Last Name headers. Upload your LinkedIn Connections.csv export.');
 const parsed=Papa.parse<Record<string,string>>(lines.slice(start).join('\n'),{header:true,skipEmptyLines:'greedy',transformHeader:normalize});
 if(parsed.errors.some(e=>e.code!=='UndetectableDelimiter'))throw new Error('The CSV has malformed rows or quoted fields. Check that every row matches the header columns.');
 const headers=parsed.meta.fields??[];
 if(format==='linkedin'&&(!headers.includes('first name')||!headers.includes('last name')))throw new Error('LinkedIn imports require First Name and Last Name columns.');
 if(format==='general'&&!headers.includes('name')&&!(headers.includes('first name')&&headers.includes('last name')))throw new Error('Include a Name column, or First Name and Last Name columns. You can download the sample below.');
 const rows=parsed.data.map((r,index)=>{
  const get=(...keys:string[])=>{for(const key of keys){const value=r[key]?.trim();if(value)return value;}return '';};
  const date=(...keys:string[])=>{const value=get(...keys);if(!value)return '';const iso=/^(\d{4})-(\d{2})-(\d{2})$/.exec(value);const parsedDate=parseDate(iso?`${iso[2]}/${iso[3]}/${iso[1]}`:value);if(!parsedDate)throw new Error(`Row ${index+2}: ${keys[0]} must be a valid MM/DD/YYYY date.`);return parsedDate;};
  return {...blankContact(),tracked:false,name:get('name')||[get('first name'),get('last name')].filter(Boolean).join(' '),linkedin_url:get('linkedin url','url'),email:get('email','email address'),company:get('company','organization'),title:get('title','position','job title'),phone:get('phone','phone number'),city:get('city'),chat_link:get('chat link'),calendly_link:get('calendly link','calendly'),personal_notes:get('notes','personal notes'),last_contact:format==='general'?date('last contact','last contact date'):'',next_step_date:format==='general'?date('next step date','next check in date'):'',next_step:get('next step')};
 }).filter(c=>c.name);
 if(!rows.length)throw new Error('No named contacts were found in this CSV.');
 return rows;
}
export function parseConnections(text:string):Contact[]{return parseContactsCsv(text,'linkedin');}
export function mergeImport(existing:Contact[],incoming:Contact[]){const result=[...existing];for(const c of incoming){const duplicate=findDuplicate(result,c);if(duplicate){const i=result.findIndex(x=>x.id===duplicate.id);result[i]=mergeBlanks(duplicate,c);}else result.push(c);}return result;}
