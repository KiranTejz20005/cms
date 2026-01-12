import { Search, Bell, HelpCircle, Command, UserPlus, Video, FileText, Award, AlertCircle, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect, useRef } from 'react';
import { slideVariants, tapScale } from '../lib/animations';

interface Notification {
    id: string;
    type: 'user' | 'content' | 'system' | 'achievement';
    title: string;
    message: string;
    time: string;
    read: boolean;
    icon: 'UserPlus' | 'Video' | 'FileText' | 'Award' | 'AlertCircle' | 'CheckCircle';
}

const DUMMY_NOTIFICATIONS: Notification[] = [
    { id: '1', type: 'user', title: 'New User Registered', message: 'Grace Adams joined as a Student', time: '2 min ago', read: false, icon: 'UserPlus' },
    { id: '2', type: 'user', title: 'New User Registered', message: 'Sebastian Green joined as a Student', time: '15 min ago', read: false, icon: 'UserPlus' },
    { id: '3', type: 'content', title: 'New Content Published', message: 'Science Quiz Master was published', time: '1 hour ago', read: false, icon: 'Video' },
    { id: '4', type: 'user', title: 'New User Registered', message: 'Scarlett Scott joined as a Student', time: '2 hours ago', read: true, icon: 'UserPlus' },
    { id: '5', type: 'content', title: 'Content Updated', message: 'Planets of the Solar System course updated', time: '3 hours ago', read: true, icon: 'FileText' },
    { id: '6', type: 'user', title: 'New Teacher Added', message: 'Charlotte Clark joined as History Teacher', time: '5 hours ago', read: true, icon: 'UserPlus' },
    { id: '7', type: 'achievement', title: 'Milestone Reached', message: '100+ students enrolled this month!', time: '6 hours ago', read: true, icon: 'Award' },
    { id: '8', type: 'user', title: 'New Content Creator', message: 'Evelyn Allen joined as Interactive Designer', time: '8 hours ago', read: true, icon: 'UserPlus' },
    { id: '9', type: 'content', title: 'New Video Uploaded', message: 'Dance Moves for Kids added to Creative Arts', time: '10 hours ago', read: true, icon: 'Video' },
    { id: '10', type: 'system', title: 'System Update', message: 'Platform maintenance scheduled for tonight', time: '12 hours ago', read: true, icon: 'AlertCircle' },
    { id: '11', type: 'user', title: 'New Parent Registered', message: 'Zoey Carter joined as a Parent', time: '1 day ago', read: true, icon: 'UserPlus' },
    { id: '12', type: 'content', title: 'Course Completed', message: '50 students completed Ocean Life Exploration', time: '1 day ago', read: true, icon: 'CheckCircle' },
    { id: '13', type: 'user', title: 'New Moderator Added', message: 'Daniel Wright joined as Support Moderator', time: '2 days ago', read: true, icon: 'UserPlus' },
    { id: '14', type: 'content', title: 'New Podcast Released', message: 'Musical Instruments podcast now available', time: '2 days ago', read: true, icon: 'Video' },
    { id: '15', type: 'user', title: 'New Admin Added', message: 'Lisa Anderson joined as Admin', time: '3 days ago', read: true, icon: 'UserPlus' },
];

export function Header() {
    const [searchFocused, setSearchFocused] = useState(false);
    const [showNotifications, setShowNotifications] = useState(false);
    const [notifications, setNotifications] = useState<Notification[]>(DUMMY_NOTIFICATIONS);
    const notificationRef = useRef<HTMLDivElement>(null);

    const unreadCount = notifications.filter(n => !n.read).length;

    // Keyboard shortcut for search (Cmd/Ctrl + K)
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                const searchInput = document.getElementById('global-search') as HTMLInputElement;
                searchInput?.focus();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    // Close notifications when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
                setShowNotifications(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const markAsRead = (id: string) => {
        setNotifications(notifications.map(n =>
            n.id === id ? { ...n, read: true } : n
        ));
    };

    const markAllAsRead = () => {
        setNotifications(notifications.map(n => ({ ...n, read: true })));
    };

    const getIcon = (iconName: string) => {
        const icons = {
            UserPlus: <UserPlus size={18} />,
            Video: <Video size={18} />,
            FileText: <FileText size={18} />,
            Award: <Award size={18} />,
            AlertCircle: <AlertCircle size={18} />,
            CheckCircle: <CheckCircle size={18} />,
        };
        return icons[iconName as keyof typeof icons] || <Bell size={18} />;
    };

    const getIconColor = (type: string) => {
        const colors = {
            user: 'bg-blue-100 text-blue-600',
            content: 'bg-purple-100 text-purple-600',
            system: 'bg-orange-100 text-orange-600',
            achievement: 'bg-green-100 text-green-600',
        };
        return colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-600';
    };

    return (
        <motion.header
            variants={slideVariants.down}
            initial="hidden"
            animate="visible"
            className="h-16 bg-surface/95 backdrop-blur-md border-b border-border px-4 sm:px-6 lg:px-8 flex items-center justify-between sticky top-0 z-30 shadow-sm"
        >
            {/* Search */}
            <div className="flex items-center flex-1 max-w-2xl">
                <div className="relative w-full group">
                    <Search
                        className={clsx(
                            "absolute left-3 top-1/2 -translate-y-1/2 transition-colors duration-200",
                            searchFocused ? "text-primary" : "text-text-tertiary"
                        )}
                        size={18}
                        aria-hidden="true"
                    />
                    <input
                        id="global-search"
                        type="text"
                        placeholder="Search content, users, analytics..."
                        onFocus={() => setSearchFocused(true)}
                        onBlur={() => setSearchFocused(false)}
                        className="w-full pl-10 pr-20 py-2.5 bg-background border border-border rounded-lg text-sm transition-all duration-200 placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary focus:bg-surface"
                        aria-label="Global search"
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 hidden sm:flex items-center gap-1">
                        <kbd className="px-1.5 py-0.5 text-[10px] font-mono font-medium text-text-tertiary bg-background-secondary border border-border rounded">
                            <Command size={10} className="inline" />
                        </kbd>
                        <kbd className="px-1.5 py-0.5 text-[10px] font-mono font-medium text-text-tertiary bg-background-secondary border border-border rounded">
                            K
                        </kbd>
                    </div>
                </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 ml-4">
                {/* Notifications */}
                <div className="relative" ref={notificationRef}>
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={tapScale}
                        onClick={() => setShowNotifications(!showNotifications)}
                        className="relative p-2.5 text-text-secondary hover:text-text-primary transition-colors hover:bg-background-secondary rounded-lg group"
                        aria-label="Notifications"
                    >
                        <Bell size={20} />
                        {unreadCount > 0 && (
                            <motion.span
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className="absolute top-1.5 right-1.5 min-w-[18px] h-[18px] bg-error text-white text-[10px] font-bold rounded-full flex items-center justify-center ring-2 ring-surface"
                            >
                                {unreadCount}
                            </motion.span>
                        )}
                        {/* Tooltip */}
                        <span className="absolute right-0 top-full mt-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap transition-opacity">
                            Notifications
                        </span>
                    </motion.button>

                    {/* Notifications Dropdown */}
                    <AnimatePresence>
                        {showNotifications && (
                            <motion.div
                                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                transition={{ duration: 0.2 }}
                                className="absolute right-0 top-full mt-2 w-96 bg-surface border border-border rounded-xl shadow-2xl overflow-hidden z-50"
                            >
                                {/* Header */}
                                <div className="p-4 border-b border-border bg-background-secondary flex items-center justify-between">
                                    <div>
                                        <h3 className="font-bold text-text-primary">Notifications</h3>
                                        <p className="text-xs text-text-tertiary mt-0.5">
                                            {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}
                                        </p>
                                    </div>
                                    {unreadCount > 0 && (
                                        <button
                                            onClick={markAllAsRead}
                                            className="text-xs text-primary hover:text-primary-600 font-medium transition-colors"
                                        >
                                            Mark all read
                                        </button>
                                    )}
                                </div>

                                {/* Notifications List */}
                                <div className="max-h-[400px] overflow-y-auto">
                                    {notifications.length === 0 ? (
                                        <div className="p-8 text-center text-text-tertiary">
                                            <Bell size={32} className="mx-auto mb-2 opacity-50" />
                                            <p className="text-sm">No notifications</p>
                                        </div>
                                    ) : (
                                        notifications.map((notification) => (
                                            <motion.div
                                                key={notification.id}
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                className={clsx(
                                                    "p-4 border-b border-border hover:bg-background-secondary transition-colors cursor-pointer group",
                                                    !notification.read && "bg-primary-50/30"
                                                )}
                                                onClick={() => markAsRead(notification.id)}
                                            >
                                                <div className="flex gap-3">
                                                    <div className={clsx("w-10 h-10 rounded-full flex items-center justify-center shrink-0", getIconColor(notification.type))}>
                                                        {getIcon(notification.icon)}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-start justify-between gap-2">
                                                            <p className="text-sm font-semibold text-text-primary">
                                                                {notification.title}
                                                            </p>
                                                            {!notification.read && (
                                                                <span className="w-2 h-2 bg-primary rounded-full shrink-0 mt-1.5" />
                                                            )}
                                                        </div>
                                                        <p className="text-xs text-text-secondary mt-0.5 line-clamp-2">
                                                            {notification.message}
                                                        </p>
                                                        <p className="text-xs text-text-tertiary mt-1">
                                                            {notification.time}
                                                        </p>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        ))
                                    )}
                                </div>

                                {/* Footer */}
                                <div className="p-3 border-t border-border bg-background-secondary text-center">
                                    <button className="text-xs text-primary hover:text-primary-600 font-medium transition-colors">
                                        View all notifications
                                    </button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Help */}
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={tapScale}
                    className="p-2.5 text-text-secondary hover:text-text-primary transition-colors hover:bg-background-secondary rounded-lg group relative"
                    aria-label="Help center"
                >
                    <HelpCircle size={20} />
                    {/* Tooltip */}
                    <span className="absolute right-0 top-full mt-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap transition-opacity">
                        Help Center
                    </span>
                </motion.button>
            </div>
        </motion.header>
    );
}

// Helper for clsx (inline to avoid import)
function clsx(...classes: (string | boolean | undefined)[]) {
    return classes.filter(Boolean).join(' ');
}
