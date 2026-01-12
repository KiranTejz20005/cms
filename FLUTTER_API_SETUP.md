# Flutter Application Integration Guide

This guide details how to connect your Flutter application to the CMS Backend (Strapi), Database (Supabase), and Asset Manager (Cloudinary).

## 1. Architecture Overview
*   **CMS Endpoint**: `http://localhost:1337/api` (Strapi) - Used for fetching Content, Reels, and Metadata.
*   **Database**: Supabase (Postgres) - Handles Authentication & User Data.
*   **Media Storage**: Cloudinary - Stores Images/Videos uploaded via the CMS.
*   **Client**: Flutter Application.

---

## 2. Environment Setup (Backend)

Before running the Flutter app, ensure the backend `.env` (`backend/.env`) has the following keys to enable Cloudinary:

```env
# Cloudinary Configuration
CLOUDINARY_NAME=your_cloud_name
CLOUDINARY_KEY=your_api_key
CLOUDINARY_SECRET=your_api_secret

# Database (Supabase Connection for Strapi)
# If Strapi is connected to Supabase DB:
DATABASE_CLIENT=postgres
DATABASE_HOST=db.supabase.co
DATABASE_PORT=5432
DATABASE_NAME=postgres
DATABASE_USERNAME=postgres
DATABASE_PASSWORD=your_db_password
DATABASE_SSL=true
```

> **Note**: If `DATABASE_CLIENT` is left as `sqlite` (default), Strapi will store content locally. For a production app, update the connection to Supabase.

---

## 3. API Endpoints

### Base URL
*   **Development**: `http://10.0.2.2:1337/api` (Android Emulator) or `http://YOUR_LOCAL_IP:1337/api` (Physical Device).
*   **Production**: `https://your-cms.herokuapp.com/api`

### A. Fetch Content Library (Courses, Articles)
**Endpoint**: `GET /contents`
**Query Parameters**:
*   `populate=*`: Fetch images/media.
*   `filters[type][$eq]=Course`: Filter by type.

**Example Request (Dart/Http)**:
```dart
final response = await http.get(
  Uri.parse('$baseUrl/contents?populate=*&filters[type][$ne]=Video')
);
```

**JSON Response Structure**:
```json
{
  "data": [
    {
      "id": 1,
      "attributes": {
        "title": "Solar System",
        "type": "Course",
        "category": "Science",
        "grade": "Grade 5",
        "author": "Dr. Space",
        "modules": 8,
        "media": {
          "data": {
            "attributes": {
              "url": "https://res.cloudinary.com/..."
            }
          }
        }
      }
    }
  ]
}
```

### B. Fetch Reels (Short Videos)
**Endpoint**: `GET /contents`
**Query Parameters**:
*   `filters[type][$eq]=Video`: Only fetch videos.
*   `sort=createdAt:desc`: Newest first.

**Example Request**:
```dart
final response = await http.get(
  Uri.parse('$baseUrl/contents?populate=*&filters[type][$eq]=Video&sort=createdAt:desc')
);
```

### C. Filtering by Grade & Subject
Combine filters to build the "Learning Path":
`GET /contents?filters[grade][$eq]=Grade 5&filters[category][$eq]=Math`

---

## 4. Authentication (Supabase) in Flutter

Use the `supabase_flutter` package.

1.  **Initialize**:
    ```dart
    await Supabase.initialize(
      url: 'YOUR_SUPABASE_URL',
      anonKey: 'YOUR_SUPABASE_ANON_KEY',
    );
    ```

2.  **Sign In**:
    ```dart
    final AuthResponse res = await Supabase.instance.client.auth.signInWithPassword(
      email: 'user@example.com',
      password: 'password',
    );
    ```

3.  **Authenticated Requests to CMS**:
    If you secure your Strapi endpoints, pass the JWT:
    ```dart
    final response = await http.get(
      Uri.parse(...),
      headers: {
        'Authorization': 'Bearer ${strapi_api_token}', // Or User Token
      }
    );
    ```

---

## 5. Media Handling (Cloudinary)

*   **Uploads**: When you upload a file in the Strapi Admin Panel, it is automatically sent to **Cloudinary**.
*   **Consumption**: The API response `data.attributes.media.data.attributes.url` will directly return the **Cloudinary URL** (e.g., `https://res.cloudinary.com/...`).
*   **Flutter**: Use `CachedNetworkImage` to display these URLs efficiently.

```dart
CachedNetworkImage(
  imageUrl: item['attributes']['media']['data']['attributes']['url'],
  placeholder: (context, url) => CircularProgressIndicator(),
  errorWidget: (context, url, error) => Icon(Icons.error),
);
```

## 6. Troubleshooting

1.  **Connection Refused (SocketException)**:
    *   Ensure your Flutter app uses the correct IP (10.0.2.2 for Android Emulator, Local LAN IP for devices).
    *   Ensure Strapi is running (`npm run develop`).

2.  **403 Forbidden**:
    *   Check Strapi Admin > Settings > Roles > Public.
    *   Ensure `find` and `findOne` are CHECKED for `Content`.

3.  **Missing Media**:
    *   Ensure `?populate=*` is added to your API query string.
