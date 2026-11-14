import {useEffect,useState,type InputHTMLAttributes} from 'react';
import {formatDate,parseDate} from '@/lib/dates';
type Props=Omit<InputHTMLAttributes<HTMLInputElement>,'value'|'onChange'|'type'|'max'|'min'> & {value:string;onChange:(value:string)=>void;max?:string;min?:string};
export function DateInput({value,onChange,max,min,...props}:Props){
  const [draft,setDraft]=useState(value?formatDate(value):'');
  useEffect(()=>setDraft(value?formatDate(value):''),[value]);
  return <input {...props} type="text" inputMode="numeric" placeholder="MM/DD/YYYY" pattern="[0-9]{2}/[0-9]{2}/[0-9]{4}" maxLength={10} value={draft} onChange={e=>{
    const text=e.target.value;setDraft(text);
    const iso=parseDate(text);
    const valid=!text||!!iso&&(!max||iso<=max)&&(!min||iso>=min);
    e.target.setCustomValidity(valid?'':`Enter a valid MM/DD/YYYY date${max?` on or before ${formatDate(max)}`:''}.`);
    if(valid)onChange(iso??'');
  }}/>;
}