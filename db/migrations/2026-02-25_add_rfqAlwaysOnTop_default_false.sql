-- Migration: Ensure rfqAlwaysOnTop exists in ui_settings with default false
-- Date: 2026-02-25
-- Idempotent: yes

UPDATE user_preferences
SET preference_value = jsonb_set(
    CASE
        WHEN jsonb_typeof(preference_value) = 'object' THEN preference_value
        ELSE '{}'::jsonb
    END,
    '{rfqAlwaysOnTop}',
    COALESCE(
        CASE
            WHEN jsonb_typeof(preference_value->'rfqAlwaysOnTop') = 'boolean'
                THEN preference_value->'rfqAlwaysOnTop'
        END,
        'false'::jsonb
    ),
    true
)
WHERE preference_key = 'ui_settings';
