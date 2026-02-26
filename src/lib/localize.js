/**
 * Safely extract a localized string from a field that may be:
 * - a plain string (pre-migration)
 * - a JSONB object like { en: '...', ro: '...', ru: '...' }
 * - null/undefined
 * Always returns a string.
 */
export function localizedField(field, locale) {
  if (field == null) return '';
  if (typeof field === 'string') return field;
  if (typeof field === 'object') {
    const val = field[locale] || field.en || field.ro || '';
    return typeof val === 'string' ? val : '';
  }
  return String(field);
}
