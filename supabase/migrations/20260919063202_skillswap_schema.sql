/*
# SkillSwap - Community Skill Exchange Platform

A college final-year project where users share skills and find people to learn from.

## 1. New Tables

- `profiles` - stores user public info (name, bio, location, avatar_url). id = auth.users.id.
- `skills` - master list of skill names (normalized). id, name (unique).
- `user_skills` - links users to skills with a type: 'teach' or 'learn'.
- `exchange_requests` - one user requests a skill swap with another. status: pending/accepted/rejected.
- `messages` - 1-1 messages between two users (only after request accepted).

## 2. Security (RLS)

- profiles: authenticated can read all profiles (needed for explore); insert/update own only.
- skills: authenticated can read all; anyone authenticated can insert new skill names.
- user_skills: authenticated can read all (needed for explore/recommend); insert/update/delete own.
- exchange_requests: read where user is sender or receiver; insert as sender; update status only if receiver.
- messages: read where user is sender or receiver; insert as sender.

All owner columns default to auth.uid() so inserts that omit the owner succeed.
*/

-- PROFILES
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text DEFAULT '',
  bio text DEFAULT '',
  location text DEFAULT '',
  avatar_url text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "profiles_read_all" ON profiles;
CREATE POLICY "profiles_read_all" ON profiles FOR SELECT
  TO authenticated USING (true);

DROP POLICY IF EXISTS "profiles_insert_own" ON profiles;
CREATE POLICY "profiles_insert_own" ON profiles FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "profiles_update_own" ON profiles;
CREATE POLICY "profiles_update_own" ON profiles FOR UPDATE
  TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- SKILLS
CREATE TABLE IF NOT EXISTS skills (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE skills ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "skills_read_all" ON skills;
CREATE POLICY "skills_read_all" ON skills FOR SELECT
  TO authenticated USING (true);

DROP POLICY IF EXISTS "skills_insert_any" ON skills;
CREATE POLICY "skills_insert_any" ON skills FOR INSERT
  TO authenticated WITH CHECK (true);

-- USER_SKILLS
CREATE TABLE IF NOT EXISTS user_skills (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES profiles(id) ON DELETE CASCADE,
  skill_id uuid NOT NULL REFERENCES skills(id) ON DELETE CASCADE,
  type text NOT NULL CHECK (type IN ('teach','learn')),
  created_at timestamptz DEFAULT now(),
  UNIQUE (user_id, skill_id, type)
);

ALTER TABLE user_skills ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "user_skills_read_all" ON user_skills;
CREATE POLICY "user_skills_read_all" ON user_skills FOR SELECT
  TO authenticated USING (true);

DROP POLICY IF EXISTS "user_skills_insert_own" ON user_skills;
CREATE POLICY "user_skills_insert_own" ON user_skills FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "user_skills_update_own" ON user_skills;
CREATE POLICY "user_skills_update_own" ON user_skills FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "user_skills_delete_own" ON user_skills;
CREATE POLICY "user_skills_delete_own" ON user_skills FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- EXCHANGE_REQUESTS
CREATE TABLE IF NOT EXISTS exchange_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id uuid NOT NULL DEFAULT auth.uid() REFERENCES profiles(id) ON DELETE CASCADE,
  receiver_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  message text DEFAULT '',
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','accepted','rejected')),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE exchange_requests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "requests_read_parties" ON exchange_requests;
CREATE POLICY "requests_read_parties" ON exchange_requests FOR SELECT
  TO authenticated USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

DROP POLICY IF EXISTS "requests_insert_sender" ON exchange_requests;
CREATE POLICY "requests_insert_sender" ON exchange_requests FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = sender_id);

DROP POLICY IF EXISTS "requests_update_receiver" ON exchange_requests;
CREATE POLICY "requests_update_receiver" ON exchange_requests FOR UPDATE
  TO authenticated USING (auth.uid() = receiver_id) WITH CHECK (auth.uid() = receiver_id OR auth.uid() = sender_id);

-- MESSAGES
CREATE TABLE IF NOT EXISTS messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id uuid NOT NULL DEFAULT auth.uid() REFERENCES profiles(id) ON DELETE CASCADE,
  receiver_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  content text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "messages_read_parties" ON messages;
CREATE POLICY "messages_read_parties" ON messages FOR SELECT
  TO authenticated USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

DROP POLICY IF EXISTS "messages_insert_sender" ON messages;
CREATE POLICY "messages_insert_sender" ON messages FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = sender_id);

-- INDEXES
CREATE INDEX IF NOT EXISTS idx_user_skills_user ON user_skills(user_id);
CREATE INDEX IF NOT EXISTS idx_user_skills_type ON user_skills(type);
CREATE INDEX IF NOT EXISTS idx_exchange_requests_receiver ON exchange_requests(receiver_id);
CREATE INDEX IF NOT EXISTS idx_exchange_requests_sender ON exchange_requests(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_receiver ON messages(receiver_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender ON messages(sender_id);
