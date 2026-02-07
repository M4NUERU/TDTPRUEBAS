import { supabase } from '../lib/supabase';

// Auth service for PIN-based login
export async function loginWithPIN(pin) {
  // Return { data, error } for consistency with previous usage
  const { data, error } = await supabase.from('operarios').select('*').eq('pin', pin);
  return { data, error };
}
