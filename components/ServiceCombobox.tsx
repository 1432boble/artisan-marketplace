'use client';

import { useEffect, useId, useMemo, useRef, useState } from 'react';
import { IconChevronDown, IconSearch, IconX } from '@tabler/icons-react';
import { matchServices, normalize, toLoggableQuery } from '@/lib/service-keywords';
import { track } from '@/lib/track';

const ALL_SERVICES = 'ALL_SERVICES';
const ALL_LABEL = 'Tous les services';
const LOG_DELAY_MS = 1500;
const LOGGED_KEY = 'biso_unmatched_logged';

// Queries already logged this session (sessionStorage, in-memory fallback).
const loggedFallback = new Set<string>();

/** Marks a query as logged; false if it already was. */
function markLogged(q: string): boolean {
  try {
    const seen: string[] = JSON.parse(sessionStorage.getItem(LOGGED_KEY) ?? '[]');
    if (seen.includes(q)) return false;
    sessionStorage.setItem(LOGGED_KEY, JSON.stringify([...seen, q]));
    return true;
  } catch {
    if (loggedFallback.has(q)) return false;
    loggedFallback.add(q);
    return true;
  }
}

export default function ServiceCombobox({
  value,
  onChange,
  services,
}: {
  value: string;
  onChange: (v: string) => void;
  services: string[];
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [listMax, setListMax] = useState<number>();
  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listId = useId();

  const matches = useMemo(() => matchServices(query, services), [query, services]);
  const typing = normalize(query).length >= 2;
  const options = typing
    ? matches.map((s) => ({ label: s, value: s }))
    : [{ label: ALL_LABEL, value: ALL_SERVICES }, ...services.map((s) => ({ label: s, value: s }))];

  const selectedLabel = value === ALL_SERVICES ? ALL_LABEL : value;

  const close = () => {
    setOpen(false);
    setQuery('');
  };

  const select = (v: string) => {
    onChange(v);
    close();
    inputRef.current?.blur();
  };

  useEffect(() => {
    function handleOutside(e: PointerEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) close();
    }
    document.addEventListener('pointerdown', handleOutside);
    return () => document.removeEventListener('pointerdown', handleOutside);
  }, []);

  // Keep the list above the on-screen keyboard: cap it to the visible viewport.
  useEffect(() => {
    if (!open) return;
    const vv = window.visualViewport;
    const fit = () => {
      const top = inputRef.current?.getBoundingClientRect().bottom ?? 0;
      const bottom = vv ? vv.offsetTop + vv.height : window.innerHeight;
      setListMax(Math.max(96, bottom - top - 12));
    };
    const frame = requestAnimationFrame(fit);
    vv?.addEventListener('resize', fit);
    vv?.addEventListener('scroll', fit);
    return () => {
      cancelAnimationFrame(frame);
      vv?.removeEventListener('resize', fit);
      vv?.removeEventListener('scroll', fit);
    };
  }, [open]);

  // Log a query that matches no service once typing pauses, once per session.
  useEffect(() => {
    if (services.length === 0 || matches.length > 0) return;
    const q = toLoggableQuery(query);
    if (!q) return;
    const timer = setTimeout(() => {
      if (markLogged(q)) track('search_unmatched', null, { query: q });
    }, LOG_DELAY_MS);
    return () => clearTimeout(timer);
  }, [query, matches.length, services.length]);

  return (
    <div ref={rootRef} className="relative">
      <div className="flex items-center rounded-xl border-[1.5px] border-brand bg-white">
        <IconSearch size={18} stroke={1.5} className="ml-4 shrink-0 text-brand" />
        <input
          ref={inputRef}
          type="text"
          role="combobox"
          aria-expanded={open}
          aria-controls={listId}
          aria-autocomplete="list"
          inputMode="search"
          enterKeyHint="search"
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="none"
          spellCheck={false}
          value={open ? query : selectedLabel}
          placeholder={open && selectedLabel ? selectedLabel : 'Choisir ou écrire un service'}
          onFocus={() => setOpen(true)}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onKeyDown={(e) => {
            if (e.key === 'Escape') {
              close();
              inputRef.current?.blur();
            }
            if (e.key === 'Enter' && options.length > 0) {
              e.preventDefault();
              select(options[0].value);
            }
          }}
          className="min-w-0 flex-1 bg-transparent px-3 py-3 text-base font-[400] text-brand outline-none placeholder:text-brand placeholder:opacity-60"
        />
        {query || value ? (
          <button
            type="button"
            aria-label="Effacer"
            onClick={() => {
              if (query) {
                setQuery('');
                inputRef.current?.focus();
              } else {
                onChange('');
                close();
              }
            }}
            className="flex h-12 w-12 shrink-0 items-center justify-center text-brand"
          >
            <IconX size={18} stroke={1.5} />
          </button>
        ) : (
          <IconChevronDown
            size={16}
            stroke={1.5}
            className={`mr-4 shrink-0 text-brand transition-transform ${open ? 'rotate-180' : ''}`}
          />
        )}
      </div>

      {open && (
        <div
          id={listId}
          role="listbox"
          style={{ maxHeight: listMax }}
          // Keep the input focused while tapping an option (no keyboard jump).
          onMouseDown={(e) => e.preventDefault()}
          className="absolute left-0 right-0 top-full z-50 mt-1 max-h-[60vh] overflow-y-auto overscroll-contain rounded-xl border border-border bg-white shadow-lg"
        >
          {services.length === 0 ? (
            <p className="px-4 py-4 text-base font-[300] text-muted">Chargement des services…</p>
          ) : options.length === 0 ? (
            <div className="px-4 py-4">
              <p className="text-base font-[400] text-ink">Aucun service trouvé</p>
              <button
                type="button"
                onClick={() => select(ALL_SERVICES)}
                className="mt-3 w-full rounded-xl bg-brand px-4 py-3 text-base font-[400] text-white"
              >
                Voir tous les artisans
              </button>
            </div>
          ) : (
            options.map((opt) => (
              <button
                key={opt.value}
                type="button"
                role="option"
                aria-selected={value === opt.value}
                onClick={() => select(opt.value)}
                className={`block min-h-12 w-full px-4 py-3 text-left text-base hover:bg-brand-light ${
                  value === opt.value ? 'font-[500] text-brand' : 'font-[400] text-ink'
                }`}
              >
                {opt.label}
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}
