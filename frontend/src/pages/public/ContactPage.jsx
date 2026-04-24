import React, { useState, useEffect } from "react";
import axios from "../../api/axios";
import { toast } from "react-toastify";
import Button from "../../components/ui/Button";
import {
  Mail,
  Phone,
  MapPin,
  Clock,
  Facebook,
  Instagram,
  Twitter,
  MessageSquare,
  Sparkles,
  ArrowRight,
  ChevronDown,
  Globe,
  HelpCircle,
  ShieldCheck,
  Shield,
  Send,
  Users,
  Calendar,
  MessageCircle,
  Headphones,
  Loader2,
  Zap
} from "lucide-react";
import { useSiteSettings } from "../../context/SiteSettingsContext";
import InlineEdit from "../../components/ui/InlineEdit";
import EditableRegion from "../../components/ui/EditableRegion";

const ContactPage = () => {
    const { settings, loading } = useSiteSettings();
    const [form, setForm] = useState({
        name: "",
        email: "",
        phone: "",
        subject: "",
        message: "",
    });

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const submitForm = async (e) => {
        e.preventDefault();
        try {
            await axios.post("/contact/send", form);
            toast.success("Message Transmitted. We will respond shortly.");
            setForm({
                name: "",
                email: "",
                phone: "",
                subject: "",
                message: "",
            });
        } catch (err) {
            console.error(err);
            toast.error("An error occurred. Please try again.");
        }
    };

    if (loading || !settings) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-white space-y-4">
                <Loader2 className="w-12 h-12 text-accent-500 animate-spin" />
                <p className="text-[10px] font-black uppercase tracking-[0.5em] text-gray-400">Restoring Contact Hub...</p>
            </div>
        );
    }

    const theme = settings.theme || { primaryColor: "#0a0a0a", accentColor: "#10b981" };
    const layout = settings.layout?.contact || { showHero: true, showCards: true, showLocation: true, showMessageHub: true, showFaqs: true };

    const IconMap = { Headphones, Mail, Calendar, MapPin, Globe, ShieldCheck, HelpCircle, MessageCircle, Zap, Shield, Sparkles, Users, MessageSquare };

    const defaultCards = [
        { title: "Phone Support", details: ["+91 98765 43210"], icon: "Headphones", color: "bg-blue-50 text-blue-600", label: "Call Us" },
        { title: "Email Inquiry", details: ["info@institution.edu"], icon: "Mail", color: "bg-accent-50 text-accent-700", label: "Email Us" },
        { title: "Hours", details: ["Mon-Fri: 9AM-3PM"], icon: "Calendar", color: "bg-purple-50 text-purple-600", label: "Visit Us" },
    ];

    const contactCards = (settings.contact?.cards || []).length > 0
        ? settings.contact.cards.map((c, i) => ({
            ...c,
            icon: IconMap[c.icon] || Headphones,
            color: i % 3 === 0 ? "bg-blue-50 text-blue-600" : i % 3 === 1 ? "bg-accent-50 text-accent-700" : "bg-purple-50 text-purple-600",
            label: c.label || "Support"
        }))
        : defaultCards.map(c => ({...c, icon: IconMap[c.icon]}));

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-gray-900 font-body overflow-x-hidden pt-20" style={{ "--primary": theme.primaryColor, "--accent": theme.accentColor }}>

      {/* --- HERO SECTION --- */}
      {layout.showHero && (
        <section className="relative min-h-[85vh] flex flex-col items-center justify-center px-6 overflow-hidden">
            <div className="absolute inset-0 -z-10 bg-white">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full" style={{ background: `linear-gradient(to bottom, ${theme.accentColor}10, white)` }}></div>
                <div className="absolute top-1/4 -left-20 w-[600px] h-[600px] rounded-full blur-[120px] animate-pulse" style={{ backgroundColor: `${theme.accentColor}15` }}></div>
                <div className="absolute bottom-1/4 -right-20 w-[600px] h-[600px] rounded-full blur-[120px] animate-pulse delay-1000" style={{ backgroundColor: `${theme.primaryColor}08` }}></div>
            </div>

            <div className="max-w-6xl mx-auto text-center space-y-12 relative z-10 animate-fade-up">
            <EditableRegion type="badge" path="contact.hero.badge" label="Hero Badge">
                <div className="inline-flex items-center gap-2 px-6 py-2 rounded-full text-white text-[10px] font-black uppercase tracking-[0.4em] shadow-2xl" style={{ backgroundColor: theme.primaryColor }}>
                    <Sparkles size={14} style={{ color: theme.accentColor }} />
                    <span>
                        {typeof settings.contact?.hero?.badge === 'string'
                            ? settings.contact.hero.badge
                            : (settings.contact?.hero?.badge?.text || "Get In Touch")}
                    </span>
                </div>
            </EditableRegion>

            <h1 className="text-7xl md:text-9xl font-black tracking-tighter leading-[0.85]" style={{ color: theme.primaryColor }}>
                <InlineEdit path="contact.hero.title" text={settings.contact?.hero?.title || "Contact Our Campus."} label="Hero Title" />
            </h1>

            <p className="text-xl md:text-2xl text-gray-500 max-w-3xl mx-auto leading-relaxed font-medium tracking-tight">
                <InlineEdit path="contact.hero.subtitle" text={settings.contact?.hero?.subtitle || "Reach out for inquiries, admissions, or technical support. We are here to assist."} label="Hero Subtitle" />
            </p>

            <div 
                onClick={() => document.getElementById('message-portal').scrollIntoView({ behavior: 'smooth' })}
                className="flex flex-col items-center gap-3 cursor-pointer group pt-10"
            >
                <div className="w-12 h-12 rounded-full bg-white shadow-xl flex items-center justify-center border border-gray-100 group-hover:text-white transition-all transform group-hover:translate-y-2" style={{ "--hover-bg": theme.accentColor }}>
                    <ChevronDown size={20} className="animate-bounce" />
                </div>
            </div>
            </div>
        </section>
      )}

      {/* --- INFO CARDS --- */}
      {layout.showCards && (
        <section className="py-24 px-6 relative bg-white border-y border-gray-50">
            <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
                <EditableRegion type="cards" path="contact.cards" label="Contact Info Cards" className="col-span-full">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {contactCards.map((card, i) => {
                            const Icon = card.icon;
                            return (
                                <div 
                                key={i} 
                                className="group p-12 rounded-[3.5rem] bg-neutral-bg-subtle border border-gray-100 hover:bg-white hover:shadow-accent-glow transition-all duration-700 relative overflow-hidden active:scale-95"
                                >
                                <div className="relative z-10 space-y-10">
                                    <div className="flex items-center justify-between">
                                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-sm group-hover:rotate-6 transition-all duration-500`} style={{ backgroundColor: `${theme.accentColor}15`, color: theme.accentColor }}>
                                        <Icon size={24} />
                                    </div>
                                    <div className="text-[9px] uppercase font-black tracking-[0.3em] text-gray-300 group-hover:text-accent-500 transition-colors">
                                        {card.label}
                                    </div>
                                    </div>

                                    <div className="space-y-4">
                                    <h3 className="text-2xl font-black text-primary-950 group-hover:text-accent-600 transition-colors uppercase tracking-tight" style={{ color: theme.primaryColor }}>
                                        {card.title}
                                    </h3>
                                    <div className="space-y-1">
                                        {card.details.map((text, idx) => (
                                            <p key={idx} className="text-gray-500 font-bold tracking-tight text-xs uppercase opacity-80 leading-relaxed">
                                                {text}
                                            </p>
                                        ))}
                                    </div>
                                    </div>
                                </div>
                                </div>
                            );
                        })}
                    </div>
                </EditableRegion>
            </div>
        </section>
      )}

      {/* --- CAMPUS LOCATION --- */}
      {layout.showLocation && (
        <section className="py-40 px-6 bg-white relative overflow-hidden">
            <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-20 items-center relative z-10">
            <div className="flex-1 space-y-12">
                <div className="space-y-6">
                    <EditableRegion type="badge" path="contact.location.badge" label="Location Badge">
                        <div className="inline-block px-5 py-2 rounded-2xl text-[10px] font-black uppercase tracking-[0.4em] border" style={{ backgroundColor: `${theme.accentColor}10`, color: theme.accentColor, borderColor: `${theme.accentColor}30` }}>
                            {settings.contact?.location?.badge || "Institution Location"}
                        </div>
                    </EditableRegion>
                    <h2 className="text-6xl md:text-8xl font-black text-primary-950 tracking-tighter leading-[0.9] italic" style={{ color: theme.primaryColor }}>
                        <InlineEdit path="contact.location.title" text={settings.contact?.location?.title || "Visit Our Campus."} label="Location Title" />
                    </h2>
                    <div className="w-20 h-2 rounded-full" style={{ backgroundColor: theme.accentColor }}></div>
                </div>

                <div className="p-12 rounded-[4.5rem] bg-neutral-bg-subtle border border-gray-100 space-y-10 relative overflow-hidden group hover:shadow-2xl transition-all duration-700">
                    <div className="flex items-start gap-8 relative z-10">
                    <div className="w-16 h-16 rounded-[2rem] text-white flex items-center justify-center flex-shrink-0 group-hover:rotate-12 transition-transform duration-500 shadow-xl border-4 border-white" style={{ backgroundColor: theme.primaryColor }}>
                        <MapPin size={24} />
                    </div>
                    <div className="space-y-3">
                        <p className="text-2xl font-black text-primary-950 tracking-tighter uppercase">{settings.schoolName}</p>
                        <p className="text-base font-medium text-gray-500 leading-relaxed italic pr-10 opacity-70">
                            {settings.global?.footer?.address || "Address details from settings."}
                        </p>
                    </div>
                    </div>
                </div>
            </div>

            <div className="flex-1 w-full">
                <EditableRegion type="map" path="contact.location.mapLink" label="Interactive Google Map">
                    <div className="relative group p-4 border border-gray-100 rounded-[5rem] bg-white shadow-accent-glow">
                        <iframe
                        title="Location"
                        className="w-full h-[550px] rounded-[4.2rem] grayscale hover:grayscale-0 transition-all duration-1000 border-4 border-white shadow-inner"
                        loading="lazy"
                        allowFullScreen
                        src={settings.contact?.location?.mapLink || "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d1!2d76.16!3d28.46!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!5e0!3m2!1sen!2sin!4v1"}
                        ></iframe>
                    </div>
                </EditableRegion>
            </div>
            </div>
        </section>
      )}

      {/* --- MESSAGE HUB --- */}
      {layout.showMessageHub && (
        <section id="message-portal" className="py-32 md:py-48 px-6 bg-white relative">
            <div className="max-w-7xl mx-auto relative z-10 animate-fade-up">
                <div className="relative bg-white border border-gray-100 rounded-[3.5rem] md:rounded-[5.5rem] shadow-4xl overflow-hidden flex flex-col lg:flex-row">
                    <div className="lg:w-1/3 p-12 md:p-20 text-white relative" style={{ backgroundColor: theme.primaryColor }}>
                        <div className="relative z-10 h-full flex flex-col justify-between space-y-12">
                        <div className="space-y-6">
                            <h2 className="text-5xl md:text-7xl font-black tracking-tighter leading-none">
                                Connect <br /> <span style={{ color: theme.accentColor }}>With Us.</span>
                            </h2>
                            <div className="w-16 h-2 rounded-full" style={{ backgroundColor: theme.accentColor }}></div>
                        </div>
                        
                        <p className="text-white/50 text-base font-medium leading-relaxed italic pr-4">
                            Reach out for academic guidance or general information.
                        </p>
                        </div>
                    </div>

                    <div className="flex-1 p-12 md:p-24 relative bg-neutral-bg-subtle/20">
                        <form onSubmit={submitForm} className="space-y-16">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-12">
                            {[
                                { name: "name", label: "Full Name", icon: Users, placeholder: "e.g. John Doe" },
                                { name: "email", label: "Email", icon: Mail, placeholder: "e.g. john@example.com" },
                                { name: "phone", label: "Phone", icon: Phone, placeholder: "+91 XXXX" },
                                { name: "subject", label: "Subject", icon: MessageSquare, placeholder: "Reason for contact" },
                            ].map((field, i) => (
                                <div key={i} className="space-y-4 group/field">
                                <label className="text-[10px] font-black uppercase tracking-[0.4em] text-primary-950/30 ml-1 group-focus-within/field:text-accent-500 transition-colors">
                                    {field.label}
                                </label>
                                <div className="relative">
                                    <field.icon size={16} className="absolute left-0 top-1/2 -translate-y-1/2 text-primary-950/20 group-focus-within/field:text-accent-500 transition-colors" />
                                    <input
                                    type="text"
                                    name={field.name}
                                    value={form[field.name]}
                                    placeholder={field.placeholder}
                                    onChange={handleChange}
                                    required
                                    className="w-full pl-8 pr-4 py-5 bg-transparent border-b border-gray-100 text-primary-950 focus:border-accent-500 outline-none transition-all font-bold tracking-tight text-xl"
                                    />
                                </div>
                                </div>
                            ))}
                        </div>

                        <div className="space-y-4 group/field">
                            <label className="text-[10px] font-black uppercase tracking-[0.4em] text-primary-950/30 ml-1 group-focus-within/field:text-accent-500 transition-colors">Message</label>
                            <div className="relative">
                                <MessageCircle size={16} className="absolute left-0 top-6 text-primary-950/20 group-focus-within/field:text-accent-500 transition-colors" />
                                <textarea
                                name="message"
                                rows="4"
                                value={form.message}
                                placeholder="Details..."
                                onChange={handleChange}
                                required
                                className="w-full pl-8 pr-4 py-5 bg-transparent border-b border-gray-100 text-primary-950 focus:border-accent-500 outline-none transition-all font-bold tracking-tight text-xl resize-none"
                                />
                            </div>
                        </div>

                        <div className="pt-8">
                            <Button type="submit" className="px-14 py-8 rounded-[2rem] text-white shadow-3xl transition-all duration-500 font-black uppercase tracking-[0.5em] text-xs flex items-center justify-center gap-6 relative overflow-hidden group/btn" style={{ backgroundColor: theme.primaryColor }}>
                                <span className="relative">Send Message</span>
                                <div className="w-12 h-12 rounded-full bg-white shadow-xl flex items-center justify-center" style={{ color: theme.accentColor }}>
                                    <Send size={20} />
                                </div>
                            </Button>
                        </div>
                        </form>
                    </div>
                </div>
            </div>
        </section>
      )}

      {/* --- FAQ SECTION --- */}
      {layout.showFaqs && (
        <section className="py-44 px-6 bg-white border-t border-gray-50">
            <div className="max-w-4xl mx-auto space-y-24">
            <div className="text-center space-y-6">
                <h2 className="text-6xl md:text-8xl font-black text-primary-950 tracking-tighter leading-none italic" style={{ color: theme.primaryColor }}>
                    Common <span style={{ color: theme.accentColor }}>Queries.</span>
                </h2>
            </div>

            <div className="grid gap-8">
                {(settings.contact?.faqs || [
                { q: "How can I apply?", a: "Via our online portal." },
                { q: "Office hours?", a: "9 AM - 3 PM." },
                ]).map((faq, i) => (
                    <div key={i} className="group p-12 md:p-16 rounded-[4.5rem] bg-neutral-bg-subtle border border-gray-100 hover:bg-white hover:shadow-4xl transition-all duration-500">
                    <div className="flex items-center gap-8 mb-6">
                        <div className="w-14 h-14 rounded-2xl text-white flex items-center justify-center flex-shrink-0 shadow-lg" style={{ backgroundColor: theme.accentColor }}>
                            <HelpCircle size={24} />
                        </div>
                        <h4 className="text-2xl md:text-4xl font-black tracking-tighter italic leading-tight" style={{ color: theme.primaryColor }}>{faq.q}</h4>
                    </div>
                    <p className="pl-22 text-gray-500 font-medium leading-relaxed italic text-lg" style={{ borderLeftColor: theme.accentColor, borderLeftWidth: "2px", marginLeft: "2.75rem" }}>"{faq.a}"</p>
                </div>
                ))}
            </div>
            </div>
        </section>
      )}

    </div>
  );
};

export default ContactPage;
