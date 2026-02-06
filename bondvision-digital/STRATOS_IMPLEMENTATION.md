# Implementazione Design System Stratos - BondVision Digital

## Panoramica

L'applicazione BondVision Digital è stata completamente aggiornata per utilizzare il **Stratos Design System** di Euronext/MyEuronext, mantenendo intatta tutta la funzionalità esistente.

## Modifiche Implementate

### 1. CSS Variables Globali (`src/index.css`)

Aggiunte tutte le variabili CSS del design system Stratos:

#### Colori
- **Primary Teal**: `--color-primary` (#008D7F) - colore principale dell'identità aziendale
- **Semantic Colors**: 
  - Success (verde): `--color-success` (#00B050)  
  - Error (rosso): `--color-error` (#AB0027)
  - Warning (arancione): `--color-warning` (#F59300)
  - Info (blu): `--color-info` (#0066CC)
- **Grey Scale**: completa scala di grigi da 900 a 100
- **Dark Theme**: sfondo principale, secondario, bordi e hover states
- **Background Colors**: bianco, off-white, grigio chiaro

#### Tipografia
- **Font Families**: 
  - IBM Plex Sans (400, 500, 700) per UI e body text
  - IBM Plex Serif (400) per headings
- **Font Sizes**: da 12px (XS) a 24px (XXL)
- **Font Weights**: Regular (400), Medium (500), Bold (700)
- **Line Heights**: ottimizzate per ogni dimensione di testo

#### Classi Utility
- `.heading-xl`, `.heading-l`, `.heading-m`, `.heading-s` per titoli
- `.body-l-*`, `.body-m-*`, `.body-s-*` per testo body (varianti regular, medium, bold)

### 2. Componenti Aggiornati

#### Header (`src/components/Header.css`)
- Logo e titoli con font IBM Plex Sans e Serif
- Pulsante market con colore primary Stratos
- Status indicators con colori semantic (success/error)
- Icone e pulsanti con hover states aggiornati

#### Sidebar (`src/components/Sidebar.css`)
- Navigazione con colori dark theme
- Active state in colore primary
- Hover effects con `--dark-hover`
- Border e divider colors aggiornati

#### MainContent (`src/components/MainContent.css`)
- Toolbar con font IBM Plex Sans
- RFQ menu e options con colori Stratos
- Country tabs con active state in primary color
- Data sections e tabelle con colori dark theme
- Search inputs con nuovi placeholder e border colors

#### BondTable (`src/components/BondTable.css`)
- AG-Grid customizzato con palette Stratos
- Headers con colore primary per enfasi
- Bid values in `--color-error` (rosso)
- Ask values in `--color-success` (verde)
- Font IBM Plex Sans per tutte le celle

#### MarketDepth (`src/components/MarketDepth.css`)
- Order book con colori dark theme
- Bid/Ask pricing con colori semantic
- Composite data grid aggiornato
- Dealer pricing con font e colori Stratos

#### App (`src/App.css`)
- Background principale con `--dark-bg`
- Font family globale IBM Plex Sans

## Colori Principali Utilizzati

| Elemento | Variabile CSS | Colore |
|----------|--------------|--------|
| Primary (Teal) | `--color-primary` | #008D7F |
| Success (Verde) | `--color-success` | #00B050 |
| Error (Rosso) | `--color-error` | #AB0027 |
| Dark Background | `--dark-bg` | #0D2828 |
| Dark Hover | `--dark-hover` | #1A3A3A |
| Dark Border | `--dark-border` | #2A4A4A |
| White | `--color-bg-white` | #FFFFFF |
| Text Light | `--text-light` | #E0E0E0 |

## Tipografia Applicata

- **Body Text**: IBM Plex Sans, 14px regular
- **Headings**: IBM Plex Serif, bold
- **UI Elements**: IBM Plex Sans, 12-14px, medium/bold
- **Tables**: IBM Plex Sans, 9-11px, regular/bold
- **Labels**: IBM Plex Sans, 10-11px, bold

## Vantaggi dell'Implementazione

1. **Consistenza Visiva**: Allineamento completo con il brand Euronext/MyEuronext
2. **Manutenibilità**: Tutte le modifiche ai colori possono essere fatte centralmente in `index.css`
3. **Accessibilità**: Contrasti ottimizzati secondo le specifiche Stratos
4. **Professionalità**: Utilizzo di font IBM Plex per un aspetto moderno e corporate
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
