import {supabase} from '@/integrations/supabase/client';
import type {Database,Json} from '@/integrations/supabase/types';
import {decodeContact,plainContact,type StoredContact} from './note-storage';
import {linkedinKey,migrateContact,type Contact} from './contacts';
import type {Template} from './templates';
export type Profile=Database['public']['Tables']['profiles']['Row'];
export async function readProfile(userId:string){const {data,error}=await supabase.from('profiles').select('*').eq('user_id',userId).single();if(error)throw error;const {data:auth}=await supabase.auth.getUser();return {...data,first_name:data.first_name||auth.user?.user_metadata['first_name']||'',last_name:data.last_name||auth.user?.user_metadata['last_name']||''} as Profile;}
export async function updateProfile(p:Profile){const {error}=await supabase.from('profiles').update(p).eq('user_id',p.user_id);if(error)throw error;}
export async function readContacts(userId:string){const rows:Contact[]=[];for(let offset=0;;offset+=500){const {data,error}=await supabase.from('contacts').select('id,data').eq('user_id',userId).order('id').range(offset,offset+499);if(error)throw error;for(const row of data)rows.push(migrateContact(await decodeContact({...row.data as unknown as StoredContact,id:row.id})));if(data.length<500)break;}return rows;}
export async function convertNotes(userId:string,key?:CryptoKey|null){
 // Compare the original JSON on each write: another tab's changes must never be overwritten.
 for(let offset=0;;offset+=500){
  const {data,error}=await supabase.from('contacts').select('id,data').eq('user_id',userId).order('id').range(offset,offset+499);if(error)throw error;
  for(const row of data){const stored={...row.data as unknown as StoredContact,id:row.id};if(stored.notes_storage==='plain-v1')continue;
   const decoded=await decodeContact(stored,key);
   const result=await supabase.from('contacts').update({data:decoded as unknown as Json}).eq('id',row.id).eq('user_id',userId).eq('data',row.data).select('id');
   if(result.error)throw result.error;if(result.data.length!==1)throw new Error('A contact changed in another tab. Try conversion again.');
  }if(data.length<500)break;
 }
 const {error}=await supabase.rpc('finish_notes_conversion');if(error)throw error;
}
export async function saveContact(c:Contact,userId:string){const {error}=await supabase.from('contacts').upsert({id:c.id,user_id:userId,linkedin_key:linkedinKey(c.linkedin_url)||null,email_key:c.email.trim().toLowerCase()||null,data:plainContact(c) as unknown as Json});if(error)throw error;}
export async function removeContact(id:string,userId:string){const {error}=await supabase.from('contacts').delete().eq('id',id).eq('user_id',userId);if(error)throw error;}
export async function readTemplates(userId:string){const {data,error}=await supabase.from('templates').select('*').eq('user_id',userId).order('name');if(error)throw error;return data as Template[];}
export async function saveTemplate(t:Template,userId:string){const {error}=await supabase.from('templates').upsert({...t,user_id:userId});if(error)throw error;}
