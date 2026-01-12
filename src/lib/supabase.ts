
import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Validate keys look legitimate before proceeding
const isValidUrl = supabaseUrl.startsWith('https://') && supabaseUrl.includes('.supabase.co');
const isValidKey = supabaseAnonKey.length > 30; // Valid anon keys are longer

export const isSupabaseConfigured = isValidUrl && isValidKey;

if (!isSupabaseConfigured) {
    console.warn(
        '[Supabase] Not properly configured. Check .env file.',
        { urlValid: isValidUrl, keyValid: isValidKey }
    );
}

// Create client with fallback placeholders to prevent crash
// The client will simply fail API calls gracefully
export const supabase: SupabaseClient = createClient(
    supabaseUrl || 'https://placeholder.supabase.co',
    supabaseAnonKey || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.placeholder'
);
