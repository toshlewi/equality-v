# Events & News Page - Equality Vanguard

## Overview
The Events & News page is a comprehensive frontend implementation that showcases upcoming events, past events, and news articles for Equality Vanguard. The page is built with Next.js 14, Tailwind CSS, Framer Motion, and GSAP ScrollTrigger for smooth animations and interactions.

## Features

### 🎯 Core Functionality
- **Event Calendar**: Masonry grid layout displaying upcoming events
- **Event Filtering**: Filter by category (Workshops, Talks, Exhibitions, Virtual Events)
- **Search Functionality**: Search events by title and description
- **Event Registration**: Modal with multi-step registration form
- **Payment Integration**: Stripe and M-Pesa payment placeholders
- **Past Events**: Horizontal scrolling carousel with recap galleries/videos
- **News Grid**: Latest news and updates with category filtering
- **Responsive Design**: Mobile-first approach with breakpoints

### 🎨 Design & Animations
- **Brand Colors**: Navy (#042C45), Yellow (#FFD935), Orange (#FF7D05), Olive (#66623C)
- **Typography**: Fredoka for headings, League Spartan for body text
- **Animations**: Framer Motion for component animations, GSAP for scroll effects
- **Hover Effects**: Card lift, image zoom, button interactions
- **Scroll Animations**: Calendar fade effect, parallax hero, staggered reveals

## File Structure

```
src/
├── app/
│   ├── events-news/
│   │   └── page.tsx                 # Main Events/News page
│   └── api/
│       ├── events/
│       │   ├── route.ts            # Events API endpoint
│       │   └── register/
│       │       └── route.ts        # Event registration API
│       └── news/
│           └── route.ts            # News API endpoint
└── components/
    └── events-news/
        ├── LocalHeader.tsx         # Fixed header with logo & nav
        ├── Hero.tsx               # Animated hero section
        ├── EventCard.tsx          # Event card component
        ├── EventModal.tsx         # Event details & registration modal
        ├── PastEventsCarousel.tsx # Past events horizontal scroll
        ├── NewsGrid.tsx           # News articles grid
        └── LocalFooter.tsx        # Footer with social links
```

## Components

### LocalHeader
- Fixed header that becomes opaque on scroll
- Logo linking to homepage
- Navigation menu (Upcoming Events, News, Our Voices, MatriArchive, Get Involved)
- Mobile-responsive design

### Hero
- Full-screen hero section with parallax background
- Animated title and subtitle
- Scroll indicator with animation
- Decorative elements

### EventCard
- Event image with hover zoom effect
- Event details (date, time, location, instructor)
- Category and featured badges
- Price display and "Book Now" button
- Hover animations and transitions

### EventModal
- Multi-step registration process:
  1. Event details view
  2. Registration form (name, email, phone, tickets)
  3. Payment method selection (Stripe/M-Pesa)
  4. Confirmation screen
- Form validation and error handling
- Payment integration placeholders

### PastEventsCarousel
- Horizontal scrolling carousel
- Past event cards with recap options
- Gallery/video recap modals
- Scroll indicators

### NewsGrid
- Responsive grid layout
- News article cards with hover effects
- Category filtering and badges
- "Read More" functionality

### LocalFooter
- Logo and organization description
- Quick links and social media
- Newsletter signup
- Legal links (Terms, Privacy, Data Protection)

## API Integration

### Events API (`/api/events`)
- **GET**: Fetch all published events
- **POST**: Create new event (admin)
- **TODO**: Connect to MongoDB events collection

### Event Registration API (`/api/events/register`)
- **POST**: Process event registration
- **TODO**: Payment processing (Stripe/M-Pesa)
- **TODO**: Email confirmations
- **TODO**: Mailchimp integration

### News API (`/api/news`)
- **GET**: Fetch news articles with filtering
- **POST**: Create news article (admin)
- **TODO**: Connect to MongoDB news collection

## Backend Integration Points

### MongoDB Collections
```javascript
// Events Collection
{
  _id: ObjectId,
  title: String,
  description: String,
  date: Date,
  time: String,
  location: String,
  price: Number | null,
  image: String,
  category: String,
  instructor: String,
  featured: Boolean,
  status: String, // published, draft, cancelled
  createdAt: Date,
  updatedAt: Date
}

// Event Registrations Collection
{
  _id: ObjectId,
  eventId: ObjectId,
  attendeeName: String,
  email: String,
  phone: String,
  ticketCount: Number,
  paymentMethod: String,
  paymentId: String,
  status: String, // pending, confirmed, cancelled
  createdAt: Date
}

// News Collection
{
  _id: ObjectId,
  title: String,
  excerpt: String,
  content: String,
  image: String,
  category: String,
  featured: Boolean,
  status: String, // published, draft
  createdAt: Date,
  updatedAt: Date
}
```

### Payment Integration
- **Stripe**: Credit/debit card payments
- **M-Pesa**: Mobile money payments
- **Webhooks**: Payment confirmation handling

### Email Integration
- **SendGrid**: Transactional emails
- **Mailchimp**: Newsletter and event updates

## Styling & Theming

### Brand Colors
- Primary Yellow: `#FFD935`
- Deep Teal: `#042C45`
- Bright Orange: `#FF7D05`
- Earthy Brown: `#66623C`

### Typography
- Headings: Fredoka (Google Fonts)
- Body Text: League Spartan (Google Fonts)

### Responsive Breakpoints
- Mobile: `< 768px`
- Tablet: `768px - 1024px`
- Desktop: `> 1024px`

## Animation Details

### Framer Motion
- Page transitions and component animations
- Hover effects and micro-interactions
- Staggered reveals and scroll animations

### GSAP ScrollTrigger
- Calendar scroll effect with fade transitions
- Parallax hero background
- Smooth scroll across sections

## Development Commands

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## TODO: Backend Implementation

### Immediate Tasks
1. Set up MongoDB connection and schemas
2. Implement actual API endpoints
3. Add form validation with Zod
4. Integrate payment processing
5. Set up email notifications

### Future Enhancements
1. Admin dashboard for event/news management
2. Real-time notifications
3. Advanced search and filtering
4. Event calendar integration
5. Social media integration
6. Analytics and reporting

## Browser Support
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Performance Considerations
- Image optimization with Next.js Image component
- Lazy loading for event cards
- Efficient scroll animations
- Minimal bundle size with tree shaking

## Accessibility
- Semantic HTML structure
- ARIA labels and roles
- Keyboard navigation support
- Screen reader compatibility
- High contrast ratios

## Security
- Input validation and sanitization
- CSRF protection
- Rate limiting on API endpoints
- Secure payment processing
- Data encryption at rest

---

**Note**: This is a frontend-focused implementation with backend integration placeholders. All API endpoints currently return mock data and need to be connected to actual MongoDB collections and external services.
