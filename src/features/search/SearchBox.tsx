import { useEffect, useId, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppStore } from '../../stores/useAppStore';
import { search, type SearchResult } from '../../lib/search';

export function SearchBox() {
  const { t, i18n } = useTranslation();
  const catalog = useAppStore((s) => s.catalog);
  const selectRecord = useAppStore((s) => s.selectRecord);
  const selectStructure = useAppStore((s) => s.selectStructure);
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const root = useRef<HTMLDivElement>(null);
  const listId = useId();
  const lang = i18n.language === 'id' ? 'id' : 'en';

  const results = useMemo(() => (catalog ? search(catalog, query) : []), [catalog, query]);
  const showList = open && query.trim().length >= 2;

  useEffect(() => {
    const onDown = (e: PointerEvent) => {
      if (root.current && !root.current.contains(e.target as Node)) setOpen(false);
    };
    window.addEventListener('pointerdown', onDown);
    return () => window.removeEventListener('pointerdown', onDown);
  }, []);

  const choose = (r: SearchResult) => {
    if (r.kind === 'record') selectRecord(r.id);
    else selectStructure(r.id, { reveal: true });
    setOpen(false);
    setQuery('');
  };

  return (
    <div className="search" ref={root}>
      <input
        type="search"
        role="combobox"
        aria-expanded={showList}
        aria-controls={listId}
        aria-autocomplete="list"
        aria-activedescendant={showList && results[active] ? `${listId}-${active}` : undefined}
        aria-label={t('search.label')}
        placeholder={t('search.placeholder')}
        value={query}
        disabled={!catalog}
        onChange={(e) => {
          setQuery(e.target.value);
          setActive(0);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={(e) => {
          if (e.key === 'Escape') {
            // With the list open, Escape only closes the list. Otherwise it clears the selection as usual.
            if (showList) e.stopPropagation();
            setOpen(false);
          } else if (e.key === 'ArrowDown') {
            e.preventDefault();
            setActive((a) => Math.min(a + 1, results.length - 1));
          } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setActive((a) => Math.max(a - 1, 0));
          } else if (e.key === 'Enter' && results[active]) {
            choose(results[active]);
          }
        }}
      />
      {showList && (
        <div className="search-results">
          {results.length === 0 ? (
            <p className="search-empty" role="status">{t('search.empty', { query: query.trim() })}</p>
          ) : (
            <ul id={listId} role="listbox" aria-label={t('search.results')}>
              {results.map((r, i) => {
                const name = lang === 'id' ? r.idn : r.en;
                const other = lang === 'id' ? r.en : r.idn;
                return (
                  <li key={`${r.kind}:${r.id}`} id={`${listId}-${i}`} role="option" aria-selected={i === active} className={i === active ? 'active' : undefined}>
                    <button type="button" tabIndex={-1} onClick={() => choose(r)} onPointerEnter={() => setActive(i)}>
                      <span className="result-name">{name}</span>
                      {other !== name && <span className="result-other">{other}</span>}
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
