import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, X, CheckCircle2, AlertCircle, FileVideo, Image as ImageIcon, Loader } from 'lucide-react';
import { videoService } from '../lib/videoService';

interface VideoUploadProps {
    isOpen: boolean;
    onClose: () => void;
    categories: Array<{ id: string; name: string }>;
    onUploadSuccess: (videoId: string) => void;
}

const MAX_VIDEO_DURATION = 60; // seconds
const MIN_VIDEO_DURATION = 5; // seconds
const MAX_VIDEO_SIZE = 100 * 1024 * 1024; // 100 MB
const REQUIRED_ASPECT_RATIO = 9 / 16;
const ASPECT_RATIO_TOLERANCE = 0.02;

export function VideoUpload({ isOpen, onClose, categories, onUploadSuccess }: VideoUploadProps) {
    const [step, setStep] = useState<'upload' | 'details'>('upload');
    const [videoFile, setVideoFile] = useState<File | null>(null);
    const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
    const [videoPreview, setVideoPreview] = useState<string>('');
    const [thumbnailPreview, setThumbnailPreview] = useState<string>('');
    const [dragActive, setDragActive] = useState(false);
    const [loading, setLoading] = useState(false);
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        category: '',
        duration: 0,
        aspectRatio: ''
    });

    const videoInputRef = useRef<HTMLInputElement>(null);
    const thumbnailInputRef = useRef<HTMLInputElement>(null);

    const showToast = (message: string, type: 'success' | 'error') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3000);
    };

    const validateVideoFile = async (file: File): Promise<{ valid: boolean; error?: string; metadata?: any }> => {
        // Check file type
        if (!file.type.startsWith('video/')) {
            return { valid: false, error: 'File must be a video' };
        }

        // Check file size
        if (file.size > MAX_VIDEO_SIZE) {
            return { valid: false, error: `Video size must be less than ${MAX_VIDEO_SIZE / (1024 * 1024)}MB` };
        }

        // Get video metadata
        return new Promise((resolve) => {
            const video = document.createElement('video');
            video.onloadedmetadata = () => {
                const duration = video.duration;
                const width = video.videoWidth;
                const height = video.videoHeight;
                const aspectRatio = width / height;
                const expectedRatio = REQUIRED_ASPECT_RATIO;
                const isCorrectAspectRatio = Math.abs(aspectRatio - expectedRatio) < ASPECT_RATIO_TOLERANCE;

                if (duration < MIN_VIDEO_DURATION || duration > MAX_VIDEO_DURATION) {
                    resolve({
                        valid: false,
                        error: `Video duration must be between ${MIN_VIDEO_DURATION}s and ${MAX_VIDEO_DURATION}s (current: ${Math.round(duration)}s)`
                    });
                } else if (!isCorrectAspectRatio) {
                    resolve({
                        valid: false,
                        error: `Video must be in 9:16 vertical format (current: ${aspectRatio.toFixed(2)}:1)`
                    });
                } else {
                    resolve({
                        valid: true,
                        metadata: {
                            duration,
                            width,
                            height,
                            aspectRatio: `${width}:${height}`
                        }
                    });
                }
            };
            video.onerror = () => {
                resolve({ valid: false, error: 'Could not read video file' });
            };
            video.src = URL.createObjectURL(file);
        });
    };

    const handleVideoDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(true);
    };

    const handleVideoDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
    };

    const handleVideoDrop = async (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        const files = e.dataTransfer.files;
        if (files.length > 0) {
            await handleVideoSelect(files[0]);
        }
    };

    const handleVideoSelect = async (file: File) => {
        const validation = await validateVideoFile(file);
        if (!validation.valid) {
            showToast(validation.error || 'Invalid video', 'error');
            return;
        }

        setVideoFile(file);
        setFormData(prev => ({
            ...prev,
            duration: validation.metadata?.duration || 0,
            aspectRatio: validation.metadata?.aspectRatio || '9:16'
        }));

        // Create preview
        const preview = URL.createObjectURL(file);
        setVideoPreview(preview);
        showToast('Video validated successfully!', 'success');
    };

    const handleThumbnailSelect = async (file: File) => {
        if (!file.type.startsWith('image/')) {
            showToast('Thumbnail must be an image', 'error');
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            showToast('Thumbnail size must be less than 5MB', 'error');
            return;
        }

        setThumbnailFile(file);
        const preview = URL.createObjectURL(file);
        setThumbnailPreview(preview);
        showToast('Thumbnail selected', 'success');
    };

    const handleVideoInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            handleVideoSelect(e.target.files[0]);
        }
    };

    const handleThumbnailInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            handleThumbnailSelect(e.target.files[0]);
        }
    };

    const handleGenerateThumbnail = async () => {
        if (!videoFile || !videoPreview) {
            showToast('Video required to generate thumbnail', 'error');
            return;
        }

        try {
            setLoading(true);
            const video = document.createElement('video');
            video.onloadedmetadata = () => {
                video.currentTime = video.duration / 2;
            };
            video.onseeked = () => {
                const canvas = document.createElement('canvas');
                canvas.width = video.videoWidth;
                canvas.height = video.videoHeight;
                const ctx = canvas.getContext('2d');
                if (ctx) {
                    ctx.drawImage(video, 0, 0);
                    canvas.toBlob((blob) => {
                        if (blob) {
                            const file = new File([blob], 'thumbnail.jpg', { type: 'image/jpeg' });
                            setThumbnailFile(file);
                            setThumbnailPreview(canvas.toDataURL());
                            showToast('Thumbnail generated!', 'success');
                        }
                        setLoading(false);
                    }, 'image/jpeg', 0.9);
                }
            };
            video.src = videoPreview;
        } catch (error) {
            console.error('Error generating thumbnail:', error);
            showToast('Failed to generate thumbnail', 'error');
            setLoading(false);
        }
    };

    const handleUpload = async () => {
        if (!videoFile || !thumbnailFile) {
            showToast('Please select both video and thumbnail', 'error');
            return;
        }

        if (!formData.title || !formData.description || !formData.category) {
            showToast('Please fill in all required fields', 'error');
            return;
        }

        try {
            setLoading(true);
            const videoId = await videoService.uploadVideo(videoFile, thumbnailFile, {
                title: formData.title,
                description: formData.description,
                category: formData.category,
                duration: formData.duration,
                aspectRatio: '9:16',
                fileSize: videoFile.size
            } as any);

            showToast('Video uploaded! Processing in progress...', 'success');
            onUploadSuccess(videoId);
            handleClose();
        } catch (error) {
            console.error('Upload error:', error);
            showToast(error instanceof Error ? error.message : 'Upload failed', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        setStep('upload');
        setVideoFile(null);
        setThumbnailFile(null);
        setVideoPreview('');
        setThumbnailPreview('');
        setFormData({
            title: '',
            description: '',
            category: '',
            duration: 0,
            aspectRatio: ''
        });
        onClose();
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
                onClick={handleClose}
            >
                <motion.div
                    initial={{ scale: 0.95, y: 20 }}
                    animate={{ scale: 1, y: 0 }}
                    exit={{ scale: 0.95, y: 20 }}
                    className="bg-surface rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Header */}
                    <div className="flex items-center justify-between p-6 border-b border-border sticky top-0 bg-surface z-10">
                        <h2 className="text-xl font-bold text-text-primary">
                            {step === 'upload' ? 'Upload Video' : 'Video Details'}
                        </h2>
                        <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={handleClose}
                            className="p-1.5 hover:bg-background-secondary rounded-lg transition-colors"
                        >
                            <X size={20} />
                        </motion.button>
                    </div>

                    {/* Toast */}
                    <AnimatePresence>
                        {toast && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className={`fixed top-4 right-4 px-4 py-3 rounded-lg flex items-center gap-2 z-50 ${
                                    toast.type === 'success'
                                        ? 'bg-success text-white'
                                        : 'bg-error text-white'
                                }`}
                            >
                                {toast.type === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
                                {toast.message}
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Content */}
                    <div className="p-6 space-y-6">
                        {step === 'upload' ? (
                            <>
                                {/* Video Upload */}
                                <div>
                                    <label className="block text-sm font-medium text-text-primary mb-3">Video *</label>
                                    <div
                                        onDragEnter={handleVideoDrag}
                                        onDragLeave={handleVideoDragLeave}
                                        onDragOver={handleVideoDrag}
                                        onDrop={handleVideoDrop}
                                        onClick={() => videoInputRef.current?.click()}
                                        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all ${
                                            dragActive
                                                ? 'border-primary bg-primary-light/10'
                                                : 'border-border hover:border-primary/50'
                                        }`}
                                    >
                                        {videoPreview ? (
                                            <div className="space-y-3">
                                                <CheckCircle2 className="mx-auto text-success" size={32} />
                                                <p className="text-sm font-medium text-text-primary">Video validated ✓</p>
                                                <p className="text-xs text-text-tertiary">
                                                    {Math.round(formData.duration)}s • {((videoFile?.size ?? 0) / (1024 * 1024)).toFixed(2)}MB
                                                </p>
                                            </div>
                                        ) : (
                                            <>
                                                <FileVideo className="mx-auto mb-3 text-text-tertiary" size={32} />
                                                <p className="text-sm font-medium text-text-primary">Drop your video here</p>
                                                <p className="text-xs text-text-tertiary mt-1">
                                                    9:16 vertical • 5-60 seconds • Max 100MB
                                                </p>
                                            </>
                                        )}
                                        <input
                                            ref={videoInputRef}
                                            type="file"
                                            className="hidden"
                                            onChange={handleVideoInputChange}
                                            accept="video/*"
                                        />
                                    </div>
                                </div>

                                {/* Thumbnail Upload */}
                                {videoFile && (
                                    <div>
                                        <div className="flex items-center justify-between mb-3">
                                            <label className="block text-sm font-medium text-text-primary">Thumbnail *</label>
                                            {videoPreview && (
                                                <motion.button
                                                    whileHover={{ scale: 1.05 }}
                                                    whileTap={{ scale: 0.95 }}
                                                    onClick={handleGenerateThumbnail}
                                                    disabled={loading}
                                                    className="text-xs font-medium text-primary hover:text-primary-600 transition-colors disabled:opacity-50"
                                                >
                                                    {loading ? 'Generating...' : 'Auto-generate'}
                                                </motion.button>
                                            )}
                                        </div>

                                        <div
                                            onClick={() => thumbnailInputRef.current?.click()}
                                            className="border-2 border-dashed border-border hover:border-primary/50 rounded-lg p-8 text-center cursor-pointer transition-all"
                                        >
                                            {thumbnailPreview ? (
                                                <div className="space-y-3">
                                                    <img
                                                        src={thumbnailPreview}
                                                        alt="Thumbnail preview"
                                                        className="w-24 h-32 object-cover mx-auto rounded"
                                                    />
                                                    <p className="text-sm font-medium text-text-primary">Thumbnail ready ✓</p>
                                                </div>
                                            ) : (
                                                <>
                                                    <ImageIcon className="mx-auto mb-3 text-text-tertiary" size={32} />
                                                    <p className="text-sm font-medium text-text-primary">Upload thumbnail</p>
                                                    <p className="text-xs text-text-tertiary mt-1">JPG, PNG • Max 5MB</p>
                                                </>
                                            )}
                                            <input
                                                ref={thumbnailInputRef}
                                                type="file"
                                                className="hidden"
                                                onChange={handleThumbnailInputChange}
                                                accept="image/*"
                                            />
                                        </div>
                                    </div>
                                )}

                                {/* Next Button */}
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => setStep('details')}
                                    disabled={!videoFile || !thumbnailFile}
                                    className="w-full px-4 py-3 bg-primary text-white rounded-lg font-medium hover:bg-primary-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Continue to Details
                                </motion.button>
                            </>
                        ) : (
                            <>
                                {/* Title */}
                                <div>
                                    <label className="block text-sm font-medium text-text-primary mb-2">Title *</label>
                                    <input
                                        type="text"
                                        placeholder="e.g., Quick Math Trick"
                                        value={formData.title}
                                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                        className="w-full px-3 py-2 bg-background-secondary border border-border rounded-lg text-text-primary placeholder-text-tertiary focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                                    />
                                </div>

                                {/* Description */}
                                <div>
                                    <label className="block text-sm font-medium text-text-primary mb-2">Description *</label>
                                    <textarea
                                        placeholder="Describe the video content..."
                                        rows={3}
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        className="w-full px-3 py-2 bg-background-secondary border border-border rounded-lg text-text-primary placeholder-text-tertiary focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                                    />
                                </div>

                                {/* Category */}
                                <div>
                                    <label className="block text-sm font-medium text-text-primary mb-2">Category *</label>
                                    <select
                                        value={formData.category}
                                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                        className="w-full px-3 py-2 bg-background-secondary border border-border rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                                    >
                                        <option value="">Select a category</option>
                                        {categories.map(cat => (
                                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                                        ))}
                                    </select>
                                </div>

                                {/* Metadata Display */}
                                <div className="bg-background-secondary p-3 rounded-lg">
                                    <p className="text-xs text-text-tertiary mb-2 font-medium">Video Metadata</p>
                                    <div className="grid grid-cols-2 gap-2 text-xs">
                                        <div>
                                            <span className="text-text-tertiary">Duration:</span>
                                            <p className="text-text-primary font-medium">{Math.round(formData.duration)}s</p>
                                        </div>
                                        <div>
                                            <span className="text-text-tertiary">Aspect Ratio:</span>
                                            <p className="text-text-primary font-medium">9:16 ✓</p>
                                        </div>
                                        <div>
                                            <span className="text-text-tertiary">File Size:</span>
                                            <p className="text-text-primary font-medium">{((videoFile?.size ?? 0) / (1024 * 1024)).toFixed(2)}MB</p>
                                        </div>
                                        <div>
                                            <span className="text-text-tertiary">Status:</span>
                                            <p className="text-success font-medium">Ready</p>
                                        </div>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="p-6 border-t border-border bg-background-secondary flex gap-3">
                        {step === 'details' && (
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => setStep('upload')}
                                className="flex-1 px-4 py-2.5 border border-border rounded-lg font-medium text-text-primary hover:bg-background-tertiary transition-colors"
                            >
                                Back
                            </motion.button>
                        )}
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={handleClose}
                            className="flex-1 px-4 py-2.5 border border-border rounded-lg font-medium text-text-primary hover:bg-background-tertiary transition-colors"
                        >
                            Cancel
                        </motion.button>
                        {step === 'details' && (
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={handleUpload}
                                disabled={loading || !formData.title || !formData.description || !formData.category}
                                className="flex-1 px-4 py-2.5 bg-primary text-white rounded-lg font-medium hover:bg-primary-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {loading ? (
                                    <>
                                        <Loader size={18} className="animate-spin" />
                                        Uploading...
                                    </>
                                ) : (
                                    <>
                                        <Upload size={18} />
                                        Upload Video
                                    </>
                                )}
                            </motion.button>
                        )}
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}
