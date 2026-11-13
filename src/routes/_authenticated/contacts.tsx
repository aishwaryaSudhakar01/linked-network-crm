import {createFileRoute,Outlet,useLocation} from '@tanstack/react-router';
import {Workspace} from '@/components/network/workspace';
import {metadata} from '@/components/network/shared';
export const Route=createFileRoute('/_authenticated/contacts')({head:()=>metadata('Contacts','Search and manage your networking contacts.'),component:ContactsRoute});

function ContactsRoute(){const location=useLocation();return location.pathname==='/contacts'?<Workspace view="contacts"/>:<Outlet/>;}
