# Our Voices Page Implementation

## Overview

The Our Voices page is a comprehensive content management system for user-generated stories, videos, audio, and media submissions. It features an Instagram-style mosaic layout with scroll-based animations inspired by the Purpose Talent website.

## Features

### Frontend Components

#### 1. Hero Section (`src/components/our-voices/HeroSection.tsx`)
- Instagram-style mosaic grid layout
- Media thumbnails with hover effects
- Floating animations for visual appeal
- Call-to-action with smooth scroll navigation

#### 2. Video Resources Section (`src/components/our-voices/VideoResourcesSection.tsx`)
- Grid layout of video cards
- Modal video player with full controls
- Video metadata display (duration, views, author)
- Tag-based categorization

#### 3. Audio & Podcasts Section (`src/components/our-voices/AudioPodcastsSection.tsx`)
- Audio player with custom controls
- Progress bar with seek functionality
- Episode information and metadata
- Download and share functionality

#### 4. Your Stories Section (`src/components/our-voices/YourStoriesSection.tsx`)
- Published stories feed
- Media preview thumbnails
- Engagement metrics (likes, comments, shares)
- Story detail modal with full content

#### 5. Tell Your Story Section (`src/components/our-voices/TellYourStorySection.tsx`)
- Comprehensive submission form
- File upload with drag-and-drop
- Multiple media type support (image, video, audio, PDF)
- Anonymous submission option
- Form validation with Zod
- Consent and terms acceptance

#### 6. Scroll Animations (`src/components/our-voices/ScrollAnimations.tsx`)
- ScrollReveal: Elements animate in as they enter viewport
- ParallaxScroll: Background elements move at different speeds
- StaggeredGrid: Grid items animate in sequence
- FadeInSlide: Smooth fade and slide transitions
- FloatingElement: Continuous floating animation
- ScrollProgress: Progress bar showing scroll position

### Backend Models

#### 1. Story Model (`src/models/Story.ts`)
```typescript
interface Story {
  title: string;
  content: string;
  submitterName?: string;
  submitterEmail?: string;
  anonymous: boolean;
  tags: string[];
  files: MediaFile[];
  status: 'pending' | 'in_review' | 'approved' | 'published' | 'rejected';
  featured: boolean;
  viewCount: number;
  likeCount: number;
  shareCount: number;
  // ... more fields
}
```

#### 2. Media Model (`src/models/Media.ts`)
```typescript
interface Media {
  filename: string;
  originalName: string;
  mimeType: string;
  fileSize: number;
  url: string;
  thumbnailUrl?: string;
  mediaType: 'image' | 'video' | 'audio' | 'pdf';
  duration?: number;
  dimensions?: { width: number; height: number };
  // ... more fields
}
```

#### 3. PublicationReference Model (`src/models/PublicationReference.ts`)
```typescript
interface PublicationReference {
  title: string;
  sourceType: 'story' | 'video' | 'audio' | 'image';
  sourceId: ObjectId;
  publicationType: 'article' | 'blog' | 'report' | 'toolkit' | 'guide';
  relationshipType: 'inspired_by' | 'references' | 'supports' | 'contradicts' | 'extends' | 'examples';
  // ... more fields
}
```

### API Routes

#### 1. Stories API (`src/app/api/stories/`)
- `GET /api/stories` - Get published stories with pagination and filtering
- `POST /api/stories` - Create new story submission
- `GET /api/stories/[id]` - Get specific story by ID
- `PUT /api/stories/[id]` - Update story (admin only)
- `DELETE /api/stories/[id]` - Delete story (admin only)
- `POST /api/stories/[id]/like` - Like/unlike a story

#### 2. Uploads API (`src/app/api/uploads/`)
- `POST /api/uploads/request` - Request signed upload URLs for file uploads

#### 3. Admin API (`src/app/api/admin/stories/`)
- `GET /api/admin/stories` - Get all stories for admin review
- `PATCH /api/admin/stories` - Bulk update stories

### Admin Portal

#### Our Voices Management (`src/app/admin/our-voices/page.tsx`)
- Story management dashboard
- Status filtering and search
- Bulk actions (approve, publish, reject)
- Statistics overview
- Pagination and sorting

## Installation & Setup

### 1. Install Dependencies
```bash
npm install framer-motion react-hook-form @hookform/resolvers zod
```

### 2. Environment Variables
Add to your `.env.local`:
```env
MONGODB_URI=your_mongodb_connection_string
NEXT_PUBLIC_RECAPTCHA_SITE_KEY=your_recaptcha_site_key
RECAPTCHA_SECRET_KEY=your_recaptcha_secret_key
```

### 3. Database Setup
The models will be automatically created when first accessed. Ensure MongoDB is running and accessible.

### 4. File Storage
Configure your preferred file storage solution (AWS S3, Cloudinary, etc.) and update the upload URLs in the API routes.

## Usage

### 1. Access the Page
Navigate to `/our-voices` to view the main page.

### 2. Submit a Story
1. Scroll to the "Tell Your Story" section
2. Fill out the form with your story details
3. Upload media files (optional)
4. Choose anonymous or named submission
5. Accept terms and submit

### 3. Admin Management
1. Navigate to `/admin/our-voices`
2. Review pending submissions
3. Approve, publish, or reject stories
4. Manage featured content

## Customization

### 1. Brand Colors
Update the color scheme in `tailwind.config.js`:
```javascript
colors: {
  'brand-yellow': '#FFD935',
  'brand-teal': '#042C45',
  'brand-orange': '#FF7D05',
  'brand-brown': '#66623C',
}
```

### 2. Animation Settings
Modify animation parameters in `ScrollAnimations.tsx`:
```typescript
// Adjust animation intensity
<FloatingElement intensity={5} speed={3}>
  {/* content */}
</FloatingElement>

// Change scroll reveal direction
<ScrollReveal direction="left" delay={0.2}>
  {/* content */}
</ScrollReveal>
```

### 3. File Upload Limits
Update file size limits in `TellYourStorySection.tsx`:
```typescript
const getMaxFileSize = (type: string): number => {
  switch (type) {
    case 'image': return 5 * 1024 * 1024; // 5MB
    case 'video': return 200 * 1024 * 1024; // 200MB
    // ... adjust as needed
  }
};
```

## Security Features

1. **Form Validation**: Client and server-side validation using Zod
2. **File Type Validation**: Whitelist of allowed MIME types
3. **File Size Limits**: Configurable limits per media type
4. **Rate Limiting**: Prevent spam submissions
5. **reCAPTCHA Integration**: Bot protection
6. **Content Moderation**: Admin review workflow
7. **Anonymous Submissions**: Privacy protection

## Performance Optimizations

1. **Lazy Loading**: Images and media load as needed
2. **Pagination**: Large datasets are paginated
3. **Image Optimization**: Next.js Image component for automatic optimization
4. **Scroll Animations**: Efficient Framer Motion animations
5. **Database Indexing**: Optimized queries with proper indexes

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Mobile Responsiveness

The page is fully responsive with:
- Mobile-first design approach
- Touch-friendly interactions
- Optimized layouts for all screen sizes
- Swipe gestures for mobile navigation

## Future Enhancements

1. **Real-time Notifications**: WebSocket integration for live updates
2. **Advanced Search**: Full-text search with filters
3. **Social Features**: Comments, reactions, and sharing
4. **Content Recommendations**: AI-powered content suggestions
5. **Analytics Dashboard**: Detailed usage statistics
6. **Multi-language Support**: Internationalization
7. **Content Scheduling**: Publish content at specific times
8. **Email Notifications**: Automated email alerts

## Troubleshooting

### Common Issues

1. **File Upload Fails**: Check file size limits and MIME type validation
2. **Animations Not Working**: Ensure Framer Motion is properly installed
3. **Database Connection**: Verify MongoDB connection string
4. **Admin Access**: Check authentication and role permissions

### Debug Mode

Enable debug logging by setting:
```env
DEBUG=our-voices:*
```

## Contributing

1. Follow the existing code style and patterns
2. Add proper TypeScript types
3. Include error handling
4. Write descriptive commit messages
5. Test on multiple browsers and devices

## License

This implementation is part of the Equality Vanguard project and follows the same licensing terms.
