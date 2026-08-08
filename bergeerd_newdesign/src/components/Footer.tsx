import { Instagram, Phone, MapPin, Heart, ArrowUp, Gamepad2 } from "lucide-react";
import LOGOFooter from "@/assets/LOGO-header.png";

const Footer = () => {
  const scrollTop = () =>
    window.scrollTo({ top: 0, behavior: "smooth" });

  const goGame = () =>
    document
      .getElementById("entertainment")
      ?.scrollIntoView({ behavior: "smooth" });

  return (
    <footer
      className="relative overflow-hidden pt-16"
      style={{
        background:
          "linear-gradient(180deg, hsl(0 84% 38%), hsl(0 80% 28%))",
      }}
    >
      {/* glow */}
      <div className="pointer-events-none absolute -top-24 left-1/2 h-48 w-[36rem] -translate-x-1/2 rounded-full bg-white/15 blur-3xl" />

      <div className="container relative mx-auto px-4" dir="rtl">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-3">
          {/* Brand */}
          <div className="flex flex-col items-center text-center md:items-start md:text-right">
            <img
              src={LOGOFooter}
              alt="برگرد"
              className="h-16 w-16 rounded-full object-cover ring-2 ring-white/40"
            />
            <h3 className="mt-4 font-persian text-2xl font-black text-white">
              برگرد
            </h3>
            <p className="mt-2 max-w-xs font-persian text-sm leading-relaxed text-white/70">
              برگرد، یه گرد خوشمزه، یه طعم فراموش‌نشدنی! ساخته‌شده با عشق برای
              عاشقان برگر.
            </p>
          </div>

          {/* Contact */}
          <div>
            <h4 className="mb-4 font-persian text-lg font-bold text-white">
              اطلاعات تماس
            </h4>
            <ul className="space-y-3">
              <li>
                <a
                  href="https://maps.app.goo.gl/SuFQPrsjuxGb5SuD6"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center justify-center gap-2 font-persian text-sm text-white/80 transition-colors hover:text-white md:justify-start"
                >
                  <MapPin className="h-4 w-4" />
                  اردبیل، پارک شهریار
                </a>
              </li>
              <li>
                <a
                  href="tel:+989193998029"
                  className="group flex items-center justify-center gap-2 font-persian text-sm text-white/80 transition-colors hover:text-white md:justify-start"
                >
                  <Phone className="h-4 w-4" />
                  <span style={{ direction: "ltr" }}>+98 919 399 8029</span>
                </a>
              </li>
            </ul>
          </div>

          {/* Social / quick links */}
          <div>
            <h4 className="mb-4 font-persian text-lg font-bold text-white">
              همراه ما باش
            </h4>
            <div className="flex flex-col items-center gap-3 md:items-start">
              <a
                href="https://instagram.com/bergeerd"
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center gap-2 font-persian text-sm text-white/80 transition-colors hover:text-white"
              >
                <span className="grid h-9 w-9 place-items-center rounded-full border border-white/30 bg-white/10 transition-colors group-hover:bg-white/25">
                  <Instagram className="h-4 w-4" />
                </span>
                bergeerd@
              </a>
              <button
                onClick={goGame}
                className="group flex items-center gap-2 font-persian text-sm text-white/80 transition-colors hover:text-white"
              >
                <span className="grid h-9 w-9 place-items-center rounded-full border border-white/30 bg-white/10 transition-colors group-hover:bg-white/25">
                  <Gamepad2 className="h-4 w-4" />
                </span>
                بازی کن، وقت انتظار رو پر کن
              </button>
            </div>
          </div>
        </div>

        {/* bottom bar */}
        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-white/20 py-6 sm:flex-row">
          <p className="flex items-center gap-1.5 font-persian text-xs text-white/70">
            © {toPersian(1404)} برگرد — تمام حقوق محفوظ است.
            <span className="mx-1">ساخته‌شده با</span>
            <Heart className="h-3.5 w-3.5 fill-white text-white" />
            <span>توسط Arisan</span>
          </p>
          <button
            onClick={scrollTop}
            aria-label="بازگشت به بالا"
            className="flex items-center gap-1.5 rounded-full border border-white/30 bg-white/10 px-4 py-2 font-persian text-xs text-white transition-colors hover:bg-white/25"
          >
            <ArrowUp className="h-3.5 w-3.5" />
            بالا
          </button>
        </div>
      </div>
    </footer>
  );
};

function toPersian(n: number): string {
  return n.toString().replace(/\d/g, (d) => "۰۱۲۳۴۵۶۷۸۹"[+d]);
}

export default Footer;
