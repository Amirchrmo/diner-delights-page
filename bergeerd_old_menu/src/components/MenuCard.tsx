import { Card, CardContent } from "@/components/ui/card";

interface MenuCardProps {
  name: string;
  description: string;
  price: string;
  image: string;
  imageAlt: string;
}

const MenuCard = ({ name, description, price, image, imageAlt }: MenuCardProps) => {
  return (
    <Card className="animate-menu-item overflow-hidden border-0 shadow-lg bg-card hover:shadow-xl transition-all duration-300">
      <div className="aspect-square overflow-hidden">
        <img 
          src={image} 
          alt={imageAlt}
          className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
        />
      </div>
      <CardContent className="p-6">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-persian font-semibold text-xl text-charcoal">{name}</h3>
          <span className="text-xl font-bold text-primary mr-4 font-persian">{price} تومان</span>
        </div>
        <p className="text-warm-gray text-sm leading-relaxed font-persian">{description}</p>
      </CardContent>
    </Card>
  );
};

export default MenuCard;