# Tysun Mike Productions - Client Portal

A professional web application for managing audio engineering services including mixing, mastering, logo design, album art, and website building.

## Features

### For Clients
- **User Authentication** - Secure signup and login with JWT
- **Project Management** - Track mixing/mastering projects with real-time status updates
- **Package Selection** - Choose from Basic, Pro, or Master packages
- **Loyalty Program** - Earn free mastering after 9 completed mixes
- **Payment Tracking** - View payment history and transaction status
- **Consultation Scheduling** - Book video or phone consultations
- **Referral System** - Refer friends and earn rewards

### For Administrators
- **Admin Dashboard** - Manage users, projects, and payments
- **Project Status Updates** - Advance projects through workflow stages
- **Email Notifications** - Automated emails for key project milestones
- **Analytics** - Track user activity and project completion

## Technology Stack

- **Backend**: Node.js, Express.js
- **Database**: PostgreSQL
- **Authentication**: JWT with bcrypt password hashing
- **Email**: SendGrid
- **Security**: Helmet.js, CORS
- **Frontend**: Vanilla JavaScript, HTML5, CSS3

## Installation

### Prerequisites
- Node.js (v16 or higher)
- PostgreSQL (v12 or higher)
- SendGrid account for email notifications

### Setup Instructions

1. **Clone the repository**
   ```bash
   git clone https://github.com/TysunM/TysunMikePro.git
   cd TysunMikePro
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and update with your credentials:
   - `DATABASE_URL`: Your PostgreSQL connection string
   - `JWT_SECRET`: A secure random string for JWT signing
   - `SENDGRID_API_KEY`: Your SendGrid API key
   - `MAIL_FROM`: Your sender email address
   - `BASE_URL`: Your application URL

4. **Set up the database**
   ```bash
   psql -U your_username -d your_database -f db.sql
   ```

5. **Start the server**
   ```bash
   npm start
   ```

6. **Access the application**
   - Homepage: `http://localhost:8080`
   - Login: `http://localhost:8080/login`
   - Signup: `http://localhost:8080/signup`

## Project Structure

```
TysunMikePro/
├── public/              # Static assets
│   ├── css/            # Stylesheets
│   └── js/             # Client-side JavaScript
├── src/                # Server-side code
│   ├── routes/         # API route handlers
│   ├── middleware/     # Authentication & authorization
│   ├── utils/          # Utility functions
│   ├── auth.js         # Authentication logic
│   ├── config.js       # Configuration management
│   ├── db.js           # Database connection
│   └── mail.js         # Email service
├── views/              # HTML templates
├── db.sql              # Database schema
├── server.js           # Application entry point
└── Package.json        # Dependencies and scripts
```

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Create new user account
- `POST /api/auth/login` - Authenticate user and receive JWT

### Users
- `GET /api/users/me` - Get current user profile and dashboard data

### Projects
- `POST /api/projects` - Create new project
- `GET /api/projects` - List user's projects
- `POST /api/projects/:id/advance` - Update project status

### Referrals
- `POST /api/referrals` - Create referral
- `GET /api/referrals` - List user's referrals

### Admin
- `GET /api/admin/users` - List all users (admin only)
- `GET /api/admin/projects` - List all projects (admin only)

## Service Packages

### Basic Mix - $150
- Professional mixing
- Up to 10 tracks
- 2 revisions included
- 3-day turnaround
- WAV & MP3 delivery

### Pro Mix + Master - $300
- Professional mixing & mastering
- Up to 20 tracks
- 3 revisions included
- 5-day turnaround
- All formats delivery
- Stems included

### Full Master - $500
- Complete mixing & mastering
- Unlimited tracks
- Unlimited revisions
- 7-day turnaround
- All formats + stems
- Free consultation call
- Priority support
- Album art design option

## Loyalty Program

Clients earn loyalty points for each completed mix:
- Complete 9 mixes → Get 1 free Mastered Master package
- Progress tracked automatically in user dashboard
- Visual progress bar shows current status

## Security Features

- Password hashing with bcrypt
- JWT-based authentication
- CORS protection
- Helmet.js security headers
- SQL injection prevention with parameterized queries
- Input validation on all forms

## Deployment

### Production Checklist
- [ ] Set strong `JWT_SECRET` in production
- [ ] Configure production database with SSL
- [ ] Set up HTTPS/SSL certificates
- [ ] Configure SendGrid for production email
- [ ] Set `NODE_ENV=production`
- [ ] Enable database backups
- [ ] Set up monitoring and logging
- [ ] Configure rate limiting
- [ ] Review CORS settings

### Recommended Hosting
- **Backend**: Heroku, Railway, Render, DigitalOcean
- **Database**: Heroku Postgres, Supabase, Railway
- **Domain**: Namecheap, Google Domains

## Contributing

This is a private project for Tysun Mike Productions. For inquiries, please contact the owner.

## License

See LICENSE file for details.

## Support

For technical support or questions, please contact Tysun Mike Productions.

---

**Tysun Mike Productions** - Professional Audio Engineering & Creative Services

