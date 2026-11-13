import {createFileRoute} from '@tanstack/react-router';
import {Workspace} from '@/components/network/workspace';
import {metadata} from '@/components/network/shared';
export const Route=createFileRoute('/_authenticated/contacts/$contactId')({head:()=>metadata('Contact','Contact details, next steps, and encrypted conversation history.'),component:ContactPage});
function ContactPage(){const {contactId}=Route.useParams();return <Workspace view="contact" contactId={contactId}/>;}
