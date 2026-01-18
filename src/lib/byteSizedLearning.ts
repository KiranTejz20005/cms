/**
 * Byte-Sized Learning API Service
 * Handles all API calls for admin and feed consumption
 * Now using mock data to work without backend
 */

import { strapi } from './strapi';
import { uploadToCloudinary } from './cloudinary.ts';
import {
  mockContentStorage,
  mockCategoryStorage,
  simulateNetworkDelay,
  generateContentId,
  generateCategoryId,
} from './mockByteSizedData';

// strapi instance already prefixes `/api`, so avoid double-prefix here
const API_BASE = '';

// Flag to enable/disable mock mode (set to true to use mock data)
const USE_MOCK_DATA = true;
const USE_CLOUDINARY = Boolean(import.meta.env.VITE_CLOUDINARY_CLOUD_NAME && import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET);

// ============================================================================
// CATEGORY MANAGEMENT
// ============================================================================

export interface ByteSizedCategory {
  id: string;
  name: string;
  description?: string;
  icon?: {
    id: string;
    url: string;
  };
  status: 'active' | 'inactive';
  order: number;
  contentCount?: number;
  createdAt: string;
  updatedAt: string;
}

export const byteSizedCategoryApi = {
  /**
   * Get all categories (active + inactive, excluding deleted)
   */
  getAll: async (): Promise<ByteSizedCategory[]> => {
    if (USE_MOCK_DATA) {
      await simulateNetworkDelay();
      return [...mockCategoryStorage];
    }
    
    try {
      const response = await strapi.get(`${API_BASE}/byte-sized-categories`, {
        params: {
          sort: 'order:asc,name:asc',
          pagination: { limit: 1000 },
        },
      });
      return response.data?.data || [];
    } catch (error) {
      console.error('[Byte-Sized Categories] Get all error:', error);
      throw error;
    }
  },

  /**
   * Get single category with stats
   */
  getOne: async (id: string): Promise<ByteSizedCategory> => {
    if (USE_MOCK_DATA) {
      await simulateNetworkDelay();
      const category = mockCategoryStorage.find(c => c.id === id);
      if (!category) throw new Error('Category not found');
      return category;
    }
    
    try {
      const response = await strapi.get(`${API_BASE}/byte-sized-categories/${id}`);
      return response.data?.data;
    } catch (error) {
      console.error('[Byte-Sized Categories] Get one error:', error);
      throw error;
    }
  },

  /**
   * Create new category
   */
  create: async (data: {
    name: string;
    description?: string;
    icon?: FormData;
    status?: 'active' | 'inactive';
    order?: number;
  }): Promise<ByteSizedCategory> => {
    if (USE_MOCK_DATA) {
      await simulateNetworkDelay();
      const newCategory: ByteSizedCategory = {
        id: generateCategoryId(),
        name: data.name,
        description: data.description,
        status: data.status || 'active',
        order: data.order || mockCategoryStorage.length + 1,
        contentCount: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      mockCategoryStorage.push(newCategory);
      return newCategory;
    }
    
    try {
      const response = await strapi.post(`${API_BASE}/byte-sized-categories`, {
        data,
      });
      return response.data?.data;
    } catch (error) {
      console.error('[Byte-Sized Categories] Create error:', error);
      throw error;
    }
  },

  /**
   * Update category
   */
  update: async (
    id: string,
    data: Partial<{
      name: string;
      description: string;
      status: 'active' | 'inactive';
      order: number;
    }>
  ): Promise<ByteSizedCategory> => {
    if (USE_MOCK_DATA) {
      await simulateNetworkDelay();
      const category = mockCategoryStorage.find(c => c.id === id);
      if (!category) throw new Error('Category not found');
      Object.assign(category, data, { updatedAt: new Date().toISOString() });
      return category;
    }
    
    try {
      const response = await strapi.put(`${API_BASE}/byte-sized-categories/${id}`, {
        data,
      });
      return response.data?.data;
    } catch (error) {
      console.error('[Byte-Sized Categories] Update error:', error);
      throw error;
    }
  },

  /**
   * Delete category (with reassignment)
   */
  delete: async (id: string): Promise<void> => {
    if (USE_MOCK_DATA) {
      await simulateNetworkDelay();
      const index = mockCategoryStorage.findIndex(c => c.id === id);
      if (index > -1) {
        mockCategoryStorage.splice(index, 1);
      }
      return;
    }
    
    try {
      await strapi.delete(`${API_BASE}/byte-sized-categories/${id}`);
    } catch (error) {
      console.error('[Byte-Sized Categories] Delete error:', error);
      throw error;
    }
  },

  /**
   * Reassign content from one category to another, then delete old category
   */
  reassignAndDelete: async (
    fromCategoryId: string,
    toCategoryId: string
  ): Promise<void> => {
    if (USE_MOCK_DATA) {
      await simulateNetworkDelay();
      // Reassign all content from old category to new
      mockContentStorage.forEach(content => {
        if (content.category.id === fromCategoryId) {
          const newCat = mockCategoryStorage.find(c => c.id === toCategoryId);
          if (newCat) content.category = newCat;
        }
      });
      // Delete old category
      const index = mockCategoryStorage.findIndex(c => c.id === fromCategoryId);
      if (index > -1) mockCategoryStorage.splice(index, 1);
      return;
    }
    
    try {
      await strapi.patch(
        `${API_BASE}/byte-sized-categories/${fromCategoryId}/reassign`,
        {
          newCategoryId: toCategoryId,
        }
      );
    } catch (error) {
      console.error('[Byte-Sized Categories] Reassign error:', error);
      throw error;
    }
  },
};

// ============================================================================
// CONTENT MANAGEMENT
// ============================================================================

export interface ByteSizedContent {
  id: string;
  title: string;
  description?: string;
  category: ByteSizedCategory;
  contentType: 'video' | 'youtube-short' | 'image-lesson';
  status: 'draft' | 'published';
  visibility: 'public' | 'private';
  thumbnail?: {
    id: string;
    url: string;
    width?: number;
    height?: number;
  };
  order: number;
  videoUrl?: string;
  videoMetadata?: {
    duration: number;
    width: number;
    height: number;
    size: number;
  };
  youtubeShortId?: string;
  youtubeShortUrl?: string;
  imageUrl?: string;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
}

export const byteSizedContentApi = {
  /**
   * Get content by category (with pagination and filtering)
   */
  getByCategory: async (
    categoryId: string,
    options?: {
      limit?: number;
      offset?: number;
      status?: 'draft' | 'published' | 'all';
    }
  ): Promise<{
    items: ByteSizedContent[];
    total: number;
    limit: number;
    offset: number;
  }> => {
    if (USE_MOCK_DATA) {
      await simulateNetworkDelay();
      const limit = options?.limit || 20;
      const offset = options?.offset || 0;
      const status = options?.status || 'all';
      
      let filtered = mockContentStorage.filter(c => c.category.id === categoryId);
      if (status !== 'all') {
        filtered = filtered.filter(c => c.status === status);
      }
      
      const paginated = filtered.slice(offset, offset + limit);
      return {
        items: paginated,
        total: filtered.length,
        limit,
        offset,
      };
    }
    
    try {
      const limit = options?.limit || 20;
      const offset = options?.offset || 0;
      const status = options?.status || 'all';

      const response = await strapi.get(`${API_BASE}/byte-sized-content`, {
        params: {
          category: categoryId,
          limit,
          offset,
          status,
          sort: 'order:asc,publishedAt:desc',
          populate: ['category', 'thumbnail'],
        },
      });

      return {
        items: response.data?.data || [],
        total: response.data?.meta?.total || 0,
        limit: response.data?.meta?.limit || limit,
        offset: response.data?.meta?.offset || offset,
      };
    } catch (error) {
      console.error('[Byte-Sized Content] Get by category error:', error);
      throw error;
    }
  },

  /**
   * Get single content item
   */
  getOne: async (id: string): Promise<ByteSizedContent> => {
    if (USE_MOCK_DATA) {
      await simulateNetworkDelay();
      const content = mockContentStorage.find(c => c.id === id);
      if (!content) throw new Error('Content not found');
      return content;
    }
    
    try {
      const response = await strapi.get(`${API_BASE}/byte-sized-content/${id}`, {
        params: {
          populate: ['category', 'thumbnail'],
        },
      });
      return response.data?.data;
    } catch (error) {
      console.error('[Byte-Sized Content] Get one error:', error);
      throw error;
    }
  },

  /**
   * Create new content
   */
  create: async (data: {
    title: string;
    description?: string;
    category: string;
    contentType: 'video' | 'youtube-short' | 'image-lesson';
    thumbnail?: string | FormData;
    videoUrl?: string;
    youtubeShortUrl?: string;
    youtubeShortId?: string;
    imageUrl?: string;
    videoMetadata?: any;
    status?: 'draft' | 'published';
    visibility?: 'public' | 'private';
    order?: number;
  }): Promise<ByteSizedContent> => {
    if (USE_MOCK_DATA) {
      await simulateNetworkDelay();
      const category = mockCategoryStorage.find(c => c.id === data.category);
      if (!category) throw new Error('Category not found');
      
      const newContent: ByteSizedContent = {
        id: generateContentId(),
        title: data.title,
        description: data.description,
        category,
        contentType: data.contentType,
        status: data.status || 'published',
        visibility: data.visibility || 'public',
        order: data.order || mockContentStorage.length + 1,
        thumbnail: typeof data.thumbnail === 'string' 
          ? { id: 'thumb-' + Date.now(), url: data.thumbnail }
          : undefined,
        videoUrl: data.videoUrl,
        youtubeShortUrl: data.youtubeShortUrl,
        youtubeShortId: data.youtubeShortId,
        imageUrl: data.imageUrl,
        videoMetadata: data.videoMetadata,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        publishedAt: data.status === 'published' ? new Date().toISOString() : undefined,
      };
      
      mockContentStorage.unshift(newContent);
      return newContent;
    }
    
    try {
      const response = await strapi.post(`${API_BASE}/byte-sized-content`, {
        data,
      });
      return response.data?.data;
    } catch (error) {
      console.error('[Byte-Sized Content] Create error:', error);
      throw error;
    }
  },

  /**
   * Update content
   */
  update: async (
    id: string,
    data: Partial<{
      title: string;
      description: string;
      category: string;
      contentType: 'video' | 'youtube-short' | 'image-lesson';
      status: 'draft' | 'published';
      visibility: 'public' | 'private';
      order: number;
      thumbnail: string;
      videoUrl: string;
      youtubeShortUrl: string;
      youtubeShortId: string;
      imageUrl: string;
      videoMetadata: any;
    }>
  ): Promise<ByteSizedContent> => {
    if (USE_MOCK_DATA) {
      await simulateNetworkDelay();
      const content = mockContentStorage.find(c => c.id === id);
      if (!content) throw new Error('Content not found');
      
      if (data.category) {
        const newCat = mockCategoryStorage.find(c => c.id === data.category);
        if (newCat) content.category = newCat;
      }
      
      Object.assign(content, data, { updatedAt: new Date().toISOString() });
      return content;
    }
    
    try {
      const response = await strapi.put(`${API_BASE}/byte-sized-content/${id}`, {
        data,
      });
      return response.data?.data;
    } catch (error) {
      console.error('[Byte-Sized Content] Update error:', error);
      throw error;
    }
  },

  /**
   * Delete content
   */
  delete: async (id: string): Promise<void> => {
    if (USE_MOCK_DATA) {
      await simulateNetworkDelay();
      const index = mockContentStorage.findIndex(c => c.id === id);
      if (index > -1) mockContentStorage.splice(index, 1);
      return;
    }
    
    try {
      await strapi.delete(`${API_BASE}/byte-sized-content/${id}`);
    } catch (error) {
      console.error('[Byte-Sized Content] Delete error:', error);
      throw error;
    }
  },

  /**
   * Toggle publish status
   */
  togglePublish: async (id: string): Promise<ByteSizedContent> => {
    if (USE_MOCK_DATA) {
      await simulateNetworkDelay();
      const content = mockContentStorage.find(c => c.id === id);
      if (!content) throw new Error('Content not found');
      
      content.status = content.status === 'published' ? 'draft' : 'published';
      content.updatedAt = new Date().toISOString();
      if (content.status === 'published') {
        content.publishedAt = new Date().toISOString();
      }
      return content;
    }
    
    try {
      const response = await strapi.patch(
        `${API_BASE}/byte-sized-content/${id}/publish`,
        {}
      );
      return response.data?.data;
    } catch (error) {
      console.error('[Byte-Sized Content] Toggle publish error:', error);
      throw error;
    }
  },

  /**
   * Validate YouTube Shorts URL
   */
  validateYouTubeUrl: async (url: string): Promise<{
    valid: boolean;
    videoId?: string;
    error?: string;
  }> => {
    if (USE_MOCK_DATA) {
      await simulateNetworkDelay();
      // Simple regex validation for YouTube URLs
      const youtubeRegex = /(?:youtube\.com\/(?:shorts\/|watch\?v=)|youtu\.be\/)([\w-]+)/;
      const match = url.match(youtubeRegex);
      
      if (match && match[1]) {
        return { valid: true, videoId: match[1] };
      }
      return { valid: false, error: 'Invalid YouTube URL' };
    }
    
    try {
      const response = await strapi.post(
        `${API_BASE}/byte-sized-content/validate-youtube`,
        { url }
      );
      return response.data?.data || { valid: false };
    } catch (error) {
      console.error('[Byte-Sized Content] YouTube validation error:', error);
      return {
        valid: false,
        error: 'Failed to validate YouTube URL',
      };
    }
  },
};

// ============================================================================
// FILE UPLOADS
// ============================================================================

export const byteSizedUploadApi = {
  /**
   * Upload video file
   */
  uploadVideo: async (
    file: File,
    onProgress?: (progress: number) => void
  ): Promise<{
    url: string;
    path: string;
    filename: string;
    size: number;
    contentType: string;
    uploadedAt: string;
  }> => {
    // Prefer Cloudinary if configured
    if (USE_CLOUDINARY) {
      const data = await uploadToCloudinary(file, 'video', onProgress);
      return data;
    }
    if (USE_MOCK_DATA) {
      // Simulate upload progress
      await simulateNetworkDelay(200);
      if (onProgress) onProgress(20);
      await simulateNetworkDelay(200);
      if (onProgress) onProgress(50);
      await simulateNetworkDelay(200);
      if (onProgress) onProgress(80);
      await simulateNetworkDelay(200);
      if (onProgress) onProgress(100);
      
      // Create a mock blob URL for the video
      const mockUrl = URL.createObjectURL(file);
      return {
        url: mockUrl,
        path: `/uploads/videos/${file.name}`,
        filename: file.name,
        size: file.size,
        contentType: file.type,
        uploadedAt: new Date().toISOString(),
      };
    }
    
    try {
      const formData = new FormData();
      formData.append('video', file);

      const response = await strapi.post(`${API_BASE}/upload/video`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent: any) => {
          if (onProgress) {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            onProgress(percentCompleted);
          }
        },
      });

      return response.data?.data;
    } catch (error) {
      console.error('[Byte-Sized Upload] Video upload error:', error);
      throw error;
    }
  },

  /**
   * Upload image file
   */
  uploadImage: async (
    file: File,
    onProgress?: (progress: number) => void
  ): Promise<{
    url: string;
    path: string;
    filename: string;
    size: number;
    contentType: string;
    uploadedAt: string;
  }> => {
    if (USE_CLOUDINARY) {
      const data = await uploadToCloudinary(file, 'image', onProgress);
      return data;
    }
    if (USE_MOCK_DATA) {
      // Simulate upload progress
      await simulateNetworkDelay(150);
      if (onProgress) onProgress(30);
      await simulateNetworkDelay(150);
      if (onProgress) onProgress(70);
      await simulateNetworkDelay(150);
      if (onProgress) onProgress(100);
      
      // Create a mock blob URL for the image
      const mockUrl = URL.createObjectURL(file);
      return {
        url: mockUrl,
        path: `/uploads/images/${file.name}`,
        filename: file.name,
        size: file.size,
        contentType: file.type,
        uploadedAt: new Date().toISOString(),
      };
    }
    
    try {
      const formData = new FormData();
      formData.append('image', file);

      const response = await strapi.post(`${API_BASE}/upload/image`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent: any) => {
          if (onProgress) {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            onProgress(percentCompleted);
          }
        },
      });

      return response.data?.data;
    } catch (error) {
      console.error('[Byte-Sized Upload] Image upload error:', error);
      throw error;
    }
  },

  /**
   * Upload thumbnail
   */
  uploadThumbnail: async (
    file: File,
    onProgress?: (progress: number) => void
  ): Promise<{
    url: string;
    path: string;
    filename: string;
    size: number;
    contentType: string;
    uploadedAt: string;
  }> => {
    if (USE_CLOUDINARY) {
      const data = await uploadToCloudinary(file, 'image', onProgress);
      return data;
    }
    if (USE_MOCK_DATA) {
      // Simulate upload progress
      await simulateNetworkDelay(100);
      if (onProgress) onProgress(40);
      await simulateNetworkDelay(100);
      if (onProgress) onProgress(80);
      await simulateNetworkDelay(100);
      if (onProgress) onProgress(100);
      
      // Create a mock blob URL for the thumbnail
      const mockUrl = URL.createObjectURL(file);
      return {
        url: mockUrl,
        path: `/uploads/thumbnails/${file.name}`,
        filename: file.name,
        size: file.size,
        contentType: file.type,
        uploadedAt: new Date().toISOString(),
      };
    }
    
    try {
      const formData = new FormData();
      formData.append('thumbnail', file);

      const response = await strapi.post(
        `${API_BASE}/upload/thumbnail`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          onUploadProgress: (progressEvent: any) => {
            if (onProgress) {
              const percentCompleted = Math.round(
                (progressEvent.loaded * 100) / progressEvent.total
              );
              onProgress(percentCompleted);
            }
          },
        }
      );

      return response.data?.data;
    } catch (error) {
      console.error('[Byte-Sized Upload] Thumbnail upload error:', error);
      throw error;
    }
  },
};
