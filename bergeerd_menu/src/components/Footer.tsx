import { Instagram, Phone, MapPin } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-charcoal text-white py-12" dir="rtl">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center md:text-right">
          <div>
            <h3 className="font-diner text-2xl mb-4 text-primary">برگرد</h3>
            <p className="text-gray-300 leading-relaxed font-persian">
              برگرد، یه گرد خوشمزه، یه طعم فراموش نشدنی!
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-lg mb-4 font-persian">
              اطلاعات تماس
            </h4>
            <div className="space-y-3">
              <div className="flex items-center justify-center md:justify-end flex-row-reverse">
                <a
                  href="https://maps.app.goo.gl/SuFQPrsjuxGb5SuD6"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-300 font-persian ml-3 hover:text-primary transition-colors"
                >
                  اردبیل، پارک شهریار
                </a>
                <MapPin className="w-5 h-5 text-primary" />
              </div>
              <div className="flex items-center justify-center md:justify-end flex-row-reverse">
                <span
                  className="text-gray-300 font-persian ml-3"
                  style={{ direction: "ltr" }}
                >
                  +989193998029
                </span>
                <Phone className="w-5 h-5 text-primary" />
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-lg mb-4 font-persian">
              ما را دنبال کنید
            </h4>
            <div className="flex items-center justify-center md:justify-end flex-row-reverse">
              <a
                href="https://instagram.com/bergeerd"
                className="text-gray-300 hover:text-primary transition-colors font-persian ml-3"
                target="_blank"
                rel="noopener noreferrer"
              >
                bergeerd
              </a>
              <Instagram className="w-6 h-6 text-primary" />
            </div>
          </div>
        </div>

        <div
          className="border-t border-warm-gray mt-8 pt-8 text-center"
          dir="rtl"
        >
          <p className="text-gray-400 font-persian">
            © برگرد تمام حقوق محفوظ است. | با ❤️ برای عاشقان برگر ساخته شده |
            ساخته شده توسط Arisan
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
