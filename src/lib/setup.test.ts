import {describe,it,expect} from 'vitest';
import {advanceSetup,completeSetup,pendingSetup} from './setup';
import {fillTemplate,missingVariables,safeMessage} from './templates';
import {blankContact} from './contacts';
import type {Profile} from './network-store';
const profile:Profile={user_id:'test',first_name:'Signup',last_name:'Name',school:'',linkedin_url:'',calendly_link:'',weekly_goal:5,onboarding_step:2,encryption_salt:null,encryption_verifier:null,theme:'light',skipped_setup_steps:[],setup_dismissed:false};
describe('skip-proof setup',()=>{
 it('skipping About you retains weekly goal 5',()=>expect(advanceSetup(profile,true).weekly_goal).toBe(5));
 it('records only skipped optional steps',()=>{let p=profile;while(p.onboarding_step<6)p=advanceSetup(p,true);expect(p.skipped_setup_steps).toEqual([2,4,5]);expect(p.onboarding_step).toBe(6);});
 it('completed setup cannot start again',()=>expect(advanceSetup({...profile,onboarding_step:6}).onboarding_step).toBe(6));
 it('removes completed optional steps',()=>expect(completeSetup({...profile,skipped_setup_steps:[2,4,5]},4).skipped_setup_steps).toEqual([2,5]));
 it('first contact completes the first contacts reminder',()=>expect(pendingSetup({...profile,skipped_setup_steps:[5]},true)).toEqual([]));
 it('dismissal hides every remaining reminder',()=>expect(pendingSetup({...profile,skipped_setup_steps:[2,4,5],setup_dismissed:true},false)).toEqual([]));
 it('sign-off uses the signup name when About you is skipped',()=>expect(fillTemplate('Best, {{my_full_name}}',blankContact(),advanceSetup(profile,true)).text).toBe('Best, Signup Name'));
 it('detects empty Calendly and never exports its raw placeholder',()=>{const text=fillTemplate('Book: {{calendly_link}}',blankContact(),profile).text;expect(missingVariables(text)).toEqual(['calendly_link']);expect(safeMessage(text)).toBe('Book: ');});
});