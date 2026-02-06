# Stratos Design System - Typography

## Font Families

Stratos utilizza la famiglia di font **IBM Plex** per garantire coerenza e leggibilità su tutte le piattaforme.

### Primary Fonts

| Type | Font Family | Usage |
|------|-------------|-------|
| **Headings** | IBM Plex Serif | Titoli e intestazioni |
| **Body Text** | IBM Plex Sans | Corpo del testo, interfaccia UI |

### Font Weights

| Weight | Value | Usage |
|--------|-------|-------|
| **Regular** | 400 | Testo normale |
| **Medium** | 500 | Enfasi media |
| **Bold** | 700 | Enfasi forte, titoli |

---

## Desktop Typography

### Headings (Desktop)

| Size | Font | Weight | Size | Line Height | Usage |
|------|------|--------|------|-------------|-------|
| **XL** | IBM Plex Serif | Regular (400) | 72pt | 80pt | Hero titles, landing pages |
| **L** | IBM Plex Serif | Regular (400) | 48pt | 56pt | Page titles, main headings |
| **M** | IBM Plex Serif | Regular (400) | 32pt | 40pt | Section titles |
| **S** | IBM Plex Serif | Regular (400) | 24pt | 32pt | Subsection titles |

### Body Text (Desktop)

#### Large (L)

| Variant | Font | Weight | Size | Line Height | Usage |
|---------|------|--------|------|-------------|-------|
| **L - Bold** | IBM Plex Sans | Bold (700) | 20pt | 28pt | Emphasized large text |
| **L - Medium** | IBM Plex Sans | Medium (500) | 20pt | 28pt | Semi-emphasized large text |
| **L - Regular** | IBM Plex Sans | Regular (400) | 20pt | 28pt | Large body text, introductions |

#### Medium (M)

| Variant | Font | Weight | Size | Line Height | Usage |
|---------|------|--------|------|-------------|-------|
| **M - Bold** | IBM Plex Sans | Bold (700) | 16pt | 24pt | Emphasized text, labels |
| **M - Medium** | IBM Plex Sans | Medium (500) | 16pt | 24pt | Semi-emphasized text |
| **M - Regular** | IBM Plex Sans | Regular (400) | 16pt | 24pt | Standard body text, UI text |

#### Small (S)

| Variant | Font | Weight | Size | Line Height | Usage |
|---------|------|--------|------|-------------|-------|
| **S - Bold** | IBM Plex Sans | Bold (700) | 14pt | 20pt | Small emphasized text |
| **S - Medium** | IBM Plex Sans | Medium (500) | 14pt | 20pt | Small semi-emphasized text |
| **S - Regular** | IBM Plex Sans | Regular (400) | 14pt | 20pt | Captions, small UI text, metadata |

---

## Mobile Typography

### Headings (Mobile)

| Size | Font | Weight | Size | Line Height | Usage |
|------|------|--------|------|-------------|-------|
| **XL** | IBM Plex Serif | Regular (400) | 32pt | 40pt | Hero titles mobile |
| **L** | IBM Plex Serif | Regular (400) | 28pt | 36pt | Page titles mobile |
| **M** | IBM Plex Serif | Regular (400) | 24pt | 32pt | Section titles mobile |
| **S** | IBM Plex Serif | Regular (400) | 20pt | 28pt | Subsection titles mobile |

### Body Text (Mobile)

#### Large (L)

| Variant | Font | Weight | Size | Line Height | Usage |
|---------|------|--------|------|-------------|-------|
| **L - Bold** | IBM Plex Sans | Bold (700) | 16pt | 24pt | Emphasized text mobile |
| **L - Medium** | IBM Plex Sans | Medium (500) | 16pt | 24pt | Semi-emphasized mobile |
| **L - Regular** | IBM Plex Sans | Regular (400) | 16pt | 24pt | Large body text mobile |

#### Medium (M)

| Variant | Font | Weight | Size | Line Height | Usage |
|---------|------|--------|------|-------------|-------|
| **M - Bold** | IBM Plex Sans | Bold (700) | 14pt | 20pt | Emphasized mobile text |
| **M - Medium** | IBM Plex Sans | Medium (500) | 14pt | 20pt | Semi-emphasized mobile |
| **M - Regular** | IBM Plex Sans | Regular (400) | 14pt | 20pt | Standard body mobile |

#### Small (S)

| Variant | Font | Weight | Size | Line Height | Usage |
|---------|------|--------|------|-------------|-------|
| **S - Bold** | IBM Plex Sans | Bold (700) | 12pt | 16pt | Small emphasized mobile |
| **S - Medium** | IBM Plex Sans | Medium (500) | 12pt | 16pt | Small semi-emphasized mobile |
| **S - Regular** | IBM Plex Sans | Regular (400) | 12pt | 16pt | Captions mobile, fine print |

---

## Marked Text (Highlighted Text)

Il **Marked tool** può essere utilizzato per testi che devono essere marcati o evidenziati durante la creazione o modifica.

### Caratteristiche

- **Background**: Box colorato con uno dei colori azione del sistema
- **Usage**: Evidenziare testo importante, marchi registrati, termini specifici
- **Colors**: Utilizzare i colori semantici (info, warning, success, error) o colori brand

### Guidelines

#### Do's ✅
- Usa il background colorato per evidenziare testo importante
- Mantieni contrasto sufficiente tra testo e background
- Usa colori semantici appropriati al contesto
- Limita l'uso a testi brevi (poche parole o frasi corte)

#### Don'ts ❌
- Non usare troppi colori diversi nella stessa schermata
- Non evidenziare interi paragrafi
- Non usare su background già colorati
- Non usare colori che riducono la leggibilità

### Examples

```html
<!-- Marked text con colore info -->
<mark class="mark-info">Testo importante</mark>

<!-- Marked text con colore warning -->
<mark class="mark-warning">Attenzione</mark>

<!-- Marked text con colore brand -->
<mark class="mark-brand">MyEuronext®</mark>
```

---

## CSS Variables (Implementation)

### Font Families

```css
:root {
  /* Font Families */
  --font-family-serif: 'IBM Plex Serif', Georgia, serif;
  --font-family-sans: 'IBM Plex Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  
  /* Font Weights */
  --font-weight-regular: 400;
  --font-weight-medium: 500;
  --font-weight-bold: 700;
}
```

### Desktop Typography

```css
:root {
  /* Headings Desktop */
  --heading-xl-size: 72px;
  --heading-xl-line-height: 80px;
  
  --heading-l-size: 48px;
  --heading-l-line-height: 56px;
  
  --heading-m-size: 32px;
  --heading-m-line-height: 40px;
  
  --heading-s-size: 24px;
  --heading-s-line-height: 32px;
  
  /* Body Desktop */
  --body-l-size: 20px;
  --body-l-line-height: 28px;
  
  --body-m-size: 16px;
  --body-m-line-height: 24px;
  
  --body-s-size: 14px;
  --body-s-line-height: 20px;
}
```

### Mobile Typography

```css
@media (max-width: 768px) {
  :root {
    /* Headings Mobile */
    --heading-xl-size: 32px;
    --heading-xl-line-height: 40px;
    
    --heading-l-size: 28px;
    --heading-l-line-height: 36px;
    
    --heading-m-size: 24px;
    --heading-m-line-height: 32px;
    
    --heading-s-size: 20px;
    --heading-s-line-height: 28px;
    
    /* Body Mobile */
    --body-l-size: 16px;
    --body-l-line-height: 24px;
    
    --body-m-size: 14px;
    --body-m-line-height: 20px;
    
    --body-s-size: 12px;
    --body-s-line-height: 16px;
  }
}
```

### Typography Classes

```css
/* Headings */
.heading-xl {
  font-family: var(--font-family-serif);
  font-size: var(--heading-xl-size);
  line-height: var(--heading-xl-line-height);
  font-weight: var(--font-weight-regular);
}

.heading-l {
  font-family: var(--font-family-serif);
  font-size: var(--heading-l-size);
  line-height: var(--heading-l-line-height);
  font-weight: var(--font-weight-regular);
}

.heading-m {
  font-family: var(--font-family-serif);
  font-size: var(--heading-m-size);
  line-height: var(--heading-m-line-height);
  font-weight: var(--font-weight-regular);
}

.heading-s {
  font-family: var(--font-family-serif);
  font-size: var(--heading-s-size);
  line-height: var(--heading-s-line-height);
  font-weight: var(--font-weight-regular);
}

/* Body Large */
.body-l-bold {
  font-family: var(--font-family-sans);
  font-size: var(--body-l-size);
  line-height: var(--body-l-line-height);
  font-weight: var(--font-weight-bold);
}

.body-l-medium {
  font-family: var(--font-family-sans);
  font-size: var(--body-l-size);
  line-height: var(--body-l-line-height);
  font-weight: var(--font-weight-medium);
}

.body-l-regular {
  font-family: var(--font-family-sans);
  font-size: var(--body-l-size);
  line-height: var(--body-l-line-height);
  font-weight: var(--font-weight-regular);
}

/* Body Medium */
.body-m-bold {
  font-family: var(--font-family-sans);
  font-size: var(--body-m-size);
  line-height: var(--body-m-line-height);
  font-weight: var(--font-weight-bold);
}

.body-m-medium {
  font-family: var(--font-family-sans);
  font-size: var(--body-m-size);
  line-height: var(--body-m-line-height);
  font-weight: var(--font-weight-medium);
}

.body-m-regular {
  font-family: var(--font-family-sans);
  font-size: var(--body-m-size);
  line-height: var(--body-m-line-height);
  font-weight: var(--font-weight-regular);
}

/* Body Small */
.body-s-bold {
  font-family: var(--font-family-sans);
  font-size: var(--body-s-size);
  line-height: var(--body-s-line-height);
  font-weight: var(--font-weight-bold);
}

.body-s-medium {
  font-family: var(--font-family-sans);
  font-size: var(--body-s-size);
  line-height: var(--body-s-line-height);
  font-weight: var(--font-weight-medium);
}

.body-s-regular {
  font-family: var(--font-family-sans);
  font-size: var(--body-s-size);
  line-height: var(--body-s-line-height);
  font-weight: var(--font-weight-regular);
}

/* Marked Text */
mark, .mark {
  padding: 2px 4px;
  border-radius: 2px;
}

.mark-info {
  background-color: var(--color-info-bg);
  color: var(--color-text-primary);
}

.mark-warning {
  background-color: var(--color-warning-bg);
  color: var(--color-text-primary);
}

.mark-success {
  background-color: var(--color-success-bg);
  color: var(--color-text-primary);
}

.mark-error {
  background-color: var(--color-error-bg);
  color: var(--color-text-primary);
}

.mark-brand {
  background-color: var(--color-teal-20);
  color: var(--color-text-primary);
}
```

---

## Font Loading

### Google Fonts (Recommended)

```html
<!-- In your HTML <head> -->
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;500;700&family=IBM+Plex+Serif:wght@400&display=swap" rel="stylesheet">
```

### CSS Import

```css
@import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;500;700&family=IBM+Plex+Serif:wght@400&display=swap');
```

### Self-Hosted (Alternative)

```css
@font-face {
  font-family: 'IBM Plex Sans';
  src: url('/fonts/IBMPlexSans-Regular.woff2') format('woff2');
  font-weight: 400;
  font-style: normal;
  font-display: swap;
}

@font-face {
  font-family: 'IBM Plex Sans';
  src: url('/fonts/IBMPlexSans-Medium.woff2') format('woff2');
  font-weight: 500;
  font-style: normal;
  font-display: swap;
}

@font-face {
  font-family: 'IBM Plex Sans';
  src: url('/fonts/IBMPlexSans-Bold.woff2') format('woff2');
  font-weight: 700;
  font-style: normal;
  font-display: swap;
}

@font-face {
  font-family: 'IBM Plex Serif';
  src: url('/fonts/IBMPlexSerif-Regular.woff2') format('woff2');
  font-weight: 400;
  font-style: normal;
  font-display: swap;
}
```

---

## Usage Guidelines

### Hierarchy

1. **Headings**: Usa IBM Plex Serif per creare gerarchia visiva
2. **Body**: Usa IBM Plex Sans per massima leggibilità
3. **UI Elements**: Preferisci Body M (16px) per interfacce desktop
4. **Labels**: Usa Body S (14px) per etichette e metadati

### Accessibility

- **Minimum size**: Non scendere sotto 12px (Body S mobile)
- **Contrast**: Mantieni contrasto minimo 4.5:1 per testo normale
- **Line height**: Rispetta i line-height specificati per leggibilità ottimale
- **Line length**: Massimo 70-80 caratteri per riga per testi lunghi

### Performance

- **Preload fonts**: Usa `<link rel="preload">` per font critici
- **Font display**: Usa `font-display: swap` per evitare FOIT
- **Subset fonts**: Carica solo i pesi necessari (400, 500, 700)

---

## Quick Reference

### Most Used Styles

| Context | Desktop | Mobile | Class |
|---------|---------|--------|-------|
| **Page Title** | 48px/56px Serif | 28px/36px Serif | `.heading-l` |
| **Section Title** | 32px/40px Serif | 24px/32px Serif | `.heading-m` |
| **Body Text** | 16px/24px Sans Regular | 14px/20px Sans Regular | `.body-m-regular` |
| **Emphasized** | 16px/24px Sans Bold | 14px/20px Sans Bold | `.body-m-bold` |
| **Caption** | 14px/20px Sans Regular | 12px/16px Sans Regular | `.body-s-regular` |

---

**Nota:** Questa documentazione è basata sul Stratos Design System di Euronext/MyEuronext.
