/**
 * i18next Configuration
 * Internationalization setup for TDS Web Simulation
 */

import i18next from 'i18next';
import en from './en.json';
import ru from './ru.json';
import uk from './uk.json';

// Language detection from browser or localStorage
function detectLanguage(): string {
  try {
    // Check localStorage first
    const stored = localStorage.getItem('tds_language');
    if (stored && ['en', 'ru', 'uk'].includes(stored)) {
      return stored;
    }
  } catch {
    // localStorage not available
  }

  // Detect from browser
  const browserLang = navigator.language.split('-')[0];
  return ['en', 'ru', 'uk'].includes(browserLang) ? browserLang : 'en';
}

// Initialize i18next
export async function initI18n(): Promise<void> {
  await i18next.init({
    lng: detectLanguage(),
    fallbackLng: 'en',
    debug: false,
    resources: {
      en: { translation: en },
      ru: { translation: ru },
      uk: { translation: uk },
    },
    interpolation: {
      escapeValue: false, // React already escapes values
    },
  });
}

// Change language
export function changeLanguage(lang: string): void {
  if (!['en', 'ru', 'uk'].includes(lang)) {
    console.warn(`Unsupported language: ${lang}`);
    return;
  }

  i18next.changeLanguage(lang);

  // Save to localStorage
  try {
    localStorage.setItem('tds_language', lang);
  } catch (e) {
    console.warn('Could not save language preference:', e);
  }

  // Update HTML lang attribute
  document.documentElement.lang = lang;

  // Dispatch event for components to update
  document.dispatchEvent(
    new CustomEvent('languageChanged', {
      detail: { language: lang },
    })
  );
}

// Get current language
export function getCurrentLanguage(): string {
  return i18next.language || 'en';
}

// Get available languages
export function getAvailableLanguages(): Array<{ code: string; name: string; nativeName: string }> {
  return [
    { code: 'en', name: 'English', nativeName: 'English' },
    { code: 'ru', name: 'Russian', nativeName: 'Русский' },
    { code: 'uk', name: 'Ukrainian', nativeName: 'Українська' },
  ];
}

// Translation helper function
export function t(key: string, options?: Record<string, unknown>): string {
  return i18next.t(key, options);
}

// Check if language is RTL
export function isRTL(lang?: string): boolean {
  const language = lang || getCurrentLanguage();
  const rtlLanguages = ['ar', 'he', 'fa', 'ur'];
  return rtlLanguages.includes(language);
}

export default i18next;
