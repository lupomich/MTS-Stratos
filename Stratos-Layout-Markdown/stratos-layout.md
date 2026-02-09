# Euronext Stratos – Layout Specifications

## Grid System Overview
The Euronext Stratos Design System uses a flexible 12-column grid foundation to ensure consistent spacing and alignment across all applications.

## Page Structure

### Standard Container Layouts

#### Full-Width Container
- **Width**: 100% of viewport
- **Max-Width**: Unlimited (edge-to-edge)
- **Use Case**: Hero sections, full-bleed images, full-width backgrounds
- **Padding**: 24px on mobile, 32px on tablet, 48px on desktop

#### Fixed-Width Container
- **Width**: 1200px (Primary)
- **Width**: 1400px (Alternative for content-heavy)
- **Alignment**: Centered with auto margins
- **Padding**: 24px internal margin
- **Breakpoint**: Responsive at 768px (tablet), 1024px (desktop)

#### Content Container
- **Width**: 920px (Optimal for text and mixed content)
- **Max-Width**: 88% of viewport
- **Use Case**: Main content areas, documentation, forms
- **Padding**: 32px sides

#### Compact Container
- **Width**: 600px
- **Use Case**: Forms, dialogs, notifications, cards
- **Padding**: 16px sides

## Component Spacing

### Header Layout
```
┌─────────────────────────────────────────┐
│ [Logo] [Title]      [Navigation]  [BTN] │  56px Height (Desktop)
└─────────────────────────────────────────┘
  24px   12px gap     Right-aligned 16px
```

**Header Specifications**:
- Height: 56px (desktop), 48px (tablet), 44px (mobile)
- Background: #161616 (dark mode)
- Logo Size: 32px × 32px in header
- Navigation Gap: 24px between items
- Padding: 12px horizontal, 8px vertical

### Sidebar Layout

#### Standard Sidebar (Left Navigation)
- **Width**: 256px (desktop), 64px (compact mode)
- **Height**: Full viewport height
- **Background**: #1A1A1A
- **Item Height**: 48px
- **Icon Size**: 24px
- **Typography**: 14px, Regular (active: 14px, Medium)

#### Sidebar with Overlay (Mobile)
- **Width**: 280px (90% viewport, max 280px)
- **Position**: Fixed, overlays content
- **Z-Index**: 1000
- **Animation**: Slide-in 300ms cubic-bezier

### Main Content Area

#### Full Layout (with Sidebar)
```
┌───────────────────────────────────────────┐
│ ├─[SIDEBAR]─┬─[HEADER]──────────────────  │
│ │    256px  │  Remaining width (calc)     │
│ ├──────────┼──────────────────────────────│
│ │          │                              │
│ │ Navigation│  [MAIN CONTENT - Centered]  │
│ │          │  Max: 1200px                │
│ │          │                              │
│ └──────────┴──────────────────────────────┘
```

**Layout Grid**:
- Left Sidebar: 256px (fixed)
- Main Content: Available width - 256px - 48px padding
- Right Gutter: 24px
- Column Gap: 24px
- Grid Columns: 12

### Table/Data Layout

#### Standard Table
- **Row Height**: 48px (compact), 56px (standard), 64px (spacious)
- **Column Spacing**: 16px minimum between columns
- **Header Height**: 48px
- **Padding**: 12px horizontal per cell
- **Border**: 1px #2A2A2A

#### Dense Table (Trading Data)
- **Row Height**: 40px
- **Column Gap**: 12px
- **Font Size**: 13px (body), 12px (labels)
- **Padding**: 8px sides, 6px vertical

### Card/Panel Layout

#### Standard Card (Light)
- **Width**: 280px - 480px
- **Min Height**: 120px
- **Padding**: 24px
- **Border-Radius**: 8px
- **Border**: 1px #2A2A2A
- **Box-Shadow**: 0 2px 8px rgba(0,0,0,0.12)

#### Compact Card
- **Width**: 200px - 320px
- **Padding**: 16px
- **Border-Radius**: 6px
- **Min Height**: 80px

## Responsive Design Breakpoints

### Mobile First Approach

#### Small (XS) - Mobile
```
Width: 320px - 479px
Columns: 4
Gutter: 12px
Padding: 16px
Header: Stacked
Sidebar: Hidden (Drawer menu)
```

#### Medium (SM) - Tablet
```
Width: 480px - 767px
Columns: 8
Gutter: 16px
Padding: 20px
Header: Multi-row
Sidebar: Compact (64px)
```

#### Large (MD) - Tablet Large
```
Width: 768px - 1023px
Columns: 12
Gutter: 20px
Padding: 24px
Header: Standard
Sidebar: Standard (160px)
```

#### Extra Large (LG) - Desktop
```
Width: 1024px - 1279px
Columns: 12
Gutter: 24px
Padding: 32px
Header: Full
Sidebar: Standard (256px)
```

#### 2XL - Large Desktop
```
Width: 1280px+
Columns: 12
Gutter: 24px
Padding: 48px
Header: Extended
Sidebar: Standard (256px)
Max Container: 1400px
```

## Spacing System

### Vertical Spacing
```
2px   - Fine-tune borders
4px   - Tight internal spacing
8px   - Button/input padding
12px  - Section separation
16px  - Element gap
24px  - Section padding
32px  - Major section spacing
48px  - Page sections
64px  - Hero/large gaps
128px - Full section breaks
```

### Horizontal Spacing
```
8px   - Inner padding (compact)
12px  - Default padding
16px  - Content margin
24px  - Section margin
32px  - Sidebar offset
48px  - Page margins
```

## Border Specifications

### Border Styles
- **Default Border Color**: `var(--dark-border)` (used for dividers, separators)
- **Primary Border Color**: `var(--color-primary)` (for interactive elements, active states)
- **Border Width**: 1px (standard for all border styles)
- **Border Radius**: 
  - Buttons: 3px (subtle rounding)
  - Cards: 8px (comfortable rounding)
  - Icons/Badges: 2px (minimal rounding)
  - Logos: 1px (refined, sharp look)

### Border Usage
- **Header sections**: 1px solid dark-border between sections
- **Input fields**: 1px solid on focus, maintains baseline styling
- **Buttons**: 1px solid var(--color-primary) for default, filled on active
- **Cards**: 1px subtle border with rounded corners for definition
- **Status indicators**: 1px borders with background fill

### Color Consistency
- Dark mode borders: `#3D3D3D` (dark-border)
- Light mode borders: Derived from primary color palette
- Hover state borders: Transition to primary color
- Active state borders: Full primary color with background fill

## Z-Index Stack

```
z-10000: Modals, Overlays, Popups
z-1000:  Dropdown menus, Tooltips
z-100:   Header (fixed), Sticky elements
z-10:    Elevated cards
z-1:     Default content
z-0:     Backgrounds
z-(-1):  Behind-content elements
```

## Layout Examples

### Trading Dashboard
```
Full Width (1400px max)
┌─────────────────────────────────┐
│ [HEADER] - 56px                 │
├──────────┬──────────────────────┤
│ [SIDEBAR]│ [MAIN CONTENT AREA]  │
│ 256px    │ Responsive Grid      │
│          │                      │
│          │ ┌────┬────┬────┐    │
│          │ │Card│Card│Card│    │
│          │ └────┴────┴────┘    │
│          │ ┌──────────────┐    │
│          │ │   Table      │    │
│          │ │   Responsive │    │
│          │ └──────────────┘    │
└──────────┴──────────────────────┘
```

### Form Layout
```
Fixed Container (600px centered)
┌─────────────────────────────────┐
│                                 │
│  ┌───────────────────────────┐  │
│  │  [Form Title]             │  │
│  │                           │  │
│  │  [Input Field]            │  │
│  │  [Input Field]            │  │
│  │  [Select Dropdown]        │  │
│  │                           │  │
│  │  [Save] [Cancel]          │  │
│  └───────────────────────────┘  │
│                                 │
└─────────────────────────────────┘
```

## Typography Layout

### Heading Hierarchy with Spacing
```
Page Title (H1)
32px, Bold, 40px line-height
↓ (24px gap)

Section Title (H2)
24px, Semibold, 32px line-height
↓ (16px gap)

Subsection Title (H3)
18px, Semibold, 24px line-height
↓ (12px gap)

Body Text (Regular)
14px, Regular, 20px line-height

Caption/Helper Text (Small)
12px, Regular, 16px line-height
```

## Mobile Considerations

### Touch Targets
- Minimum size: 44px × 44px
- Recommended: 48px × 48px
- Spacing: 8px minimum between targets

### Navigation
- Hamburger menu button: 48px × 48px
- Tab bar height: 56px
- Tab item width: 60px minimum

### Orientation
- Portrait: Full-width content
- Landscape: Two-column where possible
- Maintain 16:9 aspect for media

## Accessibility

### Color Contrast
- Text on background: 4.5:1 minimum
- Large text (18pt+): 3:1 minimum
- Interactive elements: 3:1 minimum

### Focus States
- Visible focus indicator: 2px outline
- Outline offset: 2px
- Color: #0073A0 (primary blue)

### Keyboard Navigation
- Tab order follows visual hierarchy
- Focus trap in modals
- ESC key closes overlays

## Layout Exceptions

### Full-Width Sections
- Hero banners: 100vw height
- Image backgrounds: Full bleed
- Color blocks: Edge-to-edge

### Centered Content
- Text blocks max: 920px
- Reading width: 60-80 characters
- Alignment: Center for hero, left for body

---

*Last Updated: 2024*  
*This document defines the structural foundation for all Stratos Design System layouts.*
