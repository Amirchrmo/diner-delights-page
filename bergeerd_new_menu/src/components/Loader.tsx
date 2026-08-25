import { useState, useEffect } from "react";
import LOGOLoader from "@/assets/LOGO-header.png";

/**
 * Full-screen branded intro loader.
 * Shows for a short fixed duration, then fades out smoothly. The logo is
 * wrapped in an animated glowing ring and floating embers.
 */
const Loader = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [fadingOut, setFadingOut] = useState(false);

  useEffect(() => {
    const fadeTimer = setTimeout(() => setFadingOut(true), 1300);
    const hideTimer = setTimeout(() => setIsLoading(false), 1750);
    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(hideTimer);
    };
  }, []);

  if (!isLoading) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center overflow-hidden"
      style={{
        background:
          "radial-gradient(circle at 50% 40%, hsl(0 84% 46%), hsl(0 80% 32%) 72%)",
        opacity: fadingOut ? 0 : 1,
        transition: "opacity 0.45s ease",
      }}
    >
      {/* Floating ember particles */}
      {Array.from({ length: 12 }).map((_, i) => (
        <span
          key={i}
          className="absolute block rounded-full"
          style={{
            width: `${4 + (i % 3) * 3}px`,
            height: `${4 + (i % 3) * 3}px`,
            left: `${(i * 37) % 100}%`,
            bottom: "-20px",
            background:
              i % 2 === 0
                ? "hsl(38 95% 60% / 0.7)"
                : "hsl(8 82% 56% / 0.7)",
            filter: "blur(0.5px)",
            animation: `steam ${2.4 + (i % 4) * 0.6}s ease-in ${
              (i % 5) * 0.4
            }s infinite`,
          }}
        />
      ))}

      <div className="relative flex flex-col items-center">
        {/* Logo + glowing rings */}
        <div className="relative h-40 w-40">
          <span className="absolute inset-0 animate-spin-slow rounded-full border-2 border-dashed border-primary/30" />
          <span className="absolute inset-2 rounded-full bg-primary/10 blur-md" />
          <span className="absolute inset-0 animate-pulse-glow rounded-full" />
          <div className="absolute inset-0 flex items-center justify-center">
            <img
              src={LOGOLoader}
              alt="Bergeerd"
              className="h-24 w-24 animate-float-soft object-contain drop-shadow-[0_0_18px_hsl(4_82%_54%_/_0.55)]"
            />
          </div>
        </div>

        {/* Tagline */}
        <h2 className="mt-8 font-persian text-2xl font-bold text-white">
          <span className="text-gradient-gold">برگرد</span>
          <span className="mx-2 text-white/60">،</span>
          یه گرد خوشمزه
        </h2>

        {/* Loading bar */}
        <div className="mt-5 h-1 w-44 overflow-hidden rounded-full bg-white/10">
          <div
            className="h-full rounded-full"
            style={{
              background: "var(--gradient-fire)",
              animation: "marquee 1.3s ease-in-out infinite",
            }}
          />
        </div>
        <p className="mt-3 font-persian text-sm text-white/50">
          یکم صبر کن...
        </p>
      </div>
    </div>
  );
};

export default Loader;
