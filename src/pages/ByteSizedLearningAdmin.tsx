import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader, AlertCircle, Plus, Search, Edit2, Trash2, Video, Link as LinkIcon, Image as ImageIcon, X, Upload, CheckCircle } from 'lucide-react';

import { byteSizedCategoryApi, byteSizedContentApi, byteSizedUploadApi } from '../lib/byteSizedLearning';
import { videoPosterUrl } from '../lib/cloudinary.ts';
import type { ByteSizedCategory, ByteSizedContent } from '../lib/byteSizedLearning';
import { containerVariants, itemVariants, tapScale } from '../lib/animations';

type ContentKind = 'video' | 'youtube-short' | 'image-lesson';

interface AdminState {
  categories: ByteSizedCategory[];
  content: ByteSizedContent[];
  selectedCategory: string | null;
  loading: boolean;
  error: string | null;
}

interface ComposeState {
  title: string;
  description: string;
  categoryId: string;
  contentType: ContentKind;
  youtubeUrl: string;
  videoUrl: string;
  imageUrl: string;
  thumbnailUrl: string;
  videoProgress: number;
  imageProgress: number;
  thumbProgress: number;
  error: string | null;
  submitting: boolean;
  open: boolean;
}

export function ByteSizedLearning() {
  const [state, setState] = useState<AdminState>({
    categories: [],
    content: [],
    selectedCategory: null,
    loading: true,
    error: null,
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [compose, setCompose] = useState<ComposeState>({
    title: '',
    description: '',
    categoryId: '',
    contentType: 'video',
    youtubeUrl: '',
    videoUrl: '',
    imageUrl: '',
    thumbnailUrl: '',
    videoProgress: 0,
    imageProgress: 0,
    thumbProgress: 0,
    error: null,
    submitting: false,
    open: false,
  });

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    if (state.selectedCategory) {
      loadContent(state.selectedCategory);
    }
  }, [state.selectedCategory]);

  const loadCategories = async () => {
    try {
      const cats = await byteSizedCategoryApi.getAll();
      setState(prev => ({
        ...prev,
        categories: cats,
        selectedCategory: cats.length > 0 ? cats[0].id : null,
        loading: false,
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

  const loadContent = async (categoryId: string) => {
    try {
      const result = await byteSizedContentApi.getByCategory(categoryId, {
        limit: 100,
        status: 'all',
      });
      setState(prev => ({
        ...prev,
        content: result.items || [],
      }));
    } catch (err) {
      console.error('Error loading content:', err);
    }
  };

  const filteredContent = state.content.filter(item =>
    item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCategoryChange = (categoryId: string) => {
    setState(prev => ({ ...prev, selectedCategory: categoryId }));
  };

  const resetCompose = () => {
    setCompose({
      title: '',
      description: '',
      categoryId: state.selectedCategory || state.categories[0]?.id || '',
      contentType: 'video',
      youtubeUrl: '',
      videoUrl: '',
      imageUrl: '',
      thumbnailUrl: '',
      videoProgress: 0,
      imageProgress: 0,
      thumbProgress: 0,
      error: null,
      submitting: false,
      open: false,
    });
  };

  const handleOpenCompose = () => {
    resetCompose();
    setCompose(prev => ({ ...prev, open: true, categoryId: state.selectedCategory || state.categories[0]?.id || '' }));
  };

  const handleVideoUpload = async (file?: File) => {
    if (!file) return;
    setCompose(prev => ({ ...prev, videoProgress: 5, error: null }));
    try {
      const uploaded = await byteSizedUploadApi.uploadVideo(file, (p) => setCompose(prev => ({ ...prev, videoProgress: p })));
      setCompose(prev => ({
        ...prev,
        videoUrl: uploaded.url,
        thumbnailUrl: prev.thumbnailUrl || videoPosterUrl(uploaded.path, { aspect: '9:16' }),
        videoProgress: 100,
      }));
    } catch (err: any) {
      setCompose(prev => ({ ...prev, error: err?.message || 'Video upload failed', videoProgress: 0 }));
    }
  };

  const handleImageUpload = async (file?: File) => {
    if (!file) return;
    setCompose(prev => ({ ...prev, imageProgress: 5, error: null }));
    try {
      const uploaded = await byteSizedUploadApi.uploadImage(file, (p) => setCompose(prev => ({ ...prev, imageProgress: p })));
      setCompose(prev => ({ ...prev, imageUrl: uploaded.url, imageProgress: 100, thumbnailUrl: uploaded.url }));
    } catch (err: any) {
      setCompose(prev => ({ ...prev, error: err?.message || 'Image upload failed', imageProgress: 0 }));
    }
  };

  const handleThumbnailUpload = async (file?: File) => {
    if (!file) return;
    setCompose(prev => ({ ...prev, thumbProgress: 5, error: null }));
    try {
      const uploaded = await byteSizedUploadApi.uploadThumbnail(file, (p) => setCompose(prev => ({ ...prev, thumbProgress: p })));
      setCompose(prev => ({ ...prev, thumbnailUrl: uploaded.url, thumbProgress: 100 }));
    } catch (err: any) {
      setCompose(prev => ({ ...prev, error: err?.message || 'Thumbnail upload failed', thumbProgress: 0 }));
    }
  };

  const handleSubmitCompose = async () => {
    if (!compose.title.trim()) {
      setCompose(prev => ({ ...prev, error: 'Title is required' }));
      return;
    }
    if (!compose.categoryId) {
      setCompose(prev => ({ ...prev, error: 'Select a category' }));
      return;
    }

    if (compose.contentType === 'video' && (!compose.videoUrl)) {
      setCompose(prev => ({ ...prev, error: 'Upload a video file' }));
      return;
    }
    if (compose.contentType === 'youtube-short' && (!compose.youtubeUrl)) {
      setCompose(prev => ({ ...prev, error: 'Paste a valid YouTube Shorts link' }));
      return;
    }
    if (compose.contentType === 'image-lesson' && !compose.imageUrl) {
      setCompose(prev => ({ ...prev, error: 'Upload an image' }));
      return;
    }

    setCompose(prev => ({ ...prev, submitting: true, error: null }));

    const payload: any = {
      title: compose.title,
      description: compose.description,
      category: compose.categoryId,
      contentType: compose.contentType,
      status: 'published',
      visibility: 'public',
    };

    if (compose.thumbnailUrl) payload.thumbnail = compose.thumbnailUrl;
    if (compose.contentType === 'video') payload.videoUrl = compose.videoUrl;
    if (compose.contentType === 'youtube-short') payload.youtubeShortUrl = compose.youtubeUrl;
    if (compose.contentType === 'image-lesson') payload.imageUrl = compose.imageUrl;

    try {
      await byteSizedContentApi.create(payload);
      if (state.selectedCategory) {
        await loadContent(state.selectedCategory);
      }
      resetCompose();
      setCompose(prev => ({ ...prev, open: false, submitting: false }));
    } catch (err: any) {
      setCompose(prev => ({ ...prev, submitting: false, error: err?.message || 'Failed to publish content' }));
    }
  };

  const handleDeleteContent = async (id: string) => {
    if (!confirm('Are you sure you want to delete this content?')) return;
    try {
      await byteSizedContentApi.delete(id);
      if (state.selectedCategory) {
        await loadContent(state.selectedCategory);
      }
    } catch (err) {
      console.error('Delete error:', err);
      alert('Failed to delete content');
    }
  };

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
          <h1 className="text-4xl font-bold text-text-primary tracking-tight bg-gradient-to-r from-primary to-primary-600 bg-clip-text text-transparent">
            Byte-Sized Learning
          </h1>
          <p className="text-text-secondary mt-2 font-medium">Manage short-form educational content</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05, y: -2 }}
          whileTap={tapScale}
          onClick={handleOpenCompose}
          className="px-6 py-3 bg-gradient-to-r from-primary to-primary-600 text-white rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center gap-2 font-semibold"
        >
          <Plus size={20} />
          Upload Content
        </motion.button>
      </motion.div>

      {state.loading && (
        <div className="flex items-center justify-center py-16">
          <Loader size={48} className="animate-spin text-primary" />
        </div>
      )}

      {state.error && !state.loading && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-50 border border-red-200 rounded-xl p-6 flex items-center gap-4"
        >
          <AlertCircle className="text-red-600" size={24} />
          <div>
            <p className="text-red-900 font-semibold">{state.error}</p>
            <p className="text-red-700 text-sm mt-1">
              Mock data is enabled. Categories and content are stored in memory.
            </p>
          </div>
        </motion.div>
      )}

      {!state.loading && !state.error && (
        <>
          {/* Category Tabs */}
          <motion.div variants={itemVariants} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <div className="flex items-center gap-3 overflow-x-auto scrollbar-hide">
              {state.categories.map(category => (
                <motion.button
                  key={category.id}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleCategoryChange(category.id)}
                  className={`px-4 py-2 rounded-lg whitespace-nowrap font-semibold transition-all ${
                    state.selectedCategory === category.id
                      ? 'bg-gradient-to-r from-primary to-primary-600 text-white shadow-md'
                      : 'bg-gray-100 text-text-secondary hover:bg-gray-200'
                  }`}
                >
                  {category.name}
                </motion.button>
              ))}
            </div>
          </motion.div>

          {/* Search */}
          <motion.div variants={itemVariants} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-tertiary" size={20} />
              <input
                type="text"
                placeholder="Search content..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>
          </motion.div>

          {/* Content Grid */}
          <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence mode="popLayout">
              {filteredContent.map((content, index) => {
                const Icon =
                  content.contentType === 'video' ? Video :
                  content.contentType === 'youtube-short' ? LinkIcon :
                  ImageIcon;

                return (
                  <motion.div
                    key={content.id}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ delay: index * 0.05 }}
                    whileHover={{ scale: 1.02, y: -4 }}
                    className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-all"
                  >
                    {/* Thumbnail */}
                    <div className="relative w-full aspect-[9/16] bg-gray-100">
                      {content.thumbnail?.url && (
                        <img
                          src={content.thumbnail.url}
                          alt={content.title}
                          className="w-full h-full object-cover"
                        />
                      )}
                      <div className="absolute top-2 right-2 bg-black/70 backdrop-blur-sm px-2 py-1 rounded-lg flex items-center gap-1.5">
                        <Icon size={14} className="text-white" />
                        <span className="text-white text-xs font-medium capitalize">
                          {content.contentType.replace('-', ' ')}
                        </span>
                      </div>
                    </div>

                    {/* Content Info */}
                    <div className="p-4">
                      <h3 className="text-base font-semibold text-text-primary mb-1 line-clamp-2">
                        {content.title}
                      </h3>
                      <p className="text-sm text-text-secondary mb-3 line-clamp-2">
                        {content.description}
                      </p>

                      <div className="flex items-center justify-between">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          content.status === 'published'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-gray-100 text-gray-600'
                        }`}>
                          {content.status}
                        </span>

                        <div className="flex gap-2">
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            className="p-2 text-text-secondary hover:text-primary hover:bg-primary-50 rounded-lg transition-colors"
                          >
                            <Edit2 size={16} />
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => handleDeleteContent(content.id)}
                            className="p-2 text-text-secondary hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <Trash2 size={16} />
                          </motion.button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </motion.div>

          {filteredContent.length === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-16"
            >
              <Upload size={64} className="mx-auto text-gray-300 mb-4" />
              <h3 className="text-xl font-semibold text-text-primary mb-2">No content yet</h3>
              <p className="text-text-secondary mb-6">Start by uploading your first video, YouTube Short, or image lesson</p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={tapScale}
                onClick={handleOpenCompose}
                className="px-6 py-3 bg-gradient-to-r from-primary to-primary-600 text-white rounded-xl shadow-lg hover:shadow-xl transition-all inline-flex items-center gap-2 font-semibold"
              >
                <Plus size={20} />
                Upload First Content
              </motion.button>
            </motion.div>
          )}
        </>
      )}

      {/* Upload Modal */}
      <AnimatePresence>
        {compose.open && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-3xl bg-white rounded-2xl shadow-2xl p-6 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-xs uppercase tracking-wide text-primary-600/80 font-semibold">Upload Content</p>
                  <h3 className="text-2xl font-bold text-text-primary">Byte-Sized Learning</h3>
                </div>
                <button
                  onClick={() => resetCompose()}
                  className="text-text-secondary hover:text-text-primary text-sm"
                >
                  <X size={24} />
                </button>
              </div>

              {compose.error && (
                <div className="mb-3 rounded-lg border border-red-500/50 bg-red-500/10 text-sm text-red-700 px-3 py-2">
                  {compose.error}
                </div>
              )}

              {/* Content Type Chooser */}
              <div className="grid grid-cols-3 gap-3 mb-6">
                {[
                  { key: 'video', label: 'Video Upload', icon: <Video size={18} /> },
                  { key: 'youtube-short', label: 'YouTube Short', icon: <LinkIcon size={18} /> },
                  { key: 'image-lesson', label: 'Image Lesson', icon: <ImageIcon size={18} /> },
                ].map(item => (
                  <button
                    key={item.key}
                    onClick={() => setCompose(prev => ({ ...prev, contentType: item.key as ContentKind, error: null }))}
                    className={`flex items-center gap-2 px-3 py-3 rounded-xl border transition-all text-sm font-semibold ${
                      compose.contentType === item.key
                        ? 'border-primary bg-primary-50 text-primary'
                        : 'border-gray-200 bg-gray-50 text-text-secondary hover:border-primary-200'
                    }`}
                  >
                    {item.icon}
                    {item.label}
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-4">
                  <div>
                    <FieldLabel>Title *</FieldLabel>
                    <input
                      value={compose.title}
                      onChange={(e) => setCompose(prev => ({ ...prev, title: e.target.value }))}
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                      placeholder="Enter title"
                      disabled={compose.submitting}
                    />
                  </div>
                  <div>
                    <FieldLabel>Description</FieldLabel>
                    <textarea
                      value={compose.description}
                      onChange={(e) => setCompose(prev => ({ ...prev, description: e.target.value }))}
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                      rows={4}
                      placeholder="Add a short description"
                      disabled={compose.submitting}
                    />
                  </div>
                  <div>
                    <FieldLabel>Category *</FieldLabel>
                    <select
                      value={compose.categoryId}
                      onChange={(e) => setCompose(prev => ({ ...prev, categoryId: e.target.value }))}
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                      disabled={compose.submitting}
                    >
                      <option value="">Select category</option>
                      {state.categories.map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                      ))}
                    </select>
                  </div>

                  {compose.contentType === 'youtube-short' && (
                    <div>
                      <FieldLabel>YouTube Shorts Link *</FieldLabel>
                      <input
                        value={compose.youtubeUrl}
                        onChange={(e) => setCompose(prev => ({ ...prev, youtubeUrl: e.target.value }))}
                        className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                        placeholder="https://youtube.com/shorts/..."
                        disabled={compose.submitting}
                      />
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  {compose.contentType === 'video' && (
                    <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                      <FieldLabel>Upload Video *</FieldLabel>
                      <input
                        type="file"
                        accept="video/mp4,video/webm,video/quicktime"
                        onChange={(e) => handleVideoUpload(e.target.files?.[0])}
                        disabled={compose.submitting}
                        className="text-sm"
                      />
                      {compose.videoProgress > 0 && (
                        <div className="mt-2 text-xs text-text-secondary">{compose.videoProgress}%</div>
                      )}
                      {compose.videoUrl && <p className="mt-2 text-xs text-green-600 flex items-center gap-1"><CheckCircle size={14} /> Video uploaded</p>}
                    </div>
                  )}

                  {compose.contentType === 'image-lesson' && (
                    <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                      <FieldLabel>Upload Image *</FieldLabel>
                      <input
                        type="file"
                        accept="image/png,image/jpeg,image/webp"
                        onChange={(e) => handleImageUpload(e.target.files?.[0])}
                        disabled={compose.submitting}
                        className="text-sm"
                      />
                      {compose.imageProgress > 0 && (
                        <div className="mt-2 text-xs text-text-secondary">{compose.imageProgress}%</div>
                      )}
                      {compose.imageUrl && <p className="mt-2 text-xs text-green-600 flex items-center gap-1"><CheckCircle size={14} /> Image uploaded</p>}
                    </div>
                  )}

                  <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                    <FieldLabel>Thumbnail * (9:16 ratio recommended)</FieldLabel>
                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/webp"
                      onChange={(e) => handleThumbnailUpload(e.target.files?.[0])}
                      disabled={compose.submitting}
                      className="text-sm"
                    />
                    {compose.thumbProgress > 0 && (
                      <div className="mt-2 text-xs text-text-secondary">{compose.thumbProgress}%</div>
                    )}
                    {compose.thumbnailUrl && (
                      <>
                        <p className="mt-2 text-xs text-green-600 flex items-center gap-1"><CheckCircle size={14} /> Thumbnail uploaded</p>
                        <img src={compose.thumbnailUrl} alt="Thumbnail" className="mt-2 w-24 h-32 object-cover rounded-lg border" />
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <button
                  onClick={() => resetCompose()}
                  className="px-4 py-2 text-sm rounded-lg border border-gray-200 text-text-secondary hover:text-text-primary hover:border-gray-300"
                  disabled={compose.submitting}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmitCompose}
                  disabled={compose.submitting}
                  className="px-4 py-2 text-sm rounded-lg bg-primary hover:bg-primary-600 text-white font-semibold flex items-center gap-2 disabled:opacity-60"
                >
                  {compose.submitting && <Loader size={16} className="animate-spin" />}
                  Publish
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return <label className="block text-sm font-semibold text-text-primary mb-1.5">{children}</label>;
}
