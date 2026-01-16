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
            <div className="absolute top-0 left-0 right-0 z-30 p-4 bg-gradient-to-b from-black/60 to-transparent">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <h1 className="text-white font-bold text-lg drop-shadow-lg">Byte Sized Learning</h1>
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setState(prev => ({ ...prev, showUploadModal: true }))}
                        className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-full text-sm font-medium transition-colors"
                    >
                        <Plus size={16} />
                        Upload
                    </motion.button>
                </div>
            </div>

            {/* Category Navigation */}
            {state.categories.length > 0 && (
                <div className="absolute top-16 left-0 right-0 z-30 px-4 py-2 bg-gradient-to-b from-black/40 to-transparent">
                    <div className="max-w-7xl mx-auto flex gap-2 overflow-x-auto scrollbar-hide">
                        <button
                            onClick={() => handleCategoryChange(state.categories[0].id)}
                            className={`px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                                state.selectedCategoryId === state.categories[0].id
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-white/10 text-white hover:bg-white/20 backdrop-blur-sm'
                            }`}
                        >
                            All
                        </button>
                        {state.categories.map(category => (
                            <button
                                key={category.id}
                                onClick={() => handleCategoryChange(category.id)}
                                className={`px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                                    state.selectedCategoryId === category.id
                                        ? 'bg-blue-600 text-white'
                                        : 'bg-white/10 text-white hover:bg-white/20 backdrop-blur-sm'
                                }`}
                            >
                                {category.name}
                            </button>
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
                <div className="flex flex-col items-center justify-center h-full gap-4 p-4">
                    <AlertCircle size={48} className="text-red-500" />
                    <p className="text-white text-center">{state.error}</p>
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => window.location.reload()}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                    >
                        Retry
                    </motion.button>
                </div>
            )}

            {/* Empty State */}
            {!state.loading && state.videos.length === 0 && !state.error && (
                <div className="flex flex-col items-center justify-center h-full gap-4 p-4">
                    <div className="text-6xl">📭</div>
                    <p className="text-white text-center">No videos in this category yet</p>
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setState(prev => ({ ...prev, showUploadModal: true }))}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center gap-2"
                    >
                        <Plus size={18} />
                        Upload First Video
                    </motion.button>
                </div>
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
