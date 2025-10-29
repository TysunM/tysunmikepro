# Gmail Setup Guide for TysunMikePro

Complete guide to setting up Gmail to send emails from your website.

## Why Gmail Instead of SendGrid?

✅ **FREE** - No cost for moderate email sending  
✅ **Easy Setup** - Use your existing Gmail account  
✅ **Reliable** - Google's infrastructure  
✅ **Professional** - Use your custom domain email  
✅ **No Credit Card** - No payment info required  

---

## Quick Setup (3 Steps)

### Step 1: Enable 2-Factor Authentication

1. Go to: https://myaccount.google.com/security
2. Click "2-Step Verification"
3. Follow the setup process
4. **Required** before you can create App Passwords

### Step 2: Create App Password

1. Go to: https://myaccount.google.com/apppasswords
2. Select app: **Mail**
3. Select device: **Other (Custom name)**
4. Enter name: **TysunMikePro Website**
5. Click **Generate**
6. **Copy the 16-character password** (looks like: `abcd efgh ijkl mnop`)

### Step 3: Add to .env File

Open `TysunMikePro/.env` and update:

```env
# Gmail/Google Workspace Email Configuration
GMAIL_USER=productions@tysunmike.us
GMAIL_APP_PASSWORD=abcdefghijklmnop  ← Your app password (remove spaces)
MAIL_FROM="Tysun Mike Productions <productions@tysunmike.us>"
```

**Important:** Remove all spaces from the app password!

---

## Detailed Instructions

### For Gmail (@gmail.com)

If using a regular Gmail account (e.g., `yourname@gmail.com`):

1. **Enable 2FA:**
   - Go to https://myaccount.google.com/security
   - Click "2-Step Verification"
   - Follow setup instructions

2. **Create App Password:**
   - Go to https://myaccount.google.com/apppasswords
   - Create new app password
   - Copy the 16-character code

3. **Update .env:**
   ```env
   GMAIL_USER=yourname@gmail.com
   GMAIL_APP_PASSWORD=your16charpassword
   MAIL_FROM="Your Name <yourname@gmail.com>"
   ```

### For Google Workspace (Custom Domain)

If using Google Workspace with custom domain (e.g., `productions@tysunmike.us`):

1. **Enable 2FA:**
   - Go to https://myaccount.google.com/security
   - Enable 2-Step Verification

2. **Create App Password:**
   - Go to https://myaccount.google.com/apppasswords
   - Generate app password

3. **Update .env:**
   ```env
   GMAIL_USER=productions@tysunmike.us
   GMAIL_APP_PASSWORD=your16charpassword
   MAIL_FROM="Tysun Mike Productions <productions@tysunmike.us>"
   ```

---

## Configuration Files Updated

I've already updated these files for you:

### 1. `.env` - Environment Variables
```env
# Gmail/Google Workspace Email Configuration
GMAIL_USER=productions@tysunmike.us
GMAIL_APP_PASSWORD=your_gmail_app_password_here
MAIL_FROM="Tysun Mike Productions <productions@tysunmike.us>"
```

### 2. `src/config.js` - Configuration
```javascript
export const config = {
  gmailUser: process.env.GMAIL_USER,
  gmailAppPassword: process.env.GMAIL_APP_PASSWORD,
  mailFrom: process.env.MAIL_FROM,
  // ...
};
```

### 3. `src/mail.js` - Email Service
```javascript
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: config.gmailUser,
    pass: config.gmailAppPassword
  }
});
```

### 4. `Package.json` - Dependencies
```json
{
  "dependencies": {
    "nodemailer": "^6.9.7"  // Replaced @sendgrid/mail
  }
}
```

---

## Installation

### Install New Dependency

```bash
npm install nodemailer
```

Or install all dependencies:

```bash
npm install
```

---

## Testing

### Test 1: Verify Configuration

Start your server:

```bash
npm start
```

You should see:
```
✅ Gmail is ready to send emails
```

If you see an error, check your app password.

### Test 2: Send Test Email

Use the chatbot:
1. Open your website
2. Click the chat button
3. Have a conversation
4. Click "End & Send Transcript"
5. Enter your email
6. Check your inbox!

### Test 3: Manual Test

Add this to your `server.js` temporarily:

```javascript
import { sendMail } from './src/mail.js';

// Test email on startup
sendMail(
  'productions@tysunmike.us',
  'Test Email from TysunMikePro',
  '<h1>Hello!</h1><p>Gmail is working! 🎉</p>'
).then(() => {
  console.log('✅ Test email sent!');
}).catch(err => {
  console.error('❌ Test email failed:', err.message);
});
```

---

## Troubleshooting

### Error: "Invalid login"

**Problem:** App password is incorrect

**Solutions:**
1. Make sure you removed all spaces from the app password
2. Generate a new app password
3. Copy it exactly as shown (16 characters, no spaces)

**Correct:**
```env
GMAIL_APP_PASSWORD=abcdefghijklmnop
```

**Wrong:**
```env
GMAIL_APP_PASSWORD=abcd efgh ijkl mnop  ❌ (has spaces)
GMAIL_APP_PASSWORD="abcdefghijklmnop"  ❌ (has quotes)
```

### Error: "2FA not enabled"

**Problem:** You need to enable 2-Factor Authentication first

**Solution:**
1. Go to https://myaccount.google.com/security
2. Enable "2-Step Verification"
3. Then create app password

### Error: "Less secure app access"

**Problem:** Old Gmail security setting

**Solution:**
- Don't use "Less secure app access"
- Use App Passwords instead (more secure!)
- App Passwords require 2FA to be enabled

### Email not sending

**Problem:** Configuration issue

**Solutions:**
1. Check `.env` file has correct values
2. Restart server after changing `.env`
3. Check console for error messages
4. Verify your Gmail account is active

### Emails going to spam

**Problem:** Gmail spam filters

**Solutions:**
1. Add your email to contacts
2. Mark first email as "Not Spam"
3. Set up SPF/DKIM records (advanced)

---

## Gmail Sending Limits

### Free Gmail Account
- **500 emails per day**
- **500 recipients per email**
- Perfect for small to medium websites

### Google Workspace
- **2,000 emails per day**
- **2,000 recipients per email**
- Better for larger websites

**Your chatbot usage:**
- ~10-50 conversations per day
- Well within free limits! ✅

---

## Security Best Practices

### ✅ DO:
- Use App Passwords (not your main password)
- Enable 2-Factor Authentication
- Keep app password in `.env` file
- Add `.env` to `.gitignore`
- Use different app passwords for different apps

### ❌ DON'T:
- Share your app password
- Commit `.env` to Git
- Use your main Gmail password
- Disable 2FA
- Use "Less secure app access"

---

## Production Deployment

### Heroku

```bash
heroku config:set GMAIL_USER=productions@tysunmike.us
heroku config:set GMAIL_APP_PASSWORD=your_app_password
heroku config:set MAIL_FROM="Tysun Mike Productions <productions@tysunmike.us>"
```

### Railway

1. Go to your project
2. Click "Variables"
3. Add:
   - `GMAIL_USER` = productions@tysunmike.us
   - `GMAIL_APP_PASSWORD` = your_app_password
   - `MAIL_FROM` = "Tysun Mike Productions <productions@tysunmike.us>"

### Render

1. Go to your web service
2. Click "Environment"
3. Add environment variables

### Vercel

```bash
vercel env add GMAIL_USER
vercel env add GMAIL_APP_PASSWORD
vercel env add MAIL_FROM
```

---

## What Emails Will Be Sent?

Your website will send emails for:

1. **Welcome Emails** - When users sign up
2. **Password Resets** - When users forget password
3. **Project Notifications** - When project status changes
4. **Chatbot Transcripts** - When chat conversations end
5. **Admin Notifications** - Important updates

All emails will come from: **productions@tysunmike.us**

---

## Comparison: Gmail vs SendGrid

| Feature | Gmail | SendGrid |
|---------|-------|----------|
| **Cost** | FREE | FREE (100/day) then paid |
| **Setup** | 5 minutes | 15 minutes |
| **Daily Limit** | 500 emails | 100 emails (free) |
| **Reliability** | Excellent | Excellent |
| **Deliverability** | Very Good | Excellent |
| **Analytics** | Basic | Advanced |
| **Best For** | Small-medium sites | High-volume sites |

**For your use case:** Gmail is perfect! ✅

---

## Advanced: Custom Domain Email

Want to use `hello@tysunmike.us` instead of Gmail?

### Option 1: Google Workspace ($6/month)
1. Sign up: https://workspace.google.com
2. Add your domain
3. Create email: `hello@tysunmike.us`
4. Use same setup as above

### Option 2: Gmail with Alias (FREE)
1. Go to Gmail settings
2. "Accounts and Import"
3. "Send mail as"
4. Add: `hello@tysunmike.us`
5. Verify ownership

---

## Quick Reference

### Get App Password
https://myaccount.google.com/apppasswords

### Enable 2FA
https://myaccount.google.com/security

### File to Edit
`TysunMikePro/.env`

### What to Add
```env
GMAIL_USER=productions@tysunmike.us
GMAIL_APP_PASSWORD=your16charpassword
MAIL_FROM="Tysun Mike Productions <productions@tysunmike.us>"
```

### Install Command
```bash
npm install nodemailer
```

### Test Command
```bash
npm start
```

---

## Summary

**3 Steps to Gmail Email:**

1. **Enable 2FA** → https://myaccount.google.com/security
2. **Create App Password** → https://myaccount.google.com/apppasswords
3. **Add to .env** → `GMAIL_APP_PASSWORD=your_password`

**That's it!** Your website can now send emails via Gmail! 📧✅

---

## Need Help?

**Check:**
- Console output when starting server
- Browser console (F12) for errors
- Gmail account is active
- 2FA is enabled

**Still stuck?**
- Test the chatbot - it can help!
- Or email: productions@tysunmike.us

---

**Gmail email sending is now configured and ready to use!** 🎉

