import React from "react";
import { Link } from "react-router-dom";
import { 
  Facebook, 
  Instagram, 
  Twitter, 
  Linkedin, 
  Mail, 
  Phone, 
  MapPin, 
  ArrowRight 
} from "lucide-react";

const Footer = () => {
  return (
    <footer className="relative bg-black text-gray-400 pt-20 pb-10 overflow-hidden border-t border-white/5">
      {/* Background Accents */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary-900/10 rounded-full blur-3xl -translate-y-1/2"></div>
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent-900/10 rounded-full blur-3xl translate-y-1/2"></div>

      <div className="container mx-auto px-6 max-w-7xl relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 lg:gap-16">
          
          {/* Brand & Mission */}
          <div className="md:col-span-4 space-y-6">
            <Link to="/" className="inline-block">
              <h3 className="text-3xl font-heading font-black text-white tracking-tighter">
                SBS <span className="text-accent-500">BADHWANA</span>
              </h3>
            </Link>
            <p className="text-lg leading-relaxed text-gray-400 max-w-sm">
              Empowering the next generation with excellence in education, ethics, and innovation since 2004.
            </p>
            <div className="flex items-center gap-4">
              <a href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-accent-500 hover:text-white transition-all duration-300">
                <Facebook size={18} />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-accent-500 hover:text-white transition-all duration-300">
                <Instagram size={18} />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-accent-500 hover:text-white transition-all duration-300">
                <Twitter size={18} />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-accent-500 hover:text-white transition-all duration-300">
                <Linkedin size={18} />
              </a>
            </div>
          </div>

          {/* Quick Navigation */}
          <div className="md:col-span-2 space-y-6">
            <h4 className="text-white font-bold tracking-wider uppercase text-sm">Explore</h4>
            <ul className="space-y-4">
              {["About", "Gallery", "Admissions", "Contact"].map((item) => (
                <li key={item}>
                  <Link 
                    to={`/${item.toLowerCase()}`} 
                    className="hover:text-accent-400 transition-colors flex items-center group"
                  >
                    <span className="w-0 group-hover:w-4 overflow-hidden transition-all duration-300 opacity-0 group-hover:opacity-100">
                      <ArrowRight size={12} className="mr-2" />
                    </span>
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Details */}
          <div className="md:col-span-3 space-y-6">
            <h4 className="text-white font-bold tracking-wider uppercase text-sm">Contact Us</h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <MapPin size={20} className="text-accent-500 mt-1 shrink-0" />
                <span>Main Street, Badhwana, Haryana 127308</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail size={20} className="text-accent-500 shrink-0" />
                <a href="mailto:info@sbsbadhwana.edu" className="hover:text-accent-400 transition-colors">
                  info@sbsbadhwana.edu
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Phone size={20} className="text-accent-500 shrink-0" />
                <a href="tel:+911234567890" className="hover:text-accent-400 transition-colors">
                  +91 123 456 7890
                </a>
              </li>
            </ul>
          </div>

          {/* Newsletter / CTA */}
          <div className="md:col-span-3 space-y-6">
            <h4 className="text-white font-bold tracking-wider uppercase text-sm">Stay Updated</h4>
            <p>Get the latest news and updates from SBS directly in your inbox.</p>
            <div className="relative group">
              <input 
                type="email" 
                placeholder="Your email address" 
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-accent-500 focus:ring-1 focus:ring-accent-500 transition-all placeholder:text-gray-600"
              />
              <button className="absolute right-2 top-2 bottom-2 bg-accent-600 hover:bg-accent-500 text-white px-4 rounded-lg transition-colors flex items-center">
                <ArrowRight size={18} />
              </button>
            </div>
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="mt-20 pt-10 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6 text-sm">
          <p>© {new Date().getFullYear()} SBS Badhwana. All Rights Reserved.</p>
          <div className="flex items-center gap-8">
            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-white transition-colors">Cookie Policy</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
