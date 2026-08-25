import LOGOHeader from "@/assets/bergerd1 tp.gif";
import LOGOTITLE from "@/assets/LOGO-title.png";
import { ChevronDown, Gamepad2 } from "lucide-react";

interface HeroProps {
  /** Smoothly scrolls to the menu when a CTA is clicked. */
  onExplore?: () => void;
}

/**
 * Hero / header section.
 *
 * Restored to the previous Bergeerd design: a solid brand-red (`#d2080b`)
 * full-screen section with the animated gif logo, the wordmark, the
 * "یه گرد خوشمزه" tagline, a thin white divider, and a floating scroll-down
 * chevron. The only elements carried over from the redesign are the two
 * CTA buttons: "مشاهده منو" (scrolls to menu) and "بازی" (scrolls to the
 * entertainment/game section).
 */
const Hero = ({ onExplore }: HeroProps) => {
  const scrollToContent = () => {
    const el = document.querySelector("main");
    if (el) el.scrollIntoView({ behavior: "smooth" });
    onExplore?.();
  };

  const scrollToMenu = () => {
    const el = document.getElementById("menu");
    if (el) el.scrollIntoView({ behavior: "smooth" });
    onExplore?.();
  };

  const scrollToGame = () => {
    const el = document.getElementById("entertainment");
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <header
      className="text-white relative flex min-h-screen items-center justify-center overflow-hidden"
      style={{ backgroundColor: "#d2080b" }}
    >
      <div className="container mx-auto px-4 text-center">
        {/* Logo and Title */}
        <div className="mb-5 flex flex-col items-center">
          <img
            src={LOGOHeader}
            alt="Bergeerd Logo"
            className="h-52 w-52 object-contain sm:h-60 sm:w-60 md:h-64 md:w-64"
          />
          <img
            src={LOGOTITLE}
            alt="Bergeerd"
            className="mb-3 h-28 w-auto md:h-32"
          />
        </div>

        {/* Tagline */}
        <p className="mx-auto max-w-2xl font-persian text-lg font-medium opacity-90 md:text-xl">
          یه گرد خوشمزه
        </p>

        {/* CTA buttons */}
        <div className="mt-7 flex flex-wrap items-center justify-center gap-4">
          <button
            onClick={scrollToMenu}
            className="rounded-full bg-white px-8 py-3.5 font-persian text-base font-bold text-[#d2080b] shadow-lg transition-transform duration-300 hover:scale-105 active:scale-95"
          >
            مشاهده منو
          </button>

          <button
            onClick={scrollToGame}
            className="flex items-center gap-2 rounded-full border border-white/40 bg-white/10 px-8 py-3.5 font-persian text-base font-bold text-white backdrop-blur transition-colors duration-300 hover:bg-white/20 active:scale-95"
          >
            <Gamepad2 className="h-5 w-5" />
            بازی
          </button>
        </div>

        {/* Divider */}
        <div className="mt-8">
          <div className="mx-auto inline-block h-1 w-32 rounded-full bg-white/30" />
        </div>
      </div>

      {/* Scroll Down Arrow */}
      <button
        onClick={scrollToContent}
        aria-label="پایین برو"
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 rounded-full p-2 text-white/80 transition-colors duration-300 hover:text-white focus:outline-none focus:ring-2 focus:ring-white/50"
      >
        <ChevronDown className="h-8 w-8 animate-float-down" strokeWidth={2} />
      </button>
    </header>
  );
};

export default Hero;
