# Google Gemini API Key Setup Guide

## Quick Answer

Add your API key to the `.env` file in your project root:

```
TysunMikePro/
├── .env  ← Add your API key here!
├── server.js
├── Package.json
└── ...
```

---

## Step-by-Step Instructions

### Step 1: Get Your FREE Google Gemini API Key

1. **Go to Google AI Studio:**
   - Visit: https://makersuite.google.com/app/apikey
   - Or: https://aistudio.google.com/app/apikey

2. **Sign in with your Google account**

3. **Click "Create API Key"**
   - Choose "Create API key in new project" (recommended)
   - Or select an existing Google Cloud project

4. **Copy the API key**
   - It will look like: `AIzaSyD...` (39 characters)
   - Keep it safe and don't share it publicly!

### Step 2: Add to Your .env File

1. **Open your project folder:**
   ```
   TysunMikePro/
   ```

2. **Find the `.env` file** in the root directory

3. **Open it in a text editor** (VS Code, Notepad, etc.)

4. **Find this line:**
   ```env
   GEMINI_API_KEY=YOUR_GEMINI_API_KEY_HERE
   ```

5. **Replace with your actual key:**
   ```env
   GEMINI_API_KEY=AIzaSyD1234567890abcdefghijklmnopqrstuvwxyz
   ```

6. **Save the file**

### Step 3: Verify Your .env File

Your `.env` file should now look like this:

```env
Environment variables (.env)

PORT=8080
DATABASE_URL=postgres://USER:PASSWORD@HOST:PORT/DBNAME
JWT_SECRET=change-this-super-secret
SENDGRID_API_KEY=YOUR_SENDGRID_KEY
MAIL_FROM="Tysun Mike Productions <hello@yourdomain.com>"
BASE_URL=https://your-domain.com

# Google Gemini AI Chatbot
GEMINI_API_KEY=AIzaSyD1234567890abcdefghijklmnopqrstuvwxyz  ← Your actual key
ADMIN_EMAIL=productions@tysunmike.us
```

### Step 4: Restart Your Server

If your server is running, restart it to load the new environment variable:

```bash
# Stop the server (Ctrl+C)
# Then start it again:
npm start
```

---

## Testing Your Setup

### Test 1: Check Environment Variable

Add this to your `server.js` temporarily:

```javascript
console.log('Gemini API Key loaded:', process.env.GEMINI_API_KEY ? '✅ Yes' : '❌ No');
```

Restart server and check the console output.

### Test 2: Send a Test Message

1. Start your server: `npm start`
2. Open: http://localhost:5000/
3. Click the chat button (bottom-right)
4. Type: "Hello, are you working?"
5. You should get an AI response!

If it works: ✅ **Success!**

If you get an error, see troubleshooting below.

---

## Troubleshooting

### Error: "API key not found"

**Problem:** The .env file isn't being loaded

**Solutions:**
1. Make sure `.env` is in the project root (same folder as `server.js`)
2. Restart your server completely
3. Check that you have `dotenv` installed:
   ```bash
   npm install dotenv
   ```
4. Verify `server.js` has this at the top:
   ```javascript
   import dotenv from 'dotenv';
   dotenv.config();
   ```

### Error: "Invalid API key"

**Problem:** The API key is incorrect or expired

**Solutions:**
1. Double-check you copied the entire key (no spaces)
2. Generate a new API key from Google AI Studio
3. Make sure there are no quotes around the key in .env:
   ```env
   # ✅ Correct
   GEMINI_API_KEY=AIzaSyD1234567890abcdefghijklmnopqrstuvwxyz
   
   # ❌ Wrong
   GEMINI_API_KEY="AIzaSyD1234567890abcdefghijklmnopqrstuvwxyz"
   ```

### Error: "Rate limit exceeded"

**Problem:** You've exceeded the free tier limit

**Solutions:**
- Free tier: 1,500 requests per day
- Wait 24 hours for reset
- Or upgrade to paid tier (if needed)

### Chatbot button appears but no response

**Problem:** Frontend can't reach backend

**Solutions:**
1. Check that your server is running
2. Open browser console (F12) and look for errors
3. Verify the API URL in your HTML files:
   ```javascript
   window.CHATBOT_API_URL = 'http://localhost:5000/api/chatbot';
   ```

---

## Security Best Practices

### ✅ DO:
- Keep your `.env` file private
- Add `.env` to `.gitignore` (already done)
- Use environment variables in production
- Rotate API keys periodically

### ❌ DON'T:
- Commit `.env` to Git
- Share your API key publicly
- Hardcode API keys in your code
- Use the same key for dev and production

---

## Production Deployment

### For Heroku:

```bash
heroku config:set GEMINI_API_KEY=your_actual_key_here
heroku config:set ADMIN_EMAIL=productions@tysunmike.us
```

### For Railway:

1. Go to your project dashboard
2. Click "Variables"
3. Add:
   - `GEMINI_API_KEY` = your key
   - `ADMIN_EMAIL` = productions@tysunmike.us

### For Render:

1. Go to your web service
2. Click "Environment"
3. Add environment variables:
   - `GEMINI_API_KEY` = your key
   - `ADMIN_EMAIL` = productions@tysunmike.us

### For Vercel:

```bash
vercel env add GEMINI_API_KEY
# Paste your key when prompted

vercel env add ADMIN_EMAIL
# Enter: productions@tysunmike.us
```

---

## Free Tier Limits

**Google Gemini Free Tier:**
- ✅ 1,500 requests per day
- ✅ 60 requests per minute
- ✅ No credit card required
- ✅ Perfect for small to medium websites

**Example Usage:**
- 50 conversations per day = ~100 requests
- Well within free tier!

**If you exceed limits:**
- Upgrade to paid tier (very affordable)
- Or implement rate limiting

---

## Quick Reference

### File Location:
```
TysunMikePro/.env
```

### What to Add:
```env
GEMINI_API_KEY=your_actual_key_here
ADMIN_EMAIL=productions@tysunmike.us
```

### Where to Get Key:
https://makersuite.google.com/app/apikey

### How to Test:
1. Save .env file
2. Restart server
3. Open website
4. Click chat button
5. Send message

---

## Need Help?

### Check These Files:
1. `.env` - API key location
2. `server.js` - Server configuration
3. `/src/routes/chatbot.js` - Chatbot backend
4. Browser console (F12) - Error messages

### Common Issues:
- Server not restarted after adding key
- Typo in API key
- .env file in wrong location
- Missing dotenv package

### Still Stuck?

Test the chatbot itself - it can help you troubleshoot! 😊

Or contact: productions@tysunmike.us

---

## Summary

**3 Simple Steps:**

1. **Get API Key:** https://makersuite.google.com/app/apikey
2. **Add to .env:** `GEMINI_API_KEY=your_key_here`
3. **Restart Server:** `npm start`

**That's it!** Your chatbot will be live and ready to help customers! 🎉

