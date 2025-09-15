// Import all food images
import classicBurger from "@/assets/classic-burger.jpg";
import baconBurger from "@/assets/bacon-burger.jpg";
import bbqBurger from "@/assets/bbq-burger.jpg";
import doubleBurger from "@/assets/double-burger.jpg";
import friesImage from "@/assets/fries.jpg";
import onionRings from "@/assets/onion-rings.jpg";
import milkshake from "@/assets/milkshake.jpg";
import cola from "@/assets/cola.jpg";

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: string;
  image: string;
  imageAlt: string;
}

export const burgers: MenuItem[] = [
  {
    id: "classic-burger",
    name: "Classic Cheeseburger",
    description: "Juicy beef patty with melted American cheese, fresh lettuce, tomato, onion, and our special sauce on a toasted sesame bun.",
    price: "12.99",
    image: classicBurger,
    imageAlt: "Classic cheeseburger with fresh toppings"
  },
  {
    id: "bacon-burger",
    name: "Bacon Deluxe",
    description: "Premium beef patty topped with crispy bacon, Swiss cheese, lettuce, tomato, and smoky mayo on a brioche bun.",
    price: "15.99",
    image: baconBurger,
    imageAlt: "Bacon deluxe burger with crispy bacon"
  },
  {
    id: "bbq-burger",
    name: "BBQ Ranch Burger",
    description: "Flame-grilled patty with tangy BBQ sauce, crispy onion rings, cheddar cheese, and ranch dressing on a toasted bun.",
    price: "14.99",
    image: bbqBurger,
    imageAlt: "BBQ ranch burger with onion rings"
  }
];

export const fries: MenuItem[] = [
  {
    id: "classic-fries",
    name: "Classic Fries",
    description: "Golden, crispy French fries seasoned with our signature salt blend. Perfect for sharing or keeping all to yourself.",
    price: "4.99",
    image: friesImage,
    imageAlt: "Golden crispy French fries"
  },
  {
    id: "onion-rings",
    name: "Crispy Onion Rings",
    description: "Hand-battered onion rings fried to golden perfection. Served with our homemade ranch dipping sauce.",
    price: "6.99",
    image: onionRings,
    imageAlt: "Crispy golden onion rings"
  }
];

export const drinks: MenuItem[] = [
  {
    id: "vanilla-milkshake",
    name: "Vanilla Milkshake",
    description: "Thick and creamy vanilla milkshake made with premium ice cream, topped with whipped cream and a cherry.",
    price: "5.99",
    image: milkshake,
    imageAlt: "Creamy vanilla milkshake with whipped cream"
  },
  {
    id: "classic-cola",
    name: "Classic Cola",
    description: "Ice-cold cola served in a chilled glass with fresh ice. The perfect complement to any burger.",
    price: "2.99",
    image: cola,
    imageAlt: "Refreshing cola with ice"
  }
];

export const specials: MenuItem[] = [
  {
    id: "palace-special",
    name: "Palace Special",
    description: "Our signature double patty burger with everything - two beef patties, double cheese, bacon, lettuce, tomato, onion, pickles, and our secret Palace sauce.",
    price: "18.99",
    image: doubleBurger,
    imageAlt: "Palace special double burger with all toppings"
  }
];