# Email Templates - Updated to Specifications

**Date**: 2025-11-11  
**Status**: ✅ COMPLETED  
**Commit**: b4cc9aa

---

## 📧 Updated Email Templates

All email templates have been updated to match the specified format with simplified, user-friendly content.

---

## ✅ Template Updates

### 1. **Submission Received**
**Subject**: `Equality Vanguard — We received your submission`

**Content**:
- Hi {name || "Friend"}
- We received your {submissionType}
- Reference: {id}
- Status: Pending review
- Clean, simple layout with reference box

**Template**: `submission-received`

---

### 2. **Submission Published**
**Subject**: `Your submission is live on Equality Vanguard`

**Content**:
- Hi {name}
- Your {submissionType} has been published
- Includes clickable link to view published content
- Call-to-action button
- Thank you message

**Template**: `submission-approved`

---

### 3. **Payment Receipt**
**Subject**: `Receipt — {donation|order|membership} ({amount} {currency})`

**Content**:
- Date, amount, reference number
- Membership start/end dates (if applicable)
- Tax deductible status
- Supports multiple payment types: donation, order, membership
- Clean receipt format

**Template**: `donation-receipt`

**Data fields**:
- `paymentType`: 'donation', 'order', or 'membership'
- `amount`: Payment amount
- `currency`: Currency code (USD, KES, etc.)
- `date`: Transaction date
- `reference`: Transaction reference/ID
- `membershipStart`: Membership start date (optional)
- `membershipEnd`: Membership end date (optional)

---

### 4. **Event Registration**
**Subject**: `Event registration confirmed — {eventTitle}`

**Content**:
- Date/time and location
- Ticket code (if applicable)
- Calendar invite note (.ics attachment)
- Visual calendar icon
- Clean event details box

**Template**: `event-registration`

**Features**:
- Mentions attached .ics calendar file
- Formatted date/time display
- Ticket code display
- Location information

---

### 5. **Job Application Received**
**Subject**: `We received your application for {jobTitle}`

**Content**:
- Position applied for
- Application date
- Next steps section
- Timeline information
- Status: Under Review

**Template**: `application-confirmation`

**Data fields**:
- `jobTitle`: Position name
- `applicantName` or `name`: Applicant's name
- `applicationDate`: Date of application
- `timeline`: Expected review timeline (optional, defaults to "2-3 weeks")

---

## 🎨 Design Features

All templates include:

### **Consistent Styling**
- Clean, modern HTML email design
- Mobile-responsive layout
- Maximum width: 600px
- Professional color scheme

### **Visual Elements**
- Colored headers matching template type
- Content boxes with left border accent
- Clear typography hierarchy
- Readable font sizes

### **Color Coding**
- **Purple** (#7c3aed): Submission received
- **Green** (#059669): Approved/Published/Events
- **Red** (#dc2626): Payments/Receipts
- **Blue** (#4f46e5): Applications
- **Light blue** (#e0f2fe): Information boxes

### **User-Friendly Content**
- Casual greeting: "Hi {name}" instead of "Dear {name}"
- Concise, clear messaging
- Important info in highlighted boxes
- Call-to-action buttons where appropriate

---

## 📝 Template Usage Examples

### Submission Received
```javascript
await sendEmail({
  to: 'user@example.com',
  subject: 'Equality Vanguard — We received your submission',
  template: 'submission-received',
  data: {
    name: 'Jane Doe',
    submissionType: 'article',
    id: 'SUB-2024-001',
    title: 'Gender Justice in Kenya'
  }
});
```

### Submission Published
```javascript
await sendEmail({
  to: 'user@example.com',
  subject: 'Your submission is live on Equality Vanguard',
  template: 'submission-approved',
  data: {
    name: 'Jane Doe',
    submissionType: 'article',
    title: 'Gender Justice in Kenya',
    url: 'https://equalityvanguard.org/publications/gender-justice-kenya'
  }
});
```

### Payment Receipt
```javascript
await sendEmail({
  to: 'user@example.com',
  subject: 'Receipt — membership (5000 KES)',
  template: 'donation-receipt',
  data: {
    name: 'John Smith',
    paymentType: 'membership',
    amount: '5000',
    currency: 'KES',
    date: '2024-11-11',
    reference: 'TXN-123456',
    membershipStart: '2024-11-11',
    membershipEnd: '2025-11-11'
  }
});
```

### Event Registration
```javascript
await sendEmail({
  to: 'user@example.com',
  subject: 'Event registration confirmed — Gender Justice Summit 2024',
  template: 'event-registration',
  data: {
    name: 'Sarah Johnson',
    eventTitle: 'Gender Justice Summit 2024',
    eventDate: 'December 15, 2024',
    eventTime: '9:00 AM',
    location: 'Nairobi Convention Center',
    ticketCode: 'TKT-789012'
  },
  attachments: [
    {
      filename: 'event.ics',
      data: icsBuffer,
      contentType: 'text/calendar'
    }
  ]
});
```

### Job Application
```javascript
await sendEmail({
  to: 'applicant@example.com',
  subject: 'We received your application for Program Manager',
  template: 'application-confirmation',
  data: {
    name: 'Michael Brown',
    jobTitle: 'Program Manager',
    applicationDate: '2024-11-11',
    timeline: 'We will review applications within 2 weeks and contact shortlisted candidates by November 25.'
  }
});
```

---

## 🔄 Migration from Old Templates

### What Changed

**Before**:
- Formal language ("Dear {name}")
- Longer, more verbose content
- Generic subjects
- Less visual hierarchy

**After**:
- Casual, friendly tone ("Hi {name}")
- Concise, focused content
- Specific, descriptive subjects
- Clear visual boxes and sections
- Better mobile responsiveness

### Backward Compatibility

All templates remain **backward compatible**. Old data fields still work:
- `submitterName` → falls back to `name`
- `donorName` → falls back to `name`
- `applicantName` → falls back to `name`
- `eventLocation` → falls back to `location`

---

## 🎯 Best Practices

### **Subject Lines**
- Keep under 50 characters
- Include key information (event name, amount, etc.)
- Use em dash (—) for professional look

### **Content**
- Start with friendly greeting
- State purpose in first sentence
- Use boxes for important details
- End with clear next steps or thank you

### **Data Fields**
- Always provide `name` field
- Include all required fields for template type
- Use fallback values where appropriate
- Format dates consistently

---

## ✅ Testing Checklist

- [x] Submission received template
- [x] Submission published template
- [x] Payment receipt template (donation)
- [x] Payment receipt template (membership)
- [x] Event registration template
- [x] Job application template
- [ ] Test with real email clients (Gmail, Outlook, etc.)
- [ ] Test on mobile devices
- [ ] Verify .ics attachment works

---

## 📊 Template Summary

| Template | Subject Format | Key Features |
|----------|---------------|--------------|
| Submission Received | `Equality Vanguard — We received your submission` | Reference ID, status |
| Submission Published | `Your submission is live on Equality Vanguard` | URL link, CTA button |
| Payment Receipt | `Receipt — {type} ({amount} {currency})` | Date, amount, reference, membership dates |
| Event Registration | `Event registration confirmed — {eventTitle}` | Date/time, location, .ics note |
| Job Application | `We received your application for {jobTitle}` | Timeline, next steps |

---

## 🚀 Deployment Status

- ✅ **Code Updated**: All templates updated in `/src/lib/email.ts`
- ✅ **Committed**: Commit `b4cc9aa`
- ✅ **Pushed**: Pushed to `integrations` branch
- ⏳ **Deployed**: Auto-deploying to Vercel
- ⏳ **Testing**: Ready for testing once deployed

---

## 📞 Next Steps

1. **Verify Deployment**: Check Vercel deployment status
2. **Test Emails**: Use test script or staging site
3. **Verify Domain**: Ensure Resend domain is verified
4. **Monitor**: Check Resend dashboard for delivery

---

**Last Updated**: 2025-11-11  
**Branch**: integrations  
**Status**: Ready for testing
