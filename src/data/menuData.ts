// Import all food images
import classicBurger from "@/assets/classic-burger.jpg";
import baconBurger from "@/assets/bacon-burger.jpg";
import bbqBurger from "@/assets/bbq-burger.jpg";
import doubleBurger from "@/assets/double-burger.jpg";
import friesImage from "@/assets/fries.jpg";
import topImage from "@/assets/top.png";
import cola from "@/assets/cola.jpg";
import morgSandwich from "@/assets/morg-sandwich.png";
import lemon from "@/assets/lemon.png";

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
    name: "کلاسیک برگرد",
    description:
      "۱۵۰ گرم گوشت آبدار با کاهو تازه،پیاز، گوجه، خیارشور و سس برگرد روی نان کره ای به همراه سیب زمینی.",
    price: "۳۲۰",
    image: classicBurger,
    imageAlt: "برگر کلاسیک با مخلفات تازه",
  },
  {
    id: "caramel-burger",
    name: "کارامل برگرد",
    description:
      "۱۵۰ گرم گوشت آبدار با پیاز کاراملی، کاهو تازه، گوجه، خیارشور و سس برگرد روی نان کره ای به همراه سیب زمینی.",
    price: "۳۵۰",
    image: classicBurger,
    imageAlt: "برگر کارامل با مخلفات تازه",
  },
  {
    id: "spoysi-burger",
    name: "اسپایسی برگرد",
    description:
      "۱۵۰ گرم گوشت آبدار با هالوپینو تند، کاهو تازه، گوجه، خیارشور و سس برگرد روی نان کره ای به همراه سیب زمینی.",
    price: "۳۵۰",
    image: classicBurger,
    imageAlt: "برگر کارامل با مخلفات تازه",
  },
  {
    id: "cheese-burger",
    name: "چیز برگرد",
    description:
      "۱۵۰ گرم گوشت آبدار با دو ورق پنیر چدار ذوب شده، کاهو تازه، گوجه، خیارشور و سس برگرد روی نان کره ای به همراه سیب زمینی.",
    price: "۳۵۰",
    image: classicBurger,
    imageAlt: "چیزبرگر با پنیر ذوب شده",
  },
  {
    id: "mushroom-burger",
    name: "ماشروم برگرد",
    description:
      "۱۵۰ گرم گوشت آبدار با قارچ، کاهو تازه،پنیر صبحانه، خامه، گوجه،خیارشور، پیازچه و سس برگرد روی نان کره ای به همراه سیب زمینی.",
    price: "۳۷۰",
    image: classicBurger,
    imageAlt: "ماشروم برگر با قارچ تازه",
  },
  {
    id: "smoky-burger",
    name: "دودی برگرد",
    description:
      "۱۵۰ گرم گوشت آبدار با دو ورق پنیر دودی، کاهو تازه،پاپریکای کبابی، گوجه، خیارشور و سس برگرد روی نان کره ای به همراه سیب زمینی.",
    price: "۳۷۰",
    image: classicBurger,
    imageAlt: "برگر دودی با طعم باربیکیو",
  },
  {
    id: "local-burger",
    name: "محلی برگرد",
    description:
      "۱۵۰ گرم گوشت آبدار با پنیر لیقوان، ریحان تازه، گوجه، خیارشور و سس سیر روی نان کره ای به همراه سیب زمینی.",
    price: "۳۷۰",
    image: classicBurger,
    imageAlt: "برگر محلی با مواد محلی",
  },
  // {
  //   id: "chickeq-burger",
  //   name: "ساندویچ مرغ",
  //   description:
  //     "۱۵۰ گرم فیله مرغ با خیار، گوجه، ریحان تازه، و سس انبه روی نان کره ای به همراه سیب زمینی.",
  //   price: "۲۵۰",
  //   image: morgSandwich,
  //   imageAlt: "برگر محلی با مواد محلی",
  // },
];

export const fries: MenuItem[] = [
  {
    id: "classic-fries",
    name: "سیب زمینی",
    description: "سیب‌زمینی طلایی و ترد با ادویه برگرد.",
    price: "۱۵۰",
    image: friesImage,
    imageAlt: "سیب‌زمینی طلایی ترد",
  },
];
export const toppings: MenuItem[] = [
  {
    id: "classic-topping",
    name: "تاپینگ اضافه",
    description: "پیاز کاراملی، پنیر دودی، پنیر چدار، هالوپینو.",
    price: "۳۰",
    image: topImage,
    imageAlt: "تاپینگ اضافه",
  },
];

export const drinks: MenuItem[] = [
  {
    id: "classic-cola",
    name: "کولا",
    description: "کولا با یخ در لیوان. مکمل عالی برای هر برگری.",
    price: "۵۵",
    image: cola,
    imageAlt: "کولا خنک‌کننده با یخ",
  },
  {
    id: "zero-cola",
    name: "زیرو",
    description: "کولا زیرو بدون قند با یخ. انتخاب سالم برای همراهی با برگر.",
    price: "۵۵",
    image: cola,
    imageAlt: "کولا زیرو بدون قند",
  },
  {
    id: "lemonade",
    name: "لیموناد",
    description: "لیموناد خنک با طعم لیمو طبیعی.",
    price: "۵۵",
    image: lemon,
    imageAlt: "لیموناد تازه و خنک",
  },
];
