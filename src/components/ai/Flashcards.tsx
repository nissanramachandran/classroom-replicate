// Simple flip-card renderer for flashcard JSON output
import React, { useMemo, useState } from 'react';

interface Card { q: string; a: string; }

const parseCards = (raw: string): Card[] => {
  const cleaned = raw.trim().replace(/^```(?:json)?\s*/i, '').replace(/```$/, '').trim();
  try {
    const arr = JSON.parse(cleaned);
    if (Array.isArray(arr)) {
      return arr
        .filter((c: any) => c && typeof c === 'object' && (c.q || c.question) && (c.a || c.answer))
        .map((c: any) => ({ q: c.q || c.question, a: c.a || c.answer }));
    }
  } catch { /* streaming may be partial */ }
  return [];
};

const Flashcards: React.FC<{ raw: string }> = ({ raw }) => {
  const cards = useMemo(() => parseCards(raw), [raw]);
  const [flipped, setFlipped] = useState<Record<number, boolean>>({});

  if (cards.length === 0) {
    return <div className="text-sm text-on-surface-variant">Generating flashcards…</div>;
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {cards.map((c, i) => (
        <button
          key={i}
          onClick={() => setFlipped((f) => ({ ...f, [i]: !f[i] }))}
          className="text-left rounded-xl border border-border bg-background hover:bg-surface-variant transition-colors p-4 min-h-[130px]"
        >
          <div className="text-[11px] text-on-surface-variant mb-1">Card {i + 1} · click to flip</div>
          <div className="text-sm text-foreground whitespace-pre-wrap">
            {flipped[i] ? <><b>A:</b> {c.a}</> : <><b>Q:</b> {c.q}</>}
          </div>
        </button>
      ))}
    </div>
  );
};

export default Flashcards;
