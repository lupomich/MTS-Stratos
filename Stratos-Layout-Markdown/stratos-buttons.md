# Stratos Design System - Buttons

## Overview

I bottoni nel sistema Stratos sono componenti interattivi progettati per guidare l'azione dell'utente. Sono disponibili in diverse varianti di dimensione, stato e tipo per adattarsi a vari contesti di utilizzo.

---

## Button Types

### 1. Primary Button

Bottone di azione principale, usato per le azioni primarie che l'utente dovrebbe compiere.

| Aspect | Value |
|--------|-------|
| **Background Color** | Teal - 40 (#008D7F) |
| **Text Color** | White (#FFFFFF) |
| **Border** | None |
| **Font Family** | IBM Plex Sans |
| **Font Weight** | Bold (700) |

### 2. Secondary Button

Bottone di azione secondaria, usato per le azioni alternative.

| Aspect | Value |
|--------|-------|
| **Background Color** | Grey - 10 (#F5F5F5) |
| **Text Color** | Dark Grey (#333333) |
| **Border** | 1px solid Grey - 20 (#EBEBEB) |
| **Font Family** | IBM Plex Sans |
| **Font Weight** | Bold (700) |

### 3. Tertiary Button

Bottone di azione terzaria, usato per azioni meno importanti.

| Aspect | Value |
|--------|-------|
| **Background Color** | Transparent |
| **Text Color** | Teal - 40 (#008D7F) |
| **Border** | 1px solid Teal - 40 (#008D7F) |
| **Font Family** | IBM Plex Sans |
| **Font Weight** | Bold (700) |

---

## Button Sizes

### Large (L)

| Aspect | Value |
|--------|-------|
| **Height** | 48px |
| **Padding** | 12px 24px |
| **Font Size** | 16pt |
| **Line Height** | 24pt |
| **Use Case** | Primary CTAs, hero sections |

### Medium (M)

| Aspect | Value |
|--------|-------|
| **Height** | 40px |
| **Padding** | 10px 20px |
| **Font Size** | 14pt |
| **Line Height** | 20pt |
| **Use Case** | Standard UI actions |

### Small (S)

| Aspect | Value |
|--------|-------|
| **Height** | 32px |
| **Padding** | 8px 16px |
| **Font Size** | 12pt |
| **Line Height** | 16pt |
| **Use Case** | Compact layouts, toolbar actions |

### Extra Small (XS)

| Aspect | Value |
|--------|-------|
| **Height** | 24px |
| **Padding** | 4px 8px |
| **Font Size** | 10pt |
| **Line Height** | 12pt |
| **Use Case** | Inline actions, mini buttons |

---

## Button States

### Default State

| Aspect | Value |
|--------|-------|
| **Cursor** | pointer |
| **Opacity** | 100% |
| **Shadow** | None |
| **Transform** | None |

### Hover State

| Aspect | Value |
|--------|-------|
| **Background Color** | 10% darker or brighter (depending on button type) |
| **Cursor** | pointer |
| **Opacity** | 90% |
| **Shadow** | 0 2px 4px rgba(0, 0, 0, 0.1) |
| **Transform** | translateY(-1px) |

### Active State

| Aspect | Value |
|--------|-------|
| **Background Color** | 20% darker or brighter |
| **Cursor** | pointer |
| **Opacity** | 95% |
| **Shadow** | inset 0 2px 4px rgba(0, 0, 0, 0.15) |
| **Transform** | translateY(1px) |

### Disabled State

| Aspect | Value |
|--------|-------|
| **Background Color** | Grey - 5 (#FAFAFA) |
| **Text Color** | Grey - 40 (#BFBFBF) |
| **Cursor** | not-allowed |
| **Opacity** | 50% |
| **Border** | 1px solid Grey - 20 (#EBEBEB) |
| **Pointer Events** | none |

### Focus State

| Aspect | Value |
|--------|-------|
| **Outline** | 2px solid Teal - 30 (#41B6E6) |
| **Outline Offset** | 2px |
| **Cursor** | pointer |

---

## Button Specifications by Size & Type

### Primary Buttons

| Size | Height | Padding | Font Size | Style |
|------|--------|---------|-----------|-------|
| **L** | 48px | 12px 24px | 16pt Bold | Teal - 40 bg, white text |
| **M** | 40px | 10px 20px | 14pt Bold | Teal - 40 bg, white text |
| **S** | 32px | 8px 16px | 12pt Bold | Teal - 40 bg, white text |
| **XS** | 24px | 4px 8px | 10pt Bold | Teal - 40 bg, white text |

### Secondary Buttons

| Size | Height | Padding | Font Size | Style |
|------|--------|---------|-----------|-------|
| **L** | 48px | 12px 24px | 16pt Bold | Grey - 10 bg, dark text, grey border |
| **M** | 40px | 10px 20px | 14pt Bold | Grey - 10 bg, dark text, grey border |
| **S** | 32px | 8px 16px | 12pt Bold | Grey - 10 bg, dark text, grey border |
| **XS** | 24px | 4px 8px | 10pt Bold | Grey - 10 bg, dark text, grey border |

### Tertiary Buttons

| Size | Height | Padding | Font Size | Style |
|------|--------|---------|-----------|-------|
| **L** | 48px | 12px 24px | 16pt Bold | Transparent, teal text, teal border |
| **M** | 40px | 10px 20px | 14pt Bold | Transparent, teal text, teal border |
| **S** | 32px | 8px 16px | 12pt Bold | Transparent, teal text, teal border |
| **XS** | 24px | 4px 8px | 10pt Bold | Transparent, teal text, teal border |

---

## Button with Icon

Quando un bottone include un'icona:

| Aspect | Value |
|--------|-------|
| **Icon Size** | Varia con il bottone (L: 20px, M: 16px, S: 12px, XS: 8px) |
| **Icon Spacing** | 8px tra icona e testo |
| **Icon Alignment** | Left align di default, center se solo icona |
| **Icon Color** | Stesso colore del testo |

---

## Accessibility

### Keyboard Navigation
- I bottoni devono essere accessibili via tastiera (Tab, Enter, Space)
- Focus state sempre visibile

### Color Contrast
- Primary buttons: 4.5:1+ contrast ratio
- Secondary buttons: 4.5:1+ contrast ratio
- Tertiary buttons: 4.5:1+ contrast ratio

### ARIA Labels
- Usare `aria-label` o `aria-labelledby` per bottoni con solo icona
- Usare `aria-pressed` per toggle buttons
- Usare `aria-disabled` per bottoni disabilitati

---

## Button Usage Guidelines

### Do's ✓
- Usa il testo descrittivo e conciso
- Usa le giuste dimensioni per il contesto
- Assicura sufficiente spazio di click (almeno 44x44px per touch)
- Fornisci feedback visivo per i cambi di stato
- Uno o due bottoni primari per schermata/section

### Don'ts ✗
- Non mescolare più di due tipi di bottone nello stesso contesto
- Non usare bottoni troppo piccoli per touch interfaces
- Non usare colori non conformi alla palette del design system
- Non disabilitare bottoni senza motivo valido
- Non usare testo maiuscolo per intere frasi

---

## CSS Classes Reference

```css
/* Primary Button */
.btn-primary { }
.btn-primary:hover { }
.btn-primary:active { }
.btn-primary:disabled { }

/* Secondary Button */
.btn-secondary { }
.btn-secondary:hover { }
.btn-secondary:active { }
.btn-secondary:disabled { }

/* Tertiary Button */
.btn-tertiary { }
.btn-tertiary:hover { }
.btn-tertiary:active { }
.btn-tertiary:disabled { }

/* Size Variants */
.btn-large { }
.btn-medium { }
.btn-small { }
.btn-xsmall { }

/* States */
.btn:focus { }
.btn:disabled { }
```
