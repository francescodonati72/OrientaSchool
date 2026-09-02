/*
# Create parameters table for OrientaSchool

1. New Tables
- `parameters`
  - `id` (uuid, primary key)
  - `user_id` (uuid, not null, defaults to the authenticated user) — owner
  - `title` (text, not null) — parameter title e.g. "La mia passione"
  - `description` (text, not null) — parameter description/question text
  - `sort_order` (integer, not null, default 0) — ordering for drag-and-drop
  - `is_default` (boolean, default true) — whether this is one of the 17 defaults
  - `created_at` (timestamptz, default now())
2. Security
- Enable RLS on `parameters`.
- Owner-scoped CRUD: each authenticated user can only access rows they own.
- user_id defaults to auth.uid() so inserts that omit user_id still satisfy the INSERT policy.
3. Indexes
- Index on user_id for fast per-user queries.
4. Notes
- The 17 default parameters are seeded per-user when they first need them
  (the frontend handles this by checking if any parameters exist for the user
  and inserting defaults if not).
- Users can add custom parameters (is_default=false) which appear in all
  future analyses.
- Drag-and-drop reordering updates sort_order.
*/

CREATE TABLE IF NOT EXISTS parameters (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text NOT NULL,
  sort_order integer NOT NULL DEFAULT 0,
  is_default boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_parameters_user_id ON parameters(user_id);

ALTER TABLE parameters ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_parameters" ON parameters;
CREATE POLICY "select_own_parameters" ON parameters FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_parameters" ON parameters;
CREATE POLICY "insert_own_parameters" ON parameters FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_parameters" ON parameters;
CREATE POLICY "update_own_parameters" ON parameters FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_parameters" ON parameters;
CREATE POLICY "delete_own_parameters" ON parameters FOR DELETE
  TO authenticated USING (auth.uid() = user_id);