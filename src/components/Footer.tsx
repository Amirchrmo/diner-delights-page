import { Instagram, Phone, MapPin } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-charcoal text-white py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center md:text-right">
          <div>
            <h3 className="font-diner text-2xl mb-4 text-primary">قصر برگر</h3>
            <p className="text-gray-300 leading-relaxed font-persian">
              از سال ۱۳۷۵ بهترین برگرهای شهر را سرو می‌کنیم. مواد تازه، طعم‌های
              جسورانه، طعم فراموش‌نشدنی.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-lg mb-4 font-persian">
              اطلاعات تماس
            </h4>
            <div className="space-y-3">
              <div className="flex items-center justify-center md:justify-end">
                <span className="text-gray-300 font-persian mr-3">
                  تهران، خیابان برگر ۱۲۳، شهر غذا، کد پستی ۱۲۳۴۵
                </span>
                <MapPin className="w-5 h-5 text-primary" />
              </div>
              <div className="flex items-center justify-center md:justify-end">
                <span className="text-gray-300 font-persian mr-3">
                  ۰۲۱-۱۲۳۴-برگر
                </span>
                <Phone className="w-5 h-5 text-primary" />
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-lg mb-4 font-persian">
              ما را دنبال کنید
            </h4>
            <div className="flex items-center justify-center md:justify-end">
              <a
                href="https://instagram.com/bergeerd"
                className="text-gray-300 hover:text-primary transition-colors font-persian mr-3"
                target="_blank"
                rel="noopener noreferrer"
              >
                bergeerd
              </a>
              <Instagram className="w-6 h-6 text-primary" />
            </div>
          </div>
        </div>

        <div className="border-t border-warm-gray mt-8 pt-8 text-center">
          <p className="text-gray-400 font-persian">
            © ۱۴۰۳ قصر برگر. تمام حقوق محفوظ است. | با ❤️ برای عاشقان برگر ساخته
            شده
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
