import 'fake-indexeddb/auto';
import {webcrypto} from 'node:crypto';
import {beforeAll,beforeEach,describe,it,expect} from 'vitest';
import {rememberUnlock,restoreUnlock,forgetUnlock} from './device-unlock';
import {deriveKey,encrypt,randomSalt,decrypt} from './encryption';
beforeAll(()=>Object.defineProperty(globalThis,'crypto',{value:webcrypto,configurable:true}));
beforeEach(()=>forgetUnlock());
describe('Opt-in device unlock',()=>{
 it('remembers a non-exportable key without storing the passphrase',async()=>{const key=await deriveKey('test-only passphrase',randomSalt());const verifier=await encrypt('LinkedNetwork verified',key);await rememberUnlock('owner',verifier,key);const restored=await restoreUnlock('owner',verifier);expect(restored?.extractable).toBe(false);if(!restored)throw new Error('Expected remembered unlock');expect(await decrypt(await encrypt('private note',key),restored)).toBe('private note');});
 it('never supplies another account’s remembered key',async()=>{const key=await deriveKey('test-only passphrase',randomSalt());const verifier=await encrypt('LinkedNetwork verified',key);await rememberUnlock('owner',verifier,key);expect(await restoreUnlock('other-owner',verifier)).toBeNull();});
 it('rejects a remembered key after the verifier changes',async()=>{const key=await deriveKey('test-only passphrase',randomSalt());const verifier=await encrypt('LinkedNetwork verified',key);await rememberUnlock('owner',verifier,key);expect(await restoreUnlock('owner',await encrypt('LinkedNetwork verified',key))).toBeNull();expect(await restoreUnlock('owner',verifier)).toBeNull();});
 it('lock erases the account’s remembered key',async()=>{const key=await deriveKey('test-only passphrase',randomSalt());const verifier=await encrypt('LinkedNetwork verified',key);await rememberUnlock('owner',verifier,key);await forgetUnlock('owner');expect(await restoreUnlock('owner',verifier)).toBeNull();});
 it('sign-out erases all remembered keys',async()=>{const key=await deriveKey('test-only passphrase',randomSalt());const verifier=await encrypt('LinkedNetwork verified',key);await rememberUnlock('owner',verifier,key);await rememberUnlock('other',verifier,key);await forgetUnlock();expect(await restoreUnlock('owner',verifier)).toBeNull();expect(await restoreUnlock('other',verifier)).toBeNull();});
});