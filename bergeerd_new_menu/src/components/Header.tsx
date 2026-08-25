import LOGOHeader from "@/assets/bergerd1 tp.gif";
import LOGOTITLE from "@/assets/LOGO-title.png";
import { ChevronDown } from "lucide-react";

const Header = () => {
  const scrollToContent = () => {
    const mainContent = document.querySelector("main");
    if (mainContent) {
      mainContent.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <header
      className="text-white flex items-center justify-center min-h-screen relative"
      style={{ backgroundColor: "#d2080b" }}
    >
      <div className="container mx-auto px-4 text-center">
        {/* Logo and Title */}
        <div className="flex flex-col items-center mb-6">
          <img
            src={LOGOHeader}
            alt="Bergeerd Logo"
            className="w-[22rem] h-[22rem]"
          />
          <img
            src={LOGOTITLE}
            alt="Bergeerd LogoTitle"
            className=" h-48 md:h-48 mb-4 "
          />
        </div>

        <p className="text-xl md:text-2xl font-medium opacity-90 max-w-2xl mx-auto font-persian">
          یه گرد خوشمزه
        </p>
        <div className="mt-8">
          <div className="inline-block w-32 h-1 bg-white/30 rounded-full"></div>
        </div>
      </div>

      {/* Scroll Down Arrow */}
      <button
        onClick={scrollToContent}
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex flex-col items-center gap-2 text-white/80 hover:text-white transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-white/50 rounded-full p-2"
        aria-label="Scroll to content"
      >
        <ChevronDown className="w-8 h-8 animate-float-down" strokeWidth={2} />
      </button>
    </header>
  );
};

export default Header;
