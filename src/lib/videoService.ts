import { 
    collection, 
    query, 
    where, 
    getDocs, 
    doc, 
    setDoc, 
    updateDoc, 
    increment,
    orderBy,
    limit,
    startAfter,
    getDoc,
    QueryDocumentSnapshot,
    type DocumentData,
    Timestamp,
    writeBatch
} from 'firebase/firestore';
import { 
    ref, 
    uploadBytes, 
    getBytes,
    getDownloadURL, 
    deleteObject,
    listAll,
    type ListResult
} from 'firebase/storage';
import { firestore, storage } from './firebase';
import { getAuth } from 'firebase/auth';

export interface ShortVideo {
    id: string;
    title: string;
    description: string;
    category: string;
    videoUrl: string;
    thumbnailUrl: string;
    duration: number; // in seconds
    aspectRatio: string; // should be "9:16" or "16:9"
    fileSize: number; // in bytes
    mediaType: 'image' | 'video' | 'short'; // Added media type
    uploadedBy: string;
    uploadedAt: Timestamp;
    status: 'processing' | 'active' | 'rejected' | 'archived';
    views: number;
    likes: number;
    saves: number;
    shares: number;
    processedAt?: Timestamp;
    rejectionReason?: string;
}

export interface VideoCategory {
    id: string;
    name: string;
    description: string;
    icon?: string;
    createdAt: Timestamp;
    videoCount: number;
}

export interface UserInteraction {
    userId: string;
    videoId: string;
    watched: boolean;
    watchDuration: number;
    liked: boolean;
    saved: boolean;
    sharedAt?: Timestamp;
    lastInteractionAt: Timestamp;
}

const VIDEOS_COLLECTION = 'byteSizedVideos';
const CATEGORIES_COLLECTION = 'videoCategories';
const INTERACTIONS_COLLECTION = 'videoInteractions';
const VIDEO_STORAGE_PATH = 'byte-sized-videos';
const THUMBNAIL_STORAGE_PATH = 'byte-sized-thumbnails';

// Constants for validation
// const MAX_VIDEO_DURATION = 60; // seconds
// const MIN_VIDEO_DURATION = 5; // seconds
// const MAX_VIDEO_SIZE = 100 * 1024 * 1024; // 100 MB
// const REQUIRED_ASPECT_RATIO = 9 / 16;
// const ASPECT_RATIO_TOLERANCE = 0.02; // 2% tolerance

/**
 * Utility functions for Firebase Storage operations
 */
export const storageService = {
    /**
     * Get download URL for a file in Storage
     */
    async getFileUrl(storagePath: string): Promise<string> {
        try {
            const fileRef = ref(storage, storagePath);
            const url = await getDownloadURL(fileRef);
            return url;
        } catch (error) {
            console.error(`Error getting download URL for ${storagePath}:`, error);
            throw error;
        }
    },

    /**
     * List all files in a directory
     */
    async listFiles(directoryPath: string): Promise<ListResult> {
        try {
            const dirRef = ref(storage, directoryPath);
            const result = await listAll(dirRef);
            return result;
        } catch (error) {
            console.error(`Error listing files in ${directoryPath}:`, error);
            throw error;
        }
    },

    /**
     * Get file as bytes
     */
    async getFileBytes(storagePath: string, maxBytes?: number): Promise<ArrayBuffer> {
        try {
            const fileRef = ref(storage, storagePath);
            const bytes = await getBytes(fileRef, maxBytes);
            return bytes;
        } catch (error) {
            console.error(`Error getting bytes for ${storagePath}:`, error);
            throw error;
        }
    },

    /**
     * Get all media files for a user
     */
    async getUserMedia(userId: string): Promise<{
        videos: { path: string; name: string; url: string }[];
        thumbnails: { path: string; name: string; url: string }[];
    }> {
        try {
            const videoPath = `${VIDEO_STORAGE_PATH}/${userId}`;
            const thumbnailPath = `${THUMBNAIL_STORAGE_PATH}/${userId}`;

            const videoResult = await this.listFiles(videoPath);
            const thumbnailResult = await this.listFiles(thumbnailPath);

            const videos = await Promise.all(
                videoResult.items.map(async (item) => ({
                    path: item.fullPath,
                    name: item.name,
                    url: await getDownloadURL(item)
                }))
            );

            const thumbnails = await Promise.all(
                thumbnailResult.items.map(async (item) => ({
                    path: item.fullPath,
                    name: item.name,
                    url: await getDownloadURL(item)
                }))
            );

            return { videos, thumbnails };
        } catch (error) {
            console.error(`Error fetching user media for ${userId}:`, error);
            throw error;
        }
    }
};

// Initialize default categories if they don't exist
export const initializeDefaultCategories = async (): Promise<VideoCategory[]> => {
    try {
        const existing = await videoService.getCategories();
        if (existing.length > 0) {
            console.log('Categories already exist:', existing.length);
            return existing;
        }

        const defaultCategories = [
            { name: 'Mathematics', description: 'Quick math tips and tricks', icon: '🔢' },
            { name: 'Science', description: 'Science concepts explained', icon: '🔬' },
            { name: 'History', description: 'Historical events and facts', icon: '📚' },
            { name: 'Languages', description: 'Language learning tips', icon: '🌍' },
            { name: 'Technology', description: 'Tech concepts and tutorials', icon: '💻' },
            { name: 'Art & Design', description: 'Art and design inspiration', icon: '🎨' },
            { name: 'Health', description: 'Health and wellness tips', icon: '💪' },
            { name: 'Personal Development', description: 'Self-improvement content', icon: '🌱' }
        ];

        const created: VideoCategory[] = [];
        for (const category of defaultCategories) {
            try {
                const docRef = doc(collection(firestore, CATEGORIES_COLLECTION));
                await setDoc(docRef, {
                    ...category,
                    createdAt: Timestamp.now(),
                    videoCount: 0
                });
                created.push({ 
                    id: docRef.id, 
                    ...category,
                    createdAt: Timestamp.now(),
                    videoCount: 0
                });
            } catch (err) {
                console.warn(`Failed to create category ${category.name}:`, err);
            }
        }

        console.log(`Created ${created.length} default categories`);
        return created;
    } catch (error) {
        console.error('Error initializing categories:', error);
        throw error;
    }
};

// Video Service
export const videoService = {
    // Fetch all categories
    async getCategories(): Promise<VideoCategory[]> {
        try {
            const q = query(
                collection(firestore, CATEGORIES_COLLECTION),
                orderBy('createdAt', 'desc')
            );
            const snapshot = await getDocs(q);
            return snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as VideoCategory[];
        } catch (error) {
            console.error('Error fetching categories:', error);
            throw error;
        }
    },

    // Fetch videos with pagination - show both active and processing
    async getVideosFeed(
        categoryId?: string,
        pageSize: number = 10,
        lastVisible?: QueryDocumentSnapshot<DocumentData>
    ): Promise<{ videos: ShortVideo[]; lastVisible: QueryDocumentSnapshot<DocumentData> | null }> {
        try {
            console.log('Fetching videos...', { categoryId, pageSize });
            
            let q;
            if (categoryId) {
                q = query(
                    collection(firestore, VIDEOS_COLLECTION),
                    where('category', '==', categoryId),
                    where('status', 'in', ['active', 'processing']),
                    orderBy('uploadedAt', 'desc'),
                    limit(pageSize)
                );
            } else {
                q = query(
                    collection(firestore, VIDEOS_COLLECTION),
                    where('status', 'in', ['active', 'processing']),
                    orderBy('uploadedAt', 'desc'),
                    limit(pageSize)
                );
            }

            let snapshot;
            if (lastVisible) {
                q = query(
                    collection(firestore, VIDEOS_COLLECTION),
                    where('status', 'in', ['active', 'processing']),
                    ...(categoryId ? [where('category', '==', categoryId)] : []),
                    orderBy('uploadedAt', 'desc'),
                    startAfter(lastVisible),
                    limit(pageSize)
                );
                snapshot = await getDocs(q);
            } else {
                snapshot = await getDocs(q);
            }

            const videos = snapshot.docs.map(doc => {
                const data = doc.data();
                return {
                    id: doc.id,
                    ...data,
                    uploadedAt: data.uploadedAt || Timestamp.now()
                } as ShortVideo;
            });

            console.log('Fetched videos:', videos.length);
            return {
                videos,
                lastVisible: snapshot.docs.length > 0 ? snapshot.docs[snapshot.docs.length - 1] : null
            };
        } catch (error) {
            console.error('Error fetching videos:', error);
            // Return empty array instead of throwing to avoid breaking the UI
            return { videos: [], lastVisible: null };
        }
    },

    // Get single video
    async getVideo(videoId: string): Promise<ShortVideo | null> {
        try {
            const videoRef = doc(firestore, VIDEOS_COLLECTION, videoId);
            const docSnap = await getDoc(videoRef);
            
            if (!docSnap.exists()) {
                console.warn(`Video with ID ${videoId} not found`);
                return null;
            }
            
            return {
                id: docSnap.id,
                ...docSnap.data()
            } as ShortVideo;
        } catch (error) {
            console.error('Error fetching video:', error);
            throw error;
        }
    },

    // Upload media (video, image, or short)
    async uploadMedia(
        mediaFile: File,
        thumbnailFile: File,
        metadata: Omit<ShortVideo, 'id' | 'videoUrl' | 'thumbnailUrl' | 'uploadedAt' | 'views' | 'likes' | 'saves' | 'shares' | 'status' | 'uploadedBy'>
    ): Promise<string> {
        try {
            const auth = getAuth();
            const currentUser = auth.currentUser;

            if (!currentUser) {
                throw new Error('User not authenticated. Please log in first.');
            }

            if (!metadata.category) {
                throw new Error('Category is required');
            }

            // Validate based on media type
            if (metadata.mediaType === 'image') {
                this.validateImageFile(mediaFile);
            } else {
                this.validateVideoFile(mediaFile);
            }

            console.log('Uploading media to storage...', {
                mediaType: metadata.mediaType,
                fileName: mediaFile.name,
                userId: currentUser.uid
            });

            // Upload media
            const timestamp = Date.now();
            const sanitizedMediaName = mediaFile.name.replace(/[^a-zA-Z0-9.-]/g, '_');
            const mediaStorageRef = ref(storage, `${VIDEO_STORAGE_PATH}/${currentUser.uid}/${timestamp}_${sanitizedMediaName}`);
            const mediaSnapshot = await uploadBytes(mediaStorageRef, mediaFile);
            const mediaUrl = await getDownloadURL(mediaSnapshot.ref);
            console.log('Media uploaded successfully:', mediaUrl);

            // Upload thumbnail
            const sanitizedThumbName = thumbnailFile.name.replace(/[^a-zA-Z0-9.-]/g, '_');
            const thumbnailStorageRef = ref(storage, `${THUMBNAIL_STORAGE_PATH}/${currentUser.uid}/${timestamp}_${sanitizedThumbName}`);
            const thumbnailSnapshot = await uploadBytes(thumbnailStorageRef, thumbnailFile);
            const thumbnailUrl = await getDownloadURL(thumbnailSnapshot.ref);
            console.log('Thumbnail uploaded successfully:', thumbnailUrl);

            // Save to Firestore with active status
            const mediaDoc = {
                ...metadata,
                videoUrl: mediaUrl,
                thumbnailUrl,
                uploadedBy: currentUser.uid,
                uploadedAt: Timestamp.now(),
                status: 'active',  // Set to active immediately so it appears in feed
                views: 0,
                likes: 0,
                saves: 0,
                shares: 0
            };

            console.log('Saving media to Firestore...', {
                title: metadata.title,
                category: metadata.category,
                mediaType: metadata.mediaType,
                status: 'active'
            });

            const mediaRef = doc(collection(firestore, VIDEOS_COLLECTION));
            await setDoc(mediaRef, mediaDoc);

            console.log('Media document created successfully:', mediaRef.id);
            
            // Verify the document was saved
            const verifyDoc = await getDoc(mediaRef);
            if (!verifyDoc.exists()) {
                throw new Error('Document verification failed - could not confirm save');
            }
            console.log('Media document verified in Firestore');
            
            return mediaRef.id;
        } catch (error) {
            console.error('Error uploading media:', error);
            if (error instanceof Error) {
                throw new Error(`Upload failed: ${error.message}`);
            }
            throw new Error('Upload failed. Please try again.');
        }
    },

    // Upload video and thumbnail (legacy, uses uploadMedia now)
    async uploadVideo(
        videoFile: File,
        thumbnailFile: File,
        metadata: Omit<ShortVideo, 'id' | 'videoUrl' | 'thumbnailUrl' | 'uploadedAt' | 'views' | 'likes' | 'saves' | 'shares' | 'status' | 'uploadedBy'>
    ): Promise<string> {
        return this.uploadMedia(videoFile, thumbnailFile, metadata);
    },

    // Validate video file
    validateVideoFile(file: File): void {
        const MAX_VIDEO_SIZE = 100 * 1024 * 1024; // 100 MB
        
        // Check file type
        if (!file.type.startsWith('video/')) {
            throw new Error('File must be a video');
        }

        // Check file size
        if (file.size > MAX_VIDEO_SIZE) {
            throw new Error(`Video size must be less than ${MAX_VIDEO_SIZE / (1024 * 1024)}MB`);
        }

        // Duration and aspect ratio validation happens on backend after processing
    },

    // Validate image file
    validateImageFile(file: File): void {
        const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10 MB
        
        // Check file type
        if (!file.type.startsWith('image/')) {
            throw new Error('File must be an image');
        }

        // Check file size
        if (file.size > MAX_IMAGE_SIZE) {
            throw new Error(`Image size must be less than ${MAX_IMAGE_SIZE / (1024 * 1024)}MB`);
        }
    },

    // Mark video as active after processing
    async markVideoAsActive(videoId: string): Promise<void> {
        try {
            const videoRef = doc(firestore, VIDEOS_COLLECTION, videoId);
            await updateDoc(videoRef, {
                status: 'active',
                processedAt: Timestamp.now()
            });
        } catch (error) {
            console.error('Error marking video as active:', error);
            throw error;
        }
    },

    // Reject video with reason
    async rejectVideo(videoId: string, rejectionReason: string): Promise<void> {
        try {
            const videoRef = doc(firestore, VIDEOS_COLLECTION, videoId);
            await updateDoc(videoRef, {
                status: 'rejected',
                rejectionReason
            });
        } catch (error) {
            console.error('Error rejecting video:', error);
            throw error;
        }
    },

    // Track video view (only count if watched for minimum duration)
    async trackView(videoId: string, watchDuration: number): Promise<void> {
        try {
            const auth = getAuth();
            const currentUser = auth.currentUser;

            if (!currentUser) return;

            const minWatchDuration = 3; // at least 3 seconds
            if (watchDuration < minWatchDuration) return;

            const interactionId = `${currentUser.uid}_${videoId}`;
            const interactionRef = doc(firestore, INTERACTIONS_COLLECTION, interactionId);

            const batch = writeBatch(firestore);
            
            // Update interaction record
            batch.set(interactionRef, {
                userId: currentUser.uid,
                videoId,
                watched: true,
                watchDuration,
                lastInteractionAt: Timestamp.now()
            }, { merge: true });

            // Increment view count
            const videoRef = doc(firestore, VIDEOS_COLLECTION, videoId);
            batch.update(videoRef, { views: increment(1) });

            await batch.commit();
        } catch (error) {
            console.error('Error tracking view:', error);
            // Don't throw - view tracking should not block playback
        }
    },

    // Like/unlike video
    async toggleLike(videoId: string): Promise<boolean> {
        try {
            const auth = getAuth();
            const currentUser = auth.currentUser;

            if (!currentUser) {
                throw new Error('User not authenticated');
            }

            const interactionId = `${currentUser.uid}_${videoId}`;
            const interactionRef = doc(firestore, INTERACTIONS_COLLECTION, interactionId);
            const videoRef = doc(firestore, VIDEOS_COLLECTION, videoId);

            const batch = writeBatch(firestore);

            // Get current interaction state
            const interactionSnap = await getDoc(interactionRef);

            const isCurrentlyLiked = interactionSnap.data()?.liked ?? false;

            batch.set(interactionRef, {
                userId: currentUser.uid,
                videoId,
                liked: !isCurrentlyLiked,
                lastInteractionAt: Timestamp.now()
            }, { merge: true });

            // Update video like count
            batch.update(videoRef, {
                likes: increment(!isCurrentlyLiked ? 1 : -1)
            });

            await batch.commit();
            return !isCurrentlyLiked;
        } catch (error) {
            console.error('Error toggling like:', error);
            throw error;
        }
    },

    // Save/unsave video
    async toggleSave(videoId: string): Promise<boolean> {
        try {
            const auth = getAuth();
            const currentUser = auth.currentUser;

            if (!currentUser) {
                throw new Error('User not authenticated');
            }

            const interactionId = `${currentUser.uid}_${videoId}`;
            const interactionRef = doc(firestore, INTERACTIONS_COLLECTION, interactionId);
            const videoRef = doc(firestore, VIDEOS_COLLECTION, videoId);

            const batch = writeBatch(firestore);

            // Get current interaction state
            const interactionSnap = await getDoc(interactionRef);

            const isCurrentlySaved = interactionSnap.data()?.saved ?? false;

            batch.set(interactionRef, {
                userId: currentUser.uid,
                videoId,
                saved: !isCurrentlySaved,
                lastInteractionAt: Timestamp.now()
            }, { merge: true });

            // Update video save count
            batch.update(videoRef, {
                saves: increment(!isCurrentlySaved ? 1 : -1)
            });

            await batch.commit();
            return !isCurrentlySaved;
        } catch (error) {
            console.error('Error toggling save:', error);
            throw error;
        }
    },

    // Track share
    async trackShare(videoId: string): Promise<void> {
        try {
            const auth = getAuth();
            const currentUser = auth.currentUser;

            if (!currentUser) return;

            const interactionId = `${currentUser.uid}_${videoId}`;
            const interactionRef = doc(firestore, INTERACTIONS_COLLECTION, interactionId);
            const videoRef = doc(firestore, VIDEOS_COLLECTION, videoId);

            const batch = writeBatch(firestore);

            batch.set(interactionRef, {
                userId: currentUser.uid,
                videoId,
                sharedAt: Timestamp.now(),
                lastInteractionAt: Timestamp.now()
            }, { merge: true });

            batch.update(videoRef, { shares: increment(1) });

            await batch.commit();
        } catch (error) {
            console.error('Error tracking share:', error);
        }
    },

    // Get user interactions for video
    async getUserInteractions(videoId: string): Promise<UserInteraction | null> {
        try {
            const auth = getAuth();
            const currentUser = auth.currentUser;

            if (!currentUser) return null;

            const interactionId = `${currentUser.uid}_${videoId}`;
            const interactionRef = doc(firestore, INTERACTIONS_COLLECTION, interactionId);
            const docSnap = await getDoc(interactionRef);

            if (!docSnap.exists()) return null;

            return docSnap.data() as UserInteraction;
        } catch (error) {
            console.error('Error fetching user interactions:', error);
            return null;
        }
    },

    // Delete video
    async deleteVideo(videoId: string): Promise<void> {
        try {
            const auth = getAuth();
            const currentUser = auth.currentUser;

            if (!currentUser) {
                throw new Error('User not authenticated');
            }

            const videoRef = doc(firestore, VIDEOS_COLLECTION, videoId);
            const videoDoc = await getDoc(videoRef);

            if (!videoDoc.exists()) {
                throw new Error('Video not found');
            }

            const video = videoDoc.data() as ShortVideo;

            // Check authorization
            if (video.uploadedBy !== currentUser.uid) {
                throw new Error('Unauthorized');
            }

            // Delete from storage
            try {
                const storageVideoRef = ref(storage, video.videoUrl);
                await deleteObject(storageVideoRef);
            } catch (e) {
                console.warn('Could not delete video file:', e);
            }

            try {
                const thumbnailRef = ref(storage, video.thumbnailUrl);
                await deleteObject(thumbnailRef);
            } catch (e) {
                console.warn('Could not delete thumbnail file:', e);
            }

            // Delete from Firestore
            await updateDoc(videoRef, { status: 'archived' });
        } catch (error) {
            console.error('Error deleting video:', error);
            throw error;
        }
    }
};

/**
 * Debug utility to check Firebase sync status
 */
export const debugFirebaseSync = async () => {
    try {
        console.log('=== Firebase Sync Debug ===');
        
        // Check auth
        const auth = getAuth();
        const user = auth.currentUser;
        console.log('Current User:', user ? { uid: user.uid, email: user.email } : 'Not authenticated');
        
        // Check categories
        const categories = await videoService.getCategories();
        console.log('Categories Count:', categories.length);
        console.log('Categories:', categories.map(c => c.name));
        
        // Check videos without filters
        const allVideos = await getDocs(collection(firestore, VIDEOS_COLLECTION));
        console.log('Total Videos in Firestore:', allVideos.size);
        console.log('Videos:', allVideos.docs.map(doc => ({
            id: doc.id,
            title: doc.data().title,
            status: doc.data().status,
            category: doc.data().category,
            uploadedAt: doc.data().uploadedAt?.toDate?.() || 'invalid'
        })));
        
        // Check storage
        try {
            const storageRef = ref(storage, VIDEO_STORAGE_PATH);
            const result = await listAll(storageRef);
            console.log('Files in Storage:', result.items.length + result.prefixes.length);
        } catch (e) {
            console.log('Storage access:', 'Error or empty');
        }
        
        console.log('=== End Debug ===');
    } catch (error) {
        console.error('Debug error:', error);
    }
};

