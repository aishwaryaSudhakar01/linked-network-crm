import {decrypt} from './encryption';
import type {Contact} from './contacts';
export type StoredContact=Contact & {notes_storage?:'plain-v1'};
export function plainContact(c:Contact):StoredContact{return {...c,notes_storage:'plain-v1'};}
export async function decodeContact(c:StoredContact,key?:CryptoKey|null):Promise<StoredContact>{
 if(c.notes_storage==='plain-v1')return c;
 if(!key)throw new Error('Enter your old passphrase once to preserve your existing notes.');
 return plainContact({...c,personal_notes:await decrypt(c.personal_notes,key),next_step:await decrypt(c.next_step,key),interactions:await Promise.all(c.interactions.map(async i=>({...i,summary:await decrypt(i.summary,key),meeting_notes:await decrypt(i.meeting_notes,key)})))});
}