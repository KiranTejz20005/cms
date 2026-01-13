import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { User, Session } from '@supabase/supabase-js';

interface AuthContextType {
    session: Session | null;
    user: User | null;
    role: 'admin' | 'user' | null;
    loading: boolean;
    isAuthenticated: boolean;
    signOut: () => Promise<void>;
    refreshAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [session, setSession] = useState<Session | null>(null);
    const [user, setUser] = useState<User | null>(null);
    const [role, setRole] = useState<'admin' | 'user' | null>(null);
    const [loading, setLoading] = useState(true);

    const initAuth = async () => {
        try {
            // Get hash once
            const hash = window.location.hash;

            // 0. Check for OAuth callback in URL hash
            if (hash && hash.includes('access_token')) {
                console.log('OAuth callback detected in initAuth, letting Supabase handle it...');
                // Let Supabase process it through onAuthStateChange
                // Just wait a bit for Supabase to do its thing
                await new Promise(resolve => setTimeout(resolve, 500));
            }

            // 1. Check Supabase Session
            const { data: { session } } = await supabase.auth.getSession();

            if (session) {
                console.log('Supabase session found:', session.user.email);
                setSession(session);
                setUser(session.user);
                await fetchRole(session.user.id);
                setLoading(false);
                // Clean URL after successful auth
                if (hash && hash.includes('access_token')) {
                    window.history.replaceState(null, '', window.location.pathname);
                }
                return;
            }

            // 2. Check for Guest Mode
            const guestMode = localStorage.getItem('guest_mode');
            if (guestMode === 'true') {
                const guestUserStr = localStorage.getItem('guest_user');
                try {
                    const guestUser = guestUserStr ? JSON.parse(guestUserStr) : {
                        id: `guest-${Date.now()}`,
                        email: `guest-${Date.now()}@guest.local`,
                        user_metadata: { full_name: 'Guest User' },
                        app_metadata: { provider: 'guest' },
                        aud: 'guest'
                    };
                    setUser(guestUser as any);
                    setSession(null);
                    setRole('user');
                    setLoading(false);
                    console.log('Guest mode activated');
                    return;
                } catch (e) {
                    console.error("Failed to parse guest user", e);
                    localStorage.removeItem('guest_mode');
                    localStorage.removeItem('guest_user');
                }
            }

            // 3. Fallback to Strapi (Local Storage)
            const strapiJwt = localStorage.getItem('strapi_jwt');
            if (strapiJwt) {
                const strapiUserStr = localStorage.getItem('strapi_user');
                try {
                    const strapiUser = strapiUserStr ? JSON.parse(strapiUserStr) : { id: 'strapi', email: 'user@strapi.io' };
                    // Mock a Supabase-like User object for compatibility
                    const mockUser: any = {
                        id: strapiUser.id?.toString() || 'strapi-user',
                        email: strapiUser.email,
                        user_metadata: { full_name: strapiUser.username || strapiUser.email },
                        app_metadata: { provider: 'strapi' },
                        aud: 'authenticated',
                        created_at: new Date().toISOString()
                    };
                    setUser(mockUser);
                    setSession(null);
                    const storedRole = localStorage.getItem('user_role');
                    setRole((storedRole as 'admin' | 'user') || 'user');
                    setLoading(false);
                    return;
                } catch (e) {
                    console.error("Failed to parse strapi user", e);
                    localStorage.removeItem('strapi_jwt');
                }
            }

            // 4. FINAL FALLBACK: Manual Hash Parsing (The "Fix It Bruhh" Protocol)
            // If Supabase failed to catch the session (e.g. wrong Anon Key), we catch it manually.
            if (hash && hash.includes('access_token')) {
                // Extract params
                const params = new URLSearchParams(hash.substring(1)); // remove #
                const accessToken = params.get('access_token');
                const refreshToken = params.get('refresh_token');

                if (accessToken) {
                    try {
                        // Decode JWT safely (without libraries)
                        const base64Url = accessToken.split('.')[1];
                        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
                        const jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function (c) {
                            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
                        }).join(''));
                        const payload = JSON.parse(jsonPayload);

                        console.log("Decoded Manual Token:", payload);

                        // Synthesize Session
                        const syntheticUser: User = {
                            id: payload.sub || 'google-user',
                            email: payload.email,
                            user_metadata: payload.user_metadata || { full_name: payload.email },
                            app_metadata: payload.app_metadata || {},
                            aud: 'authenticated',
                            created_at: new Date().toISOString(),
                            role: 'authenticated',
                            updated_at: new Date().toISOString()
                        };

                        const syntheticSession: Session = {
                            access_token: accessToken,
                            refresh_token: refreshToken || '',
                            expires_in: 3600,
                            token_type: 'bearer',
                            user: syntheticUser
                        };

                        setSession(syntheticSession);
                        setUser(syntheticUser);
                        setRole('user'); // Default to user
                        setLoading(false);

                        // Clean URL so we don't re-parse
                        window.history.replaceState(null, '', window.location.pathname);
                        return;
                    } catch (e) {
                        console.error("Manual parsing failed:", e);
                    }
                }
            }

            setLoading(false);

        } catch (err) {
            console.error('Auth initialization error:', err);
            setLoading(false);
        }
    };

    useEffect(() => {
        initAuth();

        // Listen for Supabase auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            (_event, session) => {
                if (session) {
                    setSession(session);
                    setUser(session.user);
                    fetchRole(session.user.id);
                    setLoading(false);
                } else {
                    if (_event === 'SIGNED_OUT') {
                        setSession(null);
                        setUser(null);
                        setRole(null);
                        setLoading(false);
                    }
                }
            }
        );

        return () => subscription.unsubscribe();
    }, []);

    const fetchRole = async (userId: string) => {
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('role')
                .eq('id', userId)
                .single();

            if (error || !data) {
                setRole('user');
            } else {
                setRole(data.role as 'admin' | 'user');
            }
        } catch (e) {
            setRole('user');
        }
    };

    const signOut = async () => {
        await supabase.auth.signOut(); // Clear Supabase
        localStorage.removeItem('strapi_jwt'); // Clear Strapi
        localStorage.removeItem('strapi_user');
        localStorage.removeItem('user_role');
        localStorage.removeItem('guest_mode'); // Clear Guest Mode
        localStorage.removeItem('guest_user');
        setRole(null);
        setUser(null);
        setSession(null);
        window.location.href = '/login'; // Force reload/redirect to ensure clean state
    };

    const refreshAuth = async () => {
        setLoading(true);
        await initAuth();
    };

    const isAuthenticated = !!user; // Based on user existence, covering both providers

    return (
        <AuthContext.Provider value={{ session, user, role, loading, isAuthenticated, signOut, refreshAuth }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
