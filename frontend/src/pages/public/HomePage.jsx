import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import Button from "../../components/ui/Button";
import { BookOpen, Users, Award, Shield, Sparkles, ArrowRight, CheckCircle, Trophy, Star } from "lucide-react";
import schoolImage from "../../assets/school.png";
import principalImage from "../../assets/principal.png";

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

const HomePage = () => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const features = [
    {
      icon: BookOpen,
      title: "Smart Learning",
      desc: "Interactive pedagogy for the 21st century. We focus on critical thinking and real-world application through modern technology.",
      color: "bg-blue-50 text-blue-600",
      gridSpan: "md:col-span-1 md:row-span-2",
      badge: "Innovative",
      details: ["Digital First Curricula", "Lego Robotics Lab", "Research-led Teaching"],
    },
    {
      icon: Users,
      title: "Elite Alumni Network",
      desc: "Our graduates serve with distinction in the Indian Army, Air Force, and leading global corporations, embodying excellence in every profession.",
      color: "bg-accent-100 text-accent-700",
      gridSpan: "md:col-span-2 md:row-span-1",
      badge: "Professional",
    },
    {
      icon: Shield,
      title: "Safe Haven",
      desc: "24/7 security and a supportive environment for holistic well-being.",
      color: "bg-purple-50 text-purple-600",
      gridSpan: "md:col-span-1 md:row-span-1",
      badge: "Secure",
    },
    {
      icon: Sparkles,
      title: "Creative Arts",
      desc: "Nurturing the next generation of artists and creators.",
      color: "bg-pink-50 text-pink-600",
      gridSpan: "md:col-span-1 md:row-span-1",
      badge: "Creative",
    },
  ];

  return (
    <div className="min-h-screen bg-neutral-bg-subtle text-gray-900 font-body overflow-x-hidden">
      
      {/* --- HERO SECTION --- */}
      <section className="relative min-h-[95vh] flex items-center pt-36 pb-16 px-6 overflow-hidden">
        {/* Abstract Background Shapes */}
        <div className="absolute top-0 left-0 w-full h-full -z-10 bg-white">
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-accent-100 rounded-full blur-3xl opacity-50 pulse-slow"></div>
          <div className="absolute top-1/2 -left-24 w-96 h-96 bg-blue-50 rounded-full blur-3xl opacity-50 pulse-slow delay-700"></div>
        </div>

        <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="relative z-10 space-y-8 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent-100/50 text-accent-700 text-sm font-bold border border-accent-200 shadow-sm animate-fade-in">
              <Sparkles size={16} />
              <span>Admissions Open for 2024-25</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl xl:text-8xl font-black tracking-tight leading-[0.9] text-primary-950">
              Elevate <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent-500 to-accent-400">Education</span> <br />
              Experience.
            </h1>

            <p className="text-lg md:text-xl text-gray-600 max-w-xl mx-auto lg:mx-0 leading-relaxed">
              At SBS, we bridge the gap between curiosity and competence. 
              Modern facilities meet timeless values for a holistic growth journey.
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start">
              <Link to="/about" className="w-full sm:w-auto">
                <Button className="w-full px-8 py-4 rounded-full bg-primary-950 text-white hover:bg-black shadow-2xl shadow-primary-950/20 flex items-center justify-center gap-2 group transition-all">
                  Explore Programs
                  <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link to="/contact" className="w-full sm:w-auto">
                <Button variant="ghost" className="w-full px-8 py-4 rounded-full border-2 border-primary-950/10 text-primary-950 hover:bg-primary-50">
                  Contact Office
                </Button>
              </Link>
            </div>
          </div>

          <div className="relative hidden lg:block">
            <div className="relative rounded-[3rem] overflow-hidden shadow-2xl transform rotate-2 hover:rotate-0 transition-all duration-700 scale-105 border-[12px] border-white ring-1 ring-gray-200">
              <img src={schoolImage} alt="School" className="w-full h-[600px] object-cover" />
              <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/60 to-transparent"></div>
              
              {/* Floating Stat Card */}
              <div className="absolute bottom-8 left-8 right-8 p-6 bg-white/10 backdrop-blur-xl rounded-3xl border border-white/20 shadow-2xl flex justify-between items-center text-white">
                <div>
                  <p className="text-3xl font-black">98.5%</p>
                  <p className="text-xs uppercase font-bold tracking-widest opacity-80">Annual Success</p>
                </div>
                <div className="h-10 w-[1px] bg-white/20"></div>
                <div>
                  <p className="text-3xl font-black">50+</p>
                  <p className="text-xs uppercase font-bold tracking-widest opacity-80">Awards Won</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- QUICK STATS --- */}
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 py-10 px-8 bg-neutral-bg-subtle/50 rounded-[3rem] border border-gray-100 shadow-inner">
            <CountingStat value="1,200+" label="Alumni" />
            <CountingStat value="15:1" label="Ratio" />
            <CountingStat value="45+" label="Experience" />
            <CountingStat value="100%" label="Security" />
          </div>
        </div>
      </section>

      {/* --- BENTO FEATURES (THE SBS ADVANTAGE) --- */}
      <section className="py-32 px-6 relative overflow-hidden">
        {/* Decorative background */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-accent-50/50 rounded-full blur-[100px] -z-10"></div>
        
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
            <div className="space-y-4">
              <div className="inline-block px-4 py-1.5 bg-accent-100/50 text-accent-700 text-xs font-black uppercase tracking-[0.2em] rounded-lg border border-accent-200">
                Core Value Proposition
              </div>
              <h2 className="text-4xl md:text-6xl font-black text-primary-950 leading-tight">
                The SBS <br /> <span className="text-accent-500">Advantage.</span>
              </h2>
            </div>
            <p className="max-w-md text-gray-500 font-medium leading-relaxed">
              We've spent 20 years perfecting an educational model that works. Modern in approach, historical in results.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[280px]">
            {features.map((f, i) => {
              const Icon = f.icon;
              return (
                <div 
                  key={i} 
                  className={`${f.gridSpan} group p-8 rounded-[2.5rem] bg-white border border-gray-100 shadow-sm hover:shadow-2xl hover:border-accent-200 transition-all duration-700 flex flex-col justify-start overflow-hidden relative active:scale-[0.99] cursor-default`}
                >
                  {/* Watermark for first card */}
                  {i === 0 && (
                    <div className="absolute -bottom-10 -left-10 text-[15rem] font-black text-gray-100/80 select-none -z-0 leading-none">
                      20
                    </div>
                  )}

                  {/* Glass highlight effect */}
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-accent-300/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  
                  <div className="relative z-10 flex flex-col h-full gap-4">
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <div className={`w-12 h-12 rounded-xl ${f.color} flex items-center justify-center group-hover:rotate-6 shadow-sm transition-transform duration-500`}>
                          <Icon size={24} />
                        </div>
                        <span className="text-[9px] uppercase font-black tracking-widest text-primary-950/40 bg-gray-50 px-2 py-1 rounded-full border border-gray-100">
                          {f.badge}
                        </span>
                      </div>
                      <h3 className="text-xl md:text-2xl font-black mb-2 text-primary-950 group-hover:text-accent-600 transition-colors leading-tight tracking-tight">
                        {f.title}
                      </h3>
                      <p className="text-gray-600 leading-relaxed font-medium text-xs md:text-sm">
                        {f.desc}
                      </p>
                      
                      {f.details && (
                        <div className="space-y-2 mt-4 border-t border-gray-100 pt-4">
                          {f.details.map((detail, idx) => (
                            <div key={idx} className="flex items-center gap-2 text-[11px] font-bold text-primary-950/80">
                              <div className="w-1 h-1 rounded-full bg-accent-500"></div>
                              {detail}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <Link to="/about" className="mt-auto pt-4 border-t border-gray-100 block">
                      <div className="flex items-center gap-2 text-accent-600 font-bold text-[10px] uppercase tracking-[0.2em] group-hover:gap-3 transition-all duration-300">
                        <span>Explore More</span>
                        <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform" />
                      </div>
                    </Link>
                  </div>
                  
                  {/* Bottom pattern */}
                  <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-accent-50/30 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* --- PRINCIPAL'S SECTION --- */}
      <section className="py-24 bg-primary-950 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-accent-500/10 -skew-x-12 translate-x-1/2"></div>
        
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="order-2 lg:order-1 relative">
            <div className="relative z-10 rounded-[3rem] overflow-hidden border-8 border-white/10 shadow-3xl">
              <img src={principalImage} alt="Principal" className="w-full grayscale hover:grayscale-0 transition-all duration-700 h-[500px] object-cover object-top" />
            </div>
            {/* Decoration */}
            <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-accent-500 rounded-full blur-[80px] opacity-30"></div>
          </div>

          <div className="text-white space-y-8 order-1 lg:order-2">
            <h2 className="text-4xl md:text-5xl font-black">Leadership <br /> with Vision.</h2>
            <p className="text-xl text-accent-100/80 italic leading-relaxed font-medium">
              "We believe that every child is a unique universe. Our mission is to provide the light that helps them discover their own path to excellence."
            </p>
            <div className="space-y-2">
              <p className="text-2xl font-bold text-accent-400">Mr. Sanjay Sharma</p>
              <p className="uppercase tracking-[0.3em] text-xs font-black opacity-40">Principal & Founder</p>
            </div>
            
            <div className="flex items-center gap-6 pt-6">
              <div className="flex items-center gap-2">
                <CheckCircle size={20} className="text-accent-400" />
                <span className="text-sm font-bold opacity-80 uppercase tracking-wider">Expertise</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle size={20} className="text-accent-400" />
                <span className="text-sm font-bold opacity-80 uppercase tracking-wider">Integrity</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle size={20} className="text-accent-400" />
                <span className="text-sm font-bold opacity-80 uppercase tracking-wider">Results</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- FINAL HIGH-IMPACT LIGHT CTA SECTION --- */}
      <section className="py-32 px-6 relative overflow-hidden bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="relative rounded-[4rem] bg-[#f0faf2] bg-gradient-to-br from-[#f0faf2] via-white/90 to-[#e8f5ee] p-12 md:p-24 overflow-hidden border border-accent-200/30 shadow-accent-glow">
            {/* Subtle Neutral Mesh Gradient Overlay */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,#F0FDF4_0%,transparent_50%),radial-gradient(circle_at_80%_70%,#F1F5F9_0%,transparent_50%)] opacity-70"></div>
            
            <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
              {/* Left Column: Big Impact Text */}
              <div className="lg:col-span-8 space-y-8">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent-50 text-accent-700 text-xs font-black uppercase tracking-[0.3em] border border-accent-100">
                  <Trophy size={14} className="text-accent-500" />
                  20 Years of Educational Leadership
                </div>
                
                <h2 className="text-5xl md:text-8xl font-black text-primary-950 leading-[0.9] tracking-tighter">
                  Start your <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent-600 to-accent-400">Elite</span> <br />
                  Journey.
                </h2>
                
                <p className="text-gray-600 text-lg md:text-xl font-medium max-w-xl leading-relaxed">
                  Join a tradition of excellence where we nurture future leaders for the Indian Armed Forces and global corporate spaces.
                </p>

                <div className="flex flex-col sm:flex-row items-center gap-6 pt-4">
                  <Link to="/admissions" className="w-full sm:w-auto">
                    <Button className="w-full px-10 py-5 rounded-full bg-accent-500 text-white hover:bg-accent-600 active:scale-95 shadow-2xl shadow-accent-500/20 transition-all duration-300 font-black uppercase tracking-widest text-sm flex items-center justify-center gap-3 relative overflow-hidden group">
                      <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full animate-shimmer"></div>
                      <span className="relative">Apply for Admission</span>
                      <ArrowRight size={18} className="relative group-hover:translate-x-2 transition-transform" />
                    </Button>
                  </Link>
                  <Link to="/gallery" className="w-full sm:w-auto">
                    <Button variant="ghost" className="w-full px-10 py-5 rounded-full border-2 border-primary-950/10 text-primary-950 hover:bg-gray-50 transition-all font-black uppercase tracking-widest text-sm flex items-center gap-2">
                      <span>Virtual Tour</span>
                      <div className="w-2 h-2 rounded-full bg-accent-500 animate-pulse"></div>
                    </Button>
                  </Link>
                </div>
              </div>

              {/* Right Column: Decorative Stat/Badge */}
              <div className="lg:col-span-4 hidden lg:flex flex-col items-center justify-center relative">
                {/* Massive Watermark */}
                <div className="absolute inset-0 flex items-center justify-center -z-10 pointer-events-none">
                  <span className="text-[25rem] font-black text-gray-100/70 leading-none select-none">SBS</span>
                </div>
                
                <div className="p-8 rounded-[3rem] bg-white border border-gray-100 shadow-2xl space-y-6 transform rotate-3 hover:rotate-0 transition-all duration-700">
                  <div className="flex -space-x-3">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="w-12 h-12 rounded-full border-2 border-white bg-accent-500 flex items-center justify-center text-white text-xs font-bold">
                        {i}
                      </div>
                    ))}
                    <div className="w-12 h-12 rounded-full border-2 border-white bg-primary-950 flex items-center justify-center text-white text-xs font-bold">
                      +5k
                    </div>
                  </div>
                  <p className="text-primary-950 font-bold leading-tight">
                    Trusted by <span className="text-accent-500">5000+</span> <br /> 
                    parents across India.
                  </p>
                  <div className="pt-4 border-t border-gray-100 flex items-center gap-3">
                    <Star className="text-yellow-400 fill-yellow-400" size={16} />
                    <span className="text-sm text-gray-500 font-medium">4.9/5 Average Rating</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
};

export default HomePage;
