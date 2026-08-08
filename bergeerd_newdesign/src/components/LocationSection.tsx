import { Clock, MapPin, Navigation, Phone } from "lucide-react";

/**
 * "Visit us" section with an interactive map and contact cards.
 * The map keeps the existing Google Maps embed (Bergeerd location).
 */
const LocationSection = () => {
  return (
    <section id="location" className="scroll-mt-24 py-16">
      <div className="container mx-auto px-4">
        {/* Heading */}
        <div className="reveal mb-10 text-center">
          <span className="mb-3 inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/10 px-3 py-1 font-persian text-xs text-primary">
            <MapPin className="h-3.5 w-3.5" />
            ما رو پیدا کن
          </span>
          <h2 className="font-persian text-4xl font-black text-foreground md:text-5xl">
            <span className="text-gradient-red">کجا هستیم؟</span>
          </h2>
        </div>

        <div className="grid items-stretch gap-6 lg:grid-cols-5">
          {/* Map */}
          <div className="reveal reveal-right lg:col-span-3">
            <div className="group relative h-full min-h-[320px] overflow-hidden rounded-3xl border border-white/10 shadow-card">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d302.68466979882555!2d48.2776719!3d38.239354!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x4018976cca86421b%3A0xebf6da6d1445251e!2sBergeerd%20%7C%20%D8%A8%D8%B1%DA%AF%D8%B1%D8%AF%E2%80%AD!5e1!3m2!1sen!2s!4v1732873870000!5m2!1sen!2s"
                title="موقعیت برگرد"
                width="100%"
                height="100%"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                style={{
                  border: 0,
                  minHeight: "320px",
                  filter: "grayscale(0.3) contrast(1.05)",
                }}
                allowFullScreen
                className="absolute inset-0 h-full w-full transition-all duration-500 group-hover:grayscale-0"
              />
            </div>
          </div>

          {/* Info cards */}
          <div className="reveal reveal-left flex flex-col gap-4 lg:col-span-2">
            <InfoCard
              Icon={MapPin}
              title="آدرس"
              lines={["اردبیل، پارک شهریار"]}
              href="https://maps.app.goo.gl/SuFQPrsjuxGb5SuD6"
              cta="مسیریاری"
            />
            <InfoCard
              Icon={Phone}
              title="تماس"
              lines={["+98 919 399 8029"]}
              href="tel:+989193998029"
              ltr
            />
            <InfoCard
              Icon={Clock}
              title="ساعت کاری"
              lines={["هر روز ۱۲ تا ۱۵ : ۱۱"]}
            />
          </div>
        </div>
      </div>
    </section>
  );
};

interface InfoCardProps {
  Icon: typeof MapPin;
  title: string;
  lines: string[];
  href?: string;
  cta?: string;
  ltr?: boolean;
}

const InfoCard = ({ Icon, title, lines, href, cta, ltr }: InfoCardProps) => (
  <div className="group flex items-center gap-4 rounded-2xl border border-border bg-card p-5 shadow-card transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/40">
    <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-primary text-white transition-transform duration-300 group-hover:scale-110">
      <Icon className="h-5 w-5" />
    </span>
    <div className="min-w-0 flex-1">
      <h4 className="font-persian text-sm text-muted-foreground">{title}</h4>
      {lines.map((l, i) => (
        <p
          key={i}
          className="font-persian text-base font-bold text-foreground"
          style={ltr ? { direction: "ltr", textAlign: "right" } : undefined}
        >
          {l}
        </p>
      ))}
    </div>
    {href && cta && (
      <a
        href={href}
        target={href.startsWith("http") ? "_blank" : undefined}
        rel="noopener noreferrer"
        className="flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-3 py-1.5 font-persian text-xs text-primary transition-colors hover:bg-primary/20"
      >
        <Navigation className="h-3.5 w-3.5" />
        {cta}
      </a>
    )}
  </div>
);

export default LocationSection;
