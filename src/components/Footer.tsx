import { Instagram, Phone, MapPin } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-charcoal text-white py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center md:text-left">
          <div>
            <h3 className="font-diner text-2xl mb-4 text-primary">BURGER PALACE</h3>
            <p className="text-gray-300 leading-relaxed">
              Serving the best burgers in town since 1995. 
              Fresh ingredients, bold flavors, unforgettable taste.
            </p>
          </div>
          
          <div>
            <h4 className="font-semibold text-lg mb-4">Contact Info</h4>
            <div className="space-y-3">
              <div className="flex items-center justify-center md:justify-start">
                <MapPin className="w-5 h-5 text-primary mr-3" />
                <span className="text-gray-300">123 Burger Street, Food City, FC 12345</span>
              </div>
              <div className="flex items-center justify-center md:justify-start">
                <Phone className="w-5 h-5 text-primary mr-3" />
                <span className="text-gray-300">(555) 123-BURG</span>
              </div>
            </div>
          </div>
          
          <div>
            <h4 className="font-semibold text-lg mb-4">Follow Us</h4>
            <div className="flex items-center justify-center md:justify-start">
              <Instagram className="w-6 h-6 text-primary mr-3" />
              <a 
                href="https://instagram.com/burgerpalace" 
                className="text-gray-300 hover:text-primary transition-colors"
                target="_blank"
                rel="noopener noreferrer"
              >
                @burgerpalace
              </a>
            </div>
          </div>
        </div>
        
        <div className="border-t border-warm-gray mt-8 pt-8 text-center">
          <p className="text-gray-400">
            © 2024 Burger Palace. All rights reserved. | Made with ❤️ for burger lovers
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;