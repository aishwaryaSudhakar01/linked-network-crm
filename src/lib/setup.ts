import type {Profile} from './network-store';
export const OPTIONAL_SETUP = [2,4,5] as const;
export function advanceSetup(profile:Profile, skipped=false):Profile {
  const steps=new Set(profile.skipped_setup_steps);
  if(OPTIONAL_SETUP.some(s=>s===profile.onboarding_step)) {
    if(skipped)steps.add(profile.onboarding_step);else steps.delete(profile.onboarding_step);
  }
  return {...profile,weekly_goal:profile.weekly_goal||5,skipped_setup_steps:[...steps],onboarding_step:Math.min(6,profile.onboarding_step+1)};
}
export function completeSetup(profile:Profile,step:number):Profile {
  return {...profile,skipped_setup_steps:profile.skipped_setup_steps.filter(s=>s!==step)};
}
export function pendingSetup(profile:Profile,hasContacts:boolean) {
  return profile.setup_dismissed?[]:profile.skipped_setup_steps.filter(s=>s!==5||!hasContacts);
}