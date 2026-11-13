import {createFileRoute} from '@tanstack/react-router';
import {Workspace} from '@/components/network/workspace';
import {metadata} from '@/components/network/shared';
export const Route=createFileRoute('/_authenticated/templates')({head:()=>metadata('Templates','Edit your personal networking message templates.'),component:()=> <Workspace view="templates"/>});
