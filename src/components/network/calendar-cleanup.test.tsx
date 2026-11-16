import {cleanup,fireEvent,render,screen,waitFor} from '@testing-library/react';
import {afterEach,describe,expect,it,vi} from 'vitest';
import {ContactView} from './contact-view';
import {Onboarding} from './onboarding';
import {Route as meetingsRoute} from '@/routes/_authenticated/meetings';
import {blankContact} from '@/lib/contacts';
import type {Profile} from '@/lib/network-store';

const mocks=vi.hoisted(()=>({navigate:vi.fn(),updateProfile:vi.fn(async()=>{})}));
vi.mock('@tanstack/react-router',async importOriginal=>({...await importOriginal<typeof import('@tanstack/react-router')>(),Navigate:(props:{to:string;replace?:boolean})=>{mocks.navigate(props);return null;}}));
vi.mock('@/lib/network-store',()=>({updateProfile:mocks.updateProfile}));
vi.mock('./session',()=>({useNetwork:()=>({})}));
vi.mock('./template-tools',()=>({TemplateManager:()=>null}));
vi.mock('@/components/ui/styled-select',()=>({StyledSelect:({children,onValueChange,...props}:any)=><select {...props} onChange={e=>onValueChange(e.target.value)}>{children}</select>}));
afterEach(()=>{cleanup();vi.clearAllMocks();vi.restoreAllMocks();});
const profile:Profile={user_id:'test',first_name:'Alex',last_name:'Student',school:'',linkedin_url:'',calendly_link:'',weekly_goal:5,onboarding_step:3,encryption_salt:null,encryption_verifier:null,theme:'light',skipped_setup_steps:[2],setup_dismissed:false,reminder_initial_days:5,reminder_reply_days:7,reminder_talking_days:7,reminder_keep_days:90,reminder_dormant_days:14};

describe('Calendar cleanup compatibility',()=>{
 it('the retired Meetings page requests a replace redirect to Home',()=>{
  const Redirect=meetingsRoute.options.component;
  if(typeof Redirect!=='function')throw new Error('Missing redirect component');
  render(<Redirect/>);
  expect(mocks.navigate).toHaveBeenCalledWith({to:'/home',replace:true});
 });
 it('an account paused on the retired step can accept templates and persist the contacts step',async()=>{
  const onProfile=vi.fn();
  render(<Onboarding profile={profile} templates={[]} onProfile={onProfile} onTemplates={vi.fn(async()=>{})} onQuick={vi.fn()} onImport={vi.fn()}/>);
  fireEvent.click(screen.getByRole('button',{name:'Accept templates'}));
  await waitFor(()=>expect(onProfile).toHaveBeenCalledWith({...profile,onboarding_step:5}));
  expect(mocks.updateProfile).toHaveBeenCalledWith({...profile,onboarding_step:5});
 });
 it('Schedule still opens the existing prefilled draft without saving a contact',()=>{
  const c={...blankContact(),name:'Jane Doe',email:'jane@example.com',next_step:'Discuss opportunities',next_step_date:'2026-11-15'};
  const onSave=vi.fn(async()=>{});
  const open=vi.spyOn(window,'open').mockReturnValue(null);
  render(<ContactView c={c} contacts={[c]} profile={profile} onSave={onSave} onLog={vi.fn()} onMessage={vi.fn()} onDelete={vi.fn(async()=>{})}/>);
  fireEvent.click(screen.getByRole('button',{name:'Schedule'}));
  expect(open).toHaveBeenCalledTimes(1);
  const url=new URL(String(open.mock.calls[0]?.[0]));
  expect(url.origin+url.pathname).toBe('https://calendar.google.com/calendar/render');
  expect(Object.fromEntries(url.searchParams)).toEqual({action:'TEMPLATE',text:'Jane / Alex - Coffee chat',details:'Discuss opportunities',add:'jane@example.com',dates:'20261115/20261116'});
  expect(open.mock.calls[0]?.slice(1)).toEqual(['_blank','noopener,noreferrer']);
  expect(onSave).not.toHaveBeenCalled();
 });
});