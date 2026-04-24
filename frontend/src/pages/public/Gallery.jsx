import React, { useState, useEffect, useMemo } from "react";
import { 
  Maximize2, 
  X, 
  Loader2, 
  Sparkles, 
  Image as ImageIcon, 
  Search 
} from "lucide-react";
import { useSiteSettings } from "../../context/SiteSettingsContext";
import InlineEdit from "../../components/ui/InlineEdit";
import EditableRegion from "../../components/ui/EditableRegion";

const getImageUrl = (url) => {
  if (!url) return "";
  if (url.startsWith('http')) return url;
  const cleanPath = url.replace(/\\/g, '/');
  return `http://localhost:5005/${cleanPath}`;
};

const GalleryCard = ({ img, onSelect, theme }) => {
  return (
    <div 
      onClick={() => onSelect(img)}
      className="group relative aspect-[4/5] md:aspect-square overflow-hidden rounded-[2rem] bg-gray-100 cursor-pointer animate-fade-up border border-gray-100/50 shadow-sm hover:shadow-2xl transition-all duration-700 hover:-translate-y-2"
    >
      <img
        src={getImageUrl(img.url)}
        alt={img.title}
        className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
        loading="lazy"
      />
      
      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-primary-950/80 via-primary-950/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex flex-col justify-end p-8">
        <div className="space-y-3 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
          <h3 className="text-xl font-black text-white uppercase tracking-tighter leading-none">
            {img.title}
          </h3>
          
          <div className="flex flex-wrap gap-2">
            {img.tags?.slice(0, 3).map((tag, i) => (
              <span key={i} className="px-2 py-1 bg-white/20 backdrop-blur-md rounded-md text-[8px] font-black text-white uppercase tracking-widest leading-none border border-white/10">
                {tag}
              </span>
            ))}
          </div>

          <button className="w-10 h-10 rounded-full text-white flex items-center justify-center shadow-lg transform hover:scale-110 active:scale-95 transition-all" style={{ backgroundColor: theme.accentColor }}>
            <Maximize2 size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

const Gallery = () => {
  const { settings, loading: settingsLoading } = useSiteSettings();
  const [images, setImages] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTag, setActiveTag] = useState("All");

  const fetchGalleryImages = async () => {
    try {
      const res = await fetch("http://localhost:5005/api/public/gallery");
      const data = await res.json();
      setImages(data || []);
      setLoading(false);
    } catch (error) {
      console.error("Gallery Fetch Error:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGalleryImages();
  }, []);

  const allTags = useMemo(() => {
    const tagsSet = new Set(["All"]);
    images.forEach(img => {
      img.tags?.forEach(tag => tagsSet.add(tag));
    });
    return Array.from(tagsSet);
  }, [images]);

  const filteredImages = images.filter(img => {
    const matchesTag = activeTag === "All" || img.tags?.includes(activeTag);
    const matchesSearch = img.title?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          img.keywords?.some(k => k.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesTag && matchesSearch;
  });

  if (settingsLoading || !settings) {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-white space-y-4">
            <Loader2 className="w-12 h-12 text-accent-500 animate-spin" />
            <p className="text-[10px] font-black uppercase tracking-[0.5em] text-gray-400">Loading Memories...</p>
        </div>
    );
  }

  const theme = settings.theme || { primaryColor: "#0a0a0a", accentColor: "#10b981" };

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-gray-900 overflow-x-hidden pt-28 pb-32 font-body" style={{ "--primary": theme.primaryColor, "--accent": theme.accentColor }}>
      
      <section className="max-w-7xl mx-auto px-6 mb-16 space-y-12">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8 border-b border-gray-100 pb-12">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.2em] border" style={{ backgroundColor: `${theme.accentColor}10`, color: theme.accentColor, borderColor: `${theme.accentColor}30` }}>
              <ImageIcon size={14} />
              <span>Visual Chronology</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-black tracking-tighter leading-none uppercase" style={{ color: theme.primaryColor }}>
              Captured <br /> <span style={{ color: theme.accentColor }} className="italic lowercase tracking-tight">moments.</span>
            </h1>
          </div>
          <p className="max-w-md text-gray-400 font-medium text-lg leading-snug">
            <InlineEdit path="global.gallerySubtitle" text={settings.global?.gallerySubtitle || `A window into the vibrant life at ${settings.schoolName || "the Institution"}.`} label="Gallery Subtitle" />
          </p>
        </div>

        <div className="flex flex-col md:flex-row items-center gap-6">
          <div className="relative flex-1 group w-full">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-accent-500 transition-colors" size={20} />
            <input 
              type="text" 
              placeholder="Search memories..."
              className="w-full pl-14 pr-8 py-5 bg-white border border-gray-100 rounded-2xl shadow-sm focus:ring-4 transition-all font-medium text-sm outline-none"
              style={{ focusRingColor: `${theme.accentColor}20`, focusBorderColor: theme.accentColor }}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="flex items-center gap-3 w-full md:w-auto overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
            {allTags.map((tag) => (
              <button
                key={tag}
                onClick={() => setActiveTag(tag)}
                className={`px-8 py-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${
                  activeTag === tag 
                  ? "text-white shadow-xl" 
                  : "bg-white text-gray-400 hover:text-primary-950 hover:bg-gray-50 border border-gray-100"
                }`}
                style={activeTag === tag ? { backgroundColor: theme.primaryColor } : {}}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-6">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className="aspect-square bg-white rounded-[2rem] border border-gray-50 animate-pulse flex flex-col p-4 gap-4">
                 <div className="w-full h-full bg-gray-50 rounded-2xl"></div>
              </div>
            ))}
          </div>
        ) : filteredImages.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 space-y-6 opacity-40">
            <ImageIcon size={64} className="text-gray-300" />
            <p className="text-xl font-bold uppercase tracking-widest text-gray-400 text-center">No memories found.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {filteredImages.map((img) => (
              <GalleryCard key={img._id} img={img} onSelect={setSelected} theme={theme} />
            ))}
          </div>
        )}
      </section>

      {selected && (
        <div 
          className="fixed inset-0 bg-white/60 backdrop-blur-md z-[9999] flex items-center justify-center p-4 md:p-10 animate-fade-in"
          onClick={() => setSelected(null)}
        >
          <button 
            className="absolute top-6 right-6 md:top-10 md:right-10 w-12 h-12 md:w-14 md:h-14 rounded-full text-white flex items-center justify-center transition-all shadow-2xl z-[10000]"
            style={{ backgroundColor: theme.primaryColor }}
            onClick={() => setSelected(null)}
          >
            <X size={24} />
          </button>

          <div 
            className="max-w-6xl w-full max-h-[90vh] flex flex-col lg:flex-row gap-0 bg-white rounded-[2.5rem] md:rounded-[3rem] overflow-hidden shadow-2xl border border-gray-100 animate-fade-up"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="lg:w-2/3 h-[50vh] lg:h-[80vh] bg-gray-50 flex items-center justify-center p-8">
               <img
                 src={getImageUrl(selected.url)}
                 alt={selected.title}
                 className="max-w-full max-h-full object-contain rounded-2xl"
               />
            </div>

            <div className="lg:w-1/3 flex flex-col justify-between p-12 bg-white relative">
               <div className="space-y-8">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${theme.accentColor}15`, color: theme.accentColor }}>
                      <Sparkles size={20} />
                    </div>
                    <span className="font-black text-[10px] uppercase tracking-[0.2em]" style={{ color: theme.accentColor }}>Memory Details</span>
                  </div>
                  
                  <div className="space-y-4">
                    <h2 className="text-4xl lg:text-5xl font-black leading-none tracking-tighter" style={{ color: theme.primaryColor }}>
                       {selected.title}
                    </h2>
                  </div>
               </div>

               <div className="pt-12">
                  <button className="w-full py-5 text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:-translate-y-1 transition-all shadow-xl" style={{ backgroundColor: theme.primaryColor }}>
                     Share memory
                  </button>
               </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Gallery;
