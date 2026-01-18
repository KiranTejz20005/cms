/**
 * Mock Data for Byte-Sized Learning
 * This allows the app to work without a backend
 */

import type { ByteSizedCategory, ByteSizedContent } from './byteSizedLearning';

export const MOCK_CATEGORIES: ByteSizedCategory[] = [
  {
    id: 'cat-1',
    name: 'Programming',
    description: 'Learn to code with bite-sized lessons',
    status: 'active',
    order: 1,
    contentCount: 5,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'cat-2',
    name: 'Design',
    description: 'Master design principles quickly',
    status: 'active',
    order: 2,
    contentCount: 3,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'cat-3',
    name: 'Marketing',
    description: 'Digital marketing tips and tricks',
    status: 'active',
    order: 3,
    contentCount: 4,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'cat-4',
    name: 'Business',
    description: 'Entrepreneurship and business strategies',
    status: 'active',
    order: 4,
    contentCount: 2,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export const MOCK_CONTENT: ByteSizedContent[] = [
  // Programming Content
  {
    id: 'content-1',
    title: 'JavaScript Basics in 60 Seconds',
    description: 'Learn JavaScript fundamentals quickly with this short video tutorial',
    category: MOCK_CATEGORIES[0],
    contentType: 'youtube-short',
    status: 'published',
    visibility: 'public',
    order: 1,
    youtubeShortId: 'dQw4w9WgXcQ',
    youtubeShortUrl: 'https://www.youtube.com/shorts/dQw4w9WgXcQ',
    thumbnail: {
      id: 'thumb-1',
      url: 'https://images.unsplash.com/photo-1542831371-29b0f74f9713?w=400&h=700&fit=crop',
      width: 400,
      height: 700,
    },
    createdAt: new Date(Date.now() - 3600000).toISOString(),
    updatedAt: new Date(Date.now() - 3600000).toISOString(),
    publishedAt: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: 'content-2',
    title: 'Python Variables Explained',
    description: 'Understanding variables in Python programming',
    category: MOCK_CATEGORIES[0],
    contentType: 'image-lesson',
    status: 'published',
    visibility: 'public',
    order: 2,
    imageUrl: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=400&h=700&fit=crop',
    thumbnail: {
      id: 'thumb-2',
      url: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=400&h=700&fit=crop',
      width: 400,
      height: 700,
    },
    createdAt: new Date(Date.now() - 7200000).toISOString(),
    updatedAt: new Date(Date.now() - 7200000).toISOString(),
    publishedAt: new Date(Date.now() - 7200000).toISOString(),
  },
  {
    id: 'content-3',
    title: 'React Hooks Quick Guide',
    description: 'Master React Hooks in under a minute',
    category: MOCK_CATEGORIES[0],
    contentType: 'youtube-short',
    status: 'published',
    visibility: 'public',
    order: 3,
    youtubeShortId: 'jNQXAC9IVRw',
    youtubeShortUrl: 'https://www.youtube.com/shorts/jNQXAC9IVRw',
    thumbnail: {
      id: 'thumb-3',
      url: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=400&h=700&fit=crop',
      width: 400,
      height: 700,
    },
    createdAt: new Date(Date.now() - 10800000).toISOString(),
    updatedAt: new Date(Date.now() - 10800000).toISOString(),
    publishedAt: new Date(Date.now() - 10800000).toISOString(),
  },

  // Design Content
  {
    id: 'content-4',
    title: 'Color Theory Basics',
    description: 'Learn color theory fundamentals for better designs',
    category: MOCK_CATEGORIES[1],
    contentType: 'image-lesson',
    status: 'published',
    visibility: 'public',
    order: 1,
    imageUrl: 'https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?w=400&h=700&fit=crop',
    thumbnail: {
      id: 'thumb-4',
      url: 'https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?w=400&h=700&fit=crop',
      width: 400,
      height: 700,
    },
    createdAt: new Date(Date.now() - 14400000).toISOString(),
    updatedAt: new Date(Date.now() - 14400000).toISOString(),
    publishedAt: new Date(Date.now() - 14400000).toISOString(),
  },
  {
    id: 'content-5',
    title: 'Typography Tips',
    description: 'Essential typography principles every designer should know',
    category: MOCK_CATEGORIES[1],
    contentType: 'youtube-short',
    status: 'published',
    visibility: 'public',
    order: 2,
    youtubeShortId: 'Me-Im-SZrfM',
    youtubeShortUrl: 'https://www.youtube.com/shorts/Me-Im-SZrfM',
    thumbnail: {
      id: 'thumb-5',
      url: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=400&h=700&fit=crop',
      width: 400,
      height: 700,
    },
    createdAt: new Date(Date.now() - 18000000).toISOString(),
    updatedAt: new Date(Date.now() - 18000000).toISOString(),
    publishedAt: new Date(Date.now() - 18000000).toISOString(),
  },

  // Marketing Content
  {
    id: 'content-6',
    title: 'Social Media Strategy in 60s',
    description: 'Quick tips for effective social media marketing',
    category: MOCK_CATEGORIES[2],
    contentType: 'youtube-short',
    status: 'published',
    visibility: 'public',
    order: 1,
    youtubeShortId: '9bZkp7q19f0',
    youtubeShortUrl: 'https://www.youtube.com/shorts/9bZkp7q19f0',
    thumbnail: {
      id: 'thumb-6',
      url: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=400&h=700&fit=crop',
      width: 400,
      height: 700,
    },
    createdAt: new Date(Date.now() - 21600000).toISOString(),
    updatedAt: new Date(Date.now() - 21600000).toISOString(),
    publishedAt: new Date(Date.now() - 21600000).toISOString(),
  },
  {
    id: 'content-7',
    title: 'Email Marketing Best Practices',
    description: 'Boost your email campaign performance',
    category: MOCK_CATEGORIES[2],
    contentType: 'image-lesson',
    status: 'published',
    visibility: 'public',
    order: 2,
    imageUrl: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=400&h=700&fit=crop',
    thumbnail: {
      id: 'thumb-7',
      url: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=400&h=700&fit=crop',
      width: 400,
      height: 700,
    },
    createdAt: new Date(Date.now() - 25200000).toISOString(),
    updatedAt: new Date(Date.now() - 25200000).toISOString(),
    publishedAt: new Date(Date.now() - 25200000).toISOString(),
  },

  // Business Content
  {
    id: 'content-8',
    title: 'Startup Funding 101',
    description: 'Understanding different types of startup funding',
    category: MOCK_CATEGORIES[3],
    contentType: 'youtube-short',
    status: 'published',
    visibility: 'public',
    order: 1,
    youtubeShortId: 'kJQP7kiw5Fk',
    youtubeShortUrl: 'https://www.youtube.com/shorts/kJQP7kiw5Fk',
    thumbnail: {
      id: 'thumb-8',
      url: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=400&h=700&fit=crop',
      width: 400,
      height: 700,
    },
    createdAt: new Date(Date.now() - 28800000).toISOString(),
    updatedAt: new Date(Date.now() - 28800000).toISOString(),
    publishedAt: new Date(Date.now() - 28800000).toISOString(),
  },
];

// In-memory storage for new content
export const mockContentStorage = [...MOCK_CONTENT];
export const mockCategoryStorage = [...MOCK_CATEGORIES];

// Helper to simulate network delay
export const simulateNetworkDelay = (ms: number = 300) => 
  new Promise(resolve => setTimeout(resolve, ms));

// Generate unique IDs
let contentIdCounter = MOCK_CONTENT.length + 1;
let categoryIdCounter = MOCK_CATEGORIES.length + 1;

export const generateContentId = () => `content-${contentIdCounter++}`;
export const generateCategoryId = () => `cat-${categoryIdCounter++}`;
