'use client';

import { useState } from 'react';

import Image from 'next/image';
import Link from 'next/link';
import { PenLine, PenSquare, Search, Settings2 } from 'lucide-react';

import { FollowingList } from '@/components/navigation/FollowingList';
import { navItems, type NavKey } from '@/components/navigation/nav-items';
import { type SearchSuggestion } from '@/types/search';
import { type GeminiSettings } from '@/types/settings';

type SearchControls = {
  query: string;
  onQueryChange: (value: string) => void;
  suggestions: SearchSuggestion[];
  onSuggestionSelect: (suggestion: SearchSuggestion, index?: number) => void;
  onSubmitTopSuggestion: () => void;
  settings: GeminiSettings;
  onSettingsChange: (settings: Partial<GeminiSettings>) => void;
};

type MediumShellProps = {
  children: React.ReactNode;
  currentNav: NavKey;
  onCompose?: () => void;
  following?: { label: string; imageSrc: string }[];
  rightRail?: React.ReactNode;
  search?: SearchControls;
};

export function MediumShell({
  children,
  currentNav,
  onCompose,
  following = [],
  rightRail,
  search,
}: MediumShellProps) {

  return (
    <div className="min-h-screen bg-[#f4f4f2] text-zinc-900">
      <MediumHeader onCompose={onCompose} search={search} />
      <main className="mx-auto flex max-w-[1500px] gap-10 px-6 pb-16 pt-6">
        <aside className="hidden w-52 flex-shrink-0 md:block">
          <nav className="space-y-4">
            <div className="text-sm font-medium text-zinc-500">Home</div>
            <ul className="space-y-2">
              {navItems.map((item) => {
                const isActive = item.key === currentNav;
                return (
                  <li key={item.key}>
                    <Link
                      href={item.href}
                      className={`flex items-center gap-3 rounded-full px-3 py-2 text-sm font-medium transition hover:bg-zinc-200 ${
                        isActive ? 'bg-black text-white hover:bg-black' : ''
                      }`}
                    >
                      <item.icon className={`h-4 w-4 ${isActive ? 'text-white' : 'text-emerald-600'}`} aria-hidden />
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          {following.length > 0 && <FollowingList following={following} />}
        </aside>

        <section className="min-w-0 flex-1">{children}</section>

        {rightRail && <aside className="hidden w-80 flex-shrink-0 lg:block">{rightRail}</aside>}
      </main>
    </div>
  );
}

type MediumHeaderProps = {
  onCompose?: () => void;
  search?: SearchControls;
};

function MediumHeader({ onCompose, search }: MediumHeaderProps) {
  return (
    <header className="border-b border-zinc-200 bg-white">
      <div className="mx-auto flex max-w-[1500px] items-center justify-between gap-6 px-6 py-4">
        <Link href="/" className="text-2xl font-semibold tracking-tight">
          <Image src="/logo.svg" alt="Medium Logo" width={100} height={40} />
        </Link>

        <div className="flex flex-1 items-center justify-center">
          {search ? <SearchBox {...search} /> : <div className="w-full max-w-md h-9" />}
        </div>

        <div className="flex items-center gap-3 text-sm">
          <button
            className="rounded-full border border-black px-4 py-2 font-semibold hover:bg-black hover:text-white"
            onClick={onCompose}
            disabled={!onCompose}
          >
            <span className="flex items-center gap-2">
              <PenSquare className="h-4 w-4" aria-hidden />
              Write
            </span>
          </button>
          <button className="rounded-full bg-black px-4 py-2 font-semibold text-white">Sign up</button>
          <button className="rounded-full border border-transparent px-4 py-2 font-semibold">
            <span className="flex items-center gap-2">
              <PenLine className="h-4 w-4" aria-hidden />
              Sign in
            </span>
          </button>
        </div>
      </div>
    </header>
  );
}

type SearchBoxProps = SearchControls;

function SearchBox({
  query,
  onQueryChange,
  suggestions,
  onSuggestionSelect,
  onSubmitTopSuggestion,
  settings,
  onSettingsChange,
}: SearchBoxProps) {
  const [isFocused, setIsFocused] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [tempSettings, setTempSettings] = useState(settings);
  const hasSuggestions = suggestions.length > 0;
  const shouldShowSuggestions = isFocused && hasSuggestions;

  // Update temp settings when settings prop changes
  useState(() => {
    setTempSettings(settings);
  });

  function handleSuggestionClick(suggestion: SearchSuggestion, index: number) {
    // Call the handler immediately
    onSuggestionSelect(suggestion, index);
    // Close dropdown immediately
    setIsFocused(false);
  }

  function toggleSettings() {
    setShowSettings((current) => {
      if (!current) {
        // Opening: sync temp with actual
        setTempSettings(settings);
      }
      return !current;
    });
  }

  function applySettings() {
    onSettingsChange(tempSettings);
    setShowSettings(false);
  }

  return (
    <div className="relative w-full max-w-md">
      <input
        type="text"
        value={query}
        onChange={(event) => onQueryChange(event.target.value)}
        onFocus={() => setIsFocused(true)}
        onKeyDown={(event) => {
          if (event.key === 'Enter' && hasSuggestions) {
            event.preventDefault();
            onSubmitTopSuggestion();
            setIsFocused(false);
          } else if (event.key === 'Escape') {
            setIsFocused(false);
            (event.currentTarget as HTMLInputElement).blur();
          }
        }}
        onBlur={() => {
          window.setTimeout(() => setIsFocused(false), 120);
        }}
        placeholder="Search ideas or code..."
        className="w-full rounded-full border border-zinc-200 bg-zinc-100 py-2 pl-10 pr-12 text-sm focus:border-black focus:bg-white focus:outline-none"
      />
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" aria-hidden />
      <button
        type="button"
        className="absolute right-2.5 top-1/2 flex -translate-y-1/2 items-center justify-center rounded-full p-1 text-zinc-500 hover:bg-zinc-200 hover:text-zinc-700"
        onMouseDown={(event) => event.preventDefault()}
        onClick={toggleSettings}
      >
        <Settings2 className="h-4 w-4" aria-hidden />
        <span className="sr-only">Configure Gemini</span>
      </button>

      {showSettings && (
        <div className="absolute right-0 top-full z-30 mt-2 w-80 overflow-hidden rounded-2xl border border-zinc-200 bg-white p-4 text-sm shadow-xl">
          <h3 className="mb-3 text-sm font-bold text-zinc-900">Gemini Settings</h3>
          <div className="flex flex-col gap-3">
            <label className="flex flex-col gap-1" htmlFor="search-api-key">
              <span className="text-xs font-semibold uppercase tracking-wide text-zinc-500">API key</span>
              <input
                id="search-api-key"
                type="password"
                value={tempSettings.apiKey}
                onChange={(event) => setTempSettings({ ...tempSettings, apiKey: event.target.value })}
                className="rounded-xl border border-zinc-300 bg-white px-3 py-2 text-sm focus:border-black focus:outline-none"
                placeholder="Override project key..."
                autoComplete="off"
              />
            </label>

            <label className="flex flex-col gap-1" htmlFor="search-model">
              <span className="text-xs font-semibold uppercase tracking-wide text-zinc-500">Model</span>
              <input
                id="search-model"
                type="text"
                value={tempSettings.model}
                onChange={(event) => setTempSettings({ ...tempSettings, model: event.target.value })}
                className="rounded-xl border border-zinc-300 bg-white px-3 py-2 text-sm focus:border-black focus:outline-none"
                placeholder="gemini-2.5-flash"
              />
            </label>

            <div className="mt-2 flex items-center justify-between gap-2">
              <div className="text-xs text-zinc-500">
                {settings.apiKey ? '✓ API key set' : '⚠ Using default key'}
              </div>
              <button
                type="button"
                onClick={applySettings}
                className="rounded-lg bg-emerald-600 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-700"
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}

      {shouldShowSuggestions && (
        <div className="absolute left-0 right-0 top-full z-20 mt-2 overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-xl">
          <ul className="divide-y divide-zinc-100">
            {suggestions.map((suggestion, index) => (
              <li key={suggestion.id}>
                <button
                  type="button"
                  className="flex w-full items-center justify-between gap-4 px-4 py-3 text-left hover:bg-zinc-50"
                  onMouseDown={(event) => {
                    event.preventDefault();
                    event.stopPropagation();
                  }}
                  onClick={(event) => {
                    event.preventDefault();
                    event.stopPropagation();
                    handleSuggestionClick(suggestion, index);
                  }}
                >
                  <span>
                    <span className="block text-sm font-semibold text-zinc-900">{suggestion.title}</span>
                    {suggestion.description && (
                      <span className="mt-1 block text-xs text-zinc-500">{suggestion.description}</span>
                    )}
                  </span>
                  {index === 0 && (
                    <span className="text-xs font-semibold uppercase tracking-wide text-emerald-600">Enter</span>
                  )}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
