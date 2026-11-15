import type {Profile} from './network-store';
export const OPTIONAL_SETUP = [2,4,5] as const;
export function activeSetupStep(step:number):number {
  return step===3?4:step;
}
export function advanceSetup(profile:Profile, skipped=false):Profile {
  const step=activeSetupStep(profile.onboarding_step);
  const steps=new Set(profile.skipped_setup_steps);
  if(OPTIONAL_SETUP.some(s=>s===step)) {
    if(skipped)steps.add(step);else steps.delete(step);
  }
  return {...profile,weekly_goal:profile.weekly_goal||5,skipped_setup_steps:[...steps],onboarding_step:activeSetupStep(Math.min(6,step+1))};
}
export function completeSetup(profile:Profile,step:number):Profile {
  return {...profile,skipped_setup_steps:profile.skipped_setup_steps.filter(s=>s!==step)};
}
export function pendingSetup(profile:Profile,hasContacts:boolean) {
  return profile.setup_dismissed?[]:profile.skipped_setup_steps.filter(s=>s!==5||!hasContacts);
}