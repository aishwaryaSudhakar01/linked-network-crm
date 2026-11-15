import type {Contact} from './contacts';
export type Template={id:string;name:string;type:string;subject:string;body:string};
export const VARIABLES=['first_name','company','title','met_at','my_first_name','my_full_name','my_school','calendly_link'];
export function fillTemplate(text:string,c:Contact,p:{first_name:string;last_name:string;school:string;calendly_link:string}){const values:Record<string,string>={first_name:c.name.split(/\s+/)[0]??'',company:c.company,title:c.title,met_at:c.met_at,my_first_name:p.first_name,my_full_name:[p.first_name,p.last_name].filter(Boolean).join(' '),my_school:p.school,calendly_link:p.calendly_link};const missing:string[]=[];const filled=text.replace(/{{\s*(\w+)\s*}}/g,(_,name:string)=>{const value=values[name];if(!value){missing.push(name);return `[missing: ${name}]`;}return value;});return {text:filled,missing:[...new Set(missing)]};}
export function connectionLengthAllowed(text:string){return text.length<=300;}

export function missingVariables(text:string){return [...new Set([...text.matchAll(/\[missing: (\w+)\]/g)].map(m=>m[1]??''))];}
export function missingLabel(name:string){const labels:Record<string,string>={calendly_link:'Calendly link',first_name:'First name',company:'Company',my_school:'School',my_full_name:'Your name',my_first_name:'Your first name',met_at:'Where you met',title:'Title'};return labels[name]??name.replaceAll('_',' ');}
export function safeMessage(text:string){return text.replace(/\[missing: \w+\]/g,'');}

/** Restore exact filled values once, longest first, without rewriting parts of words. */
export function restoreTemplateText(text:string,c:Contact,p:Parameters<typeof fillTemplate>[2],original=''){
 const preferred=[...original.matchAll(/{{\s*(\w+)\s*}}/g)].map(m=>m[1]);
 const candidates=VARIABLES.map((variable,index)=>({variable,index,value:fillTemplate(`{{${variable}}}`,c,p).text})).filter(x=>x.value&&!missingVariables(x.value).length).sort((a,b)=>b.value.length-a.value.length||Number(preferred.includes(b.variable))-Number(preferred.includes(a.variable))||a.index-b.index);
 const byValue=new Map<string,string>();for(const item of candidates)if(!byValue.has(item.value))byValue.set(item.value,item.variable);
 if(!byValue.size)return text.replace(/\[missing: (\w+)\]/g,'{{$1}}');
 const escape=(s:string)=>s.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
 const pattern=[...byValue.keys()].map(value=>`${/^[\p{L}\p{N}_]/u.test(value)?'(?<![\\p{L}\\p{N}_])':''}${escape(value)}${/[\p{L}\p{N}_]$/u.test(value)?'(?![\\p{L}\\p{N}_])':''}`).join('|');
 return text.replace(new RegExp(pattern,'gu'),value=>`{{${byValue.get(value)}}}`).replace(/\[missing: (\w+)\]/g,'{{$1}}');
}
