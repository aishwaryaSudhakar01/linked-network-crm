import {it,expect} from 'vitest';
import {applyTheme,THEME_STORAGE_KEY} from './theme';
it('switches dark mode both ways and persists the reload value',()=>{
 applyTheme('dark');expect(document.documentElement.classList.contains('dark')).toBe(true);expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe('dark');
 applyTheme('light');expect(document.documentElement.classList.contains('dark')).toBe(false);expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe('light');
});