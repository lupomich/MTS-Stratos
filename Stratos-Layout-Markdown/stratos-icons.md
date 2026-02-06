# Stratos Design System - Icons

## Overview

Il sistema di icone Stratos fornisce un set completo di icone SVG per interfacce web e applicazioni. Tutte le icone sono scalabili, accessibili e possono essere personalizzate tramite CSS.

## Caratteristiche

- **Formato**: SVG (Scalable Vector Graphics)
- **Stile**: Line icons (outline style)
- **Dimensioni predefinite**: 24x24px (scalabili)
- **Colore predefinito**: Può essere personalizzato via CSS
- **Stroke width**: Uniforme per coerenza visiva
- **Accessibilità**: Supporta aria-label e title per screen readers

---

## Categorie di Icone

### 1. Actions

Icone per azioni comuni nell'interfaccia utente.

**Esempi:**
- **Add/Plus**: Aggiungere elementi
- **Edit/Pencil**: Modificare contenuti
- **Delete/Trash**: Eliminare elementi
- **Upload**: Caricare file
- **Download**: Scaricare file
- **Copy**: Copiare contenuti
- **Paste**: Incollare contenuti
- **Undo**: Annullare azioni
- **Redo**: Ripetere azioni
- **Refresh**: Aggiornare contenuti
- **Settings/Gear**: Impostazioni
- **Search**: Ricerca
- **Filter**: Filtrare dati
- **Sort**: Ordinare elementi
- **View/Eye**: Visualizzare
- **Hide/Eye-off**: Nascondere
- **Expand**: Espandere sezioni
- **Collapse**: Collassare sezioni

**File di riferimento**: `Actions.svg`

---

### 2. Navigation

Icone per la navigazione nell'applicazione.

**Esempi:**
- **Arrow Up**: Freccia su
- **Arrow Down**: Freccia giù
- **Arrow Left**: Freccia sinistra
- **Arrow Right**: Freccia destra
- **Chevron Up**: Chevron su
- **Chevron Down**: Chevron giù
- **Chevron Left**: Chevron sinistra
- **Chevron Right**: Chevron destra
- **Menu/Hamburger**: Menu principale
- **Close/X**: Chiudere
- **Home**: Homepage
- **Back**: Indietro
- **Forward**: Avanti
- **More (dots)**: Più opzioni
- **Dashboard Grid**: Vista dashboard
- **Maximize**: Massimizzare finestra
- **Minimize**: Minimizzare finestra

**File di riferimento**: `Navigation.svg`

---

### 3. Lists and Table

Icone per liste, tabelle e organizzazione dati.

**Esempi:**
- **List**: Vista lista
- **Grid**: Vista griglia
- **Table**: Tabella dati
- **Columns**: Colonne
- **Rows**: Righe
- **Checkbox**: Casella di controllo
- **Radio**: Radio button
- **Drag**: Trascinare elementi
- **Move**: Spostare
- **Reorder**: Riordinare

**File di riferimento**: `Lists and Table.svg`

---

### 4. File Icons

Icone per diversi tipi di file e documenti.

**Esempi:**
- **File**: File generico
- **Document**: Documento
- **Folder**: Cartella
- **Folder Open**: Cartella aperta
- **Image**: File immagine
- **Video**: File video
- **Audio**: File audio
- **PDF**: Documento PDF
- **CSV/Excel**: File spreadsheet
- **Text**: File di testo
- **Code**: File codice
- **Archive/ZIP**: File compresso

**File di riferimento**: `File Icons.svg`

---

### 5. Notification & Feedback

Icone per notifiche, avvisi e feedback utente.

**Esempi:**
- **Info**: Informazione
- **Success/Check**: Successo
- **Warning/Alert**: Avviso
- **Error**: Errore
- **Bell**: Notifiche
- **Bell Off**: Notifiche disabilitate
- **Help**: Aiuto
- **Question**: Domanda
- **Exclamation**: Esclamazione

**File di riferimento**: `Notification & Feedback.svg`

---

### 6. Media

Icone per controlli media e contenuti multimediali.

**Esempi:**
- **Play**: Riproduci
- **Pause**: Pausa
- **Stop**: Stop
- **Record**: Registra
- **Forward**: Avanti veloce
- **Backward**: Indietro veloce
- **Volume**: Volume
- **Mute**: Muto
- **Camera**: Fotocamera
- **Video Camera**: Videocamera
- **Microphone**: Microfono
- **Screen**: Schermo

**File di riferimento**: `Media.svg`

---

### 7. Misc (Miscellaneous)

Icone varie per usi diversi.

**Esempi:**
- **User**: Utente
- **Users/Team**: Team/Gruppo
- **Calendar**: Calendario
- **Clock**: Orologio
- **Lock**: Bloccato
- **Unlock**: Sbloccato
- **Key**: Chiave
- **Mail**: Email
- **Phone**: Telefono
- **Location/Pin**: Posizione
- **Star**: Stella/Preferito
- **Heart**: Mi piace
- **Share**: Condividi
- **Link**: Link/Collegamento
- **Tag**: Etichetta
- **Flag**: Flag/Segna
- **Print**: Stampa
- **Export**: Esporta
- **Import**: Importa
- **Logout**: Disconnetti
- **Login**: Accedi

**File di riferimento**: `Misc.svg`

---

### 8. Homepage

Icone specifiche per la homepage e dashboard.

**File di riferimento**: `Homepage.svg`

---

## Specifiche Tecniche

Le specifiche dettagliate delle icone sono documentate in:

**File di riferimento**: `📄Specifications.svg`

### Sizing

| Size | Dimensione | Usage |
|------|-----------|-------|
| **XS** | 16x16px | Icone molto piccole, inline text |
| **S** | 20x20px | Icone piccole, componenti compatti |
| **M** | 24x24px | **Dimensione standard** (default) |
| **L** | 32x32px | Icone grandi, azioni primarie |
| **XL** | 40x40px | Icone molto grandi, feature cards |

### Color

Le icone possono utilizzare i colori dal design system:

| Usage | Color Token | Default Value |
|-------|-------------|---------------|
| **Default** | Grey-60 | `#27272D` |
| **Secondary** | Grey-50 | `#54545C` |
| **Disabled** | Grey-40 | `#98989F` |
| **Primary Action** | Teal-40 | `#008D7F` |
| **Success** | Spring Green-20 | `#79D100` |
| **Error** | Red-40 | `#CF1D43` |
| **Warning** | Orange-40 | `#E26310` |
| **Info** | Blue-30 | `#41B6E6` |

---

## Implementation

### HTML/SVG Inline

```html
<!-- Inline SVG - massima personalizzazione -->
<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="..." fill="currentColor"/>
</svg>
```

### Como Componente React

```jsx
// Icon component
const Icon = ({ name, size = 24, color = 'currentColor', className = '' }) => {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none"
      className={className}
      aria-hidden="true"
    >
      {/* Contenuto specifico dell'icona */}
      <path d="..." fill={color}/>
    </svg>
  );
};

// Usage
<Icon name="search" size={24} color="var(--color-primary)" />
```

### CSS Classes

```css
/* Base icon styles */
.icon {
  display: inline-block;
  width: 24px;
  height: 24px;
  color: var(--color-grey-60);
  fill: currentColor;
}

/* Size variants */
.icon--xs { width: 16px; height: 16px; }
.icon--s { width: 20px; height: 20px; }
.icon--m { width: 24px; height: 24px; }
.icon--l { width: 32px; height: 32px; }
.icon--xl { width: 40px; height: 40px; }

/* Color variants */
.icon--primary { color: var(--color-primary); }
.icon--success { color: var(--color-success); }
.icon--error { color: var(--color-error); }
.icon--warning { color: var(--color-warning); }
.icon--info { color: var(--color-info); }
.icon--disabled { color: var(--color-grey-40); }

/* Interactive states */
.icon-button {
  cursor: pointer;
  transition: color 0.2s ease;
}

.icon-button:hover {
  color: var(--color-primary);
}

.icon-button:active {
  color: var(--color-primary-dark);
}

.icon-button:disabled {
  color: var(--color-grey-40);
  cursor: not-allowed;
}
```

---

## Accessibility

### Best Practices

#### 1. Icone Decorative

Per icone puramente decorative (accompagnate da testo):

```html
<button>
  <svg aria-hidden="true">...</svg>
  <span>Save</span>
</button>
```

#### 2. Icone Informative

Per icone che trasmettono informazioni importanti:

```html
<svg role="img" aria-label="Success">
  <title>Success</title>
  <path d="..."/>
</svg>
```

#### 3. Icone in Bottoni

Per bottoni con solo icona (senza testo):

```html
<button aria-label="Close">
  <svg aria-hidden="true">...</svg>
</button>
```

#### 4. Icone di Stato

Per icone che indicano uno stato:

```html
<div>
  <svg role="img" aria-label="Warning">
    <title>Warning</title>
    <path d="..."/>
  </svg>
  <span>Your session is about to expire</span>
</div>
```

---

## Usage Guidelines

### Do's ✅

- Usa icone per migliorare la comprensione, non sostituire il testo
- Mantieni consistenza nelle dimensioni all'interno dello stesso contesto
- Usa colori semantici appropriati (success, error, warning, info)
- Includi sempre aria-label per icone standalone
- Usa `currentColor` per ereditare il colore dal testo
- Ottimizza gli SVG (rimuovi metadati non necessari)

### Don'ts ❌

- Non usare icone troppo piccole (< 16px) per azioni importanti
- Non usare colori personalizzati fuori dalla palette
- Non mixare stili di icone diversi (outline vs filled)
- Non omettere l'accessibilità (aria-label, role)
- Non usare icone ambigue senza testo esplicativo
- Non sovraccaricare l'interfaccia con troppe icone

---

## Icon System Structure

```
Stratos Icons/
├── Actions.svg              # Showcase icone azioni
├── Navigation.svg           # Showcase icone navigazione
├── Lists and Table.svg      # Showcase liste e tabelle
├── File Icons.svg           # Showcase icone file
├── Notification & Feedback.svg  # Showcase notifiche
├── Media.svg                # Showcase media controls
├── Misc.svg                 # Showcase icone varie
├── Homepage.svg             # Showcase homepage
└── 📄Specifications.svg     # Specifiche tecniche
```

---

## Integration with Design System

### Con i colori Stratos

```css
:root {
  /* Icon colors - semantic */
  --icon-default: var(--color-grey-60);
  --icon-secondary: var(--color-grey-50);
  --icon-disabled: var(--color-grey-40);
  --icon-primary: var(--color-teal-40);
  --icon-success: var(--color-success);
  --icon-error: var(--color-error);
  --icon-warning: var(--color-warning);
  --icon-info: var(--color-info);
}
```

### Con la tipografia Stratos

```css
/* Icons sized to match typography */
.body-l-icon { 
  width: 20px; 
  height: 20px; 
} /* Match body-l (20px) */

.body-m-icon { 
  width: 16px; 
  height: 16px; 
} /* Match body-m (16px) */

.body-s-icon { 
  width: 14px; 
  height: 14px; 
} /* Match body-s (14px) */
```

---

## Performance

### Ottimizzazione

1. **Rimuovi metadati non necessari**
   ```bash
   # Usa SVGO per ottimizzare
   svgo --multipass icon.svg
   ```

2. **Usa SVG Sprites** per molte icone
   ```html
   <!-- Sprite file -->
   <svg style="display: none;">
     <symbol id="icon-search" viewBox="0 0 24 24">
       <path d="..."/>
     </symbol>
   </svg>
   
   <!-- Usage -->
   <svg><use href="#icon-search"/></svg>
   ```

3. **Inline per icone critiche**, external file per altre

4. **Lazy load** icone non immediatamente visibili

---

## Resources

### File Disponibili

Tutti i file showcase delle icone sono disponibili nella cartella:
```
/home/malupo/Github/Test2/Stratos Icons/
```

### Exports

Per esportare singole icone da utilizzare nell'applicazione:

1. Apri il file SVG showcase corrispondente
2. Identifica l'icona desiderata nel viewBox
3. Estrai il path specifico
4. Crea un nuovo file SVG con solo quell'icona

### Figma

Per accedere al design system completo su Figma:
https://www.figma.com/design/XDWOdnFtNSGYsD0JBbrhE4/Stratos-Design-system

---

**Nota:** Questa documentazione è basata sul Stratos Design System di Euronext/MyEuronext.
