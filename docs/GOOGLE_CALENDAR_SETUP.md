# Google Calendar Integration Setup Guide

## Overview

The Equality Vanguard platform integrates with Google Calendar to automatically:
- Create calendar events for registered attendees
- Send `.ics` calendar files via email
- Sync events to your organization's Google Calendar
- Send automatic reminders to attendees

## Features

✅ **Automatic ICS Files**: All event registrations include `.ics` calendar attachments
✅ **Google Calendar Sync**: Events are automatically added to your organization's calendar
✅ **Email Invites**: Attendees receive calendar invites via email
✅ **Automatic Reminders**: 24-hour and 1-hour reminders are configured

## Prerequisites

- Google Cloud Platform account
- Admin access to your organization's Google Calendar
- Basic knowledge of Google Cloud Console

## Setup Instructions

### Step 1: Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click **Select a project** → **New Project**
3. Name: `equality-vanguard-calendar`
4. Click **Create**

### Step 2: Enable Google Calendar API

1. In your project, go to **APIs & Services** → **Library**
2. Search for "Google Calendar API"
3. Click **Enable**

### Step 3: Create a Service Account

1. Go to **APIs & Services** → **Credentials**
2. Click **Create Credentials** → **Service Account**
3. Fill in details:
   - **Name**: `equality-vanguard-events`
   - **Description**: `Service account for event calendar management`
4. Click **Create and Continue**
5. Grant role: **Editor** (or create custom role with Calendar permissions)
6. Click **Done**

### Step 4: Generate Service Account Key

1. Click on the service account you just created
2. Go to the **Keys** tab
3. Click **Add Key** → **Create new key**
4. Choose **JSON** format
5. Click **Create**
6. A JSON file will download - **keep this secure!**

### Step 5: Share Calendar with Service Account

1. Open [Google Calendar](https://calendar.google.com)
2. Find the calendar you want to use (or create a new one)
3. Click the three dots next to the calendar → **Settings and sharing**
4. Scroll to **Share with specific people**
5. Click **Add people**
6. Enter the service account email from the JSON file:
   - Format: `equality-vanguard-events@your-project.iam.gserviceaccount.com`
7. Set permission to **Make changes to events**
8. Click **Send**

### Step 6: Get Calendar ID

1. In Calendar Settings, scroll to **Integrate calendar**
2. Copy the **Calendar ID**
   - For primary calendar: use `primary`
   - For custom calendar: looks like `abc123@group.calendar.google.com`

### Step 7: Configure Environment Variables

1. Open the downloaded JSON key file
2. Copy the **entire JSON content** (it should be one line)
3. Add to your `.env.local`:

```bash
# Google Calendar Integration
GOOGLE_CALENDAR_SERVICE_ACCOUNT_JSON={"type":"service_account","project_id":"your-project-id",...}
GOOGLE_CALENDAR_ID=primary
```

**Important**: The JSON must be on a single line with no line breaks.

### Step 8: Verify Configuration

Run the validation script:

```bash
npm run validate-env
```

Or test manually:

```bash
node -e "
const json = process.env.GOOGLE_CALENDAR_SERVICE_ACCOUNT_JSON;
try {
  const parsed = JSON.parse(json);
  console.log('✅ Valid JSON');
  console.log('Service Account:', parsed.client_email);
} catch (e) {
  console.error('❌ Invalid JSON:', e.message);
}
"
```

## Testing the Integration

### Test 1: Check Configuration Status

```bash
curl http://localhost:3000/api/admin/system/status
```

Look for `googleCalendar: { configured: true }`

### Test 2: Register for a Test Event

1. Create a test event in the admin panel
2. Register for the event
3. Check:
   - ✅ Email received with `.ics` attachment
   - ✅ Event appears in Google Calendar
   - ✅ Calendar invite sent to attendee

### Test 3: Verify ICS File

Open the `.ics` file from the email and verify:
- Event title and description
- Correct date and time
- Location information
- Organizer details

## Troubleshooting

### Error: "Google Calendar is not configured"

**Cause**: Missing or invalid `GOOGLE_CALENDAR_SERVICE_ACCOUNT_JSON`

**Solution**:
1. Verify the JSON is valid (use a JSON validator)
2. Ensure it's on a single line
3. Check for escaped quotes and special characters
4. Restart your Next.js server

### Error: "Calendar not found"

**Cause**: Service account doesn't have access to the calendar

**Solution**:
1. Verify you shared the calendar with the service account email
2. Check the `GOOGLE_CALENDAR_ID` is correct
3. Wait a few minutes for permissions to propagate

### Error: "Insufficient permissions"

**Cause**: Service account lacks Calendar API permissions

**Solution**:
1. Go to Google Cloud Console → IAM
2. Find your service account
3. Add role: **Calendar Editor** or **Editor**
4. Re-share the calendar with "Make changes to events" permission

### ICS Files Work But Google Calendar Doesn't Sync

**Cause**: Google Calendar integration is optional - ICS files work independently

**Solution**:
- ICS files are sent regardless of Google Calendar configuration
- Users can manually add events to their calendar from the `.ics` file
- Google Calendar sync is a bonus feature for your organization

## How It Works

### Event Registration Flow

1. **User Registers** → Event registration created
2. **ICS File Generated** → Calendar invite created with event details
3. **Email Sent** → Confirmation email with `.ics` attachment
4. **Google Calendar Sync** (if configured) → Event added to organization calendar
5. **Reminders Set** → Automatic 24h and 1h reminders

### ICS File Contents

```ics
BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Equality Vanguard//Event Calendar//EN
CALSCALE:GREGORIAN
METHOD:REQUEST
BEGIN:VEVENT
UID:event-reg-123456@equalityvanguard.org
DTSTART:20250115T100000Z
DTEND:20250115T120000Z
SUMMARY:Event Title
DESCRIPTION:Event description
LOCATION:Event location or virtual link
ORGANIZER;CN="Equality Vanguard":mailto:events@equalityvanguard.org
ATTENDEE;CN="John Doe";RSVP=TRUE:mailto:john@example.com
STATUS:CONFIRMED
BEGIN:VALARM
TRIGGER:-PT24H
ACTION:DISPLAY
DESCRIPTION:Event Reminder
END:VALARM
END:VEVENT
END:VCALENDAR
```

## Security Best Practices

1. **Never commit** the service account JSON to version control
2. **Restrict permissions** to only what's needed (Calendar API)
3. **Rotate keys** periodically (every 90 days recommended)
4. **Monitor usage** in Google Cloud Console
5. **Use separate** service accounts for dev/staging/production

## API Endpoints

### Check Calendar Status

```bash
GET /api/admin/system/status
```

### Manual Event Creation (Admin Only)

```bash
POST /api/admin/events/calendar/create
Content-Type: application/json

{
  "eventId": "event_id_here"
}
```

## Environment Variables Reference

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `GOOGLE_CALENDAR_SERVICE_ACCOUNT_JSON` | No* | Service account credentials | `{"type":"service_account",...}` |
| `GOOGLE_CALENDAR_ID` | No* | Calendar ID to use | `primary` or `abc@group.calendar.google.com` |

\* Optional - ICS files work without Google Calendar integration

## Support

- **ICS files not working?** Check email service configuration (Resend)
- **Google Calendar issues?** Verify service account permissions
- **Need help?** Contact the development team

## Additional Resources

- [Google Calendar API Documentation](https://developers.google.com/calendar/api/guides/overview)
- [Service Account Authentication](https://cloud.google.com/iam/docs/service-accounts)
- [iCalendar Format Specification](https://icalendar.org/)

---

**Status**: ✅ ICS files are fully functional and sent with all event registrations. Google Calendar sync is an optional enhancement.
