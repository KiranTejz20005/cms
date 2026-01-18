# System Prompt: Byte-Sized Learning Admin Feature (Copilot)

## Context
You are working on an education-focused CMS with a specialized admin module for byte-sized (short-form) learning content. The platform supports TikTok/Shorts-style consumption patterns and is built on:
- **Frontend**: React + TypeScript + Vite + Tailwind CSS
- **Backend**: Strapi (Node.js, headless CMS)
- **Storage**: Firebase Cloud Storage (configured)
- **Databases**: Supabase + Strapi SQLite/PostgreSQL
- **Auth**: Firebase Auth + Supabase Auth + Strapi Users

## Feature Specification: Byte-Sized Learning Admin

### Core Principles
1. **Categories are fully dynamic** - No hardcoded enum values, ID-referenced, not name-referenced
2. **Content is multi-format** - Short videos, YouTube Shorts imports, image-based lessons
3. **Admin-first UX** - Single unified page, inline category creation, no page reloads for common actions
4. **Mobile-optimized** - All content served in vertical aspect ratio (9:16)
5. **Safe operations** - All destructive actions require confirmation, content survives category changes
6. **Production-ready** - Designed to scale, fully maintainable, zero demo data

### Functional Requirements

#### 1. Category Management (Dynamic)
- **Create**: Admins create categories via modal or inline form
- **Fields**: `id` (uuid), `name` (string), `description` (optional), `icon` (optional image), `status` (active/inactive), `order` (number)
- **Behavior**: 
  - Categories instantly available for content assignment
  - Editing category does NOT affect published content
  - Deleting category requires reassigning all content first
  - Disabled categories remain functional for existing content (read-only)
  - Categories sortable by order/priority

#### 2. Byte-Sized Content Types
Each content item has:
- `id` (uuid)
- `title` (string, required)
- `description` (optional text)
- `category` (foreign key to categories, required, single category only)
- `contentType` (enum: 'video' | 'youtube-short' | 'image-lesson')
- `status` (enum: 'draft' | 'published')
- `visibility` (enum: 'public' | 'private') - for future use
- `thumbnail` (image, required)
- `order` (number, for sorting within category)
- `createdAt`, `updatedAt`, `publishedAt` (timestamps)

**Content Type Specifics:**
- **Video Upload**: Local file upload → Firebase Storage → secure URL stored in `videoUrl`
- **YouTube Short**: YT URL validated → metadata extracted → `youtubeShortId` stored (no re-hosting)
- **Image Lesson**: Image upload → Firebase Storage → `imageUrl` stored

#### 3. Video Upload Rules
- Accept: `.mp4, .webm, .mov` (MIME type validation)
- Aspect ratio: 9:16 (vertical)
- Max duration: 60 seconds
- Max file size: 100MB
- Validation: Client-side + server-side
- Storage: Firebase Storage with public read URL
- Preview: Generated automatically on upload

#### 4. YouTube Shorts Import Rules
- Accept: `youtube.com/shorts/{id}` or `youtu.be/{id}?v=...` (both formats)
- Validation: Check URL format, optionally ping API to verify availability
- Extract: Video ID, title (from metadata if available)
- Store: Only video ID + URL reference (no re-hosting)
- Fallback: If YT video becomes unavailable, show error message in feed

#### 5. Image Upload Rules
- Accept: `.jpg, .png, .webp` (MIME type validation)
- Max file size: 10MB per image
- Auto-optimize: Compress to 2048px width, WEBP if possible
- Storage: Firebase Storage with public URL
- Usage: Can be thumbnail OR primary content (image lesson)

#### 6. Admin UI Layout
**Single Page Structure: `/admin/byte-sized-learning`**

```
┌─────────────────────────────────────────┐
│ Header: "Byte-Sized Learning Admin"     │
│                    [+ New Content] Btn   │
├─────────────────────────────────────────┤
│ CATEGORIES (Left Panel)                  │ CONTENT LIST (Right Panel)
│ ┌──────────────────────────┐            │ ┌──────────────────────┐
│ │ [+ New Category]         │            │ │ Draft | Published    │
│ │ • Category 1 (5 items)   │            │ │ ┌──────────────────┐ │
│ │ • Category 2 (3 items)   │ ← Select   │ │ │[Thumbnail]Title  │ │
│ │ • Category 3 (0 items)   │  category  │ │ │Draft • Re-order  │ │
│ │ • ...                    │            │ │ │[Edit] [Delete]   │ │
│ │                          │            │ │ └──────────────────┘ │
│ └──────────────────────────┘            │ │ (List scrollable)    │
│ [Edit] [Disable] [Delete]   (on select) │ └──────────────────────┘
└─────────────────────────────────────────┘
```

**Key UX Features:**
- Categories & content lists independent
- No page reloads for CRUD operations
- Inline editing where possible (category name, description)
- Modal dialogs for destructive actions (delete, reassign)
- Real-time feedback (toasts/notifications)
- Optimistic updates (assume success, revert on error)
- Keyboard shortcuts for power users (optional: Cmd+N for new content)

#### 7. Admin Workflows

**Create Content:**
1. Click `[+ New Content]`
2. Modal appears: Select content type (tabs: Video | YouTube Short | Image Lesson)
3. Upload/input content (file, URL, image)
4. Auto-validate in real-time
5. Select/create category (with inline category creation)
6. Fill title + optional description
7. Upload thumbnail
8. Save as draft (default) or publish immediately
9. Confirmation: "Content created" with action to edit/view

**Publish Content:**
1. Select content from list (click to expand)
2. Change status from Draft → Published
3. Content becomes visible in app feed
4. Timestamp updated, user notified

**Manage Categories:**
1. Click category in left panel
2. Inline edit: name, description, icon (on hover)
3. Right-click or menu: Edit | Disable | Reorder | Delete
4. On delete: Show count of content → force reassignment before delete
5. Disabled categories show in gray, can't select for new content

**Handle Content Orphaning (Category Deleted):**
1. Show modal: "3 content items use this category. Reassign before deleting."
2. Allow bulk reassignment to new category
3. Only delete after reassignment confirmed

#### 8. Data Integrity & Safety

**Validation Rules:**
- Category name: 2-100 chars, unique per workspace
- Content title: 1-200 chars
- Video URL: Valid MP4/WebM/MOV with MIME type check
- YouTube URL: Must match shorts pattern, validate via regex
- Image file: Valid JPG/PNG/WebP, checked at upload
- All fields server-validated on save

**Soft Deletes (Recommended):**
- Categories: Mark as `deleted = true` instead of hard-delete
- Content: Mark as `deleted = true` instead of hard-delete
- Allows recovery + prevents foreign key issues

**Concurrent Admin Safety:**
- If another admin publishes content while editing, show notification
- Lock-free editing: Last-write-wins with conflict warning
- Timestamps prevent accidental overwrites

#### 9. API Contract (Backend)

**Categories Endpoints:**
```
GET    /api/byte-sized-categories              → List all (active + inactive)
POST   /api/byte-sized-categories              → Create new
PUT    /api/byte-sized-categories/{id}         → Update (name, desc, status, order)
DELETE /api/byte-sized-categories/{id}         → Soft delete (must reassign content first)

GET    /api/byte-sized-categories/{id}/stats   → Get count of content in category
```

**Content Endpoints:**
```
GET    /api/byte-sized-content                 → List by category (paginated)
POST   /api/byte-sized-content                 → Create new
PUT    /api/byte-sized-content/{id}            → Update (title, desc, status, order, category)
DELETE /api/byte-sized-content/{id}            → Soft delete
PATCH  /api/byte-sized-content/{id}/publish    → Toggle publish status

POST   /api/byte-sized-content/validate-youtube → Validate YT URL + extract metadata
POST   /api/upload/video                       → Upload video file (returns Firebase URL)
POST   /api/upload/image                       → Upload image file (returns Firebase URL)
```

**Response Format:**
```json
{
  "success": true,
  "data": { /* resource */ },
  "error": null,
  "meta": { "timestamp": "2026-01-17T...", "userId": "..." }
}
```

#### 10. Edge Cases Handled

1. **Category Deleted While Viewing**: Refresh content list, show notification
2. **YouTube Video Becomes Private/Removed**: Show error in feed, admin can delete
3. **Upload Interrupted**: Cancel logic, cleanup Firebase temporary files
4. **Duplicate Category Names**: Prevent at DB level (unique constraint)
5. **Category Changed After Publish**: Content remains in old category ID (safe)
6. **Landscape Video Uploaded Accidentally**: Show validation error, ask for re-upload
7. **Admin Creates Category During Upload**: Category immediately available in dropdown
8. **Multiple Admins Editing Same Content**: Last save wins with timestamp warning
9. **Category Disabled → Content Still Exists**: Marked as read-only in feed, safe
10. **Bulk Reassign 1000+ Content Items**: Batch operation, show progress bar

#### 11. Performance Targets

- Category list load: < 500ms
- Content list (paginated, 20 items): < 1s
- Category create: < 500ms
- Content create (with upload): < 5s (depends on file size)
- Content publish toggle: < 300ms
- No full-page reloads after initial load
- Lazy-load images in content list
- Debounce category search/filter to 300ms

#### 12. Feature Replacement

**Existing Module to Replace:**
- Current byte-sized module at `/src/pages/ByteSizedLearning.tsx`
- Existing video service at `/src/lib/videoService.ts`
- All hardcoded categories/data must be removed

**New Home:**
- Admin page: `/src/pages/admin/ByteSizedLearning.tsx` (or `/admin/byte-sized-learning` route)
- UI components: `/src/components/admin/ByteSizedLearning/` directory
- Services: `/src/lib/byteSizedLearning.ts` (with real API calls to Strapi)
- Backend: `/backend/src/api/byte-sized-*` (new content types)

---

## Technical Implementation Details

### Backend Architecture (Strapi)

**1. Create Two New Content Types:**

**a) `ByteSizedCategory` (Single Type or Collection)**
```
Fields:
- id (UUID, auto)
- name (String, required, unique)
- description (Text, optional)
- icon (Media, optional)
- status (Enumeration: active/inactive, default: active)
- order (Integer, default: 0)
- metadata (JSON, optional, for future expansion)
- deleted (Boolean, default: false, soft-delete)
- createdBy (Relation to User)
- publishedAt (DateTime, managed by Strapi)
- publishedBy (Relation to User)
```

**b) `ByteSizedContent` (Collection Type)**
```
Fields:
- id (UUID, auto)
- title (String, required, max 200)
- description (Text, optional)
- category (Relation to ByteSizedCategory, required, single)
- contentType (Enumeration: video/youtube-short/image-lesson, required)
- status (Enumeration: draft/published, default: draft)
- visibility (Enumeration: public/private, default: public)
- thumbnail (Media, required)
- order (Integer, default: 0)

--- ContentType-Specific Fields ---
- videoUrl (String, conditional: if contentType === 'video')
- videoMetadata (JSON: { duration, width, height, size }, conditional)
- youtubeShortId (String, conditional: if contentType === 'youtube-short')
- youtubeShortUrl (String, conditional)
- imageUrl (String, conditional: if contentType === 'image-lesson')

--- Audit Fields ---
- deleted (Boolean, default: false, soft-delete)
- createdBy (Relation to User)
- publishedBy (Relation to User)
- publishedAt (DateTime)
```

**2. Create Services Layer**
```typescript
// backend/src/api/byte-sized-category/services/byte-sized-category.ts
// backend/src/api/byte-sized-content/services/byte-sized-content.ts
// Custom business logic: validation, soft-delete, reassignment, etc.
```

**3. Create Controllers**
```typescript
// backend/src/api/byte-sized-category/controllers/byte-sized-category.ts
// backend/src/api/byte-sized-content/controllers/byte-sized-content.ts
// Request validation, auth checks, response formatting
```

**4. Create Routes**
```typescript
// Route protection: Admin-only routes for create/update/delete
// Public routes: find (for feed consumption)
```

**5. Validation Middleware**
```typescript
// Validate YouTube URLs (regex)
// Validate video aspect ratio (on upload completion)
// Validate image dimensions/size
// Validate title/description length
```

### Frontend Architecture (React)

**1. State Management**
```typescript
// Hook: useBytesSizedLearningAdmin()
// - categories: ByteSizedCategory[]
// - content: ByteSizedContent[]
// - selectedCategoryId: string
// - filters: { status: 'draft' | 'published' | 'all' }
// - loading, error states
// - CRUD operations: create, update, delete, publish
```

**2. Component Structure**
```
/src/components/admin/ByteSizedLearning/
├── AdminPage.tsx                    (Main page layout)
├── CategoryPanel.tsx                (Left sidebar, category list)
│   ├── CategoryItem.tsx             (Individual category row)
│   ├── CategoryForm.tsx             (Create/edit modal)
│   └── CategoryDeleteModal.tsx      (Confirm delete + reassign)
├── ContentPanel.tsx                 (Right sidebar, content list)
│   ├── ContentItem.tsx              (Expandable content card)
│   ├── ContentForm.tsx              (Multi-step create/edit)
│   │   ├── TypeSelector.tsx         (Video | YouTube | Image tabs)
│   │   ├── VideoUploadStep.tsx      (File upload, validation)
│   │   ├── YouTubeStep.tsx          (URL input, validation)
│   │   ├── ImageUploadStep.tsx      (Image file upload)
│   │   ├── MetadataStep.tsx         (Title, description, category)
│   │   └── ReviewStep.tsx           (Final confirmation)
│   └── ContentPublishToggle.tsx     (Draft ↔ Published button)
├── BulkReassignModal.tsx            (Category delete → reassign content)
├── ValidationFeedback.tsx           (Real-time validation messages)
└── UploadProgress.tsx               (File upload progress bar)
```

**3. API Service Layer**
```typescript
// /src/lib/byteSizedLearning.ts
export const byteSizedLearningApi = {
  // Categories
  getCategories: () => GET /api/byte-sized-categories,
  createCategory: (data) => POST /api/byte-sized-categories,
  updateCategory: (id, data) => PUT /api/byte-sized-categories/{id},
  deleteCategory: (id) => DELETE /api/byte-sized-categories/{id},
  reassignContent: (oldCategoryId, newCategoryId) => PATCH /api/byte-sized-categories/{id}/reassign,

  // Content
  getContent: (categoryId, filters) => GET /api/byte-sized-content?category={id}&status={status},
  createContent: (data) => POST /api/byte-sized-content,
  updateContent: (id, data) => PUT /api/byte-sized-content/{id},
  deleteContent: (id) => DELETE /api/byte-sized-content/{id},
  publishContent: (id) => PATCH /api/byte-sized-content/{id}/publish,

  // Validation & Upload
  validateYouTubeUrl: (url) => POST /api/byte-sized-content/validate-youtube,
  uploadVideo: (file) => POST /api/upload/video (multipart/form-data),
  uploadImage: (file) => POST /api/upload/image (multipart/form-data),
}
```

**4. Firebase Integration**
```typescript
// Leverage existing Firebase config
// Use Firebase Storage for persistent video/image hosting
// Strapi stores only references (URLs + metadata)
// No re-hosting of videos (YouTube only stores ID)
```

### Database Schema (Strapi-Managed)

**Migrations:**
- Create `byte_sized_categories` table
- Create `byte_sized_contents` table
- Add foreign key constraints
- Add indexes: `category_id`, `status`, `deleted`
- Add unique constraint: `categories(name)` (per workspace if multi-tenant)

---

## Development Workflow

### Phase 1: Backend Schema & API
1. Create Strapi content types (categories, content)
2. Implement CRUD endpoints
3. Add validation middleware
4. Test endpoints with Postman/curl

### Phase 2: Upload Infrastructure
1. Set up Firebase Storage integration
2. Create upload endpoints (video, image)
3. Add file validation (MIME, size, aspect ratio)
4. Test uploads with sample files

### Phase 3: YouTube Integration
1. Implement YouTube URL validation
2. Extract video ID + metadata
3. Handle error cases (private, removed videos)
4. Test with real YouTube Shorts URLs

### Phase 4: Admin UI
1. Create category management panel
2. Create content creation form (multi-step)
3. Implement category creation inline
4. Add publish/draft toggle
5. Add delete + bulk reassign flows

### Phase 5: Integration & Polish
1. Connect frontend to backend APIs
2. Add real-time validation feedback
3. Optimize performance (lazy loading, pagination)
4. Error handling & user notifications
5. Keyboard shortcuts + accessibility

### Phase 6: Testing & Deployment
1. Unit tests for validation logic
2. Integration tests for API flows
3. E2E tests for admin workflows
4. Security audit (auth, input validation, CORS)
5. Deploy to staging + production

---

## Success Criteria (Definition of Done)

- ✅ Admin can create, edit, disable, delete categories without code changes
- ✅ Categories appear instantly in content form dropdown
- ✅ Admin can upload short videos (validation enforced)
- ✅ Admin can paste YouTube Shorts links (auto-validated)
- ✅ Admin can upload thumbnail images
- ✅ Admin can create content, set status (draft/published)
- ✅ Published content appears in app feed (in shorts-style view)
- ✅ Categories drive content organization (no hardcoding)
- ✅ No page reloads for common operations
- ✅ Destructive actions (delete) are safe + reversible
- ✅ All content remains accessible if category is disabled
- ✅ Feature fully replaces existing byte-sized module
- ✅ Performance: Category load < 500ms, Content list < 1s
- ✅ Production-ready: No demo data, fully maintainable, scales

---

## Key Constraints

1. **No hardcoded categories anywhere** - Use UUID references, never string names
2. **Preserve data integrity** - Soft deletes, foreign key safety, atomic operations
3. **Mobile-first** - All content 9:16 aspect ratio, responsive admin UI
4. **Minimal UI** - Distraction-free, single page, fast interactions
5. **Scalable** - Designed for 1000+ content items, 100+ admins, low latency
6. **Existing module replacement** - Fully replace old byte-sized learning
7. **Zero developer intervention** - Category changes require no code, no redeploy

---

## Testing & Validation Checklist

- [ ] Category CRUD works without errors
- [ ] Video upload validates aspect ratio
- [ ] YouTube URL validation works for both URL formats
- [ ] Image upload compresses/optimizes properly
- [ ] Content reassignment on category delete is atomic
- [ ] Disabled categories don't allow new content assignment
- [ ] Published content appears in app feed immediately
- [ ] Draft content hidden from users (not in feed)
- [ ] Permissions: Only admins can access `/admin/byte-sized-learning`
- [ ] No SQL injections, XSS, or CSRF vulnerabilities
- [ ] Performance: Load 1000 categories in < 2s
- [ ] Performance: Upload 50MB video in < 10s
- [ ] Mobile UI responsive on iPhone 12 mini (375px)
- [ ] Error messages clear + actionable
- [ ] Undo/recovery for accidental deletions (via soft-delete)

---

This system prompt is self-contained and can be used to generate implementation with AI code generation tools. It covers design, implementation, testing, and success criteria comprehensively.
