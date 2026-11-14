import {createFileRoute} from '@tanstack/react-router';
import {Workspace} from '@/components/network/workspace';
import {metadata} from '@/components/network/shared';
export const Route=createFileRoute('/_authenticated/settings')({head:()=>metadata('Profile Settings','Manage your LinkedNetwork account and preferences.'),component:()=> <Workspace view="settings"/>});
