import { useState, useEffect } from "react";

const Loader = () => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading time - you can adjust this duration
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000); // 2 seconds loading time

    return () => clearTimeout(timer);
  }, []);

  if (!isLoading) return null;

  return (
    <div className="fixed inset-0 bg-gradient-to-r from-primary to-accent flex items-center justify-center z-50">
      <div className="text-center">
        <div className="mb-8">
          <img
            src="/loader.gif"
            alt="Loading..."
            className="w-32 h-32 mx-auto"
            onError={(e) => {
              // Fallback if gif doesn't exist
              e.currentTarget.style.display = "none";
              e.currentTarget.nextElementSibling?.classList.remove("hidden");
            }}
          />
          <div className="hidden w-32 h-32 mx-auto bg-white/20 rounded-full flex items-center justify-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white"></div>
          </div>
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">Bergeerd</h2>
        <p className="text-white/80">Loading delicious burgers...</p>
      </div>
    </div>
  );
};

export default Loader;
