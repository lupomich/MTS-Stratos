# Stratos Design System - Badges

> **Fonte**: [Stratos Design System - Figma](https://www.figma.com/design/XDWOdnFtNSGYsD0JBbrhE4/Stratos-Design-system?node-id=764-6660)

## Overview

Le badge nel sistema Stratos sono componenti visivi utilizzati per etichettare, categorizzare o segnalare lo stato di elementi. Il design system offre tre varianti principali: **Badge label and icon**, **Badge icon only** e **Collapsible badge**, disponibili per Desktop e Mobile.

---

## Badge Variants

### 1. Badge (Label and Icon)

Badge completo con etichetta di testo e icona, disponibile in due stili (Contained/Standalone) e due dimensioni (Default/Compact).

| Aspect | Default | Compact |
|--------|---------|---------|
| **Height (Contained)** | 40px | 28px |
| **Height (Standalone)** | 40px | 28px |
| **Width** | Auto-fit content | Auto-fit content |
| **Font Family** | IBM Plex Sans | IBM Plex Sans |
| **Font Weight** | Medium (500) | Medium (500) |
| **Icon Size** | 16px | 12px |
| **Padding** | 8px 12px | 6px 8px |
| **Border Radius** | 20px (pill-shaped) | 14px (pill-shaped) |

### 2. Badge (Icon Only)

Badge minimalista con solo l'icona, senza testo.

| Aspect | Default | Compact |
|--------|---------|---------|
| **Width/Height** | 32px | 24px |
| **Icon Size** | 16px | 12px |
| **Border Radius** | 50% (circular) | 50% (circular) |
| **Padding** | 8px | 6px |

### 3. Collapsible Badge

Badge interattivo che espande/collassa al passaggio del mouse o focus.

| State | Width | Height | Behavior |
|-------|-------|--------|----------|
| **Rest** | 32px | 32px | Solo icona visibile |
| **Hover/Focus** | 103px | 32px | Icona + label visibile |
| **Transition** | 0.2s ease | - | Animazione smooth |

---

## Badge Colors & Usage

Ogni colore nel sistema badge ha un significato specifico e use case definiti:

### Black

| Aspect | Value |
|--------|-------|
| **Background Color** | #000000 |
| **Text Color** | White (#FFFFFF) |
| **Usage** | Neutral, Draft, Not initiated, Canceled |
| **Variants** | Contained, Standalone |

### Grey

| Aspect | Value |
|--------|-------|
| **Background Color** | Grey - 30 (#D9D9D9) |
| **Text Color** | Dark Grey (#333333) |
| **Usage** | Edit in progress, No action required |
| **Variants** | Contained, Standalone |

### Orange

| Aspect | Value |
|--------|-------|
| **Background Color** | Orange - 30/40 |
| **Text Color** | White (#FFFFFF) |
| **Usage** | Awaiting action, New comment |
| **Variants** | Contained, Standalone |

### Blue

| Aspect | Value |
|--------|-------|
| **Background Color** | Blue - 30 (#41B6E6) |
| **Text Color** | White (#FFFFFF) |
| **Usage** | Ongoing 1 |
| **Variants** | Contained, Standalone |

### Teal

| Aspect | Value |
|--------|-------|
| **Background Color** | Teal - 40 (#008D7F) |
| **Text Color** | White (#FFFFFF) |
| **Usage** | Ongoing 2 |
| **Variants** | Contained, Standalone |

### Green

| Aspect | Value |
|--------|-------|
| **Background Color** | Green - 30 (#009639) |
| **Text Color** | White (#FFFFFF) |
| **Usage** | Done, Completed, Approved, Validated |
| **Variants** | Contained, Standalone |

### Red

| Aspect | Value |
|--------|-------|
| **Background Color** | Red - 40 (#CF1D43) |
| **Text Color** | White (#FFFFFF) |
| **Usage** | Aborted, Error, Rejected, Failed, Not signed |
| **Variants** | Contained, Standalone |

### White

| Aspect | Value |
|--------|-------|
| **Background Color** | White (#FFFFFF) |
| **Text Color** | Dark Grey (#333333) |
| **Border** | 1px solid Grey - 20 |
| **Usage** | Custom badge |
| **Variants** | Contained, Standalone |

---

## Platform Variations

### Desktop Badges

**Badge Label and Icon:**
- Default Contained: 146px × 40px
- Default Standalone: 146px × 40px
- Compact Contained: 118px × 28px
- Compact Standalone: 118px × 28px

**Badge Icon Only:**
- Default: 32px × 32px (circular)
- Compact: 24px × 24px (circular)

**Collapsible Badge:**
- Rest state: 32px × 32px
- Hover/Focus state: 103px × 32px

### Mobile Badges

**Badge Label and Icon:**
- Default Contained: 138px × 36px
- Default Standalone: 138px × 36px
- Compact Contained: 118px × 24px
- Compact Standalone: 118px × 24px

**Badge Icon Only:**
- Default: 32px × 32px (circular)
- Compact: 24px × 24px (circular)

**Collapsible Badge:**
- Rest state: 32px × 32px
- Hover/Focus state: 103px × 32px

---

## Appearance Types

### Contained

Badge con background colorato solido.

| Aspect | Value |
|--------|-------|
| **Background** | Solid color (based on status) |
| **Text Color** | White or Dark Grey |
| **Border** | None (except White variant) |
| **Use Case** | High visibility, primary status indicators |

### Standalone

Badge con background trasparente e bordo colorato.

| Aspect | Value |
|--------|-------|
| **Background** | Transparent |
| **Text Color** | Matches border color |
| **Border** | 1px solid (color based on status) |
| **Use Case** | Subtle indicators, secondary information |

---

## Collapsible Badge Types

Badge che si espandono su hover/focus per mostrare informazioni aggiuntive.

### Draft

| State | Content | Background |
|-------|---------|------------|
| **Rest** | Icon only | Black |
| **Hover/Focus** | Icon + "Draft" label | Black |

### Edit in progress

| State | Content | Background |
|-------|---------|------------|
| **Rest** | Icon only | Grey |
| **Hover/Focus** | Icon + "Edit in progress" label | Grey |

### Awaiting action

| State | Content | Background |
|-------|---------|------------|
| **Rest** | Icon only | Orange |
| **Hover/Focus** | Icon + "Awaiting action" label | Orange |

### Ongoing

| State | Content | Background |
|-------|---------|------------|
| **Rest** | Icon only | Blue/Teal |
| **Hover/Focus** | Icon + "Ongoing" label | Blue/Teal |

### Almost done

| State | Content | Background |
|-------|---------|------------|
| **Rest** | Icon only | Teal |
| **Hover/Focus** | Icon + "Almost done" label | Teal |

### Completed

| State | Content | Background |
|-------|---------|------------|
| **Rest** | Icon only | Green |
| **Hover/Focus** | Icon + "Completed" label | Green |

### Failed

| State | Content | Background |
|-------|---------|------------|
| **Rest** | Icon only | Red |
| **Hover/Focus** | Icon + "Failed" label | Red |

---

## Badge Variants Reference

### Status Badges (Pill-shaped)

| Status | Background | Text | Font | Height |
|--------|-----------|------|------|--------|
| **Active** | Green - 30 (#009639) | White | 12pt Bold | 24px |
| **Pending** | Orange - 30 (#FF9500) | White | 12pt Bold | 24px |
| **Error** | Red - 40 (#E74C3C) | White | 12pt Bold | 24px |
| **Info** | Blue - 30 (#41B6E6) | White | 12pt Bold | 24px |
| **Disabled** | Grey - 30 (#D9D9D9) | Dark Grey | 12pt Bold | 24px |

### Category/Tag Badges (Rounded)

| Type | Background | Text | Border | Font | Height |
|------|-----------|------|--------|------|--------|
| **Primary** | Light Teal (#E0F5F3) | Teal - 40 (#008D7F) | 1px Teal | 12pt Medium | 24px |
| **Secondary** | Light Grey (#F5F5F5) | Dark Grey (#333333) | 1px Grey | 12pt Medium | 24px |
| **Success** | Light Green (#E8F7E8) | Green - 40 (#008000) | 1px Green | 12pt Medium | 24px |
| **Warning** | Light Orange (#FFE8CC) | Orange - 30 (#FF9500) | 1px Orange | 12pt Medium | 24px |

### Count Badges (Circular)

| Aspect | Value |
|--------|-------|
| **Background** | Teal - 40 (#008D7F) or Red - 40 (#E74C3C) |
| **Text Color** | White (#FFFFFF) |
| **Font** | 10pt Bold |
| **Min Size** | 20x20px |
| **Padding** | 0px (circular) |
| **Icon Size** | 12px (if icon included) |

---

## Badge Icon Support

### With Icon

I badge possono includere icone accanto al testo.

| Aspect | Value |
|--------|-------|
| **Icon Size** | S: 12px, M: 14px, L: 16px |
| **Icon Spacing** | 6px tra icona e testo |
| **Icon Alignment** | Left align |
| **Icon Color** | Stesso colore del testo |

### Icon-Only Badge

Badge contenente solo un'icona.

| Aspect | Value |
|--------|-------|
| **Icon Size** | 16px |
| **Container Size** | 24x24px |
| **Center Alignment** | flex center |

---

## Badge Interaction States

### Default State

| Aspect | Value |
|--------|-------|
| **Opacity** | 100% |
| **Cursor** | default (se non interattivo) |
| **Shadow** | none |

### Hover State (Se selezionabile)

| Aspect | Value |
|--------|-------|
| **Background** | 10% darker or lighter |
| **Cursor** | pointer |
| **Shadow** | 0 1px 2px rgba(0, 0, 0, 0.1) |
| **Opacity** | 90% |

### Active/Selected State

| Aspect | Value |
|--------|-------|
| **Background** | 20% darker or lighter |
| **Border** | 2px inset |
| **Shadow** | inset 0 1px 2px rgba(0, 0, 0, 0.15) |
| **Opacity** | 95% |

---

## Badge Placement Guidelines

### Positioned Near Content
- Badge sopra l'elemento correlato per indicare stato
- Badge a destra per etichette/categorie
- Badge sovrapposto per notifiche/contatori

### Spacing
- Almeno 4px di spazio tra badge e contenuto
- Almeno 8px tra more badge nello stesso gruppo

### Alignment
- Verticale con il contenuto
- Orizzontale allineato a sinistra o destra

---

## Badge Usage Guidelines

### Do's ✓
- Usa colori coerenti con il significato definito nel design system
- Mantieni testo conciso: "Status label" non "This is a very long status label"
- Per Desktop: usa Default size (40px/36px) per contenuti principali
- Per Mobile: usa Compact size (28px/24px) per layout ristretti
- Usa Collapsible badge per risparmiare spazio mantenendo informazioni accessibili
- Scegli Contained per alta visibilità, Standalone per informazioni secondarie

### Don'ts ✗
- Non usare colori custom al di fuori della palette definita
- Non mescolare Contained e Standalone nello stesso contesto
- Non usare badge troppo grandi che dominano il layout
- Non sovraccaricare la UI con troppi badge
- Non usare badge Collapsible per informazioni critiche che devono essere sempre visibili

---

## Accessibility

### Color and Semantics

| Aspect | Guideline |
|--------|-----------|
| **Color Alone** | Non fare affidamento solo sul colore - usa anche icone e testo |
| **Contrast Ratio** | Min 4.5:1 tra testo e background |
| **Icons** | Fornisci alt text o aria-label per icon-only badges |

### Keyboard Navigation

| Aspect | Guideline |
|--------|-----------|
| **Interactive Badges** | Devono essere accessibili via Tab |
| **Collapsible Badges** | Espandi con Spacebar o Enter |
| **Focus State** | Outline chiaro e visibile (2px) |

### Screen Readers

| Aspect | Guideline |
|--------|-----------|
| **Status Badges** | Usa `aria-label` per comunicare lo stato completo |
| **Icon-only** | Aggiungi `aria-label` descrittivo |
| **Decorative** | Usa `aria-hidden="true"` per badge puramente decorativi |

---

## React Component Examples

### Basic Badge (Label + Icon)

```jsx
import { Badge } from '@stratos/components';

// Contained Default
<Badge 
  color="green" 
  appearance="contained" 
  size="default"
  icon="check"
>
  Completed
</Badge>

// Standalone Compact
<Badge 
  color="blue" 
  appearance="standalone" 
  size="compact"
  icon="info"
>
  Ongoing
</Badge>
```

### Icon-Only Badge

```jsx
// Desktop Default
<Badge 
  color="orange" 
  appearance="icon-only" 
  size="default"
  icon="warning"
  ariaLabel="Awaiting action"
/>

// Mobile Compact
<Badge 
  color="red" 
  appearance="icon-only" 
  size="compact"
  icon="error"
  ariaLabel="Failed"
/>
```

### Collapsible Badge

```jsx
<Badge 
  color="teal" 
  appearance="collapsible"
  icon="progress"
  label="Almost done"
>
  {/* Mostra solo icona in Rest, icona + label su Hover/Focus */}
</Badge>
```

---

## Design Tokens (CSS Variables)

```css
/* Badge Heights */
--badge-height-default: 40px;
--badge-height-compact: 28px;
--badge-height-mobile-default: 36px;
--badge-height-mobile-compact: 24px;
--badge-icon-only-default: 32px;
--badge-icon-only-compact: 24px;

/* Border Radius */
--badge-border-radius-pill: 20px; /* Default */
--badge-border-radius-compact: 14px;
--badge-border-radius-circular: 50%;

/* Padding */
--badge-padding-default: 8px 12px;
--badge-padding-compact: 6px 8px;
--badge-padding-icon: 8px;

/* Typography */
--badge-font-family: 'IBM Plex Sans', sans-serif;
--badge-font-weight: 500;
--badge-font-size-default: 14px;
--badge-font-size-compact: 12px;

/* Icon Sizes */
--badge-icon-size-default: 16px;
--badge-icon-size-compact: 12px;

/* Transitions */
--badge-transition: all 0.2s ease;
```

---

## Summary

Il sistema Badge di Stratos offre:
- **3 varianti principali**: Label+Icon, Icon-only, Collapsible
- **8 colori** con significati specifici (Black, Grey, Orange, Blue, Teal, Green, Red, White)
- **2 appearance**: Contained (solid) e Standalone (bordered)
- **2 dimensioni**: Default e Compact
- **Supporto completo** Desktop e Mobile
- **Stati interattivi** per Collapsible badges

Tutti i badge rispettano i principi di accessibilità e sono ottimizzati per usabilità su tutte le piattaforme.

### Screen Readers
- Usa `aria-label` per badge con solo icona
- Usa `title` attribute per tooltip informativi
- Badge non dovrebbe essere il solo modo per comunicare il contenuto

---

## CSS Classes Reference

```css
/* Status Badges */
.badge-status { }
.badge-success { }
.badge-warning { }
.badge-error { }
.badge-info { }
.badge-disabled { }

/* Category Badges */
.badge-category { }
.badge-category-primary { }
.badge-category-secondary { }

/* Count Badges */
.badge-count { }
.badge-count-danger { }

/* Size Variants */
.badge-large { }
.badge-medium { }
.badge-small { }
.badge-xsmall { }

/* Shape Variants */
.badge-pill { }
.badge-rounded { }
.badge-circular { }

/* With Icon */
.badge-with-icon { }
.badge-icon-only { }
```
