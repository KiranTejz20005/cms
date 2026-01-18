import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  MoreVertical,
  Edit2,
  Trash2,
  AlertCircle,
  Loader,
} from 'lucide-react';
import type { ByteSizedCategory } from '../../../lib/byteSizedLearning';

interface CategoryPanelProps {
  categories: ByteSizedCategory[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onNewCategory: () => void;
  onEdit: (category: ByteSizedCategory) => void;
  onDelete: (id: string) => void;
  onUpdate: (id: string, data: any) => Promise<void>;
  loading: boolean;
}

export function CategoryPanel({
  categories,
  selectedId,
  onSelect,
  onNewCategory,
  onEdit,
  onDelete,
  onUpdate,
  loading,
}: CategoryPanelProps) {
  const [expandedMenu, setExpandedMenu] = useState<string | null>(null);
  const [editingName, setEditingName] = useState<{ id: string; value: string } | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  const handleInlineEdit = async (id: string, newName: string) => {
    if (newName.trim().length < 2) return;
    try {
      await onUpdate(id, { name: newName.trim() });
      setEditingName(null);
    } catch (error) {
      console.error('Failed to update category name');
    }
  };

  const handleDelete = (id: string) => {
    setDeleting(id);
  };

  const confirmDelete = async () => {
    if (deleting) {
      try {
        onDelete(deleting);
        setDeleting(null);
        setExpandedMenu(null);
      } catch (error) {
        console.error('Delete failed');
      }
    }
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-lg shadow-sm border border-[#E0E7FF]">
      {/* Header */}
      <div className="p-4 border-b border-[#E0E7FF]">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-[#0F172A]">Categories</h2>
          <button
            onClick={onNewCategory}
            className="p-2 hover:bg-[#F0F4F8] rounded-lg transition"
            title="Create new category"
          >
            <Plus size={18} className="text-[#4F46E5]" />
          </button>
        </div>
      </div>

      {/* Categories List */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center h-20">
            <Loader size={20} className="animate-spin text-[#4F46E5]" />
          </div>
        ) : categories.length === 0 ? (
          <div className="p-4 text-center">
            <p className="text-sm text-[#64748B] mb-3">No categories yet</p>
            <button
              onClick={onNewCategory}
              className="px-3 py-2 bg-[#4F46E5] text-white text-sm rounded-lg hover:bg-[#4338CA] transition"
            >
              Create First Category
            </button>
          </div>
        ) : (
          <div className="divide-y divide-[#E0E7FF]">
            <AnimatePresence>
              {categories.map((category) => (
                <motion.div
                  key={category.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className={`relative group ${
                    selectedId === category.id ? 'bg-[#F0F4F8]' : ''
                  }`}
                >
                  <button
                    onClick={() => onSelect(category.id)}
                    className="w-full px-4 py-3 text-left hover:bg-[#F0F4F8] transition flex items-center justify-between"
                  >
                    <div className="flex-1 min-w-0">
                      {editingName?.id === category.id ? (
                        <input
                          type="text"
                          value={editingName.value}
                          onChange={(e) =>
                            setEditingName({
                              id: category.id,
                              value: e.target.value,
                            })
                          }
                          onBlur={() =>
                            handleInlineEdit(category.id, editingName.value)
                          }
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              handleInlineEdit(category.id, editingName.value);
                            }
                          }}
                          autoFocus
                          className="px-2 py-1 border border-[#4F46E5] rounded text-sm w-full"
                          onClick={(e) => e.stopPropagation()}
                        />
                      ) : (
                        <>
                          <p className="font-medium text-[#0F172A] truncate">
                            {category.name}
                          </p>
                          <p className="text-xs text-[#64748B] mt-1">
                            {category.status === 'active' ? '✓ Active' : '⊘ Inactive'}
                          </p>
                        </>
                      )}
                    </div>

                    {/* Menu Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setExpandedMenu(
                          expandedMenu === category.id ? null : category.id
                        );
                      }}
                      className="ml-2 p-1 hover:bg-white rounded transition opacity-0 group-hover:opacity-100"
                    >
                      <MoreVertical size={16} className="text-[#64748B]" />
                    </button>
                  </button>

                  {/* Dropdown Menu */}
                  <AnimatePresence>
                    {expandedMenu === category.id && (
                      <motion.div
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -5 }}
                        className="absolute top-full right-4 mt-1 bg-white border border-[#E0E7FF] rounded-lg shadow-lg z-10"
                      >
                        <button
                          onClick={() => {
                            onEdit(category);
                            setExpandedMenu(null);
                          }}
                          className="flex items-center gap-2 px-3 py-2 text-sm text-[#0F172A] hover:bg-[#F0F4F8] w-full text-left rounded-t-lg transition"
                        >
                          <Edit2 size={14} />
                          Edit
                        </button>
                        <button
                          onClick={() => {
                            handleDelete(category.id);
                            setExpandedMenu(null);
                          }}
                          className="flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 w-full text-left rounded-b-lg transition"
                        >
                          <Trash2 size={14} />
                          Delete
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
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
                    Delete Category?
                  </h3>
                  <p className="text-sm text-[#64748B]">
                    This action cannot be undone. Make sure no content is using
                    this category before deleting.
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
                  onClick={confirmDelete}
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
