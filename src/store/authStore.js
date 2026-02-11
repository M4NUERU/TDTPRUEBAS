/**
 * © 2026 modulR. All rights reserved.
 * 
 * PROPRIETARY AND CONFIDENTIAL.
 * 
 * This file is part of modulR Manager.
 * Unauthorized copying of this file, via any medium is strictly prohibited.
 * Proprietary code by modulR.
 */

import { create } from 'zustand';

// Simple auth store with localStorage persistence for the user session
export const useAuthStore = create((set) => ({
  user: JSON.parse(localStorage.getItem('todotejidos_user') || 'null'),
  setUser: (u) => {
    if (u) localStorage.setItem('todotejidos_user', JSON.stringify(u));
    else localStorage.removeItem('todotejidos_user');
    set({ user: u ?? null });
  },
  logout: () => {
    localStorage.removeItem('todotejidos_user');
    set({ user: null });
  }
}));
