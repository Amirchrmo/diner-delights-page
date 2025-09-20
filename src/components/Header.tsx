import LOGOHeader from "@/assets/LOGO-header.png";

const Header = () => {
  return (
    <header className="text-white py-16" style={{ backgroundColor: "#d2080b" }}>
      <div className="container mx-auto px-4 text-center">
        {/* Logo and Title */}
        <div className="flex flex-col items-center mb-6">
          <img
            src={LOGOHeader}
            alt="Bergeerd Logo"
            className="w-32 h-32 md:w-48 md:h-48 mb-4 drop-shadow-lg hover:scale-110 transition-all duration-300 ease-in-out animate-pulse hover:animate-bounce"
            style={{
              animation:
                "logoFloat 1s ease-in-out infinite, logoWiggle 1s ease-in-out infinite",
            }}
          />
          <h1 className="font-diner text-6xl md:text-8xl tracking-wider">
            Bergeerd{" "}
          </h1>
        </div>

        <p className="text-xl md:text-2xl font-medium opacity-90 max-w-2xl mx-auto font-persian">
          یه گرد خوشمزه
        </p>
        <div className="mt-8">
          <div className="inline-block w-32 h-1 bg-white/30 rounded-full"></div>
        </div>
      </div>
    </header>
  );
};

export default Header;
