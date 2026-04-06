import React, { useState, useEffect } from "react";
import { 
  Upload, 
  Trash2, 
  X, 
  Image as ImageIcon,
  Loader2,
  Tag as TagIcon,
  Search
} from "lucide-react";
import { toast } from "react-toastify";
import useAuthStore from "../../stores/authStore.js";
import adminService from "../../api/adminService";

const AdminGallery = () => {
  const { token } = useAuthStore();
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  
  // Form State
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [title, setTitle] = useState("");
  const [caption, setCaption] = useState("");
  const [tags, setTags] = useState("");
  const [keywords, setKeywords] = useState("");

  const fetchImages = async () => {
    try {
      const data = await adminService.getGalleryImages(token);
      setImages(data || []);
      setLoading(false);
    } catch (error) {
      toast.error("Archive sync failure.");
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchImages();
  }, [token]);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file || !title) {
      toast.error("Protocol Violation: Missing Metadata.");
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append("image", file);
    formData.append("title", title);
    formData.append("caption", caption);
    formData.append("tags", tags); // Backend handles split
    formData.append("keywords", keywords); // Backend handles split

    try {
      const data = await adminService.uploadGalleryImage(formData, token);
      toast.success("Asset Committed.");
      setImages([data.image, ...images]);
      setFile(null); setPreview(null); setTitle(""); setCaption(""); setTags(""); setKeywords("");
    } catch (error) {
      toast.error("Critical System Error.");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await adminService.deleteGalleryImage(id, token);
      toast.success("Record Redacted.");
      setImages(images.filter(img => img._id !== id));
    } catch (error) {
      toast.error("Operation Failed.");
    }
  };

  const getImageUrl = (url) => {
    if (!url) return "";
    const cleanPath = url.replace(/\\/g, '/');
    if (cleanPath.includes('/uploads/')) {
       return `http://localhost:5005/uploads/${cleanPath.split('/uploads/')[1]}`;
    }
    return `http://localhost:5005/${cleanPath}`;
  };

  return (
    <div className="min-h-screen bg-gray-50/50 space-y-12 pb-24 relative overflow-hidden">
      {/* Watermark */}
      <div className="absolute top-20 left-1/2 -translate-x-1/2 text-[20vw] font-black text-gray-100/50 pointer-events-none select-none tracking-tighter uppercase whitespace-nowrap">
        RECORDS
      </div>

      <header className="px-8 md:px-14 pt-16 flex flex-col md:flex-row justify-between items-start md:items-end gap-8 relative z-10">
         <div className="space-y-4">
            <div className="flex items-center gap-3">
               <div className="w-2 h-2 rounded-full bg-accent-500"></div>
               <span className="text-[10px] font-black uppercase tracking-[0.5em] text-gray-400">Institutional Archive</span>
            </div>
            <h1 className="text-5xl md:text-8xl font-black tracking-tighter leading-none text-primary-950">
              Gallery <span className="text-gray-200">Suite.</span>
            </h1>
         </div>
      </header>

      <div className="px-8 md:px-14 space-y-12 relative z-10">
        {/* Upload Segment */}
        <div className="bg-white rounded-3xl p-8 md:p-12 border border-gray-100 shadow-sm relative overflow-hidden">
            <div className="flex flex-col lg:flex-row gap-12">
                <div className="lg:w-1/3">
                    <div 
                        className={`relative aspect-square rounded-2xl border-2 border-dashed transition-all flex flex-col items-center justify-center gap-4 overflow-hidden select-none cursor-pointer ${
                            preview ? "border-accent-500 bg-accent-500/5" : "border-gray-100 hover:border-accent-200 bg-gray-50/50"
                        }`}
                    >
                        <input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer z-20" onChange={handleFileChange} />
                        {preview ? (
                            <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                        ) : (
                            <div className="text-center space-y-2 pointer-events-none">
                                <ImageIcon size={24} className="mx-auto text-gray-300" />
                                <p className="text-[9px] font-black uppercase tracking-widest text-gray-400">Upload Asset</p>
                            </div>
                        )}
                    </div>
                </div>

                <div className="lg:w-2/3 space-y-8">
                    <div className="grid md:grid-cols-2 gap-8">
                        <div className="space-y-2">
                            <label className="text-[9px] font-black uppercase tracking-widest text-gray-400 ml-1">Archive Title</label>
                            <input type="text" placeholder="Protocol Label" className="w-full px-6 py-4 bg-gray-50 rounded-xl font-bold text-sm outline-none focus:ring-4 focus:ring-accent-50 border border-transparent focus:border-accent-200 transition-all font-sans" value={title} onChange={(e) => setTitle(e.target.value)} />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[9px] font-black uppercase tracking-widest text-gray-400 ml-1">Description (Caption)</label>
                            <input type="text" placeholder="Institutional Context" className="w-full px-6 py-4 bg-gray-50 rounded-xl font-bold text-sm outline-none focus:ring-4 focus:ring-accent-50 border border-transparent focus:border-accent-200 transition-all font-sans" value={caption} onChange={(e) => setCaption(e.target.value)} />
                        </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8">
                        <div className="space-y-2">
                            <label className="text-[9px] font-black uppercase tracking-widest text-gray-400 ml-1">Tags (Comma Separated)</label>
                            <div className="relative group">
                                <TagIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-accent-500 transition-colors" size={16} />
                                <input type="text" placeholder="Sports, Annual, Academic" className="w-full pl-12 pr-6 py-4 bg-gray-50 rounded-xl font-bold text-sm outline-none focus:ring-4 focus:ring-accent-50 border border-transparent focus:border-accent-200 transition-all font-sans" value={tags} onChange={(e) => setTags(e.target.value)} />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[9px] font-black uppercase tracking-widest text-gray-400 ml-1">Keywords (Comma Separated)</label>
                            <div className="relative group">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-accent-500 transition-colors" size={16} />
                                <input type="text" placeholder="Action, Goal, Win" className="w-full pl-12 pr-6 py-4 bg-gray-50 rounded-xl font-bold text-sm outline-none focus:ring-4 focus:ring-accent-50 border border-transparent focus:border-accent-200 transition-all font-sans" value={keywords} onChange={(e) => setKeywords(e.target.value)} />
                            </div>
                        </div>
                    </div>

                    <button 
                        onClick={handleUpload}
                        disabled={uploading}
                        className="w-full py-5 bg-primary-950 text-white rounded-2xl font-black uppercase tracking-[0.3em] text-[10px] hover:bg-accent-500 transition-all shadow-lg disabled:opacity-50 flex items-center justify-center gap-4 group"
                    >
                        {uploading ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
                        <span>Commit Asset</span>
                    </button>
                </div>
            </div>
        </div>

        {/* List Segment */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {loading ? (
                <div className="col-span-full text-center py-20 text-gray-300 font-black uppercase tracking-widest text-[10px]">Syncing Archives...</div>
            ) : images.map((img) => (
                <div key={img._id} className="group relative aspect-square bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-700">
                    <img src={getImageUrl(img.url)} alt={img.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" />
                    
                    {/* Tags Badge in List */}
                    <div className="absolute top-4 left-4 z-10 flex flex-wrap gap-1">
                        {img.tags?.slice(0, 2).map((t, i) => (
                            <span key={i} className="px-2 py-1 bg-white/90 backdrop-blur-md rounded-md text-[7px] font-black text-primary-950 uppercase tracking-widest border border-white/20">
                                {t}
                            </span>
                        ))}
                    </div>

                    <div className="absolute inset-0 bg-primary-950/80 opacity-0 group-hover:opacity-100 transition-opacity duration-500 backdrop-blur-sm flex flex-col justify-end p-6 text-white space-y-4">
                        <div className="space-y-1">
                            <h4 className="text-sm font-black tracking-tighter uppercase leading-tight">{img.title}</h4>
                            <p className="text-[8px] font-bold text-gray-400 line-clamp-1 italic">{img.caption}</p>
                        </div>
                        <button onClick={() => handleDelete(img._id)} className="w-full p-3 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-all text-[10px] font-black uppercase tracking-widest">Redact</button>
                    </div>
                </div>
            ))}
        </div>
      </div>
    </div>
  );
};

export default AdminGallery;
