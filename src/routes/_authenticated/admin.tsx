import {createFileRoute} from '@tanstack/react-router';
import {Workspace} from '@/components/network/workspace';
import {metadata} from '@/components/network/shared';
export const Route=createFileRoute('/_authenticated/admin')({head:()=>metadata('Admin','Review LinkedNetwork feedback and aggregate account count.'),component:()=> <Workspace view="admin"/>});
