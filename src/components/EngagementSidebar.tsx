import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Heart, Share2, Bookmark, Eye } from 'lucide-react';
import { videoService } from '../lib/videoService';

interface EngagementSidebarProps {
    videoId: string;
    initialLikes: number;
    initialSaves: number;
    initialShares: number;
    initialViews: number;
}

export function EngagementSidebar({
    videoId,
    initialLikes,
    initialSaves,
    initialShares,
    initialViews
}: EngagementSidebarProps) {
    const [isLiked, setIsLiked] = useState(false);
    const [isSaved, setIsSaved] = useState(false);
    const [likes, setLikes] = useState(initialLikes);
    const [saves, setSaves] = useState(initialSaves);
    const [shares, setShares] = useState(initialShares);
    const [loading, setLoading] = useState(false);

    // Load user interactions on mount
    useEffect(() => {
        const loadInteractions = async () => {
            try {
                const interaction = await videoService.getUserInteractions(videoId);
                if (interaction) {
                    setIsLiked(interaction.liked || false);
                    setIsSaved(interaction.saved || false);
                }
            } catch (error) {
                console.error('Error loading interactions:', error);
            }
        };

        loadInteractions();
    }, [videoId]);

    const handleLikeToggle = async () => {
        setLoading(true);
        try {
            const newLikedState = await videoService.toggleLike(videoId);
            setIsLiked(newLikedState);
            setLikes(prev => newLikedState ? prev + 1 : prev - 1);
        } catch (error) {
            console.error('Error toggling like:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSaveToggle = async () => {
        setLoading(true);
        try {
            const newSavedState = await videoService.toggleSave(videoId);
            setIsSaved(newSavedState);
            setSaves(prev => newSavedState ? prev + 1 : prev - 1);
        } catch (error) {
            console.error('Error toggling save:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleShare = async () => {
        try {
            const shareData = {
                title: 'Check out this Byte-Sized Learning video!',
                text: 'Watch amazing short educational videos',
                url: window.location.href
            };

            if (navigator.share) {
                await navigator.share(shareData);
                await videoService.trackShare(videoId);
                setShares(prev => prev + 1);
            } else {
                // Fallback: copy to clipboard
                await navigator.clipboard.writeText(window.location.href);
                alert('Link copied to clipboard!');
                await videoService.trackShare(videoId);
                setShares(prev => prev + 1);
            }
        } catch (error) {
            console.error('Error sharing:', error);
        }
    };

    const formatCount = (count: number) => {
        if (count >= 1000000) {
            return (count / 1000000).toFixed(1) + 'M';
        } else if (count >= 1000) {
            return (count / 1000).toFixed(1) + 'K';
        }
        return count.toString();
    };

    return (
        <div className="fixed right-4 bottom-24 flex flex-col gap-6 z-20">
            {/* Like Button */}
            <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleLikeToggle}
                disabled={loading}
                className="flex flex-col items-center gap-1"
                title="Like"
            >
                <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                    isLiked
                        ? 'bg-error text-white scale-110'
                        : 'bg-white/20 hover:bg-white/30 text-white backdrop-blur-sm'
                }`}>
                    <Heart
                        size={24}
                        className={isLiked ? 'fill-white' : ''}
                    />
                </div>
                <span className="text-white text-xs font-medium drop-shadow-lg">
                    {formatCount(likes)}
                </span>
            </motion.button>

            {/* Save Button */}
            <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleSaveToggle}
                disabled={loading}
                className="flex flex-col items-center gap-1"
                title="Save"
            >
                <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                    isSaved
                        ? 'bg-primary text-white scale-110'
                        : 'bg-white/20 hover:bg-white/30 text-white backdrop-blur-sm'
                }`}>
                    <Bookmark
                        size={24}
                        className={isSaved ? 'fill-white' : ''}
                    />
                </div>
                <span className="text-white text-xs font-medium drop-shadow-lg">
                    {formatCount(saves)}
                </span>
            </motion.button>

            {/* Share Button */}
            <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleShare}
                className="flex flex-col items-center gap-1"
                title="Share"
            >
                <div className="w-12 h-12 rounded-full bg-white/20 hover:bg-white/30 text-white backdrop-blur-sm flex items-center justify-center transition-all">
                    <Share2 size={24} />
                </div>
                <span className="text-white text-xs font-medium drop-shadow-lg">
                    {formatCount(shares)}
                </span>
            </motion.button>

            {/* Views */}
            <div className="flex flex-col items-center gap-1 pt-2">
                <div className="w-12 h-12 rounded-full bg-white/10 text-white backdrop-blur-sm flex items-center justify-center">
                    <Eye size={24} />
                </div>
                <span className="text-white text-xs font-medium drop-shadow-lg">
                    {formatCount(initialViews)}
                </span>
            </div>
        </div>
    );
}
