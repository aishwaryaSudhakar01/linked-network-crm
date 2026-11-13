import {useState,type InputHTMLAttributes} from 'react';
import {Eye,EyeOff} from 'lucide-react';
import {Button} from '@/components/ui/button';
import {inputClass} from './shared';
export function PasswordInput(props:Omit<InputHTMLAttributes<HTMLInputElement>,'type'|'className'>){const [shown,setShown]=useState(false);return <div className="relative"><input {...props} type={shown?'text':'password'} className={`${inputClass} pr-10`}/><Button variant="ghost" size="icon" type="button" aria-label={shown?'Hide password':'Show password'} aria-pressed={shown} title={shown?'Hide password':'Show password'} onClick={()=>setShown(v=>!v)} className="absolute inset-y-0 right-0 h-full w-10 rounded-l-none text-muted-foreground hover:text-foreground">{shown?<EyeOff/>:<Eye/>}</Button></div>;}
