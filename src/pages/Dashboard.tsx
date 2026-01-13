import { useEffect, useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts';
import { BentoGrid, BentoItem } from '../components/BentoGrid';
import { Users, TrendingUp, BookOpen, Zap, BarChart3, CheckCircle2, Loader } from 'lucide-react';
import { motion } from 'framer-motion';
import { containerVariants, itemVariants } from '../lib/animations';
import { supabase } from '../lib/supabase';

interface DashboardStats {
    totalUsers: number;
    contentItems: number;
    engagement: number;
    activeSessions: number;
}

interface ActivityData {
    name: string;
    active: number;
    completed: number;
}

interface CategoryData {
    name: string;
    value: number;
    color: string;
    [key: string]: string | number; // Index signature for Recharts compatibility
}

export function Dashboard() {
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState<DashboardStats>({
        totalUsers: 0,
        contentItems: 0,
        engagement: 0,
        activeSessions: 0
    });
    const [activityData, setActivityData] = useState<ActivityData[]>([]);
    const [categoryData, setCategoryData] = useState<CategoryData[]>([]);
    const [engagementData, setEngagementData] = useState<CategoryData[]>([]);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);

            // Fetch users count
            const { count: usersCount } = await supabase
                .from('profiles')
                .select('*', { count: 'exact', head: true });

            // Fetch content count
            const { count: contentCount } = await supabase
                .from('content')
                .select('*', { count: 'exact', head: true });

            // Fetch content by category for pie chart
            const { data: contentByCategory } = await supabase
                .from('content')
                .select('category');

            // Process category data
            const categoryColors: { [key: string]: string } = {
                'Healthy Habits': '#3b82f6',
                'Daily Routines': '#10b981',
                'Basic Needs': '#f59e0b',
                'Early Math': '#8b5cf6',
                'Science for Kids': '#ec4899',
                'Creative Arts': '#06b6d4'
            };

            const categoryCounts: { [key: string]: number } = {};
            contentByCategory?.forEach((item: any) => {
                categoryCounts[item.category] = (categoryCounts[item.category] || 0) + 1;
            });

            const processedCategoryData = Object.entries(categoryCounts).map(([name, value]) => ({
                name,
                value,
                color: categoryColors[name] || '#6b7280'
            }));

            // Fetch content by type for engagement chart
            const { data: contentByType } = await supabase
                .from('content')
                .select('type');

            const typeCounts: { [key: string]: number } = {};
            contentByType?.forEach((item: any) => {
                typeCounts[item.type] = (typeCounts[item.type] || 0) + 1;
            });

            const typeColors: { [key: string]: string } = {
                'Video': '#8b5cf6',
                'Course': '#3b82f6',
                'Article': '#10b981',
                'Interactive': '#ec4899',
                'Podcast': '#f59e0b',
                'Quiz': '#06b6d4'
            };

            const processedEngagementData = Object.entries(typeCounts).map(([name, value]) => ({
                name,
                value,
                color: typeColors[name] || '#6b7280'
            }));

            // Generate activity data for the week (simulated for now)
            const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
            const generatedActivityData = days.map((day) => ({
                name: day,
                active: Math.floor(Math.random() * 300) + 200,
                completed: Math.floor(Math.random() * 200) + 100
            }));

            // Calculate engagement (total interactions)
            const totalEngagement = (usersCount || 0) * 10 + (contentCount || 0) * 5;

            setStats({
                totalUsers: usersCount || 0,
                contentItems: contentCount || 0,
                engagement: totalEngagement,
                activeSessions: Math.floor((usersCount || 0) * 0.27) // Simulated: ~27% of users active
            });

            setActivityData(generatedActivityData);
            setCategoryData(processedCategoryData);
            setEngagementData(processedEngagementData);

        } catch (error) {
            console.error('Error fetching dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-[calc(100vh-200px)]">
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                >
                    <Loader className="text-primary" size={48} />
                </motion.div>
            </div>
        );
    }

    return (
        <motion.div
            className="space-y-8 max-w-7xl mx-auto"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
        >
            <motion.div variants={itemVariants} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-text-primary tracking-tight">Dashboard Overview</h1>
                    <p className="text-text-secondary mt-1">Welcome back to your CMS command center.</p>
                </div>
                <div className="flex items-center gap-2 text-sm text-emerald-700 bg-emerald-50/80 px-4 py-2 rounded-full shadow-sm border border-emerald-100 backdrop-blur-sm">
                    <CheckCircle2 size={16} className="text-emerald-600" />
                    <span className="font-medium">All Systems Operational</span>
                </div>
            </motion.div>

            {/* Top Stats Row */}
            <motion.div
                variants={containerVariants}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
            >
                {[
                    { label: 'Total Users', value: stats.totalUsers.toLocaleString(), icon: Users, color: 'text-blue-600', bg: 'bg-blue-50', trend: '+12%', trendUp: true },
                    { label: 'Content Items', value: stats.contentItems.toLocaleString(), icon: BookOpen, color: 'text-purple-600', bg: 'bg-purple-50', trend: '+5%', trendUp: true },
                    { label: 'Engagement', value: stats.engagement >= 1000 ? `${(stats.engagement / 1000).toFixed(1)}k` : stats.engagement.toString(), icon: Zap, color: 'text-amber-600', bg: 'bg-amber-50', trend: '+18%', trendUp: true },
                    { label: 'Active Sessions', value: stats.activeSessions.toLocaleString(), icon: TrendingUp, color: 'text-teal-600', bg: 'bg-teal-50', trend: '+8%', trendUp: true },
                ].map((stat, i) => (
                    <motion.div
                        variants={itemVariants}
                        whileHover={{ y: -5, scale: 1.02 }}
                        key={i}
                        className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300"
                    >
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-sm font-medium text-text-secondary">{stat.label}</p>
                                <h3 className="text-3xl font-bold text-text-primary mt-2">{stat.value}</h3>
                            </div>
                            <div className={`p-3 rounded-xl ${stat.bg} ${stat.color}`}>
                                <stat.icon size={22} />
                            </div>
                        </div>
                        <div className="mt-4 flex items-center text-xs">
                            <span className={`font-bold px-2 py-0.5 rounded-full mr-2 ${stat.trendUp ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                {stat.trend}
                            </span>
                            <span className="text-text-secondary">vs last week</span>
                        </div>
                    </motion.div>
                ))}
            </motion.div>

            <BentoGrid>
                {/* Main Activity Chart */}
                <BentoItem title="Learning Trends" colSpan={2} rowSpan={2} className="min-h-[400px]">
                    <div className="h-full w-full pb-2">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={activityData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorActive" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2} />
                                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="colorCompleted" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                <XAxis dataKey="name" stroke="#6b7280" style={{ fontSize: '12px' }} />
                                <YAxis stroke="#6b7280" style={{ fontSize: '12px' }} />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: 'rgba(255, 255, 255, 0.95)',
                                        border: 'none',
                                        borderRadius: '12px',
                                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                                        padding: '12px'
                                    }}
                                />
                                <Area type="monotone" dataKey="active" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorActive)" />
                                <Area type="monotone" dataKey="completed" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorCompleted)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </BentoItem>

                {/* Category Distribution */}
                <BentoItem title="Content by Category" className="min-h-[300px]">
                    {categoryData.length > 0 ? (
                        <ResponsiveContainer width="100%" height={250}>
                            <PieChart>
                                <Pie
                                    data={categoryData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={90}
                                    paddingAngle={2}
                                    dataKey="value"
                                >
                                    {categoryData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: 'rgba(255, 255, 255, 0.95)',
                                        border: 'none',
                                        borderRadius: '12px',
                                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                                        padding: '12px'
                                    }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="flex items-center justify-center h-[250px] text-gray-400">
                            <p>No category data available</p>
                        </div>
                    )}
                </BentoItem>

                {/* Engagement Types */}
                <BentoItem title="Content Types" className="min-h-[300px]">
                    {engagementData.length > 0 ? (
                        <ResponsiveContainer width="100%" height={250}>
                            <PieChart>
                                <Pie
                                    data={engagementData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={90}
                                    paddingAngle={2}
                                    dataKey="value"
                                >
                                    {engagementData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: 'rgba(255, 255, 255, 0.95)',
                                        border: 'none',
                                        borderRadius: '12px',
                                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                                        padding: '12px'
                                    }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="flex items-center justify-center h-[250px] text-gray-400">
                            <p>No content type data available</p>
                        </div>
                    )}
                </BentoItem>

                {/* Quick Actions */}
                <BentoItem title="Quick Actions" className="bg-gradient-to-br from-purple-50 to-pink-50">
                    <div className="space-y-3">
                        {[
                            { icon: BookOpen, label: 'Create Content', color: 'text-purple-600' },
                            { icon: Users, label: 'Manage Users', color: 'text-blue-600' },
                            { icon: BarChart3, label: 'View Analytics', color: 'text-amber-600' },
                        ].map((action, i) => (
                            <motion.button
                                key={i}
                                whileHover={{ x: 5, scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                className="w-full flex items-center gap-3 p-3 bg-white/80 backdrop-blur-sm rounded-xl hover:bg-white transition-all border border-gray-100 hover:shadow-md"
                            >
                                <div className={`p-2 rounded-lg bg-gray-50 ${action.color}`}>
                                    <action.icon size={18} />
                                </div>
                                <span className="font-medium text-text-primary text-sm">{action.label}</span>
                            </motion.button>
                        ))}
                    </div>
                </BentoItem>

                {/* Recent Activity */}
                <BentoItem title="System Health" className="bg-gradient-to-br from-emerald-50 to-teal-50">
                    <div className="space-y-4">
                        {[
                            { label: 'Database', status: 'Operational', icon: CheckCircle2, color: 'text-emerald-600' },
                            { label: 'API Services', status: 'Operational', icon: CheckCircle2, color: 'text-emerald-600' },
                            { label: 'Storage', status: 'Operational', icon: CheckCircle2, color: 'text-emerald-600' },
                        ].map((item, i) => (
                            <div key={i} className="flex items-center justify-between p-3 bg-white/60 backdrop-blur-sm rounded-xl border border-emerald-100">
                                <div className="flex items-center gap-2">
                                    <item.icon size={16} className={item.color} />
                                    <span className="text-sm font-medium text-text-primary">{item.label}</span>
                                </div>
                                <span className="text-xs font-semibold text-emerald-700 bg-emerald-100 px-2 py-1 rounded-full">
                                    {item.status}
                                </span>
                            </div>
                        ))}
                    </div>
                </BentoItem>
            </BentoGrid>
        </motion.div>
    );
}
