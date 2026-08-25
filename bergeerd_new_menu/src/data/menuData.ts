// Import all food images
import classicBurger from "@/assets/real-classic.jpg";
import karamel from "@/assets/real-karamel.jpg";
import spoicy from "@/assets/real-spoicy.jpg";
import chiz from "@/assets/real-chiz.jpg";
import mash from "@/assets/real-mashroom.jpg";
import doody from "@/assets/real-doody.jpg";
import mahali from "@/assets/real-mahali.jpg";
import beyken from "@/assets/real-beyken.jpg";
import chiken from "@/assets/real-chiken.jpg";



import friesImage from "@/assets/sibzamini.jpg";
import topImage from "@/assets/top.png";
// import lemon from "@/assets/lemon.png";
import cola from "@/assets/cola.jpg";
import fanta from "@/assets/fanta.png";
import beer from "@/assets/bear.png";

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: string;
  image: string;
  imageAlt: string;
  /**
   * Display order within a category, ascending. Lower values render first.
   * Optional so the static fallback data (which has no explicit order) keeps
   * working; API-sourced items always carry this field.
   */
  order?: number;
}

export const burgers: MenuItem[] = [
  {
    id: "classic-burger",
    name: "کلاسیک برگرد",
    description:
      "۱۳۰ گرم گوشت گوساله آبدار با کاهو تازه،پیاز، گوجه، خیارشور و سس برگرد روی نان کره ای به همراه سیب زمینی.",
    price: "۵۹۰",
    image: classicBurger,
    imageAlt: "برگر کلاسیک با مخلفات تازه",
  },
  {
    id: "caramel-burger",
    name: "کارامل برگرد",
    description:
      "۱۳۰ گرم گوشت گوساله آبدار با پیاز کاراملی، کاهو تازه، گوجه، خیارشور و سس برگرد روی نان کره ای به همراه سیب زمینی.",
    price: "۶۶۰",
    image: karamel,
    imageAlt: "برگر کارامل با مخلفات تازه",
  },
  {
    id: "spoysi-burger",
    name: "اسپایسی برگرد",
    description:
      "۱۳۰ گرم گوشت گوساله آبدار با هالوپینو تند، کاهو تازه، گوجه، خیارشور و سس برگرد روی نان کره ای به همراه سیب زمینی.",
    price: "۶۴۰",
    image: spoicy,
    imageAlt: "برگر کارامل با مخلفات تازه",
  },
  {
    id: "cheese-burger",
    name: "چیز برگرد",
    description:
      "۱۳۰ گرم گوشت گوساله آبدار با دو ورق پنیر چدار ذوب شده، کاهو تازه، گوجه، خیارشور و سس برگرد روی نان کره ای به همراه سیب زمینی.",
    price: "۶۶۰",
    image: chiz,
    imageAlt: "چیزبرگر با پنیر ذوب شده",
  },
  {
    id: "mushroom-burger",
    name: "ماشروم برگرد",
    description:
      "۱۳۰ گرم گوشت گوساله آبدار با سس قارچ، کاهو تازه، گوجه،خیارشور و پیازچه روی نان کره ای به همراه سیب زمینی.",
    price: "۶۹۰",
    image: mash,
    imageAlt: "ماشروم برگر با قارچ تازه",
  },
  {
    id: "smoky-burger",
    name: "دودی برگرد",
    description:
      "۱۳۰ گرم گوشت گوساله آبدار با دو ورق پنیر دودی، کاهو تازه،پاپریکای کبابی، گوجه، خیارشور و سس برگرد روی نان کره ای به همراه سیب زمینی.",
    price: "۶۹۰",
    image: doody,
    imageAlt: "برگر دودی با طعم باربیکیو",
  },
  {
    id: "local-burger",
    name: "محلی برگرد",
    description:
      "۱۳۰ گرم گوشت گوساله آبدار با پنیر لیقوان، ریحان تازه، گوجه و سس سیر روی نان کره ای به همراه سیب زمینی.",
    price: "۶۶۰",
    image: mahali,
    imageAlt: "برگر محلی با مواد محلی",
  },
  {
    id: "bacon-burger",
    name: "بیکن برگرد",
    description:
      "۱۳۰ گرم گوشت گوساله آبدار با بیکن دودی، کاهو تازه،پیاز، گوجه، خیارشور و سس برگرد روی نان کره ای به همراه سیب زمینی",
    price: "۷۲۰",
    image: beyken,
    imageAlt: "برگر بیکن دودی",
  },
];

export const sandwiches: MenuItem[] = [
  {
    id: "chicken-sandwich",
    name: "ساندویچ مرغ",
    description:
      "۱۲۰ گرم فیله مرغ با خیار، گوجه، ریحان تازه، و سس انبه و چیلی روی نان چاپاتا کره ای به همراه سیب زمینی.",
    price: "۵۲۰",
    image: chiken,
    imageAlt: "ساندویچ مرغ",
  },
];

export const fries: MenuItem[] = [
  {
    id: "classic-fries",
    name: "سیب زمینی",
    description: "سیب‌زمینی طلایی و ترد با ادویه برگرد.",
    price: "۲۶۰",
    image: friesImage,
    imageAlt: "سیب‌زمینی طلایی ترد",
  },
  // {
  //   id: "classic-fries",
  //   name: "سیب زمینی با سس شوید",
  //   description: "سیب‌زمینی طلایی و ترد با سس شوید به همراه ادویه برگرد.",
  //   price: "۱۷۰",
  //   image: friesImage,
  //   imageAlt: "سیب‌زمینی طلایی ترد",
  // },
];
export const toppings: MenuItem[] = [
  // {
  //   id: "classic-topping",
  //   name: "تاپینگ اضافه",
  //   description: "پیاز کاراملی، پنیر دودی، قارچ، پنیر چدار، هالوپینو.",
  //   price: "۴۰",
  //   image: topImage,
  //   imageAlt: "تاپینگ اضافه",
  // },
  {
    id: "classic-topping",
    name: "گوشت ۶۵ گرمی اضافه",
    description: "",
    price: "۱۴۰",
    image: topImage,
    imageAlt: "تاپینگ اضافه",
  },
  {
    id: "classic-topping",
    name: "بیکن",
    description: "",
    price: "۱۲۰",
    image: topImage,
    imageAlt: "تاپینگ اضافه",
  },
  {
    id: "classic-topping",
    name: "پیاز کاراملی",
    description: "",
    price: "۶۰",
    image: topImage,
    imageAlt: "تاپینگ اضافه",
  },
  {
    id: "classic-topping",
    name: "قارچ",
    description: "",
    price: "۶۰",
    image: topImage,
    imageAlt: "تاپینگ اضافه",
  },
  {
    id: "classic-topping",
    name: "هالوپینو",
    description: "",
    price: "۵۰",
    image: topImage,
    imageAlt: "تاپینگ اضافه",
  },
  {
    id: "classic-topping",
    name: "پنیر دودی",
    description: "",
    price: "۵۵",
    image: topImage,
    imageAlt: "تاپینگ اضافه",
  },
  {
    id: "classic-topping",
    name: "پنیر چدار",
    description: "",
    price: "۵۵",
    image: topImage,
    imageAlt: "تاپینگ اضافه",
  },
  {
    id: "classic-topping",
    name: "سس سیر",
    description: "",
    price: "۵۰",
    image: topImage,
    imageAlt: "سس سیر",
  },
  {
    id: "classic-topping",
    name: "سس هالوپینو",
    description: "",
    price: "۵۰",
    image: topImage,
    imageAlt: "سس هالوپینو",
  },
  {
    id: "classic-topping",
    name: "سس دودی",
    description: "",
    price: "۷۰",
    image: topImage,
    imageAlt: "سس دودی",
  },
  {
    id: "classic-topping",
    name: "سس چیلی انبه",
    description: "",
    price: "۶۰",
    image: topImage,
    imageAlt: "سس چیلی انبه",
  },
  
];

export const drinks: MenuItem[] = [
  {
    id: "classic-cola",
    name: "کولا",
    description: "کولا با یخ.",
    price: "۸۵",
    image: cola,
    imageAlt: "کولا خنک‌کننده با یخ",
  },
  {
    id: "zero-cola",
    name: "زیرو",
    description: "کولا زیرو بدون قند با یخ.",
    price: "۸۵",
    image: cola,
    imageAlt: "کولا زیرو بدون قند",
  },
  // {
  //   id: "lemonade",
  //   name: "لیموناد",
  //   description: "لیموناد خنک با طعم لیمو طبیعی.",
  //   price: "۵۵",
  //   image: lemon,
  //   imageAlt: "لیموناد تازه و خنک",
  // },
  {
    id: "fanta",
    name: "فانتا",
    description: "نوشابه پرتغالی به همراه یخ",
    price: "۸۵",
    image: fanta,
    imageAlt: "نوشابه پرتغالی تازه و خنک",
  },
  // {
  //   id: "argo-malt",
  //   name: "ماء الشعیر آرگو",
  //   description: "نوشیدنی مالت کلاسیک آرگو به همراه یخ",
  //   price: "۶۵",
  //   image: beer,
  //   imageAlt: "نوشیدنی مالت کلاسیک آرگو",
  // },
];
