
import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Validate keys look legitimate before proceeding
const isValidUrl = supabaseUrl.startsWith('https://') && supabaseUrl.includes('.supabase.co');
const isValidKey = supabaseAnonKey.length > 30; // Valid anon keys are longer

export const isSupabaseConfigured = isValidUrl && isValidKey;

const throwIfMisconfigured = () => {
    if (!isSupabaseConfigured) {
        const urlMsg = isValidUrl ? '✔ URL looks ok' : '✖ VITE_SUPABASE_URL missing/invalid';
        const keyMsg = isValidKey ? '✔ anon key length ok' : '✖ VITE_SUPABASE_ANON_KEY missing/invalid';
        throw new Error(
            `Supabase is not configured correctly.\n${urlMsg}\n${keyMsg}\nCheck your .env file and restart the dev server.`
        );
    }
};

// Fail fast if env is wrong so we see it immediately
throwIfMisconfigured();

export const supabase: SupabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
        // Ensure OAuth callbacks with hash are handled properly
        flowType: 'pkce',
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true
    }
});

/**
 * Quick connectivity check to the relational DB (Supabase Postgres).
 * - Verifies auth endpoint
 * - Performs a lightweight head query against the profiles table (safe to remove/replace)
 */
export const testSupabaseConnection = async () => {
    throwIfMisconfigured();
    // 1) Check auth/session
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    if (sessionError) {
        throw new Error(`Supabase auth check failed: ${sessionError.message}`);
    }

    // 2) Ping a table to ensure DB connectivity (no data pulled)
    const { error: pingError } = await supabase
        .from('profiles')
        .select('id', { head: true, count: 'exact' })
        .limit(1);

    if (pingError) {
        throw new Error(`Supabase DB check failed: ${pingError.message}`);
    }

    return {
        hasSession: !!sessionData?.session,
        message: 'Supabase connection OK'
    };
};
