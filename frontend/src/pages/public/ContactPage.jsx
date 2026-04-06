// frontend/src/pages/public/ContactPage.jsx
import React, { useState } from "react";
import axios from "axios";
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
  Info,
  ChevronDown,
  Globe,
  HelpCircle,
  ShieldCheck,
  Shield,
  Send,
  Users,
  Calendar,
  MessageCircle,
  Headphones
} from "lucide-react";

const ContactPage = () => {
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
      alert("Message sent to school successfully!");
    } catch (err) {
      alert("Failed to send message, try again.");
    }
  };

  const contactCards = [
    { 
      title: "Phone Support", 
      details: ["Office: +91 98765 43210", "Admin: +91 88001 23456"], 
      icon: Headphones, 
      color: "bg-blue-50 text-blue-600",
      label: "Call Us Anytime"
    },
    { 
      title: "Email Inquiry", 
      details: ["info@sbsschool.com", "admissions@sbsschool.com"], 
      icon: Mail, 
      color: "bg-accent-50 text-accent-700",
      label: "Digital Response"
    },
    { 
      title: "Campus Hours", 
      details: ["Mon – Fri: 9:00 AM - 3:00 PM", "Sat: 9:00 AM - 12:00 PM"], 
      icon: Calendar, 
      color: "bg-purple-50 text-purple-600",
      label: "Working Schedule"
    },
  ];

  return (
    <div className="min-h-screen bg-neutral-bg-subtle text-gray-900 font-body overflow-x-hidden">

      {/* --- PREMIUM SCHOOL HERO --- */}
      <section className="relative min-h-[80vh] flex flex-col items-center justify-center pt-32 pb-16 px-6 overflow-hidden">
        {/* Massive Blurs & Brand Background */}
        <div className="absolute inset-0 -z-10 bg-white">
           <div className="absolute inset-0 bg-gradient-to-b from-white via-neutral-bg-subtle to-white opacity-80"></div>
           <div className="absolute -top-24 -left-24 w-[800px] h-[800px] bg-accent-100/40 rounded-full blur-[150px] pulse-slow"></div>
           <div className="absolute top-1/2 -right-24 w-[800px] h-[800px] bg-blue-100/30 rounded-full blur-[150px] pulse-slow delay-1000"></div>
           {/* Subtle academic texture */}
           <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] pointer-events-none"></div>
        </div>

        <div className="max-w-5xl mx-auto text-center space-y-12 relative z-10 animate-fade-up">
           <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-primary-950 text-white text-[10px] font-black uppercase tracking-[0.4em] shadow-xl">
              <Sparkles size={14} className="text-accent-400" />
              <span>Connect with our Institution</span>
           </div>

           <h1 className="text-7xl md:text-9xl font-black tracking-tighter leading-[0.85] text-primary-950">
             Contact <br />
             <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent-600 via-accent-500 to-accent-400">Our Campus.</span>
           </h1>

           <p className="text-xl md:text-2xl text-gray-500 max-w-2xl mx-auto leading-relaxed font-medium tracking-tight">
             Reach out to our administrative team for inquiries, admissions, or technical support. We are here to assist your educational journey.
           </p>

           <div className="flex flex-col items-center gap-6 pt-10 group">
              <div 
                onClick={() => document.getElementById('message-portal').scrollIntoView({ behavior: 'smooth' })}
                className="flex items-center gap-5 py-3 border-b-2 border-primary-950/10 hover:border-accent-500 cursor-pointer transition-all duration-500"
              >
                <div className="w-12 h-12 rounded-2xl bg-white shadow-xl flex items-center justify-center group-hover:bg-accent-500 group-hover:text-white transition-all transform group-hover:rotate-6">
                   <ChevronDown size={20} />
                </div>
                <span className="text-xs font-black uppercase tracking-[0.4em] text-primary-950">Send a Direct Message</span>
              </div>
           </div>
        </div>
      </section>

      {/* --- ESSENTIAL INFO CARDS (Bento Style) --- */}
      <section className="py-24 px-6 relative">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-10">
           {contactCards.map((card, i) => {
              const Icon = card.icon;
              return (
                <div key={i} className="group p-12 rounded-[4rem] bg-white border border-gray-100 shadow-2xl hover:shadow-accent-glow hover:border-accent-300 transition-all duration-700 relative overflow-hidden animate-fade-up" style={{ animationDelay: `${i * 150}ms` }}>
                  <div className="relative z-10 space-y-10">
                    <div className="flex items-center justify-between">
                       <div className={`w-16 h-16 rounded-3xl ${card.color} flex items-center justify-center shadow-md group-hover:scale-110 group-hover:rotate-12 transition-all duration-500`}>
                          <Icon size={28} />
                       </div>
                       <div className="text-[10px] uppercase font-black tracking-[0.2em] text-gray-300 group-hover:text-accent-500 transition-colors">
                          {card.label}
                       </div>
                    </div>

                    <div className="space-y-4">
                       <h3 className="text-3xl font-black text-primary-950 group-hover:text-accent-600 transition-colors italic tracking-tighter">
                          {card.title}
                       </h3>
                       <div className="space-y-1">
                          {card.details.map((text, idx) => (
                             <p key={idx} className="text-gray-500 font-bold tracking-tight text-sm uppercase">
                                {text}
                             </p>
                          ))}
                       </div>
                    </div>
                  </div>
                  {/* Subtle bg decoration */}
                  <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-accent-50/20 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-1000"></div>
                </div>
              );
           })}
        </div>
      </section>

      {/* --- CAMPUS LOCATION (SPLIT SCREEN) --- */}
      <section className="py-40 px-6 bg-white relative">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-20 items-center">
          
          {/* Left: Directions & Details */}
          <div className="flex-1 space-y-12 animate-fade-right">
             <div className="space-y-6">
                <div className="inline-block px-5 py-2 bg-accent-100/50 text-accent-700 rounded-2xl text-[10px] font-black uppercase tracking-[0.4em]">
                   Campus Location
                </div>
                <h2 className="text-6xl md:text-8xl font-black text-primary-950 tracking-tighter leading-none italic">
                   Visit Our <br /> <span className="text-accent-500">Institution.</span>
                </h2>
                <div className="w-24 h-2 bg-accent-500 rounded-full"></div>
             </div>

             <div className="p-12 rounded-[5rem] bg-neutral-bg-subtle border border-gray-100 space-y-10 relative overflow-hidden group hover:shadow-2xl transition-all duration-700">
                <div className="absolute top-0 right-0 w-32 h-32 bg-accent-500/10 rounded-full blur-3xl"></div>
                
                <div className="flex items-start gap-8 relative z-10">
                   <div className="w-20 h-20 rounded-[2.5rem] bg-primary-950 text-white flex items-center justify-center flex-shrink-0 group-hover:rotate-12 transition-transform duration-500 shadow-xl">
                      <MapPin size={36} />
                   </div>
                   <div className="space-y-3">
                      <p className="text-2xl font-black text-primary-950 tracking-tighter">S.B.S. Senior Secondary School</p>
                      <p className="text-base font-medium text-gray-500 leading-relaxed italic pr-10">
                         Village Badhwana, Tehsil Dadri, <br />
                         District Charkhi Dadri, Haryana – 127308
                      </p>
                   </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10 border-t border-gray-200 pt-10">
                   <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-white shadow-md flex items-center justify-center text-accent-500">
                         <Globe size={18} />
                      </div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-primary-950">Global Standards</p>
                   </div>
                   <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-white shadow-md flex items-center justify-center text-accent-500">
                         <ShieldCheck size={18} />
                      </div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-primary-950">Safe Campus Env</p>
                   </div>
                </div>
             </div>
          </div>

          {/* Right: Map with High-End Frame */}
          <div className="flex-1 w-full animate-fade-left">
             <div className="relative group">
                <div className="absolute -inset-10 bg-accent-100 opacity-20 rounded-[6rem] blur-2xl opacity-0 group-hover:opacity-100 transition duration-1000"></div>
                <div className="relative bg-white p-6 rounded-[5rem] shadow-4xl transform group-hover:scale-[1.01] transition-transform duration-700">
                   <iframe
                      title="School Location Map"
                      className="w-full h-[600px] rounded-[4rem] filter contrast-[1.05] grayscale group-hover:grayscale-0 transition-all duration-1000 border border-gray-50"
                      loading="lazy"
                      allowFullScreen
                      src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2246.22632576644!2d76.1692249157583!3d28.464696295986987!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x39129399e7dbf75d%3A0x566aaa0f0fa17190!2sS.%20B.%20S.%20Senior%20Secondary%20School!5e0!3m2!1sen!2sin!4v1700500000000"
                   ></iframe>
                </div>
             </div>
          </div>
        </div>
      </section>

      {/* --- EDITORIAL UI SEND A MESSAGE PORTAL --- */}
      <section id="message-portal" className="py-24 md:py-44 px-6 bg-white relative overflow-hidden">
        {/* Subtle Background Markings */}
        <div className="absolute top-0 right-0 text-[30vw] font-black text-gray-50 select-none leading-none -translate-y-1/2 translate-x-1/4">HUB</div>
        <div className="absolute bottom-20 left-10 w-40 h-[2px] bg-accent-500 opacity-20"></div>

        <div className="max-w-7xl mx-auto relative z-10 animate-fade-up">
           <div className="relative group">
              {/* Outer Shadow Glow */}
              <div className="absolute -inset-4 bg-primary-950/5 rounded-[4rem] blur-[60px] opacity-0 group-hover:opacity-100 transition-opacity duration-1000"></div>
              
              <div className="relative bg-white border border-gray-100 rounded-[3rem] md:rounded-[5rem] shadow-[0_50px_100px_-20px_rgba(13,50,22,0.12)] overflow-hidden flex flex-col lg:flex-row">
                 {/* Left Segment: Informational / Branding */}
                 <div className="lg:w-1/3 bg-primary-950 p-12 md:p-20 text-white relative">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-accent-500/20 rounded-full blur-3xl"></div>
                    
                    <div className="relative z-10 space-y-12">
                       <div className="space-y-4">
                          <h2 className="text-4xl md:text-6xl font-black tracking-tighter leading-none">
                            Connect <br /> <span className="text-accent-400">With Us.</span>
                          </h2>
                          <div className="w-12 h-1.5 bg-accent-500 rounded-full"></div>
                       </div>
                       
                       <p className="text-white/60 text-sm font-medium leading-relaxed max-w-[240px]">
                          Your inquiries drive our campus forward. Reach out for academic guidance, visit requests, or general information.
                       </p>

                       <div className="space-y-6 pt-12">
                          <div className="flex items-center gap-4 group/item">
                             <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center group-hover/item:bg-accent-500 transition-colors">
                                <Shield size={18} className="text-accent-400 group-hover/item:text-white" />
                             </div>
                             <span className="text-[10px] font-black uppercase tracking-[0.2em]">Secure Data Protocol</span>
                          </div>
                          <div className="flex items-center gap-4 group/item">
                             <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center group-hover/item:bg-accent-500 transition-colors">
                                <Users size={18} className="text-accent-400 group-hover/item:text-white" />
                             </div>
                             <span className="text-[10px] font-black uppercase tracking-[0.2em]">Priority Campus Support</span>
                          </div>
                       </div>
                    </div>

                    <div className="absolute bottom-10 left-10 text-[6rem] font-black pointer-events-none select-none leading-none">
                       <span className="text-white/5">CONTAC</span>
                       <span className="text-accent-500/10">T</span>
                    </div>
                 </div>

                 {/* Right Segment: The Modern Form */}
                 <div className="flex-1 p-12 md:p-20 relative bg-neutral-bg-subtle/30">
                    <form onSubmit={submitForm} className="space-y-12">
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
                          {[
                            { name: "name", label: "Full Identity", icon: Users, placeholder: "Aarav Sharma" },
                            { name: "email", label: "Digital Address", icon: Mail, placeholder: "aarav.sharma@gmail.com" },
                            { name: "phone", label: "Relay Number", icon: Phone, placeholder: "+91 98765 43210" },
                            { name: "subject", label: "Inquiry Class", icon: MessageSquare, placeholder: "Admission Inquiry" },
                          ].map((field, i) => (
                            <div key={i} className="space-y-4 group/field">
                              <label className="text-[10px] font-black uppercase tracking-[0.4em] text-primary-950/40 ml-1 group-focus-within/field:text-accent-500 transition-colors">
                                {field.label}
                              </label>
                              <div className="relative">
                                <field.icon size={16} className="absolute left-0 top-1/2 -translate-y-1/2 text-primary-950/20 group-focus-within/field:text-accent-500 transition-colors" />
                                <input
                                  type="text"
                                  name={field.name}
                                  placeholder={field.placeholder}
                                  onChange={handleChange}
                                  required
                                  className="w-full pl-8 pr-4 py-4 bg-transparent border-b-2 border-gray-200 text-primary-950 placeholder:text-gray-300 focus:border-primary-950 outline-none transition-all font-bold tracking-tight text-lg"
                                />
                              </div>
                            </div>
                          ))}
                       </div>

                       <div className="space-y-4 group/field">
                          <label className="text-[10px] font-black uppercase tracking-[0.4em] text-primary-950/40 ml-1 group-focus-within/field:text-accent-500 transition-colors">Your Message</label>
                          <div className="relative">
                             <MessageCircle size={16} className="absolute left-0 top-5 text-primary-950/20 group-focus-within/field:text-accent-500 transition-colors" />
                             <textarea
                               name="message"
                               rows="4"
                               placeholder="Draft your detailed inquiry here..."
                               onChange={handleChange}
                               required
                               className="w-full pl-8 pr-4 py-4 bg-transparent border-b-2 border-gray-200 text-primary-950 placeholder:text-gray-300 focus:border-primary-950 outline-none transition-all font-bold tracking-tight text-lg resize-none"
                             />
                          </div>
                       </div>

                       <div className="pt-6">
                          <Button type="submit" className="px-12 py-7 rounded-2xl bg-primary-950 text-white hover:bg-accent-600 shadow-3xl transition-all duration-500 font-black uppercase tracking-[0.4em] text-xs flex items-center justify-center gap-6 relative overflow-hidden group/btn">
                             <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover/btn:animate-shimmer"></div>
                             <span className="relative">Initialize Connection</span>
                             <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center group-hover/btn:scale-110 transition-transform">
                                <Send size={18} className="text-accent-400" />
                             </div>
                          </Button>
                       </div>
                    </form>
                 </div>
              </div>
           </div>
        </div>
      </section>

      {/* --- COMMON QUERIES (FAQ BENTO) --- */}
      <section className="py-44 px-6 bg-white">
        <div className="max-w-4xl mx-auto space-y-24">
           <div className="text-center space-y-6">
              <h2 className="text-6xl md:text-8xl font-black text-primary-950 tracking-tighter italic leading-none">
                Common <span className="text-accent-500">Queries.</span>
              </h2>
              <p className="text-gray-400 font-bold uppercase tracking-[0.5em] text-[10px]">Administrative & Technical assistance</p>
           </div>

           <div className="grid gap-10">
             {[
               { q: "How can I apply for admission?", a: "Applications can be initiated via our online digital portal or through a physical kit available at the administrative office." },
               { q: "What are the standard office hours?", a: "We are operational Monday through Friday, 9:00 AM to 3:00 PM. Saturday support is available until 12:00 PM." },
               { q: "Is GPS-tracked transport available?", a: "Yes, we provide safe, reliable, and GPS-monitored transportation covering the entire Charkhi Dadri region." }
             ].map((faq, i) => (
               <div key={i} className="group p-10 md:p-14 rounded-[4rem] bg-neutral-bg-subtle border border-gray-100 hover:bg-white hover:shadow-4xl transition-all duration-500">
                  <div className="flex items-center gap-8 mb-6">
                     <div className="w-12 h-12 rounded-2xl bg-accent-500 text-white flex items-center justify-center flex-shrink-0 shadow-lg group-hover:rotate-12 transition-transform">
                        <HelpCircle size={24} />
                     </div>
                     <h4 className="text-2xl md:text-3xl font-black text-primary-950 tracking-tighter italic">{faq.q}</h4>
                  </div>
                  <p className="pl-20 text-gray-500 font-medium leading-relaxed italic text-lg pr-12">"{faq.a}"</p>
               </div>
             ))}
           </div>
        </div>
      </section>

      {/* --- SOCIAL ORBIT & BRANDING --- */}
      <section className="py-44 px-6 border-t border-gray-100">
         <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-24">
            <div className="space-y-12 text-center md:text-left">
               <div className="space-y-6">
                  <h3 className="text-6xl font-black text-primary-950 italic tracking-tighter">Stay <span className="text-accent-500 underline decoration-accent-100 decoration-[16px] underline-offset-[12px]">Connected.</span></h3>
                  <p className="text-gray-400 font-bold uppercase tracking-[0.4em] text-[10px]">Follow our legacy through modern digital space</p>
               </div>
               
               <div className="flex justify-center md:justify-start gap-8">
                  {[Facebook, Instagram, Twitter].map((Icon, i) => (
                     <div key={i} className="w-20 h-20 rounded-[2.5rem] bg-neutral-bg-subtle border border-gray-100 flex items-center justify-center text-primary-950 hover:bg-primary-950 hover:text-white hover:rotate-[360deg] transition-all duration-700 cursor-pointer shadow-xl group">
                        <Icon size={32} className="group-hover:scale-110 transition-transform" />
                     </div>
                  ))}
               </div>
            </div>
            
            <div className="relative group">
               <span className="text-[15vw] font-black text-gray-100 leading-none select-none tracking-tighter group-hover:text-accent-50 transition-colors duration-1000">SBS.</span>
               <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-right">
                  <div className="p-8 bg-white shadow-4xl rounded-[3rem] border border-gray-100">
                     <p className="text-2xl font-black text-primary-950 italic tracking-tighter">Vision 2024</p>
                     <p className="text-[10px] font-black text-accent-500 uppercase tracking-widest mt-1">Global Academic Impact</p>
                  </div>
               </div>
            </div>
         </div>
      </section>

    </div>
  );
};

export default ContactPage;
