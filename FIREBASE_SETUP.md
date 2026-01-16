# Firebase Configuration & Media Retrieval Setup

## Overview
The Firebase configuration has been completely rewritten with proper error handling and media retrieval capabilities using your environment variables from the `.env` file.

## Environment Variables Used
Your Firebase credentials from `.env`:
```
VITE_FIREBASE_API_KEY=AIzaSyCK9KiUhVLMaxFP0yj6z24eQ5B4AnbA1tI
VITE_FIREBASE_AUTH_DOMAIN=lifemonk-68437.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=lifemonk-68437
VITE_FIREBASE_STORAGE_BUCKET=lifemonk-68437.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=173699934554
VITE_FIREBASE_APP_ID=1:173699934554:web:1ddf1ca5025a121c2ceb63
VITE_FIREBASE_MEASUREMENT_ID=G-0MJVH68YCN
```

## Changes Made

### 1. Firebase Configuration (`src/lib/firebase.ts`)
✅ **Fixed Issues:**
- Changed from `process.env` to `import.meta.env` (Vite requirement)
- Implemented proper configuration validation with detailed error messages
- Throws error immediately if required variables are missing
- Better error handling for offline persistence

**Key Features:**
- Exports `auth`, `firestore`, and `storage` services
- Automatic offline persistence for Firestore
- Production-ready error handling

### 2. Video Service & Storage Utilities (`src/lib/videoService.ts`)
✅ **Fixed Critical Issues:**
- ❌ Removed incorrect `where('__name__', '==', id)` Firestore queries
- ✅ Implemented proper `getDoc()` for single document retrieval
- Added `ListResult` type import fix
- Fixed variable redeclaration issues

### 3. New Storage Service (`storageService`)
A comprehensive utility service for Firebase Storage operations:

```typescript
// Get download URL for any file
await storageService.getFileUrl('path/to/file')

// List all files in a directory
await storageService.listFiles('directory/path')

// Get file as bytes
await storageService.getFileBytes('path/to/file')

// Get all user's media (videos & thumbnails)
const userMedia = await storageService.getUserMedia(userId)
// Returns: { videos: [...], thumbnails: [...] }
```

### 4. Fixed Firestore Query Methods

**Before (Broken):**
```typescript
// This doesn't work with __name__
const interactionSnap = await getDocs(query(
    collection(firestore, INTERACTIONS_COLLECTION),
    where('__name__', '==', interactionId)
));
```

**After (Fixed):**
```typescript
// Proper way to get single document
const interactionRef = doc(firestore, INTERACTIONS_COLLECTION, interactionId);
const interactionSnap = await getDoc(interactionRef);
```

## Data Retrieval Methods

### Get Single Video
```typescript
const video = await videoService.getVideo(videoId);
// Returns: ShortVideo with all metadata and URLs
```

### Get Video Feed
```typescript
const { videos, lastVisible } = await videoService.getVideosFeed(
    categoryId,  // optional
    pageSize,    // default 5
    lastVisible  // for pagination
);
```

### Get All Categories
```typescript
const categories = await videoService.getCategories();
```

### Get User's Media from Storage
```typescript
const media = await storageService.getUserMedia(userId);
// Returns:
// {
//   videos: [
//     { path: 'path', name: 'filename', url: 'download-url' },
//     ...
//   ],
//   thumbnails: [...]
// }
```

## Upload Flow
1. User selects video & thumbnail in VideoUpload component
2. Files uploaded to Firebase Storage at:
   - Videos: `byte-sized-videos/{userId}/{timestamp}_{filename}`
   - Thumbnails: `byte-sized-thumbnails/{userId}/{timestamp}_{filename}`
3. Download URLs generated and stored in Firestore
4. Video metadata saved to `byteSizedVideos` collection
5. Status set to "processing" until video processing is complete

## Collections Structure

### `byteSizedVideos`
```typescript
{
  id: string
  title: string
  description: string
  category: string
  videoUrl: string          // Storage download URL
  thumbnailUrl: string      // Storage download URL
  duration: number
  aspectRatio: string
  fileSize: number
  uploadedBy: string        // User ID
  uploadedAt: Timestamp
  status: 'processing' | 'active' | 'rejected' | 'archived'
  views: number
  likes: number
  saves: number
  shares: number
  processedAt?: Timestamp
  rejectionReason?: string
}
```

### `videoInteractions`
```typescript
{
  userId: string
  videoId: string
  watched: boolean
  watchDuration: number
  liked: boolean
  saved: boolean
  sharedAt?: Timestamp
  lastInteractionAt: Timestamp
}
```

### `videoCategories`
```typescript
{
  id: string
  name: string
  description: string
  icon?: string
  createdAt: Timestamp
  videoCount: number
}
```

## Error Handling
All methods include proper try-catch blocks with detailed console logging for debugging. Missing Firebase configuration will throw an error immediately on app load.

## Testing
✅ Build successful with no TypeScript errors
✅ All Firebase imports properly configured
✅ Storage and Firestore services initialized
✅ Environment variables properly loaded

You can now:
- ✅ Upload videos to Firebase Storage
- ✅ Retrieve videos and metadata from Firestore
- ✅ List user's media from Storage
- ✅ Track views, likes, saves, and shares
- ✅ Handle pagination for video feeds
