import { useCallback, useEffect, useRef, useState } from "react";
import { RotateCcw, Trophy, Sparkles, Timer, FlipHorizontal } from "lucide-react";

/* ============================================================
   "حافظه برگرد" — Classic Memory Match (Concentration).

   Find the pairs of food emojis. Flip two cards at a time; if they
   match they stay open. Match all pairs to win, with the fewest
   moves and fastest time. Universally recognized, fully touch-friendly.
   ============================================================ */

interface Card {
  id: number;
  emoji: string;
  /** Matches another card with the same `pair`. */
  pair: number;
}

/** Food-themed emojis for the card faces. */
const EMOJIS = ["🍔", "🍟", "🧀", "🥤", "🥓", "🌶️", "🥬", "🍞"];

const BEST_KEY = "bergeerd_memory_best";

/** Fisher–Yates shuffle (returns a new array). */
function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** Build a fresh deck: 8 unique foods × 2 = 16 cards, shuffled. */
function buildDeck(): Card[] {
  const pairs = EMOJIS.map((emoji, i) => [
    { id: i * 2, emoji, pair: i },
    { id: i * 2 + 1, emoji, pair: i },
  ]).flat();
  return shuffle(pairs).map((c, idx) => ({ ...c, id: idx }));
}

type Status = "idle" | "playing" | "won";

const GameSection = () => {
  const [deck, setDeck] = useState<Card[]>(buildDeck);
  const [flipped, setFlipped] = useState<number[]>([]); // indices currently face-up (max 2)
  const [matched, setMatched] = useState<Set<number>>(new Set()); // pair numbers matched
  const [moves, setMoves] = useState(0);
  const [seconds, setSeconds] = useState(0);
  const [status, setStatus] = useState<Status>("idle");
  const [best, setBest] = useState<number | null>(null);
  const [wrong, setWrong] = useState<number[]>([]); // indices briefly shown as wrong
  const lockRef = useRef(false);

  // Load best score.
  useEffect(() => {
    try {
      const saved = Number(localStorage.getItem(BEST_KEY));
      setBest(Number.isNaN(saved) ? null : saved);
    } catch {
      /* ignore */
    }
  }, []);

  // Timer.
  useEffect(() => {
    if (status !== "playing") return;
    const t = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(t);
  }, [status]);

  // Win detection.
  useEffect(() => {
    if (status === "playing" && matched.size === EMOJIS.length) {
      setStatus("won");
      setBest((prevBest) => {
        const newBest = prevBest === null ? moves : Math.min(prevBest, moves);
        try {
          localStorage.setItem(BEST_KEY, String(newBest));
        } catch {
          /* ignore */
        }
        return newBest;
      });
    }
  }, [matched, status, moves]);

  const startGame = useCallback(() => {
    setDeck(buildDeck());
    setFlipped([]);
    setMatched(new Set());
    setMoves(0);
    setSeconds(0);
    setWrong([]);
    setStatus("playing");
    lockRef.current = false;
  }, []);

  const handleFlip = useCallback(
    (index: number) => {
      if (status !== "playing") return;
      if (lockRef.current) return;
      if (flipped.includes(index)) return;
      if (matched.has(deck[index].pair)) return;

      const nextFlipped = [...flipped, index];
      setFlipped(nextFlipped);

      // When two are flipped, evaluate.
      if (nextFlipped.length === 2) {
        setMoves((m) => m + 1);
        const [a, b] = nextFlipped;
        if (deck[a].pair === deck[b].pair) {
          // Match — keep them up, clear the flipped buffer shortly.
          lockRef.current = true;
          setTimeout(() => {
            setMatched((prev) => new Set(prev).add(deck[a].pair));
            setFlipped([]);
            lockRef.current = false;
          }, 450);
        } else {
          // No match — flip back after a short reveal.
          lockRef.current = true;
          setWrong([a, b]);
          setTimeout(() => {
            setFlipped([]);
            setWrong([]);
            lockRef.current = false;
          }, 850);
        }
      }
    },
    [status, flipped, matched, deck],
  );

  const isFaceUp = (index: number) =>
    flipped.includes(index) || matched.has(deck[index].pair);

  const isWrong = (index: number) => wrong.includes(index);
  const isMatched = (index: number) => matched.has(deck[index].pair);

  return (
    <section
      id="entertainment"
      className="relative scroll-mt-24 overflow-hidden py-20"
    >
      {/* bg accents */}
      <div className="bg-dots absolute inset-0 opacity-30" />
      <div className="absolute left-1/2 top-10 h-72 w-72 -translate-x-1/2 rounded-full bg-primary/20 blur-3xl" />

      <div className="container relative mx-auto px-4">
        {/* Heading */}
        <div className="reveal mb-8 text-center">
          <span className="mb-3 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 font-persian text-xs text-primary">
            <Sparkles className="h-3.5 w-3.5" />
            هنگام انتظار سرگرم شو
          </span>
          <h2 className="font-persian text-4xl font-black text-foreground md:text-5xl">
            <span className="text-gradient-red">بازی حافظه</span>
          </h2>
          <p className="mx-auto mt-4 max-w-md font-persian text-sm leading-relaxed text-muted-foreground">
            کارت‌ها رو برگردون و جفت غذاهای هم‌شکل رو پیدا کن. با کمترین حرکت و
            سریع‌ترین زمان برنده شو! 🍔🍟
          </p>
        </div>

        {/* Game board */}
        <div className="reveal reveal-scale mx-auto max-w-md">
          <div className="rounded-3xl border border-border bg-card p-5 shadow-float md:p-7">
            {/* HUD */}
            <div className="mb-5 grid grid-cols-3 gap-3">
              <Hud label="حرکت" value={toPersian(moves)} Icon={FlipHorizontal} />
              <Hud
                label="زمان"
                value={formatTime(seconds)}
                Icon={Timer}
              />
              <Hud
                label={best === null ? "رکورد" : "بهترین"}
                value={best === null ? "—" : toPersian(best)}
                Icon={Trophy}
              />
            </div>

            {/* Win banner */}
            {status === "won" && (
              <div className="animate-pop mb-5 rounded-2xl border border-primary/30 bg-primary/10 p-4 text-center">
                <p className="font-persian text-lg font-black text-gradient-red">
                  🎉 آفرین! برنده شدی!
                </p>
                <p className="mt-1 font-persian text-sm text-muted-foreground">
                  با {toPersian(moves)} حرکت در {formatTime(seconds)} ثانیه
                </p>
              </div>
            )}

            {/* Card grid */}
            <div className="grid grid-cols-4 gap-2.5 sm:gap-3">
              {deck.map((card, index) => {
                const faceUp = isFaceUp(index);
                const matchedCls = isMatched(index);
                const wrongCls = isWrong(index);
                return (
                  <button
                    key={card.id}
                    onPointerDown={() => handleFlip(index)}
                    disabled={status !== "playing" || faceUp}
                    aria-label={faceUp ? card.emoji : "کارت پنهان"}
                    className="group relative aspect-square [perspective:700px]"
                  >
                    <div
                      className={`relative h-full w-full rounded-xl transition-transform duration-500 [transform-style:preserve-3d] ${
                        faceUp ? "[transform:rotateY(180deg)]" : ""
                      }`}
                    >
                      {/* Back (face down) */}
                      <div
                        className="absolute inset-0 flex items-center justify-center rounded-xl border-2 border-primary/30 bg-gradient-to-br from-primary to-burger-red-dark text-white shadow-md [backface-visibility:hidden] group-hover:brightness-110 group-active:scale-95"
                      >
                        <span className="font-persian text-lg font-black opacity-80">
                          بر
                        </span>
                      </div>
                      {/* Front (face up) */}
                      <div
                        className={`absolute inset-0 flex items-center justify-center rounded-xl border-2 text-3xl [backface-visibility:hidden] [transform:rotateY(180deg)] sm:text-4xl ${
                          wrongCls
                            ? "animate-shake border-red-400 bg-red-50"
                            : matchedCls
                              ? "border-gold bg-gold/10"
                              : "border-border bg-background"
                        }`}
                      >
                        {card.emoji}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Controls */}
            <div className="mt-6 flex items-center justify-center">
              <button
                onClick={startGame}
                className="flex items-center gap-2 rounded-full bg-primary px-7 py-3 font-persian text-sm font-bold text-white shadow-glow transition-transform hover:scale-105 active:scale-95"
              >
                <RotateCcw className="h-4 w-4" />
                {status === "idle"
                  ? "شروع بازی"
                  : status === "won"
                    ? "دوباره بازی کن"
                    : "شروع دوباره"}
              </button>
            </div>
          </div>

          {/* tip */}
          <p className="mt-4 text-center font-persian text-xs text-muted-foreground">
            💡 نکته: هر بار دو کارت رو برمی‌داری. جفت‌های هم‌شکل رو حفظ کن تا سریع‌تر
            پیدا کنی!
          </p>
        </div>
      </div>
    </section>
  );
};

/** Small HUD stat tile. */
function Hud({
  label,
  value,
  Icon,
}: {
  label: string;
  value: string;
  Icon: typeof Trophy;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-border bg-primary/5 px-2 py-3">
      <Icon className="mb-1 h-4 w-4 text-primary" />
      <span className="font-persian text-[11px] text-muted-foreground">
        {label}
      </span>
      <span className="font-persian text-lg font-black text-foreground">
        {value}
      </span>
    </div>
  );
}

/** Convert Western digits to Persian for display. */
function toPersian(n: number | string): string {
  return String(n).replace(/\d/g, (d) => "۰۱۲۳۴۵۶۷۸۹"[+d]);
}

/** mm:ss style format. */
function formatTime(total: number): string {
  const m = Math.floor(total / 60);
  const s = total % 60;
  const mm = m > 0 ? `${toPersian(m)}:` : "";
  return `${mm}${toPersian(s.toString().padStart(2, "0"))}`;
}

export default GameSection;
