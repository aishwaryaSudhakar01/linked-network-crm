import {createFileRoute} from '@tanstack/react-router';
import {Workspace} from '@/components/network/workspace';
import {metadata} from '@/components/network/shared';
export const Route=createFileRoute('/_authenticated/pipeline')({head:()=>metadata('Pipeline','Manage contacts across your networking stages.'),component:()=> <Workspace view="pipeline"/>});
