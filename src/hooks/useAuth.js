/**
 * © 2026 TodoTejidos SAS. All rights reserved.
 * 
 * PROPRIETARY AND CONFIDENTIAL.
 * 
 * This file is part of TodoTejidos Manager.
 * Unauthorized copying of this file, via any medium is strictly prohibited.
 * Proprietary code by TodoTejidos SAS.
 */

import { useEffect } from 'react';
import { useAuthStore } from '../store/authStore';

// Lightweight hook to access authentication state
export const useAuth = () => {
  const user = useAuthStore((state) => state.user);
  const setUser = useAuthStore((state) => state.setUser);
  const logout = useAuthStore((state) => state.logout);

  // Persisted by store; this effect ensures any change runs once per mount if needed
  useEffect(() => {
    // Placeholder for future side-effects (e.g., token refresh)
  }, []);

  return { user, setUser, logout };
};
