import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Loader,
  Upload,
  AlertCircle,
  Play,
  Youtube,
  Image as ImageIcon,
} from 'lucide-react';
import {
  byteSizedUploadApi,
  byteSizedContentApi,
} from '../../../lib/byteSizedLearning';
import { videoPosterUrl } from '../../../lib/cloudinary.ts';
import type { ByteSizedCategory } from '../../../lib/byteSizedLearning';

interface ContentFormModalProps {
  isOpen: boolean;
  selectedCategoryId: string | null;
  categories: ByteSizedCategory[];
  onClose: () => void;
  onSubmit: (data: any) => Promise<void>;
}

type ContentStep = 'type' | 'upload' | 'metadata' | 'review';
type ContentTypeSelection = 'video' | 'youtube-short' | 'image-lesson' | null;

interface FormState {
  title: string;
  description: string;
  category: string;
  contentType: 'video' | 'youtube-short' | 'image-lesson';
  videoUrl: string;
  youtubeShortUrl: string;
  youtubeShortId: string;
  imageUrl: string;
  thumbnailUrl: string;
  videoMetadata: any;
}

export function ContentFormModal({
  isOpen,
  selectedCategoryId,
  categories,
  onClose,
  onSubmit,
}: ContentFormModalProps) {
  const [step, setStep] = useState<ContentStep>('type');
  const [contentType, setContentType] = useState<ContentTypeSelection>(null);
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  // Form data
  const [formData, setFormData] = useState<FormState>({
    title: '',
    description: '',
    category: selectedCategoryId || '',
    contentType: 'video',
    videoUrl: '',
    youtubeShortUrl: '',
    youtubeShortId: '',
    imageUrl: '',
    thumbnailUrl: '',
    videoMetadata: null as any,
  });

  const videoInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const thumbnailInputRef = useRef<HTMLInputElement>(null);
  const youtubeValidationRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleTypeSelect = (type: ContentTypeSelection) => {
    setContentType(type);
    setFormData(prev => ({
      ...prev,
      contentType: (type || 'video') as 'video' | 'youtube-short' | 'image-lesson',
    }));
    setStep('upload');
  };

  const handleVideoUpload = async (file: File) => {
    try {
      setLoading(true);
      setError(null);
      setUploadProgress(0);

      const result = await byteSizedUploadApi.uploadVideo(file, (progress) => {
        setUploadProgress(progress);
      });

      setFormData(prev => ({
        ...prev,
        videoUrl: result.url,
        videoMetadata: {
          size: result.size,
          uploadedAt: result.uploadedAt,
        },
        thumbnailUrl: prev.thumbnailUrl || videoPosterUrl(result.path, { aspect: '9:16' }),
      }));

      setStep('metadata');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Video upload failed');
    } finally {
      setLoading(false);
      setUploadProgress(0);
    }
  };

  const handleImageUpload = async (file: File, type: 'image' | 'thumbnail') => {
    try {
      setLoading(true);
      setError(null);
      setUploadProgress(0);

      const result =
        type === 'image'
          ? await byteSizedUploadApi.uploadImage(file, setUploadProgress)
          : await byteSizedUploadApi.uploadThumbnail(file, setUploadProgress);

      setFormData(prev => ({
        ...prev,
        [type === 'image' ? 'imageUrl' : 'thumbnailUrl']: result.url,
      }));

      if (type === 'thumbnail') {
        setStep('metadata');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setLoading(false);
      setUploadProgress(0);
    }
  };

  const handleYouTubeValidation = async (url: string) => {
    if (!url.trim()) return;

    if (youtubeValidationRef.current) {
      clearTimeout(youtubeValidationRef.current);
    }

    youtubeValidationRef.current = setTimeout(async () => {
      try {
        const result = await byteSizedContentApi.validateYouTubeUrl(url);
        if (result.valid) {
          setFormData(prev => ({
            ...prev,
            youtubeShortId: result.videoId || '',
          }));
          setError(null);
        } else {
          setError(result.error || 'Invalid YouTube URL');
        }
      } catch (err) {
        setError('Failed to validate YouTube URL');
      }
    }, 500);
  };

  const handleThumbnailUpload = async (file: File) => {
    try {
      setLoading(true);
      setError(null);
      const result = await byteSizedUploadApi.uploadThumbnail(file, setUploadProgress);
      setFormData(prev => ({
        ...prev,
        thumbnailUrl: result.url,
      }));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Thumbnail upload failed');
    } finally {
      setLoading(false);
      setUploadProgress(0);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      setError('Title is required');
      return;
    }

    if (!formData.category) {
      setError('Category is required');
      return;
    }

    // Thumbnail is optional

    if (formData.contentType === 'video' && !formData.videoUrl) {
      setError('Video file is required');
      return;
    }

    if (formData.contentType === 'youtube-short' && !formData.youtubeShortId) {
      setError('Valid YouTube Shorts URL is required');
      return;
    }

    if (formData.contentType === 'image-lesson' && !formData.imageUrl) {
      setError('Image is required');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      await onSubmit({
        title: formData.title.trim(),
        description: formData.description.trim(),
        category: formData.category,
        contentType: formData.contentType,
        thumbnail: formData.thumbnailUrl || undefined,
        videoUrl: formData.videoUrl || undefined,
        youtubeShortUrl: formData.youtubeShortUrl || undefined,
        youtubeShortId: formData.youtubeShortId || undefined,
        imageUrl: formData.imageUrl || undefined,
        videoMetadata: formData.videoMetadata || undefined,
      });

      // Reset and close
      setStep('type');
      setContentType(null);
      setFormData({
        title: '',
        description: '',
        category: selectedCategoryId || '',
        contentType: 'video',
        videoUrl: '',
        youtubeShortUrl: '',
        youtubeShortId: '',
        imageUrl: '',
        thumbnailUrl: '',
        videoMetadata: null,
      });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create content');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0.9 }}
            className="bg-white rounded-lg shadow-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-[#0F172A]">
                {step === 'type' && 'Create New Content'}
                {step === 'upload' && 'Upload Content'}
                {step === 'metadata' && 'Content Details'}
                {step === 'review' && 'Review'}
              </h2>
              <button
                onClick={onClose}
                disabled={loading}
                className="p-1 hover:bg-[#F0F4F8] rounded-lg transition disabled:opacity-50"
              >
                <X size={20} />
              </button>
            </div>

            {/* Error */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3 mb-4 bg-red-50 border border-red-200 rounded-lg flex gap-3"
              >
                <AlertCircle size={20} className="text-red-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-700">{error}</p>
              </motion.div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* STEP 1: Content Type Selection */}
              {step === 'type' && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="space-y-4"
                >
                  <p className="text-sm text-[#64748B] mb-4">
                    What type of content do you want to create?
                  </p>

                  {[
                    { id: 'video', label: 'Video Upload', icon: Play },
                    { id: 'youtube-short', label: 'YouTube Shorts', icon: Youtube },
                    { id: 'image-lesson', label: 'Image Lesson', icon: ImageIcon },
                  ].map(({ id, label, icon: Icon }) => (
                    <button
                      key={id}
                      type="button"
                      onClick={() => handleTypeSelect(id as ContentTypeSelection)}
                      className="w-full p-4 border-2 border-[#E0E7FF] rounded-lg hover:border-[#4F46E5] hover:bg-[#F5F7FA] transition flex items-center gap-4"
                    >
                      <Icon size={24} className="text-[#4F46E5]" />
                      <span className="font-medium text-[#0F172A]">{label}</span>
                    </button>
                  ))}
                </motion.div>
              )}

              {/* STEP 2: Upload */}
              {step === 'upload' && contentType && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="space-y-4"
                >
                  {contentType === 'video' && (
                    <div>
                      <label className="block text-sm font-medium text-[#0F172A] mb-2">
                        Upload Video (MP4, WebM, MOV - Max 100MB, 60 seconds)
                      </label>
                      <div
                        onClick={() => videoInputRef.current?.click()}
                        className="border-2 border-dashed border-[#E0E7FF] rounded-lg p-8 text-center cursor-pointer hover:border-[#4F46E5] hover:bg-[#F5F7FA] transition"
                      >
                        <Upload size={32} className="mx-auto mb-2 text-[#4F46E5]" />
                        <p className="font-medium text-[#0F172A] mb-1">
                          Click to upload video
                        </p>
                        <p className="text-sm text-[#64748B]">
                          or drag and drop
                        </p>
                      </div>
                      <input
                        ref={videoInputRef}
                        type="file"
                        accept="video/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleVideoUpload(file);
                        }}
                        className="hidden"
                        disabled={loading}
                      />

                      {uploadProgress > 0 && uploadProgress < 100 && (
                        <div className="mt-4">
                          <div className="flex items-center gap-2 mb-2">
                            <Loader size={16} className="animate-spin text-[#4F46E5]" />
                            <span className="text-sm text-[#64748B]">
                              Uploading {uploadProgress}%
                            </span>
                          </div>
                          <div className="w-full bg-[#E0E7FF] rounded-full h-2">
                            <div
                              className="bg-[#4F46E5] h-2 rounded-full transition-all duration-300"
                              style={{ width: `${uploadProgress}%` }}
                            />
                          </div>
                        </div>
                      )}

                      {formData.videoUrl && (
                        <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700">
                          ✓ Video uploaded successfully
                        </div>
                      )}
                    </div>
                  )}

                  {contentType === 'youtube-short' && (
                    <div>
                      <label className="block text-sm font-medium text-[#0F172A] mb-2">
                        YouTube Shorts URL
                      </label>
                      <input
                        type="url"
                        value={formData.youtubeShortUrl}
                        onChange={(e) => {
                          setFormData(prev => ({
                            ...prev,
                            youtubeShortUrl: e.target.value,
                          }));
                          handleYouTubeValidation(e.target.value);
                        }}
                        placeholder="https://youtube.com/shorts/xxx or https://youtu.be/xxx"
                        className="w-full px-4 py-2 border border-[#E0E7FF] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4F46E5]"
                      />

                      {formData.youtubeShortId && !error && (
                        <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700">
                          ✓ YouTube URL validated
                        </div>
                      )}
                    </div>
                  )}

                  {contentType === 'image-lesson' && (
                    <div>
                      <label className="block text-sm font-medium text-[#0F172A] mb-2">
                        Upload Image (JPG, PNG, WebP - Max 10MB)
                      </label>
                      <div
                        onClick={() => imageInputRef.current?.click()}
                        className="border-2 border-dashed border-[#E0E7FF] rounded-lg p-8 text-center cursor-pointer hover:border-[#4F46E5] hover:bg-[#F5F7FA] transition"
                      >
                        <Upload size={32} className="mx-auto mb-2 text-[#4F46E5]" />
                        <p className="font-medium text-[#0F172A] mb-1">
                          Click to upload image
                        </p>
                        <p className="text-sm text-[#64748B]">
                          or drag and drop
                        </p>
                      </div>
                      <input
                        ref={imageInputRef}
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleImageUpload(file, 'image');
                        }}
                        className="hidden"
                        disabled={loading}
                      />

                      {formData.imageUrl && (
                        <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700">
                          ✓ Image uploaded successfully
                        </div>
                      )}
                    </div>
                  )}

                  {/* Thumbnail Upload (All Types) */}
                  <div className="border-t pt-4">
                    <label className="block text-sm font-medium text-[#0F172A] mb-2">
                      Thumbnail Image * (Required)
                    </label>
                    <div
                      onClick={() => thumbnailInputRef.current?.click()}
                      className="border-2 border-dashed border-[#E0E7FF] rounded-lg p-8 text-center cursor-pointer hover:border-[#4F46E5] hover:bg-[#F5F7FA] transition"
                    >
                      <Upload size={32} className="mx-auto mb-2 text-[#4F46E5]" />
                      <p className="font-medium text-[#0F172A] mb-1">
                        Click to upload thumbnail
                      </p>
                      <p className="text-sm text-[#64748B]">
                        or drag and drop
                      </p>
                    </div>
                    <input
                      ref={thumbnailInputRef}
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleThumbnailUpload(file);
                      }}
                      className="hidden"
                      disabled={loading}
                    />

                    {formData.thumbnailUrl && (
                      <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700">
                        ✓ Thumbnail uploaded
                      </div>
                    )}
                  </div>
                </motion.div>
              )}

              {/* STEP 3: Metadata */}
              {step === 'metadata' && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="space-y-4"
                >
                  {/* Title */}
                  <div>
                    <label className="block text-sm font-medium text-[#0F172A] mb-2">
                      Title *
                    </label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) =>
                        setFormData(prev => ({ ...prev, title: e.target.value }))
                      }
                      placeholder="e.g., Introduction to Photosynthesis"
                      className="w-full px-4 py-2 border border-[#E0E7FF] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4F46E5]"
                      disabled={loading}
                    />
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-sm font-medium text-[#0F172A] mb-2">
                      Description
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) =>
                        setFormData(prev => ({ ...prev, description: e.target.value }))
                      }
                      placeholder="Optional description"
                      rows={3}
                      className="w-full px-4 py-2 border border-[#E0E7FF] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4F46E5]"
                      disabled={loading}
                    />
                  </div>

                  {/* Category */}
                  <div>
                    <label className="block text-sm font-medium text-[#0F172A] mb-2">
                      Category *
                    </label>
                    <div className="flex gap-2">
                      <select
                        value={formData.category}
                        onChange={(e) =>
                          setFormData(prev => ({ ...prev, category: e.target.value }))
                        }
                        className="flex-1 px-4 py-2 border border-[#E0E7FF] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4F46E5]"
                        disabled={loading}
                      >
                        <option value="">Select category</option>
                        {categories.map(cat => (
                          <option key={cat.id} value={cat.id}>
                            {cat.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Actions */}
              <div className="flex gap-3 pt-4 border-t border-[#E0E7FF]">
                {step !== 'type' && (
                  <button
                    type="button"
                    onClick={() => {
                      if (step === 'upload') setStep('type');
                      else if (step === 'metadata') setStep('upload');
                    }}
                    disabled={loading}
                    className="flex-1 px-4 py-2 text-[#64748B] bg-[#F0F4F8] rounded-lg hover:bg-[#E0E7FF] transition disabled:opacity-50"
                  >
                    Back
                  </button>
                )}

                {step !== 'metadata' && (
                  <button
                    type="button"
                    onClick={() => {
                      const canContinue =
                        (step === 'type' && contentType) ||
                        (step === 'upload' &&
                          formData.thumbnailUrl &&
                          ((contentType === 'video' && formData.videoUrl) ||
                            (contentType === 'youtube-short' &&
                              formData.youtubeShortId) ||
                            (contentType === 'image-lesson' &&
                              formData.imageUrl)));

                      if (canContinue) {
                        if (step === 'type') setStep('upload');
                        else if (step === 'upload') setStep('metadata');
                      } else {
                        setError('Please complete all required fields');
                      }
                    }}
                    disabled={loading}
                    className="flex-1 px-4 py-2 bg-[#4F46E5] text-white rounded-lg hover:bg-[#4338CA] transition disabled:opacity-50"
                  >
                    Next
                  </button>
                )}

                {step === 'metadata' && (
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-[#4F46E5] text-white rounded-lg hover:bg-[#4338CA] transition disabled:opacity-50"
                  >
                    {loading && <Loader size={16} className="animate-spin" />}
                    Create Content
                  </button>
                )}
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
