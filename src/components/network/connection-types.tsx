import {ChevronDown} from 'lucide-react';
import {Button} from '@/components/ui/button';
import {DropdownMenu,DropdownMenuTrigger,DropdownMenuContent,DropdownMenuCheckboxItem} from '@/components/ui/dropdown-menu';
import {CONNECTIONS} from '@/lib/contacts';

export function ConnectionTypes({value,onChange}:{value:string[];onChange:(value:string[])=>void}){
  const options=[...new Set([...CONNECTIONS,...value])];
  return <DropdownMenu><DropdownMenuTrigger asChild><Button type="button" variant="outline" size="sm" aria-label="Connection type" className="h-auto min-h-8 w-full justify-between gap-2 whitespace-normal text-left font-normal"><span>{value.join(', ')||'Select connection types'}</span><ChevronDown className="size-3 shrink-0 text-muted-foreground"/></Button></DropdownMenuTrigger><DropdownMenuContent align="start" className="w-56 border-border bg-card text-foreground">{options.map(type=><DropdownMenuCheckboxItem key={type} checked={value.includes(type)} onSelect={e=>e.preventDefault()} onCheckedChange={checked=>onChange(checked?[...value,type]:value.filter(v=>v!==type))} className="cursor-pointer py-2 data-[state=checked]:bg-tag-yellow data-[state=checked]:text-tag-yellow-fg">{type}</DropdownMenuCheckboxItem>)}</DropdownMenuContent></DropdownMenu>;
}