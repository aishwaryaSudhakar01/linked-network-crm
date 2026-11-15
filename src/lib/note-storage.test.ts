import {webcrypto} from 'node:crypto';
import {beforeAll,describe,expect,it} from 'vitest';
import {blankContact} from './contacts';
import {deriveKey,encrypt,randomSalt} from './encryption';
import {decodeContact,plainContact} from './note-storage';
beforeAll(()=>Object.defineProperty(globalThis,'crypto',{value:webcrypto,configurable:true}));
describe('passphrase retirement',()=>{
 it('saves new notes without a key, including literal v1-prefixed text',async()=>{const c={...blankContact(),personal_notes:'v1:my plain text',next_step:'Send a message'};expect(await decodeContact(plainContact(c))).toEqual({...c,notes_storage:'plain-v1'});});
 it('preserves every legacy field and history classification when converting',async()=>{const key=await deriveKey('old passphrase',randomSalt());const c={...blankContact(),personal_notes:'Family and projects',next_step:'Send resume',interactions:[{id:'entry',date:'2026-11-14',channel:'Email',summary:'Follow-up sent',meeting_notes:'Advice',kind:'outreach' as const,outreach_type:'message' as const,follow_up:true}]};const encrypted={...c,personal_notes:await encrypt(c.personal_notes,key),next_step:await encrypt(c.next_step,key),interactions:await Promise.all(c.interactions.map(async i=>({...i,summary:await encrypt(i.summary,key),meeting_notes:await encrypt(i.meeting_notes,key)})))};expect(await decodeContact(encrypted,key)).toEqual({...c,notes_storage:'plain-v1'});expect(encrypted.personal_notes).toMatch(/^v1:/);});
 it('refuses to replace legacy notes without the original key',async()=>{const c={...blankContact(),personal_notes:'v1:unreadable:notes'};await expect(decodeContact(c)).rejects.toThrow('old passphrase once');expect(c.personal_notes).toBe('v1:unreadable:notes');});
 it('does not fall back to blank notes for a wrong key',async()=>{const key=await deriveKey('wrong',randomSalt());await expect(decodeContact({...blankContact(),personal_notes:'v1:unreadable:notes'},key)).rejects.toThrow();});
 it('conversion is idempotent without needing the old key again',async()=>{const c=plainContact({...blankContact(),personal_notes:'Preserved'});expect(await decodeContact(await decodeContact(c))).toEqual(c);});
});