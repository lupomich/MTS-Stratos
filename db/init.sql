-- MTS-Stratos Database Schema
-- PostgreSQL Initialization Script

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) DEFAULT 'viewer' CHECK (role IN ('admin', 'trader', 'viewer')),
    is_active BOOLEAN DEFAULT true,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP WITH TIME ZONE
);

-- User preferences table
CREATE TABLE IF NOT EXISTS user_preferences (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    preference_key VARCHAR(100) NOT NULL,
    preference_value JSONB NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, preference_key)
);

-- Sessions table (for token blacklisting and tracking)
CREATE TABLE IF NOT EXISTS user_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_hash VARCHAR(255) NOT NULL,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    is_active BOOLEAN DEFAULT true
);

-- Audit log table
CREATE TABLE IF NOT EXISTS audit_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(50) NOT NULL,
    entity_type VARCHAR(50),
    entity_id UUID,
    details JSONB,
    ip_address VARCHAR(45),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_active ON users(is_active);
CREATE INDEX idx_preferences_user_id ON user_preferences(user_id);
CREATE INDEX idx_preferences_key ON user_preferences(preference_key);
CREATE INDEX idx_sessions_user_id ON user_sessions(user_id);
CREATE INDEX idx_sessions_active ON user_sessions(is_active);
CREATE INDEX idx_sessions_expires ON user_sessions(expires_at);
CREATE INDEX idx_audit_user_id ON audit_log(user_id);
CREATE INDEX idx_audit_created ON audit_log(created_at);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_preferences_updated_at BEFORE UPDATE ON user_preferences
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert default admin user (password: admin123 - CHANGE IN PRODUCTION!)
-- Password hash is bcryptjs of 'admin123' with salt rounds 10
INSERT INTO users (username, email, password_hash, role) 
VALUES (
    'admin',
    'admin@stratos.local',
    '$2a$10$E6H4Pr8w4EN1cGh6tNAQ.e3.x8AAviATEzEsa4YzPTNJvO9mEJ/7K',
    'admin'
) ON CONFLICT (username) DO NOTHING;

-- Insert default regular user (password: user123)
INSERT INTO users (username, email, password_hash, role) 
VALUES (
    'demo',
    'demo@stratos.local',
    '$2a$10$42W40aPzYA0oiko.SBWj.uO9aM0PAmZP51VaLH/iP9mCEiTb.LuwK',
    'trader'
) ON CONFLICT (username) DO NOTHING;

-- Insert default preferences for admin
INSERT INTO user_preferences (user_id, preference_key, preference_value)
SELECT 
    id,
    'ui_settings',
    '{"theme": "dark", "language": "en", "defaultColumns": ["isin", "description", "price", "yield", "maturity"], "lastTab": "government-bonds", "gridLayout": "comfortable", "rfqOpenInPopup": false}'::jsonb
FROM users WHERE username = 'admin'
ON CONFLICT (user_id, preference_key) DO NOTHING;

-- Insert default preferences for demo user
INSERT INTO user_preferences (user_id, preference_key, preference_value)
SELECT 
    id,
    'ui_settings',
    '{"theme": "light", "language": "it", "defaultColumns": ["isin", "description", "price"], "lastTab": "corporate-bonds", "gridLayout": "compact", "rfqOpenInPopup": false}'::jsonb
FROM users WHERE username = 'demo'
ON CONFLICT (user_id, preference_key) DO NOTHING;

-- Backfill rfqOpenInPopup default for existing ui_settings rows that miss the key
UPDATE user_preferences
SET preference_value = jsonb_set(preference_value, '{rfqOpenInPopup}', 'false'::jsonb, true)
WHERE preference_key = 'ui_settings'
  AND NOT (preference_value ? 'rfqOpenInPopup');

-- Grant permissions
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO stratos;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO stratos;

-- Success message
DO $$
BEGIN
    RAISE NOTICE 'MTS-Stratos database initialized successfully!';
    RAISE NOTICE 'Default users created:';
    RAISE NOTICE '  - admin / admin123 (Admin role)';
    RAISE NOTICE '  - demo / user123 (Trader role)';
    RAISE NOTICE 'REMEMBER: Change passwords in production!';
END $$;
