# Deployment Guide - TysunMikePro

This guide provides step-by-step instructions for deploying the TysunMikePro application to production.

## Prerequisites

Before deploying, ensure you have:
- A PostgreSQL database (version 12 or higher)
- A SendGrid account with API key
- A domain name (optional but recommended)
- Node.js hosting service account

## Step 1: Database Setup

### Create PostgreSQL Database

**Option A: Using Heroku Postgres**
```bash
heroku addons:create heroku-postgresql:mini
heroku pg:psql < db.sql
```

**Option B: Using Railway**
```bash
# Create database through Railway dashboard
# Copy connection string
psql "your-connection-string" < db.sql
```

**Option C: Using Supabase**
```bash
# Create project in Supabase dashboard
# Use SQL editor to run db.sql contents
```

### Verify Database Schema

Connect to your database and verify tables were created:
```sql
\dt  -- List all tables
-- Should show: users, projects, payments, consultations, referrals, referral_activity, loyalty, email_queue
```

## Step 2: Environment Configuration

### Create Production Environment File

Copy the example environment file:
```bash
cp .env.example .env
```

### Configure Environment Variables

Edit `.env` with your production values:

```env
# Server Configuration
PORT=8080

# Database - Use your production PostgreSQL URL
DATABASE_URL=postgres://username:password@host:port/database?ssl=true

# Authentication - Generate a secure random string
JWT_SECRET=your-super-secure-random-string-minimum-32-characters

# Email - Your SendGrid credentials
SENDGRID_API_KEY=SG.your-sendgrid-api-key
MAIL_FROM="Tysun Mike Productions <noreply@yourdomain.com>"

# Application - Your production domain
BASE_URL=https://yourdomain.com
```

### Generate Secure JWT Secret

Use one of these methods to generate a secure JWT secret:

**Method 1: Using Node.js**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

**Method 2: Using OpenSSL**
```bash
openssl rand -hex 32
```

## Step 3: Deploy to Hosting Platform

### Option A: Deploy to Heroku

1. **Install Heroku CLI**
```bash
npm install -g heroku
heroku login
```

2. **Create Heroku App**
```bash
heroku create your-app-name
```

3. **Add PostgreSQL**
```bash
heroku addons:create heroku-postgresql:mini
```

4. **Set Environment Variables**
```bash
heroku config:set JWT_SECRET="your-jwt-secret"
heroku config:set SENDGRID_API_KEY="your-sendgrid-key"
heroku config:set MAIL_FROM="Tysun Mike Productions <noreply@yourdomain.com>"
heroku config:set BASE_URL="https://your-app-name.herokuapp.com"
```

5. **Deploy**
```bash
git push heroku main
```

6. **Initialize Database**
```bash
heroku pg:psql < db.sql
```

7. **Open Application**
```bash
heroku open
```

### Option B: Deploy to Railway

1. **Install Railway CLI**
```bash
npm install -g @railway/cli
railway login
```

2. **Initialize Project**
```bash
railway init
```

3. **Add PostgreSQL**
```bash
railway add postgresql
```

4. **Set Environment Variables**
```bash
railway variables set JWT_SECRET="your-jwt-secret"
railway variables set SENDGRID_API_KEY="your-sendgrid-key"
railway variables set MAIL_FROM="Tysun Mike Productions <noreply@yourdomain.com>"
```

5. **Deploy**
```bash
railway up
```

### Option C: Deploy to Render

1. **Create New Web Service** in Render dashboard

2. **Connect GitHub Repository**

3. **Configure Build Settings**
   - Build Command: `npm install`
   - Start Command: `npm start`

4. **Add Environment Variables** in dashboard:
   - `DATABASE_URL`
   - `JWT_SECRET`
   - `SENDGRID_API_KEY`
   - `MAIL_FROM`
   - `BASE_URL`

5. **Deploy** - Render will automatically deploy

## Step 4: Post-Deployment Configuration

### Create Admin User

Connect to your database and create an admin user:

```sql
-- First, sign up through the website, then run:
UPDATE users SET is_admin = true WHERE email = 'your-admin-email@example.com';
```

### Test Email Functionality

Send a test email to verify SendGrid configuration:

```bash
curl -X POST https://yourdomain.com/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"testpass123","name":"Test User"}'
```

Check that the welcome email was received.

### Verify All Routes

Test these critical endpoints:
- `GET /` - Homepage loads
- `GET /login` - Login page loads
- `GET /signup` - Signup page loads
- `POST /api/auth/signup` - User registration works
- `POST /api/auth/login` - User login works
- `GET /dashboard` - Dashboard loads (after login)

## Step 5: Domain Configuration

### Add Custom Domain

**Heroku:**
```bash
heroku domains:add yourdomain.com
heroku domains:add www.yourdomain.com
```

**Railway/Render:**
- Add custom domain through dashboard
- Follow DNS configuration instructions

### Configure DNS

Add these DNS records at your domain registrar:

```
Type    Name    Value
CNAME   www     your-app-name.herokuapp.com (or platform-specific)
ALIAS   @       your-app-name.herokuapp.com (or platform-specific)
```

### Enable SSL/HTTPS

Most platforms (Heroku, Railway, Render) provide automatic SSL certificates. Verify HTTPS is working:

```bash
curl -I https://yourdomain.com
```

## Step 6: Monitoring & Maintenance

### Set Up Logging

**Heroku:**
```bash
heroku logs --tail
```

**Railway/Render:**
- View logs in dashboard

### Monitor Database

Check database size and performance:
```bash
heroku pg:info  # For Heroku
```

### Backup Strategy

**Automated Backups (Heroku):**
```bash
heroku pg:backups:schedule DATABASE_URL --at '02:00 America/Los_Angeles'
```

**Manual Backup:**
```bash
pg_dump "your-database-url" > backup-$(date +%Y%m%d).sql
```

## Step 7: Security Checklist

Before going live, verify:

- [ ] `.env` file is NOT committed to Git
- [ ] JWT_SECRET is strong (32+ characters)
- [ ] Database uses SSL connection
- [ ] HTTPS is enabled on domain
- [ ] CORS is configured for production domain
- [ ] SendGrid API key is valid
- [ ] Admin user is created
- [ ] Test all authentication flows
- [ ] Verify input validation is working
- [ ] Check error pages display correctly

## Troubleshooting

### Database Connection Issues

**Error**: "Connection refused" or "Database does not exist"

**Solution**:
1. Verify DATABASE_URL is correct
2. Ensure database allows connections from your hosting platform
3. Check if SSL is required: add `?ssl=true` to connection string

### Email Not Sending

**Error**: Emails not being received

**Solution**:
1. Verify SENDGRID_API_KEY is valid
2. Check SendGrid dashboard for sending errors
3. Verify sender email is verified in SendGrid
4. Check spam folder

### Authentication Errors

**Error**: "Invalid token" or "Unauthorized"

**Solution**:
1. Clear browser localStorage
2. Verify JWT_SECRET is set correctly
3. Check token expiration settings
4. Ensure BASE_URL matches your domain

### Application Not Starting

**Error**: Application crashes on startup

**Solution**:
1. Check logs for specific error
2. Verify all environment variables are set
3. Ensure database is accessible
4. Check Node.js version compatibility

## Scaling Considerations

### Database Scaling

When you reach 10,000+ users:
- Upgrade to larger database plan
- Add database indexes for performance
- Consider read replicas

### Application Scaling

For high traffic:
- Enable horizontal scaling (multiple dynos/instances)
- Add caching layer (Redis)
- Implement CDN for static assets

## Maintenance Schedule

**Daily:**
- Monitor error logs
- Check email delivery status

**Weekly:**
- Review database backups
- Check application performance metrics

**Monthly:**
- Update dependencies
- Review security patches
- Analyze user growth and usage patterns

## Support

For deployment issues or questions:
- Check application logs first
- Review this deployment guide
- Contact hosting platform support
- Consult README.md for additional information

---

**Last Updated**: October 16, 2025  
**Version**: 1.0

