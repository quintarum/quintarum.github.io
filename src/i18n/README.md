# Internationalization (i18n)

This directory contains the internationalization setup for the TDS Web Simulation.

## Setup

The i18n system uses [i18next](https://www.i18next.com/) for managing translations.

### Initialization

Initialize i18n in your main application entry point:

```typescript
import { initI18n } from './i18n/i18n.js';

// Initialize before rendering UI
await initI18n();
```

The i18n system will automatically:
- Detect the user's browser language
- Load saved language preference from localStorage (if available)
- Fall back to English if the browser language is not supported
- Set the appropriate language for the UI

## Usage

### In TypeScript/JavaScript

Use the `t()` function to translate strings:

```typescript
import { t } from './i18n/i18n.js';

// Simple translation
const title = t('app.title');

// Translation with interpolation
const greeting = t('welcome.message', { name: 'User' });
```

### In HTML Templates

For dynamic content, use the translation function:

```typescript
element.innerHTML = `
  <h1>${t('app.title')}</h1>
  <p>${t('app.description')}</p>
`;
```
