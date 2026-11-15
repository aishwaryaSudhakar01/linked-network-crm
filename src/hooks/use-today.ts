import {useEffect,useState} from 'react';
import {today} from '@/lib/contacts';
export function useToday(){const [day,setDay]=useState(today);useEffect(()=>{const refresh=()=>setDay(today());const timer=setInterval(refresh,1000);window.addEventListener('focus',refresh);return()=>{clearInterval(timer);window.removeEventListener('focus',refresh);};},[]);return day;}