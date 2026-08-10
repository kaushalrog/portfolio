import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { searchAll, searchIndex } from '@/search';
import type { SearchEntry } from '@/search';

const QUICK: { keys: string; label: string; to: string }[] = [
  { keys: '⌘P', label: 'Garage', to: '/garage' },
  { keys: '⌘R', label: 'Research', to: '/research' },
  { keys: '⌘E', label: 'Engineering', to: '/engineering' },
  { keys: '⌘T', label: 'Telemetry', to: '/telemetry' },
];

/** Shown before the visitor types — the highest-value destinations. */
const DEFAULT_IDS = [
  'nav:/garage',
  'project:sec-rag',
  'project:antbot',
  'project:scirag-uq',
  'project:wds-ids',
  'nav:/research',
  'nav:/engineering',
  'ext:resume',
];

export default function CommandPalette({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [query, setQuery] = useState('');
  const [active, setActive] = useState(0);
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const results = useMemo<SearchEntry[]>(() => {
    if (!query.trim()) {
      return DEFAULT_IDS.map((id) => searchIndex.find((e) => e.id === id)).filter(
        (e): e is SearchEntry => Boolean(e),
      );
    }
    return searchAll(query);
  }, [query]);

  // Global shortcuts: ⌘K opens, ⌘P/R/E/T jump straight there.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const mod = e.metaKey || e.ctrlKey;
      if (mod && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        onOpenChange(!open);
        return;
      }
      if (!mod) return;
      const quick = QUICK.find((q) => q.keys.toLowerCase().endsWith(e.key.toLowerCase()));
      if (quick) {
        e.preventDefault();
        onOpenChange(false);
        navigate(quick.to);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onOpenChange, navigate]);

  useEffect(() => {
    if (open) {
      setQuery('');
      setActive(0);
      // Focus after the panel is painted so the caret does not jump.
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [open]);

  useEffect(() => setActive(0), [query]);

  useEffect(() => {
    listRef.current
      ?.querySelector('[data-active="true"]')
      ?.scrollIntoView({ block: 'nearest' });
  }, [active]);

  if (!open) return null;

  const go = (entry: SearchEntry) => {
    onOpenChange(false);
    if (entry.href) {
      window.open(entry.href, '_blank', 'noopener,noreferrer');
    } else if (entry.to) {
      navigate(entry.to);
    }
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') return onOpenChange(false);
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActive((a) => (results.length ? (a + 1) % results.length : 0));
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActive((a) => (results.length ? (a - 1 + results.length) % results.length : 0));
    }
    if (e.key === 'Enter' && results[active]) {
      e.preventDefault();
      go(results[active]);
    }
  };

  let lastGroup = '';

  return (
    <div
      className="fixed inset-0 z-[160] flex items-start justify-center bg-void/85 backdrop-blur-sm sm:pt-[12vh]"
      onClick={() => onOpenChange(false)}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Command palette"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={onKeyDown}
        className="flex h-full w-full flex-col border-line bg-surface sm:h-auto sm:max-h-[70vh] sm:max-w-2xl sm:border"
      >
        <div className="flex items-center gap-3 border-b border-line px-5 py-4">
          <span className="label-tech text-accent">KGP</span>
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search projects, research, technologies…"
            aria-label="Search"
            className="mono flex-1 bg-transparent text-[0.875rem] text-ink placeholder:text-faint focus:outline-none"
          />
          <button
            onClick={() => onOpenChange(false)}
            className="label-tech-sm border border-line px-2 py-1 text-faint hover:text-ink"
          >
            ESC
          </button>
        </div>

        <div ref={listRef} className="flex-1 overflow-y-auto overscroll-contain">
          {results.length === 0 ? (
            <p className="label-tech px-5 py-8 text-center">
              No results for “{query}”
            </p>
          ) : (
            results.map((entry, i) => {
              const showGroup = entry.group !== lastGroup;
              lastGroup = entry.group;
              return (
                <div key={entry.id}>
                  {showGroup && (
                    <p className="label-tech-sm border-b border-line bg-void px-5 py-2">
                      {entry.group}
                    </p>
                  )}
                  <button
                    data-active={i === active}
                    onMouseEnter={() => setActive(i)}
                    onClick={() => go(entry)}
                    className={`flex w-full items-baseline gap-4 px-5 py-3 text-left transition-colors ${
                      i === active ? 'bg-accent-dim' : ''
                    }`}
                  >
                    <span
                      className={`mono text-[0.8125rem] ${
                        i === active ? 'text-accent' : 'text-ink'
                      }`}
                    >
                      {entry.title}
                    </span>
                    <span className="label-tech-sm ml-auto truncate text-right normal-case">
                      {entry.subtitle}
                    </span>
                  </button>
                </div>
              );
            })
          )}
        </div>

        <div className="hidden items-center gap-5 border-t border-line px-5 py-3 sm:flex">
          {QUICK.map((q) => (
            <span key={q.keys} className="label-tech-sm">
              <span className="mono text-muted">{q.keys}</span> {q.label}
            </span>
          ))}
          <span className="label-tech-sm ml-auto">↑↓ navigate · ↵ open</span>
        </div>
      </div>
    </div>
  );
}
