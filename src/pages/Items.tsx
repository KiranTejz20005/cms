import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Plus, Search, Filter, MoreVertical, Edit2, Trash2,
    Eye, BookOpen, Video, FileText, Headphones, Brain,
    Loader, X
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { containerVariants, itemVariants, tapScale } from '../lib/animations';

interface ContentItem {
    id: string;
    title: string;
    description: string;
    type: 'Video' | 'Article' | 'Course' | 'Podcast' | 'Interactive' | 'Quiz';
    category: string;
    thumbnail?: string;
    duration?: string;
    difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
    status: 'Published' | 'Draft' | 'Archived';
    views: number;
    created_at: string;
}

const typeIcons = {
    Video: Video,
    Article: FileText,
    Course: BookOpen,
    Podcast: Headphones,
    Interactive: Brain,
    Quiz: Brain
};

const typeColors = {
    Video: 'bg-purple-50 text-purple-600 border-purple-200',
    Article: 'bg-green-50 text-green-600 border-green-200',
    Course: 'bg-blue-50 text-blue-600 border-blue-200',
    Podcast: 'bg-amber-50 text-amber-600 border-amber-200',
    Interactive: 'bg-pink-50 text-pink-600 border-pink-200',
    Quiz: 'bg-cyan-50 text-cyan-600 border-cyan-200'
};

const difficultyColors = {
    Beginner: 'bg-green-100 text-green-700',
    Intermediate: 'bg-amber-100 text-amber-700',
    Advanced: 'bg-red-100 text-red-700'
};

export function ItemsPage() {
    const [items, setItems] = useState<ContentItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterType, setFilterType] = useState<string>('all');
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showActionMenu, setShowActionMenu] = useState<string | null>(null);

    useEffect(() => {
        fetchItems();
    }, []);

    const fetchItems = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('content')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;

            setItems(data || []);
        } catch (error) {
            console.error('Error fetching items:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredItems = items.filter(item => {
        const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.description?.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesType = filterType === 'all' || item.type === filterType;
        return matchesSearch && matchesType;
    });

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this item?')) return;

        try {
            const { error } = await supabase
                .from('content')
                .delete()
                .eq('id', id);

            if (error) throw error;

            setItems(items.filter(item => item.id !== id));
        } catch (error) {
            console.error('Error deleting item:', error);
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
            className="space-y-6 max-w-7xl mx-auto"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
        >
            {/* Header */}
            <motion.div variants={itemVariants} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-text-primary tracking-tight">Content Items</h1>
                    <p className="text-text-secondary mt-1">Manage all your learning content in one place</p>
                </div>
                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={tapScale}
                    onClick={() => setShowCreateModal(true)}
                    className="btn-primary flex items-center gap-2"
                >
                    <Plus size={20} />
                    <span>Create Item</span>
                </motion.button>
            </motion.div>

            {/* Search and Filters */}
            <motion.div variants={itemVariants} className="card p-4">
                <div className="flex flex-col sm:flex-row gap-4">
                    {/* Search */}
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary" size={20} />
                        <input
                            type="text"
                            placeholder="Search items..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 bg-background border border-border rounded-lg text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                        />
                    </div>

                    {/* Type Filter */}
                    <div className="flex items-center gap-2">
                        <Filter size={20} className="text-text-tertiary" />
                        <select
                            value={filterType}
                            onChange={(e) => setFilterType(e.target.value)}
                            className="px-4 py-2.5 bg-background border border-border rounded-lg text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                        >
                            <option value="all">All Types</option>
                            <option value="Video">Videos</option>
                            <option value="Article">Articles</option>
                            <option value="Course">Courses</option>
                            <option value="Podcast">Podcasts</option>
                            <option value="Interactive">Interactive</option>
                            <option value="Quiz">Quizzes</option>
                        </select>
                    </div>
                </div>
            </motion.div>

            {/* Stats */}
            <motion.div variants={itemVariants} className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                    { label: 'Total Items', value: items.length, color: 'text-blue-600', bg: 'bg-blue-50' },
                    { label: 'Published', value: items.filter(i => i.status === 'Published').length, color: 'text-green-600', bg: 'bg-green-50' },
                    { label: 'Drafts', value: items.filter(i => i.status === 'Draft').length, color: 'text-amber-600', bg: 'bg-amber-50' },
                    { label: 'Total Views', value: items.reduce((sum, i) => sum + (i.views || 0), 0).toLocaleString(), color: 'text-purple-600', bg: 'bg-purple-50' }
                ].map((stat, i) => (
                    <motion.div
                        key={i}
                        variants={itemVariants}
                        whileHover={{ y: -2 }}
                        className="card p-4"
                    >
                        <p className="text-xs font-medium text-text-secondary mb-1">{stat.label}</p>
                        <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
                    </motion.div>
                ))}
            </motion.div>

            {/* Items Grid */}
            <motion.div variants={containerVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <AnimatePresence mode="popLayout">
                    {filteredItems.map((item) => {
                        const Icon = typeIcons[item.type];
                        return (
                            <motion.div
                                key={item.id}
                                variants={itemVariants}
                                layout
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                whileHover={{ y: -4 }}
                                className="card-hover overflow-hidden group"
                            >
                                {/* Thumbnail */}
                                <div className="relative h-40 bg-gradient-to-br from-primary-50 to-primary-100 overflow-hidden">
                                    {item.thumbnail ? (
                                        <img src={item.thumbnail} alt={item.title} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center">
                                            <Icon size={48} className="text-primary-300" />
                                        </div>
                                    )}

                                    {/* Type Badge */}
                                    <div className={`absolute top-3 left-3 px-2.5 py-1 rounded-full text-xs font-medium border backdrop-blur-sm ${typeColors[item.type]}`}>
                                        <div className="flex items-center gap-1.5">
                                            <Icon size={12} />
                                            <span>{item.type}</span>
                                        </div>
                                    </div>

                                    {/* Actions Menu */}
                                    <div className="absolute top-3 right-3">
                                        <motion.button
                                            whileTap={tapScale}
                                            onClick={() => setShowActionMenu(showActionMenu === item.id ? null : item.id)}
                                            className="p-2 bg-white/90 backdrop-blur-sm rounded-lg shadow-sm hover:bg-white transition-all"
                                        >
                                            <MoreVertical size={16} className="text-text-secondary" />
                                        </motion.button>

                                        <AnimatePresence>
                                            {showActionMenu === item.id && (
                                                <motion.div
                                                    initial={{ opacity: 0, y: -10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    exit={{ opacity: 0, y: -10 }}
                                                    className="absolute right-0 mt-2 w-40 bg-white rounded-lg shadow-lg border border-border overflow-hidden z-10"
                                                >
                                                    {[
                                                        { icon: Eye, label: 'View', color: 'text-blue-600' },
                                                        { icon: Edit2, label: 'Edit', color: 'text-amber-600' },
                                                        { icon: Trash2, label: 'Delete', color: 'text-red-600', onClick: () => handleDelete(item.id) }
                                                    ].map((action, i) => (
                                                        <button
                                                            key={i}
                                                            onClick={action.onClick}
                                                            className={`w-full flex items-center gap-2 px-4 py-2.5 hover:bg-background-secondary transition-colors ${action.color}`}
                                                        >
                                                            <action.icon size={16} />
                                                            <span className="text-sm font-medium">{action.label}</span>
                                                        </button>
                                                    ))}
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="p-4 space-y-3">
                                    <div>
                                        <h3 className="font-semibold text-text-primary line-clamp-1">{item.title}</h3>
                                        <p className="text-sm text-text-secondary line-clamp-2 mt-1">{item.description}</p>
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <span className={`text-xs font-medium px-2 py-1 rounded-full ${difficultyColors[item.difficulty]}`}>
                                            {item.difficulty}
                                        </span>
                                        {item.duration && (
                                            <span className="text-xs text-text-tertiary">{item.duration}</span>
                                        )}
                                    </div>

                                    <div className="flex items-center justify-between pt-3 border-t border-border">
                                        <div className="flex items-center gap-2">
                                            <Eye size={14} className="text-text-tertiary" />
                                            <span className="text-xs text-text-secondary">{item.views || 0} views</span>
                                        </div>
                                        <span className={`text-xs px-2 py-0.5 rounded-full ${item.status === 'Published' ? 'bg-green-100 text-green-700' :
                                                item.status === 'Draft' ? 'bg-amber-100 text-amber-700' :
                                                    'bg-gray-100 text-gray-700'
                                            }`}>
                                            {item.status}
                                        </span>
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}
                </AnimatePresence>
            </motion.div>

            {/* Empty State */}
            {filteredItems.length === 0 && (
                <motion.div
                    variants={itemVariants}
                    className="card p-12 text-center"
                >
                    <BookOpen size={48} className="mx-auto text-text-tertiary mb-4" />
                    <h3 className="text-lg font-semibold text-text-primary mb-2">No items found</h3>
                    <p className="text-text-secondary mb-6">
                        {searchQuery || filterType !== 'all'
                            ? 'Try adjusting your search or filters'
                            : 'Get started by creating your first content item'}
                    </p>
                    {!searchQuery && filterType === 'all' && (
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={tapScale}
                            onClick={() => setShowCreateModal(true)}
                            className="btn-primary"
                        >
                            <Plus size={20} className="mr-2" />
                            Create First Item
                        </motion.button>
                    )}
                </motion.div>
            )}

            {/* Create/Edit Modal */}
            <AnimatePresence>
                {showCreateModal && (
                    <CreateItemModal
                        onClose={() => setShowCreateModal(false)}
                        onSuccess={() => {
                            setShowCreateModal(false);
                            fetchItems();
                        }}
                    />
                )}
            </AnimatePresence>
        </motion.div>
    );
}

// Create Item Modal Component
function CreateItemModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        type: 'Video' as ContentItem['type'],
        category: '',
        difficulty: 'Beginner' as ContentItem['difficulty'],
        duration: '',
        thumbnail: '',
        status: 'Draft' as ContentItem['status']
    });
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);

        try {
            const { error } = await supabase
                .from('content')
                .insert([{
                    ...formData,
                    views: 0,
                    created_at: new Date().toISOString()
                }]);

            if (error) throw error;

            onSuccess();
        } catch (error) {
            console.error('Error creating item:', error);
            alert('Failed to create item. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={onClose}
        >
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            >
                <div className="sticky top-0 bg-white border-b border-border p-6 flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-text-primary">Create New Item</h2>
                    <motion.button
                        whileTap={tapScale}
                        onClick={onClose}
                        className="p-2 hover:bg-background-secondary rounded-lg transition-colors"
                    >
                        <X size={20} />
                    </motion.button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-text-primary mb-2">Title *</label>
                        <input
                            type="text"
                            required
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            className="input"
                            placeholder="Enter item title"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-text-primary mb-2">Description</label>
                        <textarea
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            className="input min-h-[100px]"
                            placeholder="Enter item description"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-text-primary mb-2">Type *</label>
                            <select
                                required
                                value={formData.type}
                                onChange={(e) => setFormData({ ...formData, type: e.target.value as ContentItem['type'] })}
                                className="input"
                            >
                                <option value="Video">Video</option>
                                <option value="Article">Article</option>
                                <option value="Course">Course</option>
                                <option value="Podcast">Podcast</option>
                                <option value="Interactive">Interactive</option>
                                <option value="Quiz">Quiz</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-text-primary mb-2">Difficulty *</label>
                            <select
                                required
                                value={formData.difficulty}
                                onChange={(e) => setFormData({ ...formData, difficulty: e.target.value as ContentItem['difficulty'] })}
                                className="input"
                            >
                                <option value="Beginner">Beginner</option>
                                <option value="Intermediate">Intermediate</option>
                                <option value="Advanced">Advanced</option>
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-text-primary mb-2">Category</label>
                            <input
                                type="text"
                                value={formData.category}
                                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                className="input"
                                placeholder="e.g., Mathematics"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-text-primary mb-2">Duration</label>
                            <input
                                type="text"
                                value={formData.duration}
                                onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                                className="input"
                                placeholder="e.g., 10 min"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-text-primary mb-2">Thumbnail URL</label>
                        <input
                            type="url"
                            value={formData.thumbnail}
                            onChange={(e) => setFormData({ ...formData, thumbnail: e.target.value })}
                            className="input"
                            placeholder="https://example.com/image.jpg"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-text-primary mb-2">Status</label>
                        <select
                            value={formData.status}
                            onChange={(e) => setFormData({ ...formData, status: e.target.value as ContentItem['status'] })}
                            className="input"
                        >
                            <option value="Draft">Draft</option>
                            <option value="Published">Published</option>
                            <option value="Archived">Archived</option>
                        </select>
                    </div>

                    <div className="flex gap-3 pt-4">
                        <motion.button
                            type="button"
                            whileTap={tapScale}
                            onClick={onClose}
                            className="btn-secondary flex-1"
                        >
                            Cancel
                        </motion.button>
                        <motion.button
                            type="submit"
                            whileTap={tapScale}
                            disabled={submitting}
                            className="btn-primary flex-1"
                        >
                            {submitting ? (
                                <><Loader className="animate-spin mr-2" size={16} /> Creating...</>
                            ) : (
                                'Create Item'
                            )}
                        </motion.button>
                    </div>
                </form>
            </motion.div>
        </motion.div>
    );
}
