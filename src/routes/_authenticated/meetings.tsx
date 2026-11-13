import {createFileRoute} from '@tanstack/react-router';
import {Workspace} from '@/components/network/workspace';
import {metadata} from '@/components/network/shared';
export const Route=createFileRoute('/_authenticated/meetings')({head:()=>metadata('Meetings','Your upcoming meetings with people in your network.'),component:()=> <Workspace view="meetings"/>});
