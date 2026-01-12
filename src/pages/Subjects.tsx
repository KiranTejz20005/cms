import { useState } from 'react';
import { ChevronDown, Video, FileText, Youtube, Star, Layers, Activity, Sparkles, BookOpen } from 'lucide-react';
import { motion } from 'framer-motion';
import { containerVariants, itemVariants } from '../lib/animations';

// Mock data spanning multiple categories
const allRecords = [
    { id: 1, category: 'Healthy Habits', type: 'Video', title: 'Brushing Teeth Fun', likes: 120, comments: 45, status: 'Active' },
    { id: 2, category: 'Healthy Habits', type: 'YT Video', title: 'The Potty Song', likes: 850, comments: 120, status: 'Active' },
    { id: 3, category: 'Healthy Habits', type: 'Content', title: 'Vegetables Guide', likes: 340, comments: 22, status: 'Draft' },
    { id: 4, category: 'Daily Routines', type: 'Video', title: 'Counting 1-10', likes: 560, comments: 67, status: 'Active' },
    { id: 5, category: 'Daily Routines', type: 'YT Video', title: 'Bedtime Story', likes: 125, comments: 12, status: 'Active' },
    { id: 6, category: 'Daily Routines', type: 'YT Video', title: 'Morning Stretch', likes: 89, comments: 5, status: 'Archived' },
    { id: 7, category: 'Science Fun', type: 'Content', title: 'Planets of the Solar System', likes: 450, comments: 34, status: 'Active' },
    { id: 8, category: 'Science Fun', type: 'Video', title: 'Dinosaur Types', likes: 210, comments: 15, status: 'Active' },
    { id: 9, category: 'Creative Arts', type: 'Content', title: 'Drawing Basics', likes: 300, comments: 40, status: 'Active' },
];

const categories = ['All', 'Healthy Habits', 'Daily Routines', 'Science Fun', 'Creative Arts'];

export function Subjects() {
    const [selectedCategory, setSelectedCategory] = useState('All');

    const filteredRecords = selectedCategory === 'All'
        ? allRecords
        : allRecords.filter(r => r.category === selectedCategory);

    return (
        <motion.div
            className="space-y-6"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
        >
            {/* Header Section */}
            <motion.div
                variants={itemVariants}
                className="bg-gradient-to-r from-blue-50 via-purple-50 to-pink-50 p-8 rounded-2xl border border-gray-200 shadow-sm"
            >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-purple-600 rounded-xl text-white">
                            <BookOpen size={28} />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Learning Paths</h1>
                            <p className="text-gray-600 mt-1">Structured curriculum across all subjects</p>
                        </div>
                    </div>
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="flex items-center justify-center gap-2 px-6 py-3 text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-lg transition-all shadow-lg"
                    >
                        <Sparkles size={18} />
                        + Create Learning Path
                    </motion.button>
                </div>

                {/* Category Tabs */}
                <div className="flex items-center gap-2 overflow-x-auto pb-2">
                    {categories.map((cat, idx) => (
                        <motion.button
                            key={cat}
                            onClick={() => setSelectedCategory(cat)}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: idx * 0.05 }}
                            whileHover={{ scale: 1.05 }}
                            className={`px-4 py-2.5 rounded-full text-sm font-semibold whitespace-nowrap transition-all ${selectedCategory === cat
                                ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                                : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                                }`}
                        >
                            {cat}
                        </motion.button>
                    ))}
                </div>
            </motion.div>

            {/* Table Section */}
            <motion.div
                variants={containerVariants}
                className="w-full bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden"
            >
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                                <th className="px-6 py-4 text-sm font-bold text-gray-700">Content</th>
                                <th className="px-6 py-4 text-sm font-bold text-gray-700">Category</th>
                                <th className="px-6 py-4 text-sm font-bold text-gray-700">Engagement</th>
                                <th className="px-6 py-4 text-sm font-bold text-gray-700">Status</th>
                                <th className="px-6 py-4 text-right text-sm font-bold text-gray-700">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filteredRecords.map((record) => (
                                <motion.tr
                                    variants={itemVariants}
                                    whileHover={{ backgroundColor: '#f9fafb' }}
                                    key={record.id}
                                    className="hover:bg-gray-50/50 transition-colors group cursor-pointer"
                                >
                                    <td className="px-6 py-4">
                                        <div className="flex items-start gap-4">
                                            <motion.div
                                                whileHover={{ scale: 1.1, rotate: 10 }}
                                                className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center flex-shrink-0 text-gray-600 group-hover:text-primary group-hover:from-blue-100 group-hover:to-purple-100 transition-all shadow-sm"
                                            >
                                                {record.type === 'Video' && <Video size={22} />}
                                                {record.type === 'YT Video' && <Youtube size={22} />}
                                                {record.type === 'Content' && <FileText size={22} />}
                                            </motion.div>
                                            <div>
                                                <h4 className="font-bold text-gray-900 group-hover:text-primary transition-colors text-sm">{record.title}</h4>
                                                <span className="text-xs text-gray-500 inline-block mt-1 bg-gray-100 px-2 py-1 rounded-full group-hover:bg-blue-100 group-hover:text-blue-700 transition-all">{record.type}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <Layers size={16} className="text-gray-400" />
                                            <span className="text-sm font-medium text-gray-700">{record.category}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-4 text-sm">
                                            <motion.span
                                                whileHover={{ scale: 1.1 }}
                                                className="flex items-center gap-1 text-yellow-600 font-semibold bg-yellow-50 px-3 py-1 rounded-full"
                                            >
                                                <Star size={14} fill="currentColor" /> {record.likes}
                                            </motion.span>
                                            <motion.span
                                                whileHover={{ scale: 1.1 }}
                                                className="flex items-center gap-1 text-blue-600 font-semibold bg-blue-50 px-3 py-1 rounded-full"
                                            >
                                                <Activity size={14} /> {record.comments}
                                            </motion.span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <motion.span
                                            whileHover={{ scale: 1.05 }}
                                            className={`px-3 py-1.5 rounded-full text-xs font-bold inline-block ${record.status === 'Active' ? 'bg-green-50 text-green-700' :
                                                record.status === 'Draft' ? 'bg-yellow-50 text-yellow-700' :
                                                    'bg-gray-100 text-gray-600'
                                                }`}
                                        >
                                            {record.status}
                                        </motion.span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <motion.button
                                            whileHover={{ rotate: 180 }}
                                            transition={{ duration: 0.3 }}
                                            className="text-gray-400 hover:text-primary p-2 rounded-full hover:bg-gray-100 transition-all"
                                        >
                                            <ChevronDown size={18} />
                                        </motion.button>
                                    </td>
                                </motion.tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </motion.div>
        </motion.div>
    );
}
