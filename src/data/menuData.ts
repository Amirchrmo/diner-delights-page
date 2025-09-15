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
    name: "چیزبرگر کلاسیک",
    description: "گوشت گاو آبدار با پنیر آمریکایی ذوب شده، کاهو تازه، گوجه، پیاز و سس مخصوص ما روی نان کنجدی برشته.",
    price: "۳۲۰,۰۰۰",
    image: classicBurger,
    imageAlt: "چیزبرگر کلاسیک با مخلفات تازه"
  },
  {
    id: "bacon-burger",
    name: "برگر بیکن دلوکس",
    description: "گوشت گاو ممتاز با بیکن ترد، پنیر سوئیسی، کاهو، گوجه و مایونز دودی روی نان بریوش.",
    price: "۳۹۰,۰۰۰",
    image: baconBurger,
    imageAlt: "برگر دلوکس بیکن با بیکن ترد"
  },
  {
    id: "bbq-burger",
    name: "برگر باربیکیو رانچ",
    description: "کتلت گوشت کبابی با سس باربیکیو، حلقه پیاز ترد، پنیر چدار و سس رانچ روی نان برشته.",
    price: "۳۶۰,۰۰۰",
    image: bbqBurger,
    imageAlt: "برگر باربیکیو رانچ با حلقه پیاز"
  }
];

export const fries: MenuItem[] = [
  {
    id: "classic-fries",
    name: "سیب‌زمینی کلاسیک",
    description: "سیب‌زمینی طلایی و ترد با طعم‌دار کردن با نمک مخصوص ما. مناسب برای اشتراک یا خوردن به تنهایی.",
    price: "۱۲۰,۰۰۰",
    image: friesImage,
    imageAlt: "سیب‌زمینی طلایی ترد"
  },
  {
    id: "onion-rings",
    name: "حلقه‌های پیاز ترد",
    description: "حلقه‌های پیاز دست‌ساز در آرد سرخ شده تا رسیدن به رنگ طلایی. همراه با سس رانچ خانگی.",
    price: "۱۷۰,۰۰۰",
    image: onionRings,
    imageAlt: "حلقه‌های پیاز طلایی ترد"
  }
];

export const drinks: MenuItem[] = [
  {
    id: "vanilla-milkshake",
    name: "میلک‌شیک وانیل",
    description: "میلک‌شیک غلیظ و خامه‌ای وانیل ساخته شده با بستنی درجه یک، تزئین شده با خامه و آلبالو.",
    price: "۱۴۰,۰۰۰",
    image: milkshake,
    imageAlt: "میلک‌شیک وانیل خامه‌ای با خامه"
  },
  {
    id: "classic-cola",
    name: "کولا کلاسیک",
    description: "کولا یخ‌زده در لیوان سرد با یخ تازه. مکمل عالی برای هر برگری.",
    price: "۷۰,۰۰۰",
    image: cola,
    imageAlt: "کولا خنک‌کننده با یخ"
  }
];

export const specials: MenuItem[] = [
  {
    id: "palace-special",
    name: "اسپشیال قصر",
    description: "برگر دو لایه مخصوص ما با همه چیز - دو کتلت گوشت، پنیر دوبل، بیکن، کاهو، گوجه، پیاز، خیارشور و سس مخفی قصر.",
    price: "۴۶۰,۰۰۰",
    image: doubleBurger,
    imageAlt: "اسپشیال قصر برگر دوبل با همه مخلفات"
  }
];