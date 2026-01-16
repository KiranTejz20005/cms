# Life Monk CMS Portal 🚀

A modern, pixel-perfect Content Management System for managing educational content with real-time synchronization to Flutter mobile applications.

![Architecture](./cms_architecture_diagram.png)

## ✨ Features

### 🎯 Core Functionality
- **Categories Management** - Organize content into color-coded categories
- **Items Management** - Create and manage videos, articles, courses, podcasts, quizzes, and interactive content
- **Learning Paths** - Build structured learning journeys
- **Challenges** - Gamify learning with challenges and quests
- **User Management** - Manage users and roles
- **Analytics Dashboard** - Track engagement and performance
- **Real-time Sync** - Instant updates to mobile app

### 🎨 Design
- Pixel-perfect UI matching modern design standards
- Smooth animations with Framer Motion
- Responsive design (Desktop, Tablet, Mobile)
- Professional color scheme
- Intuitive navigation
- Accessible components

### 🔌 Integration
- Supabase backend integration
- Real-time database subscriptions
- Row Level Security (RLS)
- RESTful API endpoints
- Flutter mobile app ready

## 🚀 Quick Start

### Prerequisites
- Node.js 20+ 
- npm or yarn
- Supabase account

### Installation

1. **Clone the repository**
```bash
git clone <your-repo-url>
cd CMS
```

2. **Install dependencies**
```bash
npm install
```

3. **Configure environment**

Create a `.env` file in the root directory:
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

4. **Set up database**

Follow the [Database Setup Guide](./DATABASE_SETUP_GUIDE.md) to create tables and configure Supabase.

5. **Run development server**
```bash
npm run dev
```

6. **Open in browser**
```
http://localhost:5173
```

## 📱 Flutter Integration

To connect your Flutter mobile app, follow the comprehensive [Flutter Integration Guide](./FLUTTER_INTEGRATION_GUIDE.md).

### Quick Flutter Setup

```dart
// 1. Add dependency
dependencies:
  supabase_flutter: ^2.0.0

// 2. Initialize
await Supabase.initialize(
  url: 'YOUR_SUPABASE_URL',
  anonKey: 'YOUR_SUPABASE_ANON_KEY',
);

// 3. Fetch content
final content = await supabase
  .from('content')
  .select()
  .eq('status', 'Published');
```

## 📚 Documentation

- **[Implementation Summary](./IMPLEMENTATION_SUMMARY.md)** - Complete feature overview
- **[Database Setup Guide](./DATABASE_SETUP_GUIDE.md)** - Step-by-step database configuration
- **[Flutter Integration Guide](./FLUTTER_INTEGRATION_GUIDE.md)** - Mobile app integration
- **[Features Overview](./FEATURES_OVERVIEW.md)** - Detailed feature documentation
- **[Quick Reference](./QUICK_REFERENCE.md)** - Quick reference guide

## 🏗️ Architecture

```
┌─────────────────┐      ┌──────────────┐      ┌────────────────┐
│   CMS Portal    │─────▶│   Supabase   │◀─────│  Flutter App   │
│  (React/Vite)   │      │   Database   │      │    (Mobile)    │
└─────────────────┘      └──────────────┘      └────────────────┘
```

### Tech Stack

**Frontend (CMS Portal)**
- React 19
- Vite 7
- TypeScript
- Tailwind CSS
- Framer Motion
- Lucide Icons
- React Router DOM

**Backend**
- Supabase (PostgreSQL)
- Row Level Security
- Real-time subscriptions
- RESTful API

**Mobile App**
- Flutter
- Supabase Flutter SDK
- Riverpod (State Management)
- Cached Network Image

## 📖 Usage

### Creating Content

1. **Navigate to Items page**
2. Click **"Create Item"**
3. Fill in the form:
   - Title (required)
   - Description
   - Type (Video/Article/Course/etc.)
   - Category
   - Difficulty level
   - Duration
   - Thumbnail URL
   - Status (Draft/Published)
4. Click **"Create Item"**

### Managing Categories

1. **Navigate to Categories page**
2. Click **"Create Category"**
3. Enter:
   - Category name
   - Description
   - Choose a color
4. Click **"Create Category"**

### Building Learning Paths

1. **Navigate to Learning Paths page**
2. Click **"Create Learning Path"**
3. Add content items in sequence
4. Set difficulty and duration
5. Publish when ready

## 🎯 Content Workflow

```
1. Create content in CMS
   ↓
2. Save to Supabase
   ↓
3. Real-time sync triggers
   ↓
4. Flutter app receives update
   ↓
5. Content appears instantly
```

## 🔐 Security

- **Authentication**: Supabase Auth
- **Authorization**: Role-based access control (Admin, Instructor, User)
- **Data Protection**: Row Level Security (RLS)
- **API Security**: Secure API keys
- **Input Validation**: All inputs sanitized
- **HTTPS**: Secure connections only

## 🎨 Design System

### Colors
```css
Primary: #276EF1
Background: #F8FAFC
Surface: #FFFFFF
Text Primary: #0F172A
Text Secondary: #475569
```

### Typography
- **Sans**: Inter
- **Header**: Manrope
- **Mono**: JetBrains Mono

### Components
- Cards with hover effects
- Smooth animations
- Consistent spacing
- Professional shadows
- Responsive grids

## 📊 Database Schema

### Content Table
```sql
- id (UUID)
- title (TEXT)
- description (TEXT)
- type (TEXT)
- category (TEXT)
- thumbnail (TEXT)
- content_url (TEXT)
- duration (TEXT)
- difficulty (TEXT)
- status (TEXT)
- views (INTEGER)
- created_at (TIMESTAMPTZ)
- updated_at (TIMESTAMPTZ)
```

See [Database Setup Guide](./DATABASE_SETUP_GUIDE.md) for complete schema.

## 🚀 Deployment

### Build for Production
```bash
npm run build
```

### Deploy to Vercel
```bash
vercel deploy
```

### Deploy to Netlify
```bash
netlify deploy --prod
```

### Environment Variables
Set these in your hosting platform:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

## 🧪 Testing

```bash
# Run linter
npm run lint

# Type check
npm run type-check

# Build test
npm run build
```

## 📈 Performance

- **Lazy Loading**: Code splitting for optimal load times
- **Image Optimization**: Cached images with CDN
- **Database Indexing**: Optimized queries
- **Real-time Updates**: Efficient subscriptions
- **Responsive Design**: Mobile-first approach

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License.

## 🆘 Support

### Common Issues

**Content not appearing?**
- Check if status is "Published"
- Verify Supabase connection
- Check RLS policies

**Images not loading?**
- Verify image URLs are accessible
- Check CORS settings
- Use HTTPS URLs

**Real-time not working?**
- Enable Realtime in Supabase
- Check subscription setup
- Verify network connection

### Get Help
- Check [Documentation](#-documentation)
- Review [Troubleshooting Guide](./DATABASE_SETUP_GUIDE.md#troubleshooting)
- Open an issue on GitHub

## 🎉 Success Checklist

- [x] Pixel-perfect design implementation
- [x] All pages functional
- [x] Sidebar with correct icons
- [x] Categories page created
- [x] Items page created
- [x] Routes properly configured
- [x] Smooth animations
- [x] Responsive design
- [x] API integration ready
- [x] Flutter integration guide
- [x] Real-time sync capability
- [x] Production-ready code

## 🔮 Roadmap

### Phase 1 (Current)
- [x] Core CMS functionality
- [x] Categories management
- [x] Items management
- [x] Basic analytics
- [x] Flutter integration guide

### Phase 2 (Planned)
- [ ] File upload to Supabase Storage
- [ ] Rich text editor
- [ ] Content versioning
- [ ] Advanced analytics
- [ ] Bulk operations

### Phase 3 (Future)
- [ ] AI-powered content recommendations
- [ ] Multi-language support
- [ ] Advanced user roles
- [ ] Content scheduling
- [ ] A/B testing

## 👥 Team

Built with ❤️ by the Life Monk team

## 🙏 Acknowledgments

- React Team for React 19
- Supabase for amazing backend
- Tailwind CSS for styling
- Framer Motion for animations
- Lucide for beautiful icons

---

**Ready to manage your content?** 🚀

Start by following the [Quick Start](#-quick-start) guide above!

For detailed implementation information, see [IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md)
