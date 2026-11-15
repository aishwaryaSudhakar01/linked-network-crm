import {supabase} from '@/integrations/supabase/client';
import type {Database,Json} from '@/integrations/supabase/types';
import {encrypt,decrypt} from './encryption';
import {linkedinKey,migrateContact,type Contact} from './contacts';
import type {Template} from './templates';
export type Profile=Database['public']['Tables']['profiles']['Row'];
export async function readProfile(userId:string){const {data,error}=await supabase.from('profiles').select('*').eq('user_id',userId).single();if(error)throw error;const {data:auth}=await supabase.auth.getUser();return {...data,first_name:data.first_name||auth.user?.user_metadata['first_name']||'',last_name:data.last_name||auth.user?.user_metadata['last_name']||''} as Profile;}
export async function updateProfile(p:Profile){const {error}=await supabase.from('profiles').update(p).eq('user_id',p.user_id);if(error)throw error;}
export async function sealContact(c:Contact,key:CryptoKey){return {...c,personal_notes:await encrypt(c.personal_notes,key),next_step:await encrypt(c.next_step,key),interactions:await Promise.all(c.interactions.map(async i=>({...i,summary:await encrypt(i.summary,key),meeting_notes:await encrypt(i.meeting_notes,key)})))};}
export async function openContact(c:Contact,key:CryptoKey):Promise<Contact>{return {...c,personal_notes:await decrypt(c.personal_notes,key),next_step:await decrypt(c.next_step,key),interactions:await Promise.all(c.interactions.map(async i=>({...i,summary:await decrypt(i.summary,key),meeting_notes:await decrypt(i.meeting_notes,key)})))};}
export async function readContacts(userId:string,key:CryptoKey){const rows:Contact[]=[];for(let offset=0;;offset+=500){const {data,error}=await supabase.from('contacts').select('id,data').eq('user_id',userId).order('id').range(offset,offset+499);if(error)throw error;for(const row of data)rows.push(migrateContact(await openContact({...row.data as unknown as Contact,id:row.id},key)));if(data.length<500)break;}return rows;}
export async function saveContact(c:Contact,userId:string,key:CryptoKey){const sealed=await sealContact(c,key);const {error}=await supabase.from('contacts').upsert({id:c.id,user_id:userId,linkedin_key:linkedinKey(c.linkedin_url)||null,email_key:c.email.trim().toLowerCase()||null,data:sealed as unknown as Json});if(error)throw error;}
export async function removeContact(id:string,userId:string){const {error}=await supabase.from('contacts').delete().eq('id',id).eq('user_id',userId);if(error)throw error;}
export async function readTemplates(userId:string){const {data,error}=await supabase.from('templates').select('*').eq('user_id',userId).order('name');if(error)throw error;return data as Template[];}
export async function saveTemplate(t:Template,userId:string){const {error}=await supabase.from('templates').upsert({...t,user_id:userId});if(error)throw error;}
