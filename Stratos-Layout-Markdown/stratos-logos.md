# Euronext Stratos – Logo Specifications

## Overview
The Euronext Stratos Design System includes comprehensive logo guidelines to ensure consistent brand representation across all applications. Logos define the primary brand identity and must be applied according to specific rules and clear space requirements.

## Primary Logo: Euronext Colorful Logo

### Description
The Euronext Stratos primary logo is a modern, gradient-based design featuring the Euronext brand mark. The logo uses a distinctive rainbow-gradient aesthetic with **vertical bars** in corporate colors progressing from teal through blues, greens, and yellows. This creates a dynamic, upward-trending visual metaphor representing growth and market movement.

### Logo Variants

#### Full Logo (Horizontal - Preferred)
- **Usage**: Primary application on all interfaces and documents
- **Min Width**: 120px
- **Clear Space**: 20px minimum on all sides
- **Background**: Works on light (#FAFAFA) and dark (#161616) backgrounds

#### Logo Colorful (Square)
- **Usage**: Icon applications, favicons, app launchers
- **Size**: 64px × 64px (minimum)
- **Format**: SVG or PNG with transparency

#### Logo Mark Only (Gradient Bar)
- **Usage**: Compact spaces, headers, navigation
- **Colors**: Gradient from teal (#008D7F) through supporting colors
- **Proportions**: Maintains visual hierarchy

### Color Specifications

#### Euronext Gradient Palette
```
Primary Teal: #008D7F
Supporting Blue: #0073A0
Accent Purple: #7B3FF2
Highlight Pink: #FF6B9D
```

#### Monochrome Usage
- **Dark Mode**: White (#FFFFFF)
- **Light Mode**: Black (#000000)
- **Disabled State**: Gray (#808080)

### Clear Space Requirements
- **Minimum Clear Space**: 20px on all sides
- **No Text Overlap**: Logo must never overlap with other elements
- **Breathing Room**: Ensure visual separation from other content

### Sizing Guidelines
```
Small:    64px × 64px   (Favicons, Icons)
Medium:   120px × 120px (Buttons, Headers)
Large:    240px × 240px (Hero sections, Banners)
XLarge:   480px × 480px (Full-screen applications)
```

### Placement Rules
1. **Top-left**: Primary navigation header (preferred)
2. **Center**: Hero sections, splash screens
3. **Footer**: Copyright and attribution
4. **Top-right**: Alternate applications
5. **Avoid**: Diagonal orientations, rotations

### Color Contrast
- Minimum contrast ratio: 4.5:1 (WCAG AA)
- Test all background colors before deployment
- Ensure readability at all sizes

## Logo Implementation

### SVG Format
The Stratos logo is provided in SVG format for optimal scaling and flexibility:
```svg
<!-- Euronext Stratos Logo SVG - Vertical Bars -->
<svg viewBox="0 0 100 32" xmlns="http://www.w3.org/2000/svg">
  <!-- Vertical bars with progressive heights and colors -->
  <rect x="4" y="14" width="6" height="18" fill="#8DC8E8" rx="1" />
  <rect x="12" y="10" width="6" height="22" fill="#41B6E6" rx="1" />
  <rect x="20" y="6" width="6" height="26" fill="#14A3C7" rx="1" />
  <rect x="28" y="12" width="6" height="20" fill="#5CB8B2" rx="1" />
  <rect x="36" y="8" width="6" height="24" fill="#00857D" rx="1" />
  <rect x="44" y="16" width="6" height="16" fill="#009639" rx="1" />
  <rect x="52" y="14" width="6" height="18" fill="#84BD00" rx="1" />
  <rect x="60" y="18" width="6" height="14" fill="#78BE20" rx="1" />
</svg>
```

### CSS Variables Integration
```css
--logo-primary: #008D7F;
--logo-secondary: #0073A0;
--logo-accent: #7B3FF2;
--logo-highlight: #FF6B9D;
```

### Accessibility
- Always provide `alt` text for logo images
- Use `aria-label` for SVG presentations
- Ensure sufficient size for visual identification (minimum 48px)

## Do's and Don'ts

### ✓ Do
- Use the official logo files provided
- Maintain clear space around logos
- Scale proportionally
- Use provided color specifications exactly
- Apply consistent brand guidelines

### ✗ Don't
- Rotate, skew, or distort the logo
- Change colors without approval
- Add drop shadows or effects
- Combine with competing brand marks
- Use in backgrounds as pattern/texture

## Brand Guidelines Integration
- Logos must follow Euronext corporate brand guidelines
- All applications must use approved logo variants
- Logo versions are available in SVG, PNG (24-bit), and PDF formats
- Minimum size enforcement: 48px width

## Logo Color Progression
The vertical bars follow a natural color progression:

| Bar 1 | Bar 2 | Bar 3 | Bar 4 | Bar 5 | Bar 6 | Bar 7 | Bar 8 |
|-------|-------|-------|-------|-------|-------|-------|-------|
| #8DC8E8 | #41B6E6 | #14A3C7 | #5CB8B2 | #00857D | #009639 | #84BD00 | #78BE20 |
| Light Blue | Sky Blue | Teal | Green-Teal | Deep Teal | Green | Yellow-Green | Leaf Green |

Each bar has optimal border-radius (1px) for subtle corner softening without visual disruption.

## Resources
- **Logo Files**: Available in `/Stratos Design system/` directory
- **Logo Component.svg**: Contains vertical bars logo design variations
- **Logo Specifications.svg**: Complete branding guidelines
- **Borders Specifications.svg**: Border styling for all UI elements
- **Format Support**: SVG (preferred), PNG, PDF

---

*Last Updated: February 2026*  
*This document is part of the Euronext Stratos Design System and should be referenced for all logo applications.*
