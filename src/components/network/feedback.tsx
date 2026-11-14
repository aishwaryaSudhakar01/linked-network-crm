import {StyledSelect} from '@/components/ui/styled-select';
import {useState} from 'react';
import {toast} from 'sonner';
import {Button} from '@/components/ui/button';
import {supabase} from '@/integrations/supabase/client';
import {Field,inputClass,Modal} from './shared';
export function FeedbackDialog({userId,onClose}:{userId:string;onClose:()=>void}){const [type,setType]=useState('Bug');const [message,setMessage]=useState('');const [busy,setBusy]=useState(false);const [error,setError]=useState('');return <Modal title="Give feedback" onClose={onClose}><form className="space-y-4" onSubmit={async e=>{e.preventDefault();setBusy(true);const {error}=await supabase.from('feedback').insert({user_id:userId,type,message:message.trim(),page:window.location.pathname});setBusy(false);if(error)setError(error.message);else{toast.success('Feedback submitted');onClose();}}}><Field label="Type"><StyledSelect className={inputClass} value={type} onValueChange={value=>setType(value)}>{['Bug','Idea','Confusing','Other'].map(t=><option key={t}>{t}</option>)}</StyledSelect></Field><Field label="Message"><textarea required minLength={1} rows={5} className={inputClass} value={message} onChange={e=>setMessage(e.target.value)}/></Field>{error&&<p role="alert" className="text-sm text-destructive">{error}</p>}<Button disabled={busy||!message.trim()}>Submit feedback</Button></form></Modal>;}
