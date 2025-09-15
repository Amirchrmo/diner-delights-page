import MenuCard from "./MenuCard";

interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: string;
  image: string;
  imageAlt: string;
}

interface MenuSectionProps {
  title: string;
  items: MenuItem[];
}

const MenuSection = ({ title, items }: MenuSectionProps) => {
  return (
    <section className="mb-16">
      <h2 className="font-persian font-bold text-4xl text-charcoal mb-8 text-center relative">
        {title}
        <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-20 h-1 bg-gradient-to-r from-primary to-accent rounded-full"></div>
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {items.map((item) => (
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