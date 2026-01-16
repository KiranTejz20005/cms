import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Play, Pause, Volume2, VolumeX } from 'lucide-react';

interface ShortsVideoPlayerProps {
    videoUrl: string;
    thumbnailUrl: string;
    title: string;
    isVisible: boolean;
    onViewTracked: (duration: number) => void;
}

export function ShortsVideoPlayer({
    videoUrl,
    thumbnailUrl,
    title,
    isVisible,
    onViewTracked
}: ShortsVideoPlayerProps) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isMuted, setIsMuted] = useState(false);
    const [progress, setProgress] = useState(0);
    const [duration, setDuration] = useState(0);
    const [showControls, setShowControls] = useState(true);
    const controlsTimeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
    const watchStartTimeRef = useRef<number>(0);

    // Handle visibility changes - auto play/pause
    useEffect(() => {
        if (!videoRef.current) return;

        if (isVisible) {
            // Auto-play when visible
            videoRef.current.play().catch(err => {
                console.warn('Autoplay failed:', err);
                // Browser blocked autoplay, user will need to click play
            });
            setIsPlaying(true);
            watchStartTimeRef.current = Date.now();
        } else {
            // Auto-pause when not visible
            videoRef.current.pause();
            setIsPlaying(false);

            // Track view time when leaving
            if (watchStartTimeRef.current > 0) {
                const watchedTime = (Date.now() - watchStartTimeRef.current) / 1000;
                onViewTracked(watchedTime);
                watchStartTimeRef.current = 0;
            }
        }
    }, [isVisible, onViewTracked]);

    // Clean up video resources when unmounting
    useEffect(() => {
        return () => {
            if (videoRef.current) {
                videoRef.current.pause();
                videoRef.current.currentTime = 0;
                videoRef.current.src = '';
            }
        };
    }, []);

    const handlePlayPause = () => {
        if (!videoRef.current) return;

        if (isPlaying) {
            videoRef.current.pause();
            setIsPlaying(false);
        } else {
            videoRef.current.play().catch(err => console.warn('Play failed:', err));
            setIsPlaying(true);
        }
    };

    const handleMuteToggle = () => {
        if (!videoRef.current) return;
        videoRef.current.muted = !isMuted;
        setIsMuted(!isMuted);
    };

    const handleTimeUpdate = () => {
        if (!videoRef.current) return;
        setProgress((videoRef.current.currentTime / videoRef.current.duration) * 100);
    };

    const handleLoadedMetadata = () => {
        if (!videoRef.current) return;
        setDuration(videoRef.current.duration);
    };

    const handleVideoEnd = () => {
        setIsPlaying(false);
        if (videoRef.current) {
            videoRef.current.currentTime = 0;
        }
    };

    const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!videoRef.current) return;
        const rect = e.currentTarget.getBoundingClientRect();
        const percent = (e.clientX - rect.left) / rect.width;
        videoRef.current.currentTime = percent * videoRef.current.duration;
    };

    const handleMouseMove = () => {
        setShowControls(true);
        if (controlsTimeoutRef.current) {
            clearTimeout(controlsTimeoutRef.current);
        }
        controlsTimeoutRef.current = setTimeout(() => {
            if (isPlaying) {
                setShowControls(false);
            }
        }, 3000);
    };

    const formatTime = (seconds: number) => {
        if (!seconds || isNaN(seconds)) return '0:00';
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <div
            className="relative w-full h-full bg-black overflow-hidden"
            onMouseMove={handleMouseMove}
        >
            {/* Video Element */}
            <video
                ref={videoRef}
                src={videoUrl}
                poster={thumbnailUrl}
                className="w-full h-full object-cover"
                onTimeUpdate={handleTimeUpdate}
                onLoadedMetadata={handleLoadedMetadata}
                onEnded={handleVideoEnd}
                playsInline
                controlsList="nodownload"
            />

            {/* Gradient Overlay */}
            <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-black/30 via-transparent to-black/40" />

            {/* Title Overlay */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: showControls ? 1 : 0 }}
                transition={{ duration: 0.3 }}
                className="absolute bottom-0 left-0 right-0 p-4 pointer-events-none"
            >
                <h3 className="text-white font-semibold text-sm line-clamp-2 drop-shadow-lg">
                    {title}
                </h3>
            </motion.div>

            {/* Center Play Button */}
            {!isPlaying && (
                <motion.button
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.8, opacity: 0 }}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handlePlayPause}
                    className="absolute inset-0 m-auto w-16 h-16 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full flex items-center justify-center transition-all z-10"
                    title="Play video"
                >
                    <Play size={32} className="text-white fill-white ml-1" />
                </motion.button>
            )}

            {/* Controls Container */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: showControls ? 1 : 0 }}
                transition={{ duration: 0.3 }}
                className="absolute top-0 left-0 right-0 z-20 pointer-events-none"
            >
                {/* Progress Bar */}
                <div
                    className="w-full h-1 bg-white/20 cursor-pointer hover:h-1.5 transition-all pointer-events-auto"
                    onClick={handleProgressClick}
                    title="Seek video"
                >
                    <div
                        className="h-full bg-white transition-all"
                        style={{ width: `${progress}%` }}
                    />
                </div>
            </motion.div>

            {/* Bottom Controls */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: showControls ? 1 : 0 }}
                transition={{ duration: 0.3 }}
                className="absolute bottom-4 right-4 flex items-center gap-3 z-20 pointer-events-auto"
            >
                {/* Volume Control */}
                <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleMuteToggle}
                    className="w-10 h-10 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full flex items-center justify-center text-white transition-all"
                    title={isMuted ? 'Unmute' : 'Mute'}
                >
                    {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
                </motion.button>

                {/* Play/Pause Button */}
                <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handlePlayPause}
                    className="w-10 h-10 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full flex items-center justify-center text-white transition-all"
                    title={isPlaying ? 'Pause' : 'Play'}
                >
                    {isPlaying ? <Pause size={20} /> : <Play size={20} className="ml-0.5" />}
                </motion.button>
            </motion.div>

            {/* Time Display */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: showControls ? 1 : 0 }}
                transition={{ duration: 0.3 }}
                className="absolute bottom-4 left-4 text-white text-xs font-medium drop-shadow-lg z-20"
            >
                {formatTime(videoRef.current?.currentTime ?? 0)} / {formatTime(duration)}
            </motion.div>

            {/* Loading State */}
            {!videoUrl && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-white" />
                </div>
            )}
        </div>
    );
}
