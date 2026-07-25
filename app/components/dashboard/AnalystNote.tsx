"use client";

import { useEffect, useState } from "react";
import { ChevronDown, Sparkles } from "lucide-react";
import { toNYDateString } from "./utils";

type Narrative = {
  headline: string;
  narrative: string;
  model: string;
  generatedAt: string;
};

/**
 * AI Analyst Note. Loads independently of the main dashboard payload from
 * /api/dashboard/narrative so the gauge and blocks render immediately and the
 * note streams in when ready. Renders nothing if generation is unavailable.
 */
export function AnalystNote({ date }: { date: Date }) {
  const [note, setNote] = useState<Narrative | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    fetch(`/api/dashboard/narrative?date=${toNYDateString(date)}`)
      .then((res) => (res.ok ? res.json() : { narrative: null }))
      .then((d: { narrative: Narrative | null }) => {
        if (cancelled) return;
        setNote(d.narrative);
        setIsLoading(false);
      })
      .catch(() => {
        if (cancelled) return;
        setNote(null);
        setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [date]);

  if (isLoading) return <AnalystNoteCollapsedShell />;
  if (!note) return null;

  const paragraphs = note.narrative.split(/\n\s*\n/).filter((p) => p.trim().length > 0);
  const generatedLabel = note.generatedAt.slice(0, 10);

  return (
    <div className="bg-surface-raised border border-border-subtle rounded-xl overflow-hidden">
      <button
        type="button"
        onClick={() => setIsOpen((v) => !v)}
        aria-expanded={isOpen}
        className="w-full px-6 py-4 flex items-center justify-between gap-3 text-left hover:bg-surface-overlay/40 transition-colors cursor-pointer"
      >
        <div className="flex items-center gap-2 min-w-0">
          <Sparkles className="h-4 w-4 text-accent-blue shrink-0" />
          <h2 className="text-sm font-semibold text-text-primary uppercase tracking-wider shrink-0">AI Analyst Note</h2>
          {!isOpen && (
            <span className="text-[13px] text-text-secondary truncate ml-2 normal-case tracking-normal font-normal">
              {note.headline}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-[10px] font-mono text-text-secondary uppercase tracking-wider border border-border-subtle rounded px-1.5 py-0.5">
            AI Generated
          </span>
          <ChevronDown
            className={`h-4 w-4 text-text-secondary transition-transform ${isOpen ? "rotate-180" : ""}`}
          />
        </div>
      </button>

      {isOpen && (
        <>
          <div className="px-6 py-5 space-y-4 border-t border-border-subtle">
            <p className="text-[15px] font-semibold text-text-primary leading-snug">{note.headline}</p>
            <div className="space-y-3">
              {paragraphs.map((p, i) => (
                <p key={i} className="text-[13px] text-text-secondary leading-relaxed">
                  {p}
                </p>
              ))}
            </div>
          </div>

          <div className="px-6 py-3 border-t border-border-subtle flex items-center gap-2">
            <span className="text-[11px] font-mono text-text-secondary">
              {note.model} · {generatedLabel}
            </span>
          </div>
        </>
      )}
    </div>
  );
}

/**
 * Placeholder matching the collapsed card's exact height so the note arriving
 * (or turning out to be absent) doesn't shift surrounding layout.
 */
function AnalystNoteCollapsedShell() {
  return (
    <div className="bg-surface-raised border border-border-subtle rounded-xl overflow-hidden">
      <div className="w-full px-6 py-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <Sparkles className="h-4 w-4 text-text-secondary shrink-0" />
          <h2 className="text-sm font-semibold text-text-secondary uppercase tracking-wider shrink-0">AI Analyst Note</h2>
          <div className="h-3 w-64 max-w-full rounded bg-surface-overlay animate-pulse ml-2" />
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-[10px] font-mono text-text-secondary uppercase tracking-wider border border-border-subtle rounded px-1.5 py-0.5">
            AI Generated
          </span>
          <ChevronDown className="h-4 w-4 text-text-secondary" />
        </div>
      </div>
    </div>
  );
}
