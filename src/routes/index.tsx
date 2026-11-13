import {createFileRoute,useNavigate} from '@tanstack/react-router';
import {useEffect} from 'react';
import {supabase} from '@/integrations/supabase/client';
import {metadata} from '@/components/network/shared';
export const Route=createFileRoute('/')({head:()=>metadata('LinkedNetwork','Private networking contacts, conversations, and scheduled check-ins.'),component:Index});
function Index(){const navigate=useNavigate();useEffect(()=>{void supabase.auth.getUser().then(({data})=>navigate({to:data.user?'/home':'/auth',replace:true}));},[navigate]);return <main className="flex min-h-dvh items-center justify-center"><h1 className="text-xl font-semibold">LinkedNetwork</h1></main>;}
