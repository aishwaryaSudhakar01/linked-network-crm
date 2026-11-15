import {describe,it,expect} from 'vitest';
import {activeSetupStep,advanceSetup,completeSetup,pendingSetup} from './setup';
import {fillTemplate,missingVariables,safeMessage} from './templates';
import {blankContact} from './contacts';
import type {Profile} from './network-store';
const profile:Profile={user_id:'test',first_name:'Signup',last_name:'Name',school:'',linkedin_url:'',calendly_link:'',weekly_goal:5,onboarding_step:2,encryption_salt:null,encryption_verifier:null,theme:'light',skipped_setup_steps:[],setup_dismissed:false,reminder_initial_days:5,reminder_reply_days:7,reminder_talking_days:7,reminder_keep_days:90,reminder_dormant_days:14};
describe('skip-proof setup',()=>{
 it('advances About you directly to template review',()=>expect(advanceSetup(profile).onboarding_step).toBe(4));
 it('resumes the retired Calendar step at template review and advances to contacts',()=>{const paused={...profile,onboarding_step:3,skipped_setup_steps:[2,5]};expect(activeSetupStep(paused.onboarding_step)).toBe(4);const next=advanceSetup(paused);expect(next.onboarding_step).toBe(5);expect(next.skipped_setup_steps).toEqual([2,5]);});
 it('skipping template review from the retired step preserves other setup records',()=>{const paused={...profile,onboarding_step:3,skipped_setup_steps:[2,5],setup_dismissed:true};const next=advanceSetup(paused,true);expect(next.onboarding_step).toBe(5);expect(next.skipped_setup_steps).toEqual([2,5,4]);expect(next.setup_dismissed).toBe(true);});
 it('skipping About you retains weekly goal 5',()=>expect(advanceSetup(profile,true).weekly_goal).toBe(5));
 it('records only skipped optional steps',()=>{let p=profile;while(p.onboarding_step<6)p=advanceSetup(p,true);expect(p.skipped_setup_steps).toEqual([2,4,5]);expect(p.onboarding_step).toBe(6);});
 it('completed setup cannot start again',()=>expect(advanceSetup({...profile,onboarding_step:6}).onboarding_step).toBe(6));
 it('removes completed optional steps',()=>expect(completeSetup({...profile,skipped_setup_steps:[2,4,5]},4).skipped_setup_steps).toEqual([2,5]));
 it('first contact completes the first contacts reminder',()=>expect(pendingSetup({...profile,skipped_setup_steps:[5]},true)).toEqual([]));
 it('dismissal hides every remaining reminder',()=>expect(pendingSetup({...profile,skipped_setup_steps:[2,4,5],setup_dismissed:true},false)).toEqual([]));
 it('sign-off uses the signup name when About you is skipped',()=>expect(fillTemplate('Best, {{my_full_name}}',blankContact(),advanceSetup(profile,true)).text).toBe('Best, Signup Name'));
 it('detects empty Calendly and never exports its raw placeholder',()=>{const text=fillTemplate('Book: {{calendly_link}}',blankContact(),profile).text;expect(missingVariables(text)).toEqual(['calendly_link']);expect(safeMessage(text)).toBe('Book: ');});
});