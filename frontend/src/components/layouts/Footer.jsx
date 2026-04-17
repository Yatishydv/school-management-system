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
  ArrowRight,
  MessageCircle,
  Youtube
} from "lucide-react";
import { useSiteSettings } from "../../context/SiteSettingsContext";

const Footer = () => {
    const { settings, loading } = useSiteSettings();

    const getSocialHref = (platform, handle) => {
        if (!handle || typeof handle !== 'string') return "";
        if (handle.startsWith("http")) return handle;
        
        const cleanHandle = handle.startsWith("@") ? handle.substring(1) : handle;
        
        switch (platform) {
            case "facebook":
                return handle.includes("facebook.com") ? `https://${handle}` : `https://facebook.com/${cleanHandle}`;
            case "instagram":
                return handle.includes("instagram.com") ? `https://${handle}` : `https://instagram.com/${cleanHandle}`;
            case "twitter":
                return (handle.includes("twitter.com") || handle.includes("x.com")) ? `https://${handle}` : `https://x.com/${cleanHandle}`;
            case "whatsapp":
                return `https://wa.me/${handle.replace(/\s+/g, "")}`;
            case "youtube":
                return handle.includes("youtube.com") ? `https://${handle}` : `https://youtube.com/${cleanHandle}`;
            default:
                return handle;
        }
    };

    if (loading || !settings) return null;

    const socialData = settings.socialLinks || {};
    const footerMeta = settings.global || {};

  return (
    <footer className="relative bg-black text-gray-400 pt-12 pb-8 overflow-hidden border-t border-white/5 font-body">
      {/* High-Fidelity Background Accents */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-primary-900/10 rounded-full blur-[120px] -translate-y-1/2"></div>
      <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-accent-900/10 rounded-full blur-[120px] translate-y-1/2"></div>
      <div className="absolute top-1/2 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/5 to-transparent"></div>

      <div className="container mx-auto px-6 max-w-7xl relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-16">
          
          {/* Column 1: Brand & Mission */}
          <div className="md:col-span-12 lg:col-span-4 space-y-4">
            <Link to="/" className="inline-block group">
              <h3 className="text-2xl font-black text-white tracking-tighter uppercase leading-none group-hover:text-accent-500 transition-colors">
                {settings.schoolName || "SBS INSTITUTION"}
              </h3>
              <div className="flex items-center gap-2 mt-4">
                  <div className="h-1 w-12 bg-accent-500 rounded-full"></div>
                  <span className="text-[9px] font-black uppercase tracking-[0.4em] text-gray-500">Established 2004</span>
              </div>
            </Link>
            
            <p className="text-sm leading-relaxed text-gray-500 font-medium italic opacity-80 max-w-sm">
                "{footerMeta.footerMission || "Empowering the next generation with excellence in education, ethics, and innovation since 2004."}"
            </p>

            <div className="flex items-center gap-4">
              {[{ id: "facebook", icon: Facebook }, { id: "instagram", icon: Instagram }, { id: "twitter", icon: Twitter }, { id: "whatsapp", icon: MessageCircle }, { id: "youtube", icon: Youtube }, { id: "linkedin", icon: Linkedin }].map(({ id, icon: Icon }) => (
                socialData[id] && (
                  <a key={id} href={getSocialHref(id, socialData[id])} target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-accent-500 hover:text-white transition-all duration-300">
                      <Icon size={16} />
                  </a>
                )
              ))}
            </div>
          </div>

          {/* Column 2: Digital Navigation */}
          <div className="md:col-span-4 lg:col-span-2 space-y-4">
            <h4 className="text-white font-black tracking-[0.3em] uppercase text-[9px] opacity-60">Explore Hub</h4>
            <ul className="space-y-2">
              {["About", "Gallery", "Admissions", "Contact"].map((item) => (
                <li key={item}>
                  <Link 
                    to={`/${item.toLowerCase()}`} 
                    className="text-gray-400 hover:text-accent-500 transition-all font-bold text-sm flex items-center group"
                  >
                    <ArrowRight size={14} className="mr-3 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 text-accent-500" />
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Geospatial Hub */}
          <div className="md:col-span-4 lg:col-span-3 space-y-4">
            <h4 className="text-white font-black tracking-[0.3em] uppercase text-[9px] opacity-60">Contact Us</h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-4 group">
                <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-accent-500 shrink-0 group-hover:bg-accent-500 group-hover:text-white transition-all">
                    <MapPin size={22} />
                </div>
                <div className="space-y-1">
                    <p className="text-[9px] font-black uppercase tracking-widest text-gray-600">Institutional Hub</p>
                    <span className="text-sm font-bold leading-relaxed block text-gray-300">
                        {settings.contact?.location?.address || "Main Street, Badhwana, Haryana 127308"}
                    </span>
                </div>
              </li>
              <li className="flex items-center gap-4 group">
                <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-accent-500 shrink-0 group-hover:bg-accent-500 group-hover:text-white transition-all">
                    <Mail size={20} />
                </div>
                <div className="space-y-1">
                    <p className="text-[9px] font-black uppercase tracking-widest text-gray-600">Digital Mail</p>
                    <a href={`mailto:${(settings.contact?.cards || []).find(c => c.title.toLowerCase().includes('email'))?.details?.[0] || "info@sbsbadhwana.edu"}`} className="text-sm font-bold text-gray-300 hover:text-accent-500 transition-colors">
                        {(settings.contact?.cards || []).find(c => c.title.toLowerCase().includes('email'))?.details?.[0] || "info@sbsbadhwana.edu"}
                    </a>
                </div>
              </li>
              <li className="flex items-center gap-4 group">
                <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-accent-500 shrink-0 group-hover:bg-accent-500 group-hover:text-white transition-all">
                    <Phone size={20} />
                </div>
                <div className="space-y-1">
                    <p className="text-[9px] font-black uppercase tracking-widest text-gray-600">Voice Line</p>
                    <a href={`tel:${(settings.contact?.cards || []).find(c => c.title.toLowerCase().includes('phone'))?.details?.[0] || "+911234567890"}`} className="text-sm font-bold text-gray-300 hover:text-accent-400 transition-colors tabular-nums">
                        {(settings.contact?.cards || []).find(c => c.title.toLowerCase().includes('phone'))?.details?.[0] || "+91 123 456 7890"}
                    </a>
                </div>
              </li>
            </ul>
          </div>

          {/* Column 4: Newsletter / CTA */}
          <div className="md:col-span-12 lg:col-span-3 space-y-4">
            <h4 className="text-white font-black tracking-[0.3em] uppercase text-[9px] opacity-60">Newsletter</h4>
            <p className="text-[11px] font-medium leading-relaxed opacity-60">
                Join our digital network for real-time institutional updates.
            </p>
            <div className="relative group max-w-xs">
              <input 
                type="email" 
                placeholder="Institutional email" 
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-accent-500 focus:ring-4 focus:ring-accent-500/10 transition-all placeholder:text-gray-600 font-bold text-[11px]"
              />
              <button className="absolute right-1.5 top-1.5 bottom-1.5 bg-accent-600 hover:bg-accent-500 text-white px-3 rounded-lg transition-all flex items-center shadow-lg active:scale-95">
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* Footer Bottom: High Fidelity Precision */}
        <div className="mt-12 pt-8 border-t border-white/5 flex flex-col lg:flex-row justify-between items-center gap-6">
            <div className="flex flex-col md:flex-row items-center gap-4 md:gap-8">
                <p className="text-[11px] font-black uppercase tracking-[0.2em] text-gray-500">
                    {footerMeta.footerCopyright || `© ${new Date().getFullYear()} ${settings.schoolName || "SBS Badhwana"}. Institutional Excellence Portal.`}
                </p>
            </div>
            
            <div className="flex items-center gap-10">
                {["Privacy Architecture", "Terms of Use", "System Status"].map(link => (
                    <a key={link} href="#" className="text-[10px] font-black uppercase tracking-widest text-gray-600 hover:text-white transition-colors">
                        {link}
                    </a>
                ))}
            </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
