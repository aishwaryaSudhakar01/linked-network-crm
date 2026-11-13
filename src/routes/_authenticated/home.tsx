import {createFileRoute} from '@tanstack/react-router';
import {Workspace} from '@/components/network/workspace';
import {metadata} from '@/components/network/shared';
export const Route=createFileRoute('/_authenticated/home')({head:()=>metadata('Home','Your scheduled check-ins and outreach progress.'),component:()=> <Workspace view="home"/>});
