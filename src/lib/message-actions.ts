import {chatHref,type Contact} from './contacts';
export type MessageAction='copy'|'chat'|'gmail'|'linkedin';
export function messageActions(c:Contact){const chat=chatHref(c.chat_link);const linkedin=chatHref(c.linkedin_url);return {chat,linkedin,email:c.email.trim()||undefined,existing:!!c.interactions.length||!!chat};}
export async function copyThenOpen(text:string,url:string|undefined,copy:(s:string)=>Promise<void>,notify:()=>void,open:(url:string)=>void){await copy(text);notify();if(url)open(url);}