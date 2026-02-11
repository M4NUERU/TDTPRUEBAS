/**
 * © 2026 modulR. All rights reserved.
 * 
 * PROPRIETARY AND CONFIDENTIAL.
 * 
 * This file is part of modulR Manager.
 * Unauthorized copying of this file, via any medium is strictly prohibited.
 * Proprietary code by modulR.
 */

import { createClient } from '@supabase/supabase-js'
import { demoService } from '../api/demoService'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

const isDemo = localStorage.getItem('modo_demo') === 'true';

let client;

if (isDemo) {
    console.log('🔌 MODO DEMO ACTIVADO');
    client = demoService;
} else {
    if (!supabaseUrl || !supabaseAnonKey) {
        console.warn('Supabase credentials missing. Fallback to placeholder/demo might be needed.')
    }
    client = createClient(supabaseUrl || 'https://placeholder.supabase.co', supabaseAnonKey || 'placeholder')
}

export const supabase = client;
