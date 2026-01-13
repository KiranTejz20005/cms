import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useNavigate, Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Mail, Lock, Loader, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { scaleVariants, fadeInVariants } from '../lib/animations';

export function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();
    const { refreshAuth, isAuthenticated } = useAuth();

    // Handle OAuth callback and auto-redirect if already authenticated
    useEffect(() => {
        // Handle OAuth callback (hash in URL)
        const hash = window.location.hash;
        if (hash && hash.includes('access_token')) {
            setLoading(true);

            // Clean the URL immediately to prevent re-processing
            window.history.replaceState(null, '', window.location.pathname);

            // Give AuthContext time to process the OAuth callback
            const timer = setTimeout(async () => {
                await refreshAuth();
                // Force navigation to dashboard
                window.location.href = '/';
            }, 800);

            return () => clearTimeout(timer);
        }

        // Check if user is already authenticated and redirect
        if (isAuthenticated) {
            navigate('/', { replace: true });
        }
    }, [isAuthenticated, navigate, refreshAuth]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const cleanedEmail = email.trim();
        const cleanedPassword = password.trim();
        let success = false;

        try {
            // 1. Try Supabase Login
            const { error: supabaseError } = await supabase.auth.signInWithPassword({
                email: cleanedEmail,
                password: cleanedPassword,
            });

            if (!supabaseError) {
                success = true;
                // Wait for auth state to update
                await refreshAuth();
            } else {
                console.log("Supabase login failed, trying Strapi due to:", supabaseError.message);
                // 2. Try Strapi Login
                try {
                    const { strapiApi } = await import('../lib/strapi');
                    const strapiRes = await strapiApi.login(cleanedEmail, cleanedPassword);
                    if (strapiRes && strapiRes.jwt) {
                        success = true;
                        localStorage.setItem('user_role', 'admin');
                        await refreshAuth();
                    }
                } catch (strapiErr: any) {
                    console.warn("Strapi login also failed:", strapiErr);
                    const msg = supabaseError?.message === 'Invalid login credentials'
                        ? 'Invalid login credentials'
                        : (supabaseError?.message || strapiErr?.message || "Login failed");
                    throw new Error(msg);
                }
            }

            if (success) {
                // Small delay to ensure auth state is updated
                setTimeout(() => {
                    navigate('/');
                }, 100);
            }
        } catch (err: any) {
            setError(err.message || 'Login failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4 relative overflow-hidden">
            {/* Subtle Background Pattern */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary-50/30 via-background to-background pointer-events-none" />

            <motion.div
                variants={scaleVariants}
                initial="hidden"
                animate="visible"
                className="card w-full max-w-md relative z-10 overflow-hidden"
            >
                <div className="p-8 sm:p-10">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: 'spring', stiffness: 200, delay: 0.1 }}
                            className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-primary-600 text-white mb-4 shadow-lg shadow-primary/20"
                        >
                            <Lock size={24} />
                        </motion.div>
                        <motion.h1
                            variants={fadeInVariants}
                            className="text-2xl font-bold text-text-primary mb-2"
                        >
                            Welcome Back
                        </motion.h1>
                        <motion.p
                            variants={fadeInVariants}
                            className="text-text-secondary text-sm"
                        >
                            Sign in to your account to continue
                        </motion.p>
                    </div>

                    {/* Error Message */}
                    <AnimatePresence mode="wait">
                        {error && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="mb-6 p-4 bg-error-light border border-error/20 rounded-lg flex items-start gap-3"
                            >
                                <AlertCircle size={18} className="text-error shrink-0 mt-0.5" />
                                <p className="text-sm text-error-dark">{error}</p>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Email Field */}
                        <div>
                            <label htmlFor="email" className="block text-sm font-semibold text-text-primary mb-2">
                                Email Address
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary" size={18} />
                                <input
                                    id="email"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="input pl-10"
                                    placeholder="you@example.com"
                                    required
                                    autoComplete="email"
                                />
                            </div>
                        </div>

                        {/* Password Field */}
                        <div>
                            <label htmlFor="password" className="block text-sm font-semibold text-text-primary mb-2">
                                Password
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary" size={18} />
                                <input
                                    id="password"
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="input pl-10 pr-10"
                                    placeholder="••••••••"
                                    required
                                    autoComplete="current-password"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-text-tertiary hover:text-text-primary transition-colors"
                                    aria-label={showPassword ? "Hide password" : "Show password"}
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        {/* Forgot Password Link */}
                        <div className="flex justify-end">
                            <Link
                                to="/forgot-password"
                                className="text-sm font-medium text-primary hover:text-primary-600 transition-colors"
                            >
                                Forgot password?
                            </Link>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="btn-primary w-full"
                        >
                            {loading ? (
                                <span className="flex items-center justify-center gap-2">
                                    <Loader className="animate-spin" size={18} />
                                    Signing in...
                                </span>
                            ) : (
                                'Sign In'
                            )}
                        </button>
                    </form>

                    {/* Divider */}
                    <div className="relative my-8">
                        <div className="absolute inset-0 flex items-center">
                            <div className="divider w-full" />
                        </div>
                        <div className="relative flex justify-center text-xs">
                            <span className="px-2 bg-surface text-text-tertiary">
                                Or continue with
                            </span>
                        </div>
                    </div>

                    {/* Google Sign In */}
                    <button
                        type="button"
                        onClick={() => {
                            const redirectUrl = window.location.origin;
                            supabase.auth.signInWithOAuth({
                                provider: 'google',
                                options: {
                                    redirectTo: redirectUrl
                                }
                            });
                        }}
                        className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-surface border border-border rounded-lg hover:bg-background-secondary transition-all duration-200 group"
                    >
                        <svg className="w-5 h-5" viewBox="0 0 24 24">
                            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                        </svg>
                        <span className="font-semibold text-text-primary">Sign in with Google</span>
                    </button>

                    {/* Sign Up Link */}
                    <div className="mt-6 text-center">
                        <p className="text-sm text-text-secondary">
                            Don't have an account?{' '}
                            <Link to="/signup" className="text-primary font-semibold hover:text-primary-600 transition-colors">
                                Sign up
                            </Link>
                        </p>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
