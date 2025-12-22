export type Lang = 'ru' | 'uz' | 'en';

export function resolveLang(input?: Lang): Lang {
  const envDefault = (process.env.DEFAULT_LOCALE as Lang) || undefined;
  // Use input if provided, otherwise fallback to env DEFAULT_LOCALE, otherwise 'uz'
  return (input ?? envDefault ?? 'uz') as Lang;
}
