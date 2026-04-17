import React from "react";
import { Link } from "react-router-dom";
import { 
  Shield, 
  Star, 
  Zap, 
  Compass, 
  Target, 
  BookOpen, 
  Award, 
  ArrowRight,
  Sparkles,
  Quote,
  CheckCircle,
  TrendingUp,
  Globe,
  Loader2
} from "lucide-react";
import { useSiteSettings } from "../../context/SiteSettingsContext";
import principalImageDefault from "../../assets/principal.png";

const ValueCard = ({ icon: Icon, title, desc, delay }) => (
  <div 
    className="group p-8 bg-white border border-gray-100 rounded-[2rem] shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-500 flex flex-col gap-5 animate-fade-up relative overflow-hidden"
    style={{ animationDelay: `${delay}ms` }}
  >
    <div className="absolute top-0 right-0 w-24 h-24 bg-accent-50/50 rounded-bl-[3rem] -z-10 group-hover:scale-110 transition-transform"></div>
    <div className="w-12 h-12 rounded-xl bg-accent-50 text-accent-600 flex items-center justify-center group-hover:bg-accent-500 group-hover:text-white transition-all duration-500">
      <Icon size={24} />
    </div>
    <div className="space-y-2">
      <h3 className="text-xl font-bold text-primary-950 uppercase tracking-tight">{title}</h3>
      <p className="text-gray-500 text-sm leading-relaxed font-medium">{desc}</p>
    </div>
  </div>
);

const AboutPage = () => {
    const { settings, loading } = useSiteSettings();

    const getImageUrl = (url, fallback) => {
        if (!url) return fallback;
        if (url.startsWith('http')) return url;
        const cleanPath = url.replace(/\\/g, '/');
        return `http://localhost:5005/${cleanPath}`;
    };

    if (loading || !settings) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-white space-y-4">
                <Loader2 className="w-12 h-12 text-accent-500 animate-spin" />
                <p className="text-[10px] font-black uppercase tracking-[0.5em] text-gray-400">Restoring Institutional Voice...</p>
            </div>
        );
    }

    const IconMap = { Shield, Award, BookOpen, Star, Zap, Compass, CheckCircle, Target, Sparkles, Globe, TrendingUp };
    
    const defaultValues = [
        { icon: Shield, title: "Integrity", desc: "Honesty and moral principles are the foundation of everything we do.", delay: 0 },
        { icon: Zap, title: "Passion", desc: "Igniting a lifelong love for learning in every student's heart.", delay: 100 },
        { icon: Star, title: "Excellence", desc: "Striving for the highest standards in academics and sports.", delay: 200 },
        { icon: Compass, title: "Empathy", desc: "Understanding and respecting ourselves and the global community.", delay: 300 }
    ];

    const values = (settings.about?.values || []).length > 0
        ? settings.about.values.map((v, i) => ({
            ...v,
            icon: IconMap[v.icon] || defaultValues[i % defaultValues.length].icon,
            delay: i * 100
        }))
        : defaultValues;

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-gray-900 overflow-x-hidden pt-20 font-body">
      
      {/* ------------------------------------------------------------------ */}
      {/*                        BALANCED HERO                              */}
      {/* ------------------------------------------------------------------ */}
      <section className="relative py-24 px-6 overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-accent-50/50 rounded-full blur-[120px] -z-10"></div>
        <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-blue-50/50 rounded-full blur-[100px] -z-10"></div>

        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-8 animate-fade-right">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent-50 text-accent-700 text-[10px] font-black uppercase tracking-[0.2em] border border-accent-100 shadow-sm">
              <Sparkles size={14} />
              <span>{settings.about?.hero?.badge || "Excellence Redefined Since 2004"}</span>
            </div>

            <h1 className="text-5xl md:text-7xl font-black text-primary-950 leading-[1.1] tracking-tighter">
              {settings.about?.hero?.title?.includes("Empowering")
                ? <>
                    {settings.about.hero.title.split("Empowering")[0]}
                    <span className="text-accent-500 underline decoration-accent-200 decoration-4 underline-offset-8">Empowering</span>
                    {settings.about.hero.title.split("Empowering")[1]}
                  </>
                : settings.about?.hero?.title || "Inspiring Minds, Empowering Futures."}
            </h1>

            <p className="text-lg text-gray-500 max-w-xl font-medium leading-relaxed">
              {settings.about?.hero?.subtitle || "SBS Badhwana stands at the intersection of traditional values and modern innovation, providing a nurturing environment where every child reaches their peak potential."}
            </p>

            <div className="flex flex-wrap gap-6 pt-4">
               {["Academic Rigor", "Character Building", "Global Outlook"].map(tag => (
                   <div key={tag} className="flex items-center gap-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-accent-500"></div>
                      <span className="text-xs font-bold text-primary-950 uppercase tracking-widest">{tag}</span>
                   </div>
               ))}
            </div>
          </div>

          <div className="relative animate-fade-left hidden lg:block">
             <div className="absolute -inset-4 border border-gray-100 rounded-[3rem] -rotate-3"></div>
             <div className="bg-white p-12 rounded-[2.5rem] shadow-2xl border border-gray-50 relative z-10 space-y-8">
                <div className="grid grid-cols-2 gap-8">
                   <div className="space-y-2">
                      <TrendingUp size={32} className="text-accent-500" />
                      <p className="text-3xl font-black text-primary-950">20Y+</p>
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none">Proven Track Record</p>
                   </div>
                   <div className="space-y-2">
                      <Globe size={32} className="text-accent-500" />
                      <p className="text-3xl font-black text-primary-950">100%</p>
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none">Holistic Development</p>
                   </div>
                </div>
                <div className="p-6 bg-primary-950 rounded-2xl text-white space-y-4">
                   <Quote className="text-accent-500" />
                   <p className="text-lg font-bold italic opacity-90 leading-tight">"Where dreams get their wings to fly high."</p>
                </div>
             </div>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/*                        MAGAZINE STORY SECTION                     */}
      {/* ------------------------------------------------------------------ */}
      <section className="py-32 px-6 bg-white border-y border-gray-50">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-16">
          <div className="lg:col-span-5 space-y-8">
            <div className="space-y-4">
               <h2 className="text-xs font-black uppercase tracking-[0.4em] text-accent-500">{settings.about?.heritage?.badge || "Our Heritage"}</h2>
               <h3 className="text-4xl md:text-5xl font-black text-primary-950 tracking-tighter leading-none">
                 {settings.about?.heritage?.title || "A Legacy of Heart & Mind."}
               </h3>
            </div>
            <div className="space-y-6 text-gray-500 font-medium leading-[1.8]">
               <div dangerouslySetInnerHTML={{ __html: settings.about?.heritage?.story || "<p>Established in 2004, SBS Badhwana began as a vision to bring world-class education to the heart of Badhwana. What started as a small cohort has blossomed into a community of over 5,000 successful alumni.</p><p>Our philosophy is simple: we don't just teach for tests, we teach for life. We believe in nurturing the 'Whole Child'—intellectual, social, emotional, and physical.</p>" }} />
            </div>
            <div className="pt-6">
               <Link to="/gallery" className="flex items-center gap-3 text-accent-600 font-black text-[10px] uppercase tracking-[0.3em] group w-fit">
                  <span>Explore History</span>
                  <ArrowRight size={14} className="group-hover:translate-x-2 transition-transform" />
               </Link>
            </div>
          </div>

          <div className="lg:col-span-7 grid grid-cols-1 md:grid-cols-2 gap-8">
             <div className="bg-neutral-bg-subtle p-8 rounded-3xl space-y-6 self-start transform md:translate-y-12">
                <div className="w-10 h-10 rounded-full bg-accent-500 text-white flex items-center justify-center font-black">01</div>
                <h4 className="text-xl font-black text-primary-950 text-uppercase tracking-tight underline decoration-accent-200 decoration-2 underline-offset-4">{settings.about?.mission?.title || "The Mission"}</h4>
                <p className="text-gray-500 text-sm leading-relaxed font-medium capitalize">
                  {settings.about?.mission?.content || "To provide an inclusive, stimulating environment that fosters curiosity and academic excellence."}
                </p>
             </div>
             <div className="bg-primary-950 p-8 rounded-3xl space-y-6 text-white self-center">
                <div className="w-10 h-10 rounded-full bg-accent-500 text-white flex items-center justify-center font-black">02</div>
                <h4 className="text-xl font-black text-accent-400 text-uppercase tracking-tight underline decoration-white/10 decoration-2 underline-offset-4">{settings.about?.vision?.title || "The Vision"}</h4>
                <p className="text-white/70 text-sm leading-relaxed font-medium capitalize">
                  {settings.about?.vision?.content || "To be a global leader in transformative education, shaping character and competence."}
                </p>
             </div>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/*                        REFINED BENTO GRID                         */}
      {/* ------------------------------------------------------------------ */}
      <section className="py-32 px-6 max-w-7xl mx-auto">
        <div className="flex flex-col items-center text-center space-y-4 mb-20 animate-reveal">
          <div className="h-1 w-20 bg-accent-500"></div>
          <h2 className="text-4xl md:text-5xl font-black text-primary-950 tracking-tighter leading-none uppercase">
            Core <span className="text-accent-500 italic lowercase tracking-tight">Philosophy.</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {values.map((val, i) => (
            <ValueCard 
              key={i}
              icon={val.icon} 
              title={val.title} 
              desc={val.desc} 
              delay={val.delay}
            />
          ))}
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/*                       ELEGANT LEADERSHIP                          */}
      {/* ------------------------------------------------------------------ */}
      <section className="py-32 px-6 bg-white">
        <div className="max-w-5xl mx-auto text-center space-y-12">
          <div className="space-y-4">
             <h2 className="text-xs font-black uppercase tracking-[0.4em] text-accent-500">Word from the Principal</h2>
             <div className="relative inline-block group">
                <div className="absolute inset-0 bg-accent-500 rounded-full blur-[40px] opacity-20 scale-150 -z-10 group-hover:scale-110 transition-transform"></div>
                <img 
                  src={getImageUrl(settings.home?.principal?.image, principalImageDefault)} 
                  alt="Principal" 
                  className="w-48 h-48 md:w-64 md:h-64 object-cover object-top rounded-full border-8 border-white shadow-2xl transition-all duration-700 mx-auto grayscale group-hover:grayscale-0" 
                />
             </div>
          </div>

          <div className="space-y-8">
             <Quote size={48} className="text-accent-200 mx-auto opacity-50" />
             <p className="text-2xl md:text-3xl font-black text-primary-950 leading-tight tracking-tight italic">
               "{settings.home?.principal?.quote || "Education is the most powerful weapon which you can use to change the world. At SBS, we are sharpening that weapon with love, discipline, and wisdom."}"
             </p>
             <div className="space-y-1 pt-6 border-t border-gray-100 max-w-[200px] mx-auto">
                <p className="text-xl font-black text-primary-950">{settings.home?.principal?.name || "Sanjay Sharma"}</p>
                <p className="uppercase tracking-[0.3em] text-[10px] font-black text-accent-500">{settings.home?.principal?.designation || "Principal & Founder"}</p>
             </div>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/*                          COMPACT CTA                              */}
      {/* ------------------------------------------------------------------ */}
      <section className="py-32 px-6">
        <div className="max-w-7xl mx-auto bg-primary-950 rounded-[3rem] p-12 md:p-20 text-center space-y-10 relative overflow-hidden group">
           <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-accent-500/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2"></div>
           
           <div className="max-w-2xl mx-auto space-y-6">
              <h2 className="text-4xl md:text-6xl font-black text-white tracking-tighter leading-none">
                Begin Your Journey With <span className="text-accent-500">{settings.schoolName?.substring(0, 3) || "SBS"}.</span>
              </h2>
              <p className="text-white/60 text-lg font-medium leading-relaxed">
                {settings.about?.cta?.subtitle || "Admissions are now open. Secure your child's future today with a modern, values-driven education."}
              </p>
           </div>
           
           <div className="pt-6">
              <Link to="/admissions">
                <button className="px-10 py-5 bg-accent-500 text-white rounded-full font-black uppercase tracking-widest text-xs hover:bg-white hover:text-primary-950 hover:-translate-y-1 transition-all shadow-xl shadow-black/20">
                   Apply for Admission
                </button>
              </Link>
           </div>
        </div>
      </section>

    </div>
  );
};

export default AboutPage;
