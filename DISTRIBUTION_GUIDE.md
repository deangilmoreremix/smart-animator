# Video Distribution System Guide

## Overview
The Smart Animator platform now includes a complete personalization and multi-channel distribution system for sending your generated videos to contacts.

## Features

### 1. Contact Management
- Add, edit, and delete contacts
- Import contacts from CSV
- Export contacts to CSV
- Organize contacts with custom fields
- Search and filter contacts

### 2. Email Distribution
- Send personalized video emails to contacts
- Configure Gmail or Outlook SMTP
- Professional email templates with video embeds
- Track sent status and errors
- Campaign management and tracking

### 3. AI-Powered Personalization (Optional)
- AI-generated email subjects
- AI-generated email body content
- Personalized for each recipient
- Uses contact information (name, company, industry)
- Falls back to template variables if AI unavailable

### 4. Template Personalization
- Use merge tags in messages: `{firstName}`, `{lastName}`, `{company}`, `{industry}`
- Works with or without AI

## How to Use

### Step 1: Configure Email
1. Click "Configure Email" button in the Distribution page
2. Select your email provider (Gmail or Outlook)
3. Enter your email and password
   - **Gmail**: Use an App Password (Settings → Security → 2-Step Verification → App Passwords)
   - **Outlook**: Use your regular password
4. Click Save

### Step 2: Add Contacts
1. Navigate to the Contacts page
2. Click "Add Contact" to manually add contacts
3. Or click "Import CSV" to bulk import
4. Fill in contact details (name, email, company, industry)

### Step 3: Create a Campaign
1. Go to the Distribution page
2. Select a completed video
3. Select recipients (click checkboxes or "Select All")
4. Enter campaign name
5. Write email subject
6. Write message template (use merge tags like `{firstName}`)
7. Toggle "AI Personalization" if you have Ollama running
8. Click "Send Campaign"

### Step 4: Monitor Results
- View real-time progress as emails are sent
- Check campaign status in the database
- Track which emails were sent successfully
- See error messages for failed sends

## AI Personalization Setup (Optional)

To enable AI-powered personalization:

1. Install Ollama on your local machine or server:
   ```bash
   curl https://ollama.ai/install.sh | sh
   ```

2. Pull the llama3.1 model:
   ```bash
   ollama pull llama3.1
   ```

3. Start Ollama:
   ```bash
   ollama serve
   ```

4. The system will automatically detect Ollama and enable AI features
5. You'll see "AI Available" badge when it's connected

### Without AI
If Ollama is not available, the system will:
- Use template variable replacement (merge tags)
- Still send personalized emails with contact info
- Work perfectly for basic personalization needs

## Database Schema

The system uses these tables:
- **contacts** - Contact information
- **lists** - Contact lists/segments
- **campaigns** - Distribution campaigns
- **sends** - Individual email sends with tracking
- **events** - Analytics (opens, clicks, views)
- **templates** - Reusable message templates

## Edge Functions

Two Supabase Edge Functions power the system:

1. **send-email** - Handles SMTP email delivery
2. **ai-personalize** - Generates AI-powered personalized content

These are serverless functions that run in the cloud.

## Security

- SMTP credentials are never stored in the database
- Configured in-memory during your session
- All data protected by Row Level Security (RLS)
- Users can only access their own contacts and campaigns

## Tips

1. **Test First**: Send to yourself first to test the campaign
2. **Use Merge Tags**: Personalize with `{firstName}`, `{company}`, etc.
3. **Keep It Short**: Brief, personal messages work best
4. **AI Enhancement**: AI personalization makes each message unique
5. **Monitor Progress**: Watch the progress bar during sending

## Troubleshooting

**"Email service not configured"**
- Click "Configure Email" and enter your SMTP credentials

**"AI service not available"**
- Install and start Ollama (optional)
- System will use template personalization instead

**Emails not sending**
- Verify SMTP credentials
- Check your email provider's security settings
- Gmail: Enable "Less secure app access" or use App Password
- Outlook: Check account is not locked

**"Failed to send email"**
- Check internet connection
- Verify recipient email addresses
- Check SMTP server availability

## Support

For issues or questions:
1. Check the browser console for errors
2. Verify edge functions are deployed: Settings → Edge Functions
3. Check Supabase logs for errors
