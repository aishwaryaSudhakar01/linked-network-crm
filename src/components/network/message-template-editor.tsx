import {useState} from 'react';
import {Button} from '@/components/ui/button';
import {StyledSelect} from '@/components/ui/styled-select';
import {saveTemplate} from '@/lib/network-store';
import type {Template} from '@/lib/templates';
import {Field,inputClass,Modal} from './shared';

export function MessageTemplateEditor({draft,userId,onClose,onSaved}:{draft:Template;userId:string;onClose:()=>void;onSaved:(t:Template)=>Promise<void>}){
 const [template,setTemplate]=useState(draft);const [busy,setBusy]=useState(false);const [error,setError]=useState('');
 return <Modal title="Update template" onClose={onClose}><form className="space-y-3" onSubmit={async e=>{e.preventDefault();if(template.type==='LinkedIn connection request'&&template.body.length>300)return;setBusy(true);setError('');try{await saveTemplate(template,userId);await onSaved(template);}catch(err){setError(err instanceof Error?err.message:'Could not save template.');}finally{setBusy(false);}}}>
 <Field label="Name"><input required className={inputClass} value={template.name} onChange={e=>setTemplate({...template,name:e.target.value})}/></Field>
 <Field label="Type"><StyledSelect className={inputClass} value={template.type} onValueChange={type=>setTemplate({...template,type})}>{['LinkedIn connection request','LinkedIn message','Email'].map(type=><option key={type}>{type}</option>)}</StyledSelect></Field>
 <Field label="Subject"><input className={inputClass} value={template.subject} onChange={e=>setTemplate({...template,subject:e.target.value})}/></Field>
 <Field label="Body"><textarea rows={6} className={inputClass} value={template.body} onChange={e=>setTemplate({...template,body:e.target.value})}/></Field>
 {template.type==='LinkedIn connection request'&&<p className="text-xs text-secondary-foreground">{template.body.length}/300</p>}
 {error&&<p role="alert" className="text-sm text-destructive">{error}</p>}
 <div className="flex justify-end gap-2"><Button type="button" variant="ghost" onClick={onClose}>Cancel</Button><Button disabled={busy||(template.type==='LinkedIn connection request'&&template.body.length>300)}>{busy?'Saving…':'Save template'}</Button></div>
 </form></Modal>;
}