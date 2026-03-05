# Stratos Design System Implementation - BondVision Digital

## Overview

The BondVision Digital application has been fully updated to use the **Stratos Design System** from Euronext/MyEuronext, while keeping all existing functionality intact.

## Changes Implemented

### 1. Global CSS Variables (`src/index.css`)

All Stratos design system CSS variables have been added:

#### Colors
- **Primary Teal**: `--color-primary` (#008D7F) - main brand identity color
- **Semantic Colors**: 
  - Success (green): `--color-success` (#00B050)  
  - Error (red): `--color-error` (#AB0027)
  - Warning (orange): `--color-warning` (#F59300)
  - Info (blue): `--color-info` (#0066CC)
- **Grey Scale**: complete grey scale from 900 to 100
- **Dark Theme**: main background, secondary background, borders and hover states
- **Background Colors**: white, off-white, light grey

#### Typography
- **Font Families**: 
  - IBM Plex Sans (400, 500, 700) for UI and body text
  - IBM Plex Serif (400) for headings
- **Font Sizes**: from 12px (XS) to 24px (XXL)
- **Font Weights**: Regular (400), Medium (500), Bold (700)
- **Line Heights**: optimized for each text size

#### Utility Classes
- `.heading-xl`, `.heading-l`, `.heading-m`, `.heading-s` for headings
- `.body-l-*`, `.body-m-*`, `.body-s-*` for body text (regular, medium, bold variants)

### 2. Updated Components

#### Header (`src/components/Header.css`)
- Logo and titles using IBM Plex Sans and Serif fonts
- Market button with Stratos primary color
- Status indicators with semantic colors (success/error)
- Icons and buttons with updated hover states

#### Sidebar (`src/components/Sidebar.css`)
- Navigation with dark theme colors
- Active state in primary color
- Hover effects with `--dark-hover`
- Updated border and divider colors

#### MainContent (`src/components/MainContent.css`)
- Toolbar with IBM Plex Sans font
- RFQ menu and options with Stratos colors
- Country tabs with active state in primary color
- Data sections and tables with dark theme colors
- Search inputs with new placeholder and border colors

#### BondTable (`src/components/BondTable.css`)
- AG-Grid customized with Stratos palette
- Headers with primary color for emphasis
- Bid values in `--color-error` (red)
- Ask values in `--color-success` (green)
- IBM Plex Sans font for all cells

#### MarketDepth (`src/components/MarketDepth.css`)
- Order book with dark theme colors
- Bid/Ask pricing with semantic colors
- Updated composite data grid
- Dealer pricing with Stratos fonts and colors

#### App (`src/App.css`)
- Main background with `--dark-bg`
- Global IBM Plex Sans font family

## Main Colors Used

| Element | CSS Variable | Color |
|---------|-------------|-------|
| Primary (Teal) | `--color-primary` | #008D7F |
| Success (Green) | `--color-success` | #00B050 |
| Error (Red) | `--color-error` | #AB0027 |
| Dark Background | `--dark-bg` | #0D2828 |
| Dark Hover | `--dark-hover` | #1A3A3A |
| Dark Border | `--dark-border` | #2A4A4A |
| White | `--color-bg-white` | #FFFFFF |
| Text Light | `--text-light` | #E0E0E0 |

## Typography Applied

- **Body Text**: IBM Plex Sans, 14px regular
- **Headings**: IBM Plex Serif, bold
- **UI Elements**: IBM Plex Sans, 12-14px, medium/bold
- **Tables**: IBM Plex Sans, 9-11px, regular/bold
- **Labels**: IBM Plex Sans, 10-11px, bold

## Implementation Benefits

1. **Visual Consistency**: Full alignment with the Euronext/MyEuronext brand
2. **Maintainability**: All color changes can be made centrally in `index.css`
3. **Accessibility**: Contrasts optimized according to Stratos specifications
4. **Professionalism**: IBM Plex fonts for a modern, corporate appearance
5. **Scalabilità**: Facile estendere il design system a nuovi componenti

## How to Run

L'applicazione mantiene la stessa configurazione Docker:

```bash
# Build e avvio con Docker Compose
docker-compose up --build

# Accesso
http://localhost:3002
```

## Riferimenti

Per dettagli completi sul Design System Stratos, consultare:
- `/Stratos-Layout-Markdown/stratos-colors.md`
- `/Stratos-Layout-Markdown/stratos-typography.md`  
- `/Stratos-Layout-Markdown/stratos-icons.md`

## Note Tecniche

- Tutti i colori hardcoded sono stati sostituiti con variabili CSS
- Font weights numerici (600, 500) sostituiti con variabili (`--font-weight-bold`, `--font-weight-medium`)
- Bid/Ask colors mappati a semantic colors (error/success) per coerenza
- Nessuna modifica alla logica JavaScript o struttura dei componenti React
- Compatibilità completa con AG-Grid attraverso custom theme properties

---

**Data Implementazione**: 2024  
**Versione Design System**: Stratos (Euronext/MyEuronext)  
**Applicazione**: BondVision Digital v1.0
