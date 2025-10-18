// Import all food images
import classicBurger from "@/assets/classic-burger.jpg";
import baconBurger from "@/assets/bacon-burger.jpg";
import bbqBurger from "@/assets/bbq-burger.jpg";
import doubleBurger from "@/assets/double-burger.jpg";
import friesImage from "@/assets/fries.jpg";
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
    name: "برگر کلاسیک",
    description:
      "گوشت گاو آبدار با کاهو تازه، گوجه، پیاز و سس مخصوص ما روی نان کنجدی برشته.",
    price: "۳۲۰",
    image: classicBurger,
    imageAlt: "برگر کلاسیک با مخلفات تازه",
  },
  {
    id: "cheese-burger",
    name: "چیزبرگر",
    description:
      "گوشت گاو آبدار با پنیر آمریکایی ذوب شده، کاهو تازه، گوجه، پیاز و سس مخصوص ما.",
    price: "۳۵۰",
    image: classicBurger,
    imageAlt: "چیزبرگر با پنیر ذوب شده",
  },
  {
    id: "mushroom-burger",
    name: "ماشروم برگر",
    description:
      "گوشت گاو آبدار با قارچ تازه، پنیر سوئیسی، کاهو، گوجه و سس مخصوص ما.",
    price: "۳۷۰",
    image: classicBurger,
    imageAlt: "ماشروم برگر با قارچ تازه",
  },
  {
    id: "smoky-burger",
    name: "برگر دودی",
    description:
      "گوشت گاو آبدار با طعم دودی، پنیر چدار، کاهو، گوجه و سس باربیکیو.",
    price: "۳۷۰",
    image: classicBurger,
    imageAlt: "برگر دودی با طعم باربیکیو",
  },
  {
    id: "local-burger",
    name: "برگر محلی",
    description:
      "گوشت گاو محلی آبدار با پنیر محلی، کاهو تازه، گوجه، پیاز و سس مخصوص محلی.",
    price: "۳۸۰",
    image: classicBurger,
    imageAlt: "برگر محلی با مواد محلی",
  },
];

export const fries: MenuItem[] = [
  {
    id: "classic-fries",
    name: "سیب زمینی",
    description:
      "سیب‌زمینی طلایی و ترد با طعم‌دار کردن با نمک مخصوص ما. مناسب برای اشتراک یا خوردن به تنهایی.",
    price: "۱۵۰",
    image: friesImage,
    imageAlt: "سیب‌زمینی طلایی ترد",
  },
];

export const drinks: MenuItem[] = [
  {
    id: "classic-cola",
    name: "کولا",
    description:
      "کولا یخ‌زده در لیوان سرد با یخ تازه. مکمل عالی برای هر برگری.",
    price: "۵۵",
    image: cola,
    imageAlt: "کولا خنک‌کننده با یخ",
  },
  {
    id: "zero-cola",
    name: "زیرو",
    description:
      "کولا زیرو بدون قند در لیوان سرد با یخ تازه. انتخاب سالم برای همراهی با برگر.",
    price: "۵۵",
    image: cola,
    imageAlt: "کولا زیرو بدون قند",
  },
  {
    id: "lemonade",
    name: "لیموناد",
    description:
      "لیموناد تازه و خنک با طعم لیمو طبیعی. نوشیدنی طراوت‌بخش برای همراهی با غذا.",
    price: "۵۵",
    image: cola,
    imageAlt: "لیموناد تازه و خنک",
  },
];
