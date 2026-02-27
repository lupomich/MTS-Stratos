ALTER TABLE users
  ADD COLUMN IF NOT EXISTS is_logged_in BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS active_session_id UUID,
  ADD COLUMN IF NOT EXISTS active_session_at TIMESTAMP WITH TIME ZONE;

UPDATE users
SET is_logged_in = false,
    active_session_id = NULL,
    active_session_at = NULL
WHERE is_logged_in IS DISTINCT FROM false
   OR active_session_id IS NOT NULL
   OR active_session_at IS NOT NULL;
