/**
 * © 2026 TodoTejidos SAS. All rights reserved.
 * 
 * PROPRIETARY AND CONFIDENTIAL.
 * 
 * This file is part of TodoTejidos Manager.
 * Unauthorized copying of this file, via any medium is strictly prohibited.
 * Proprietary code by TodoTejidos SAS.
 */

import { create } from 'zustand';

export const useThemeStore = create((set) => ({
  isDark: localStorage.getItem('todotejidos_theme') === 'dark',
  setDark: (value) => {
    localStorage.setItem('todotejidos_theme', value ? 'dark' : 'light');
    if (typeof document !== 'undefined') {
      if (value) document.documentElement.classList.add('dark');
      else document.documentElement.classList.remove('dark');
    }
    set({ isDark: value });
  },
  toggle: () => set((s) => {
    const next = !s.isDark;
    localStorage.setItem('todotejidos_theme', next ? 'dark' : 'light');
    if (typeof document !== 'undefined') {
      if (next) document.documentElement.classList.add('dark');
      else document.documentElement.classList.remove('dark');
    }
    return { isDark: next };
  })
}));
