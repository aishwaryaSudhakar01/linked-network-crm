import {createFileRoute,useNavigate} from '@tanstack/react-router';
import {useEffect} from 'react';
import {supabase} from '@/integrations/supabase/client';
import {metadata} from '@/components/network/shared';
const OG_IMAGE='https://linked-network-crm.lovable.app/og-image.png';
export const Route=createFileRoute('/')({head:()=>{const base=metadata('LinkedNetwork','Private networking contacts, conversations, and scheduled check-ins.');return {meta:[...base.meta.filter(m=>m.name!=='twitter:card'),{name:'twitter:card',content:'summary_large_image'},{property:'og:image',content:OG_IMAGE},{name:'twitter:image',content:OG_IMAGE}]};},component:Index});
function Index(){const navigate=useNavigate();useEffect(()=>{void supabase.auth.getUser().then(({data})=>navigate({to:data.user?'/home':'/auth',replace:true}));},[navigate]);return <main className="flex min-h-dvh items-center justify-center"><h1 className="text-xl font-semibold">LinkedNetwork</h1></main>;}
