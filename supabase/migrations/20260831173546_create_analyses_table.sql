/*
# Create analyses table for OrientaSchool

1. New Tables
- `analyses`
  - `id` (uuid, primary key)
  - `name` (text, not null) — user-given name e.g. "Scuole Superiori Mario 2026"
  - `user_id` (uuid, not null, defaults to the authenticated user) — owner of the analysis
  - `data` (jsonb, default '{}') — stores all analysis content (grades, notes, etc.)
  - `created_at` (timestamptz, default now())
  - `updated_at` (timestamptz, default now()) — "Data ultimo salvataggio"
2. Security
- Enable RLS on `analyses`.
- Owner-scoped CRUD: each authenticated user can only access rows they own.
- user_id defaults to auth.uid() so inserts that omit user_id still satisfy the INSERT policy.
3. Indexes
- Index on user_id for fast per-user queries.
4. Notes
- The `data` jsonb column will hold the full analysis payload (subjects, grades, notes).
  This is designed for Prompt 1 which only needs name + timestamps; later prompts
  will populate the jsonb without schema changes.
*/

CREATE TABLE IF NOT EXISTS analyses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  data jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_analyses_user_id ON analyses(user_id);

ALTER TABLE analyses ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_analyses" ON analyses;
CREATE POLICY "select_own_analyses" ON analyses FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_analyses" ON analyses;
CREATE POLICY "insert_own_analyses" ON analyses FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_analyses" ON analyses;
CREATE POLICY "update_own_analyses" ON analyses FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_analyses" ON analyses;
CREATE POLICY "delete_own_analyses" ON analyses FOR DELETE
  TO authenticated USING (auth.uid() = user_id);