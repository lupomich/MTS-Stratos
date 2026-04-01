---
name: Stratos UI Guidelines
description: Use this skill when creating or amending UI screens, components, or rapid prototypes in MTS-Stratos. Enforces Euronext Stratos design rules for colors, typography, layout, icons, badges, buttons, logos, and accessibility.
---

# Stratos UI Guidelines Skill

## Purpose

Apply Euronext Stratos design rules to every UI/prototype output in this workspace so visual decisions stay consistent with the official documentation.

This skill is mandatory for:
- New UI pages, widgets, and components.
- Any UI prototype iteration requested by BA/Proxy Product Owner.
- Restyling/refactoring of existing UI visuals.

## Source of Truth

Always align with these workspace files:
- Stratos-Layout-Markdown/stratos-colors.md
- Stratos-Layout-Markdown/stratos-typography.md
- Stratos-Layout-Markdown/stratos-layout.md
- Stratos-Layout-Markdown/stratos-icons.md
- Stratos-Layout-Markdown/stratos-buttons.md
- Stratos-Layout-Markdown/stratos-badges.md
- Stratos-Layout-Markdown/stratos-logos.md
- Stratos-Layout-Markdown/mts-bondvision-logo.svg
- Stratos Design system/ (official assets)
- Stratos Icons/ (official icon files)

If design specs conflict, follow this priority:
1. Explicit token/value definitions in Stratos markdown files.
2. Official SVG/assets in Stratos Design system and Stratos Icons.
3. Existing approved UI patterns already present in MTS-Stratos.

## Non-Negotiable Rules

1. Do not invent colors, icon styles, spacing systems, or logo variants outside Stratos docs.
2. Do not hardcode arbitrary hex values if a Stratos token exists.
3. Do not replace IBM Plex typography with generic font stacks.
4. Do not use non-Stratos icon packs when a matching Stratos icon exists.
5. Do not distort logos (no skew, stretch, rotation, unofficial recolor).
6. Preserve current functional behavior unless explicitly requested by the user.

## Color Rules

Use Stratos tokens and semantic intent.

Core tokens:
- Primary: Teal-40 (#008D7F)
- Primary dark: Teal-50 (#006865)
- Text primary: Grey-60 (#27272D)
- Text secondary: Grey-50 (#54545C)
- Divider/border: Grey-30 (#CACACE)
- Background subtle: Grey-10 (#F2F2F3)
- Background white: White (#FFFFFF)

Semantic tokens:
- Success: Spring Green-20 (#79D100)
- Info: Blue-30 (#41B6E6)
- Error: Red-40 (#CF1D43)
- Warning: Orange-40 (#E26310)

Accessibility:
- Maintain at least WCAG AA contrast.
- Prefer documented neutral scale for text/background combinations.

## Typography Rules

Font families:
- Headings: IBM Plex Serif
- Body/UI text: IBM Plex Sans

Weights:
- Regular 400
- Medium 500
- Bold 700

Sizing:
- Desktop and mobile typography must follow the scale in stratos-typography.md.
- Do not introduce ad-hoc text sizes when an existing size tier fits.

## Layout and Spacing Rules

Grid and breakpoints:
- Use Stratos responsive layout model from stratos-layout.md.
- Keep 12-column behavior for desktop layouts.
- Respect documented breakpoints and sidebar/header dimensions.

Spacing:
- Use the defined spacing steps (4, 8, 12, 16, 24, 32, 48, 64, 128) as appropriate.
- Keep container sizing aligned with documented container types (full-width, fixed-width, content, compact).

## Icons Rules

Use icons from Stratos Icons and documented categories.

Sizing defaults:
- XS 16, S 20, M 24 (default), L 32, XL 40.

Color defaults:
- Default icon color: Grey-60.
- Use semantic/primary icon colors only when meaning requires it.

Accessibility:
- Decorative icons: aria-hidden.
- Action-only icons: include accessible label.

## Buttons Rules

Allowed button types:
- Primary (Teal background, white text)
- Secondary (light neutral background with border)
- Tertiary (transparent with Teal border/text)

Allowed sizes:
- L 48px, M 40px, S 32px, XS 24px.

States:
- Implement visible default, hover, active, focus, disabled.
- Keep focus visible and keyboard-accessible.

## Badges Rules

Use documented badge variants only:
- Label + icon
- Icon-only
- Collapsible badge

Status-color mapping must follow Stratos status semantics (draft, ongoing, completed, failed, etc.).
Do not use custom badge colors outside the documented palette.

## Logos Rules

Use official assets only.

Requirements:
- Minimum clear space: 20px around logo.
- Minimum practical size respected per specification.
- Keep proportions and approved placements.
- Use monochrome variants only where documented/required.

## Implementation Workflow

For each UI/prototype task:
1. Identify affected components/screens.
2. Map each visual decision to Stratos tokens/components.
3. Implement with reusable variables/classes first.
4. Verify responsive behavior and accessibility.
5. Report what was applied and any open design questions.

## Required Output Format For This Skill

When this skill is applied, return:

1. Stratos Mapping:
- Colors used (token + hex)
- Typography styles used
- Layout/grid choices
- Icons/buttons/badges/logo rules applied

2. Compliance Check:
- Confirm what is compliant
- List any intentional deviation and why

3. Validation:
- Contrast/accessibility checks performed
- Responsive checks performed

## Quick Acceptance Checklist

- Only Stratos palette/tokens used.
- IBM Plex typography used correctly.
- Layout and spacing align with Stratos specs.
- Icons are from Stratos sets and properly sized.
- Button variants/states follow Stratos rules.
- Badge variant and status color are compliant.
- Logos use official assets with clear space.
- Accessibility and responsiveness verified.
