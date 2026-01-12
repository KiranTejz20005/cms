import { useEffect, useState, useRef } from 'react';
import { FileText, Video, Filter, Plus, Loader, Sparkles, BookOpen, X, Upload, Film, Trash2, CheckCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';
import { containerVariants, itemVariants } from '../lib/animations';

interface ContentItem {
    id: string;
    title: string;
    type: 'Course' | 'Video' | 'Article' | 'Podcast' | 'Quiz' | 'Interactive';
    category: string;
    author: string;
    updated_at: string;
    modules?: number;
    duration?: string;
    difficulty?: 'Beginner' | 'Intermediate' | 'Advanced';
}

// Child-focused subjects
const DEFAULT_SUBJECTS = [
    'Healthy Habits',
    'Daily Routines',
    'Basic Needs',
    'Early Math',
    'Science for Kids',
    'Creative Arts'
];

export function ContentPage() {
    const [content, setContent] = useState<ContentItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState<string>('All');
    const [subjects, setSubjects] = useState<string[]>(DEFAULT_SUBJECTS);
    const [searchQuery, setSearchQuery] = useState('');

    const [showCreateModal, setShowCreateModal] = useState(false);
    const [newItem, setNewItem] = useState<{ title: string, type: 'Course' | 'Video' | 'Article', category: string }>({
        title: '',
        type: 'Video',
        category: DEFAULT_SUBJECTS[0]
    });

    // Video upload states
    const [videoFiles, setVideoFiles] = useState<File[]>([]);
    const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({});
    const [uploading, setUploading] = useState(false);
    const [dragActive, setDragActive] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Edit modal states
    const [showEditModal, setShowEditModal] = useState(false);
    const [editingItem, setEditingItem] = useState<ContentItem | null>(null);


    useEffect(() => {
        fetchContent();
    }, [selectedCategory]);

    const fetchContent = async () => {
        setLoading(true);

        // Use demo content (can be replaced with real API data later)
        const demoContent: ContentItem[] = [
            // Healthy Habits (10 items)
            { id: '1', title: 'Morning Brushing Routine', type: 'Video', category: 'Healthy Habits', author: 'Nurse Joy', updated_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), modules: 1, duration: '5 min', difficulty: 'Beginner' },
            { id: '2', title: 'Hand Washing Hero', type: 'Video', category: 'Healthy Habits', author: 'Nurse Joy', updated_at: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(), modules: 1, duration: '3 min', difficulty: 'Beginner' },
            { id: '3', title: 'Healthy Eating Habits', type: 'Article', category: 'Healthy Habits', author: 'Nutrition Expert', updated_at: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(), modules: 1, duration: '10 min', difficulty: 'Beginner' },
            { id: '4', title: 'Personal Hygiene Guide', type: 'Course', category: 'Healthy Habits', author: 'Dr. Clean', updated_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), modules: 4, duration: '2 hours', difficulty: 'Intermediate' },
            { id: '5', title: 'Exercise and Movement', type: 'Video', category: 'Healthy Habits', author: 'Coach Fit', updated_at: new Date(Date.now() - 1000 * 60 * 60 * 36).toISOString(), modules: 1, duration: '15 min', difficulty: 'Beginner' },
            { id: '6', title: 'Dental Care for Kids', type: 'Course', category: 'Healthy Habits', author: 'Dr. Tooth', updated_at: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(), modules: 3, duration: '1.5 hours', difficulty: 'Beginner' },
            { id: '7', title: 'Healthy Snack Choices', type: 'Interactive', category: 'Healthy Habits', author: 'Chef Healthy', updated_at: new Date(Date.now() - 1000 * 60 * 60 * 60).toISOString(), modules: 1, duration: '20 min', difficulty: 'Beginner' },
            { id: '8', title: 'Staying Active Every Day', type: 'Podcast', category: 'Healthy Habits', author: 'Fitness Pro', updated_at: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(), modules: 1, duration: '30 min', difficulty: 'Beginner' },
            { id: '9', title: 'Good Posture Guide', type: 'Video', category: 'Healthy Habits', author: 'Dr. Spine', updated_at: new Date(Date.now() - 1000 * 60 * 60 * 84).toISOString(), modules: 1, duration: '8 min', difficulty: 'Intermediate' },
            { id: '10', title: 'Drinking Water Importance', type: 'Quiz', category: 'Healthy Habits', author: 'Health Hero', updated_at: new Date(Date.now() - 1000 * 60 * 60 * 96).toISOString(), modules: 1, duration: '10 min', difficulty: 'Beginner' },

            // Daily Routines (8 items)
            { id: '11', title: 'How to Tie Shoelaces', type: 'Video', category: 'Daily Routines', author: 'Coach K', updated_at: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(), modules: 1, duration: '7 min', difficulty: 'Beginner' },
            { id: '12', title: 'Telling Time', type: 'Interactive', category: 'Daily Routines', author: 'Clock Master', updated_at: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(), modules: 1, duration: '20 min', difficulty: 'Intermediate' },
            { id: '13', title: 'Getting Ready for School', type: 'Course', category: 'Daily Routines', author: 'Teacher Tom', updated_at: new Date(Date.now() - 1000 * 60 * 60 * 20).toISOString(), modules: 5, duration: '2 hours', difficulty: 'Beginner' },
            { id: '14', title: 'Bedtime Routine', type: 'Video', category: 'Daily Routines', author: 'Sleep Coach', updated_at: new Date(Date.now() - 1000 * 60 * 60 * 32).toISOString(), modules: 1, duration: '10 min', difficulty: 'Beginner' },
            { id: '15', title: 'Making Your Bed', type: 'Video', category: 'Daily Routines', author: 'Tidy Tim', updated_at: new Date(Date.now() - 1000 * 60 * 60 * 44).toISOString(), modules: 1, duration: '5 min', difficulty: 'Beginner' },
            { id: '16', title: 'Organizing Your Room', type: 'Article', category: 'Daily Routines', author: 'Organizer Olivia', updated_at: new Date(Date.now() - 1000 * 60 * 60 * 56).toISOString(), modules: 1, duration: '15 min', difficulty: 'Intermediate' },
            { id: '17', title: 'Packing Your Backpack', type: 'Video', category: 'Daily Routines', author: 'Ready Rita', updated_at: new Date(Date.now() - 1000 * 60 * 60 * 68).toISOString(), modules: 1, duration: '6 min', difficulty: 'Beginner' },
            { id: '18', title: 'Table Manners', type: 'Course', category: 'Daily Routines', author: 'Manners Mike', updated_at: new Date(Date.now() - 1000 * 60 * 60 * 80).toISOString(), modules: 3, duration: '1 hour', difficulty: 'Beginner' },

            // Basic Needs (6 items)
            { id: '19', title: 'Why Do We Need Sleep?', type: 'Article', category: 'Basic Needs', author: 'Dr. Sleep', updated_at: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(), modules: 1, duration: '10 min', difficulty: 'Beginner' },
            { id: '20', title: 'Importance of Food', type: 'Video', category: 'Basic Needs', author: 'Nutrition Ned', updated_at: new Date(Date.now() - 1000 * 60 * 60 * 18).toISOString(), modules: 1, duration: '8 min', difficulty: 'Beginner' },
            { id: '21', title: 'Staying Warm and Safe', type: 'Article', category: 'Basic Needs', author: 'Safety Sam', updated_at: new Date(Date.now() - 1000 * 60 * 60 * 30).toISOString(), modules: 1, duration: '12 min', difficulty: 'Beginner' },
            { id: '22', title: 'Water is Life', type: 'Video', category: 'Basic Needs', author: 'Water Wendy', updated_at: new Date(Date.now() - 1000 * 60 * 60 * 42).toISOString(), modules: 1, duration: '10 min', difficulty: 'Beginner' },
            { id: '23', title: 'Having a Home', type: 'Article', category: 'Basic Needs', author: 'Home Harry', updated_at: new Date(Date.now() - 1000 * 60 * 60 * 54).toISOString(), modules: 1, duration: '15 min', difficulty: 'Beginner' },
            { id: '24', title: 'Love and Family', type: 'Video', category: 'Basic Needs', author: 'Family Fran', updated_at: new Date(Date.now() - 1000 * 60 * 60 * 66).toISOString(), modules: 1, duration: '12 min', difficulty: 'Beginner' },

            // Early Math (12 items)
            { id: '25', title: 'The Alphabet Song', type: 'Video', category: 'Early Math', author: 'Mr. Music', updated_at: new Date(Date.now() - 1000 * 60 * 60 * 1).toISOString(), modules: 1, duration: '4 min', difficulty: 'Beginner' },
            { id: '26', title: 'Counting with Fruits', type: 'Interactive', category: 'Early Math', author: 'Math Wizard', updated_at: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(), modules: 1, duration: '15 min', difficulty: 'Beginner' },
            { id: '27', title: 'Fractions Made Easy', type: 'Video', category: 'Early Math', author: 'Math Wizard', updated_at: new Date(Date.now() - 1000 * 60 * 60 * 10).toISOString(), modules: 1, duration: '12 min', difficulty: 'Intermediate' },
            { id: '28', title: 'Alphabet Learning Game', type: 'Interactive', category: 'Early Math', author: 'Learning Games', updated_at: new Date(Date.now() - 1000 * 60 * 60 * 16).toISOString(), modules: 1, duration: '20 min', difficulty: 'Beginner' },
            { id: '29', title: 'Numbers 1 to 10', type: 'Course', category: 'Early Math', author: 'Count Carl', updated_at: new Date(Date.now() - 1000 * 60 * 60 * 22).toISOString(), modules: 10, duration: '5 hours', difficulty: 'Beginner' },
            { id: '30', title: 'Addition Basics', type: 'Video', category: 'Early Math', author: 'Plus Pete', updated_at: new Date(Date.now() - 1000 * 60 * 60 * 28).toISOString(), modules: 1, duration: '10 min', difficulty: 'Beginner' },
            { id: '31', title: 'Subtraction Fun', type: 'Video', category: 'Early Math', author: 'Minus Mary', updated_at: new Date(Date.now() - 1000 * 60 * 60 * 34).toISOString(), modules: 1, duration: '10 min', difficulty: 'Beginner' },
            { id: '32', title: 'Shapes All Around Us', type: 'Article', category: 'Early Math', author: 'Shape Shane', updated_at: new Date(Date.now() - 1000 * 60 * 60 * 40).toISOString(), modules: 1, duration: '8 min', difficulty: 'Beginner' },
            { id: '33', title: 'Patterns and Sequences', type: 'Interactive', category: 'Early Math', author: 'Pattern Patty', updated_at: new Date(Date.now() - 1000 * 60 * 60 * 46).toISOString(), modules: 1, duration: '15 min', difficulty: 'Intermediate' },
            { id: '34', title: 'Measurement Basics', type: 'Course', category: 'Early Math', author: 'Measure Max', updated_at: new Date(Date.now() - 1000 * 60 * 60 * 52).toISOString(), modules: 4, duration: '2 hours', difficulty: 'Intermediate' },
            { id: '35', title: 'Money and Coins', type: 'Video', category: 'Early Math', author: 'Penny Paul', updated_at: new Date(Date.now() - 1000 * 60 * 60 * 58).toISOString(), modules: 1, duration: '12 min', difficulty: 'Intermediate' },
            { id: '36', title: 'Time and Calendar', type: 'Article', category: 'Early Math', author: 'Calendar Cal', updated_at: new Date(Date.now() - 1000 * 60 * 60 * 64).toISOString(), modules: 1, duration: '10 min', difficulty: 'Intermediate' },

            // Science for Kids (10 items)
            { id: '37', title: 'Planets of the Solar System', type: 'Course', category: 'Science for Kids', author: 'Create Lab', updated_at: new Date(Date.now() - 1000 * 60 * 60 * 7).toISOString(), modules: 8, duration: '4 hours', difficulty: 'Intermediate' },
            { id: '38', title: 'The Water Cycle', type: 'Article', category: 'Science for Kids', author: 'Science Bill', updated_at: new Date(Date.now() - 1000 * 60 * 60 * 14).toISOString(), modules: 1, duration: '12 min', difficulty: 'Beginner' },
            { id: '39', title: 'Introduction to Dinosaurs', type: 'Course', category: 'Science for Kids', author: 'Paleo Pete', updated_at: new Date(Date.now() - 1000 * 60 * 60 * 21).toISOString(), modules: 3, duration: '1.5 hours', difficulty: 'Beginner' },
            { id: '40', title: 'Ocean Life Exploration', type: 'Course', category: 'Science for Kids', author: 'Sea Explorer', updated_at: new Date(Date.now() - 1000 * 60 * 60 * 28).toISOString(), modules: 6, duration: '3 hours', difficulty: 'Intermediate' },
            { id: '41', title: 'How Plants Grow', type: 'Video', category: 'Science for Kids', author: 'Garden Gina', updated_at: new Date(Date.now() - 1000 * 60 * 60 * 35).toISOString(), modules: 1, duration: '15 min', difficulty: 'Beginner' },
            { id: '42', title: 'Weather and Seasons', type: 'Course', category: 'Science for Kids', author: 'Weather Will', updated_at: new Date(Date.now() - 1000 * 60 * 60 * 42).toISOString(), modules: 4, duration: '2 hours', difficulty: 'Beginner' },
            { id: '43', title: 'Animal Habitats', type: 'Interactive', category: 'Science for Kids', author: 'Zoo Zoe', updated_at: new Date(Date.now() - 1000 * 60 * 60 * 49).toISOString(), modules: 1, duration: '20 min', difficulty: 'Beginner' },
            { id: '44', title: 'The Human Body', type: 'Course', category: 'Science for Kids', author: 'Body Bob', updated_at: new Date(Date.now() - 1000 * 60 * 60 * 56).toISOString(), modules: 7, duration: '3.5 hours', difficulty: 'Intermediate' },
            { id: '45', title: 'Magnets and Forces', type: 'Video', category: 'Science for Kids', author: 'Physics Phil', updated_at: new Date(Date.now() - 1000 * 60 * 60 * 63).toISOString(), modules: 1, duration: '10 min', difficulty: 'Intermediate' },
            { id: '46', title: 'Light and Shadows', type: 'Article', category: 'Science for Kids', author: 'Light Lucy', updated_at: new Date(Date.now() - 1000 * 60 * 60 * 70).toISOString(), modules: 1, duration: '8 min', difficulty: 'Beginner' },

            // Creative Arts (9 items)
            { id: '47', title: 'Colors and Shapes', type: 'Course', category: 'Creative Arts', author: 'Art Teacher', updated_at: new Date(Date.now() - 1000 * 60 * 60 * 9).toISOString(), modules: 4, duration: '2 hours', difficulty: 'Beginner' },
            { id: '48', title: 'Drawing Animals 101', type: 'Course', category: 'Creative Arts', author: 'Bob Ross Jr.', updated_at: new Date(Date.now() - 1000 * 60 * 60 * 15).toISOString(), modules: 5, duration: '2.5 hours', difficulty: 'Intermediate' },
            { id: '49', title: 'Music and Rhythm', type: 'Video', category: 'Creative Arts', author: 'Music Master', updated_at: new Date(Date.now() - 1000 * 60 * 60 * 23).toISOString(), modules: 1, duration: '15 min', difficulty: 'Beginner' },
            { id: '50', title: 'Painting Techniques', type: 'Video', category: 'Creative Arts', author: 'Paint Paula', updated_at: new Date(Date.now() - 1000 * 60 * 60 * 31).toISOString(), modules: 1, duration: '20 min', difficulty: 'Intermediate' },
            { id: '51', title: 'Crafts with Paper', type: 'Course', category: 'Creative Arts', author: 'Craft Cathy', updated_at: new Date(Date.now() - 1000 * 60 * 60 * 39).toISOString(), modules: 6, duration: '3 hours', difficulty: 'Beginner' },
            { id: '52', title: 'Singing Songs', type: 'Interactive', category: 'Creative Arts', author: 'Singer Sally', updated_at: new Date(Date.now() - 1000 * 60 * 60 * 47).toISOString(), modules: 1, duration: '25 min', difficulty: 'Beginner' },
            { id: '53', title: 'Dance Moves for Kids', type: 'Video', category: 'Creative Arts', author: 'Dance Dan', updated_at: new Date(Date.now() - 1000 * 60 * 60 * 55).toISOString(), modules: 1, duration: '18 min', difficulty: 'Beginner' },
            { id: '54', title: 'Storytelling Basics', type: 'Article', category: 'Creative Arts', author: 'Story Steve', updated_at: new Date(Date.now() - 1000 * 60 * 60 * 63).toISOString(), modules: 1, duration: '12 min', difficulty: 'Beginner' },
            { id: '55', title: 'Clay Modeling Fun', type: 'Interactive', category: 'Creative Arts', author: 'Clay Clara', updated_at: new Date(Date.now() - 1000 * 60 * 60 * 71).toISOString(), modules: 1, duration: '30 min', difficulty: 'Intermediate' },
        ];

        if (selectedCategory !== 'All') {
            setContent(demoContent.filter(c => c.category === selectedCategory));
        } else {
            setContent(demoContent);
        }

        setLoading(false);
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const files = Array.from(e.target.files).filter(file =>
                file.type.startsWith('video/')
            );
            setVideoFiles(prev => [...prev, ...files]);
        }
    };

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        if (e.dataTransfer.files) {
            const files = Array.from(e.dataTransfer.files).filter(file =>
                file.type.startsWith('video/')
            );
            setVideoFiles(prev => [...prev, ...files]);
        }
    };

    const removeFile = (index: number) => {
        setVideoFiles(prev => prev.filter((_, i) => i !== index));
    };

    const formatFileSize = (bytes: number) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
    };

    const handleCreate = async () => {
        if (!newItem.title && videoFiles.length === 0) return;

        setUploading(true);

        try {
            // If videos are selected, upload them
            if (videoFiles.length > 0) {
                for (let i = 0; i < videoFiles.length; i++) {
                    const file = videoFiles[i];
                    const fileName = `${Date.now()}_${file.name}`;

                    // Simulate upload progress (in real app, use Supabase storage)
                    const progressInterval = setInterval(() => {
                        setUploadProgress(prev => ({
                            ...prev,
                            [file.name]: Math.min((prev[file.name] || 0) + 10, 90)
                        }));
                    }, 200);

                    // Upload to Supabase Storage
                    const { error: uploadError } = await supabase.storage
                        .from('videos')
                        .upload(fileName, file);

                    clearInterval(progressInterval);
                    setUploadProgress(prev => ({ ...prev, [file.name]: 100 }));

                    if (!uploadError) {
                        // Create content entry
                        const title = newItem.title || file.name.replace(/\.[^/.]+$/, "");
                        await supabase.from('content').insert([{
                            title,
                            type: 'Video',
                            category: newItem.category,
                            author: 'You',
                            video_url: fileName
                        }]);
                    }
                }
            } else {
                // No video files, just create the content entry
                await supabase.from('content').insert([{
                    title: newItem.title,
                    type: newItem.type,
                    category: newItem.category,
                    author: 'You',
                }]);
            }

            // Refresh content list
            await fetchContent();

            // Reset form
            setShowCreateModal(false);
            setNewItem({ title: '', type: 'Video', category: DEFAULT_SUBJECTS[0] });
            setVideoFiles([]);
            setUploadProgress({});
        } catch (error) {
            console.error('Upload error:', error);
        } finally {
            setUploading(false);
        }
    };

    const handleEdit = (item: ContentItem) => {
        setEditingItem(item);
        setShowEditModal(true);
    };

    const handleSaveEdit = async () => {
        if (!editingItem) return;

        try {
            // Update in state (in production, would update in database)
            setContent(content.map(item =>
                item.id === editingItem.id ? editingItem : item
            ));

            setShowEditModal(false);
            setEditingItem(null);
        } catch (error) {
            console.error('Edit error:', error);
        }
    };

    return (
        <motion.div
            className="space-y-6 relative"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
        >
            {/* Create Modal */}
            <AnimatePresence>
                {showCreateModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
                        >
                            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gradient-to-r from-blue-50 to-purple-50">
                                <h3 className="font-bold text-lg text-text-primary flex items-center gap-2">
                                    <Sparkles size={20} className="text-purple-600" />
                                    Create New Content
                                </h3>
                                <button onClick={() => setShowCreateModal(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                                    <X size={24} />
                                </button>
                            </div>
                            <div className="p-6 space-y-5">
                                <div>
                                    <label className="block text-sm font-semibold text-text-primary mb-2">Title</label>
                                    <input
                                        type="text"
                                        className="input"
                                        placeholder="e.g. The Water Cycle (optional for video uploads)"
                                        value={newItem.title}
                                        onChange={e => setNewItem({ ...newItem, title: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-text-primary mb-2">Type</label>
                                    <select
                                        className="input cursor-pointer"
                                        value={newItem.type}
                                        onChange={e => setNewItem({ ...newItem, type: e.target.value as any })}
                                    >
                                        <option value="Video">🎥 Video</option>
                                        <option value="Article">📝 Article</option>
                                        <option value="Course">📚 Course</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-text-primary mb-2">Category</label>
                                    <select
                                        className="input cursor-pointer"
                                        value={newItem.category}
                                        onChange={e => setNewItem({ ...newItem, category: e.target.value })}
                                    >
                                        {DEFAULT_SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
                                    </select>
                                </div>

                                {/* Video Upload Section */}
                                {newItem.type === 'Video' && (
                                    <div>
                                        <label className="block text-sm font-semibold text-text-primary mb-2 flex items-center gap-2">
                                            <Film size={16} />
                                            Upload Video/Shorts
                                        </label>

                                        {/* Drag & Drop Zone */}
                                        <div
                                            onDragEnter={handleDrag}
                                            onDragLeave={handleDrag}
                                            onDragOver={handleDrag}
                                            onDrop={handleDrop}
                                            onClick={() => fileInputRef.current?.click()}
                                            className={`
                                                relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-200
                                                ${dragActive
                                                    ? 'border-primary bg-primary-50 scale-[1.02]'
                                                    : 'border-border hover:border-primary hover:bg-background-secondary'
                                                }
                                            `}
                                        >
                                            <input
                                                ref={fileInputRef}
                                                type="file"
                                                accept="video/*"
                                                multiple
                                                onChange={handleFileSelect}
                                                className="hidden"
                                            />
                                            <Upload className="mx-auto mb-3 text-text-tertiary" size={32} />
                                            <p className="text-sm font-medium text-text-primary mb-1">
                                                Click to upload or drag and drop
                                            </p>
                                            <p className="text-xs text-text-tertiary">
                                                MP4, MOV, AVI, WebM (Max 500MB per file)
                                            </p>
                                            <p className="text-xs text-primary mt-2 font-medium">
                                                Supports bulk upload - select multiple files
                                            </p>
                                        </div>

                                        {/* File List */}
                                        {videoFiles.length > 0 && (
                                            <div className="mt-4 space-y-2 max-h-60 overflow-y-auto">
                                                {videoFiles.map((file, index) => (
                                                    <motion.div
                                                        key={index}
                                                        initial={{ opacity: 0, y: -10 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        className="flex items-center gap-3 p-3 bg-background-secondary rounded-lg group"
                                                    >
                                                        <Film size={20} className="text-primary shrink-0" />
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-sm font-medium text-text-primary truncate">
                                                                {file.name}
                                                            </p>
                                                            <p className="text-xs text-text-tertiary">
                                                                {formatFileSize(file.size)}
                                                            </p>
                                                            {uploadProgress[file.name] !== undefined && (
                                                                <div className="mt-1.5">
                                                                    <div className="h-1.5 bg-background rounded-full overflow-hidden">
                                                                        <div
                                                                            className="h-full bg-primary transition-all duration-300"
                                                                            style={{ width: `${uploadProgress[file.name]}%` }}
                                                                        />
                                                                    </div>
                                                                    <p className="text-xs text-text-tertiary mt-0.5">
                                                                        {uploadProgress[file.name]}%
                                                                    </p>
                                                                </div>
                                                            )}
                                                        </div>
                                                        {uploadProgress[file.name] === 100 ? (
                                                            <CheckCircle size={20} className="text-success shrink-0" />
                                                        ) : (
                                                            <button
                                                                onClick={() => removeFile(index)}
                                                                className="p-1.5 text-text-tertiary hover:text-error hover:bg-error-light rounded transition-colors opacity-0 group-hover:opacity-100"
                                                                disabled={uploading}
                                                            >
                                                                <Trash2 size={16} />
                                                            </button>
                                                        )}
                                                    </motion.div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                            <div className="p-6 border-t border-gray-100 bg-gray-50/50 flex justify-end gap-3">
                                <button
                                    onClick={() => setShowCreateModal(false)}
                                    className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-200 rounded-lg transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleCreate}
                                    disabled={(!newItem.title && videoFiles.length === 0) || uploading}
                                    className="btn-primary"
                                >
                                    {uploading ? (
                                        <span className="flex items-center gap-2">
                                            <Loader className="animate-spin" size={16} />
                                            Uploading {videoFiles.length} file(s)...
                                        </span>
                                    ) : (
                                        videoFiles.length > 0 ? `Upload ${videoFiles.length} Video(s)` : 'Create'
                                    )}
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Edit Modal */}
            <AnimatePresence>
                {showEditModal && editingItem && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
                        >
                            <div className="p-6 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white z-10">
                                <h2 className="text-2xl font-bold text-text-primary">Edit Content</h2>
                                <button
                                    onClick={() => {
                                        setShowEditModal(false);
                                        setEditingItem(null);
                                    }}
                                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                                >
                                    <X size={24} />
                                </button>
                            </div>

                            <div className="p-6 space-y-4">
                                <div>
                                    <label className="block text-sm font-semibold text-text-primary mb-2">Title</label>
                                    <input
                                        type="text"
                                        value={editingItem.title}
                                        onChange={(e) => setEditingItem({ ...editingItem, title: e.target.value })}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none transition-all"
                                        placeholder="Enter content title"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-text-primary mb-2">Author</label>
                                    <input
                                        type="text"
                                        value={editingItem.author}
                                        onChange={(e) => setEditingItem({ ...editingItem, author: e.target.value })}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none transition-all"
                                        placeholder="Enter author name"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-semibold text-text-primary mb-2">Category</label>
                                        <select
                                            value={editingItem.category}
                                            onChange={(e) => setEditingItem({ ...editingItem, category: e.target.value })}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none transition-all"
                                        >
                                            {DEFAULT_SUBJECTS.map(subject => (
                                                <option key={subject} value={subject}>{subject}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-text-primary mb-2">Type</label>
                                        <select
                                            value={editingItem.type}
                                            onChange={(e) => setEditingItem({ ...editingItem, type: e.target.value as ContentItem['type'] })}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none transition-all"
                                        >
                                            <option value="Video">Video</option>
                                            <option value="Course">Course</option>
                                            <option value="Article">Article</option>
                                            <option value="Podcast">Podcast</option>
                                            <option value="Quiz">Quiz</option>
                                            <option value="Interactive">Interactive</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="grid grid-cols-3 gap-4">
                                    <div>
                                        <label className="block text-sm font-semibold text-text-primary mb-2">Modules</label>
                                        <input
                                            type="number"
                                            min="1"
                                            value={editingItem.modules || 1}
                                            onChange={(e) => setEditingItem({ ...editingItem, modules: parseInt(e.target.value) || 1 })}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none transition-all"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-text-primary mb-2">Duration</label>
                                        <input
                                            type="text"
                                            value={editingItem.duration || ''}
                                            onChange={(e) => setEditingItem({ ...editingItem, duration: e.target.value })}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none transition-all"
                                            placeholder="e.g., 15 min"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-text-primary mb-2">Difficulty</label>
                                        <select
                                            value={editingItem.difficulty || 'Beginner'}
                                            onChange={(e) => setEditingItem({ ...editingItem, difficulty: e.target.value as ContentItem['difficulty'] })}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none transition-all"
                                        >
                                            <option value="Beginner">Beginner</option>
                                            <option value="Intermediate">Intermediate</option>
                                            <option value="Advanced">Advanced</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            <div className="p-6 border-t border-gray-200 flex justify-end gap-3 sticky bottom-0 bg-white">
                                <button
                                    onClick={() => {
                                        setShowEditModal(false);
                                        setEditingItem(null);
                                    }}
                                    className="px-6 py-3 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSaveEdit}
                                    className="px-6 py-3 text-sm font-medium text-white bg-primary hover:bg-primary/90 rounded-lg shadow-md transition-all flex items-center gap-2"
                                >
                                    <CheckCircle size={18} />
                                    Save Changes
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <motion.div
                variants={itemVariants}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
                <div>
                    <h1 className="text-3xl font-bold text-text-primary flex items-center gap-2">
                        <BookOpen size={32} className="text-blue-600" />
                        Content Library
                    </h1>
                    <p className="text-text-secondary mt-1">Manage your educational assets across all subjects</p>
                </div>
                <div className="flex gap-2">
                    <div className="relative">
                        <select
                            value={selectedCategory}
                            onChange={(e) => setSelectedCategory(e.target.value)}
                            className="appearance-none bg-white border border-gray-300 text-text-primary pl-10 pr-4 py-2.5 rounded-lg font-medium hover:bg-gray-50 transition-all focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary cursor-pointer"
                        >
                            <option value="All">All Subjects</option>
                            {subjects.map(subject => (
                                <option key={subject} value={subject}>{subject}</option>
                            ))}
                        </select>
                        <Filter size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
                    </div>

                    <motion.button
                        onClick={() => setShowCreateModal(true)}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="bg-primary text-white px-4 py-2.5 rounded-lg font-medium hover:bg-primary/90 transition-all flex items-center gap-2 shadow-md"
                    >
                        <Plus size={18} /> Create
                    </motion.button>
                </div>
            </motion.div>

            {loading ? (
                <div className="flex justify-center items-center h-64">
                    <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }}>
                        <Loader className="text-primary" size={40} />
                    </motion.div>
                </div>
            ) : (
                <motion.div
                    variants={containerVariants}
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                >
                    {content.map((item) => (
                        <motion.div
                            key={item.id}
                            variants={itemVariants}
                            whileHover={{ y: -8, boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)' }}
                            className="bg-white rounded-2xl border border-gray-200 overflow-hidden group cursor-pointer"
                        >
                            <div className="h-40 bg-gradient-to-br from-gray-50 to-gray-100 relative group-hover:from-blue-50 group-hover:to-purple-50 transition-all flex items-center justify-center">
                                {item.type === 'Course' && <BookOpen size={48} className="text-gray-300 group-hover:text-primary/40 transition-colors" />}
                                {item.type === 'Video' && <Video size={48} className="text-gray-300 group-hover:text-primary/40 transition-colors" />}
                                {item.type === 'Article' && <FileText size={48} className="text-gray-300 group-hover:text-primary/40 transition-colors" />}

                                <div className="absolute top-3 right-3 flex gap-2">
                                    <motion.span
                                        whileHover={{ scale: 1.05 }}
                                        className="bg-white/95 backdrop-blur-sm px-2.5 py-1 rounded-lg text-xs font-bold uppercase tracking-wider text-primary shadow-md"
                                    >
                                        {item.type}
                                    </motion.span>
                                </div>

                                <div className="absolute bottom-3 left-3">
                                    <span className="bg-black/60 text-white px-3 py-1 rounded-full text-xs font-semibold backdrop-blur-sm">
                                        {item.category}
                                    </span>
                                </div>
                            </div>
                            <div className="p-5">
                                <h3 className="font-bold text-lg text-text-primary mb-2 group-hover:text-primary transition-colors line-clamp-2">{item.title}</h3>
                                <div className="flex items-center text-sm text-text-secondary mb-4">
                                    <span className="font-medium mr-2">{item.author || 'Unknown'}</span>
                                    <span className="text-gray-300">•</span>
                                    <span className="ml-2 text-xs">{new Date(item.updated_at).toLocaleDateString()}</span>
                                </div>

                                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                                    <div className="text-xs font-semibold bg-blue-50 text-blue-700 px-3 py-1.5 rounded-full">
                                        {item.modules || 1} {item.modules === 1 ? 'Unit' : 'Modules'}
                                    </div>
                                    <motion.button
                                        whileHover={{ x: 3 }}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleEdit(item);
                                        }}
                                        className="text-primary text-sm font-semibold hover:underline"
                                    >
                                        Edit →
                                    </motion.button>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </motion.div>
            )}
        </motion.div>
    );
}
