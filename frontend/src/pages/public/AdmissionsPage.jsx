import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "../../api/axios";
import { toast } from "react-toastify";
import Button from "../../components/ui/Button";
import { 
  Sparkles, 
  BookOpen, 
  FileText, 
  CheckCircle, 
  ArrowRight, 
  Award, 
  Users, 
  Star,
  Search,
  Calendar,
  Phone,
  Mail,
  MapPin,
  ClipboardList,
  Trophy,
  ShieldCheck,
  Loader2,
  Zap
} from "lucide-react";
import { useSiteSettings } from "../../context/SiteSettingsContext";
import schoolImageDefault from "../../assets/school.png";

const AdmissionsPage = () => {
  const { settings, loading } = useSiteSettings();
  const [form, setForm] = useState({
    studentName: "",
    fatherName: "",
    motherName: "",
    dob: "",
    classApplied: "",
    phone: "",
    email: "",
    address: "",
    prevSchool: "",
  });

  const [photo, setPhoto] = useState(null);
  const [birthCertificate, setBirthCertificate] = useState(null);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const getImageUrl = (url, fallback) => {
    if (!url) return fallback;
    if (url.startsWith('http')) return url;
    const cleanPath = url.replace(/\\/g, '/');
    return `http://localhost:5005/${cleanPath}`;
  };

  const submitForm = async (e) => {
    e.preventDefault();

    const data = new FormData();
    Object.entries(form).forEach(([k, v]) => data.append(k, v));
    if (photo) data.append("photo", photo);
    if (birthCertificate) data.append("birthCertificate", birthCertificate);

    try {
      await axios.post("/admissions/submit", data, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success("Application Submitted Successfully.");
      setForm({
        studentName: "",
        fatherName: "",
        motherName: "",
        dob: "",
        classApplied: "",
        phone: "",
        email: "",
        address: "",
        prevSchool: "",
      });
      setPhoto(null);
      setBirthCertificate(null);
    } catch (error) {
      console.error("Submission error:", error);
      toast.error("An error occurred during submission.");
    }
  };

  if (loading || !settings) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white space-y-4">
        <Loader2 className="w-12 h-12 text-accent-500 animate-spin" />
        <p className="text-[10px] font-black uppercase tracking-[0.5em] text-gray-400">Restoring Admission Portal...</p>
      </div>
    );
  }

  const theme = settings.theme || { primaryColor: "#0a0a0a", accentColor: "#10b981" };
  const layout = settings.layout?.admissions || { showHero: true, showProcess: true, showChecklist: true, showForm: true, showSupport: true };

  const IconMap = { Search, FileText, Users, Trophy, BookOpen, ShieldCheck, ClipboardList, Star, Award, Sparkles, Phone, Mail, MapPin, CheckCircle, Zap };
  
  const defaultProcess = [
    { title: "Discovery", desc: "Connect with our admissions office.", icon: Search, color: "bg-blue-50 text-blue-600", gridSpan: "md:col-span-1 md:row-span-1", badge: "Inquiry" },
    { title: "Documentation", desc: "Complete the online application.", icon: FileText, color: "bg-accent-100 text-accent-700", gridSpan: "md:col-span-2 md:row-span-1", badge: "Document" },
    { title: "Interaction", desc: "A personalized evaluation session.", icon: Users, color: "bg-purple-100 text-purple-700", gridSpan: "md:col-span-2 md:row-span-1", badge: "Assessment" },
    { title: "Enrollment", desc: "Secure your admission.", icon: Trophy, color: "bg-orange-100 text-orange-700", gridSpan: "md:col-span-1 md:row-span-1", badge: "Enrollment" },
  ];

  const bentoProcess = (settings.admissions?.process?.steps || []).length > 0
    ? settings.admissions.process.steps.map((s, i) => ({
        ...s,
        icon: IconMap[s.icon] || Star,
        color: i % 4 === 0 ? "bg-blue-50 text-blue-600" : i % 4 === 1 ? "bg-accent-100 text-accent-700" : i % 4 === 2 ? "bg-purple-100 text-purple-700" : "bg-orange-100 text-orange-700",
        gridSpan: i === 1 || i === 2 ? "md:col-span-2 md:row-span-1" : "md:col-span-1 md:row-span-1",
        badge: s.badge || "Step"
      }))
    : defaultProcess;

  return (
    <div className="min-h-screen bg-neutral-bg-subtle text-gray-900 font-body overflow-x-hidden" style={{ "--primary": theme.primaryColor, "--accent": theme.accentColor }}>

      {/* --- HERO SECTION --- */}
      {layout.showHero && (
        <section className="relative min-h-[90vh] flex flex-col items-center justify-center pt-32 pb-16 px-6 overflow-hidden">
            <div className="absolute inset-0 -z-10 bg-white">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[800px]" style={{ background: `linear-gradient(to bottom, ${theme.accentColor}10, transparent)` }}></div>
                <div className="absolute -top-24 -left-24 w-[600px] h-[600px] rounded-full blur-[120px] pulse-slow" style={{ backgroundColor: `${theme.primaryColor}05` }}></div>
                <div className="absolute top-1/2 -right-24 w-[600px] h-[600px] rounded-full blur-[120px] pulse-slow delay-700" style={{ backgroundColor: `${theme.accentColor}08` }}></div>
            </div>

            <div className="max-w-4xl mx-auto text-center space-y-10 relative z-10 animate-fade-up">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-black uppercase tracking-[0.3em] border shadow-accent-glow" style={{ backgroundColor: `${theme.accentColor}15`, color: theme.accentColor, borderColor: `${theme.accentColor}30` }}>
                <Sparkles size={14} className="animate-pulse" />
                <span>{settings.home?.hero?.badge || "Admissions Open"}</span>
            </div>

            <h1 className="text-6xl md:text-8xl xl:text-9xl font-black tracking-tighter leading-[0.8]" style={{ color: theme.primaryColor }}>
                {settings.admissions?.hero?.title || "Shape Their Excellence."}
            </h1>

            <p className="text-xl md:text-2xl text-gray-500 max-w-2xl mx-auto leading-relaxed font-medium">
                {settings.admissions?.hero?.subtitle || "Bridge the gap between potential and excellence. Admissions are now open."}
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-6 justify-center pt-6">
                <Button 
                    onClick={() => document.getElementById('application-portal').scrollIntoView({ behavior: 'smooth' })}
                    className="w-full sm:w-auto px-12 py-5 rounded-full text-white shadow-2xl flex items-center justify-center gap-3 group transition-all font-black uppercase tracking-widest text-xs"
                    style={{ backgroundColor: theme.primaryColor }}
                >
                    Start Application
                    <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </Button>
                <Link to="/contact" className="w-full sm:w-auto">
                    <Button variant="ghost" className="w-full px-12 py-5 rounded-full border-2 text-primary-950 hover:bg-primary-50" style={{ borderColor: `${theme.primaryColor}15` }}>
                    Contact Office
                    </Button>
                </Link>
            </div>
            </div>

            <div className="mt-20 relative w-full max-w-5xl mx-auto px-6 hidden md:block">
            <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full blur-3xl" style={{ backgroundColor: `${theme.accentColor}20` }}></div>
            <div className="relative rounded-[4rem] overflow-hidden shadow-3xl border-[20px] border-white ring-1 ring-gray-100 transform -rotate-1 hover:rotate-0 transition-all duration-1000">
                <img src={getImageUrl(settings.admissions?.hero?.image, schoolImageDefault)} alt="Admission Portal" className="w-full h-[400px] object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-primary-950/60 to-transparent"></div>
            </div>
            </div>
        </section>
      )}

      {/* --- BENTO PROCESS --- */}
      {layout.showProcess && (
        <section className="py-32 px-6 bg-white relative">
            <div className="max-w-7xl mx-auto flex flex-col items-center">
            <div className="text-center mb-20 space-y-4">
                <div className="inline-block px-4 py-1.5 text-[10px] font-black uppercase tracking-[0.3em] rounded-lg" style={{ backgroundColor: `${theme.accentColor}15`, color: theme.accentColor }}>
                    {settings.admissions?.process?.badge || "The Cycle"}
                </div>
                <h2 className="text-5xl md:text-7xl font-black text-primary-950 leading-tight" style={{ color: theme.primaryColor }}>
                    {settings.admissions?.process?.title || "Steps to Excellence."}
                </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 auto-rows-[300px]">
                {bentoProcess.map((step, i) => {
                const Icon = step.icon;
                return (
                    <div 
                    key={i} 
                    className={`${step.gridSpan} group p-10 rounded-[3.5rem] bg-neutral-bg-subtle border border-gray-100 hover:bg-white hover:shadow-accent-glow hover:border-accent-200 transition-all duration-700 flex flex-col justify-between overflow-hidden relative animate-fade-up`}
                    style={{ animationDelay: `${i * 150}ms` }}
                    >
                    <div className="relative z-10 flex flex-col h-full gap-6">
                        <div className="flex items-center justify-between">
                        <div className="w-16 h-16 rounded-2xl flex items-center justify-center group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 shadow-sm" style={{ backgroundColor: `${theme.accentColor}10`, color: theme.accentColor }}>
                            <Icon size={32} />
                        </div>
                        <span className="text-[10px] uppercase font-black tracking-widest opacity-30">
                            {step.badge}
                        </span>
                        </div>
                        
                        <div>
                        <h3 className="text-3xl font-black text-primary-950 mb-4 group-hover:text-accent-600 transition-colors" style={{ color: theme.primaryColor }}>
                            {step.title}
                        </h3>
                        <p className="text-gray-500 leading-relaxed font-medium text-base">
                            {step.desc}
                        </p>
                        </div>
                    </div>
                    </div>
                );
                })}
            </div>
            </div>
        </section>
      )}

      {/* --- CHECKLIST --- */}
      {layout.showChecklist && (
        <section className="py-32 px-6 relative overflow-hidden" style={{ backgroundColor: theme.primaryColor }}>
            <div className="absolute top-0 right-0 w-96 h-96 bg-accent-500/20 rounded-full blur-[100px] -z-0" style={{ backgroundColor: `${theme.accentColor}20` }}></div>
            
            <div className="max-w-7xl mx-auto relative z-10">
            <div className="text-center mb-20">
                <h2 className="text-5xl md:text-6xl font-black text-white leading-tight">
                    {settings.admissions?.checklist?.title || "Essentials for Application."}
                </h2>
                <p className="text-accent-100/40 text-sm font-black uppercase tracking-[0.4em] mt-4">{settings.admissions?.checklist?.subtitle || "Required Documents Checklist"}</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {(settings.admissions?.checklist?.items || [
                { title: "Birth Certificate", desc: "Digital copy.", icon: "ClipboardList" },
                { title: "Identity Records", desc: "Aadhar card.", icon: "ShieldCheck" },
                { title: "Academic History", desc: "Previous report cards.", icon: "BookOpen" },
                ]).map((card, i) => {
                const Icon = IconMap[card.icon] || ClipboardList;
                return (
                <div key={i} className="group p-8 rounded-[3rem] bg-white/5 border border-white/10 hover:bg-white/10 transition-all duration-500 flex flex-col gap-6 animate-fade-up" style={{ animationDelay: `${i * 100}ms` }}>
                    <div className="w-14 h-14 rounded-2xl flex items-center justify-center group-hover:rotate-[360deg] transition-transform duration-1000" style={{ backgroundColor: theme.accentColor, color: "#fff" }}>
                        <Icon size={24} />
                    </div>
                    <div>
                        <h4 className="text-xl font-bold text-white mb-2">{card.title}</h4>
                        <p className="text-white/40 text-sm font-medium leading-relaxed">{card.desc}</p>
                    </div>
                </div>
                )})}
            </div>
            </div>
        </section>
      )}

      {/* --- ENROLLMENT FORM --- */}
      {layout.showForm && (
        <section id="application-portal" className="py-40 px-6 bg-neutral-bg-subtle relative">
            <div className="max-w-5xl mx-auto relative z-10">
            <div className="text-center mb-20 space-y-6">
                <h2 className="text-5xl md:text-8xl font-black text-primary-950 tracking-tighter leading-none" style={{ color: theme.primaryColor }}>
                    Start the <br /> <span style={{ color: theme.accentColor }}>Journey.</span>
                </h2>
                <div className="w-24 h-2 mx-auto rounded-full" style={{ backgroundColor: theme.accentColor }}></div>
            </div>

            <div className="relative group animate-fade-up">
                <div className="absolute -inset-1 rounded-[5rem] blur opacity-20 group-hover:opacity-40 transition duration-1000" style={{ background: `linear-gradient(to r, ${theme.accentColor}, ${theme.primaryColor})` }}></div>
                
                <div className="relative bg-white/70 backdrop-blur-3xl p-10 md:p-20 rounded-[4.5rem] shadow-4xl border border-white/50">
                    
                    <form onSubmit={submitForm} className="grid grid-cols-1 md:grid-cols-2 gap-10">
                        <div className="col-span-full border-b border-gray-100 pb-8 mb-4">
                        <h3 className="text-2xl font-black text-primary-950">Candidate Information</h3>
                        </div>

                        {[
                        { name: "studentName", label: "Full Name of Student", icon: Users },
                        { name: "fatherName", label: "Father Name", icon: Users },
                        { name: "motherName", label: "Mother Name", icon: Users },
                        { name: "dob", label: "Date of Birth", type: "date", icon: Calendar },
                        { name: "classApplied", label: "Desired Class", icon: Award },
                        { name: "phone", label: "Primary Phone", icon: Phone },
                        { name: "email", label: "Active Email", icon: Mail },
                        { name: "prevSchool", label: "Institutional History", icon: BookOpen },
                        ].map((field, i) => (
                        <div key={i} className="space-y-3 group">
                            <label className="text-[10px] font-black uppercase tracking-[0.3em] text-primary-950/40 ml-1 group-focus-within:text-accent-500 transition-colors" style={{ color: "rgba(0,0,0,0.4)" }}>
                            {field.label}
                            </label>
                            <div className="relative">
                            <div className="absolute left-0 top-1/2 -translate-y-1/2 text-primary-950/20 group-focus-within:text-accent-500 transition-colors">
                                <field.icon size={20} className="ml-5" />
                            </div>
                            <input
                                type={field.type || "text"}
                                name={field.name}
                                value={form[field.name]}
                                placeholder={`Enter ${field.label.toLowerCase()}`}
                                onChange={handleChange}
                                required={field.name !== "email" && field.name !== "prevSchool"}
                                className="w-full pl-16 pr-6 py-5 rounded-3xl bg-white border border-transparent focus:border-accent-400 focus:ring-4 focus:ring-accent-400/5 outline-none transition-all font-bold text-primary-950 shadow-sm"
                                style={{ borderColor: "rgba(0,0,0,0.05)" }}
                            />
                            </div>
                        </div>
                        ))}

                        <div className="col-span-full space-y-3 pt-16">
                        <Button type="submit" className="w-full py-7 rounded-[2.5rem] text-white shadow-2xl transition-all duration-500 font-black uppercase tracking-[0.4em] text-sm flex items-center justify-center gap-4 relative overflow-hidden group" style={{ backgroundColor: theme.accentColor }}>
                            <span className="relative">Submit Final Portfolio</span>
                            <ArrowRight size={24} className="relative group-hover:translate-x-2 transition-transform" />
                        </Button>
                        </div>
                    </form>
                </div>
            </div>
            </div>
        </section>
      )}

      {/* --- SUPPORT --- */}
      {layout.showSupport && (
        <section className="py-40 px-6">
            <div className="max-w-7xl mx-auto">
            <div className="relative rounded-[5rem] bg-white p-16 md:p-32 overflow-hidden shadow-accent-glow text-center border border-gray-100 flex flex-col items-center">
                <div className="absolute -top-20 -left-20 w-80 h-80 rounded-full blur-[100px]" style={{ backgroundColor: `${theme.accentColor}10` }}></div>
                
                <div className="relative z-10 space-y-10">
                    <div className="inline-flex items-center gap-3 px-6 py-2 rounded-full text-white text-[10px] font-black uppercase tracking-[0.4em]" style={{ backgroundColor: theme.primaryColor }}>
                        <Phone size={14} style={{ color: theme.accentColor }} />
                        Admissions Support
                    </div>
                    <h2 className="text-5xl md:text-8xl font-black text-primary-950 tracking-tighter leading-none" style={{ color: theme.primaryColor }}>
                    Need <br />  <span style={{ color: theme.accentColor }}>Clarification?</span>
                    </h2>
                    <p className="text-xl text-gray-500 max-w-xl mx-auto font-medium">
                    Our councilors are available to guide you through the process.
                    </p>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-8 pt-6">
                        <a href={`tel:${settings.global?.phone || "+91 98765 43210"}`} className="text-center group">
                            <p className="text-3xl font-black text-primary-950 group-hover:text-accent-500 transition-colors" style={{ color: theme.primaryColor }}>{settings.global?.phone || "+91 98765 43210"}</p>
                        </a>
                        <div className="h-10 w-[2px] bg-gray-100 hidden sm:block"></div>
                        <a href={`mailto:${settings.global?.email || "admissions@institution.edu"}`} className="text-center group">
                            <p className="text-3xl font-black text-primary-950 group-hover:text-accent-500 transition-colors" style={{ color: theme.primaryColor }}>{settings.global?.email || "admissions@institution.edu"}</p>
                        </a>
                    </div>
                </div>
            </div>
            </div>
        </section>
      )}

    </div>
  );
};

export default AdmissionsPage;
