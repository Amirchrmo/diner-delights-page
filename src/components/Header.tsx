const Header = () => {
  return (
    <header className="bg-gradient-to-r from-primary to-accent text-white py-16">
      <div className="container mx-auto px-4 text-center">
        <h1 className="font-diner text-6xl md:text-8xl mb-4 tracking-wider">
          Bergeerd{" "}
        </h1>
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
