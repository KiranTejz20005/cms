import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, Settings, LogOut, ChevronLeft, ChevronRight, Layers, PlaySquare, Map, Trophy, BarChart2, X, Menu } from 'lucide-react';
import clsx from 'clsx';
import { useConfig } from '../context/ConfigContext';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { slideVariants, tapScale } from '../lib/animations';

interface SidebarProps {
    collapsed: boolean;
    setCollapsed: (v: boolean) => void;
}

export function Sidebar({ collapsed, setCollapsed }: SidebarProps) {
    const { platformName } = useConfig();
    const { signOut, user, role } = useAuth();
    const location = useLocation();
    const [mobileOpen, setMobileOpen] = useState(false);

    // Close mobile menu on route change
    useEffect(() => {
        setMobileOpen(false);
    }, [location.pathname]);

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

    const SidebarContent = () => (
        <>
            {/* Logo Area */}
            <div className="h-16 flex items-center px-6 border-b border-border shrink-0">
                <div className="w-9 h-9 bg-gradient-to-br from-primary to-primary-600 rounded-lg shrink-0 shadow-sm" />
                <motion.span
                    initial={false}
                    animate={{ opacity: collapsed ? 0 : 1, width: collapsed ? 0 : 'auto' }}
                    transition={{ duration: 0.2 }}
                    className={clsx("ml-3 font-header font-bold text-xl text-text-primary overflow-hidden whitespace-nowrap", collapsed && "hidden")}
                >
                    {platformName}
                </motion.span>
            </div>

            {/* Nav Items */}
            <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto scrollbar-hide">
                {navItems.map((item, idx) => {
                    const isActive = location.pathname === item.path;
                    return (
                        <motion.div
                            key={item.label}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: idx * 0.03, duration: 0.2 }}
                        >
                            <Link
                                to={item.path}
                                className={clsx(
                                    "relative flex items-center px-3 py-2.5 rounded-lg transition-all duration-200 group",
                                    isActive
                                        ? "bg-primary text-white shadow-sm"
                                        : "text-text-secondary hover:bg-background-secondary hover:text-text-primary"
                                )}
                                aria-current={isActive ? 'page' : undefined}
                            >
                                {isActive && (
                                    <motion.div
                                        layoutId="activeNav"
                                        className="absolute inset-0 bg-primary rounded-lg"
                                        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                                    />
                                )}
                                <item.icon
                                    size={20}
                                    className={clsx("shrink-0 relative z-10", isActive && "text-white")}
                                    aria-hidden="true"
                                />
                                <motion.span
                                    initial={false}
                                    animate={{ opacity: collapsed ? 0 : 1, width: collapsed ? 0 : 'auto' }}
                                    transition={{ duration: 0.2 }}
                                    className={clsx("ml-3 font-medium text-sm overflow-hidden whitespace-nowrap relative z-10", collapsed && "hidden")}
                                >
                                    {item.label}
                                </motion.span>

                                {/* Tooltip for collapsed state */}
                                {collapsed && (
                                    <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50 transition-opacity">
                                        {item.label}
                                    </div>
                                )}
                            </Link>
                        </motion.div>
                    );
                })}
            </nav>

            {/* User Info */}
            <div className="p-4 border-t border-border shrink-0">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 shrink-0 flex items-center justify-center font-bold text-white shadow-sm">
                        {user?.email?.substring(0, 2).toUpperCase() || 'U'}
                    </div>
                    <motion.div
                        initial={false}
                        animate={{ opacity: collapsed ? 0 : 1, width: collapsed ? 0 : 'auto' }}
                        transition={{ duration: 0.2 }}
                        className={clsx("flex-1 min-w-0", collapsed && "hidden")}
                    >
                        <p className="text-sm font-semibold text-text-primary truncate">
                            {user?.email?.split('@')[0] || 'User'}
                        </p>
                        <p className="text-xs text-text-secondary truncate capitalize">
                            {role || 'Guest'}
                        </p>
                    </motion.div>
                    <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={tapScale}
                        onClick={() => signOut()}
                        className={clsx("text-text-tertiary hover:text-error transition-colors", collapsed && "hidden")}
                        title="Sign Out"
                        aria-label="Sign out"
                    >
                        <LogOut size={18} />
                    </motion.button>
                </div>
            </div>
        </>
    );

    return (
        <>
            {/* Mobile Menu Button */}
            <motion.button
                whileTap={tapScale}
                onClick={() => setMobileOpen(true)}
                className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-surface rounded-lg shadow-md border border-border text-text-primary"
                aria-label="Open menu"
            >
                <Menu size={20} />
            </motion.button>

            {/* Mobile Overlay */}
            <AnimatePresence>
                {mobileOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setMobileOpen(false)}
                        className="lg:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
                        aria-hidden="true"
                    />
                )}
            </AnimatePresence>

            {/* Desktop Sidebar */}
            <motion.aside
                initial={{ x: -256 }}
                animate={{ x: 0 }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                className={clsx(
                    "hidden lg:flex h-screen bg-surface border-r border-border transition-all duration-300 flex-col relative z-20",
                    collapsed ? "w-20" : "w-64"
                )}
            >
                <SidebarContent />

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
                            <SidebarContent />
                        </div>
                    </motion.aside>
                )}
            </AnimatePresence>
        </>
    );
}
