import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Mail, Loader, AlertCircle, CheckCircle, ArrowLeft, KeyRound } from 'lucide-react';
import { scaleVariants, fadeInVariants } from '../lib/animations';

export function ForgotPassword() {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const { error: resetError } = await supabase.auth.resetPasswordForEmail(email.trim(), {
                redirectTo: `${window.location.origin}/reset-password`,
            });

            if (resetError) throw resetError;

            setSuccess(true);
        } catch (err: any) {
            setError(err.message || 'Failed to send reset email');
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
                    {/* Back Button */}
                    <Link
                        to="/login"
                        className="inline-flex items-center gap-2 text-sm font-medium text-text-secondary hover:text-text-primary transition-colors mb-6"
                    >
                        <ArrowLeft size={16} />
                        Back to login
                    </Link>

                    {/* Header */}
                    <div className="text-center mb-8">
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: 'spring', stiffness: 200, delay: 0.1 }}
                            className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-primary-600 text-white mb-4 shadow-lg shadow-primary/20"
                        >
                            <KeyRound size={24} />
                        </motion.div>
                        <motion.h1
                            variants={fadeInVariants}
                            className="text-2xl font-bold text-text-primary mb-2"
                        >
                            Reset Password
                        </motion.h1>
                        <motion.p
                            variants={fadeInVariants}
                            className="text-text-secondary text-sm"
                        >
                            Enter your email to receive a password reset link
                        </motion.p>
                    </div>

                    {/* Success Message */}
                    <AnimatePresence mode="wait">
                        {success && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="mb-6 p-4 bg-success-light border border-success/20 rounded-lg flex items-start gap-3"
                            >
                                <CheckCircle size={18} className="text-success shrink-0 mt-0.5" />
                                <div>
                                    <p className="text-sm font-semibold text-success-dark">Check your email!</p>
                                    <p className="text-xs text-success-dark/80 mt-1">
                                        We've sent a password reset link to {email}
                                    </p>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

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
                    {!success && (
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
                                        autoFocus
                                    />
                                </div>
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
                                        Sending...
                                    </span>
                                ) : (
                                    'Send Reset Link'
                                )}
                            </button>
                        </form>
                    )}

                    {/* Success Actions */}
                    {success && (
                        <div className="space-y-3">
                            <Link
                                to="/login"
                                className="btn-primary w-full text-center"
                            >
                                Return to Login
                            </Link>
                            <button
                                onClick={() => {
                                    setSuccess(false);
                                    setEmail('');
                                }}
                                className="btn-ghost w-full"
                            >
                                Send to different email
                            </button>
                        </div>
                    )}

                    {/* Help Text */}
                    {!success && (
                        <div className="mt-6 text-center">
                            <p className="text-xs text-text-tertiary">
                                Remember your password?{' '}
                                <Link to="/login" className="text-primary font-medium hover:text-primary-600 transition-colors">
                                    Sign in
                                </Link>
                            </p>
                        </div>
                    )}
                </div>
            </motion.div>
        </div>
    );
}
