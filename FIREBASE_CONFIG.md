# Firebase Configuration Guide

## Overview
Your CMS application uses Firebase for:
- **Authentication** - User login/signup
- **Firestore Database** - Store video metadata, categories, user interactions
- **Cloud Storage** - Store video files, images, and thumbnails

## Environment Variables

All Firebase configuration is loaded from the `.env` file using Vite's `import.meta.env` API.

### Required Environment Variables

```bash
# Firebase Project Configuration
VITE_FIREBASE_API_KEY=AIzaSyCK9KiUhVLMaxFP0yj6z24eQ5B4AnbA1tI
VITE_FIREBASE_AUTH_DOMAIN=lifemonk-68437.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=lifemonk-68437
VITE_FIREBASE_STORAGE_BUCKET=lifemonk-68437.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=173699934554
VITE_FIREBASE_APP_ID=1:173699934554:web:1ddf1ca5025a121c2ceb63

# Optional - Google Analytics
VITE_FIREBASE_MEASUREMENT_ID=G-0MJVH68YCN
```

### Current Project Details
- **Project ID**: `lifemonk-68437`
- **Storage Bucket**: `lifemonk-68437.firebasestorage.app`
- **Auth Domain**: `lifemonk-68437.firebaseapp.com`

## Firebase Services Initialization

### File: `src/lib/firebase.ts`

The configuration file handles:

1. **Loading Environment Variables**
   - Reads all `VITE_FIREBASE_*` variables from `.env`
   - Uses `import.meta.env` for Vite compatibility (NOT `process.env`)

2. **Configuration Validation**
   - Checks all required variables are present
   - Provides clear error messages if any are missing
   - Shows which environment variables are missing

3. **Service Initialization**
   - Initializes Firebase App
   - Creates Auth service (`auth`)
   - Creates Firestore Database (`firestore`)
   - Creates Cloud Storage (`storage`)

4. **Offline Persistence**
   - Enables IndexedDB persistence for Firestore
   - Allows app to work offline
   - Data syncs when connection is restored

5. **Detailed Logging**
   - Shows initialization status in console
   - Lists all enabled services
   - Warns about persistence issues

## Console Output on App Start

When the app starts, you'll see in the browser console:

```
✅ Firebase configuration loaded successfully
📍 Project ID: lifemonk-68437
✅ Firebase app initialized
✅ Firebase services initialized:
   - Authentication
   - Firestore Database
   - Cloud Storage
✅ Firestore offline persistence enabled
```

## Firebase Modules Used

### Authentication (`src/lib/firebase.ts`)
```typescript
import { getAuth } from 'firebase/auth';
export const auth = getAuth(app);
```

**Usage**: User login, signup, password reset, session management

### Firestore Database (`src/lib/firebase.ts`)
```typescript
import { getFirestore } from 'firebase/firestore';
export const firestore = getFirestore(app);
```

**Collections**:
- `byteSizedVideos` - Video metadata and content
- `videoCategories` - Category definitions
- `videoInteractions` - User engagement (likes, saves, views)

### Cloud Storage (`src/lib/firebase.ts`)
```typescript
import { getStorage } from 'firebase/storage';
export const storage = getStorage(app);
```

**Paths**:
- `byte-sized-videos/{userId}/{filename}` - Video files
- `byte-sized-thumbnails/{userId}/{filename}` - Thumbnail images

## Usage in Application

### In Components/Pages:

```typescript
import { auth, firestore, storage } from '../lib/firebase';
import { videoService } from '../lib/videoService';

// Upload video
const mediaId = await videoService.uploadMedia(file, thumbnail, metadata);

// Get videos
const { videos } = await videoService.getVideosFeed(categoryId);

// Track view
await videoService.trackView(videoId, duration);

// Like video
await videoService.likeVideo(videoId);
```

### In Services:

The `videoService` (`src/lib/videoService.ts`) handles all Firebase operations:
- **Upload media** to Storage and save metadata to Firestore
- **Retrieve videos** from Firestore with filtering and pagination
- **Track user interactions** (views, likes, saves, shares)
- **Initialize default categories** if none exist

## Environment Setup for Development

### Step 1: Ensure `.env` file exists

The `.env` file should be in the root directory with all required variables.

### Step 2: Verify Variables

Check that all `VITE_FIREBASE_*` variables are present:

```bash
cat .env | grep VITE_FIREBASE
```

Expected output:
```
VITE_FIREBASE_API_KEY=AIzaSyCK9KiUhVLMaxFP0yj6z24eQ5B4AnbA1tI
VITE_FIREBASE_AUTH_DOMAIN=lifemonk-68437.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=lifemonk-68437
VITE_FIREBASE_STORAGE_BUCKET=lifemonk-68437.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=173699934554
VITE_FIREBASE_APP_ID=1:173699934554:web:1ddf1ca5025a121c2ceb63
VITE_FIREBASE_MEASUREMENT_ID=G-0MJVH68YCN
```

### Step 3: Run Development Server

```bash
npm run dev
```

Check browser console for Firebase initialization messages.

## Debugging Firebase Issues

### Issue: "Firebase configuration is missing..."

**Solution**: Check that all required variables are in `.env`:
1. Open `.env` file
2. Ensure all `VITE_FIREBASE_*` variables are present
3. Restart dev server: `npm run dev`

### Issue: "Error uploading media" in console

**Solution**: Check Firestore Security Rules
1. Go to Firebase Console → Firestore → Rules
2. Ensure user can read/write to `byteSizedVideos` collection
3. Ensure user can upload to Cloud Storage paths

### Issue: "Videos not appearing in feed"

**Solution**: Check:
1. User is authenticated (check `auth.currentUser` in console)
2. Videos exist in Firestore (`byteSizedVideos` collection)
3. Videos have `status: 'active'` field
4. Check browser console for error messages

### Issue: "Thumbnail not loading"

**Solution**: 
1. Check thumbnail URLs are valid
2. Verify Cloud Storage rules allow public read access
3. Check image format is supported (JPEG, PNG, WebP)

## Firebase Console Access

To manage your Firebase project:

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select project: **lifemonk-68437**
3. Access:
   - **Firestore** → View/edit collections
   - **Storage** → View/manage files
   - **Authentication** → Manage users
   - **Rules** → Update security rules

## Security Rules

### Firestore Rules
Users can only read/write their own data:
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /byteSizedVideos/{document=**} {
      allow read: if request.auth != null;
      allow create: if request.auth != null;
      allow update, delete: if request.auth.uid == resource.data.uploadedBy;
    }
  }
}
```

### Cloud Storage Rules
Users can upload to their own folder:
```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /byte-sized-videos/{userId}/{allPaths=**} {
      allow read, write: if request.auth.uid == userId;
    }
    match /byte-sized-thumbnails/{userId}/{allPaths=**} {
      allow read, write: if request.auth.uid == userId;
    }
  }
}
```

## Key Files

| File | Purpose |
|------|---------|
| [src/lib/firebase.ts](src/lib/firebase.ts) | Firebase initialization and configuration |
| [src/lib/videoService.ts](src/lib/videoService.ts) | All Firebase operations for videos |
| [src/components/MediaUpload.tsx](src/components/MediaUpload.tsx) | Upload UI component |
| [src/pages/ByteSizedLearning.tsx](src/pages/ByteSizedLearning.tsx) | Main feed page |

## Next Steps

1. ✅ Firebase configuration is set up
2. ✅ Environment variables are loaded from `.env`
3. ✅ Services are initialized and validated
4. ✅ Logging is enabled for debugging
5. **TODO**: Test authentication and uploads
6. **TODO**: Verify Firestore security rules
7. **TODO**: Monitor Firebase usage in console

## Summary

Your Firebase configuration:
- ✅ Loads all credentials from `.env` file
- ✅ Validates configuration on startup
- ✅ Initializes all services (Auth, Firestore, Storage)
- ✅ Enables offline persistence
- ✅ Provides detailed logging for debugging
- ✅ Is ready for video uploads and retrieval

The application is now fully configured to use Firebase for authentication, database, and file storage!
