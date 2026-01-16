import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Plus, Search, Edit2, Trash2, MoreVertical, Folder,
    Loader, X, BookOpen, TrendingUp, Grid3x3
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { containerVariants, itemVariants, tapScale } from '../lib/animations';

interface Category {
    id: string;
    name: string;
    description: string;
    icon?: string;
    color: string;
    itemCount: number;
    created_at: string;
}

const categoryColors = [
    { name: 'Blue', value: '#3b82f6', bg: 'bg-blue-50', text: 'text-blue-600', border: 'border-blue-200' },
    { name: 'Purple', value: '#8b5cf6', bg: 'bg-purple-50', text: 'text-purple-600', border: 'border-purple-200' },
    { name: 'Green', value: '#10b981', bg: 'bg-green-50', text: 'text-green-600', border: 'border-green-200' },
    { name: 'Amber', value: '#f59e0b', bg: 'bg-amber-50', text: 'text-amber-600', border: 'border-amber-200' },
    { name: 'Pink', value: '#ec4899', bg: 'bg-pink-50', text: 'text-pink-600', border: 'border-pink-200' },
    { name: 'Cyan', value: '#06b6d4', bg: 'bg-cyan-50', text: 'text-cyan-600', border: 'border-cyan-200' },
    { name: 'Red', value: '#ef4444', bg: 'bg-red-50', text: 'text-red-600', border: 'border-red-200' },
    { name: 'Indigo', value: '#6366f1', bg: 'bg-indigo-50', text: 'text-indigo-600', border: 'border-indigo-200' }
];

export function CategoriesPage() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
    const [showActionMenu, setShowActionMenu] = useState<string | null>(null);

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            setLoading(true);

            // Fetch all content to count items per category
            const { data: contentData, error: contentError } = await supabase
                .from('content')
                .select('category');

            if (contentError) throw contentError;

            // Count items per category
            const categoryCounts: { [key: string]: number } = {};
            contentData?.forEach((item: any) => {
                if (item.category) {
                    categoryCounts[item.category] = (categoryCounts[item.category] || 0) + 1;
                }
            });

            // Create category objects from unique categories
            const uniqueCategories = Array.from(new Set(contentData?.map((item: any) => item.category).filter(Boolean)));

            const categoryData: Category[] = uniqueCategories.map((name, index) => ({
                id: `cat-${index}`,
                name: name as string,
                description: `All content related to ${name}`,
                color: categoryColors[index % categoryColors.length].value,
                itemCount: categoryCounts[name as string] || 0,
                created_at: new Date().toISOString()
            }));

            setCategories(categoryData);
        } catch (error) {
            console.error('Error fetching categories:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredCategories = categories.filter(category =>
        category.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        category.description?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleDelete = async (category: Category) => {
        if (!confirm(`Are you sure you want to delete "${category.name}"? This will not delete the content items.`)) return;

        try {
            // In a real implementation, you would delete from a categories table
            setCategories(categories.filter(c => c.id !== category.id));
        } catch (error) {
            console.error('Error deleting category:', error);
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
                    <h1 className="text-3xl font-bold text-text-primary tracking-tight">Categories</h1>
                    <p className="text-text-secondary mt-1">Organize your content into meaningful categories</p>
                </div>
                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={tapScale}
                    onClick={() => setShowCreateModal(true)}
                    className="btn-primary flex items-center gap-2"
                >
                    <Plus size={20} />
                    <span>Create Category</span>
                </motion.button>
            </motion.div>

            {/* Search */}
            <motion.div variants={itemVariants} className="card p-4">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary" size={20} />
                    <input
                        type="text"
                        placeholder="Search categories..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-background border border-border rounded-lg text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                    />
                </div>
            </motion.div>

            {/* Stats */}
            <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                    { label: 'Total Categories', value: categories.length, icon: Grid3x3, color: 'text-blue-600', bg: 'bg-blue-50' },
                    { label: 'Total Items', value: categories.reduce((sum, c) => sum + c.itemCount, 0), icon: BookOpen, color: 'text-purple-600', bg: 'bg-purple-50' },
                    { label: 'Avg Items/Category', value: categories.length > 0 ? Math.round(categories.reduce((sum, c) => sum + c.itemCount, 0) / categories.length) : 0, icon: TrendingUp, color: 'text-green-600', bg: 'bg-green-50' }
                ].map((stat, i) => (
                    <motion.div
                        key={i}
                        variants={itemVariants}
                        whileHover={{ y: -2 }}
                        className="card p-4 flex items-center gap-4"
                    >
                        <div className={`p-3 rounded-xl ${stat.bg}`}>
                            <stat.icon size={24} className={stat.color} />
                        </div>
                        <div>
                            <p className="text-xs font-medium text-text-secondary">{stat.label}</p>
                            <p className="text-2xl font-bold text-text-primary">{stat.value}</p>
                        </div>
                    </motion.div>
                ))}
            </motion.div>

            {/* Categories Grid */}
            <motion.div variants={containerVariants} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                <AnimatePresence mode="popLayout">
                    {filteredCategories.map((category) => {
                        const colorScheme = categoryColors.find(c => c.value === category.color) || categoryColors[0];

                        return (
                            <motion.div
                                key={category.id}
                                variants={itemVariants}
                                layout
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                whileHover={{ y: -4, scale: 1.02 }}
                                className="card-hover p-6 relative group"
                            >
                                {/* Action Menu */}
                                <div className="absolute top-4 right-4">
                                    <motion.button
                                        whileTap={tapScale}
                                        onClick={() => setShowActionMenu(showActionMenu === category.id ? null : category.id)}
                                        className="p-2 bg-background-secondary rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <MoreVertical size={16} className="text-text-secondary" />
                                    </motion.button>

                                    <AnimatePresence>
                                        {showActionMenu === category.id && (
                                            <motion.div
                                                initial={{ opacity: 0, y: -10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: -10 }}
                                                className="absolute right-0 mt-2 w-40 bg-white rounded-lg shadow-lg border border-border overflow-hidden z-10"
                                            >
                                                {[
                                                    { icon: Edit2, label: 'Edit', color: 'text-amber-600', onClick: () => setSelectedCategory(category) },
                                                    { icon: Trash2, label: 'Delete', color: 'text-red-600', onClick: () => handleDelete(category) }
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

                                {/* Icon */}
                                <div className={`w-14 h-14 rounded-2xl ${colorScheme.bg} ${colorScheme.border} border-2 flex items-center justify-center mb-4`}>
                                    <Folder size={28} className={colorScheme.text} />
                                </div>

                                {/* Content */}
                                <h3 className="font-bold text-text-primary mb-2 line-clamp-1">{category.name}</h3>
                                <p className="text-sm text-text-secondary line-clamp-2 mb-4">{category.description}</p>

                                {/* Stats */}
                                <div className="flex items-center justify-between pt-4 border-t border-border">
                                    <div className="flex items-center gap-2">
                                        <BookOpen size={16} className="text-text-tertiary" />
                                        <span className="text-sm font-medium text-text-secondary">
                                            {category.itemCount} {category.itemCount === 1 ? 'item' : 'items'}
                                        </span>
                                    </div>
                                    <div className={`w-3 h-3 rounded-full`} style={{ backgroundColor: category.color }} />
                                </div>
                            </motion.div>
                        );
                    })}
                </AnimatePresence>
            </motion.div>

            {/* Empty State */}
            {filteredCategories.length === 0 && (
                <motion.div
                    variants={itemVariants}
                    className="card p-12 text-center"
                >
                    <Folder size={48} className="mx-auto text-text-tertiary mb-4" />
                    <h3 className="text-lg font-semibold text-text-primary mb-2">No categories found</h3>
                    <p className="text-text-secondary mb-6">
                        {searchQuery
                            ? 'Try adjusting your search query'
                            : 'Get started by creating your first category'}
                    </p>
                    {!searchQuery && (
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={tapScale}
                            onClick={() => setShowCreateModal(true)}
                            className="btn-primary"
                        >
                            <Plus size={20} className="mr-2" />
                            Create First Category
                        </motion.button>
                    )}
                </motion.div>
            )}

            {/* Create/Edit Modal */}
            <AnimatePresence>
                {(showCreateModal || selectedCategory) && (
                    <CategoryModal
                        category={selectedCategory}
                        onClose={() => {
                            setShowCreateModal(false);
                            setSelectedCategory(null);
                        }}
                        onSuccess={() => {
                            setShowCreateModal(false);
                            setSelectedCategory(null);
                            fetchCategories();
                        }}
                    />
                )}
            </AnimatePresence>
        </motion.div>
    );
}

// Category Modal Component
function CategoryModal({
    category,
    onClose,
    onSuccess
}: {
    category: Category | null;
    onClose: () => void;
    onSuccess: () => void;
}) {
    const [formData, setFormData] = useState({
        name: category?.name || '',
        description: category?.description || '',
        color: category?.color || categoryColors[0].value
    });
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);

        try {
            // In a real implementation, you would save to a categories table
            // For now, we'll just simulate success
            await new Promise(resolve => setTimeout(resolve, 500));
            onSuccess();
        } catch (error) {
            console.error('Error saving category:', error);
            alert('Failed to save category. Please try again.');
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
                className="bg-white rounded-2xl shadow-xl max-w-lg w-full"
            >
                <div className="border-b border-border p-6 flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-text-primary">
                        {category ? 'Edit Category' : 'Create New Category'}
                    </h2>
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
                        <label className="block text-sm font-medium text-text-primary mb-2">Category Name *</label>
                        <input
                            type="text"
                            required
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="input"
                            placeholder="e.g., Mathematics"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-text-primary mb-2">Description</label>
                        <textarea
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            className="input min-h-[100px]"
                            placeholder="Enter category description"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-text-primary mb-3">Color</label>
                        <div className="grid grid-cols-4 gap-3">
                            {categoryColors.map((color) => (
                                <motion.button
                                    key={color.value}
                                    type="button"
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={tapScale}
                                    onClick={() => setFormData({ ...formData, color: color.value })}
                                    className={`h-12 rounded-lg border-2 transition-all ${formData.color === color.value
                                        ? 'border-text-primary ring-2 ring-primary/20'
                                        : 'border-border hover:border-border-dark'
                                        }`}
                                    style={{ backgroundColor: color.value }}
                                />
                            ))}
                        </div>
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
                                <><Loader className="animate-spin mr-2" size={16} /> Saving...</>
                            ) : (
                                category ? 'Update Category' : 'Create Category'
                            )}
                        </motion.button>
                    </div>
                </form>
            </motion.div>
        </motion.div>
    );
}
