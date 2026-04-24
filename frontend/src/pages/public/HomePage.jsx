import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import Button from "../../components/ui/Button";
import { 
  BookOpen, 
  Users, 
  Award, 
  Shield, 
  Sparkles, 
  ArrowRight, 
  CheckCircle, 
  Trophy, 
  Star, 
  Loader2,
  Zap,
  Search,
  FileText,
  Quote,
  Target,
  ShieldCheck,
  ClipboardList,
  Headphones,
  Mail,
  Calendar,
  TrendingUp,
  Globe,
  History
} from "lucide-react";
import { useSiteSettings } from "../../context/SiteSettingsContext";
import schoolImageDefault from "../../assets/school.png";
import principalImageDefault from "../../assets/principal.png";
import InlineEdit from "../../components/ui/InlineEdit";
import EditableRegion from "../../components/ui/EditableRegion";

/* ------------------------ Counting Stat Component ------------------------ */
const CountingStat = ({ value, label, duration = 2500 }) => {
  const statRef = useRef(null);
  const observerRef = useRef(null);

  const rawValue = String(value ?? "");
  const isRatio = rawValue.includes(":");
  let ratioParts = [];

  if (isRatio) ratioParts = rawValue.split(":");

  let numberToCount = 0;
  let nonCountingSuffix = "";
  let isCountable = true;

  if (isRatio) {
    numberToCount = parseInt(ratioParts[0].replace(/,/g, ""), 10) || 0;
    nonCountingSuffix = ":" + (ratioParts[1] ?? "");
  } else {
    const match = rawValue.match(/^([\d,]+)(.*)$/);
    if (match) {
      numberToCount = parseInt(match[1].replace(/,/g, ""), 10) || 0;
      nonCountingSuffix = match[2] || "";
    } else {
      isCountable = false;
    }
  }

  const initialCount = isCountable ? 0 : numberToCount;
  const [count, setCount] = useState(initialCount);
  const [hasCounted, setHasCounted] = useState(!isCountable);

  useEffect(() => {
    if (hasCounted || !isCountable) return;

    const node = statRef.current;
    if (!node) return;

    observerRef.current = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasCounted) {
          setHasCounted(true);

          let startTime = null;
          const step = (ts) => {
            if (!startTime) startTime = ts;
            const progress = ts - startTime;
            const pct = Math.min(progress / duration, 1);

            const eased = 1 - Math.pow(1 - pct, 3);
            const currentValue = Math.floor(eased * numberToCount);

            setCount(currentValue);

            if (progress < duration) {
              requestAnimationFrame(step);
            } else {
              setCount(numberToCount);
            }
          };

          requestAnimationFrame(step);
          observerRef.current.unobserve(node);
        }
      },
      { threshold: 0.45 }
    );

    observerRef.current.observe(node);

    return () => observerRef.current.disconnect();
  }, [numberToCount, duration, hasCounted, isCountable]);

  const display = isCountable
    ? `${count.toLocaleString()}${nonCountingSuffix}`
    : rawValue;

  return (
    <div ref={statRef} className="flex flex-col items-center">
      <p className="text-4xl md:text-5xl font-black text-accent-500 mb-2 tracking-tighter">
        {display}
      </p>
      <p className="text-xs md:text-sm font-bold uppercase tracking-widest text-primary-950/80">
        {label}
      </p>
    </div>
  );
};

const DynamicIcon = ({ name, size = 24, className = "" }) => {
  const IconMap = { 
    BookOpen, Users, Shield, Sparkles, Award, Star, Zap, Search, FileText, Trophy,
    ShieldCheck, ClipboardList, Headphones, Mail, Calendar, Target, TrendingUp, Globe, History
  };
  const Icon = IconMap[name] || Star;
  return <Icon size={size} className={className} />;
};

const HomePage = () => {
  const { settings, loading, isEditorMode } = useSiteSettings();

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
        <p className="text-[10px] font-black uppercase tracking-[0.5em] text-gray-400">Restoring Institutional Portal...</p>
      </div>
    );
  }

  const IconMap = { BookOpen, Users, Shield, Sparkles, Award, Star, Zap, Search, FileText, Trophy, ShieldCheck, TrendingUp, Globe, History, Target };
  
  const stats = settings.home?.stats || [];
  const features = (settings.home?.advantage?.features || []).map((f, i) => ({
    ...f,
    color: i % 4 === 0 ? "bg-blue-50 text-blue-600" : i % 4 === 1 ? "bg-accent-100 text-accent-700" : i % 4 === 2 ? "bg-purple-50 text-purple-600" : "bg-pink-50 text-pink-600",
    gridSpan: i === 0 ? "md:col-span-1 md:row-span-2" : i === 1 ? "md:col-span-2 md:row-span-1" : "md:col-span-1 md:row-span-1",
  }));

  const theme = settings.theme || { primaryColor: "#0a0a0a", accentColor: "#10b981" };
  const layout = { showHero: true, showStats: true, showAdvantage: true, showPrincipal: true, showCta: true, ...(settings.layout?.home || {}) };

  return (
    <div className="min-h-screen bg-neutral-bg-subtle text-gray-900 font-body overflow-x-hidden" style={{ "--primary": theme.primaryColor, "--accent": theme.accentColor }}>
      
      {/* --- HERO SECTION --- */}
      {layout.showHero && (
        <section className="relative min-h-[95vh] flex items-center pt-36 pb-16 px-6 overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full -z-10 bg-white">
            <div className="absolute -top-24 -right-24 w-96 h-96 bg-accent-100 rounded-full blur-3xl opacity-50 pulse-slow" style={{ backgroundColor: `${theme.accentColor}20` }}></div>
            <div className="absolute top-1/2 -left-24 w-96 h-96 bg-blue-50 rounded-full blur-3xl opacity-50 pulse-slow delay-700" style={{ backgroundColor: `${theme.primaryColor}10` }}></div>
          </div>

          <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="relative z-10 space-y-8 text-center lg:text-left">
              <EditableRegion type="badge" path="home.hero.badge" label="Hero Status Badge">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold border border-accent-200 shadow-sm animate-fade-in" style={{ backgroundColor: `${settings.home?.hero?.badge?.color || theme.accentColor}20`, color: settings.home?.hero?.badge?.color || theme.accentColor, borderColor: `${settings.home?.hero?.badge?.color || theme.accentColor}40` }}>
                  <DynamicIcon name={settings.home?.hero?.badge?.icon || "Sparkles"} size={16} />
                  <span>{settings.home?.hero?.badge?.text || "Explore Our Excellence"}</span>
                </div>
              </EditableRegion>
              
              <h1 className="text-5xl md:text-7xl xl:text-8xl font-black tracking-tight leading-[0.9] text-primary-950" style={{ color: theme.primaryColor }}>
                <InlineEdit path="home.hero.title" text={settings.home?.hero?.title || "Elevating The Next Generation."} />
              </h1>

              <p className="text-lg md:text-xl text-gray-600 max-w-xl mx-auto lg:mx-0 leading-relaxed">
                <InlineEdit path="home.hero.subtitle" text={settings.home?.hero?.subtitle || "A nurturing environment where every student's potential is discovered and developed."} />
              </p>

              <div className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start">
                <EditableRegion type="link" path="home.hero.primaryBtn" label="Primary Action Button">
                  <Link to={settings.home?.hero?.primaryBtn?.url || "/about"} className="w-full sm:w-auto">
                    <Button className="w-full px-8 py-4 rounded-full text-white shadow-2xl flex items-center justify-center gap-2 group transition-all" style={{ backgroundColor: theme.primaryColor }}>
                      {settings.home?.hero?.primaryBtn?.text || "Learn More"}
                      <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </Link>
                </EditableRegion>
                <EditableRegion type="link" path="home.hero.secondaryBtn" label="Secondary Action Button">
                  <Link to={settings.home?.hero?.secondaryBtn?.url || "/contact"} className="w-full sm:w-auto">
                    <Button variant="ghost" className="w-full px-8 py-4 rounded-full border-2 text-primary-950 hover:bg-primary-50" style={{ borderColor: `${theme.primaryColor}20` }}>
                      {settings.home?.hero?.secondaryBtn?.text || "Contact Us"}
                    </Button>
                  </Link>
                </EditableRegion>
              </div>
            </div>

            <div className="relative hidden lg:block">
              <div className="relative rounded-[3rem] overflow-hidden shadow-2xl transform rotate-2 hover:rotate-0 transition-all duration-700 scale-105 border-[12px] border-white ring-1 ring-gray-200">
                <EditableRegion type="image" path="home.hero.image" label="Hero Background Graphic" className="w-full h-[600px] block">
                    <img src={getImageUrl(settings.home?.hero?.image, schoolImageDefault)} alt="School" className="w-full h-[600px] object-cover" />
                </EditableRegion>
                <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/60 to-transparent pointer-events-none"></div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* --- STATS SECTION --- */}
      {layout.showStats && (stats.length > 0 || isEditorMode) && (
        <section className="py-20 relative z-20 bg-white border-y border-gray-100">
          <div className="container mx-auto px-6 max-w-7xl">
            <EditableRegion type="stats" path="home.stats" label="Institutional Metrics">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8 lg:gap-12 divide-x divide-gray-100">
                {stats.length === 0 && isEditorMode ? (
                  <div className="col-span-4 text-center text-gray-400 py-10 font-bold border-2 border-dashed border-gray-200 rounded-xl">
                    No stats configured. Click to add.
                  </div>
                ) : (
                  stats.map((stat, idx) => (
                    <div key={idx} className="group">
                        <CountingStat value={stat.value} label={stat.label} />
                    </div>
                  ))
                )}
              </div>
            </EditableRegion>
          </div>
        </section>
      )}

      {/* --- BENTO FEATURES (THE SBS ADVANTAGE) --- */}
      {layout.showAdvantage && (
        <section className="py-32 px-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-accent-50/50 rounded-full blur-[100px] -z-10" style={{ backgroundColor: `${theme.accentColor}10` }}></div>
          
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
              <div className="space-y-4">
                <EditableRegion type="badge" path="home.advantage.badge" label="Advantage Section Badge">
                  <div className="inline-flex items-center gap-2 px-4 py-1.5 text-xs font-black uppercase tracking-[0.2em] rounded-lg border border-accent-200" style={{ backgroundColor: `${settings.home?.advantage?.badge?.color || theme.accentColor}20`, color: settings.home?.advantage?.badge?.color || theme.accentColor, borderColor: `${settings.home?.advantage?.badge?.color || theme.accentColor}40` }}>
                    <DynamicIcon name={settings.home?.advantage?.badge?.icon || "Award"} size={14} />
                    <span>{settings.home?.advantage?.badge?.text || "Core Value Proposition"}</span>
                  </div>
                </EditableRegion>
                <h2 className="text-4xl md:text-6xl font-black text-primary-950 leading-tight" style={{ color: theme.primaryColor }}>
                  <InlineEdit path="home.advantage.title" text={settings.home?.advantage?.title || "Why Choose Us."} />
                </h2>
              </div>
              <p className="max-w-md text-gray-500 font-medium leading-relaxed">
                <InlineEdit path="home.advantage.subtitle" text={settings.home?.advantage?.subtitle || "Experience a transformational journey at our campus."} />
              </p>
            </div>

            <EditableRegion type="features" path="home.advantage.features" label="Core Advantages Grid">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-6 lg:gap-8">
                {features.length === 0 && isEditorMode ? (
                  <div className="col-span-12 text-center text-gray-400 py-20 font-bold border-2 border-dashed border-gray-200 rounded-3xl">
                    No features configured. Click to add.
                  </div>
                ) : (
                  features.map((f, i) => {
                    const total = features.length;
                    let spanClass = "lg:col-span-4";
                    
                    if (total === 1) spanClass = "lg:col-span-4 lg:col-start-5";
                    else if (total === 2 || total === 4) spanClass = "lg:col-span-6";
                    else {
                      // Dynamic balancing for 3, 5, 6, 7, 8... cards
                      const remainder = total % 3;
                      if (remainder === 1) {
                        // For 7, 10, etc. - last 4 become two rows of 2
                        if (i >= total - 4) spanClass = "lg:col-span-6";
                        else spanClass = "lg:col-span-4";
                      } else if (remainder === 2) {
                        // For 5, 8, etc. - last 2 become one row of 2
                        if (i >= total - 2) spanClass = "lg:col-span-6";
                        else spanClass = "lg:col-span-4";
                      } else {
                        // Multiples of 3 - all equal
                        spanClass = "lg:col-span-4";
                      }
                    }

                    return (
                      <div 
                        key={i} 
                        className={`${spanClass} group p-8 rounded-[2.5rem] bg-white border border-gray-100 shadow-sm hover:shadow-2xl hover:border-accent-200 transition-all duration-700 flex flex-col justify-start overflow-hidden relative active:scale-[0.99] cursor-default`}
                      >
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-accent-300/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        
                        <div className="relative z-10 flex flex-col h-full gap-4">
                          <div>
                            <div className="flex items-center justify-between mb-4">
                              <div className={`w-12 h-12 rounded-xl flex items-center justify-center group-hover:rotate-6 shadow-sm transition-transform duration-500`} style={{ backgroundColor: `${theme.accentColor}20`, color: theme.accentColor }}>
                                <DynamicIcon name={f.icon} size={24} />
                              </div>
                              <span className="text-[9px] uppercase font-black tracking-widest text-primary-950/40 bg-gray-50 px-2 py-1 rounded-full border border-gray-100">
                                {f.badge || "Featured"}
                              </span>
                            </div>
                            <h3 className="text-xl md:text-2xl font-black mb-2 text-primary-950 group-hover:text-accent-600 transition-colors duration-300 leading-tight tracking-tight">
                              {f.title}
                            </h3>
                            <p className="text-gray-600 leading-relaxed font-medium text-xs md:text-sm">
                              {f.desc}
                            </p>
                          </div>

                          <Link to={f.link?.url || "/about"} className="mt-auto pt-4 border-t border-gray-100 block">
                            <div className="flex items-center gap-2 font-bold text-[10px] uppercase tracking-[0.2em] group-hover:gap-3 transition-all duration-300" style={{ color: theme.accentColor }}>
                              <span>{f.link?.text || "Learn More"}</span>
                              <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform" />
                            </div>
                          </Link>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
              </EditableRegion>
          </div>
        </section>
      )}

      {/* --- PRINCIPAL'S SECTION --- */}
      {layout.showPrincipal && (
        <section className="py-24 relative overflow-hidden" style={{ backgroundColor: theme.primaryColor }}>
          <div className="absolute top-0 right-0 w-1/2 h-full bg-accent-500/10 -skew-x-12 translate-x-1/2" style={{ backgroundColor: `${theme.accentColor}10` }}></div>
          
          <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="order-2 lg:order-1 relative">
              <EditableRegion type="image" path="home.principal.image" label="Portrait Visual" className="relative z-10 rounded-[3rem] overflow-hidden border-8 border-white/10 shadow-3xl block">
                <img src={getImageUrl(settings.home?.principal?.image, principalImageDefault)} alt="Principal" className="w-full grayscale hover:grayscale-0 transition-all duration-700 h-[500px] object-cover object-top" />
              </EditableRegion>
              <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-accent-500 rounded-full blur-[80px] opacity-30" style={{ backgroundColor: theme.accentColor }}></div>
            </div>

            <div className="text-white space-y-8 order-1 lg:order-2">
              <h2 className="text-4xl md:text-5xl font-black">
                <InlineEdit path="home.principal.title" text={settings.home?.principal?.title || "Leadership with Vision."} />
              </h2>
              <p className="text-xl italic leading-relaxed font-medium opacity-90">
                "<InlineEdit path="home.principal.quote" text={settings.home?.principal?.quote || "Education is the manifestation of the perfection already in man."} />"
              </p>
              <div className="space-y-2">
                <p className="text-2xl font-bold" style={{ color: theme.accentColor }}><InlineEdit path="home.principal.name" text={settings.home?.principal?.name || "The Principal"} /></p>
                <p className="uppercase tracking-[0.3em] text-[10px] font-black opacity-40"><InlineEdit path="home.principal.designation" text={settings.home?.principal?.designation || "Principal"} /></p>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* --- FINAL CTA SECTION --- */}
      {layout.showCta && (
        <section className="py-32 px-6 relative overflow-hidden bg-white">
          <div className="max-w-7xl mx-auto">
            <div className="relative rounded-[4rem] p-12 md:p-24 overflow-hidden border border-accent-200/30 shadow-accent-glow" style={{ backgroundColor: `${theme.accentColor}05` }}>
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,#F0FDF4_0%,transparent_50%),radial-gradient(circle_at_80%_70%,#F1F5F9_0%,transparent_50%)] opacity-70"></div>
              
              <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
                <div className="lg:col-span-8 space-y-8">
                  <EditableRegion type="badge" path="home.cta.badge" label="CTA Status Badge">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-black uppercase tracking-[0.3em] border border-accent-100" style={{ backgroundColor: `${settings.home?.cta?.badge?.color || theme.accentColor}10`, color: settings.home?.cta?.badge?.color || theme.accentColor, borderColor: `${settings.home?.cta?.badge?.color || theme.accentColor}20` }}>
                      <DynamicIcon name={settings.home?.cta?.badge?.icon || "Trophy"} size={14} />
                      <span>{settings.home?.cta?.badge?.text || "Since 2004"}</span>
                    </div>
                  </EditableRegion>
                  
                  <h2 className="text-5xl md:text-8xl font-black text-primary-950 leading-[0.9] tracking-tighter" style={{ color: theme.primaryColor }}>
                    <InlineEdit path="home.cta.title" text={settings.home?.cta?.title || "Apply Foundation."} />
                  </h2>
                  
                  <p className="text-gray-600 text-lg md:text-xl font-medium max-w-xl leading-relaxed">
                    <InlineEdit path="home.cta.subtitle" text={settings.home?.cta?.subtitle || "Join a tradition of excellence and shape your future."} />
                  </p>

                  <div className="flex flex-col sm:flex-row items-center gap-6 pt-4">
                    <EditableRegion type="link" path="home.cta.primaryBtn" label="CTA Action Button">
                      <Link to={settings.home?.cta?.primaryBtn?.url || "/admissions"} className="w-full sm:w-auto inline-block">
                        <Button className="w-full px-10 py-5 rounded-full text-white shadow-2xl transition-all duration-300 font-black uppercase tracking-widest text-sm flex items-center justify-center gap-3 relative overflow-hidden group shadow-accent-500/20" style={{ backgroundColor: theme.accentColor }}>
                          <span className="relative">{settings.home?.cta?.primaryBtn?.text || "Apply Now"}</span>
                          <ArrowRight size={18} className="relative group-hover:translate-x-2 transition-transform" />
                        </Button>
                      </Link>
                    </EditableRegion>
                  </div>
                </div>

                <div className="lg:col-span-4 hidden lg:flex flex-col items-center justify-center relative">
                  <div className="absolute inset-0 flex items-center justify-center -z-10 pointer-events-none">
                    <span className="text-[25rem] font-black text-gray-100/70 leading-none select-none uppercase">
                      <InlineEdit path="schoolName" text={settings.schoolName?.substring(0, 3) || "SBS"} />
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

    </div>
  );
};

export default HomePage;
