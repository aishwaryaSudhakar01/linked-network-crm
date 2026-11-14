import {useEffect,useState,type InputHTMLAttributes} from 'react';
import {formatDate,parseDate} from '@/lib/dates';
import {CalendarIcon} from 'lucide-react';
import {Button} from '@/components/ui/button';
import {Calendar} from '@/components/ui/calendar';
import {Popover,PopoverContent,PopoverTrigger} from '@/components/ui/popover';
import {cn} from '@/lib/utils';
type Props=Omit<InputHTMLAttributes<HTMLInputElement>,'value'|'onChange'|'type'|'max'|'min'> & {value:string;onChange:(value:string)=>void;max?:string;min?:string};
export function DateInput({value,onChange,max,min,className,disabled,...props}:Props){
  const [open,setOpen]=useState(false);
  const [draft,setDraft]=useState(value?formatDate(value):'');
  useEffect(()=>setDraft(value?formatDate(value):''),[value]);
  const calendarDate=(iso:string)=>{const [year,month,day]=iso.split('-').map(Number);return year&&month&&day?new Date(year,month-1,day):undefined;};
  const selected=calendarDate(value);
  const earliest=calendarDate(min??'');const latest=calendarDate(max??'');
  return <div className={cn('relative min-w-0',className)}><input {...props} disabled={disabled} className="w-full min-w-0 rounded-md border border-input bg-card py-2 pl-3 pr-9 text-sm font-normal text-foreground outline-none focus:ring-2 focus:ring-ring" type="text" inputMode="numeric" placeholder="MM/DD/YYYY" pattern="[0-9]{2}/[0-9]{2}/[0-9]{4}" maxLength={10} value={draft} onChange={e=>{
    const text=e.target.value;setDraft(text);
    const iso=parseDate(text);
    const valid=!text||!!iso&&(!max||iso<=max)&&(!min||iso>=min);
    e.target.setCustomValidity(valid?'':`Enter a valid MM/DD/YYYY date${max?` on or before ${formatDate(max)}`:''}.`);
    if(valid)onChange(iso??'');
  }}/><Popover open={open} onOpenChange={setOpen}><PopoverTrigger asChild><Button type="button" size="icon" variant="ghost" disabled={disabled} aria-label={`Pick ${props['aria-label']??'date'} from calendar`} title="Choose date" className="absolute right-1 top-1/2 size-7 -translate-y-1/2 text-muted-foreground"><CalendarIcon/></Button></PopoverTrigger><PopoverContent align="end" className="pointer-events-auto w-auto p-0"><Calendar mode="single" captionLayout="dropdown" selected={selected} defaultMonth={selected??new Date()} startMonth={earliest??new Date(1900,0,1)} endMonth={latest??new Date(new Date().getFullYear()+20,11,31)} disabled={[...(earliest?[{before:earliest}]:[]),...(latest?[{after:latest}]:[])]} onSelect={date=>{if(!date)return;const iso=`${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;setDraft(formatDate(iso));onChange(iso);setOpen(false);}} autoFocus className="pointer-events-auto"/></PopoverContent></Popover></div>;
}