import { useEffect, useState } from 'react';
import { Map, Plus, Video, FileText, BookOpen, Users, TrendingUp, MoreVertical, Edit, Trash2, Copy } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { containerVariants, itemVariants } from '../lib/animations';

interface LearningPath {
    id: string;
    title: string;
    category: string;
    contentType: 'Video' | 'YT Video' | 'Content';
    engagement: number;
    views: number;
    status: 'Active' | 'Draft';
}

const CATEGORIES = ['All', 'Healthy Habits', 'Daily Routines', 'Science Fun', 'Creative Arts', 'Early Math', 'Basic Needs'];

const DEMO_PATHS: LearningPath[] = [
    { id: '1', title: 'Brushing Teeth Fun', category: 'Healthy Habits', contentType: 'Video', engagement: 120, views: 45, status: 'Active' },
    { id: '2', title: 'The Potty Song', category: 'Healthy Habits', contentType: 'YT Video', engagement: 850, views: 120, status: 'Active' },
    { id: '3', title: 'Vegetables Guide', category: 'Healthy Habits', contentType: 'Content', engagement: 340, views: 22, status: 'Draft' },
    { id: '4', title: 'Morning Routine', category: 'Daily Routines', contentType: 'Video', engagement: 450, views: 78, status: 'Active' },
    { id: '5', title: 'Bedtime Stories', category: 'Daily Routines', contentType: 'Content', engagement: 620, views: 95, status: 'Active' },
    { id: '6', title: 'Solar System Tour', category: 'Science Fun', contentType: 'Video', engagement: 890, views: 156, status: 'Active' },
    { id: '7', title: 'Water Cycle Explained', category: 'Science Fun', contentType: 'YT Video', engagement: 720, views: 134, status: 'Active' },
    { id: '8', title: 'Drawing Animals', category: 'Creative Arts', contentType: 'Video', engagement: 540, views: 89, status: 'Active' },
    { id: '9', title: 'Music and Rhythm', category: 'Creative Arts', contentType: 'Content', engagement: 430, views: 67, status: 'Draft' },
    { id: '10', title: 'Counting with Fruits', category: 'Early Math', contentType: 'Video', engagement: 670, views: 112, status: 'Active' },
    { id: '11', title: 'Shapes and Colors', category: 'Early Math', contentType: 'YT Video', engagement: 580, views: 98, status: 'Active' },
    { id: '12', title: 'Why We Need Sleep', category: 'Basic Needs', contentType: 'Content', engagement: 390, views: 56, status: 'Active' },
];

export function LearningPaths() {
    const [paths, setPaths] = useState<LearningPath[]>(DEMO_PATHS);
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [showCreateModal, setShowCreateModal] = useState(false);

    const filteredPaths = selectedCategory === 'All'
        ? paths
        : paths.filter(p => p.category === selectedCategory);

    const getContentIcon = (type: string) => {
        switch (type) {
            case 'Video': return <Video size={16} />;
            case 'YT Video': return <Video size={16} />;
            case 'Content': return <FileText size={16} />;
            default: return <BookOpen size={16} />;
        }
    };

    return (
        <motion.div
            className="space-y-6"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
        >
            {/* Header */}
            <motion.div
                variants={itemVariants}
                className="bg-gradient-to-r from-purple-50 via-blue-50 to-indigo-50 p-8 rounded-2xl border border-border shadow-sm"
            >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
                            <Map size={28} className="text-white" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-text-primary">Learning Paths</h1>
                            <p className="text-text-secondary mt-1">Structured curriculum across all subjects</p>
                        </div>
                    </div>
                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="btn-primary flex items-center gap-2"
                    >
                        <Plus size={20} />
                        Create Learning Path
                    </button>
                </div>
            </motion.div>

            {/* Category Filters */}
            <motion.div
                variants={itemVariants}
                className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide"
            >
                {CATEGORIES.map(category => (
                    <button
                        key={category}
                        onClick={() => setSelectedCategory(category)}
                        className={`
                            px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition-all duration-200
                            ${selectedCategory === category
                                ? 'bg-primary text-white shadow-sm'
                                : 'bg-surface text-text-secondary hover:bg-background-secondary border border-border'
                            }
                        `}
                    >
                        {category}
                    </button>
                ))}
            </motion.div>

            {/* Learning Paths Table */}
            <motion.div
                variants={itemVariants}
                className="card overflow-hidden"
            >
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-background-secondary border-b border-border">
                            <tr>
                                <th className="text-left py-4 px-6 text-sm font-semibold text-text-primary">Content</th>
                                <th className="text-left py-4 px-6 text-sm font-semibold text-text-primary">Category</th>
                                <th className="text-left py-4 px-6 text-sm font-semibold text-text-primary">Engagement</th>
                                <th className="text-left py-4 px-6 text-sm font-semibold text-text-primary">Status</th>
                                <th className="text-right py-4 px-6 text-sm font-semibold text-text-primary">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            <AnimatePresence mode="popLayout">
                                {filteredPaths.map((path, index) => (
                                    <motion.tr
                                        key={path.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        transition={{ delay: index * 0.05 }}
                                        className="hover:bg-background-secondary transition-colors group"
                                    >
                                        {/* Content */}
                                        <td className="py-4 px-6">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-primary-50 rounded-lg flex items-center justify-center text-primary shrink-0">
                                                    {getContentIcon(path.contentType)}
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-text-primary">{path.title}</p>
                                                    <p className="text-xs text-text-tertiary">{path.contentType}</p>
                                                </div>
                                            </div>
                                        </td>

                                        {/* Category */}
                                        <td className="py-4 px-6">
                                            <div className="flex items-center gap-2 text-text-secondary">
                                                <BookOpen size={16} />
                                                <span className="text-sm">{path.category}</span>
                                            </div>
                                        </td>

                                        {/* Engagement */}
                                        <td className="py-4 px-6">
                                            <div className="flex items-center gap-4">
                                                <div className="flex items-center gap-1.5">
                                                    <span className="text-yellow-500">⭐</span>
                                                    <span className="text-sm font-medium text-text-primary">{path.engagement}</span>
                                                </div>
                                                <div className="flex items-center gap-1.5">
                                                    <TrendingUp size={14} className="text-blue-500" />
                                                    <span className="text-sm font-medium text-text-primary">{path.views}</span>
                                                </div>
                                            </div>
                                        </td>

                                        {/* Status */}
                                        <td className="py-4 px-6">
                                            <span className={`
                                                inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium
                                                ${path.status === 'Active'
                                                    ? 'bg-success-light text-success-dark'
                                                    : 'bg-warning-light text-warning-dark'
                                                }
                                            `}>
                                                {path.status}
                                            </span>
                                        </td>

                                        {/* Action */}
                                        <td className="py-4 px-6">
                                            <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button className="p-2 hover:bg-background-secondary rounded-lg transition-colors" title="Edit">
                                                    <Edit size={16} className="text-text-tertiary" />
                                                </button>
                                                <button className="p-2 hover:bg-background-secondary rounded-lg transition-colors" title="Duplicate">
                                                    <Copy size={16} className="text-text-tertiary" />
                                                </button>
                                                <button className="p-2 hover:bg-error-light rounded-lg transition-colors" title="Delete">
                                                    <Trash2 size={16} className="text-text-tertiary hover:text-error" />
                                                </button>
                                            </div>
                                        </td>
                                    </motion.tr>
                                ))}
                            </AnimatePresence>
                        </tbody>
                    </table>
                </div>

                {/* Empty State */}
                {filteredPaths.length === 0 && (
                    <div className="text-center py-12">
                        <Map size={48} className="mx-auto text-text-tertiary mb-4" />
                        <h3 className="text-lg font-semibold text-text-primary mb-2">No learning paths found</h3>
                        <p className="text-text-secondary text-sm">
                            {selectedCategory === 'All'
                                ? 'Create your first learning path to get started'
                                : `No paths found in ${selectedCategory}`
                            }
                        </p>
                    </div>
                )}
            </motion.div>

            {/* Stats Cards */}
            <motion.div
                variants={containerVariants}
                className="grid grid-cols-1 md:grid-cols-3 gap-4"
            >
                <motion.div variants={itemVariants} className="card-hover p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-text-tertiary text-sm font-medium">Total Paths</p>
                            <p className="text-3xl font-bold text-text-primary mt-1">{paths.length}</p>
                        </div>
                        <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                            <Map size={24} className="text-purple-600" />
                        </div>
                    </div>
                </motion.div>

                <motion.div variants={itemVariants} className="card-hover p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-text-tertiary text-sm font-medium">Active Paths</p>
                            <p className="text-3xl font-bold text-text-primary mt-1">
                                {paths.filter(p => p.status === 'Active').length}
                            </p>
                        </div>
                        <div className="w-12 h-12 bg-success-light rounded-xl flex items-center justify-center">
                            <TrendingUp size={24} className="text-success-dark" />
                        </div>
                    </div>
                </motion.div>

                <motion.div variants={itemVariants} className="card-hover p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-text-tertiary text-sm font-medium">Total Engagement</p>
                            <p className="text-3xl font-bold text-text-primary mt-1">
                                {paths.reduce((sum, p) => sum + p.engagement, 0)}
                            </p>
                        </div>
                        <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
                            <Users size={24} className="text-yellow-600" />
                        </div>
                    </div>
                </motion.div>
            </motion.div>
        </motion.div>
    );
}
