import Header from "@/components/Header";
import Footer from "@/components/Footer";
import MenuSection from "@/components/MenuSection";
import { burgers, fries, drinks, specials } from "@/data/menuData";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-16">
        <div className="max-w-6xl mx-auto">
          <MenuSection title="برگرها" items={burgers} />
          <MenuSection title="سیب‌زمینی و پیش‌غذا" items={fries} />
          <MenuSection title="نوشیدنی‌ها" items={drinks} />
          <MenuSection title="ویژه‌ها" items={specials} />
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Index;
