import {Children,isValidElement,type ReactNode,type SelectHTMLAttributes} from 'react';
import {Select,SelectTrigger,SelectValue,SelectContent,SelectItem} from './select';

type Props=Omit<SelectHTMLAttributes<HTMLSelectElement>,'onChange'|'value'|'defaultValue'> & {
  value?:string;onValueChange:(value:string)=>void;placeholder?:string;
};
export function StyledSelect({children,value,onValueChange,placeholder,className,id,name,disabled,required,...props}:Props){
  const options=Children.toArray(children).flatMap(child=>{
    if(!isValidElement<{value?:string;children?:ReactNode;disabled?:boolean}>(child)||child.type!=='option')return [];
    const label=child.props.children;const optionValue=child.props.value??String(label??'');
    return [{value:optionValue,label,disabled:child.props.disabled}];
  });
  const empty=options.find(o=>!o.value);
  return <Select value={value||''} onValueChange={onValueChange} name={name} disabled={disabled} required={required}>
    <SelectTrigger {...props} id={id} className={className}><SelectValue placeholder={placeholder??empty?.label??'Choose…'}/></SelectTrigger>
    <SelectContent>{options.filter(o=>o.value).map(o=><SelectItem key={o.value} value={o.value} disabled={o.disabled}>{o.label}</SelectItem>)}</SelectContent>
  </Select>;
}