import { useState } from "react";
import { Heart } from "lucide-react";

export interface MenuCardProps {
  name: string;
  description: string;
  price: string;
  image: string;
  imageAlt: string;
}

/**
 * Menu card.
 *
 * Clean, informational layout: image with a dark gradient scrim, a heart
 * "favorite" micro-interaction (persists in localStorage), the item name and
 * description, and the price shown at the bottom in the brand red. There is no
 * order/add button — the card only presents the menu item.
 */
const MenuCard = ({
  name,
  description,
  price,
  image,
  imageAlt,
}: MenuCardProps) => {
  const [liked, setLiked] = useState(
    () => typeof window !== "undefined" && !!getLikes()[name],
  );

  const toggleLike = () => {
    setLiked((prev) => {
      const next = !prev;
      const likes = getLikes();
      if (next) likes[name] = true;
      else delete likes[name];
      try {
        localStorage.setItem("bergeerd_likes", JSON.stringify(likes));
      } catch {
        /* ignore quota / privacy errors */
      }
      return next;
    });
  };

  return (
    <article className="group reveal reveal-scale relative flex h-full flex-col overflow-hidden rounded-3xl border border-border bg-card shadow-card transition-all duration-500 hover:-translate-y-1.5 hover:border-primary/40 hover:shadow-float">
      {/* image */}
      <div className="relative aspect-[4/3] overflow-hidden">
        <img
          src={image}
          alt={imageAlt}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
        />
        {/* scrim */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent" />

        {/* like button */}
        <button
          onClick={toggleLike}
          aria-label={liked ? "حذف از علاقه‌مندی" : "افزودن به علاقه‌مندی"}
          className={`absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full backdrop-blur transition-all duration-300 ${
            liked
              ? "bg-primary text-white"
              : "bg-black/40 text-white/90 hover:bg-black/60"
          } ${liked ? "animate-pop" : ""}`}
        >
          <Heart className={`h-4 w-4 ${liked ? "fill-current" : ""}`} />
        </button>
      </div>

      {/* body */}
      <div className="flex flex-1 flex-col p-5">
        <h3 className="font-persian text-xl font-bold text-foreground transition-colors group-hover:text-primary">
          {name}
        </h3>
        {description ? (
          <p className="mt-2 font-persian text-sm leading-relaxed text-muted-foreground line-clamp-3">
            {description}
          </p>
        ) : (
          <p className="mt-2 font-persian text-sm italic text-muted-foreground/60">
            افزودنی انتخابی
          </p>
        )}

        {/* price — at the bottom-left, in the brand red */}
        <p className="mt-auto pt-4 text-left font-persian text-lg font-extrabold text-primary">
          {price}
          <span className="mr-1 text-xs font-bold opacity-80">تومان</span>
        </p>
      </div>

      {/* hover glow ring */}
      <span className="pointer-events-none absolute inset-0 rounded-3xl opacity-0 transition-opacity duration-500 group-hover:opacity-100 group-hover:ring-1 group-hover:ring-primary/40" />
    </article>
  );
};

/** Helpers for persisting "likes" across the menu. */
function getLikes(): Record<string, boolean> {
  try {
    return JSON.parse(localStorage.getItem("bergeerd_likes") || "{}");
  } catch {
    return {};
  }
}

export default MenuCard;
