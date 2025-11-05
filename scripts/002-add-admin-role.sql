-- Add admin role to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT FALSE;

-- Create index for faster admin checks
CREATE INDEX IF NOT EXISTS idx_users_is_admin ON users(is_admin) WHERE is_admin = TRUE;

-- Set your email as admin (replace with your actual email)
-- UPDATE users SET is_admin = TRUE WHERE email = 'your-email@example.com';
