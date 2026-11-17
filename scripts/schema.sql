-- ==============================================================================
-- MLSC Portal - New Relational Database Architecture (PostgreSQL / Supabase)
-- Created without ORM - Pure SQL DDL
-- Run this script in your Supabase SQL Editor or any PostgreSQL instance (Neon / Local Docker)
-- ==============================================================================

-- Enable UUID extension if available
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ------------------------------------------------------------------------------
-- 1. USERS TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
    email TEXT UNIQUE NOT NULL,
    username TEXT UNIQUE NOT NULL,
    display_name TEXT,
    photo_url TEXT,
    role TEXT DEFAULT 'user', -- 'user', 'member', 'lead', 'admin', 'super_admin'
    bio TEXT DEFAULT '',
    email_notifications BOOLEAN DEFAULT TRUE,
    disabled BOOLEAN DEFAULT FALSE,
    followers_count INTEGER DEFAULT 0,
    following_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);

-- ------------------------------------------------------------------------------
-- 2. APPLICATIONS TABLE (Hiring Portal)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS applications (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    branch TEXT,
    year TEXT,
    technical_domain TEXT,
    non_technical_domain TEXT,
    resume_url TEXT,
    github_url TEXT,
    linkedin_url TEXT,
    portfolio_url TEXT,
    status TEXT DEFAULT 'pending', -- 'pending', 'shortlisted', 'interviewed', 'hired', 'rejected'
    score NUMERIC DEFAULT 0,
    notes TEXT,
    is_archived BOOLEAN DEFAULT FALSE,
    attended BOOLEAN DEFAULT FALSE,
    feedback TEXT,
    applied_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_applications_email ON applications(email);
CREATE INDEX IF NOT EXISTS idx_applications_status ON applications(status);
CREATE INDEX IF NOT EXISTS idx_applications_technical_domain ON applications(technical_domain);
CREATE INDEX IF NOT EXISTS idx_applications_non_tech_domain ON applications(non_technical_domain);

-- ------------------------------------------------------------------------------
-- 3. EVENTS TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS events (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
    title TEXT NOT NULL,
    description TEXT,
    event_date TIMESTAMPTZ,
    end_date TIMESTAMPTZ,
    location TEXT,
    mode TEXT DEFAULT 'offline', -- 'offline', 'online', 'hybrid'
    banner_image TEXT,
    list_image TEXT,
    highlight_images JSONB DEFAULT '[]'::JSONB,
    speakers JSONB DEFAULT '[]'::JSONB,
    seat_limits INTEGER DEFAULT 0,
    is_featured BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_events_date ON events(event_date DESC);

-- ------------------------------------------------------------------------------
-- 4. EVENT REGISTRATIONS TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS event_registrations (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
    event_id TEXT NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    user_id TEXT,
    user_email TEXT NOT NULL,
    user_name TEXT NOT NULL,
    phone TEXT,
    roll_number TEXT,
    attended BOOLEAN DEFAULT FALSE,
    registered_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(event_id, user_email)
);

CREATE INDEX IF NOT EXISTS idx_event_reg_event_id ON event_registrations(event_id);

-- ------------------------------------------------------------------------------
-- 5. TEAM CATEGORIES & TEAM MEMBERS
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS team_categories (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
    name TEXT NOT NULL,
    description TEXT,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS team_members (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    role TEXT NOT NULL,
    category_id TEXT REFERENCES team_categories(id) ON DELETE SET NULL,
    image_url TEXT,
    linkedin_url TEXT,
    github_url TEXT,
    twitter_url TEXT,
    status TEXT DEFAULT 'active', -- 'active', 'pending', 'alumni'
    onboarding_token TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 6. HOME PAGE CONTENT MANAGERS (Hero, Gallery, Chapters, Ambassadors)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS home_hero (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
    title TEXT NOT NULL,
    subtitle TEXT,
    cta_text TEXT,
    cta_link TEXT,
    background_image TEXT,
    display_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS home_gallery (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
    title TEXT,
    caption TEXT,
    image_url TEXT NOT NULL,
    category TEXT DEFAULT 'general',
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS home_chapters (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
    name TEXT NOT NULL,
    description TEXT,
    lead_name TEXT,
    lead_image TEXT,
    link TEXT,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS home_ambassadors (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
    name TEXT NOT NULL,
    role TEXT,
    college TEXT,
    image_url TEXT,
    linkedin_url TEXT,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 7. COMMUNITY POSTS & COMMENTS
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS community_posts (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
    author_id TEXT NOT NULL,
    author_name TEXT NOT NULL,
    author_avatar TEXT,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    tags JSONB DEFAULT '[]'::JSONB,
    likes_count INTEGER DEFAULT 0,
    comments_count INTEGER DEFAULT 0,
    is_pinned BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS community_comments (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
    post_id TEXT NOT NULL REFERENCES community_posts(id) ON DELETE CASCADE,
    author_id TEXT NOT NULL,
    author_name TEXT NOT NULL,
    author_avatar TEXT,
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 8. SYSTEM LOGS, NOTIFICATIONS & BUG REPORTS
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS notifications (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
    user_id TEXT NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    link TEXT,
    is_read BOOLEAN DEFAULT FALSE,
    notification_type TEXT DEFAULT 'info',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS bug_reports (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    screenshot_url TEXT,
    severity TEXT DEFAULT 'normal', -- 'low', 'normal', 'high', 'critical'
    status TEXT DEFAULT 'open',     -- 'open', 'in_progress', 'resolved', 'closed'
    reporter_email TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS system_logs (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
    level TEXT DEFAULT 'info', -- 'info', 'warn', 'error'
    message TEXT NOT NULL,
    details JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
