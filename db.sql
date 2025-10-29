-- Users
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  name TEXT,
  avatar_url TEXT,
  is_admin BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Packages
CREATE TYPE package_t AS ENUM ('basic', 'pro', 'master');
-- Projects
CREATE TABLE projects (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  title TEXT NOT NULL,
  package package_t NOT NULL,
  status TEXT NOT NULL DEFAULT 'intake', -- intake, mixing, mastering, revisions, delivered
  eta TIMESTAMP, -- calculated based on package and size
  size TEXT DEFAULT 'normal', -- normal, large
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Payments
CREATE TABLE payments (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  project_id INTEGER REFERENCES projects(id),
  amount_cents INTEGER NOT NULL,
  currency TEXT DEFAULT 'USD',
  status TEXT NOT NULL, -- paid, pending, refunded
  created_at TIMESTAMP DEFAULT NOW()
);

-- Consultations
CREATE TABLE consultations (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  project_id INTEGER REFERENCES projects(id),
  start_at TIMESTAMP NOT NULL,
  medium TEXT DEFAULT 'video', -- phone, video
  created_at TIMESTAMP DEFAULT NOW()
);

-- Referrals
CREATE TABLE referrals (
  id SERIAL PRIMARY KEY,
  referrer_id INTEGER REFERENCES users(id),
  referred_email TEXT NOT NULL,
  referred_user_id INTEGER REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Referral fulfillment (track referred user activity)
CREATE TABLE referral_activity (
  id SERIAL PRIMARY KEY,
  referral_id INTEGER REFERENCES referrals(id),
  referred_projects_completed INTEGER DEFAULT 0,
  last_project_completed_at TIMESTAMP
);

-- Loyalty counters (fast checks)
CREATE TABLE loyalty (
  user_id INTEGER PRIMARY KEY REFERENCES users(id),
  mixes_completed INTEGER DEFAULT 0,
  last_referral_window_start TIMESTAMP DEFAULT NOW()
);

-- Email queue (optional)
CREATE TABLE email_queue (
  id SERIAL PRIMARY KEY,
  to_email TEXT NOT NULL,
  subject TEXT NOT NULL,
  body TEXT NOT NULL,
  sent BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);

