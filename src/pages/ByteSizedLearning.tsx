import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Loader, AlertCircle } from 'lucide-react';
import { videoService, type ShortVideo, type VideoCategory, initializeDefaultCategories } from '../lib/videoService';
import { ShortsVideoPlayer } from '../components/ShortsVideoPlayer';
import { EngagementSidebar } from '../components/EngagementSidebar';
import { MediaUpload } from '../components/MediaUpload';
import { DebugSyncPanel } from '../components/DebugSyncPanel';

interface FeedState {
    videos: ShortVideo[];
    categories: VideoCategory[];
    selectedCategoryId: string;
    currentVideoIndex: number;
    loading: boolean;
    error: string | null;
    showUploadModal: boolean;
}

export function ByteSizedLearning() {
    const [state, setState] = useState<FeedState>({
        videos: [],
        categories: [],
        selectedCategoryId: '',
        currentVideoIndex: 0,
        loading: true,
        error: null,
        showUploadModal: false,
    });

    const lastVisibleRef = useRef<any>(null);
    const touchStartY = useRef(0);
    const containerRef = useRef<HTMLDivElement>(null);
    const categoriesLoadedRef = useRef(false);

    // Load categories on mount (only once)
    useEffect(() => {
        if (categoriesLoadedRef.current) return;
        categoriesLoadedRef.current = true;

        const loadCategories = async () => {
            try {
                let cats = await videoService.getCategories();
                if (cats.length === 0) {
                    console.log('No categories found, initializing defaults...');
                    cats = await initializeDefaultCategories();
                }
                setState(prev => ({
                    ...prev,
                    categories: cats,
                    selectedCategoryId: cats.length > 0 ? cats[0].id : '',
                }));
            } catch (err) {
                console.error('Error loading categories:', err);
                setState(prev => ({
                    ...prev,
                    error: 'Failed to load categories',
                    loading: false,
                }));
            }
        };

        loadCategories();
    }, []);

    // Load videos when category changes
    useEffect(() => {
        if (!state.selectedCategoryId) return;

        const loadVideos = async () => {
            setState(prev => ({
                ...prev,
                loading: true,
                error: null,
                currentVideoIndex: 0,
                videos: [],
            }));
            lastVisibleRef.current = null;

            try {
                const result = await videoService.getVideosFeed(state.selectedCategoryId, 10);
                setState(prev => ({
                    ...prev,
                    videos: result.videos,
                    loading: false,
                }));
                lastVisibleRef.current = result.lastVisible;
            } catch (err) {
                console.error('Error loading videos:', err);
                setState(prev => ({
                    ...prev,
                    error: 'Failed to load videos',
                    loading: false,
                    videos: [],
                }));
            }
        };

        loadVideos();
    }, [state.selectedCategoryId]);

    // Handle keyboard navigation
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'ArrowUp') {
                e.preventDefault();
                setState(prev => ({
                    ...prev,
                    currentVideoIndex: Math.max(prev.currentVideoIndex - 1, 0),
                }));
            } else if (e.key === 'ArrowDown') {
                e.preventDefault();
                setState(prev => ({
                    ...prev,
                    currentVideoIndex: Math.min(prev.currentVideoIndex + 1, prev.videos.length - 1),
                }));
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    const handleCategoryChange = (categoryId: string) => {
        setState(prev => ({
            ...prev,
            selectedCategoryId: categoryId,
        }));
    };

    const handleTouchStart = (e: React.TouchEvent) => {
        touchStartY.current = e.touches[0].clientY;
    };

    const handleTouchEnd = (e: React.TouchEvent) => {
        const touchEndY = e.changedTouches[0].clientY;
        const diff = touchStartY.current - touchEndY;

        if (diff > 50) {
            // Swipe up (next video)
            setState(prev => ({
                ...prev,
                currentVideoIndex: Math.min(prev.currentVideoIndex + 1, prev.videos.length - 1),
            }));
        } else if (diff < -50) {
            // Swipe down (previous video)
            setState(prev => ({
                ...prev,
                currentVideoIndex: Math.max(prev.currentVideoIndex - 1, 0),
            }));
        }
    };

    const handleUploadSuccess = () => {
        setState(prev => ({
            ...prev,
            showUploadModal: false,
        }));
        // Reload current category videos
        if (state.selectedCategoryId) {
            setState(prev => ({
                ...prev,
                selectedCategoryId: prev.selectedCategoryId, // Trigger reload
            }));
        }
    };

    const currentVideo = state.videos[state.currentVideoIndex];

    return (
        <div className="fixed inset-0 bg-black flex items-center justify-center overflow-hidden">
            {/* Media Upload Modal */}
            <MediaUpload
                isOpen={state.showUploadModal}
                onClose={() => setState(prev => ({ ...prev, showUploadModal: false }))}
                categories={state.categories}
                onUploadSuccess={handleUploadSuccess}
            />

            {/* Header Bar */}
            <div className="absolute top-0 left-0 right-0 z-30 p-4 bg-gradient-to-b from-black/70 via-black/40 to-transparent backdrop-blur-sm">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <motion.h1 
                        className="text-white font-bold text-xl drop-shadow-2xl"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                    >
                        Byte Sized Learning
                    </motion.h1>
                    <motion.button
                        whileHover={{ scale: 1.08, y: -2 }}
                        whileTap={{ scale: 0.92 }}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        onClick={() => setState(prev => ({ ...prev, showUploadModal: true }))}
                        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-600 text-white rounded-full text-sm font-semibold transition-all shadow-lg hover:shadow-blue-500/50"
                    >
                        <Plus size={18} />
                        Upload
                    </motion.button>
                </div>
            </div>

            {/* Category Navigation */}
            {state.categories.length > 0 && (
                <div className="absolute top-16 left-0 right-0 z-30 px-4 py-3 bg-gradient-to-b from-black/50 to-transparent backdrop-blur-sm">
                    <div className="max-w-7xl mx-auto flex gap-3 overflow-x-auto scrollbar-hide">
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleCategoryChange(state.categories[0].id)}
                            className={`px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-all shadow-lg ${
                                state.selectedCategoryId === state.categories[0].id
                                    ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-blue-500/50'
                                    : 'bg-white/20 text-white hover:bg-white/30 backdrop-blur-md'
                            }`}
                        >
                            All
                        </motion.button>
                        {state.categories.map(category => (
                            <motion.button
                                key={category.id}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => handleCategoryChange(category.id)}
                                className={`px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-all shadow-lg ${
                                    state.selectedCategoryId === category.id
                                        ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-blue-500/50'
                                        : 'bg-white/20 text-white hover:bg-white/30 backdrop-blur-md'
                                }`}
                            >
                                {category.name}
                            </motion.button>
                        ))}
                    </div>
                </div>
            )}

            {/* Loading State */}
            {state.loading && (
                <div className="flex items-center justify-center h-full">
                    <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                        className="text-white"
                    >
                        <Loader size={48} />
                    </motion.div>
                </div>
            )}

            {/* Error State */}
            {state.error && !state.loading && (
                <motion.div 
                    className="flex flex-col items-center justify-center h-full gap-4 p-4"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                >
                    <motion.div
                        animate={{ 
                            rotate: [0, 10, -10, 10, 0],
                            scale: [1, 1.1, 1.1, 1.1, 1]
                        }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                    >
                        <AlertCircle size={64} className="text-red-500" />
                    </motion.div>
                    <p className="text-white text-center text-lg font-semibold">{state.error}</p>
                    <motion.button
                        whileHover={{ scale: 1.1, y: -2 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => window.location.reload()}
                        className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-600 text-white rounded-full transition-all font-semibold shadow-lg hover:shadow-blue-500/50"
                    >
                        Retry
                    </motion.button>
                </motion.div>
            )}

            {/* Empty State */}
            {!state.loading && state.videos.length === 0 && !state.error && (
                <motion.div 
                    className="flex flex-col items-center justify-center h-full gap-4 p-4"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                >
                    <motion.div
                        animate={{ 
                            y: [0, -10, 0],
                            rotate: [0, 5, -5, 0]
                        }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="text-8xl"
                    >
                        📭
                    </motion.div>
                    <p className="text-white text-center text-xl font-semibold">No videos in this category yet</p>
                    <motion.button
                        whileHover={{ scale: 1.1, y: -2 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => setState(prev => ({ ...prev, showUploadModal: true }))}
                        className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-600 text-white rounded-full transition-all flex items-center gap-2 font-semibold shadow-lg hover:shadow-blue-500/50"
                    >
                        <Plus size={20} />
                        Upload First Video
                    </motion.button>
                </motion.div>
            )}

            {/* Videos Feed */}
            {!state.loading && state.videos.length > 0 && currentVideo && (
                <div
                    ref={containerRef}
                    className="w-full h-full overflow-hidden flex"
                    onTouchStart={handleTouchStart}
                    onTouchEnd={handleTouchEnd}
                >
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={currentVideo.id}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="w-full h-full flex-shrink-0 relative"
                        >
                            {/* Video Player */}
                            <ShortsVideoPlayer
                                videoUrl={currentVideo.videoUrl}
                                thumbnailUrl={currentVideo.thumbnailUrl}
                                title={currentVideo.title}
                                isVisible={true}
                                onViewTracked={(duration) => {
                                    videoService.trackView(currentVideo.id, duration).catch(err =>
                                        console.error('Error tracking view:', err)
                                    );
                                }}
                            />

                            {/* Engagement Sidebar */}
                            <EngagementSidebar
                                videoId={currentVideo.id}
                                initialLikes={currentVideo.likes}
                                initialSaves={currentVideo.saves}
                                initialShares={currentVideo.shares}
                                initialViews={currentVideo.views}
                            />

                            {/* Video Info Overlay */}
                            <div className="absolute bottom-0 left-0 right-0 z-20 p-4 bg-gradient-to-t from-black/80 via-black/40 to-transparent">
                                <div className="max-w-sm">
                                    <h2 className="text-white font-bold text-lg drop-shadow-lg line-clamp-2">
                                        {currentVideo.title}
                                    </h2>
                                    <p className="text-white/80 text-sm mt-1 line-clamp-2 drop-shadow-lg">
                                        {currentVideo.description}
                                    </p>
                                    <div className="mt-2 flex flex-wrap gap-1">
                                        <span className="text-xs px-2 py-1 bg-blue-600 rounded-full text-white">
                                            {state.categories.find(c => c.id === currentVideo.category)?.name || 'Video'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </AnimatePresence>

                    {/* Video Counter */}
                    <div className="absolute bottom-8 right-4 z-20 text-white text-xs font-medium bg-black/40 backdrop-blur-sm px-3 py-1.5 rounded-full">
                        {state.currentVideoIndex + 1} / {state.videos.length}
                    </div>

                    {/* Navigation Hints */}
                    {state.videos.length > 1 && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 2 }}
                            className="absolute bottom-20 left-1/2 -translate-x-1/2 z-20 text-white/60 text-xs text-center pointer-events-none"
                        >
                            <p>⬆️ Swipe up for next • Swipe down for previous</p>
                        </motion.div>
                    )}
                </div>
            )}

            {/* Debug Sync Panel */}
            <DebugSyncPanel />
        </div>
    );
}
