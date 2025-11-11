'use client';

import { FormEvent, useState } from 'react';

import { GeminiSettings } from '@/types/settings';

type ComposerState = {
  code: string;
  guidance: string;
};

type ComposerModalProps = {
  state: ComposerState;
  onChange: (state: ComposerState) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onClose: () => void | null;
  isPending: boolean;
  error: string | null;
  settings: GeminiSettings;
  onSettingsChange: (settings: Partial<GeminiSettings>) => void;
};

export function ComposerModal({
  state,
  onChange,
  onSubmit,
  onClose,
  isPending,
  error,
  settings,
  onSettingsChange,
}: ComposerModalProps) {
  const [showSettings, setShowSettings] = useState(false);
  const [tempSettings, setTempSettings] = useState(settings);

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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-2xl rounded-3xl bg-white p-6 shadow-xl">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Advanced Search</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-transparent p-2 hover:bg-zinc-100"
            disabled={isPending}
          >
            ✕
          </button>
        </div>
        <div className="mt-2 flex flex-col gap-3 text-sm text-zinc-600">
          <p>
            Search by detailing the article you want to find. Provide a code snippet
            and optional guidance to refine the search.
          </p>
          <button
            type="button"
            className="self-start text-xs font-semibold text-emerald-600 hover:text-emerald-700"
            onClick={toggleSettings}
          >
            {showSettings ? 'Hide Gemini settings' : 'Show Gemini settings'}
          </button>
        </div>

        {showSettings && (
          <div className="mt-4 rounded-2xl border border-zinc-200 bg-zinc-50 p-4 text-sm shadow-sm">
            <div className="flex flex-col gap-3">
              <label className="flex flex-col gap-1" htmlFor="composer-api-key">
                <span className="text-xs font-semibold uppercase tracking-wide text-zinc-500">API key</span>
                <input
                  id="composer-api-key"
                  type="password"
                  value={tempSettings.apiKey}
                  onChange={(event) => setTempSettings({ ...tempSettings, apiKey: event.target.value })}
                  className="rounded-xl border border-zinc-300 bg-white px-3 py-2 text-sm focus:border-black focus:outline-none"
                  placeholder="Override project key..."
                  autoComplete="off"
                />
              </label>

              <label className="flex flex-col gap-1" htmlFor="composer-model">
                <span className="text-xs font-semibold uppercase tracking-wide text-zinc-500">Model</span>
                <input
                  id="composer-model"
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

        <form
          className="mt-4 space-y-4"
          onSubmit={(event) => {
            event.preventDefault();
            onSubmit(event);
          }}
        >
          <div>
            <label className="text-sm font-semibold text-zinc-700" htmlFor="code">
              Search Query
            </label>
            <textarea
              id="code"
              name="code"
              required
              value={state.code}
              onChange={(event) => onChange({ ...state, code: event.target.value })}
              className="mt-2 h-18 w-full rounded-2xl border border-zinc-200 bg-zinc-50 p-4 font-mono text-xs leading-relaxed focus:border-black focus:bg-white focus:outline-none"
              placeholder="Paste your code sample here..."
            />
          </div>

          <div>
            <label className="text-sm font-semibold text-zinc-700" htmlFor="guidance">
              Optional direction
            </label>
            <textarea
              id="guidance"
              name="guidance"
              value={state.guidance}
              onChange={(event) => onChange({ ...state, guidance: event.target.value })}
              className="mt-2 h-20 w-full rounded-2xl border border-zinc-200 bg-zinc-50 p-3 text-sm focus:border-black focus:bg-white focus:outline-none"
              placeholder="Call out the outcome you want, audience, or tone."
            />
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <div className="flex justify-end gap-3">
            <button
              type="button"
              className="rounded-full border border-zinc-300 px-4 py-2 text-sm font-semibold"
              onClick={onClose}
              disabled={isPending}
            >
              Cancel
            </button>
            <button
              type="submit"
              data-composer-submit
              className="rounded-full bg-black px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:bg-zinc-500"
              disabled={isPending}
            >
              {isPending ? 'Searching…' : 'Search article'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export type { ComposerState };
