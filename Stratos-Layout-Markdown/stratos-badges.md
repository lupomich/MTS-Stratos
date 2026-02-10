# Stratos Design System - Badges

## Overview

Le badge nel sistema Stratos sono piccoli componenti visivi utilizzati per etichettare, categorizzare o segnalare lo stato di elementi. Sono disponibili in diverse varianti di colore, forma e dimensione.

---

## Badge Types

### 1. Status Badge

Utilizzate per indicare lo stato di un elemento (attivo, inattivo, in attesa, ecc.)

| Aspect | Value |
|--------|-------|
| **Background Color** | Varia per stato |
| **Text Color** | White (#FFFFFF) |
| **Border Radius** | 12px (pill-shaped) |
| **Font Family** | IBM Plex Sans |
| **Font Weight** | Bold (700) |
| **Padding** | 4px 12px |

### 2. Category Badge

Utilizzate per categorizzare o taggare contenuti.

| Aspect | Value |
|--------|-------|
| **Background Color** | Light teal or grey |
| **Text Color** | Dark grey (#333333) |
| **Border Radius** | 4px |
| **Font Family** | IBM Plex Sans |
| **Font Weight** | Medium (500) |
| **Padding** | 4px 8px |
| **Border** | 1px solid teal or grey |

### 3. Number Badge / Count Badge

Piccoli badge con numeri per contatori o notifiche.

| Aspect | Value |
|--------|-------|
| **Background Color** | Teal - 40 (#008D7F) or Red - 40 (#E74C3C) |
| **Text Color** | White (#FFFFFF) |
| **Border Radius** | 50% (circular) |
| **Font Family** | IBM Plex Sans |
| **Font Weight** | Bold (700) |
| **Width/Height** | 20px (auto-scales for larger numbers) |
| **Font Size** | 10pt |

---

## Badge Status Colors

### Success Status

| Aspect | Value |
|--------|-------|
| **Background Color** | Green - 30 (#009639) |
| **Text Color** | White (#FFFFFF) |
| **Use Case** | Positivi, completato, attivo |

### Warning Status

| Aspect | Value |
|--------|-------|
| **Background Color** | Orange - 30 (#FF9500) |
| **Text Color** | White (#FFFFFF) |
| **Use Case** | Avviso, attenzione, in attesa |

### Error Status

| Aspect | Value |
|--------|-------|
| **Background Color** | Red - 40 (#E74C3C) |
| **Text Color** | White (#FFFFFF) |
| **Use Case** | Errore, critico, non disponibile |

### Info Status

| Aspect | Value |
|--------|-------|
| **Background Color** | Blue - 30 (#41B6E6) |
| **Text Color** | White (#FFFFFF) |
| **Use Case** | Informazione, neutrale, novità |

### Neutral Status

| Aspect | Value |
|--------|-------|
| **Background Color** | Grey - 30 (#D9D9D9) |
| **Text Color** | Dark grey (#333333) |
| **Use Case** | Neutrale, disabilitato, scaduto |

---

## Badge Sizes

### Large (L)

| Aspect | Value |
|--------|-------|
| **Height** | 28px |
| **Padding** | 6px 14px |
| **Font Size** | 14pt |
| **Use Case** | Highlighted badges, main content |

### Medium (M)

| Aspect | Value |
|--------|-------|
| **Height** | 24px |
| **Padding** | 4px 12px |
| **Font Size** | 12pt |
| **Use Case** | Standard badge size |

### Small (S)

| Aspect | Value |
|--------|-------|
| **Height** | 20px |
| **Padding** | 2px 8px |
| **Font Size** | 10pt |
| **Use Case** | Compact layouts, tag lists |

### Extra Small (XS)

| Aspect | Value |
|--------|-------|
| **Height** | 16px |
| **Padding** | 2px 6px |
| **Font Size** | 8pt |
| **Use Case** | Minimal badges, inline tags |

---

## Badge Shapes

### Pill Shape (Border Radius: 12px)

Usato per status badges e notifiche.

| Aspect | Value |
|--------|-------|
| **Border Radius** | 12px |
| **Use Case** | Status indicators, promotional badges |
| **Examples** | "Active", "Pending", "New" |

### Rounded Shape (Border Radius: 4px)

Usato per category badges e tags.

| Aspect | Value |
|--------|-------|
| **Border Radius** | 4px |
| **Use Case** | Category tags, labels |
| **Examples** | "Bond", "ETF", "Fund" |

### Circular Shape (Border Radius: 50%)

Usato per count badges e notifiche numeriche.

| Aspect | Value |
|--------|-------|
| **Border Radius** | 50% |
| **Use Case** | Notification counts, circular badges |
| **Examples** | "3", "12", "99+" |

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
- Usa colori coerenti con lo stato rappresentato
- Usa testo conciso (1-3 parole)
- Assicura contrasto colore sufficiente (4.5:1+)
- Usa numeri per contatori, non stringhe lunghe
- Posiziona badge vicino al contenuto correlato

### Don'ts ✗
- Non usare badge per troppi elementi (visual clutter)
- Non usare colori non conformi alla palette
- Non usare testo in maiuscolo per intere stringhe
- Non aggiungere troppe icone ai badge
- Non nascondere informazioni importanti in badge inattivi

---

## Accessibility

### Color Alone Should Not Convey Meaning
- Usa icona o testo per supportare il colore
- Per status, aggiungi label testuale oltre al colore

### Contrast
- Minimo 4.5:1 contrast ratio tra background e testo
- Minimo 3:1 contrast ratio per grafica

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
