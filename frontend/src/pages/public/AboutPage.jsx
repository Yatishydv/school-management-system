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
  Loader2,
  Trophy,
  History,
  ShieldCheck
} from "lucide-react";
import { useSiteSettings } from "../../context/SiteSettingsContext";
import principalImageDefault from "../../assets/principal.png";
import InlineEdit from "../../components/ui/InlineEdit";
import EditableRegion from "../../components/ui/EditableRegion";

const DynamicIcon = ({ name, size = 24, className = "", ...props }) => {
  const IconMap = { 
    Shield, Star, Zap, Compass, Target, BookOpen, Award, Sparkles, Quote, 
    CheckCircle, TrendingUp, Globe, Loader2, Trophy, History, ShieldCheck
  };
  const Icon = IconMap[name] || Star;
  return <Icon size={size} className={className} {...props} />;
};

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

    const theme = settings.theme || { primaryColor: "#0a0a0a", accentColor: "#10b981" };
    const layout = settings.layout?.about || { showHero: true, showHeritage: true, showValues: true, showPrincipal: true, showCta: true };

    const IconMap = { Shield, Award, BookOpen, Star, Zap, Compass, CheckCircle, Target, Sparkles, Globe, TrendingUp, Trophy, History, ShieldCheck };
    
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
    <div className="min-h-screen bg-[#FAFAFA] text-gray-900 overflow-x-hidden pt-20 font-body" style={{ "--primary": theme.primaryColor, "--accent": theme.accentColor }}>
      
      {/* ------------------------------------------------------------------ */}
      {/*                        BALANCED HERO                              */}
      {/* ------------------------------------------------------------------ */}
      {layout.showHero && (
        <section className="relative py-24 px-6 overflow-hidden">
            <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full blur-[120px] -z-10" style={{ backgroundColor: `${theme.accentColor}15` }}></div>
            <div className="absolute bottom-0 left-0 w-[300px] h-[300px] rounded-full blur-[100px] -z-10" style={{ backgroundColor: `${theme.primaryColor}10` }}></div>

            <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8 animate-fade-right">
                <EditableRegion type="badge" path="about.hero.badge" label="Hero Badge">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.2em] border shadow-sm" style={{ backgroundColor: `${settings.about?.hero?.badge?.color || theme.accentColor}10`, color: settings.about?.hero?.badge?.color || theme.accentColor, borderColor: `${settings.about?.hero?.badge?.color || theme.accentColor}30` }}>
                        {settings.about?.hero?.badge?.icon ? (
                            <DynamicIcon name={settings.about.hero.badge.icon} size={14} />
                        ) : (
                            <Sparkles size={14} />
                        )}
                        <span>
                            {typeof settings.about?.hero?.badge === 'string' 
                                ? settings.about.hero.badge 
                                : (settings.about?.hero?.badge?.text || "Our Story")}
                        </span>
                    </div>
                </EditableRegion>

                <h1 className="text-5xl md:text-7xl font-black text-primary-950 leading-[1.1] tracking-tighter" style={{ color: theme.primaryColor }}>
                    <InlineEdit path="about.hero.title" text={settings.about?.hero?.title || "Inspiring Minds, Empowering Futures."} label="Hero Title" />
                </h1>

                <p className="text-lg text-gray-500 max-w-xl font-medium leading-relaxed">
                    <InlineEdit path="about.hero.subtitle" text={settings.about?.hero?.subtitle || "We provide a nurturing environment where every child reaches their peak potential through balanced education."} label="Hero Subtitle" />
                </p>

                <div className="flex flex-wrap gap-6 pt-4">
                <EditableRegion type="list" path="about.hero.points" label="Key Highlights">
                    <div className="flex flex-wrap gap-6">
                        {(settings.about?.hero?.points || ["Academic Rigor", "Character Building", "Global Outlook"]).map(tag => (
                            <div key={tag} className="flex items-center gap-3">
                                <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: theme.accentColor }}></div>
                                <span className="text-xs font-bold text-primary-950 uppercase tracking-widest">{tag}</span>
                            </div>
                        ))}
                    </div>
                </EditableRegion>
                </div>
            </div>

            <div className="relative animate-fade-left hidden lg:block">
                <div className="absolute -inset-4 border border-gray-100 rounded-[3rem] -rotate-3"></div>
                <div className="bg-white p-12 rounded-[2.5rem] shadow-2xl border border-gray-50 relative z-10 space-y-8">
                    <EditableRegion type="stats" path="global.aboutStats" label="Institutional Stats">
                        <div className="grid grid-cols-2 gap-8">
                            {(settings.global?.aboutStats || []).map((stat, i) => {
                                const Icon = IconMap[stat.icon] || (i === 0 ? TrendingUp : Globe);
                                return (
                                    <div key={i} className="space-y-2">
                                        <Icon size={32} style={{ color: theme.accentColor }} />
                                        <p className="text-3xl font-black text-primary-950">{stat.value}</p>
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none">{stat.label}</p>
                                    </div>
                                );
                            })}
                        </div>
                    </EditableRegion>
                    <EditableRegion type="text" path="global.visionQuote" label="Vision Quote">
                        <div className="p-6 rounded-2xl text-white space-y-4" style={{ backgroundColor: theme.primaryColor }}>
                            <Quote style={{ color: theme.accentColor }} />
                            <p className="text-lg font-bold italic opacity-90 leading-tight">"{settings.global?.visionQuote || "Shaping character and competence."}"</p>
                        </div>
                    </EditableRegion>
                </div>
            </div>
            </div>
        </section>
      )}

      {/* ------------------------------------------------------------------ */}
      {/*                        MAGAZINE STORY SECTION                     */}
      {/* ------------------------------------------------------------------ */}
      {layout.showHeritage && (
        <section className="py-32 px-6 bg-white border-y border-gray-50">
            <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-16">
            <div className="lg:col-span-5 space-y-8">
                <div className="space-y-4">
                <EditableRegion type="badge" path="about.heritage.badge" label="Heritage Badge">
                    <div className="inline-flex items-center gap-2 mb-2">
                        {settings.about?.heritage?.badge?.icon ? (
                            <DynamicIcon name={settings.about.heritage.badge.icon} size={14} className="opacity-80" style={{ color: settings.about?.heritage?.badge?.color || theme.accentColor }} />
                        ) : (
                            <History size={14} className="opacity-80" style={{ color: settings.about?.heritage?.badge?.color || theme.accentColor }} />
                        )}
                        <h2 className="text-xs font-black uppercase tracking-[0.4em]" style={{ color: settings.about?.heritage?.badge?.color || theme.accentColor }}>
                            {typeof settings.about?.heritage?.badge === 'string'
                                ? settings.about.heritage.badge
                                : (settings.about?.heritage?.badge?.text || "Our Heritage")}
                        </h2>
                    </div>
                </EditableRegion>
                <h3 className="text-4xl md:text-5xl font-black text-primary-950 tracking-tighter leading-none" style={{ color: theme.primaryColor }}>
                    <InlineEdit path="about.heritage.title" text={settings.about?.heritage?.title || "A Legacy of Heart & Mind."} label="Heritage Title" />
                </h3>
                </div>
                <div className="space-y-6 text-gray-500 font-medium leading-[1.8]">
                    <InlineEdit path="about.heritage.story" text={settings.about?.heritage?.story || "Our institution began as a vision..."} label="Heritage Story" as="div" />
                </div>
            </div>

            <div className="lg:col-span-7 grid grid-cols-1 md:grid-cols-2 gap-8">
                <EditableRegion type="text" path="about.mission" label="Institutional Mission" className="bg-neutral-bg-subtle p-8 rounded-3xl space-y-6 self-start transform md:translate-y-12 shadow-sm hover:shadow-md transition-shadow">
                    <div className="w-10 h-10 rounded-full text-white flex items-center justify-center font-black" style={{ backgroundColor: theme.accentColor }}>01</div>
                    <div className="space-y-4">
                        <h4 className="text-xl font-black text-primary-950 uppercase tracking-tight underline decoration-2 underline-offset-4" style={{ textDecorationColor: `${theme.accentColor}40` }}>
                            {settings.about?.mission?.title || "The Mission"}
                        </h4>
                        <p className="text-gray-500 text-sm leading-relaxed font-medium">
                            {settings.about?.mission?.content || "To provide an inclusive, stimulating environment that fosters curiosity and academic excellence."}
                        </p>
                    </div>
                </EditableRegion>
                <EditableRegion type="text" path="about.vision" label="Institutional Vision" className="p-8 rounded-3xl space-y-6 text-white self-center shadow-xl hover:shadow-2xl transition-all" style={{ backgroundColor: theme.primaryColor }}>
                    <div className="w-10 h-10 rounded-full text-white flex items-center justify-center font-black" style={{ backgroundColor: theme.accentColor }}>02</div>
                    <div className="space-y-4">
                        <h4 className="text-xl font-black uppercase tracking-tight underline decoration-2 underline-offset-4" style={{ color: theme.accentColor, textDecorationColor: "rgba(255,255,255,0.1)" }}>
                            {settings.about?.vision?.title || "The Vision"}
                        </h4>
                        <p className="text-white text-sm leading-relaxed font-medium">
                            {settings.about?.vision?.content || "To be a global leader in transformative education, shaping character and competence."}
                        </p>
                    </div>
                </EditableRegion>
            </div>
            </div>
        </section>
      )}

      {/* ------------------------------------------------------------------ */}
      {/*                        REFINED BENTO GRID                         */}
      {/* ------------------------------------------------------------------ */}
      {layout.showValues && (
        <section className="py-32 px-6 max-w-7xl mx-auto">
            <div className="flex flex-col items-center text-center space-y-4 mb-20 animate-reveal">
            <div className="h-1 w-20" style={{ backgroundColor: theme.accentColor }}></div>
            <h2 className="text-4xl md:text-5xl font-black text-primary-950 tracking-tighter leading-none uppercase" style={{ color: theme.primaryColor }}>
                <InlineEdit path="about.philosophy.title" text="Core" /> <span className="italic lowercase tracking-tight" style={{ color: theme.accentColor }}><InlineEdit path="about.philosophy.accent" text="Philosophy." /></span>
            </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <EditableRegion type="values" path="about.values" label="Core Philosophy Pillars" className="col-span-full">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {values.map((val, i) => (
                        <ValueCard 
                        key={i}
                        icon={val.icon} 
                        title={val.title} 
                        desc={val.desc} 
                        delay={val.delay}
                        theme={theme}
                        />
                    ))}
                </div>
            </EditableRegion>
            </div>
        </section>
      )}

      {/* ------------------------------------------------------------------ */}
      {/*                       ELEGANT LEADERSHIP                          */}
      {/* ------------------------------------------------------------------ */}
      {layout.showPrincipal && (
        <section className="py-32 px-6 bg-white">
            <div className="max-w-5xl mx-auto text-center space-y-12">
            <div className="space-y-4">
                <h2 className="text-xs font-black uppercase tracking-[0.4em]" style={{ color: theme.accentColor }}>
                    <InlineEdit path="home.principal.title" text={settings.home?.principal?.title || "Word from the Principal"} label="Leadership Title" />
                </h2>
                <div className="relative inline-block group">
                    <EditableRegion type="image" path="home.principal.image" label="Principal Portrait">
                        <div className="relative">
                            <div className="absolute inset-0 rounded-full blur-[40px] opacity-20 scale-150 -z-10 group-hover:scale-110 transition-transform" style={{ backgroundColor: theme.accentColor }}></div>
                            <img 
                            src={getImageUrl(settings.home?.principal?.image, principalImageDefault)} 
                            alt="Principal" 
                            className="w-48 h-48 md:w-64 md:h-64 object-cover object-top rounded-full border-8 border-white shadow-2xl transition-all duration-700 mx-auto grayscale group-hover:grayscale-0" 
                            />
                        </div>
                    </EditableRegion>
                </div>
            </div>

            <div className="space-y-8">
                <Quote size={48} className="mx-auto opacity-30" style={{ color: theme.accentColor }} />
                <EditableRegion type="text" path="home.principal.quote" label="Leadership Quote">
                    <p className="text-2xl md:text-3xl font-black text-primary-950 leading-tight tracking-tight italic">
                    "{settings.home?.principal?.quote || "Education is the manifestation of the perfection already in man."}"
                    </p>
                </EditableRegion>
                <div className="space-y-1 pt-6 border-t border-gray-100 max-w-[200px] mx-auto">
                    <p className="text-xl font-black text-primary-950">
                        <InlineEdit path="home.principal.name" text={settings.home?.principal?.name || "The Principal"} label="Principal Name" />
                    </p>
                    <p className="uppercase tracking-[0.3em] text-[10px] font-black" style={{ color: theme.accentColor }}>
                        <InlineEdit path="home.principal.designation" text={settings.home?.principal?.designation || "Principal"} label="Designation" />
                    </p>
                </div>
            </div>
            </div>
        </section>
      )}

      {/* ------------------------------------------------------------------ */}
      {/*                          COMPACT CTA                              */}
      {/* ------------------------------------------------------------------ */}
      {layout.showCta && (
        <section className="py-32 px-6">
            <div className="rounded-[3rem] p-12 md:p-20 text-center space-y-10 relative overflow-hidden group" style={{ backgroundColor: theme.primaryColor }}>
            <div className="absolute top-0 right-0 w-[400px] h-[400px] rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2" style={{ backgroundColor: `${theme.accentColor}15` }}></div>
            
            <div className="max-w-2xl mx-auto space-y-6">
                <h2 className="text-4xl md:text-6xl font-black text-white tracking-tighter leading-none">
                    <InlineEdit path="about.cta.title" text={settings.about?.cta?.title || "Begin Your Journey With"} /> <span style={{ color: theme.accentColor }}><InlineEdit path="schoolName" text={settings.schoolName?.substring(0, 3) || "Institution"} />.</span>
                </h2>
                <p className="text-white/60 text-lg font-medium leading-relaxed">
                    <InlineEdit path="about.cta.subtitle" text={settings.about?.cta?.subtitle || "Admissions are now open for the new academic session. Join us today."} label="CTA Subtitle" />
                </p>
            </div>
            
            <div className="pt-6">
                <EditableRegion type="link" path="about.cta" label="CTA Action Button">
                    <Link to="/admissions">
                        <button className="px-10 py-5 text-white rounded-full font-black uppercase tracking-widest text-xs hover:bg-white hover:text-primary-950 hover:-translate-y-1 transition-all shadow-xl shadow-black/20" style={{ backgroundColor: theme.accentColor }}>
                        {settings.about?.cta?.btnText || "Apply for Admission"}
                        </button>
                    </Link>
                </EditableRegion>
            </div>
            </div>
        </section>
      )}

    </div>
  );
};

const ValueCard = ({ icon: Icon, title, desc, delay, theme }) => (
  <div 
    className="group p-8 bg-white border border-gray-100 rounded-[2rem] shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-500 flex flex-col gap-5 animate-fade-up relative overflow-hidden"
    style={{ animationDelay: `${delay}ms` }}
  >
    <div className="absolute top-0 right-0 w-24 h-24 rounded-bl-[3rem] -z-10 group-hover:scale-110 transition-transform" style={{ backgroundColor: `${theme.accentColor}10` }}></div>
    <div className="w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-500" style={{ backgroundColor: `${theme.accentColor}10`, color: theme.accentColor }}>
      <Icon size={24} className="group-hover:scale-110" />
    </div>
    <div className="space-y-2">
      <h3 className="text-xl font-bold text-primary-950 uppercase tracking-tight">{title}</h3>
      <p className="text-gray-500 text-sm leading-relaxed font-medium">{desc}</p>
    </div>
  </div>
);

export default AboutPage;
