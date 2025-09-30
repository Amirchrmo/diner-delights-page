import { useState, useEffect } from "react";
import LOGOLoader from "@/assets/LOGO-header.png";

const Loader = () => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading time - you can adjust this duration
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500); // 3 seconds loading time

    return () => clearTimeout(timer);
  }, []);

  if (!isLoading) return null;

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-50"
      style={{ backgroundColor: "#d2080b" }}
    >
      <div className="text-center">
        <div className="mb-8 relative">
          {/* Animated Logo Container */}
          <div className="relative w-56 h-56 mx-auto">
            {/* Rotating background circle */}
            <div className="absolute inset-0 rounded-full border-4 border-white/20 animate-spin"></div>

            {/* Pulsing background circle */}
            <div className="absolute inset-4 rounded-full bg-white/10 animate-pulse"></div>

            {/* Logo with bounce animation */}
            <div className="absolute inset-0 flex items-center justify-center">
              <img
                src={LOGOLoader}
                alt="Bergeerd Logo"
                className="w-24 h-24 drop-shadow-lg"
                style={{
                  animation:
                    "logoSpin 2s ease-in-out infinite, bounce 1s infinite",
                }}
              />
            </div>

            {/* Floating particles around logo */}
            {/* <div className="absolute inset-0">
              <div className="absolute top-4 left-1/2 w-3 h-3 bg-white/60 rounded-full animate-ping"></div>
              <div
                className="absolute bottom-4 left-1/2 w-3 h-3 bg-white/60 rounded-full animate-ping"
                style={{ animationDelay: "0.5s" }}
              ></div>
              <div
                className="absolute left-4 top-1/2 w-3 h-3 bg-white/60 rounded-full animate-ping"
                style={{ animationDelay: "1s" }}
              ></div>
              <div
                className="absolute right-4 top-1/2 w-3 h-3 bg-white/60 rounded-full animate-ping"
                style={{ animationDelay: "1.5s" }}
              ></div>
            </div> */}
          </div>
        </div>

        {/* Animated text */}
        <div className="space-y-2">
          <h2 className="text-3xl font-bold text-white mb-2 animate-pulse">
            برگرد، یه گرد خوشمزه
          </h2>
          <p className="text-white/80 text-lg opacity-0 animate-[fadeIn_1s_ease-in-out_0.5s_forwards]">
            یکم صبر کن...
          </p>

          {/* Loading dots animation */}
          <div className="flex justify-center space-x-1 mt-4">
            <div className="w-2 h-2 bg-white rounded-full animate-bounce"></div>
            <div
              className="w-2 h-2 bg-white rounded-full animate-bounce"
              style={{ animationDelay: "0.1s" }}
            ></div>
            <div
              className="w-2 h-2 bg-white rounded-full animate-bounce"
              style={{ animationDelay: "0.2s" }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Loader;
