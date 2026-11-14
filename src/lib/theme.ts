export const THEME_STORAGE_KEY='ln.theme';
export function applyTheme(theme:string) {
  const next=theme==='dark'?'dark':'light';
  document.documentElement.classList.toggle('dark',next==='dark');
  document.documentElement.style.colorScheme=next;
  try{localStorage.setItem(THEME_STORAGE_KEY,next);}catch{/* Storage may be unavailable. */}
}