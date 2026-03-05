-- Migration: add user_workspaces table
-- Date: 2026-03-05

CREATE TABLE IF NOT EXISTS user_workspaces (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL DEFAULT 'Workspace',
    mode VARCHAR(20) NOT NULL DEFAULT 'legacy' CHECK (mode IN ('legacy', 'blank')),
    slots JSONB NOT NULL DEFAULT '[]'::jsonb,
    layout JSONB NOT NULL DEFAULT '{}'::jsonb,
    hidden_slots JSONB NOT NULL DEFAULT '[]'::jsonb,
    sort_order INTEGER NOT NULL DEFAULT 0,
    last_active_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_user_workspaces_user_id ON user_workspaces(user_id);
CREATE INDEX IF NOT EXISTS idx_user_workspaces_sort ON user_workspaces(user_id, sort_order);

CREATE OR REPLACE TRIGGER update_user_workspaces_updated_at
    BEFORE UPDATE ON user_workspaces
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

GRANT ALL PRIVILEGES ON TABLE user_workspaces TO stratos;
