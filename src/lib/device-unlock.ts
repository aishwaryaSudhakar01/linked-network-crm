import {decrypt} from './encryption';
type Remembered={userId:string;verifier:string;key:CryptoKey};
const STORE='unlocks';
function database():Promise<IDBDatabase>{return new Promise((resolve,reject)=>{const request=indexedDB.open('linkednetwork-device-unlock',1);request.onupgradeneeded=()=>request.result.createObjectStore(STORE,{keyPath:'userId'});request.onsuccess=()=>resolve(request.result);request.onerror=()=>reject(new Error('This browser could not remember your unlock.'));});}
async function transact<T>(mode:IDBTransactionMode,operation:(store:IDBObjectStore)=>IDBRequest<T>):Promise<T>{const db=await database();return new Promise((resolve,reject)=>{const transaction=db.transaction(STORE,mode);const request=operation(transaction.objectStore(STORE));transaction.oncomplete=()=>{db.close();resolve(request.result);};transaction.onerror=transaction.onabort=()=>{db.close();reject(new Error('This browser could not save your unlock preference.'));};});}
export async function rememberUnlock(userId:string,verifier:string,key:CryptoKey){if(key.extractable)throw new Error('Only non-exportable keys may be remembered.');await transact('readwrite',s=>s.put({userId,verifier,key} satisfies Remembered));}
export async function forgetUnlock(userId?:string){await transact('readwrite',s=>userId?s.delete(userId):s.clear());}
export async function restoreUnlock(userId:string,verifier:string):Promise<CryptoKey|null>{
 const record=await transact<Remembered|undefined>('readonly',s=>s.get(userId));
 if(!record)return null;
 if(record.userId!==userId||record.verifier!==verifier||record.key.extractable){await forgetUnlock(userId);return null;}
 try{if(await decrypt(verifier,record.key)==='LinkedNetwork verified')return record.key;}catch{/* Changed or unusable key; unlock manually. */}
 await forgetUnlock(userId);return null;
}