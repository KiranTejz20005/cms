import { useState } from 'react';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { motion } from 'framer-motion';
import { TrendingUp, Users, BookOpen, Award, Download } from 'lucide-react';

const monthlyData = [
    { month: 'Jan', users: 400, engagement: 240, completions: 180 },
    { month: 'Feb', users: 520, engagement: 320, completions: 250 },
    { month: 'Mar', users: 680, engagement: 480, completions: 380 },
    { month: 'Apr', users: 750, engagement: 550, completions: 420 },
    { month: 'May', users: 890, engagement: 720, completions: 580 },
    { month: 'Jun', users: 1040, engagement: 850, completions: 720 },
];

const categoryPerformance = [
    { name: 'Mathematics', value: 850, users: 1240 },
    { name: 'Science', value: 720, users: 980 },
    { name: 'English', value: 680, users: 890 },
    { name: 'Coding', value: 540, users: 650 },
    { name: 'Arts', value: 420, users: 520 },
];

const dailyEngagement = [
    { day: 'Mon', active: 450, inactive: 320 },
    { day: 'Tue', active: 520, inactive: 280 },
    { day: 'Wed', active: 680, inactive: 220 },
    { day: 'Thu', active: 580, inactive: 240 },
    { day: 'Fri', active: 750, inactive: 180 },
    { day: 'Sat', active: 320, inactive: 450 },
    { day: 'Sun', active: 380, inactive: 420 },
];

const colors = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'];

export function AnalyticsPage() {
    const [dateRange, setDateRange] = useState('month');

    return (
        <div className="space-y-6">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-2xl border border-gray-200 p-6"
            >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
                        <p className="text-gray-600 mt-1">Track platform performance and user engagement</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <select
                            value={dateRange}
                            onChange={(e) => setDateRange(e.target.value)}
                            className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="week">Last 7 Days</option>
                            <option value="month">Last Month</option>
                            <option value="quarter">Last Quarter</option>
                            <option value="year">Last Year</option>
                        </select>
                        <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                            <Download size={20} className="text-gray-600" />
                        </button>
                    </div>
                </div>
            </motion.div>

            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { icon: Users, label: 'Total Users', value: '8,240', change: '+12.5%', color: 'text-blue-600', bg: 'bg-blue-50' },
                    { icon: BookOpen, label: 'Content Views', value: '48.2k', change: '+8.2%', color: 'text-green-600', bg: 'bg-green-50' },
                    { icon: Award, label: 'Completion Rate', value: '72.4%', change: '+5.1%', color: 'text-purple-600', bg: 'bg-purple-50' },
                    { icon: TrendingUp, label: 'Avg. Session', value: '24 min', change: '+3.2%', color: 'text-amber-600', bg: 'bg-amber-50' },
                ].map((metric, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: i * 0.1 }}
                        whileHover={{ y: -4 }}
                        className="bg-white rounded-2xl border border-gray-200 p-6"
                    >
                        <div className="flex items-start justify-between mb-4">
                            <div className={`p-3 rounded-xl ${metric.bg} ${metric.color}`}>
                                <metric.icon size={24} />
                            </div>
                            <span className="text-green-600 text-sm font-bold bg-green-50 px-2.5 py-1 rounded-full">
                                {metric.change}
                            </span>
                        </div>
                        <p className="text-gray-600 text-sm font-medium mb-1">{metric.label}</p>
                        <p className="text-2xl font-bold text-gray-900">{metric.value}</p>
                    </motion.div>
                ))}
            </div>

            {/* Charts Row 1 */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* User Growth */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="lg:col-span-2 bg-white rounded-2xl border border-gray-200 p-6"
                >
                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <TrendingUp size={20} className="text-blue-600" />
                        Growth Trends
                    </h3>
                    <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={monthlyData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                                <XAxis dataKey="month" stroke="#9ca3af" />
                                <YAxis stroke="#9ca3af" />
                                <Tooltip
                                    contentStyle={{
                                        borderRadius: '12px',
                                        border: 'none',
                                        boxShadow: '0 10px 25px -5px rgb(0 0 0 / 0.1)',
                                        backgroundColor: '#fff'
                                    }}
                                />
                                <Legend />
                                <Line
                                    type="monotone"
                                    dataKey="users"
                                    stroke="#3b82f6"
                                    strokeWidth={3}
                                    dot={{ fill: '#3b82f6', r: 5 }}
                                    activeDot={{ r: 7 }}
                                    name="New Users"
                                />
                                <Line
                                    type="monotone"
                                    dataKey="engagement"
                                    stroke="#10b981"
                                    strokeWidth={3}
                                    dot={{ fill: '#10b981', r: 5 }}
                                    activeDot={{ r: 7 }}
                                    name="Engagement"
                                />
                                <Line
                                    type="monotone"
                                    dataKey="completions"
                                    stroke="#f59e0b"
                                    strokeWidth={3}
                                    dot={{ fill: '#f59e0b', r: 5 }}
                                    activeDot={{ r: 7 }}
                                    name="Completions"
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </motion.div>

                {/* Category Performance */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-white rounded-2xl border border-gray-200 p-6"
                >
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Top Categories</h3>
                    <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={categoryPerformance}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    label={({ name, value }) => `${name}: ${value}`}
                                    outerRadius={100}
                                    fill="#8884d8"
                                    dataKey="value"
                                    animationDuration={800}
                                >
                                    {categoryPerformance.map((_, index) => (
                                        <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </motion.div>
            </div>

            {/* Daily Engagement */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white rounded-2xl border border-gray-200 p-6"
            >
                <h3 className="text-lg font-bold text-gray-900 mb-4">Daily Engagement</h3>
                <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={dailyEngagement}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                            <XAxis dataKey="day" stroke="#9ca3af" />
                            <YAxis stroke="#9ca3af" />
                            <Tooltip
                                contentStyle={{
                                    borderRadius: '12px',
                                    border: 'none',
                                    boxShadow: '0 10px 25px -5px rgb(0 0 0 / 0.1)',
                                    backgroundColor: '#fff'
                                }}
                            />
                            <Legend />
                            <Bar
                                dataKey="active"
                                fill="#3b82f6"
                                radius={[8, 8, 0, 0]}
                                name="Active Users"
                            />
                            <Bar
                                dataKey="inactive"
                                fill="#f3f4f6"
                                radius={[8, 8, 0, 0]}
                                name="Inactive Users"
                            />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </motion.div>

            {/* Category Breakdown Table */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-white rounded-2xl border border-gray-200 overflow-hidden"
            >
                <div className="p-6 border-b border-gray-200">
                    <h3 className="text-lg font-bold text-gray-900">Category Performance Breakdown</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50/50 border-b border-gray-200">
                                <th className="px-6 py-4 text-sm font-bold text-gray-700">Category</th>
                                <th className="px-6 py-4 text-sm font-bold text-gray-700">Engagement Score</th>
                                <th className="px-6 py-4 text-sm font-bold text-gray-700">Active Users</th>
                                <th className="px-6 py-4 text-sm font-bold text-gray-700">Growth</th>
                                <th className="px-6 py-4 text-sm font-bold text-gray-700">Trend</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {categoryPerformance.map((cat, i) => (
                                <motion.tr
                                    key={i}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.4 + i * 0.1 }}
                                    className="hover:bg-gray-50/50 transition-colors"
                                >
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div
                                                className="w-3 h-3 rounded-full"
                                                style={{ backgroundColor: colors[i % colors.length] }}
                                            />
                                            <span className="font-semibold text-gray-900">{cat.name}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${(cat.value / 850) * 100}%` }}
                                                transition={{ delay: 0.5 + i * 0.1, duration: 0.8 }}
                                                className="h-full rounded-full"
                                                style={{ backgroundColor: colors[i % colors.length] }}
                                            />
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-gray-900 font-semibold">{cat.users.toLocaleString()}</td>
                                    <td className="px-6 py-4">
                                        <span className="text-green-600 font-bold bg-green-50 px-3 py-1 rounded-full text-sm">
                                            +{Math.floor(Math.random() * 30 + 5)}%
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="text-xl">📈</span>
                                    </td>
                                </motion.tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </motion.div>
        </div>
    );
}
