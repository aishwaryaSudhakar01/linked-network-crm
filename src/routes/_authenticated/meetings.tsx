import {createFileRoute,Navigate} from '@tanstack/react-router';
import {metadata} from '@/components/network/shared';
export const Route=createFileRoute('/_authenticated/meetings')({head:()=>metadata('Home redirect','Return to your LinkedNetwork Home page.'),component:()=> <Navigate to="/home" replace/>});
