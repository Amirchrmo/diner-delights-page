import Header from "@/components/Header";
import Footer from "@/components/Footer";
import MenuSection from "@/components/MenuSection";
import { burgers, fries, drinks, toppings } from "@/data/menuData";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 py-16">
        <div className="max-w-6xl mx-auto">
          <MenuSection title="برگرها" items={burgers} />
          <MenuSection title="سیب‌زمینی" items={fries} />
          <MenuSection title="میتونی اضافه کنی..." items={toppings} />
          <MenuSection title="نوشیدنی‌ها" items={drinks} />
        </div>
      </main>

      <section
        id="map"
        className="container mx-auto px-4"
        style={{ marginTop: "40px" }}
      >
        <iframe
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d302.68466979882555!2d48.2776719!3d38.239354!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x4018976cca86421b%3A0xebf6da6d1445251e!2sBergeerd%20%7C%20%D8%A8%D8%B1%DA%AF%D8%B1%D8%AF%E2%80%AD!5e1!3m2!1sen!2s!4v1732873870000!5m2!1sen!2s"
          width="100%"
          height="300"
          style={{ border: 0, borderRadius: "12px" }}
          allowFullScreen
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          title="موقعیت برگِرد"
        />
      </section>

      <Footer />
    </div>
  );
};

export default Index;
