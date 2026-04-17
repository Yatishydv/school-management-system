import React, { useEffect, useState, useMemo } from "react";
import { 
  Search, 
  Filter, 
  Maximize2, 
  X, 
  Image as ImageIcon,
  Tag,
  Calendar,
  ChevronRight,
  Sparkles
} from "lucide-react";

const getImageUrl = (url) => {
  if (!url) return "";
  const cleanPath = url.replace(/\\/g, '/');
  if (cleanPath.includes('/uploads/')) {
     return `http://localhost:5005/uploads/${cleanPath.split('/uploads/')[1]}`;
  }
  return `http://localhost:5005/${cleanPath}`;
};

const GalleryCard = ({ img, onSelect }) => {
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

          <button className="w-10 h-10 rounded-full bg-accent-500 text-white flex items-center justify-center shadow-lg transform hover:scale-110 active:scale-95 transition-all">
            <Maximize2 size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

const Gallery = () => {
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

  // Consolidate all tags
  const allTags = useMemo(() => {
    const tagsSet = new Set(["All"]);
    images.forEach(img => {
      img.tags?.forEach(tag => tagsSet.add(tag));
    });
    return Array.from(tagsSet);
  }, [images]);

  // Filter images
  const filteredImages = images.filter(img => {
    const matchesTag = activeTag === "All" || img.tags?.includes(activeTag);
    const matchesSearch = img.title?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          img.keywords?.some(k => k.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesTag && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-gray-900 overflow-x-hidden pt-28 pb-32 font-body">
      
      {/* ------------------------------------------------------------------ */}
      {/*                        HEADER SECTION                             */}
      {/* ------------------------------------------------------------------ */}
      <section className="max-w-7xl mx-auto px-6 mb-16 space-y-12">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8 border-b border-gray-100 pb-12">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-accent-50 text-accent-700 text-[10px] font-black uppercase tracking-[0.2em] border border-accent-100">
              <ImageIcon size={14} className="text-accent-500" />
              <span>Visual Chronology</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-black text-primary-950 tracking-tighter leading-none">
              CAPTURED <br /> <span className="text-accent-500 italic lowercase tracking-tight">moments.</span>
            </h1>
          </div>
          <p className="max-w-md text-gray-400 font-medium text-lg leading-snug">
            A window into the vibrant life at SBS Badhwana—where every frame tells a story of discovery and growth.
          </p>
        </div>

        {/* CONTROLS */}
        <div className="flex flex-col md:flex-row items-center gap-6">
          <div className="relative flex-1 group w-full">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-accent-500 transition-colors" size={20} />
            <input 
              type="text" 
              placeholder="Search by keyword or title..."
              className="w-full pl-14 pr-8 py-5 bg-white border border-gray-100 rounded-2xl shadow-sm focus:ring-4 focus:ring-accent-100 focus:border-accent-500 transition-all font-medium text-sm outline-none"
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
                  ? "bg-primary-950 text-white shadow-xl shadow-primary-950/20" 
                  : "bg-white text-gray-400 hover:text-primary-950 hover:bg-gray-50 border border-gray-100"
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/*                        GALLERY GRID                               */}
      {/* ------------------------------------------------------------------ */}
      <section className="max-w-7xl mx-auto px-6">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className="aspect-square bg-white rounded-[2rem] border border-gray-50 animate-pulse flex flex-col p-4 gap-4">
                 <div className="w-full h-full bg-gray-50 rounded-2xl"></div>
                 <div className="h-4 w-1/2 bg-gray-50 rounded-full"></div>
              </div>
            ))}
          </div>
        ) : filteredImages.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 space-y-6 opacity-40">
            <ImageIcon size={64} className="text-gray-300" />
            <p className="text-xl font-bold uppercase tracking-widest text-gray-400 text-center">No memories found matching your search.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {filteredImages.map((img) => (
              <GalleryCard key={img._id} img={img} onSelect={setSelected} />
            ))}
          </div>
        )}
      </section>

      {/* ------------------------------------------------------------------ */}
      {/*                        LIGHTBOX MODAL                             */}
      {/* ------------------------------------------------------------------ */}
      {selected && (
        <div 
          className="fixed inset-0 bg-white/60 backdrop-blur-md z-[9999] flex items-center justify-center p-4 md:p-10 animate-fade-in"
          onClick={() => setSelected(null)}
        >
          <button 
            className="absolute top-6 right-6 md:top-10 md:right-10 w-12 h-12 md:w-14 md:h-14 rounded-full bg-primary-950 text-white flex items-center justify-center hover:bg-accent-500 transition-all shadow-2xl z-[10000]"
            onClick={() => setSelected(null)}
          >
            <X size={24} />
          </button>

          <div 
            className="max-w-6xl w-full max-h-[90vh] flex flex-col lg:flex-row gap-0 bg-white rounded-[2.5rem] md:rounded-[3rem] overflow-hidden shadow-[0_50px_100px_-20px_rgba(0,0,0,0.25)] border border-gray-100 animate-fade-up"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Image Section */}
            <div className="lg:w-2/3 h-[50vh] lg:h-[80vh] bg-gray-50 flex items-center justify-center p-8">
               <img
                 src={getImageUrl(selected.url)}
                 alt={selected.title}
                 className="max-w-full max-h-full object-contain rounded-2xl"
               />
            </div>

            {/* Info Section */}
            <div className="lg:w-1/3 flex flex-col justify-between p-12 bg-white relative">
               <div className="space-y-8">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-accent-50 flex items-center justify-center text-accent-500">
                      <Sparkles size={20} />
                    </div>
                    <span className="font-black text-[10px] uppercase tracking-[0.2em] text-accent-600">Memory Details</span>
                  </div>
                  
                  <div className="space-y-4">
                    <h2 className="text-4xl lg:text-5xl font-black text-primary-950 leading-none tracking-tighter">
                       {selected.title}
                    </h2>
                    <p className="text-gray-500 text-lg leading-relaxed font-medium">
                       {selected.caption || "A special moment captured at SBS Badhwana, reflecting our commitment to excellence and vibrant student life."}
                    </p>
                  </div>

                  <div className="space-y-6 pt-4">
                    <div className="flex-1">
                       <p className="text-[10px] font-black uppercase tracking-widest text-gray-300 mb-2">Captured On</p>
                       <p className="text-primary-900 font-bold text-lg flex items-center gap-2">
                         <Calendar size={18} className="text-accent-500" />
                         {new Date(selected.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                       </p>
                    </div>

                    <div className="space-y-3">
                       <p className="text-[10px] font-black uppercase tracking-widest text-gray-300">Tags</p>
                       <div className="flex flex-wrap gap-2">
                          {selected.tags?.map((tag, i) => (
                             <div key={i} className="px-4 py-2 bg-gray-50 border border-gray-100 rounded-xl text-[10px] font-black text-gray-400 uppercase tracking-wider">
                                {tag}
                             </div>
                          ))}
                       </div>
                    </div>
                  </div>
               </div>

               <div className="pt-12">
                  <button className="w-full py-5 bg-primary-950 text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-accent-500 hover:-translate-y-1 transition-all shadow-xl shadow-primary-950/10">
                     Share this memory
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
