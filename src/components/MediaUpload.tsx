import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, X, CheckCircle2, AlertCircle, FileVideo, Image as ImageIcon, Loader, Film } from 'lucide-react';
import { videoService } from '../lib/videoService';

interface MediaUploadProps {
    isOpen: boolean;
    onClose: () => void;
    categories: Array<{ id: string; name: string }>;
    onUploadSuccess: (mediaId: string) => void;
}

type MediaType = 'image' | 'video' | 'short';

const MAX_VIDEO_DURATION = 60; // seconds for shorts
const MIN_VIDEO_DURATION = 5; // seconds for shorts
const MAX_VIDEO_SIZE = 100 * 1024 * 1024; // 100 MB
const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10 MB
const REQUIRED_ASPECT_RATIO = 9 / 16;
const ASPECT_RATIO_TOLERANCE = 0.02;

export function MediaUpload({ isOpen, onClose, categories, onUploadSuccess }: MediaUploadProps) {
    const [mediaType, setMediaType] = useState<MediaType>('video');
    const [step, setStep] = useState<'type' | 'upload' | 'details'>('type');
    const [mediaFile, setMediaFile] = useState<File | null>(null);
    const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
    const [mediaPreview, setMediaPreview] = useState<string>('');
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

    const mediaInputRef = useRef<HTMLInputElement>(null);
    const thumbnailInputRef = useRef<HTMLInputElement>(null);

    const showToast = (message: string, type: 'success' | 'error') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3000);
    };

    const validateVideoFile = async (file: File): Promise<{ valid: boolean; error?: string; metadata?: any }> => {
        if (!file.type.startsWith('video/')) {
            return { valid: false, error: 'File must be a video' };
        }

        if (file.size > MAX_VIDEO_SIZE) {
            return { valid: false, error: `Video size must be less than ${MAX_VIDEO_SIZE / (1024 * 1024)}MB` };
        }

        return new Promise((resolve) => {
            const video = document.createElement('video');
            video.onloadedmetadata = () => {
                const duration = video.duration;
                const width = video.videoWidth;
                const height = video.videoHeight;
                const aspectRatio = width / height;
                const expectedRatio = REQUIRED_ASPECT_RATIO;
                const isCorrectAspectRatio = Math.abs(aspectRatio - expectedRatio) < ASPECT_RATIO_TOLERANCE;

                if (mediaType === 'short') {
                    if (duration < MIN_VIDEO_DURATION || duration > MAX_VIDEO_DURATION) {
                        resolve({
                            valid: false,
                            error: `Short duration must be between ${MIN_VIDEO_DURATION}s and ${MAX_VIDEO_DURATION}s (current: ${Math.round(duration)}s)`
                        });
                    } else if (!isCorrectAspectRatio) {
                        resolve({
                            valid: false,
                            error: `Short must be in 9:16 vertical format (current: ${aspectRatio.toFixed(2)}:1)`
                        });
                    } else {
                        resolve({
                            valid: true,
                            metadata: { duration, width, height, aspectRatio: `${width}:${height}` }
                        });
                    }
                } else {
                    // For regular videos, just check size
                    resolve({
                        valid: true,
                        metadata: { duration, width, height, aspectRatio: `${width}:${height}` }
                    });
                }
            };
            video.onerror = () => {
                resolve({ valid: false, error: 'Could not read video file' });
            };
            video.src = URL.createObjectURL(file);
        });
    };

    const validateImageFile = (file: File): { valid: boolean; error?: string } => {
        if (!file.type.startsWith('image/')) {
            return { valid: false, error: 'File must be an image' };
        }

        if (file.size > MAX_IMAGE_SIZE) {
            return { valid: false, error: `Image size must be less than ${MAX_IMAGE_SIZE / (1024 * 1024)}MB` };
        }

        return { valid: true };
    };

    const handleMediaDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(true);
    };

    const handleMediaDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
    };

    const handleMediaDrop = async (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        const files = e.dataTransfer.files;
        if (files.length > 0) {
            await handleMediaSelect(files[0]);
        }
    };

    const handleMediaSelect = async (file: File) => {
        try {
            if (mediaType === 'image') {
                const validation = validateImageFile(file);
                if (!validation.valid) {
                    showToast(validation.error || 'Invalid image', 'error');
                    return;
                }
                setMediaFile(file);
                const preview = URL.createObjectURL(file);
                setMediaPreview(preview);
                setThumbnailPreview(preview); // Use image as thumbnail
                setThumbnailFile(file);
                showToast('Image selected successfully!', 'success');
            } else {
                // video or short
                const validation = await validateVideoFile(file);
                if (!validation.valid) {
                    showToast(validation.error || 'Invalid video', 'error');
                    return;
                }

                setMediaFile(file);
                setFormData(prev => ({
                    ...prev,
                    duration: validation.metadata?.duration || 0,
                    aspectRatio: validation.metadata?.aspectRatio || '16:9'
                }));

                const preview = URL.createObjectURL(file);
                setMediaPreview(preview);
                showToast('Video validated successfully!', 'success');
            }
        } catch (error) {
            showToast('Error processing file', 'error');
        }
    };

    const handleMediaInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            handleMediaSelect(e.target.files[0]);
        }
    };

    const handleThumbnailInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            if (file.type.startsWith('image/')) {
                setThumbnailFile(file);
                const preview = URL.createObjectURL(file);
                setThumbnailPreview(preview);
                showToast('Thumbnail selected', 'success');
            } else {
                showToast('Thumbnail must be an image', 'error');
            }
        }
    };

    const handleGenerateThumbnail = async () => {
        if (!mediaFile || !mediaPreview || mediaType === 'image') {
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
            video.src = mediaPreview;
        } catch (error) {
            console.error('Error generating thumbnail:', error);
            showToast('Failed to generate thumbnail', 'error');
            setLoading(false);
        }
    };

    const handleUpload = async () => {
        if (!mediaFile) {
            showToast('Please select media file', 'error');
            return;
        }

        if (mediaType !== 'image' && !thumbnailFile) {
            showToast('Please select or generate thumbnail', 'error');
            return;
        }

        if (!formData.title?.trim()) {
            showToast('Please enter a title', 'error');
            return;
        }

        if (!formData.description?.trim()) {
            showToast('Please enter a description', 'error');
            return;
        }

        if (!formData.category) {
            showToast('Please select a category', 'error');
            return;
        }

        if (formData.category === '' || !formData.category) {
            showToast('Please select a valid category', 'error');
            return;
        }

        try {
            setLoading(true);
            console.log('Starting media upload...', {
                mediaType,
                title: formData.title,
                category: formData.category,
                fileSize: mediaFile.size
            });

            const mediaId = await videoService.uploadMedia(
                mediaFile, 
                thumbnailFile || mediaFile, 
                {
                    title: formData.title.trim(),
                    description: formData.description.trim(),
                    category: formData.category,
                    mediaType,
                    duration: formData.duration || 0,
                    aspectRatio: formData.aspectRatio || '16:9',
                    fileSize: mediaFile.size,
                    processedAt: undefined
                } as any
            );

            console.log('Media uploaded successfully:', mediaId);
            showToast('Media uploaded successfully! Processing in progress...', 'success');
            onUploadSuccess(mediaId);
            handleClose();
        } catch (error) {
            console.error('Upload error:', error);
            const errorMessage = error instanceof Error ? error.message : 'Upload failed. Please try again.';
            showToast(errorMessage, 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        setStep('type');
        setMediaType('video');
        setMediaFile(null);
        setThumbnailFile(null);
        setMediaPreview('');
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

    const selectMediaType = (type: MediaType) => {
        setMediaType(type);
        setStep('upload');
        setMediaFile(null);
        setMediaPreview('');
        setThumbnailPreview('');
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
                    onClick={handleClose}
                >
                    <motion.div
                        initial={{ scale: 0.9, y: 20, opacity: 0 }}
                        animate={{ scale: 1, y: 0, opacity: 1 }}
                        exit={{ scale: 0.95, y: 10, opacity: 0 }}
                        transition={{ type: "spring", damping: 25, stiffness: 300 }}
                        className="bg-surface rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto border border-border"
                        onClick={(e) => e.stopPropagation()}
                    >
                    {/* Header */}
                    <div className="flex items-center justify-between p-6 border-b border-border sticky top-0 bg-gradient-to-r from-surface to-background-secondary z-10 rounded-t-2xl">
                        <h2 className="text-2xl font-bold bg-gradient-to-r from-primary to-primary-600 bg-clip-text text-transparent">
                            {step === 'type' ? 'Select Media Type' : step === 'upload' ? 'Upload Media' : 'Media Details'}
                        </h2>
                        <motion.button
                            whileHover={{ scale: 1.1, rotate: 90 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={handleClose}
                            className="p-2 hover:bg-error/10 text-text-secondary hover:text-error rounded-xl transition-all"
                        >
                            <X size={24} />
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
                        {step === 'type' ? (
                            <>
                                <div className="grid grid-cols-3 gap-4">
                                    {/* Image Upload */}
                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => selectMediaType('image')}
                                        className="p-6 border-2 border-border rounded-lg hover:border-primary hover:bg-primary-light/5 transition-all flex flex-col items-center gap-3"
                                    >
                                        <ImageIcon size={32} className="text-primary" />
                                        <div>
                                            <p className="font-semibold text-text-primary">Image</p>
                                            <p className="text-xs text-text-tertiary">JPG, PNG • Max 10MB</p>
                                        </div>
                                    </motion.button>

                                    {/* Video Upload */}
                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => selectMediaType('video')}
                                        className="p-6 border-2 border-border rounded-lg hover:border-primary hover:bg-primary-light/5 transition-all flex flex-col items-center gap-3"
                                    >
                                        <FileVideo size={32} className="text-primary" />
                                        <div>
                                            <p className="font-semibold text-text-primary">Video</p>
                                            <p className="text-xs text-text-tertiary">MP4, WebM • Max 100MB</p>
                                        </div>
                                    </motion.button>

                                    {/* Shorts Upload */}
                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => selectMediaType('short')}
                                        className="p-6 border-2 border-border rounded-lg hover:border-primary hover:bg-primary-light/5 transition-all flex flex-col items-center gap-3"
                                    >
                                        <Film size={32} className="text-primary" />
                                        <div>
                                            <p className="font-semibold text-text-primary">Short</p>
                                            <p className="text-xs text-text-tertiary">5-60s • 9:16 vertical</p>
                                        </div>
                                    </motion.button>
                                </div>
                            </>
                        ) : step === 'upload' ? (
                            <>
                                {/* Media Upload */}
                                <div>
                                    <label className="block text-sm font-medium text-text-primary mb-3">
                                        {mediaType === 'image' ? 'Image' : mediaType === 'short' ? 'Short' : 'Video'} *
                                    </label>
                                    <div
                                        onDragEnter={handleMediaDrag}
                                        onDragLeave={handleMediaDragLeave}
                                        onDragOver={handleMediaDrag}
                                        onDrop={handleMediaDrop}
                                        onClick={() => mediaInputRef.current?.click()}
                                        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all ${
                                            dragActive
                                                ? 'border-primary bg-primary-light/10'
                                                : 'border-border hover:border-primary/50'
                                        }`}
                                    >
                                        {mediaPreview ? (
                                            <div className="space-y-3">
                                                <CheckCircle2 className="mx-auto text-success" size={32} />
                                                <p className="text-sm font-medium text-text-primary">
                                                    {mediaType === 'image' ? 'Image' : 'Video'} validated ✓
                                                </p>
                                                {mediaType !== 'image' && (
                                                    <p className="text-xs text-text-tertiary">
                                                        {Math.round(formData.duration)}s • {((mediaFile?.size ?? 0) / (1024 * 1024)).toFixed(2)}MB
                                                    </p>
                                                )}
                                            </div>
                                        ) : (
                                            <>
                                                {mediaType === 'image' ? (
                                                    <ImageIcon className="mx-auto mb-3 text-text-tertiary" size={32} />
                                                ) : (
                                                    <FileVideo className="mx-auto mb-3 text-text-tertiary" size={32} />
                                                )}
                                                <p className="text-sm font-medium text-text-primary">
                                                    Drop your {mediaType === 'image' ? 'image' : 'video'} here
                                                </p>
                                                <p className="text-xs text-text-tertiary mt-1">
                                                    {mediaType === 'image'
                                                        ? 'JPG, PNG • Max 10MB'
                                                        : mediaType === 'short'
                                                        ? '9:16 vertical • 5-60 seconds • Max 100MB'
                                                        : 'Any format • Max 100MB'}
                                                </p>
                                            </>
                                        )}
                                        <input
                                            ref={mediaInputRef}
                                            type="file"
                                            className="hidden"
                                            onChange={handleMediaInputChange}
                                            accept={mediaType === 'image' ? 'image/*' : 'video/*'}
                                        />
                                    </div>
                                </div>

                                {/* Thumbnail Upload for Videos/Shorts */}
                                {mediaFile && mediaType !== 'image' && (
                                    <div>
                                        <div className="flex items-center justify-between mb-3">
                                            <label className="block text-sm font-medium text-text-primary">Thumbnail *</label>
                                            {mediaPreview && (
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
                                    disabled={!mediaFile || (mediaType !== 'image' && !thumbnailFile)}
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
                                        placeholder={`e.g., Quick ${mediaType === 'image' ? 'Image' : 'Video'} Tip`}
                                        value={formData.title}
                                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                        className="w-full px-3 py-2 bg-background-secondary border border-border rounded-lg text-text-primary placeholder-text-tertiary focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                                    />
                                </div>

                                {/* Description */}
                                <div>
                                    <label className="block text-sm font-medium text-text-primary mb-2">Description *</label>
                                    <textarea
                                        placeholder="Describe the content..."
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
                                    <p className="text-xs text-text-tertiary mb-2 font-medium">Media Metadata</p>
                                    <div className="grid grid-cols-2 gap-2 text-xs">
                                        <div>
                                            <span className="text-text-tertiary">Type:</span>
                                            <p className="text-text-primary font-medium capitalize">{mediaType}</p>
                                        </div>
                                        {mediaType !== 'image' && (
                                            <div>
                                                <span className="text-text-tertiary">Duration:</span>
                                                <p className="text-text-primary font-medium">{Math.round(formData.duration)}s</p>
                                            </div>
                                        )}
                                        <div>
                                            <span className="text-text-tertiary">File Size:</span>
                                            <p className="text-text-primary font-medium">{((mediaFile?.size ?? 0) / (1024 * 1024)).toFixed(2)}MB</p>
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
                        {step === 'upload' && (
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => setStep('type')}
                                className="flex-1 px-4 py-2.5 border border-border rounded-lg font-medium text-text-primary hover:bg-background-tertiary transition-colors"
                            >
                                Back
                            </motion.button>
                        )}
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
                                        Upload Media
                                    </>
                                )}
                            </motion.button>
                        )}
                    </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
