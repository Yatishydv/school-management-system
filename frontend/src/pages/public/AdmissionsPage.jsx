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
      toast.success("Identity Portfolio Received. Our council will review it shortly.");
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
      toast.error("Transmission Interrupted. Please check connectivity.");
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

  const IconMap = { Search, FileText, Users, Trophy, BookOpen, ShieldCheck, ClipboardList, Star, Award, Sparkles, Phone, Mail, MapPin, CheckCircle, Zap };
  
  const defaultProcess = [
    { 
      title: "Discovery", 
      desc: "Connect with our admissions office to understand our unique vision.", 
      icon: Search,
      color: "bg-blue-50 text-blue-600",
      gridSpan: "md:col-span-1 md:row-span-1",
      badge: "Inquiry"
    },
    { 
      title: "Digital Dossier", 
      desc: "Complete the online application and upload all essential identity and academic records through our portal.", 
      icon: FileText,
      color: "bg-accent-100 text-accent-700",
      gridSpan: "md:col-span-2 md:row-span-1",
      badge: "Document"
    },
    { 
      title: "Interaction", 
      desc: "A personalized evaluation session with our elite faculty to identify potential.", 
      icon: Users,
      color: "bg-purple-100 text-purple-700",
      gridSpan: "md:col-span-2 md:row-span-1",
      badge: "Assessment"
    },
    { 
      title: "Victory", 
      desc: "Secure your legacy.", 
      icon: Trophy,
      color: "bg-orange-100 text-orange-700",
      gridSpan: "md:col-span-1 md:row-span-1",
      badge: "Enrollment"
    },
  ];

  const bentoProcess = (settings.admissions?.process?.steps || []).length > 0
    ? settings.admissions.process.steps.map((s, i) => ({
        ...s,
        icon: IconMap[s.icon] || defaultProcess[i % defaultProcess.length].icon,
        color: defaultProcess[i % defaultProcess.length].color,
        gridSpan: defaultProcess[i % defaultProcess.length].gridSpan,
        badge: s.badge || defaultProcess[i % defaultProcess.length].badge
      }))
    : defaultProcess;

  return (
    <div className="min-h-screen bg-neutral-bg-subtle text-gray-900 font-body overflow-x-hidden">

      {/* --- VIBRANT CENTERED HERO --- */}
      <section className="relative min-h-[90vh] flex flex-col items-center justify-center pt-32 pb-16 px-6 overflow-hidden">
        {/* Massive Blurs & Mesh Gradient (Vibrant) */}
        <div className="absolute inset-0 -z-10 bg-white">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[800px] bg-gradient-to-b from-accent-100/30 to-transparent"></div>
          <div className="absolute -top-24 -left-24 w-[600px] h-[600px] bg-blue-100/40 rounded-full blur-[120px] pulse-slow"></div>
          <div className="absolute top-1/2 -right-24 w-[600px] h-[600px] bg-accent-100/40 rounded-full blur-[120px] pulse-slow delay-700"></div>
          {/* Grid pattern overlay */}
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 brightness-100 contrast-150 pointer-events-none"></div>
        </div>

        <div className="max-w-4xl mx-auto text-center space-y-10 relative z-10 animate-fade-up">
           <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent-50 text-accent-700 text-xs font-black uppercase tracking-[0.3em] border border-accent-100 shadow-accent-glow">
              <Sparkles size={14} className="animate-pulse" />
              <span>{settings.admissions?.hero?.badge || "Session 2024-25 Open"}</span>
           </div>

           <h1 className="text-6xl md:text-8xl xl:text-9xl font-black tracking-tighter leading-[0.8] text-primary-950">
             {settings.admissions?.hero?.title?.includes("Elite") 
               ? <>
                   {settings.admissions.hero.title.split("Elite")[0]}
                   <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent-600 via-accent-500 to-accent-400">Elite</span>
                   {settings.admissions.hero.title.split("Elite")[1]}
                 </>
               : settings.admissions?.hero?.title || "Shape Their Elite Future."}
           </h1>

           <p className="text-xl md:text-2xl text-gray-500 max-w-2xl mx-auto leading-relaxed font-medium">
             {settings.admissions?.hero?.subtitle || "Bridge the gap between potential and excellence. Admissions are now open for visionary students."}
           </p>

           <div className="flex flex-col sm:flex-row items-center gap-6 justify-center pt-6">
              <Button 
                onClick={() => document.getElementById('application-portal').scrollIntoView({ behavior: 'smooth' })}
                className="w-full sm:w-auto px-12 py-5 rounded-full bg-primary-950 text-white hover:bg-black shadow-2xl shadow-primary-950/20 flex items-center justify-center gap-3 group transition-all font-black uppercase tracking-widest text-xs"
              >
                Start Application
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </Button>
              <Link to="/contact" className="w-full sm:w-auto">
                <Button variant="ghost" className="w-full px-12 py-5 rounded-full border-2 border-primary-950/10 text-primary-950 hover:bg-primary-50">
                  Contact Office
                </Button>
              </Link>
           </div>
        </div>

        {/* Floating Layered Card (Unique) */}
        <div className="mt-20 relative w-full max-w-5xl mx-auto px-6 hidden md:block">
           <div className="absolute -top-10 -right-10 w-40 h-40 bg-accent-500/10 rounded-full blur-3xl"></div>
           <div className="relative rounded-[4rem] overflow-hidden shadow-3xl border-[20px] border-white ring-1 ring-gray-100 transform -rotate-1 hover:rotate-0 transition-all duration-1000">
              <img src={getImageUrl(settings.admissions?.hero?.image, schoolImageDefault)} alt="Admission Portal" className="w-full h-[400px] object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-primary-950/60 to-transparent"></div>
              
              {/* Glass info tag */}
              <div className="absolute bottom-12 left-12 flex items-center gap-6 text-white">
                 <div className="p-6 bg-white/10 backdrop-blur-xl rounded-3xl border border-white/20">
                    <p className="text-4xl font-black">{settings.home?.stats?.[3]?.value || "15:1"}</p>
                    <p className="text-[10px] uppercase font-bold tracking-widest opacity-60">{settings.home?.stats?.[3]?.label || "Faculty Ratio"}</p>
                 </div>
                 <div className="space-y-1">
                    <h4 className="text-2xl font-black">Global Standards.</h4>
                    <p className="text-xs font-bold opacity-80">World-class education infrastructure.</p>
                 </div>
              </div>
           </div>
        </div>
      </section>

      {/* --- ASYMMETRIC BENTO PROCESS --- */}
      <section className="py-32 px-6 bg-white relative">
        <div className="max-w-7xl mx-auto flex flex-col items-center">
          <div className="text-center mb-20 space-y-4">
             <div className="inline-block px-4 py-1.5 bg-accent-100/50 text-accent-700 text-[10px] font-black uppercase tracking-[0.3em] rounded-lg">
                {settings.admissions?.process?.badge || "The Admission Cycle"}
             </div>
             <h2 className="text-5xl md:text-7xl font-black text-primary-950 leading-tight">
                {settings.admissions?.process?.title?.includes("Excellence")
                  ? <>
                      {settings.admissions.process.title.split("Excellence")[0]}
                      <span className="text-accent-500">Excellence</span>
                      {settings.admissions.process.title.split("Excellence")[1]}
                    </>
                  : settings.admissions?.process?.title || "Four Steps to Excellence."}
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
                      <div className={`w-16 h-16 rounded-2xl ${step.color} flex items-center justify-center group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 shadow-sm`}>
                        <Icon size={32} />
                      </div>
                      <span className="text-[10px] uppercase font-black tracking-widest opacity-30">
                        {step.badge}
                      </span>
                    </div>
                    
                    <div>
                      <h3 className="text-3xl font-black text-primary-950 mb-4 group-hover:text-accent-600 transition-colors">
                        {step.title}
                      </h3>
                      <p className="text-gray-500 leading-relaxed font-medium text-base">
                        {step.desc}
                      </p>
                    </div>
                  </div>
                  
                  {/* Decorative number watermark */}
                  <div className="absolute -bottom-10 -right-10 text-[15rem] font-black text-gray-200/50 select-none -z-0 leading-none pointer-events-none group-hover:text-accent-500/5">
                    0{i+1}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* --- PREMIUM DOCUMENT CARDS --- */}
      <section className="py-32 px-6 bg-primary-950 relative overflow-hidden">
        {/* Vibrant Decorations */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-accent-500/20 rounded-full blur-[100px] -z-0"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-500/10 rounded-full blur-[100px] -z-0"></div>
        
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-20">
             <h2 className="text-5xl md:text-6xl font-black text-white leading-tight">
               {settings.admissions?.checklist?.title?.includes("Application")
                 ? <>
                    {settings.admissions.checklist.title.split("Application")[0]}
                    <span className="text-accent-400">Application</span>
                    {settings.admissions.checklist.title.split("Application")[1]}
                   </>
                 : settings.admissions?.checklist?.title || "Essentials for Application."}
             </h2>
             <p className="text-accent-100/40 text-sm font-black uppercase tracking-[0.4em] mt-4">{settings.admissions?.checklist?.subtitle || "Required Documents Checklist"}</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {(settings.admissions?.checklist?.items || [
              { title: "Birth Certificate", desc: "Original digital copy or scanned physical.", icon: "ClipboardList" },
              { title: "Identity Records", desc: "Aadhar card of student and both parents.", icon: "ShieldCheck" },
              { title: "Academic History", desc: "Previous report cards and transfer certs.", icon: "BookOpen" },
              { title: "Contact Data", desc: "Valid email and active phone numbers.", icon: "Phone" },
              { title: "Portrait Photos", desc: "4 recent passport size color photographs.", icon: "Users" },
              { title: "Portal Access", desc: "Verified digital account on our platform.", icon: "Sparkles" },
            ]).map((card, i) => {
              const Icon = IconMap[card.icon] || ClipboardList;
              return (
              <div key={i} className="group p-8 rounded-[3rem] bg-white/5 border border-white/10 hover:bg-white/10 hover:border-accent-500/50 transition-all duration-500 flex flex-col gap-6 animate-fade-up" style={{ animationDelay: `${i * 100}ms` }}>
                 <div className="w-14 h-14 rounded-2xl bg-accent-500 text-white flex items-center justify-center group-hover:rotate-[360deg] transition-transform duration-1000">
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

      {/* --- GLASSMORPHISM ENROLLMENT FORM --- */}
      <section id="application-portal" className="py-40 px-6 bg-neutral-bg-subtle relative">
        <div className="max-w-5xl mx-auto relative z-10">
           {/* Center Header */}
           <div className="text-center mb-20 space-y-6">
              <h2 className="text-5xl md:text-8xl font-black text-primary-950 tracking-tighter leading-none">
                Start the <br /> <span className="text-accent-500">Journey.</span>
              </h2>
              <div className="w-24 h-2 bg-primary-950 mx-auto rounded-full"></div>
           </div>

           <div className="relative group animate-fade-up">
              {/* Outer Glow */}
              <div className="absolute -inset-1 bg-gradient-to-r from-accent-400 to-blue-400 rounded-[5rem] blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>
              
              <div className="relative bg-white/70 backdrop-blur-3xl p-10 md:p-20 rounded-[4.5rem] shadow-4xl border border-white/50">
                 
                 <form onSubmit={submitForm} className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    <div className="col-span-full border-b border-gray-100 pb-8 mb-4">
                       <h3 className="text-2xl font-black text-primary-950">Candidate Information</h3>
                       <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-2">Personal & Academic Details</p>
                    </div>

                    {[
                      { name: "studentName", label: "Full Name of Student", icon: Users },
                      { name: "fatherName", label: "Father Name / Guardian", icon: Users },
                      { name: "motherName", label: "Mother Name / Guardian", icon: Users },
                      { name: "dob", label: "Date of Birth", type: "date", icon: Calendar },
                      { name: "classApplied", label: "Desired Grade/Class", icon: Award },
                      { name: "phone", label: "Primary Phone", icon: Phone },
                      { name: "email", label: "Active Email", icon: Mail },
                      { name: "prevSchool", label: "Institutional Background", icon: BookOpen },
                    ].map((field, i) => (
                      <div key={i} className="space-y-3 group">
                        <label className="text-[10px] font-black uppercase tracking-[0.3em] text-primary-950/40 ml-1 group-focus-within:text-accent-500 transition-colors">
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
                            className="w-full pl-16 pr-6 py-5 rounded-3xl bg-white border border-transparent hover:border-accent-200 focus:border-accent-400 focus:ring-4 focus:ring-accent-400/5 outline-none transition-all font-bold text-primary-950 shadow-sm"
                          />
                        </div>
                      </div>
                    ))}

                    <div className="col-span-full space-y-3">
                      <label className="text-[10px] font-black uppercase tracking-[0.3em] text-primary-950/40 ml-1">Current Residence</label>
                      <textarea
                        name="address"
                        rows="3"
                        value={form.address}
                        placeholder="Complete residential address"
                        onChange={handleChange}
                        required
                        className="w-full px-8 py-6 rounded-[3rem] bg-white border border-transparent hover:border-accent-200 focus:border-accent-400 focus:ring-4 focus:ring-accent-400/5 outline-none transition-all font-bold text-primary-950 shadow-sm resize-none"
                      />
                    </div>

                    <div className="col-span-full grid grid-cols-1 md:grid-cols-2 gap-8 pt-6">
                       <div className="p-8 rounded-[3.5rem] bg-accent-50/50 border-2 border-dashed border-accent-200 hover:bg-accent-50 transition-all text-center">
                          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-accent-700 mb-4">Passport Portrait</p>
                          <input type="file" onChange={(e) => setPhoto(e.target.files[0])} className="w-full text-xs text-gray-500 file:mr-4 file:py-2 file:px-6 file:rounded-full file:border-0 file:bg-primary-950 file:text-white file:font-black file:uppercase file:tracking-widest cursor-pointer" />
                       </div>
                       <div className="p-8 rounded-[3.5rem] bg-blue-50/50 border-2 border-dashed border-blue-200 hover:bg-blue-50 transition-all text-center">
                          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-700 mb-4">Birth Record (PDF/IMG)</p>
                          <input type="file" onChange={(e) => setBirthCertificate(e.target.files[0])} className="w-full text-xs text-gray-500 file:mr-4 file:py-2 file:px-6 file:rounded-full file:border-0 file:bg-primary-950 file:text-white file:font-black file:uppercase file:tracking-widest cursor-pointer" />
                       </div>
                    </div>

                    <div className="col-span-full pt-16">
                      <Button type="submit" className="w-full py-7 rounded-[2.5rem] bg-accent-500 text-white hover:bg-accent-600 shadow-2xl shadow-accent-500/30 transition-all duration-500 font-black uppercase tracking-[0.4em] text-sm flex items-center justify-center gap-4 relative overflow-hidden group">
                        <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-shimmer"></div>
                        <span className="relative">Submit Final Portfolio</span>
                        <ArrowRight size={24} className="relative group-hover:translate-x-2 transition-transform" />
                      </Button>
                    </div>
                 </form>
              </div>
           </div>
        </div>

        {/* Decorative Watermark */}
        <div className="absolute -bottom-20 -left-20 text-[25rem] font-black text-primary-950/5 leading-none select-none pointer-events-none uppercase">
           {settings.schoolName?.substring(0,3) || "SBS"}
        </div>
      </section>

      {/* --- VIBRANT FINAL HELP --- */}
      <section className="py-40 px-6">
        <div className="max-w-7xl mx-auto">
           <div className="relative rounded-[5rem] bg-white p-16 md:p-32 overflow-hidden shadow-accent-glow text-center border border-gray-100 flex flex-col items-center">
              {/* Background blurs */}
              <div className="absolute -top-20 -left-20 w-80 h-80 bg-accent-100/30 rounded-full blur-[100px]"></div>
              <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-blue-100/30 rounded-full blur-[100px]"></div>

              <div className="relative z-10 space-y-10">
                 <div className="inline-flex items-center gap-3 px-6 py-2 rounded-full bg-primary-950 text-white text-[10px] font-black uppercase tracking-[0.4em]">
                    <Phone size={14} className="text-accent-400" />
                    Admissions Support
                 </div>
                 <h2 className="text-5xl md:text-8xl font-black text-primary-950 tracking-tighter leading-none">
                   Still Need <br />  <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent-600 to-accent-300">Clarification?</span>
                 </h2>
                 <p className="text-xl text-gray-500 max-w-xl mx-auto font-medium">
                   Our dedicated enrollment councilors are available from 8:00 AM to 4:00 PM to guide you.
                 </p>
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-8 pt-6">
                    <a href={`tel:${(settings.contact?.cards || []).find(c => c.title.toLowerCase().includes('phone'))?.details?.[0] || "+91 98765 43210"}`} className="text-center group cursor-pointer">
                       <p className="text-xs font-black uppercase tracking-[0.3em] text-primary-950 mb-2 opacity-40 group-hover:opacity-100 transition-opacity">Voice Support</p>
                       <p className="text-3xl font-black text-primary-950 group-hover:text-accent-500 transition-colors">{(settings.contact?.cards || []).find(c => c.title.toLowerCase().includes('phone'))?.details?.[0] || "+91 98765 43210"}</p>
                    </a>
                    <div className="h-10 w-[2px] bg-gray-100 hidden sm:block"></div>
                    <a href={`mailto:${(settings.contact?.cards || []).find(c => c.title.toLowerCase().includes('email'))?.details?.[0] || "admissions@sbsbadhwana.edu"}`} className="text-center group cursor-pointer">
                       <p className="text-xs font-black uppercase tracking-[0.3em] text-primary-950 mb-2 opacity-40 group-hover:opacity-100 transition-opacity">Email Portal</p>
                       <p className="text-3xl font-black text-primary-950 group-hover:text-accent-500 transition-colors">{(settings.contact?.cards || []).find(c => c.title.toLowerCase().includes('email'))?.details?.[0] || "admissions@sbsbadhwana.edu"}</p>
                    </a>
                 </div>
              </div>
           </div>
        </div>
      </section>

    </div>
  );
};

export default AdmissionsPage;
