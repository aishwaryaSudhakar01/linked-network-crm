const enc=new TextEncoder();const dec=new TextDecoder();
const base64=(data:Uint8Array)=>btoa(Array.from(data,x=>String.fromCharCode(x)).join(''));
const bytes=(s:string)=>Uint8Array.from(atob(s),c=>c.charCodeAt(0));
export const ITERATIONS=310000;
export function randomSalt(){return base64(crypto.getRandomValues(new Uint8Array(16)));}
export async function deriveKey(passphrase:string,salt:string){const base=await crypto.subtle.importKey('raw',enc.encode(passphrase),'PBKDF2',false,['deriveKey']);return crypto.subtle.deriveKey({name:'PBKDF2',salt:bytes(salt),iterations:ITERATIONS,hash:'SHA-256'},base,{name:'AES-GCM',length:256},false,['encrypt','decrypt']);}
export async function encrypt(text:string,key:CryptoKey){const iv=crypto.getRandomValues(new Uint8Array(12));const encrypted=await crypto.subtle.encrypt({name:'AES-GCM',iv},key,enc.encode(text));return `v1:${base64(iv)}:${base64(new Uint8Array(encrypted))}`;}
export async function decrypt(value:string,key:CryptoKey){const [version,iv,data]=value.split(':');if(version!=='v1'||!iv||!data)throw new Error('Invalid encrypted value');return dec.decode(await crypto.subtle.decrypt({name:'AES-GCM',iv:bytes(iv)},key,bytes(data)));}
export async function verifyPassphrase(passphrase:string,salt:string,verifier:string){try{const key=await deriveKey(passphrase,salt);if(await decrypt(verifier,key)!=='LinkedNetwork verified')throw new Error();return key;}catch{throw new Error('Incorrect passphrase. Please try again.');}}
