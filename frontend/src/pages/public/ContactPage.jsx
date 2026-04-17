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
            toast.success("Message Transmitted. Our team will relay a response shortly.");
            setForm({
                name: "",
                email: "",
                phone: "",
                subject: "",
                message: "",
            });
        } catch (err) {
            console.error(err);
            toast.error("Signal Lost. Please verify your connection.");
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

    const IconMap = { Headphones, Mail, Calendar, MapPin, Globe, ShieldCheck, HelpCircle, MessageCircle, Zap, Shield, Sparkles, Users, MessageSquare };

    const defaultCards = [
        { 
            title: "Phone Support", 
            details: ["Office: +91 98765 43210", "Admin: +91 88001 23456"], 
            icon: "Headphones", 
            color: "bg-blue-50 text-blue-600",
            label: "Call Us Anytime"
        },
        { 
            title: "Email Inquiry", 
            details: ["info@sbsbadhwana.edu", "admissions@sbsbadhwana.edu"], 
            icon: "Mail", 
            color: "bg-accent-50 text-accent-700",
            label: "Digital Response"
        },
        { 
            title: "Campus Hours", 
            details: ["Mon – Fri: 9:00 AM - 3:00 PM", "Sat: 9:00 AM - 12:00 PM"], 
            icon: "Calendar", 
            color: "bg-purple-50 text-purple-600",
            label: "Working Schedule"
        },
    ];

    const contactCards = (settings.contact?.cards || []).length > 0
        ? settings.contact.cards.map((c, i) => ({
            ...c,
            icon: IconMap[c.icon] || defaultCards[i % defaultCards.length].icon,
            color: defaultCards[i % defaultCards.length].color,
            label: c.label || defaultCards[i % defaultCards.length].label
        }))
        : defaultCards.map(c => ({...c, icon: IconMap[c.icon]}));

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-gray-900 font-body overflow-x-hidden pt-20">

      {/* --- HERO SECTION: HIGH-FIDENSITY TYPOGRAPHY --- */}
      <section className="relative min-h-[85vh] flex flex-col items-center justify-center px-6 overflow-hidden">
        {/* Animated Background Mesh */}
        <div className="absolute inset-0 -z-10 bg-white">
           <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-gradient-to-b from-accent-50/50 via-white to-white"></div>
           <div className="absolute top-1/4 -left-20 w-[600px] h-[600px] bg-accent-100/30 rounded-full blur-[120px] animate-pulse"></div>
           <div className="absolute bottom-1/4 -right-20 w-[600px] h-[600px] bg-blue-50/40 rounded-full blur-[120px] animate-pulse delay-1000"></div>
           {/* Grid Pattern Overlay */}
           <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.05] pointer-events-none"></div>
        </div>

        <div className="max-w-6xl mx-auto text-center space-y-12 relative z-10 animate-fade-up">
           <div className="inline-flex items-center gap-2 px-6 py-2 rounded-full bg-primary-950 text-white text-[10px] font-black uppercase tracking-[0.4em] shadow-2xl">
              <Sparkles size={14} className="text-accent-400" />
              <span>{settings.contact?.hero?.badge || "Institutional Support Network"}</span>
           </div>

           <h1 className="text-7xl md:text-9xl font-black tracking-tighter leading-[0.85] text-primary-950">
             {settings.contact?.hero?.title?.includes("Campus") 
               ? <>
                   {settings.contact.hero.title.split("Campus")[0]}
                   <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent-600 via-accent-550 to-accent-500">Campus.</span>
                 </>
               : settings.contact?.hero?.title || "Contact Our Campus."}
           </h1>

           <p className="text-xl md:text-2xl text-gray-500 max-w-3xl mx-auto leading-relaxed font-medium tracking-tight">
             {settings.contact?.hero?.subtitle || "Reach out to our administrative team for inquiries, admissions, or technical support. We are here to assist your educational journey."}
           </p>

           {/* Animated Scroll Indicator */}
           <div 
             onClick={() => document.getElementById('message-portal').scrollIntoView({ behavior: 'smooth' })}
             className="flex flex-col items-center gap-3 cursor-pointer group pt-10"
           >
              <div className="w-12 h-12 rounded-full bg-white shadow-xl flex items-center justify-center border border-gray-100 group-hover:bg-accent-500 group-hover:text-white transition-all transform group-hover:translate-y-2">
                 <ChevronDown size={20} className="animate-bounce" />
              </div>
              <span className="text-[9px] font-black uppercase tracking-[0.5em] text-primary-950/40 opacity-0 group-hover:opacity-100 transition-opacity">Initialize</span>
           </div>
        </div>
      </section>

      {/* --- INFO CARDS: BENTO INTERACTIVES --- */}
      <section className="py-24 px-6 relative bg-white border-y border-gray-50">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
           {contactCards.map((card, i) => {
              const Icon = card.icon;
              return (
                <div 
                  key={i} 
                  className="group p-12 rounded-[3.5rem] bg-neutral-bg-subtle border border-gray-100 hover:bg-white hover:shadow-accent-glow hover:border-accent-200 transition-all duration-700 relative overflow-hidden active:scale-95"
                >
                  <div className="relative z-10 space-y-10">
                    <div className="flex items-center justify-between">
                       <div className={`w-14 h-14 rounded-2xl ${card.color} flex items-center justify-center shadow-sm group-hover:rotate-6 transition-all duration-500`}>
                          <Icon size={24} />
                       </div>
                       <div className="text-[9px] uppercase font-black tracking-[0.3em] text-gray-300 group-hover:text-accent-500 transition-colors">
                          {card.label}
                       </div>
                    </div>

                    <div className="space-y-4">
                       <h3 className="text-2xl font-black text-primary-950 group-hover:text-accent-600 transition-colors uppercase tracking-tight">
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
                  {/* Glass highlight */}
                  <div className="absolute top-0 right-0 w-32 h-32 bg-accent-500/5 rounded-bl-[4rem] group-hover:scale-150 transition-transform duration-1000"></div>
                </div>
              );
           })}
        </div>
      </section>

      {/* --- CAMPUS LOCATION: ASYMMETRIC HUB --- */}
      <section className="py-40 px-6 bg-white relative overflow-hidden">
        {/* Big watermark */}
        <div className="absolute top-1/2 left-0 -translate-y-1/2 text-[20rem] font-black text-gray-50/50 select-none whitespace-nowrap pointer-events-none">INSTITUTION</div>

        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-20 items-center relative z-10">
          
          <div className="flex-1 space-y-12">
             <div className="space-y-6">
                <div className="inline-block px-5 py-2 bg-accent-100/50 text-accent-700 rounded-2xl text-[10px] font-black uppercase tracking-[0.4em] border border-accent-200">
                   {settings.contact?.location?.badge || "Strategic Hub"}
                </div>
                <h2 className="text-6xl md:text-8xl font-black text-primary-950 tracking-tighter leading-[0.9] italic">
                   {settings.contact?.location?.title?.includes("Institution")
                     ? <>
                        {settings.contact.location.title.split("Institution")[0]}
                        <span className="text-accent-500">Institution.</span>
                       </>
                     : settings.contact?.location?.title || "Visit Our Institution."}
                </h2>
                <div className="w-20 h-2 bg-accent-500 rounded-full"></div>
             </div>

             <div className="p-12 rounded-[4.5rem] bg-neutral-bg-subtle border border-gray-100 space-y-10 relative overflow-hidden group hover:shadow-2xl transition-all duration-700">
                <div className="absolute top-0 right-0 w-32 h-32 bg-accent-500/10 rounded-full blur-3xl group-hover:scale-150 transition-transform"></div>
                
                <div className="flex items-start gap-8 relative z-10">
                   <div className="w-16 h-16 rounded-[2rem] bg-primary-950 text-white flex items-center justify-center flex-shrink-0 group-hover:rotate-12 transition-transform duration-500 shadow-xl border-4 border-white">
                      <MapPin size={24} />
                   </div>
                   <div className="space-y-3">
                      <p className="text-2xl font-black text-primary-950 tracking-tighter uppercase">{settings.contact?.location?.campusName || settings.schoolName || "SBS Senior Secondary School"}</p>
                      <p className="text-base font-medium text-gray-500 leading-relaxed italic pr-10 opacity-70">
                         {settings.contact?.location?.address || settings.global?.footer?.address || "Village Badhwana, Tehsil Dadri, Charkhi Dadri, Haryana – 127308"}
                      </p>
                   </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10 border-t border-gray-200 pt-10">
                   <div className="flex items-center gap-4 group/item">
                      <div className="w-9 h-9 rounded-xl bg-white shadow-sm flex items-center justify-center text-accent-500 group-hover/item:bg-accent-500 group-hover/item:text-white transition-all">
                         <Globe size={18} />
                      </div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-primary-950 opacity-60">Global Standards</p>
                   </div>
                   <div className="flex items-center gap-4 group/item">
                      <div className="w-9 h-9 rounded-xl bg-white shadow-sm flex items-center justify-center text-accent-500 group-hover/item:bg-accent-500 group-hover/item:text-white transition-all">
                         <ShieldCheck size={18} />
                      </div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-primary-950 opacity-60">Safe Campus Env</p>
                   </div>
                </div>
             </div>
          </div>

          <div className="flex-1 w-full">
             <div className="relative group p-4 border border-gray-100 rounded-[5rem] bg-white shadow-accent-glow">
                <iframe
                   title="School Location Map"
                   className="w-full h-[550px] rounded-[4.2rem] filter contrast-[1.1] grayscale hover:grayscale-0 transition-all duration-1000 border-4 border-white shadow-inner"
                   loading="lazy"
                   allowFullScreen
                   src={settings.contact?.location?.mapLink || "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2246.22632576644!2d76.1692249157583!3d28.464696295986987!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x39129399e7dbf75d%3A0x566aaa0f0fa17190!2sS.%20B.%20S.%20Senior%20Secondary%20School!5e0!3m2!1sen!2sin!4v1700500000000"}
                ></iframe>
                {/* Floating Map Label */}
                <div className="absolute top-10 right-10 p-5 bg-white/20 backdrop-blur-3xl rounded-3xl border border-white/30 shadow-2xl space-y-1">
                    <p className="text-lg font-black text-primary-950 italic">Open in Maps</p>
                    <div className="h-0.5 w-8 bg-accent-500"></div>
                </div>
             </div>
          </div>
        </div>
      </section>

      {/* --- MESSAGE HUB: EDITORIAL UI --- */}
      <section id="message-portal" className="py-32 md:py-48 px-6 bg-white relative">
        <div className="max-w-7xl mx-auto relative z-10 animate-fade-up">
           <div className="relative group">
              {/* Outer Shadow Glow */}
              <div className="absolute -inset-4 bg-primary-950/5 rounded-[4rem] blur-[60px] opacity-20 transition-opacity"></div>
              
              <div className="relative bg-white border border-gray-100 rounded-[3.5rem] md:rounded-[5.5rem] shadow-4xl overflow-hidden flex flex-col lg:flex-row">
                 {/* Left: Branding & Protocols */}
                 <div className="lg:w-1/3 bg-primary-950 p-12 md:p-20 text-white relative">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-accent-500/10 rounded-full blur-[80px]"></div>
                    
                    <div className="relative z-10 h-full flex flex-col justify-between space-y-12">
                       <div className="space-y-6">
                          <h2 className="text-5xl md:text-7xl font-black tracking-tighter leading-none">
                            Connect <br /> <span className="text-accent-500">With Us.</span>
                          </h2>
                          <div className="w-16 h-2 bg-accent-500 rounded-full"></div>
                       </div>
                       
                       <p className="text-white/50 text-base font-medium leading-relaxed italic pr-4">
                          Your inquiries drive our campus forward. Reach out for academic guidance, visit requests, or general information.
                       </p>

                       <div className="space-y-8 pt-10">
                          <div className="flex items-center gap-5 group/item">
                             <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center group-hover/item:bg-accent-500 transition-all shadow-lg">
                                <Shield size={20} className="text-accent-500 group-hover/item:text-white" />
                             </div>
                             <div className="space-y-0.5">
                                <span className="text-[10px] font-black uppercase tracking-[0.3em] block">Data Protocol</span>
                                <span className="text-[10px] font-bold text-white/30 uppercase tracking-widest">TLS 1.3 Encryption</span>
                             </div>
                          </div>
                          <div className="flex items-center gap-5 group/item">
                             <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center group-hover/item:bg-accent-500 transition-all shadow-lg">
                                <Zap size={20} className="text-accent-500 group-hover/item:text-white" />
                             </div>
                             <div className="space-y-0.5">
                                <span className="text-[10px] font-black uppercase tracking-[0.3em] block">Priority Response</span>
                                <span className="text-[10px] font-bold text-white/30 uppercase tracking-widest">Within 24 Hours</span>
                             </div>
                          </div>
                       </div>
                    </div>
                 </div>

                 {/* Right: Modern Form Segment */}
                 <div className="flex-1 p-12 md:p-24 relative bg-neutral-bg-subtle/20">
                    <form onSubmit={submitForm} className="space-y-16">
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-12">
                          {[
                            { name: "name", label: "Full Identity", icon: Users, placeholder: "e.g. Aarav Sharma" },
                            { name: "email", label: "Digital Address", icon: Mail, placeholder: "e.g. aarav@institution.edu" },
                            { name: "phone", label: "Relay Number", icon: Phone, placeholder: "+91 XXXX XXXX" },
                            { name: "subject", label: "Inquiry Class", icon: MessageSquare, placeholder: "Admission / Academics" },
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
                                  className="w-full pl-8 pr-4 py-5 bg-transparent border-b border-gray-100 text-primary-950 placeholder:text-gray-200 focus:border-accent-500 outline-none transition-all font-bold tracking-tight text-xl"
                                />
                              </div>
                            </div>
                          ))}
                       </div>

                       <div className="space-y-4 group/field">
                          <label className="text-[10px] font-black uppercase tracking-[0.4em] text-primary-950/30 ml-1 group-focus-within/field:text-accent-500 transition-colors">Your Message</label>
                          <div className="relative">
                             <MessageCircle size={16} className="absolute left-0 top-6 text-primary-950/20 group-focus-within/field:text-accent-500 transition-colors" />
                             <textarea
                               name="message"
                               rows="4"
                               value={form.message}
                               placeholder="Draft your detailed inquiry here..."
                               onChange={handleChange}
                               required
                               className="w-full pl-8 pr-4 py-5 bg-transparent border-b border-gray-100 text-primary-950 placeholder:text-gray-200 focus:border-accent-500 outline-none transition-all font-bold tracking-tight text-xl resize-none"
                             />
                          </div>
                       </div>

                       <div className="pt-8">
                          <Button type="submit" className="px-14 py-8 rounded-[2rem] bg-primary-950 text-white hover:bg-accent-500 shadow-3xl transition-all duration-500 font-black uppercase tracking-[0.5em] text-xs flex items-center justify-center gap-6 relative overflow-hidden group/btn">
                             <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover/btn:animate-shimmer"></div>
                             <span className="relative">Initialize Connection</span>
                             <div className="w-12 h-12 rounded-full bg-white shadow-xl flex items-center justify-center group-hover/btn:scale-110 transition-transform">
                                <Send size={20} className="text-accent-600" />
                             </div>
                          </Button>
                       </div>
                    </form>
                 </div>
              </div>
           </div>
        </div>
      </section>

      {/* --- FAQ SECTION: BENTO QUERIES --- */}
      <section className="py-44 px-6 bg-white border-t border-gray-50">
        <div className="max-w-4xl mx-auto space-y-24">
           <div className="text-center space-y-6">
              <h2 className="text-6xl md:text-8xl font-black text-primary-950 tracking-tighter leading-none italic">
                Common <span className="text-accent-500">Queries.</span>
              </h2>
              <p className="text-gray-400 font-black uppercase tracking-[0.6em] text-[10px]">Administrative & Technical assistance</p>
           </div>

           <div className="grid gap-8">
             {(settings.contact?.faqs || [
               { q: "How can I apply for admission?", a: "Applications can be initiated via our online digital portal or through a physical kit available at the administrative office." },
               { q: "What are the standard office hours?", a: "We are operational Monday through Friday, 9:00 AM to 3:00 PM. Saturday support is available until 12:00 PM." },
               { q: "Is GPS-tracked transport available?", a: "Yes, we provide safe, reliable, and GPS-monitored transportation covering the entire Charkhi Dadri region." }
             ]).map((faq, i) => (
                <div key={i} className="group p-12 md:p-16 rounded-[4.5rem] bg-neutral-bg-subtle border border-gray-100 hover:bg-white hover:shadow-4xl transition-all duration-500 cursor-default">
                  <div className="flex items-center gap-8 mb-6">
                     <div className="w-14 h-14 rounded-2xl bg-accent-500 text-white flex items-center justify-center flex-shrink-0 shadow-lg group-hover:rotate-12 transition-transform">
                        <HelpCircle size={24} />
                     </div>
                     <h4 className="text-2xl md:text-4xl font-black text-primary-950 tracking-tighter italic leading-tight">{faq.q}</h4>
                  </div>
                  <p className="pl-22 text-gray-500 font-medium leading-relaxed italic text-lg pr-12 opacity-80 border-l-2 border-accent-100 ml-[2.75rem]">"{faq.a}"</p>
               </div>
             ))}
           </div>
        </div>
      </section>

    </div>
  );
};

export default ContactPage;
