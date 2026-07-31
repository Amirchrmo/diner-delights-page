import MenuCard from "./MenuCard";

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
}

/**
 * Renders a category section. Items are laid out right-to-left by priority:
 * the highest-priority item (lowest `order`) is on the far right, then
 * descending priority toward the left.
 */
const MenuSection = ({ title, items }: MenuSectionProps) => {
  // Ascending by order → first DOM node = highest priority.
  // With dir="rtl" on the grid, that node lands on the far right.
  const sortedItems = [...items].sort((a, b) => {
    const ao = a.order ?? Number.MAX_SAFE_INTEGER;
    const bo = b.order ?? Number.MAX_SAFE_INTEGER;
    if (ao !== bo) return ao - bo;
    return a.name.localeCompare(b.name, "fa");
  });

  return (
    <section className="mb-16">
      <h2 className="font-persian font-bold text-4xl text-charcoal mb-8 text-center relative">
        {title}
        <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-20 h-1 bg-gradient-to-r from-primary to-accent rounded-full"></div>
      </h2>
      <div
        dir="rtl"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        style={{ direction: "rtl" }}
      >
        {sortedItems.map((item) => (
          <MenuCard
            key={item.id}
            name={item.name}
            description={item.description}
            price={item.price}
            image={item.image}
            imageAlt={item.imageAlt}
          />
        ))}
      </div>
    </section>
  );
};

export default MenuSection;
