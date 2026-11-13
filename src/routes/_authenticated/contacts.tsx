import {createFileRoute} from '@tanstack/react-router';
import {Workspace} from '@/components/network/workspace';
import {metadata} from '@/components/network/shared';
export const Route=createFileRoute('/_authenticated/contacts')({head:()=>metadata('Contacts','Search and manage your networking contacts.'),component:()=> <Workspace view="contacts"/>});
