# Equality Vanguard Admin System

This document provides comprehensive information about the Equality Vanguard admin dashboard and CMS system.

## Overview

The admin system is a full-featured CMS built with Next.js, MongoDB, and NextAuth.js. It provides role-based access control, content management, financial tracking, and community management capabilities.

## Features

### 🎯 Core Features
- **Role-based Access Control**: Admin, Editor, Reviewer, Finance roles
- **Content Management**: Articles, Stories, Book Suggestions
- **Community Management**: Members, Partnerships, Volunteers
- **Event Management**: Events, Registrations, Ticketing
- **Financial Center**: Donations, Payments, Shop Orders
- **Real-time Dashboard**: Live metrics and analytics
- **Notification System**: In-app and email notifications

### 📊 Dashboard Metrics
- Total and active members
- Pending submissions count
- Upcoming events
- Donation totals and growth
- Recent activity feed
- Monthly growth charts

## Getting Started

### Prerequisites
- Node.js 18+ 
- MongoDB Atlas account or local MongoDB
- Environment variables configured

### Environment Variables

Create a `.env.local` file with the following variables:

```bash
# Database
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/equality-vanguard

# Authentication
NEXTAUTH_SECRET=your-nextauth-secret-key
NEXTAUTH_URL=http://localhost:3000

# Admin Seed (for first-time setup)
ADMIN_EMAIL=admin@equalityvanguard.org
ADMIN_PASSWORD=your-secure-password
ADMIN_NAME=System Administrator

# Email Service (SendGrid)
SENDGRID_API_KEY=your-sendgrid-api-key
SENDGRID_FROM_EMAIL=noreply@equalityvanguard.org

# Payment Processing
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# M-Pesa (Kenya)
MPESA_CONSUMER_KEY=your-mpesa-consumer-key
MPESA_CONSUMER_SECRET=your-mpesa-consumer-secret
MPESA_SHORTCODE=your-mpesa-shortcode
MPESA_PASSKEY=your-mpesa-passkey

# File Storage (AWS S3)
AWS_ACCESS_KEY_ID=your-aws-access-key
AWS_SECRET_ACCESS_KEY=your-aws-secret-key
AWS_REGION=us-east-1
AWS_S3_BUCKET=equality-vanguard-uploads

# reCAPTCHA
RECAPTCHA_SITE_KEY=your-recaptcha-site-key
RECAPTCHA_SECRET_KEY=your-recaptcha-secret-key

# Mailchimp (Optional)
MAILCHIMP_API_KEY=your-mailchimp-api-key
MAILCHIMP_LIST_ID=your-mailchimp-list-id
```

### Installation

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Set up Environment Variables**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your actual values
   ```

3. **Create First Admin User**
   ```bash
   npm run seed:admin
   ```

4. **Start Development Server**
   ```bash
   npm run dev
   ```

5. **Access Admin Dashboard**
   - Navigate to `http://localhost:3000/admin/login`
   - Use the credentials from the seed script

## User Roles & Permissions

### Admin
- Full access to all features
- User management
- System settings
- Developer tools

### Editor
- Content management (articles, stories)
- Member management
- Event management
- Newsletter management

### Reviewer
- Content review and approval
- Story moderation
- Article publishing

### Finance
- Payment management
- Donation tracking
- Order processing
- Financial reports

## API Endpoints

### Authentication
- `POST /api/auth/signin` - User login
- `POST /api/auth/signout` - User logout
- `GET /api/auth/session` - Get current session

### Content Management
- `GET /api/admin/articles` - List articles
- `POST /api/admin/articles` - Create article
- `PUT /api/admin/articles/[id]` - Update article
- `DELETE /api/admin/articles/[id]` - Delete article
- `POST /api/admin/articles/[id]/publish` - Publish article

- `GET /api/admin/stories` - List stories
- `POST /api/admin/stories` - Create story
- `PUT /api/admin/stories/[id]` - Update story
- `DELETE /api/admin/stories/[id]` - Delete story

### Dashboard
- `GET /api/admin/dashboard` - Get dashboard metrics

## Database Models

### Core Models
- **User**: Admin users and authentication
- **Article**: Knowledge Portal content
- **Story**: Our Voices submissions
- **BookSuggestion**: ALKAH Book Club recommendations
- **Member**: Community members
- **Event**: Events and workshops
- **EventRegistration**: Event attendees
- **Donation**: Financial contributions
- **Product**: Shop merchandise
- **Order**: E-commerce orders
- **Notification**: System notifications
- **Partnership**: Partnership inquiries
- **Contact**: Contact form submissions

## Security Features

### Authentication & Authorization
- JWT-based sessions
- Role-based access control
- Password hashing with bcrypt
- Session management

### Data Protection
- Input validation with Zod
- SQL injection prevention
- XSS protection
- CSRF protection
- Rate limiting

### File Upload Security
- File type validation
- Size limits
- Virus scanning (when implemented)
- Secure file storage

## Payment Integration

### Stripe
- Credit card payments
- Webhook handling
- Refund processing
- Subscription management

### M-Pesa (Kenya)
- Mobile money payments
- STK Push integration
- Callback handling
- Transaction verification

## Email System

### SendGrid Integration
- Transactional emails
- Template system
- Delivery tracking
- Bounce handling

### Email Templates
- Welcome emails
- Payment confirmations
- Event tickets
- Newsletter subscriptions

## File Storage

### AWS S3
- Secure file uploads
- CDN distribution
- Access control
- Backup and recovery

### Supported File Types
- Images: JPG, PNG, GIF, WebP
- Documents: PDF, DOC, DOCX
- Audio: MP3, WAV, M4A
- Video: MP4, MOV, AVI

## Development

### Project Structure
```
src/
├── app/
│   ├── admin/           # Admin dashboard pages
│   └── api/             # API routes
├── components/
│   └── admin/           # Admin components
├── lib/                 # Utilities and configurations
├── models/              # MongoDB models
└── types/               # TypeScript type definitions
```

### Key Technologies
- **Frontend**: Next.js 15, React 19, Tailwind CSS
- **Backend**: Next.js API Routes, Node.js
- **Database**: MongoDB with Mongoose
- **Authentication**: NextAuth.js
- **Validation**: Zod
- **Charts**: Recharts
- **Icons**: Lucide React

### Development Commands
```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linting
npm run lint

# Create admin user
npm run seed:admin
```

## Deployment

### Vercel Deployment
1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Environment Variables for Production
- Set all required environment variables in Vercel
- Use production MongoDB URI
- Use production API keys
- Enable webhook endpoints

### Webhook Configuration
- **Stripe**: `https://yourdomain.com/api/webhooks/stripe`
- **M-Pesa**: `https://yourdomain.com/api/mpesa/callback`

## Monitoring & Maintenance

### Logging
- Application logs in Vercel
- Error tracking with Sentry (optional)
- Performance monitoring

### Backup Strategy
- MongoDB Atlas automated backups
- S3 file backups
- Database exports for critical data

### Security Updates
- Regular dependency updates
- Security patch monitoring
- Access log review

## Troubleshooting

### Common Issues

1. **MongoDB Connection Failed**
   - Check MONGODB_URI format
   - Verify network access
   - Check credentials

2. **Authentication Issues**
   - Verify NEXTAUTH_SECRET
   - Check session configuration
   - Clear browser cookies

3. **File Upload Errors**
   - Check AWS credentials
   - Verify S3 bucket permissions
   - Check file size limits

4. **Payment Processing Issues**
   - Verify Stripe/M-Pesa keys
   - Check webhook configuration
   - Review error logs

### Support
- Check application logs in Vercel dashboard
- Review MongoDB Atlas logs
- Contact system administrator

## Contributing

### Code Standards
- Use TypeScript for type safety
- Follow ESLint configuration
- Write meaningful commit messages
- Add comments for complex logic

### Pull Request Process
1. Create feature branch
2. Make changes with tests
3. Submit pull request
4. Code review and approval
5. Merge to main branch

## License

This project is proprietary to Equality Vanguard. All rights reserved.

---

**Last Updated**: December 2024
**Version**: 1.0.0
**Maintainer**: Equality Vanguard Development Team
