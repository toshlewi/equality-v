# Google Calendar Integration Setup Guide

## 📋 Overview

This guide will walk you through setting up Google Calendar API integration for the Equality Vanguard website. Events will be automatically synced to your organization's Google Calendar, and attendees will receive calendar invites.

---

## 🚀 Step 1: Create Google Cloud Project

### 1.1 Access Google Cloud Console

1. Go to: **https://console.cloud.google.com/**
2. Sign in with your Google account (use your organization's Google Workspace account if available)

### 1.2 Create New Project

1. Click the **project dropdown** at the top (next to "Google Cloud")
2. Click **"New Project"**
3. Fill in:
   - **Project name:** `Equality Vanguard`
   - **Organization:** (Select if you have Google Workspace)
   - **Location:** (Leave default or select your organization)
4. Click **"Create"**
5. Wait for the project to be created (takes ~30 seconds)
6. Select the new project from the dropdown

---

## 🔑 Step 2: Enable Google Calendar API

### 2.1 Enable the API

1. In the left sidebar, navigate to:
   ```
   APIs & Services → Library
   ```

2. In the search bar, type: **"Google Calendar API"**

3. Click on **"Google Calendar API"** in the results

4. Click the blue **"Enable"** button

5. Wait for it to enable (~10 seconds)

---

## 👤 Step 3: Create Service Account

### 3.1 Navigate to Credentials

1. In the left sidebar, go to:
   ```
   APIs & Services → Credentials
   ```

### 3.2 Create Service Account

1. Click **"+ Create Credentials"** at the top
2. Select **"Service Account"**

3. Fill in the details:
   - **Service account name:** `equality-vanguard-calendar`
   - **Service account ID:** (auto-generated, leave as is)
   - **Description:** `Service account for managing calendar events`

4. Click **"Create and Continue"**

### 3.3 Grant Permissions

1. In the "Grant this service account access to project" section:
   - Click the **"Select a role"** dropdown
   - Navigate to: **Project → Editor**
   - Select **"Editor"**

2. Click **"Continue"**

3. Skip the "Grant users access" section (optional)

4. Click **"Done"**

### 3.4 Create and Download Key

1. You'll see your service account in the list
2. Click on the **service account email** (looks like: `equality-vanguard-calendar@your-project.iam.gserviceaccount.com`)

3. Go to the **"Keys"** tab

4. Click **"Add Key" → "Create new key"**

5. Select **"JSON"** format

6. Click **"Create"**

7. **IMPORTANT:** A JSON file will download automatically
   - **Save this file securely!**
   - **Never commit it to Git!**
   - **You'll need it in Step 5**

---

## 📅 Step 4: Set Up Organization Calendar

### 4.1 Create Calendar

1. Go to: **https://calendar.google.com/**

2. In the left sidebar, next to "Other calendars", click the **"+"** button

3. Select **"Create new calendar"**

4. Fill in:
   - **Name:** `Equality Vanguard Events`
   - **Description:** `Public calendar for Equality Vanguard events and activities`
   - **Time zone:** `Africa/Nairobi` (or your organization's timezone)

5. Click **"Create calendar"**

### 4.2 Get Calendar ID

1. Find your new calendar in the left sidebar under "My calendars"

2. Click the **three dots (⋮)** next to the calendar name

3. Select **"Settings and sharing"**

4. Scroll down to the **"Integrate calendar"** section

5. Copy the **Calendar ID** (looks like: `abc123def456@group.calendar.google.com`)
   - **Save this - you'll need it in Step 5!**

### 4.3 Share Calendar with Service Account

1. Still in calendar settings, scroll to **"Share with specific people"**

2. Click **"+ Add people"**

3. Paste the **service account email** from Step 3.4
   - Format: `equality-vanguard-calendar@your-project.iam.gserviceaccount.com`

4. Set permission to: **"Make changes to events"**

5. **Uncheck** "Send email notification" (it's a service account, not a person)

6. Click **"Send"**

### 4.4 Make Calendar Public (Optional)

If you want the calendar to be publicly viewable:

1. In the same settings page, scroll to **"Access permissions"**

2. Check **"Make available to public"**

3. Set visibility to: **"See all event details"**

4. Click **"OK"** on the warning dialog

---

## 🔧 Step 5: Configure Environment Variables

### 5.1 Prepare Service Account JSON

1. Open the JSON file you downloaded in Step 3.4

2. The file contains your service account credentials

3. You'll need to add this as an environment variable

### 5.2 Add to .env.local

Open your `.env.local` file and add:

```env
# Google Calendar Integration
GOOGLE_CALENDAR_SERVICE_ACCOUNT_JSON='{"type":"service_account","project_id":"your-project","private_key_id":"...","private_key":"-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n","client_email":"equality-vanguard-calendar@your-project.iam.gserviceaccount.com","client_id":"...","auth_uri":"https://accounts.google.com/o/oauth2/auth","token_uri":"https://oauth2.googleapis.com/token","auth_provider_x509_cert_url":"https://www.googleapis.com/oauth2/v1/certs","client_x509_cert_url":"..."}'

GOOGLE_CALENDAR_ID=abc123def456@group.calendar.google.com
```

**IMPORTANT:**
- Replace the entire JSON string with your actual service account JSON content
- Make sure it's on ONE line
- Wrap it in single quotes
- Replace `GOOGLE_CALENDAR_ID` with your actual Calendar ID from Step 4.2

### 5.3 Alternative: Use Base64 Encoding (Recommended for Production)

For production (Vercel, etc.), it's easier to use base64:

**On Mac/Linux:**
```bash
cat path/to/your-service-account.json | base64
```

**On Windows (PowerShell):**
```powershell
[Convert]::ToBase64String([IO.File]::ReadAllBytes("path\to\your-service-account.json"))
```

Then in your `.env.local`:
```env
GOOGLE_CALENDAR_SERVICE_ACCOUNT_BASE64=eyJ0eXBlIjoic2VydmljZV9hY2NvdW50IiwicHJvamVjdF9pZCI6...
GOOGLE_CALENDAR_ID=abc123def456@group.calendar.google.com
```

And update the code to decode it (I'll show you how below).

---

## 🧪 Step 6: Test the Integration

### 6.1 Restart Development Server

```bash
# Stop the server (Ctrl+C)
# Start it again
npm run dev
```

### 6.2 Check Console

You should see:
```
Google Calendar client initialized successfully
```

If you see an error, double-check your environment variables.

### 6.3 Test Event Creation

Create a test event through your admin panel or API:

```bash
curl -X POST http://localhost:3000/api/admin/events \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Event",
    "startDate": "2025-11-20T10:00:00Z",
    "endDate": "2025-11-20T12:00:00Z",
    "location": "Nairobi, Kenya",
    "description": "This is a test event"
  }'
```

Check your Google Calendar - the event should appear!

---

## 🔄 Step 7: Integration Points

The Google Calendar integration is automatically used in these places:

### 7.1 Event Creation
When an event is created in the admin panel:
- Event is added to Google Calendar
- Calendar event ID is stored in the database

### 7.2 Event Updates
When an event is updated:
- Google Calendar event is updated automatically
- Changes sync in real-time

### 7.3 Event Deletion
When an event is deleted:
- Google Calendar event is removed
- Attendees are notified

### 7.4 Event Registration
When someone registers for an event:
- They're added as an attendee in Google Calendar
- They receive a calendar invite via email
- ICS file is attached to confirmation email

---

## 📧 Step 8: Email Integration

### 8.1 ICS Attachments

The system automatically generates ICS files for:
- Event registration confirmations
- Event reminders
- Event updates

### 8.2 How It Works

1. User registers for event
2. System creates/updates Google Calendar event
3. System generates ICS file
4. ICS file is attached to confirmation email
5. User can add to their personal calendar (Google, Outlook, Apple)

---

## 🚀 Step 9: Deploy to Production

### 9.1 Vercel Environment Variables

1. Go to your Vercel project dashboard

2. Navigate to: **Settings → Environment Variables**

3. Add the following variables:

```
GOOGLE_CALENDAR_SERVICE_ACCOUNT_JSON = (paste your JSON or base64)
GOOGLE_CALENDAR_ID = abc123def456@group.calendar.google.com
```

4. Select environments: **Production, Preview, Development**

5. Click **"Save"**

### 9.2 Redeploy

```bash
vercel --prod
```

Or push to your main branch if you have auto-deployment set up.

---

## 🔍 Step 10: Verify Everything Works

### 10.1 Checklist

- [ ] Google Cloud project created
- [ ] Google Calendar API enabled
- [ ] Service account created with key
- [ ] Organization calendar created
- [ ] Calendar shared with service account
- [ ] Calendar ID copied
- [ ] Environment variables set
- [ ] Development server shows "initialized successfully"
- [ ] Test event appears in Google Calendar
- [ ] Event registration sends calendar invite
- [ ] ICS file attached to emails

### 10.2 Common Issues

**Error: "Calendar not configured"**
- Check that `GOOGLE_CALENDAR_SERVICE_ACCOUNT_JSON` is set
- Verify JSON is valid (use a JSON validator)
- Make sure it's on one line

**Error: "Permission denied"**
- Verify calendar is shared with service account email
- Check permission is "Make changes to events"
- Wait a few minutes for permissions to propagate

**Events not appearing**
- Verify `GOOGLE_CALENDAR_ID` is correct
- Check calendar ID format (should end with @group.calendar.google.com)
- Ensure service account has access

**ICS files not in emails**
- Check email template includes attachments
- Verify ICS generation function is called
- Check email service supports attachments

---

## 📚 Additional Resources

### Google Calendar API Documentation
- **API Reference:** https://developers.google.com/calendar/api/v3/reference
- **Guides:** https://developers.google.com/calendar/api/guides/overview
- **Node.js Client:** https://github.com/googleapis/google-api-nodejs-client

### Service Account Documentation
- **Overview:** https://cloud.google.com/iam/docs/service-accounts
- **Best Practices:** https://cloud.google.com/iam/docs/best-practices-service-accounts

### Troubleshooting
- **API Errors:** https://developers.google.com/calendar/api/guides/errors
- **Quota Limits:** https://developers.google.com/calendar/api/guides/quota

---

## 🔐 Security Best Practices

1. **Never commit service account JSON to Git**
   - Add to `.gitignore`
   - Use environment variables only

2. **Rotate keys periodically**
   - Create new key every 90 days
   - Delete old keys

3. **Use least privilege**
   - Service account only needs Calendar access
   - Don't grant unnecessary permissions

4. **Monitor usage**
   - Check Google Cloud Console for API usage
   - Set up alerts for unusual activity

5. **Backup calendar data**
   - Export calendar periodically
   - Keep backup of event data in your database

---

## 📞 Support

If you encounter issues:

1. Check the console logs for error messages
2. Verify all environment variables are set correctly
3. Test with a simple event creation first
4. Check Google Cloud Console for API errors
5. Review calendar sharing permissions

---

**Setup Complete!** 🎉

Your Google Calendar integration is now ready to use. Events will automatically sync to your organization's calendar, and attendees will receive calendar invites.
