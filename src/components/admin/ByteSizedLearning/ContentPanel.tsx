import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Trash2,
  AlertCircle,
  Loader,
  Eye,
  EyeOff,
  Play,
  Image as ImageIcon,
  Youtube,
} from 'lucide-react';
import type { ByteSizedContent } from '../../../lib/byteSizedLearning';

interface ContentPanelProps {
  content: ByteSizedContent[];
  selectedCategoryId: string | null;
  filter: 'all' | 'draft' | 'published';
  onFilterChange: (filter: 'all' | 'draft' | 'published') => void;
  onDelete: (id: string) => Promise<void>;
  onTogglePublish: (id: string) => Promise<void>;
  loading: boolean;
}

export function ContentPanel({
  content,
  selectedCategoryId,
  filter,
  onFilterChange,
  onDelete,
  onTogglePublish,
  loading,
}: ContentPanelProps) {
  const [deleting, setDeleting] = useState<string | null>(null);
  const [toggling, setToggling] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    try {
      await onDelete(id);
      setDeleting(null);
    } catch (error) {
      console.error('Delete failed');
    }
  };

  const handleTogglePublish = async (id: string) => {
    try {
      setToggling(id);
      await onTogglePublish(id);
      setToggling(null);
    } catch (error) {
      console.error('Toggle publish failed');
      setToggling(null);
    }
  };

  const getContentIcon = (contentType: string) => {
    switch (contentType) {
      case 'video':
        return <Play size={16} />;
      case 'youtube-short':
        return <Youtube size={16} />;
      case 'image-lesson':
        return <ImageIcon size={16} />;
      default:
        return null;
    }
  };

  const getContentTypeLabel = (contentType: string) => {
    switch (contentType) {
      case 'video':
        return 'Video';
      case 'youtube-short':
        return 'YouTube Short';
      case 'image-lesson':
        return 'Image Lesson';
      default:
        return contentType;
    }
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-lg shadow-sm border border-[#E0E7FF]">
      {/* Header */}
      <div className="p-4 border-b border-[#E0E7FF]">
        <h2 className="font-semibold text-[#0F172A] mb-3">
          {selectedCategoryId ? 'Content' : 'Select a category'}
        </h2>

        {/* Filters */}
        {selectedCategoryId && (
          <div className="flex gap-2">
            {(['all', 'draft', 'published'] as const).map((filterOption) => (
              <button
                key={filterOption}
                onClick={() => onFilterChange(filterOption)}
                className={`px-3 py-1 text-sm rounded-lg transition ${
                  filter === filterOption
                    ? 'bg-[#4F46E5] text-white'
                    : 'bg-[#F0F4F8] text-[#64748B] hover:bg-[#E0E7FF]'
                }`}
              >
                {filterOption.charAt(0).toUpperCase() + filterOption.slice(1)}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Content List */}
      <div className="flex-1 overflow-y-auto">
        {!selectedCategoryId ? (
          <div className="p-8 text-center">
            <p className="text-[#64748B] text-sm">
              Select a category from the left panel to view its content
            </p>
          </div>
        ) : loading ? (
          <div className="flex items-center justify-center h-20">
            <Loader size={20} className="animate-spin text-[#4F46E5]" />
          </div>
        ) : content.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-[#64748B] text-sm">
              No {filter !== 'all' ? filter : ''} content yet
            </p>
          </div>
        ) : (
          <div className="divide-y divide-[#E0E7FF]">
            <AnimatePresence>
              {content.map((item) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="p-4 hover:bg-[#F0F4F8] transition"
                >
                  <div className="flex gap-4">
                    {/* Thumbnail */}
                    {item.thumbnail && (
                      <img
                        src={item.thumbnail.url}
                        alt={item.title}
                        className="w-20 h-28 object-cover rounded-lg flex-shrink-0"
                      />
                    )}

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <h3 className="font-medium text-[#0F172A] line-clamp-2">
                          {item.title}
                        </h3>
                        <span
                          className={`px-2 py-1 text-xs rounded whitespace-nowrap ${
                            item.publishedAt
                              ? 'bg-green-100 text-green-700'
                              : 'bg-yellow-100 text-yellow-700'
                          }`}
                        >
                          {item.publishedAt ? 'Published' : 'Draft'}
                        </span>
                      </div>

                      {/* Content Type */}
                      <div className="flex items-center gap-2 text-xs text-[#64748B] mb-3">
                        {getContentIcon(item.contentType)}
                        <span>{getContentTypeLabel(item.contentType)}</span>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleTogglePublish(item.id)}
                          disabled={toggling === item.id}
                          className="flex items-center gap-1 px-3 py-1 text-xs rounded-lg bg-[#F0F4F8] text-[#4F46E5] hover:bg-[#E0E7FF] transition disabled:opacity-50"
                        >
                          {toggling === item.id ? (
                            <Loader size={14} className="animate-spin" />
                          ) : item.publishedAt ? (
                            <>
                              <EyeOff size={14} />
                              Unpublish
                            </>
                          ) : (
                            <>
                              <Eye size={14} />
                              Publish
                            </>
                          )}
                        </button>

                        <button
                          onClick={() => setDeleting(item.id)}
                          className="flex items-center gap-1 px-3 py-1 text-xs rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition"
                        >
                          <Trash2 size={14} />
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deleting && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
            onClick={() => setDeleting(null)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="bg-white rounded-lg shadow-lg p-6 max-w-sm mx-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-start gap-4 mb-4">
                <AlertCircle className="text-red-600 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold text-[#0F172A] mb-1">
                    Delete Content?
                  </h3>
                  <p className="text-sm text-[#64748B]">
                    This action cannot be undone. The content will be permanently deleted.
                  </p>
                </div>
              </div>

              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setDeleting(null)}
                  className="px-4 py-2 text-sm text-[#64748B] hover:bg-[#F0F4F8] rounded-lg transition"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDelete(deleting)}
                  className="px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
