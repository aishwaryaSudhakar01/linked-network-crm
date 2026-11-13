import {createContext,useContext,useState,type ReactNode} from 'react';
import type {Profile} from '@/lib/network-store';
type Session={key:CryptoKey|null;profile:Profile|null;setKey:(k:CryptoKey|null)=>void;setProfile:(p:Profile|null)=>void;clear:()=>void};
const Context=createContext<Session|null>(null);
export function NetworkSession({children}:{children:ReactNode}){const [key,setKey]=useState<CryptoKey|null>(null);const [profile,setProfile]=useState<Profile|null>(null);return <Context.Provider value={{key,profile,setKey,setProfile,clear:()=>{setKey(null);setProfile(null);}}}>{children}</Context.Provider>;}
export function useNetwork(){const value=useContext(Context);if(!value)throw new Error('Session unavailable');return value;}
