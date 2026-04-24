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
import EditableRegion from "../ui/EditableRegion";
import InlineEdit from "../ui/InlineEdit";

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

    const theme = settings.theme || { primaryColor: "#0a0a0a", accentColor: "#10b981" };
    const socialData = settings.socialLinks || {};
    const footerMeta = settings.global || {};

  return (
    <footer className="relative bg-black text-gray-400 pt-12 pb-8 overflow-hidden border-t border-white/5 font-body">
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] rounded-full blur-[120px] -translate-y-1/2" style={{ backgroundColor: `${theme.primaryColor}20` }}></div>
      <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] rounded-full blur-[120px] translate-y-1/2" style={{ backgroundColor: `${theme.accentColor}10` }}></div>

      <div className="container mx-auto px-6 max-w-7xl relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-16">
          
          <div className="md:col-span-12 lg:col-span-4 space-y-4">
            <Link to="/" className="inline-block group">
              <h3 className="text-2xl font-black text-white tracking-tighter uppercase leading-none group-hover:text-accent-500 transition-colors">
                <EditableRegion type="text" path="schoolName" label="School Name">
                    {settings.schoolName || "Institution"}
                </EditableRegion>
              </h3>
              <div className="flex items-center gap-2 mt-4">
                  <div className="h-1 w-12 rounded-full" style={{ backgroundColor: theme.accentColor }}></div>
                  <span className="text-[9px] font-black uppercase tracking-[0.4em] text-gray-500">Institutional Excellence</span>
              </div>
            </Link>
            
            <p className="text-sm leading-relaxed text-gray-500 font-medium italic opacity-80 max-w-sm">
                "<InlineEdit path="global.footer.desc" text={footerMeta.footer?.desc || "Empowering the next generation with excellence in education and innovation."} label="Footer Mission" />"
            </p>

            <div className="flex items-center gap-4">
              {[{ id: "facebook", icon: Facebook }, { id: "instagram", icon: Instagram }, { id: "twitter", icon: Twitter }, { id: "whatsapp", icon: MessageCircle }, { id: "youtube", icon: Youtube }, { id: "linkedin", icon: Linkedin }].map(({ id, icon: Icon }) => (
                socialData[id] && (
                  <a key={id} href={getSocialHref(id, socialData[id])} target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center hover:text-white transition-all duration-300" style={{ "--hover-bg": theme.accentColor }}>
                      <Icon size={16} />
                  </a>
                )
              ))}
            </div>
          </div>

          <div className="md:col-span-4 lg:col-span-2 space-y-4">
            <h4 className="text-white font-black tracking-[0.3em] uppercase text-[9px] opacity-60">Explore</h4>
            <ul className="space-y-2">
              {["About", "Gallery", "Admissions", "Contact"].map((item) => (
                <li key={item}>
                  <Link 
                    to={`/${item.toLowerCase()}`} 
                    className="text-gray-400 hover:text-accent-500 transition-all font-bold text-sm flex items-center group"
                  >
                    <ArrowRight size={14} className="mr-3 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" style={{ color: theme.accentColor }} />
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="md:col-span-4 lg:col-span-3 space-y-4">
            <h4 className="text-white font-black tracking-[0.3em] uppercase text-[9px] opacity-60">Contact</h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-4 group">
                <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0 transition-all group-hover:text-white" style={{ color: theme.accentColor, "--hover-bg": theme.accentColor }}>
                    <MapPin size={22} />
                </div>
                <div className="space-y-1">
                    <p className="text-[9px] font-black uppercase tracking-widest text-gray-600">Location</p>
                    <span className="text-sm font-bold leading-relaxed block text-gray-300">
                        <InlineEdit path="contact.location.address" text={settings.contact?.location?.address || "Institution Address"} label="Campus Address" />
                    </span>
                </div>
              </li>
              <li className="flex items-center gap-4 group">
                <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0 transition-all group-hover:text-white" style={{ color: theme.accentColor, "--hover-bg": theme.accentColor }}>
                    <Mail size={20} />
                </div>
                <div className="space-y-1">
                    <p className="text-[9px] font-black uppercase tracking-widest text-gray-600">Email</p>
                    <a href={`mailto:${settings.global?.email || ""}`} className="text-sm font-bold text-gray-300 hover:text-accent-500 transition-colors">
                        {settings.global?.email || "info@institution.edu"}
                    </a>
                </div>
              </li>
              <li className="flex items-center gap-4 group">
                <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0 transition-all group-hover:text-white" style={{ color: theme.accentColor, "--hover-bg": theme.accentColor }}>
                    <Phone size={20} />
                </div>
                <div className="space-y-1">
                    <p className="text-[9px] font-black uppercase tracking-widest text-gray-600">Phone</p>
                    <a href={`tel:${settings.global?.phone || ""}`} className="text-sm font-bold text-gray-300 hover:text-accent-400 transition-colors tabular-nums">
                        {settings.global?.phone || "+91 123 456 7890"}
                    </a>
                </div>
              </li>
            </ul>
          </div>

          <div className="md:col-span-12 lg:col-span-3 space-y-4">
            <h4 className="text-white font-black tracking-[0.3em] uppercase text-[9px] opacity-60">Newsletter</h4>
            <div className="relative group max-w-xs">
              <input 
                type="email" 
                placeholder="Institutional email" 
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none transition-all placeholder:text-gray-600 font-bold text-[11px]"
                style={{ focusBorderColor: theme.accentColor }}
              />
              <button className="absolute right-1.5 top-1.5 bottom-1.5 text-white px-3 rounded-lg transition-all flex items-center shadow-lg active:scale-95" style={{ backgroundColor: theme.accentColor }}>
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-white/5 flex flex-col lg:flex-row justify-between items-center gap-6">
            <p className="text-[11px] font-black uppercase tracking-[0.2em] text-gray-500">
                <InlineEdit path="global.footer.copyright" text={footerMeta.footer?.copyright || `© ${new Date().getFullYear()} ${settings.schoolName || "Institution"}. All Rights Reserved.`} label="Footer Copyright" />
            </p>
            
            <div className="flex items-center gap-10">
                {["Privacy", "Terms", "Status"].map(link => (
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
