import {createFileRoute,Navigate} from '@tanstack/react-router';
import {metadata} from '@/components/network/shared';
export const Route=createFileRoute('/_authenticated/pipeline')({head:()=>metadata('Contacts redirect','Networking stages now live in Contacts.'),component:()=> <Navigate to="/contacts" replace/>});
