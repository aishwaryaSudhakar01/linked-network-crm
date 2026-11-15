import {useEffect,useRef,useState} from 'react';
import {Copy,ExternalLink,Pencil} from 'lucide-react';
import {toast} from 'sonner';
import {Button} from '@/components/ui/button';
import {StyledSelect} from '@/components/ui/styled-select';
import {Tooltip,TooltipContent,TooltipProvider,TooltipTrigger} from '@/components/ui/tooltip';
import {messageActions,copyThenOpen,sentDraft,type MessageAction} from '@/lib/message-actions';
import {fillTemplate,missingVariables,missingLabel,safeMessage,restoreTemplateText,type Template} from '@/lib/templates';
import {today,type Contact} from '@/lib/contacts';
import type {Profile} from '@/lib/network-store';
import {ConversationDialog} from './contact-dialogs';
import {MessageTemplateEditor} from './message-template-editor';
import {Modal,Field,inputClass} from './shared';

const actionInfo={
 copy:{label:'Copy',caption:'Copies the message',tooltip:'Copy the message to paste anywhere.'},
 chat:{label:'Continue',caption:'Same thread',tooltip:'Opens your existing chat. Message is copied, ready to paste.'},
 gmail:{label:'Add new email',caption:'Opens a Gmail draft',tooltip:'Starts a new email in Gmail with this subject and message filled in.'},
 linkedin:{label:'LinkedIn profile',caption:'Message copied first',tooltip:'Opens their LinkedIn profile. Message is copied, ready to paste.'},
};
export function MessageDialog({contact,profile,templates,onClose,onSave,onTemplatesRefresh}:{contact:Contact;profile:Profile;templates:Template[];onClose:()=>void;onSave:(c:Contact)=>Promise<void>;onTemplatesRefresh?:()=>Promise<void>}){
 const [templateId,setTemplateId]=useState(templates[0]?.id??'');const [updatedTemplate,setUpdatedTemplate]=useState<Template|null>(null);
 const chosen=updatedTemplate?.id===templateId?updatedTemplate:templates.find(t=>t.id===templateId);
 const templateBody=chosen?fillTemplate(chosen.body,contact,profile).text:'';const templateSubject=chosen?fillTemplate(chosen.subject,contact,profile).text:'';
 const [body,setBody]=useState(templateBody);const [subject,setSubject]=useState(templateSubject);const [editing,setEditing]=useState(false);const [review,setReview]=useState<Template|null>(null);
 const [logDraft,setLogDraft]=useState<ReturnType<typeof sentDraft>|null>(null);const [confirmSent,setConfirmSent]=useState(false);const [sentVia,setSentVia]=useState<MessageAction>('copy');const [error,setError]=useState('');const [acting,setActing]=useState(false);
 const editor=useRef<HTMLDivElement>(null);const destinations=messageActions(contact);const isRequest=chosen?.type==='LinkedIn connection request';const changed=body!==templateBody||subject!==templateSubject;
 const disabled=acting||!body.trim()||(isRequest&&body.length>300);
 useEffect(()=>{if(!editing)return;const outside=(e:PointerEvent)=>{if(!editor.current?.contains(e.target as Node)||!(e.target instanceof Element&&e.target.closest('input,textarea,[aria-label="Message"]')))setEditing(false);};const escape=(e:KeyboardEvent)=>{if(e.key==='Escape'){e.preventDefault();e.stopPropagation();setEditing(false);}};document.addEventListener('pointerdown',outside,true);document.addEventListener('keydown',escape,true);return()=>{document.removeEventListener('pointerdown',outside,true);document.removeEventListener('keydown',escape,true);};},[editing]);
 const act=async(action:MessageAction)=>{
  if(disabled)return;
  const gaps=missingVariables(body+(destinations.email?' '+subject:''));
  if(gaps.length){setError(`${missingLabel(gaps.includes('calendly_link')?'calendly_link':gaps[0]??'Field')} is empty. Add it in Profile Settings or edit the message.`);return;}
  setError('');setActing(true);
  try{
   let url:string|undefined;
   if(action==='gmail'){const draft=new URL('https://mail.google.com/mail/');draft.search=new URLSearchParams({tf:'cm',to:destinations.email??'',su:subject,body:safeMessage(body)}).toString();url=draft.href;}
   else if(action==='chat')url=destinations.chat;else if(action==='linkedin')url=destinations.linkedin;
   const open=(href:string)=>{window.open(href,'_blank','noopener,noreferrer');};
   if(action==='gmail'&&url)open(url);else await copyThenOpen(safeMessage(body),url,text=>navigator.clipboard.writeText(text),()=>toast.success('Message copied'),open);
   setSentVia(action);setConfirmSent(true);
  }catch{setError('Could not copy. Select and copy the message manually, or try again.');}finally{setActing(false);}
 };
 const action=(key:MessageAction)=>{const info=actionInfo[key];return <div key={key} className="min-w-0 space-y-1.5"><Tooltip><TooltipTrigger asChild><Button disabled={disabled} size={key==='copy'?'sm':'default'} variant={key==='copy'?'default':key==='chat'?'accent':'outline'} className={key==='copy'?'w-32 [&_svg]:size-3':''} onClick={()=>void act(key)}>{key==='copy'?<Copy/>:<ExternalLink/>}{info.label}</Button></TooltipTrigger><TooltipContent className="max-w-64 bg-secondary text-secondary-foreground border border-border">{info.tooltip}</TooltipContent></Tooltip><p className="whitespace-nowrap text-left text-xs font-normal text-message-secondary">{info.caption}</p></div>;};
 if(logDraft)return <ConversationDialog contact={contact} draft={logDraft} onClose={()=>setLogDraft(null)} onSave={async c=>{await onSave(c);onClose();}}/>;
 if(review)return <MessageTemplateEditor draft={review} userId={profile.user_id} onClose={()=>setReview(null)} onSaved={async t=>{setUpdatedTemplate(t);await onTemplatesRefresh?.();setReview(null);toast.success('Template updated');}}/>;
 return <Modal title={`Message · ${contact.name}`} onClose={onClose}><TooltipProvider delayDuration={250}><div className="space-y-3" onKeyDownCapture={e=>{if(e.key==='Escape'&&editing){e.preventDefault();e.stopPropagation();setEditing(false);}}} onPointerDownCapture={e=>{if(editing&&!editor.current?.contains(e.target as Node))setEditing(false);}}>
 <Field label="Template"><StyledSelect className={inputClass} value={templateId} onValueChange={id=>{const t=updatedTemplate?.id===id?updatedTemplate:templates.find(x=>x.id===id);setTemplateId(id);setBody(t?fillTemplate(t.body,contact,profile).text:'');setSubject(t?fillTemplate(t.subject,contact,profile).text:'');setEditing(false);setConfirmSent(false);setError('');}}>{templates.map(t=><option key={t.id} value={t.id}>{t.name}</option>)}</StyledSelect></Field>
 <div ref={editor} className="space-y-3" onBlur={e=>{if(editing&&e.relatedTarget&&!e.currentTarget.contains(e.relatedTarget))setEditing(false);}}>
 {destinations.email&&<Field label="Subject"><input aria-label="Subject" readOnly={!editing} className={inputClass+' font-normal text-foreground'} value={subject} onChange={e=>setSubject(e.target.value)}/></Field>}
 <div className="grid items-start gap-4 sm:grid-cols-[minmax(0,1fr)_auto]"><Field label="Message">{editing?<textarea aria-label="Message" autoFocus className={inputClass+' font-normal text-foreground'} rows={4} maxLength={isRequest?300:undefined} value={body} onChange={e=>setBody(e.target.value)}/>:<MessagePreview text={body}/>}</Field>
 <div className="flex flex-wrap items-start gap-3 sm:pt-6 sm:flex-col"><Button size="sm" variant="outline" className="w-32 [&_svg]:size-3" onClick={()=>{setBody(safeMessage(body));setSubject(safeMessage(subject));setEditing(true);setError('');}}><Pencil className="size-3"/>Edit message</Button>{changed&&<><Button size="sm" variant="link" className="h-auto p-0" onClick={()=>{setBody(templateBody);setSubject(templateSubject);setEditing(false);setConfirmSent(false);setError('');}}>Reset</Button>{chosen&&<Button size="sm" variant="link" className="h-auto p-0" onClick={()=>setReview({...chosen,subject:restoreTemplateText(subject,contact,profile,chosen.subject),body:restoreTemplateText(body,contact,profile,chosen.body)})}>Update template</Button>}</>}{isRequest&&<span className={`text-xs ${body.length>200?'text-destructive':'text-message-secondary'}`}>{body.length}/300{body.length>200?' · Over 200 characters':''}</span>}{action('copy')}</div></div></div>
 <div className="space-y-3 pt-1"><div className="flex flex-wrap gap-x-6 gap-y-3">{destinations.chat&&action('chat')}{destinations.email&&action('gmail')}{destinations.linkedin&&action('linkedin')}</div>{!destinations.email&&!destinations.linkedin&&<p className="text-xs text-message-secondary">Add an email or LinkedIn URL to message from here.</p>}</div>
 {confirmSent&&<div className="flex flex-wrap items-center gap-3 border-t border-border pt-3"><h3 className="mr-auto text-sm font-medium">Log this as sent?</h3><Button size="sm" onClick={()=>setLogDraft(sentDraft(contact,body,chosen?.type,sentVia,today()))}>Yes, log it</Button><Button size="sm" variant="ghost" onClick={()=>setConfirmSent(false)}>Not now</Button></div>}
 {error&&<p role="alert" className="text-sm text-destructive">{error}</p>}
 </div></TooltipProvider></Modal>;
}
function MessagePreview({text}:{text:string}){return <div aria-label="Message" className="min-h-24 max-h-52 overflow-y-auto whitespace-pre-wrap break-words rounded-md border border-input bg-card px-3 py-2 text-sm font-normal leading-relaxed text-foreground">{text.split(/(\[missing: \w+\])/g).map((part,i)=>{const name=part.match(/^\[missing: (\w+)\]$/)?.[1];return name?<span key={i} className="inline-block rounded bg-tag-yellow px-1.5 py-0.5 text-xs font-medium text-tag-yellow-fg">{missingLabel(name)} missing</span>:<span key={i}>{part}</span>;})}</div>;}