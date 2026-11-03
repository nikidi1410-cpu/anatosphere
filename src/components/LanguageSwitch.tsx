import { useTranslation } from 'react-i18next';

const LANGUAGES = [
  { code: 'en', short: 'EN', name: 'English' },
  { code: 'id', short: 'ID', name: 'Bahasa Indonesia' },
];

export function LanguageSwitch() {
  const { t, i18n } = useTranslation();
  return (
    <div className="lang" role="group" aria-label={t('language.label')}>
      {LANGUAGES.map((l) => (
        <button
          key={l.code}
          type="button"
          lang={l.code}
          aria-pressed={i18n.language === l.code}
          aria-label={l.name}
          className={i18n.language === l.code ? 'on' : undefined}
          onClick={() => void i18n.changeLanguage(l.code)}
        >
          {l.short}
        </button>
      ))}
    </div>
  );
}
