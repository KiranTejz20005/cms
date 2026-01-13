import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, Settings, LogOut, ChevronLeft, ChevronRight, Layers, PlaySquare, Map, Trophy, BarChart2, X } from 'lucide-react';
import clsx from 'clsx';
import { useConfig } from '../context/ConfigContext';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect, useRef } from 'react';
import { slideVariants, tapScale } from '../lib/animations';

interface SidebarProps {
    collapsed: boolean;
    setCollapsed: (v: boolean) => void;
}

interface SidebarContentProps {
    collapsed: boolean;
    platformName: string;
    navItems: Array<{ label: string; path: string; icon: any }>;
    location: any;
    user: any;
    role: string | null;
    signOut: () => Promise<void>;
}

// Move SidebarContent outside to avoid recreation on every render
function SidebarContent({ collapsed, platformName, navItems, location, user, role, signOut }: SidebarContentProps) {
    return (
        <>
            {/* Logo Area */}
            <div className="h-16 flex items-center px-6 border-b border-border shrink-0">
                <div className="w-9 h-9 bg-gradient-to-br from-primary to-primary-600 rounded-lg shrink-0 shadow-sm" />
                <AnimatePresence mode="wait">
                    {!collapsed && (
                        <motion.span
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -10 }}
                            transition={{ duration: 0.2 }}
                            className="ml-3 font-header font-bold text-xl text-text-primary whitespace-nowrap"
                        >
                            {platformName}
                        </motion.span>
                    )}
                </AnimatePresence>
            </div>

            {/* Navigation */}
            <nav className="flex-1 overflow-y-auto py-6 px-3 space-y-1">
                {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = location.pathname === item.path;
                    return (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={clsx(
                                "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group relative",
                                isActive
                                    ? "bg-primary text-white shadow-sm"
                                    : "text-text-secondary hover:bg-background-secondary hover:text-text-primary"
                            )}
                        >
                            <Icon
                                size={20}
                                className={clsx(
                                    "shrink-0 transition-transform group-hover:scale-110",
                                    isActive ? "text-white" : ""
                                )}
                            />
                            <AnimatePresence mode="wait">
                                {!collapsed && (
                                    <motion.span
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -10 }}
                                        transition={{ duration: 0.2 }}
                                        className="font-medium text-sm whitespace-nowrap"
                                    >
                                        {item.label}
                                    </motion.span>
                                )}
                            </AnimatePresence>
                            {isActive && (
                                <motion.div
                                    layoutId="activeTab"
                                    className="absolute inset-0 bg-primary rounded-lg -z-10"
                                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                />
                            )}
                        </Link>
                    );
                })}
            </nav>

            {/* User Section */}
            <div className="border-t border-border p-4 space-y-2 shrink-0">
                <div className={clsx("flex items-center gap-3", collapsed && "justify-center")}>
                    <div className="w-9 h-9 bg-gradient-to-br from-primary-100 to-primary-200 rounded-full flex items-center justify-center text-primary font-semibold shrink-0">
                        {user?.email?.[0]?.toUpperCase() || 'U'}
                    </div>
                    <AnimatePresence mode="wait">
                        {!collapsed && (
                            <motion.div
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -10 }}
                                transition={{ duration: 0.2 }}
                                className="flex-1 min-w-0"
                            >
                                <p className="text-sm font-medium text-text-primary truncate">
                                    {user?.email || 'User'}
                                </p>
                                <p className="text-xs text-text-tertiary capitalize">{role || 'user'}</p>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
                <motion.button
                    whileTap={tapScale}
                    onClick={signOut}
                    className={clsx(
                        "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-error hover:bg-error-light transition-colors",
                        collapsed && "justify-center"
                    )}
                    title="Sign Out"
                >
                    <LogOut size={18} />
                    <AnimatePresence mode="wait">
                        {!collapsed && (
                            <motion.span
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -10 }}
                                transition={{ duration: 0.2 }}
                                className="text-sm font-medium"
                            >
                                Sign Out
                            </motion.span>
                        )}
                    </AnimatePresence>
                </motion.button>
            </div>
        </>
    );
}

export function Sidebar({ collapsed, setCollapsed }: SidebarProps) {
    const { platformName } = useConfig();
    const { signOut, user, role } = useAuth();
    const location = useLocation();
    const [mobileOpen, setMobileOpen] = useState(false);
    const prevPathRef = useRef(location.pathname);

    // Close mobile menu on route change using ref to avoid direct setState in effect
    useEffect(() => {
        if (prevPathRef.current !== location.pathname) {
            prevPathRef.current = location.pathname;
            if (mobileOpen) {
                setMobileOpen(false);
            }
        }
    }, [location.pathname, mobileOpen]);

    // Close mobile menu on escape key
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') setMobileOpen(false);
        };
        window.addEventListener('keydown', handleEscape);
        return () => window.removeEventListener('keydown', handleEscape);
    }, []);

    const navItems = [
        { label: 'Home', path: '/', icon: LayoutDashboard },
        { label: 'Categories', path: '/categories', icon: Layers },
        { label: 'Byte Sized Learning', path: '/reels', icon: PlaySquare },
        { label: 'Learning Paths', path: '/learning-paths', icon: Map },
        { label: 'Challenges', path: '/challenges', icon: Trophy },
        { label: 'Users', path: '/users', icon: Users },
        { label: 'Report/Analytics', path: '/analytics', icon: BarChart2 },
        { label: 'Settings', path: '/settings', icon: Settings },
    ];

    return (
        <>
            {/* Desktop Sidebar */}
            <motion.aside
                animate={{ width: collapsed ? 80 : 256 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className={clsx(
                    "hidden lg:flex h-screen bg-surface border-r border-border transition-all duration-300 flex-col relative z-20",
                    collapsed ? "w-20" : "w-64"
                )}
            >
                <SidebarContent
                    collapsed={collapsed}
                    platformName={platformName}
                    navItems={navItems}
                    location={location}
                    user={user}
                    role={role}
                    signOut={signOut}
                />

                {/* Collapse Toggle */}
                <motion.button
                    onClick={() => setCollapsed(!collapsed)}
                    whileHover={{ scale: 1.1 }}
                    whileTap={tapScale}
                    className="absolute -right-3 top-20 bg-surface border border-border rounded-full p-1.5 shadow-sm text-text-secondary hover:text-primary hover:border-primary transition-colors"
                    aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
                >
                    {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
                </motion.button>
            </motion.aside>

            {/* Mobile Sidebar */}
            <AnimatePresence>
                {mobileOpen && (
                    <motion.aside
                        variants={slideVariants.left}
                        initial="hidden"
                        animate="visible"
                        exit="hidden"
                        className="lg:hidden fixed inset-y-0 left-0 w-64 bg-surface border-r border-border flex flex-col z-50"
                    >
                        <div className="flex items-center justify-between px-6 h-16 border-b border-border">
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 bg-gradient-to-br from-primary to-primary-600 rounded-lg shadow-sm" />
                                <span className="font-header font-bold text-xl text-text-primary">{platformName}</span>
                            </div>
                            <motion.button
                                whileTap={tapScale}
                                onClick={() => setMobileOpen(false)}
                                className="p-2 text-text-secondary hover:text-text-primary rounded-lg hover:bg-background-secondary transition-colors"
                                aria-label="Close menu"
                            >
                                <X size={20} />
                            </motion.button>
                        </div>
                        <div className="flex-1 overflow-hidden flex flex-col">
                            <SidebarContent
                                collapsed={false}
                                platformName={platformName}
                                navItems={navItems}
                                location={location}
                                user={user}
                                role={role}
                                signOut={signOut}
                            />
                        </div>
                    </motion.aside>
                )}
            </AnimatePresence>
        </>
    );
}
