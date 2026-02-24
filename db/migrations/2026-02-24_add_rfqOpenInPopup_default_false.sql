-- Migration: Ensure rfqOpenInPopup exists in ui_settings with default false
-- Date: 2026-02-24
-- Idempotent: yes

UPDATE user_preferences
SET preference_value = jsonb_set(
    CASE
        WHEN jsonb_typeof(preference_value) = 'object' THEN preference_value
        ELSE '{}'::jsonb
    END,
    '{rfqOpenInPopup}',
    COALESCE(
        CASE
            WHEN jsonb_typeof(preference_value->'rfqOpenInPopup') = 'boolean'
                THEN preference_value->'rfqOpenInPopup'
        END,
        'false'::jsonb
    ),
    true
)
WHERE preference_key = 'ui_settings';
