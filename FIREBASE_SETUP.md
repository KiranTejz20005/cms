# Firebase Project Setup Guide

Based on the FireCMS Doctor requirements, you need to enable the following services in your Firebase Console for project `lifemonk-68437`.

## 1. Enable Firebase Authentication
FireCMS and the application's content features require Firebase Auth.
1. Go to the [Firebase Console](https://console.firebase.google.com/).
2. Select your project: **lifemonk-68437**.
3. In the left sidebar, click on **Authentication**.
4. Click the **Get Started** button.
5. Enable the **Email/Password** provider (and **Google** if desired).
6. Save your changes.

## 2. Enable Cloud Storage
Cloud Storage is required for uploading videos and thumbnails.
1. In the Firebase Console sidebar, click on **Storage**.
2. Click the **Get Started** button.
3. Select **Start in production mode** (or test mode for immediate access).
4. Choose your location (e.g., `us-central1`).
5. Click **Done**.
6. **Important:** After enabling, go to the **Rules** tab in Storage and ensure they allow uploads. 
   For development, you can use:
   ```javascript
   rules_version = '2';
   service firebase.storage {
     match /b/{bucket}/o {
       match /{allPaths=**} {
         allow read, write: if true; // WARNING: Use proper auth rules for production
       }
     }
   }
   ```

## 3. Configure Firestore Rules
Ensure your Firestore rules allow the application to read/write content.
1. In the sidebar, click on **Firestore Database**.
2. Go to the **Rules** tab.
3. Ensure they are set up to allow access to the `byteSizedVideos` and `videoCategories` collections.

---

### Code Changes Implemented:
- **AuthContext updated:** Now initializes and monitors Firebase Auth state alongside Supabase.
- **Firebase Initialization:** Validated and ready to use `auth`, `firestore`, and `storage`.
- **Media Uploads:** Ready to process files via `Firebase Storage` once the bucket is enabled in the console.

Once you have enabled these in the console, the **FireCMS Doctor** should show all green checkmarks.
