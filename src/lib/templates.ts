import type {Contact} from './contacts';
export type Template={id:string;name:string;type:string;subject:string;body:string};
export const VARIABLES=['first_name','company','title','met_at','my_first_name','my_full_name','my_school','calendly_link'];
export function fillTemplate(text:string,c:Contact,p:{first_name:string;last_name:string;school:string;calendly_link:string}){const values:Record<string,string>={first_name:c.name.split(/\s+/)[0]??'',company:c.company,title:c.title,met_at:c.met_at,my_first_name:p.first_name,my_full_name:[p.first_name,p.last_name].filter(Boolean).join(' '),my_school:p.school,calendly_link:p.calendly_link};const missing:string[]=[];const filled=text.replace(/{{\s*(\w+)\s*}}/g,(_,name:string)=>{const value=values[name];if(!value){missing.push(name);return `[missing: ${name}]`;}return value;});return {text:filled,missing:[...new Set(missing)]};}
export function connectionLengthAllowed(text:string){return text.length<=300;}

export function missingVariables(text:string){return [...new Set([...text.matchAll(/\[missing: (\w+)\]/g)].map(m=>m[1]??''))];}
export function missingLabel(name:string){const labels:Record<string,string>={calendly_link:'Calendly link',first_name:'First name',company:'Company',my_school:'School',my_full_name:'Your name',my_first_name:'Your first name',met_at:'Where you met',title:'Title'};return labels[name]??name.replaceAll('_',' ');}
export function safeMessage(text:string){return text.replace(/\[missing: \w+\]/g,'');}
