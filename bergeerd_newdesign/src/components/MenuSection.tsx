import type { CSSProperties } from "react";
import MenuCard, { type MenuCardProps } from "./MenuCard";

interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: string;
  image: string;
  imageAlt: string;
  /** Display priority — lower values are higher priority (shown further right). */
  order?: number;
}

interface MenuSectionProps {
  title: string;
  items: MenuItem[];
  /** Stable id used as the scroll-spy target. Defaults to a slug of the title. */
  sectionId?: string;
  /** Index of the section, used for alternating accent styling. */
  index?: number;
}

const slugify = (s: string) =>
  s
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\u0600-\u06FF\w-]/g, "");

/**
 * Renders a category section with an id anchor (for sticky-nav scroll-spy),
 * an animated heading and a responsive RTL grid of MenuCards that stagger in.
 */
const MenuSection = ({
  title,
  items,
  sectionId,
  index = 0,
}: MenuSectionProps) => {
  // Ascending by order → first DOM node = highest priority (far right in RTL).
  const sortedItems = [...items].sort((a, b) => {
    const ao = a.order ?? Number.MAX_SAFE_INTEGER;
    const bo = b.order ?? Number.MAX_SAFE_INTEGER;
    if (ao !== bo) return ao - bo;
    return a.name.localeCompare(b.name, "fa");
  });

  const id = sectionId || `section-${slugify(title)}`;

  return (
    <section id={id} className="scroll-mt-24 py-12">
      {/* Heading */}
      <div className="reveal mb-10 flex flex-col items-center text-center">
        <h2 className="relative font-persian text-4xl font-black text-foreground md:text-5xl">
          <span className="text-gradient-red">{title}</span>
          <span className="absolute -bottom-3 left-1/2 h-1 w-24 -translate-x-1/2 rounded-full bg-gradient-to-l from-primary to-gold" />
        </h2>
      </div>

      {/* Grid */}
      <div
        dir="rtl"
        className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
      >
        {sortedItems.map((item, i) => (
          <div
            key={`${item.id}-${i}`}
            className="reveal reveal-scale"
            style={{ "--reveal-delay": `${Math.min(i, 8) * 70}ms` } as CSSProperties}
          >
            <MenuCard
              name={item.name}
              description={item.description}
              price={item.price}
              image={item.image}
              imageAlt={item.imageAlt}
            />
          </div>
        ))}
      </div>
    </section>
  );
};

export type { MenuCardProps };
export default MenuSection;
