import { useCallback, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, AlertCircle } from 'lucide-react';
import { byteSizedCategoryApi, byteSizedContentApi } from '../../../lib/byteSizedLearning';
import type { ByteSizedCategory, ByteSizedContent } from '../../../lib/byteSizedLearning';
import { CategoryPanel } from './CategoryPanel.js';
import { ContentPanel } from './ContentPanel.js';
import { ContentFormModal } from './ContentFormModal.js';
import { CategoryFormModal } from './CategoryFormModal.js';

interface AdminState {
  categories: ByteSizedCategory[];
  content: ByteSizedContent[];
  selectedCategoryId: string | null;
  loading: boolean;
  error: string | null;
  showContentForm: boolean;
  showCategoryForm: boolean;
  editingCategory: ByteSizedCategory | null;
  contentFilter: 'all' | 'draft' | 'published';
}

export function ByteSizedLearningAdmin() {
  const [state, setState] = useState<AdminState>({
    categories: [],
    content: [],
    selectedCategoryId: null,
    loading: true,
    error: null,
    showContentForm: false,
    showCategoryForm: false,
    editingCategory: null,
    contentFilter: 'all',
  });

  // Load categories on mount
  useEffect(() => {
    loadCategories();
  }, []);

  // Load content when category selection changes
  useEffect(() => {
    if (state.selectedCategoryId) {
      loadContent(state.selectedCategoryId);
    }
  }, [state.selectedCategoryId, state.contentFilter]);

  const loadCategories = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      const categories = await byteSizedCategoryApi.getAll();
      setState(prev => ({
        ...prev,
        categories,
        selectedCategoryId: categories.length > 0 ? categories[0].id : null,
        loading: false,
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to load categories',
        loading: false,
      }));
    }
  }, []);

  const loadContent = useCallback(async (categoryId: string) => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      const result = await byteSizedContentApi.getByCategory(categoryId, {
        status: state.contentFilter,
        limit: 100,
      });
      setState(prev => ({
        ...prev,
        content: result.items,
        loading: false,
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to load content',
        loading: false,
      }));
    }
  }, [state.contentFilter]);

  const handleCreateCategory = useCallback(async (data: any) => {
    try {
      await byteSizedCategoryApi.create(data);
      setState(prev => ({ ...prev, showCategoryForm: false }));
      await loadCategories();
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to create category',
      }));
    }
  }, [loadCategories]);

  const handleUpdateCategory = useCallback(async (id: string, data: any) => {
    try {
      await byteSizedCategoryApi.update(id, data);
      setState(prev => ({ ...prev, editingCategory: null }));
      await loadCategories();
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to update category',
      }));
    }
  }, [loadCategories]);

  const handleDeleteCategory = useCallback(async (id: string) => {
    try {
      await byteSizedCategoryApi.delete(id);
      await loadCategories();
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to delete category',
      }));
    }
  }, [loadCategories]);

  const handleCreateContent = useCallback(async (data: any) => {
    try {
      await byteSizedContentApi.create({
        ...data,
        category: state.selectedCategoryId,
      });
      setState(prev => ({ ...prev, showContentForm: false }));
      if (state.selectedCategoryId) {
        await loadContent(state.selectedCategoryId);
      }
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to create content',
      }));
    }
  }, [state.selectedCategoryId, loadContent]);

  const handleDeleteContent = useCallback(async (id: string) => {
    try {
      await byteSizedContentApi.delete(id);
      if (state.selectedCategoryId) {
        await loadContent(state.selectedCategoryId);
      }
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to delete content',
      }));
    }
  }, [state.selectedCategoryId, loadContent]);

  const handleTogglePublish = useCallback(async (id: string) => {
    try {
      await byteSizedContentApi.togglePublish(id);
      if (state.selectedCategoryId) {
        await loadContent(state.selectedCategoryId);
      }
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to toggle publish',
      }));
    }
  }, [state.selectedCategoryId, loadContent]);

  return (
    <div className="h-screen flex flex-col bg-[#F5F7FA]">
      {/* Header */}
      <div className="bg-white border-b border-[#E0E7FF] px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#0F172A]">Byte-Sized Learning</h1>
          <p className="text-sm text-[#64748B] mt-1">Manage short-form learning content</p>
        </div>
        <button
          onClick={() => setState(prev => ({ ...prev, showContentForm: true }))}
          className="flex items-center gap-2 px-4 py-2 bg-[#4F46E5] text-white rounded-lg hover:bg-[#4338CA] transition"
        >
          <Plus size={20} />
          New Content
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden flex gap-6 p-6">
        {/* Category Panel */}
        <div className="w-80">
          <CategoryPanel
            categories={state.categories}
            selectedId={state.selectedCategoryId}
            onSelect={(id: string) => setState(prev => ({ ...prev, selectedCategoryId: id }))}
            onNewCategory={() => setState(prev => ({ ...prev, showCategoryForm: true }))}
            onEdit={(cat: ByteSizedCategory) => setState(prev => ({ ...prev, editingCategory: cat }))}
            onDelete={handleDeleteCategory}
            onUpdate={handleUpdateCategory}
            loading={state.loading}
          />
        </div>

        {/* Content Panel */}
        <div className="flex-1 min-w-0">
          <ContentPanel
            content={state.content}
            selectedCategoryId={state.selectedCategoryId}
            filter={state.contentFilter}
            onFilterChange={(filter: 'draft' | 'published' | 'all') => setState(prev => ({ ...prev, contentFilter: filter }))}
            onDelete={handleDeleteContent}
            onTogglePublish={handleTogglePublish}
            loading={state.loading}
          />
        </div>
      </div>

      {/* Error Toast */}
      <AnimatePresence>
        {state.error && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-6 right-6 flex items-center gap-3 px-4 py-3 bg-red-50 border border-red-200 rounded-lg shadow-lg"
          >
            <AlertCircle size={20} className="text-red-600" />
            <span className="text-sm text-red-700">{state.error}</span>
            <button
              onClick={() => setState(prev => ({ ...prev, error: null }))}
              className="ml-2 text-red-600 hover:text-red-700"
            >
              ✕
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modals */}
      <CategoryFormModal
        isOpen={state.showCategoryForm}
        isEditing={!!state.editingCategory}
        category={state.editingCategory || undefined}
        onClose={() => {
          setState(prev => ({ ...prev, showCategoryForm: false, editingCategory: null }));
        }}
        onSubmit={async (data: any) => {
          if (state.editingCategory) {
            await handleUpdateCategory(state.editingCategory.id, data);
          } else {
            await handleCreateCategory(data);
          }
        }}
      />

      <ContentFormModal
        isOpen={state.showContentForm}
        selectedCategoryId={state.selectedCategoryId}
        categories={state.categories}
        onClose={() => setState(prev => ({ ...prev, showContentForm: false }))}
        onSubmit={handleCreateContent}
      />
    </div>
  );
}
