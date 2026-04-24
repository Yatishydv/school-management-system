import React, { useState, useEffect, useRef } from "react";
import { 
  Monitor, 
  Layout, 
  Image as ImageIcon, 
  Users, 
  MessageSquare, 
  Phone, 
  Globe, 
  ShieldCheck, 
  Save, 
  Upload, 
  Plus, 
  Trash2, 
  Loader2,
  Sparkles,
  Award,
  BookOpen,
  CheckCircle,
  FileText,
  Search,
  Trophy,
  Mail,
  Calendar,
  Zap,
  Star,
  Compass,
  Headphones,
  Instagram,
  Facebook,
  Twitter,
  MessageCircle,
  Youtube,
  Linkedin,
  MapPin,
  Clock,
  Copyright,
  Eye,
  Settings2,
  Palette,
  LayoutTemplate,
  Target,
  Info,
  EyeOff,
  Smartphone,
  Tablet,
  X,
  ArrowLeft,
  MousePointerClick,
  RotateCcw,
  TrendingUp,
  HelpCircle,
  Quote
} from "lucide-react";
import { toast } from "react-toastify";
import useAuthStore from "../../stores/authStore.js";
import adminService from "../../api/adminService";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import { useSiteSettings, INITIAL_SETTINGS, mergeSettings } from "../../context/SiteSettingsContext";


// --- SHARED UI COMPONENTS (REVAMP 2.0) ---
const SidebarBtn = ({ id, activeTab, setActiveTab, icon: Icon, label }) => (
    <button 
        onClick={() => setActiveTab(id)}
        className={`shrink-0 flex items-center gap-2.5 px-4 py-2.5 rounded-lg transition-all duration-200 group relative ${
            activeTab === id 
            ? "bg-white text-primary-950 shadow-sm border border-gray-200/60" 
            : "text-gray-500 hover:bg-gray-200/50 hover:text-primary-950 border border-transparent"
        }`}
    >
        <Icon size={14} className={activeTab === id ? "text-accent-500" : "text-gray-400 group-hover:text-primary-900"} />
        <span className="text-[11px] font-bold uppercase tracking-wider">{label}</span>
    </button>
);

const SectionHeader = ({ icon: Icon, title }) => (
    <div className="flex items-center gap-4 mb-6 border-b border-gray-100 pb-5">
        <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-primary-950 border border-gray-100">
            <Icon size={20} />
        </div>
        <div className="space-y-0.5">
            <h3 className="text-xl font-bold text-primary-950 tracking-tight">{title}</h3>
            <p className="text-xs text-gray-400 font-medium tracking-tight">Institutional Configuration</p>
        </div>
    </div>
);

const ImagePicker = ({ label, value, path, handleImageUpload, getImageUrl, uploadingImage }) => (
    <div className="space-y-3 p-5 bg-white rounded-2xl border border-gray-200 group transition-all">
        <label className="text-[13px] font-semibold text-gray-500 ml-1">{label}</label>
        <div className="flex flex-col items-center text-center gap-4">
            <div className="w-24 h-24 bg-gray-50 rounded-2xl border border-gray-100 flex items-center justify-center overflow-hidden shrink-0 shadow-inner group-hover:border-accent-100 transition-all">
                {value ? (
                    <img src={getImageUrl(value)} className="w-full h-full object-cover" />
                ) : (
                    <ImageIcon size={24} className="text-gray-300" />
                )}
            </div>
            <div className="flex-1 space-y-3">
                <div className="relative">
                    <button className="w-full px-5 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-700 hover:bg-primary-950 hover:text-white transition-all flex items-center justify-center gap-2">
                        {uploadingImage ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />} 
                        {value ? "Change Asset" : "Upload Asset"}
                    </button>
                    <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => handleImageUpload(e.target.files[0], path)} />
                </div>
                <p className="text-[11px] text-gray-400 font-medium">Recommended: WebP, max 2MB.</p>
            </div>
        </div>
    </div>
);

const Toggle = ({ label, value, onChange }) => (
    <div className="flex items-center justify-between p-6 bg-white rounded-2xl border border-gray-200 hover:border-gray-300 transition-all group">
        <div className="space-y-0.5">
            <span className="text-sm font-bold text-primary-950 block">{label}</span>
            <span className="text-[11px] text-gray-400 font-medium uppercase tracking-wider">{value ? "Visible" : "Hidden"}</span>
        </div>
        <button 
            onClick={() => onChange(!value)}
            className={`w-12 h-6.5 rounded-full transition-all relative p-1 leading-none ${value ? "bg-accent-600" : "bg-gray-200"}`}
        >
            <div className={`w-4.5 h-4.5 rounded-full bg-white transition-all shadow-sm ${value ? "translate-x-5.5" : "translate-x-0"}`}></div>
        </button>
    </div>
);

const AdminSiteEditor = () => {
    const { token } = useAuthStore();
    const { settings: globalSettings, setSettings: setGlobalSettings } = useSiteSettings();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [activeTab, setActiveTab] = useState("global"); 
    const [settings, setSettings] = useState(null);
    const [uploadingImage, setUploadingImage] = useState(false);
    const [showPreview, setShowPreview] = useState(true);
    const [previewDevice, setPreviewDevice] = useState("desktop"); 
    const [zoom, setZoom] = useState(null); 
    const [pan, setPan] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const [lastPos, setLastPos] = useState({ x: 0, y: 0 });
    const [containerWidth, setContainerWidth] = useState(0);
    const [containerHeight, setContainerHeight] = useState(0);
    const [previewUrl, setPreviewUrl] = useState("/");
    const containerRef = useRef(null);
    const iframeRef = useRef(null);

    useEffect(() => {
        if (!containerRef.current) return;
        const observer = new ResizeObserver((entries) => {
            for (let entry of entries) {
                setContainerWidth(entry.contentRect.width);
                setContainerHeight(entry.contentRect.height);
            }
        });
        observer.observe(containerRef.current);
        return () => observer.disconnect();
    }, [showPreview]);

    const handleMouseDown = (e) => {
        if (e.button !== 0 || e.target.tagName === 'BUTTON' || e.target.tagName === 'INPUT') return;
        setIsDragging(true);
        setLastPos({ x: e.clientX, y: e.clientY });
    };

    const handleMouseMove = (e) => {
        if (!isDragging) return;
        const dx = e.clientX - lastPos.x;
        const dy = e.clientY - lastPos.y;
        setPan(prev => ({ x: prev.x + dx, y: prev.y + dy }));
        setLastPos({ x: e.clientX, y: e.clientY });
    };

    const handleMouseUp = () => setIsDragging(false);

    const handleTabChange = (id) => {
        setActiveTab(id);
        const urlMap = {
            home: "/",
            about: "/about",
            admissions: "/admissions",
            contact: "/contact",
            gallery: "/gallery",
        };
        if (urlMap[id]) setPreviewUrl(urlMap[id]);
    };

    const fetchSettings = async () => {
        try {
            const data = await adminService.getSiteSettings(token);
            const merged = mergeSettings(INITIAL_SETTINGS, data);
            setSettings(merged);
            setLoading(false);
        } catch (error) {
            toast.error("Failed to sync site configurations.");
            setLoading(false);
        }
    };

    useEffect(() => {
        if (token) fetchSettings();
    }, [token]);

    useEffect(() => {
        if (showPreview && iframeRef.current && settings) {
            iframeRef.current.contentWindow.postMessage({
                type: 'LIVE_PREVIEW_UPDATE',
                settings: settings
            }, '*');
        }
    }, [settings, showPreview]);

    const [selectedElement, setSelectedElement] = useState(null);

    const getNestedField = (obj, path) => {
        if (!obj || !path) return "";
        return path.split('.').reduce((acc, part) => acc && acc[part], obj);
    };

    useEffect(() => {
        const handleMessage = (e) => {
            if (e.data?.type === 'IFRAME_READY') {
                if (iframeRef.current && settings) {
                    iframeRef.current.contentWindow.postMessage({
                        type: 'LIVE_PREVIEW_UPDATE',
                        settings: settings
                    }, '*');
                }
            } else if (e.data?.type === 'LIVE_INLINE_UPDATE') {
                setSettings(prev => {
                    const newSettings = JSON.parse(JSON.stringify(prev));
                    const keys = e.data.path.split('.');
                    let current = newSettings;
                    for (let i = 0; i < keys.length - 1; i++) {
                        if (!current[keys[i]]) current[keys[i]] = {};
                        current = current[keys[i]];
                    }
                    current[keys[keys.length - 1]] = e.data.value;
                    return newSettings;
                });
            } else if (e.data?.type === 'LIVE_FOCUS_FIELD') {
                setActiveTab(null);
                setSelectedElement({
                    type: e.data.elementType,
                    path: e.data.path,
                    label: e.data.label
                });
            }
        };
        window.addEventListener('message', handleMessage);
        return () => window.removeEventListener('message', handleMessage);
    }, [settings]);

    const handleUpdate = async () => {
        setSaving(true);
        try {
            const updated = await adminService.updateSiteSettings(settings, token);
            setGlobalSettings(updated);
            toast.success("Site configuration committed successfully.");
        } catch (error) {
            toast.error("Protocol failure: Could not update records.");
        } finally {
            setSaving(false);
        }
    };

    const handleImageUpload = async (file, fieldPath) => {
        if (!file) return;
        setUploadingImage(true);
        const formData = new FormData();
        formData.append("image", file);
        try {
            const data = await adminService.uploadSiteImage(formData, token);
            const pathParts = fieldPath.split('.');
            setSettings(prev => {
                const newSettings = JSON.parse(JSON.stringify(prev));
                let current = newSettings;
                for (let i = 0; i < pathParts.length - 1; i++) {
                    if (!current[pathParts[i]]) current[pathParts[i]] = {};
                    current = current[pathParts[i]];
                }
                current[pathParts[pathParts.length - 1]] = data.url;
                return newSettings;
            });
            toast.success("Asset uploaded and linked.");
        } catch (error) {
            toast.error("Media upload failed.");
        } finally {
            setUploadingImage(false);
        }
    };

    const getImageUrl = (url) => {
        if (!url) return "";
        if (url.startsWith('http')) return url;
        const cleanPath = url.replace(/\\/g, '/');
        return `http://localhost:5005/${cleanPath}`;
    };

    const updateNestedField = (path, value) => {
        const pathParts = path.split('.');
        setSettings(prev => {
            const newSettings = JSON.parse(JSON.stringify(prev));
            let current = newSettings;
            for (let i = 0; i < pathParts.length - 1; i++) {
                const part = pathParts[i];
                // If the current part doesn't exist OR it is not an object (e.g. it's a legacy string),
                // we must convert/initialize it as an object to allow further nesting.
                if (!current[part] || typeof current[part] !== 'object') {
                    current[part] = {};
                }
                current = current[part];
            }
            current[pathParts[pathParts.length - 1]] = value;
            return newSettings;
        });
    };

    if (loading || !settings) return (
        <div className="flex items-center justify-center min-h-[60vh]">
            <Loader2 className="w-12 h-12 text-accent-500 animate-spin" />
        </div>
    );

    return (
        <div className="h-screen w-full flex overflow-hidden bg-gray-50 font-sans">
            <aside className={`h-full bg-white border-r border-gray-200 flex flex-col shrink-0 transition-all duration-300 ${showPreview ? "w-[400px] xl:w-[480px]" : "w-full max-w-4xl mx-auto border-x shadow-2xl"}`}>
                
                <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between bg-primary-950 text-white relative z-20 shadow-md">
                    <div className="flex items-center gap-3">
                        <button onClick={() => window.location.href = '/admin/dashboard'} className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all">
                            <X size={16} />
                        </button>
                        <div>
                            <h2 className="text-sm font-bold tracking-tight">Site Editor</h2>
                            <p className="text-[10px] text-white/60 uppercase tracking-widest font-bold">Live Editor</p>
                        </div>
                    </div>
                    <button onClick={handleUpdate} disabled={saving} className="bg-accent-500 text-white px-5 py-2.5 rounded-lg flex items-center gap-2 hover:bg-accent-400 transition-all shadow-lg disabled:opacity-50 text-xs font-bold">
                        {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                        Save
                    </button>
                </div>

                {!selectedElement ? (
                    <div className="flex border-b border-gray-100 overflow-x-auto no-scrollbar bg-gray-50/50 p-3 gap-2 relative z-10 shrink-0 shadow-inner">
                        <SidebarBtn id="global" activeTab={activeTab} setActiveTab={handleTabChange} icon={Globe} label="Global" />
                        <SidebarBtn id="theme" activeTab={activeTab} setActiveTab={handleTabChange} icon={Palette} label="Theme" />
                        <SidebarBtn id="layout" activeTab={activeTab} setActiveTab={handleTabChange} icon={LayoutTemplate} label="Layout" />
                        <SidebarBtn id="home" activeTab={activeTab} setActiveTab={handleTabChange} icon={Monitor} label="Home" />
                        <SidebarBtn id="about" activeTab={activeTab} setActiveTab={handleTabChange} icon={BookOpen} label="About" />
                        <SidebarBtn id="admissions" activeTab={activeTab} setActiveTab={handleTabChange} icon={FileText} label="Admissions" />
                        <SidebarBtn id="contact" activeTab={activeTab} setActiveTab={handleTabChange} icon={Phone} label="Contact" />
                        <SidebarBtn id="footer" activeTab={activeTab} setActiveTab={handleTabChange} icon={Copyright} label="Footer" />
                        <SidebarBtn id="gallery" activeTab={activeTab} setActiveTab={handleTabChange} icon={ImageIcon} label="Gallery" />
                    </div>
                ) : (
                    <div className="flex border-b border-gray-100 bg-gray-50/50 p-4 relative z-10 shrink-0 shadow-inner items-center gap-3">
                        <button onClick={() => { setSelectedElement(null); setActiveTab(null); }} className="p-2 rounded-lg bg-white border border-gray-200 hover:bg-gray-100 transition-all flex items-center justify-center">
                            <ArrowLeft size={16} className="text-gray-600" />
                        </button>
                        <div>
                            <h3 className="text-sm font-black tracking-tight text-primary-950">{selectedElement.label || "Inspector"}</h3>
                            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">{selectedElement.type} Settings</p>
                        </div>
                    </div>
                )}

                <main className="flex-1 overflow-y-auto p-6 space-y-8 bg-gray-50/50 scroll-smooth flex flex-col relative">
                        
                        {selectedElement && (
                            <div className="animate-fade-up space-y-6 flex-1">
                                <section className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm space-y-6">
                                    {selectedElement.type === "text" && (
                                        <div className="space-y-4">
                                            <label className="text-xs font-bold text-gray-600 uppercase tracking-widest">{selectedElement.label}</label>
                                            {(() => {
                                                const rawValue = getNestedField(settings, selectedElement.path);
                                                // Check if we are dealing with an object (new format) or string (legacy format)
                                                const isObject = rawValue && typeof rawValue === 'object' && !Array.isArray(rawValue);
                                                const isStructuredSection = selectedElement.path === 'about.mission' || selectedElement.path === 'about.vision';
                                                
                                                if (isObject || isStructuredSection) {
                                                    // Use the same fallbacks as the AboutPage to avoid "empty" editors when defaults are active
                                                    const fallbacks = {
                                                        'about.mission': { 
                                                            title: "The Mission", 
                                                            content: "To provide an inclusive, stimulating environment that fosters curiosity and academic excellence." 
                                                        },
                                                        'about.vision': { 
                                                            title: "The Vision", 
                                                            content: "To be a global leader in transformative education, shaping character and competence." 
                                                        }
                                                    };
                                                    
                                                    const defaultVal = fallbacks[selectedElement.path] || { title: "", content: "" };
                                                    const current = isObject ? rawValue : { 
                                                        title: typeof rawValue === 'string' ? "" : defaultVal.title, 
                                                        content: typeof rawValue === 'string' ? rawValue : defaultVal.content 
                                                    };
                                                    
                                                    return (
                                                        <div className="space-y-4 bg-gray-50 p-6 rounded-2xl border border-gray-100">
                                                            <Input label="Section Heading" value={current.title || ""} onChange={(e) => {
                                                                updateNestedField(selectedElement.path, { ...current, title: e.target.value });
                                                            }} />
                                                            <div className="space-y-2">
                                                               <label className="text-[11px] font-bold text-gray-400 uppercase tracking-tight ml-1">Main Content Description</label>
                                                               <textarea 
                                                                   className="w-full px-5 py-4 bg-white rounded-xl border border-gray-200 text-sm font-medium text-gray-900 outline-none focus:ring-2 focus:ring-accent-500/20 focus:border-accent-500 transition-all min-h-[150px]"
                                                                   style={{ color: '#111827 !important', WebkitTextFillColor: '#111827' }}
                                                                   value={current.content || ""}
                                                                   onChange={(e) => {
                                                                       updateNestedField(selectedElement.path, { ...current, content: e.target.value });
                                                                   }}
                                                               />
                                                            </div>
                                                        </div>
                                                    );
                                                } else {
                                                    return (
                                                        <textarea 
                                                            className="w-full px-5 py-4 bg-gray-50 rounded-xl border border-gray-200 text-sm font-medium text-primary-950 outline-none focus:ring-2 focus:ring-accent-500/20 focus:border-accent-500 transition-all min-h-[250px]"
                                                            value={typeof rawValue === 'string' ? rawValue : ""}
                                                            onChange={(e) => updateNestedField(selectedElement.path, e.target.value)}
                                                        />
                                                    );
                                                }
                                            })()}
                                        </div>
                                    )}
                                    {selectedElement.type === "image" && (
                                        <ImagePicker label={selectedElement.label} value={getNestedField(settings, selectedElement.path)} path={selectedElement.path} handleImageUpload={handleImageUpload} getImageUrl={getImageUrl} uploadingImage={uploadingImage} />
                                    )}
                                    {selectedElement.type === "badge" && (
                                        <div className="space-y-6">
                                            <div className="flex items-center gap-2 mb-2">
                                                <div className="w-1.5 h-6 bg-accent-500 rounded-full"></div>
                                                <label className="text-xs font-bold text-gray-900 uppercase tracking-widest">{selectedElement.label}</label>
                                            </div>
                                            <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 space-y-6">
                                                <Input 
                                                    label="Badge Text" 
                                                    value={typeof getNestedField(settings, selectedElement.path) === 'string' ? getNestedField(settings, selectedElement.path) : (getNestedField(settings, selectedElement.path)?.text || "")} 
                                                    onChange={(e) => {
                                                        const current = getNestedField(settings, selectedElement.path);
                                                        if (typeof current === 'string') {
                                                            updateNestedField(selectedElement.path, { text: e.target.value, icon: "Sparkles", color: "#10b981" });
                                                        } else {
                                                            updateNestedField(selectedElement.path, { ...(current || {}), text: e.target.value });
                                                        }
                                                    }} 
                                                />
                                                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-100">
                                                    <div className="space-y-3">
                                                       <label className="text-[11px] font-bold text-gray-400 uppercase tracking-tight ml-1">Badge Icon</label>
                                                       <select 
                                                            className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm font-medium outline-none focus:border-accent-500 transition-all" 
                                                            value={(typeof getNestedField(settings, selectedElement.path) === 'object' ? getNestedField(settings, selectedElement.path)?.icon : null) || "Sparkles"} 
                                                            onChange={(e) => {
                                                                const current = getNestedField(settings, selectedElement.path);
                                                                if (typeof current === 'string') {
                                                                    updateNestedField(selectedElement.path, { text: current, icon: e.target.value, color: "#10b981" });
                                                                } else {
                                                                    updateNestedField(selectedElement.path, { ...(current || {}), icon: e.target.value });
                                                                }
                                                            }}
                                                        >
                                                           <option value="Star">Star</option>
                                                           <option value="Sparkles">Sparkles</option>
                                                           <option value="Trophy">Trophy</option>
                                                           <option value="Award">Award</option>
                                                           <option value="Target">Target</option>
                                                           <option value="Zap">Zap</option>
                                                           <option value="ShieldCheck">Shield</option>
                                                           <option value="History">History</option>
                                                           <option value="Globe">Globe</option>
                                                           <option value="TrendingUp">Trend</option>
                                                           <option value="BookOpen">Education</option>
                                                       </select>
                                                    </div>
                                                    <div className="space-y-3">
                                                       <label className="text-[11px] font-bold text-gray-400 uppercase tracking-tight ml-1">Icon Style</label>
                                                       <div className="flex items-center gap-3">
                                                           <input 
                                                                type="color" 
                                                                value={(typeof getNestedField(settings, selectedElement.path) === 'object' ? getNestedField(settings, selectedElement.path)?.color : null) || "#10b981"} 
                                                                onChange={(e) => {
                                                                    const current = getNestedField(settings, selectedElement.path);
                                                                    if (typeof current === 'string') {
                                                                        updateNestedField(selectedElement.path, { text: current, icon: "Sparkles", color: e.target.value });
                                                                    } else {
                                                                        updateNestedField(selectedElement.path, { ...(current || {}), color: e.target.value });
                                                                    }
                                                                }} 
                                                                className="w-12 h-11 rounded-lg border border-gray-200 p-1 bg-white cursor-pointer" 
                                                            />
                                                           <div className="text-[10px] font-bold text-gray-400 uppercase leading-tight">Pick<br/>Color</div>
                                                       </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                    {selectedElement.type === "stats" && (
                                        <div className="space-y-6">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-1.5 h-6 bg-accent-500 rounded-full"></div>
                                                    <label className="text-xs font-bold text-gray-900 uppercase tracking-widest">{selectedElement.label}</label>
                                                </div>
                                                <button onClick={() => {
                                                    const newStats = [...(getNestedField(settings, selectedElement.path) || []), { label: "New Stat", value: "0", icon: "Star" }];
                                                    updateNestedField(selectedElement.path, newStats);
                                                }} className="px-3 py-1.5 bg-accent-50 text-accent-700 text-[10px] font-black uppercase tracking-widest rounded-lg hover:bg-accent-100 transition-colors">Add Stat</button>
                                            </div>
                                            {(Array.isArray(getNestedField(settings, selectedElement.path)) ? getNestedField(settings, selectedElement.path) : []).map((stat, idx) => (
                                                <div key={idx} className="bg-gray-50 p-5 rounded-xl border border-gray-100 relative group">
                                                    <button onClick={() => {
                                                        const currentStats = getNestedField(settings, selectedElement.path);
                                                        const newStats = currentStats.filter((_, i) => i !== idx);
                                                        updateNestedField(selectedElement.path, newStats);
                                                    }} className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-all text-red-500 hover:scale-110"><Trash2 size={14} /></button>
                                                    <div className="space-y-4">
                                                        <div className="grid grid-cols-2 gap-3">
                                                            <Input placeholder="Stat Number (e.g. 50+)" value={stat.value} onChange={(e) => {
                                                                const currentStats = [...getNestedField(settings, selectedElement.path)];
                                                                currentStats[idx].value = e.target.value;
                                                                updateNestedField(selectedElement.path, currentStats);
                                                            }} />
                                                            <select className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm font-medium outline-none focus:border-accent-500 transition-colors" value={stat.icon || "Star"} onChange={(e) => {
                                                                const currentStats = [...getNestedField(settings, selectedElement.path)];
                                                                currentStats[idx].icon = e.target.value;
                                                                updateNestedField(selectedElement.path, currentStats);
                                                            }}>
                                                                <option value="TrendingUp">Trend</option>
                                                                <option value="Globe">Globe</option>
                                                                <option value="Users">Users</option>
                                                                <option value="Trophy">Trophy</option>
                                                                <option value="Star">Star</option>
                                                                <option value="Zap">Zap</option>
                                                                <option value="ShieldCheck">Shield</option>
                                                                <option value="History">History</option>
                                                                <option value="BookOpen">Education</option>
                                                            </select>
                                                        </div>
                                                        <Input placeholder="Stat Label" value={stat.label} onChange={(e) => {
                                                            const currentStats = [...getNestedField(settings, selectedElement.path)];
                                                            currentStats[idx].label = e.target.value;
                                                            updateNestedField(selectedElement.path, currentStats);
                                                        }} />
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                    {selectedElement.type === "features" || selectedElement.type === "values" ? (
                                        <div className="space-y-6">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-1.5 h-6 bg-accent-500 rounded-full"></div>
                                                    <label className="text-xs font-bold text-gray-900 uppercase tracking-widest">{selectedElement.label}</label>
                                                </div>
                                                <button onClick={() => {
                                                    const newFeats = [...(getNestedField(settings, selectedElement.path) || []), { title: "New Item", badge: "Core", desc: "Description here", icon: "Star" }];
                                                    updateNestedField(selectedElement.path, newFeats);
                                                }} className="px-3 py-1.5 bg-accent-50 text-accent-700 text-[10px] font-black uppercase tracking-widest rounded-lg hover:bg-accent-100 transition-colors">Add Box</button>
                                            </div>
                                            {(Array.isArray(getNestedField(settings, selectedElement.path)) ? getNestedField(settings, selectedElement.path) : []).map((feat, idx) => (
                                                <div key={idx} className="bg-gray-50 p-5 rounded-xl border border-gray-100 relative group">
                                                    <button onClick={() => {
                                                        const newFeats = getNestedField(settings, selectedElement.path).filter((_, i) => i !== idx);
                                                        updateNestedField(selectedElement.path, newFeats);
                                                    }} className="absolute top-2 right-2 text-red-500 hover:scale-110 opacity-0 group-hover:opacity-100 transition-all"><Trash2 size={14} /></button>
                                                    <div className="space-y-4">
                                                        <div className="grid grid-cols-2 gap-3">
                                                            <Input placeholder="Heading" value={feat.title} onChange={(e) => {
                                                                const newFeats = [...getNestedField(settings, selectedElement.path)];
                                                                newFeats[idx].title = e.target.value;
                                                                updateNestedField(selectedElement.path, newFeats);
                                                            }} />
                                                            <Input placeholder="Badge/Category" value={feat.badge} onChange={(e) => {
                                                                const newFeats = [...getNestedField(settings, selectedElement.path)];
                                                                newFeats[idx].badge = e.target.value;
                                                                updateNestedField(selectedElement.path, newFeats);
                                                            }} />
                                                        </div>
                                                        <select className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm font-medium outline-none focus:border-accent-500 transition-colors" value={feat.icon || "Star"} onChange={(e) => {
                                                            const newFeats = [...getNestedField(settings, selectedElement.path)];
                                                            newFeats[idx].icon = e.target.value;
                                                            updateNestedField(selectedElement.path, newFeats);
                                                        }}>
                                                            <option value="Star">Star</option>
                                                            <option value="BookOpen">Education</option>
                                                            <option value="Users">Community</option>
                                                            <option value="Shield">Security</option>
                                                            <option value="Sparkles">Excellence</option>
                                                            <option value="Target">Mission</option>
                                                            <option value="Award">Achievement</option>
                                                            <option value="Zap">Passion</option>
                                                            <option value="Compass">Empathy</option>
                                                        </select>
                                                        <textarea placeholder="Description..." className="w-full px-4 py-3 bg-white rounded-xl text-sm font-medium border border-gray-200 outline-none focus:border-accent-500 min-h-[80px]" value={feat.desc} onChange={(e) => {
                                                            const newFeats = [...getNestedField(settings, selectedElement.path)];
                                                            newFeats[idx].desc = e.target.value;
                                                            updateNestedField(selectedElement.path, newFeats);
                                                        }} />
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : null}
                                    {selectedElement.type === "list" && (
                                        <div className="space-y-6">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-1.5 h-6 bg-accent-500 rounded-full"></div>
                                                    <label className="text-xs font-bold text-gray-900 uppercase tracking-widest">{selectedElement.label}</label>
                                                </div>
                                                <button onClick={() => {
                                                    const current = getNestedField(settings, selectedElement.path) || [];
                                                    updateNestedField(selectedElement.path, [...current, "New Item"]);
                                                }} className="px-3 py-1.5 bg-accent-50 text-accent-700 text-[10px] font-black uppercase tracking-widest rounded-lg">Add Item</button>
                                            </div>
                                            <div className="space-y-3">
                                                {(Array.isArray(getNestedField(settings, selectedElement.path)) ? getNestedField(settings, selectedElement.path) : []).map((item, idx) => (
                                                    <div key={idx} className="flex gap-2">
                                                        <Input value={item} onChange={(e) => {
                                                            const current = [...getNestedField(settings, selectedElement.path)];
                                                            current[idx] = e.target.value;
                                                            updateNestedField(selectedElement.path, current);
                                                        }} />
                                                        <button onClick={() => {
                                                            const current = getNestedField(settings, selectedElement.path);
                                                            updateNestedField(selectedElement.path, current.filter((_, i) => i !== idx));
                                                        }} className="p-2 text-red-500 hover:scale-110 transition-transform"><Trash2 size={16}/></button>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                    {selectedElement.type === "link" && (
                                        <div className="space-y-6">
                                            <div className="flex items-center gap-2 mb-2">
                                                <div className="w-1.5 h-6 bg-accent-500 rounded-full"></div>
                                                <label className="text-xs font-bold text-gray-900 uppercase tracking-widest">{selectedElement.label}</label>
                                            </div>
                                            <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 space-y-6">
                                                <Input label="Display Text" value={getNestedField(settings, selectedElement.path)?.text || getNestedField(settings, selectedElement.path)?.btnText || ""} onChange={(e) => {
                                                    const current = getNestedField(settings, selectedElement.path) || {};
                                                    const key = current.btnText !== undefined ? "btnText" : "text";
                                                    updateNestedField(selectedElement.path, { ...current, [key]: e.target.value });
                                                }} />
                                                <Input label="Action URL / Page Route" value={getNestedField(settings, selectedElement.path)?.url || ""} onChange={(e) => {
                                                    const current = getNestedField(settings, selectedElement.path) || {};
                                                    updateNestedField(selectedElement.path, { ...current, url: e.target.value });
                                                }} />
                                            </div>
                                        </div>
                                    )}
                                </section>
                            </div>
                        )}

                        {!selectedElement && !activeTab && (
                            <div className="flex-1 flex flex-col items-center justify-center text-center p-8 mt-20 space-y-4">
                                <div className="w-16 h-16 bg-white rounded-2xl shadow-sm border border-gray-200 flex items-center justify-center">
                                    <MousePointerClick size={24} className="text-accent-500 animate-bounce" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-black tracking-tight text-primary-950">Visual Editor Active</h3>
                                    <p className="text-sm text-gray-500 font-medium max-w-[250px] mx-auto mt-2 leading-relaxed">Click any element on the canvas to edit its properties.</p>
                                </div>
                            </div>
                        )}
                        
                        {activeTab === "theme" && (
                            <div className="animate-fade-up space-y-8">
                                <section className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm space-y-6">
                                    <SectionHeader icon={Palette} title="Theme Engine" />
                                    <div className="grid grid-cols-1 gap-6">
                                        <div className="space-y-4">
                                            <label className="text-[13px] font-semibold text-gray-500">Primary Color</label>
                                            <div className="flex items-center gap-3">
                                                <input type="color" value={settings.theme?.primaryColor || "#0a0a0a"} onChange={(e) => updateNestedField("theme.primaryColor", e.target.value)} className="w-16 h-14 rounded-xl border border-gray-200 p-1 bg-white cursor-pointer" />
                                                <Input value={settings.theme?.primaryColor || "#0a0a0a"} onChange={(e) => updateNestedField("theme.primaryColor", e.target.value)} />
                                            </div>
                                        </div>
                                        <div className="space-y-4">
                                            <label className="text-[13px] font-semibold text-gray-500">Accent Color</label>
                                            <div className="flex items-center gap-3">
                                                <input type="color" value={settings.theme?.accentColor || "#10b981"} onChange={(e) => updateNestedField("theme.accentColor", e.target.value)} className="w-16 h-14 rounded-xl border border-gray-200 p-1 bg-white cursor-pointer" />
                                                <Input value={settings.theme?.accentColor || "#10b981"} onChange={(e) => updateNestedField("theme.accentColor", e.target.value)} />
                                            </div>
                                        </div>
                                        <Input label="Font Family" value={settings.theme?.fontFamily || "Inter, sans-serif"} onChange={(e) => updateNestedField("theme.fontFamily", e.target.value)} />
                                    </div>
                                </section>
                            </div>
                        )}

                        {activeTab === "layout" && (
                            <div className="animate-fade-up space-y-8">
                                <section className="bg-white rounded-2xl p-8 border border-gray-200 shadow-sm space-y-8">
                                    <SectionHeader icon={LayoutTemplate} title="Section Visibility" />
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <Toggle label="Home Hero" value={settings.layout?.home?.showHero} onChange={(v) => updateNestedField("layout.home.showHero", v)} />
                                        <Toggle label="Home Stats" value={settings.layout?.home?.showStats} onChange={(v) => updateNestedField("layout.home.showStats", v)} />
                                        <Toggle label="About Mission" value={settings.layout?.about?.showMissionVision} onChange={(v) => updateNestedField("layout.about.showMissionVision", v)} />
                                        <Toggle label="About Pillars" value={settings.layout?.about?.showValues} onChange={(v) => updateNestedField("layout.about.showValues", v)} />
                                    </div>
                                </section>
                            </div>
                        )}

                        {activeTab === "global" && (
                            <div className="animate-fade-up space-y-8">
                                <section className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm space-y-6">
                                    <SectionHeader icon={ShieldCheck} title="Institutional Brand" />
                                    <Input label="School Name" value={settings.schoolName || ""} onChange={(e) => setSettings({...settings, schoolName: e.target.value})} />
                                    <ImagePicker label="Logo" value={settings.logo} path="logo" handleImageUpload={handleImageUpload} getImageUrl={getImageUrl} uploadingImage={uploadingImage} />
                                </section>
                                <section className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm space-y-6">
                                    <SectionHeader icon={Globe} title="Social Links" />
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {["facebook", "instagram", "twitter", "youtube", "linkedin"].map(social => (
                                            <Input key={social} label={social.toUpperCase()} value={settings.socialLinks?.[social] || ""} onChange={(e) => updateNestedField(`socialLinks.${social}`, e.target.value)} />
                                        ))}
                                    </div>
                                </section>
                            </div>
                        )}

                        {activeTab === "home" && (
                            <div className="animate-fade-up space-y-8">
                                <section className="bg-white rounded-2xl p-8 border border-gray-200 shadow-sm space-y-8">
                                    <SectionHeader icon={Sparkles} title="Hero Section" />
                                    <Input label="Title" value={settings.home?.hero?.title || ""} onChange={(e) => updateNestedField("home.hero.title", e.target.value)} />
                                    <textarea className="w-full px-5 py-4 bg-white border border-gray-200 rounded-2xl text-sm min-h-[100px]" value={settings.home?.hero?.subtitle || ""} onChange={(e) => updateNestedField("home.hero.subtitle", e.target.value)} />
                                    <ImagePicker label="Hero Image" value={settings.home?.hero?.image} path="home.hero.image" handleImageUpload={handleImageUpload} getImageUrl={getImageUrl} uploadingImage={uploadingImage} />
                                </section>
                                <section className="bg-white rounded-2xl p-8 border border-gray-200 shadow-sm space-y-8">
                                    <SectionHeader icon={Award} title="Stats & Metrics" />
                                    <div className="grid grid-cols-2 gap-4">
                                        {(settings.home?.stats || []).map((stat, i) => (
                                            <div key={i} className="bg-gray-50 p-4 rounded-xl space-y-2">
                                                <Input value={stat.value} onChange={(e) => {
                                                    const news = [...settings.home.stats];
                                                    news[i].value = e.target.value;
                                                    updateNestedField("home.stats", news);
                                                }} />
                                                <Input value={stat.label} onChange={(e) => {
                                                    const news = [...settings.home.stats];
                                                    news[i].label = e.target.value;
                                                    updateNestedField("home.stats", news);
                                                }} />
                                            </div>
                                        ))}
                                    </div>
                                </section>
                            </div>
                        )}

                        {activeTab === "about" && (
                            <div className="animate-fade-up space-y-8">
                                <section className="bg-white rounded-2xl p-8 border border-gray-200 shadow-sm space-y-8">
                                    <SectionHeader icon={BookOpen} title="Heritage & Hero" />
                                    <Input label="Hero Title" value={settings.about?.hero?.title || ""} onChange={(e) => updateNestedField("about.hero.title", e.target.value)} />
                                    <textarea className="w-full px-5 py-4 bg-white border border-gray-200 rounded-2xl text-sm min-h-[100px]" value={settings.about?.hero?.subtitle || ""} onChange={(e) => updateNestedField("about.hero.subtitle", e.target.value)} />
                                    <div className="space-y-4">
                                        <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Heritage Title</label>
                                        <Input value={settings.about?.heritage?.title || ""} onChange={(e) => updateNestedField("about.heritage.title", e.target.value)} />
                                        <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Heritage Story</label>
                                        <textarea className="w-full px-5 py-4 bg-white border border-gray-200 rounded-2xl text-sm min-h-[150px]" value={settings.about?.heritage?.story || ""} onChange={(e) => updateNestedField("about.heritage.story", e.target.value)} />
                                    </div>
                                    <div className="space-y-4 pt-4 border-t border-gray-100">
                                        <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Key Highlights (Hero List)</label>
                                        {(settings.about?.hero?.points || []).map((p, i) => (
                                            <div key={i} className="flex gap-2">
                                                <Input value={p} onChange={(e) => {
                                                    const newp = [...settings.about.hero.points];
                                                    newp[i] = e.target.value;
                                                    updateNestedField("about.hero.points", newp);
                                                }} />
                                                <button onClick={() => updateNestedField("about.hero.points", settings.about.hero.points.filter((_, idx) => idx !== i))} className="text-red-500 hover:scale-110 transition-transform"><Trash2 size={16}/></button>
                                            </div>
                                        ))}
                                        <button onClick={() => updateNestedField("about.hero.points", [...(settings.about.hero.points || []), "New Point"])} className="text-xs font-bold text-accent-600 uppercase tracking-widest">+ Add Point</button>
                                    </div>
                                </section>

                                <section className="bg-white rounded-2xl p-8 border border-gray-200 shadow-sm space-y-8">
                                    <SectionHeader icon={Target} title="Mission & Vision" />
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div className="space-y-4 p-5 bg-gray-50 rounded-2xl border border-gray-100">
                                            <Input label="Mission Title" value={settings.about?.mission?.title || ""} onChange={(e) => updateNestedField("about.mission.title", e.target.value)} />
                                            <textarea className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm min-h-[120px]" value={settings.about?.mission?.content || ""} onChange={(e) => updateNestedField("about.mission.content", e.target.value)} />
                                        </div>
                                        <div className="space-y-4 p-5 bg-gray-50 rounded-2xl border border-gray-100">
                                            <Input label="Vision Title" value={settings.about?.vision?.title || ""} onChange={(e) => updateNestedField("about.vision.title", e.target.value)} />
                                            <textarea className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm min-h-[120px]" value={settings.about?.vision?.content || ""} onChange={(e) => updateNestedField("about.vision.content", e.target.value)} />
                                        </div>
                                    </div>
                                </section>

                                <section className="bg-white rounded-2xl p-8 border border-gray-200 shadow-sm space-y-8">
                                    <SectionHeader icon={Award} title="Philosophy Pillars" />
                                    <div className="grid grid-cols-2 gap-4 mb-6">
                                        <Input label="Section Title" value={settings.about?.philosophy?.title || ""} onChange={(e) => updateNestedField("about.philosophy.title", e.target.value)} />
                                        <Input label="Section Accent" value={settings.about?.philosophy?.accent || ""} onChange={(e) => updateNestedField("about.philosophy.accent", e.target.value)} />
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {(settings.about?.values || []).map((val, i) => (
                                            <div key={i} className="bg-gray-50 p-5 rounded-2xl border border-gray-100 relative group">
                                                <button onClick={() => updateNestedField("about.values", settings.about.values.filter((_, idx) => idx !== i))} className="absolute top-2 right-2 text-red-500 opacity-0 group-hover:opacity-100 transition-all"><Trash2 size={14}/></button>
                                                <Input label="Title" value={val.title} onChange={(e) => {
                                                    const newv = [...settings.about.values];
                                                    newv[i].title = e.target.value;
                                                    updateNestedField("about.values", newv);
                                                }} />
                                                <textarea className="w-full px-4 py-3 mt-2 bg-white border border-gray-200 rounded-xl text-sm min-h-[80px]" value={val.desc} onChange={(e) => {
                                                    const newv = [...settings.about.values];
                                                    newv[i].desc = e.target.value;
                                                    updateNestedField("about.values", newv);
                                                }} />
                                            </div>
                                        ))}
                                    </div>
                                </section>

                                <section className="bg-white rounded-2xl p-8 border border-gray-200 shadow-sm space-y-8">
                                    <SectionHeader icon={Plus} title="Action Center (CTA)" />
                                    <div className="space-y-6">
                                        <Input label="CTA Main Title" value={settings.about?.cta?.title || ""} onChange={(e) => updateNestedField("about.cta.title", e.target.value)} />
                                        <textarea className="w-full px-5 py-4 bg-white border border-gray-200 rounded-2xl text-sm min-h-[80px]" value={settings.about?.cta?.subtitle || ""} onChange={(e) => updateNestedField("about.cta.subtitle", e.target.value)} />
                                        <Input label="Button Label" value={settings.about?.cta?.btnText || ""} onChange={(e) => updateNestedField("about.cta.btnText", e.target.value)} />
                                    </div>
                                </section>

                                <section className="bg-white rounded-2xl p-8 border border-gray-200 shadow-sm space-y-8">
                                    <SectionHeader icon={Users} title="Leadership Pulse" />
                                    <Input label="Leader Heading" value={settings.home?.principal?.title || ""} onChange={(e) => updateNestedField("home.principal.title", e.target.value)} />
                                    <div className="grid grid-cols-2 gap-4">
                                        <Input label="Name" value={settings.home?.principal?.name || ""} onChange={(e) => updateNestedField("home.principal.name", e.target.value)} />
                                        <Input label="Designation" value={settings.home?.principal?.designation || ""} onChange={(e) => updateNestedField("home.principal.designation", e.target.value)} />
                                    </div>
                                    <textarea className="w-full px-5 py-4 bg-white border border-gray-200 rounded-2xl text-sm min-h-[100px]" value={settings.home?.principal?.quote || ""} onChange={(e) => updateNestedField("home.principal.quote", e.target.value)} />
                                    <ImagePicker label="Portrait" value={settings.home?.principal?.image} path="home.principal.image" handleImageUpload={handleImageUpload} getImageUrl={getImageUrl} uploadingImage={uploadingImage} />
                                </section>
                            </div>
                        )}

                        {activeTab === "gallery" && <GalleryManager token={token} getImageUrl={getImageUrl} />}

                    </main>
            </aside>

            <div className={`flex-1 h-full bg-gray-100/80 relative flex flex-col transition-all duration-300 ${!showPreview && "hidden"}`}>
                <div className="h-14 bg-white/90 backdrop-blur border-b border-gray-200 flex items-center justify-between px-6 shrink-0 z-40 shadow-sm">
                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-2 bg-accent-50 text-accent-700 px-3 py-1.5 rounded-lg border border-accent-100">
                            <div className="w-1.5 h-1.5 rounded-full bg-accent-500 animate-pulse"></div>
                            <span className="text-[10px] font-black uppercase tracking-widest">Live Preview</span>
                        </div>
                        
                        <div className="flex items-center gap-3 bg-gray-50/50 px-3 py-1 rounded-lg border border-gray-100">
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Zoom</span>
                            <input 
                                type="range" min="10" max="200" step="1" 
                                value={zoom || 100} 
                                onChange={(e) => setZoom(parseInt(e.target.value))}
                                className="w-24 h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-accent-600"
                            />
                            <span className="text-[10px] font-black text-gray-700 w-10">{(zoom || (containerWidth > 0 ? (containerWidth - 120) / (previewDevice === "desktop" ? 14.4 : previewDevice === "tablet" ? 7.68 : 3.75) : 100)).toFixed(0)}%</span>
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-4">
                        <div className="flex items-center bg-gray-100/80 p-1 rounded-xl border border-gray-200/50">
                            {[{ id: "mobile", icon: Smartphone, label: "Mobile" }, { id: "tablet", icon: Tablet, label: "Tablet" }, { id: "desktop", icon: Monitor, label: "Desktop" }].map(device => (
                                <button 
                                    key={device.id} 
                                    onClick={() => { setPreviewDevice(device.id); setPan({x:0, y:0}); }} 
                                    title={device.label}
                                    className={`p-2 rounded-lg transition-all ${previewDevice === device.id ? "bg-white text-primary-950 shadow-sm border border-gray-200/60" : "text-gray-400 hover:text-gray-700"}`}
                                >
                                    <device.icon size={14} />
                                </button>
                            ))}
                        </div>
                        
                        <button 
                            onClick={() => { setPan({ x: 0, y: 0 }); setZoom(null); }} 
                            title="Reset View"
                            className="p-2 text-gray-400 hover:text-accent-600 hover:bg-accent-50 rounded-lg transition-all"
                        >
                            <RotateCcw size={14} />
                        </button>

                        <div className="h-4 w-px bg-gray-200 mx-2"></div>

                        <div className="flex items-center gap-4">
                            <button onClick={() => window.open(previewUrl, '_blank')} className="text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-primary-950 flex items-center gap-1.5 transition-colors">
                                <Eye size={14} /> View Live
                            </button>
                            <button onClick={() => setShowPreview(false)} className="text-[10px] font-black uppercase tracking-widest text-red-500 hover:text-red-600 flex items-center gap-1.5 transition-colors">
                                <EyeOff size={14} /> Close
                            </button>
                        </div>
                    </div>
                </div>

                <div 
                    ref={containerRef}
                    onMouseDown={(e) => {
                        // Allow dragging if not clicking on buttons, inputs or the iframe itself
                        const isInteractive = e.target.closest('button') || e.target.closest('input') || e.target.tagName === 'IFRAME';
                        if (!isInteractive) {
                            setIsDragging(true);
                            setLastPos({ x: e.clientX, y: e.clientY });
                        }
                    }}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
                    onMouseLeave={handleMouseUp}
                    className="flex-1 overflow-hidden relative bg-[#f0f2f5] bg-[radial-gradient(#d1d5db_1px,transparent_1px)] [background-size:24px_24px] select-none"
                    style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
                >
                    {/* Drag Overlay Helper - ensures smooth dragging over iframe */}
                    {isDragging && <div className="absolute inset-0 z-[100] cursor-grabbing" />}
                    {(() => {
                        const scaleW = (containerWidth - 100) / (previewDevice === "desktop" ? 1440 : (previewDevice === "tablet" ? 768 : 375));
                        const scaleH = (containerHeight - 100) / (previewDevice === "desktop" ? 900 : (previewDevice === "tablet" ? 1024 : 812));
                        const autoScale = Math.max(0.15, Math.min(0.8, Math.min(scaleW, scaleH)));
                        const currentScale = zoom !== null ? (zoom / 100) : (autoScale || 0.5);

                        const width = previewDevice === "desktop" ? "1440px" : (previewDevice === "tablet" ? "768px" : "375px");
                        const height = previewDevice === "desktop" ? "900px" : (previewDevice === "tablet" ? "1024px" : "812px");
                        const marginLeft = previewDevice === "desktop" ? "-720px" : (previewDevice === "tablet" ? "-384px" : "-187.5px");
                        const marginTop = previewDevice === "desktop" ? "-450px" : (previewDevice === "tablet" ? "-512px" : "-406px");

                        return (
                            <div 
                                data-canvas-bg="true"
                                className="w-full h-full flex items-center justify-center p-8 relative"
                            >
                                <div 
                                    style={{
                                        width: width,
                                        height: height,
                                        transform: `scale(${currentScale})`,
                                        transformOrigin: "center center",
                                        position: "absolute",
                                        left: `calc(50% + ${pan.x}px)`,
                                        top: `calc(50% + ${pan.y}px)`,
                                        marginLeft: marginLeft,
                                        marginTop: marginTop,
                                        zIndex: 10,
                                        transition: isDragging ? 'none' : 'all 0.5s cubic-bezier(0.2, 0, 0, 1)'
                                    }} 
                                    className={`bg-white shadow-[0_40px_100px_-20px_rgba(0,0,0,0.3)] flex flex-col overflow-hidden border border-gray-200/50 ${
                                        previewDevice === "mobile" ? "rounded-[3.5rem] ring-[12px] ring-gray-950" : 
                                        previewDevice === "tablet" ? "rounded-[2.5rem] ring-[10px] ring-gray-950" : 
                                        "rounded-xl"
                                    }`}
                                >
                                    {/* Browser Header (For Desktop) */}
                                    {previewDevice === "desktop" && (
                                        <div className="h-10 bg-gray-50 border-b border-gray-200 flex items-center px-4 gap-2 shrink-0">
                                            <div className="flex gap-1.5">
                                                <div className="w-2.5 h-2.5 rounded-full bg-[#FF5F57]"></div>
                                                <div className="w-2.5 h-2.5 rounded-full bg-[#FEBC2E]"></div>
                                                <div className="w-2.5 h-2.5 rounded-full bg-[#28C840]"></div>
                                            </div>
                                            <div className="mx-auto bg-white border border-gray-200 rounded-md h-6 w-1/3 flex items-center px-3 justify-center">
                                                <span className="text-[10px] font-medium text-gray-400 truncate">institutional-portal.edu</span>
                                            </div>
                                            <div className="flex items-center gap-1.5 text-gray-400">
                                                <RotateCcw size={12} />
                                                <span className="text-[9px] font-bold text-gray-300">{(currentScale * 100).toFixed(0)}%</span>
                                            </div>
                                        </div>
                                    )}

                                    <div className="flex-1 overflow-auto bg-white relative">
                                        <iframe 
                                            ref={iframeRef} 
                                            src={previewUrl} 
                                            className="w-full h-full border-none" 
                                            style={{ pointerEvents: isDragging ? 'none' : 'auto' }} 
                                            onLoad={() => {
                                                if (iframeRef.current && settings) {
                                                    iframeRef.current.contentWindow.postMessage({ type: 'LIVE_PREVIEW_UPDATE', settings: settings }, '*');
                                                }
                                            }} 
                                        />
                                    </div>

                                    {/* Mobile/Tablet Home Button Area */}
                                    {previewDevice !== "desktop" && (
                                        <div className="h-8 bg-gray-950 flex items-center justify-center shrink-0">
                                            <div className="w-16 h-1 bg-white/20 rounded-full"></div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })()}
                </div>
            </div>
            {!showPreview && (
                <button onClick={() => setShowPreview(true)} className="absolute bottom-8 right-8 bg-primary-950 text-white px-5 py-3 rounded-xl shadow-2xl flex items-center gap-2 z-50 text-xs font-bold">
                    <Eye size={16} /> Open Canvas
                </button>
            )}
        </div>
    );
};

const GalleryManager = ({ token, getImageUrl }) => {
    const [images, setImages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [newItem, setNewItem] = useState({ title: "", tags: "", file: null });

    const fetchGallery = async () => {
        try {
            const data = await adminService.getGalleryImages(token);
            setImages(data);
        } catch (error) { toast.error("Protocol Failure."); } finally { setLoading(false); }
    };

    useEffect(() => { if (token) fetchGallery(); }, [token]);

    const handleUpload = async (e) => {
        e.preventDefault();
        if (!newItem.file) return toast.warning("Selection Required.");
        setUploading(true);
        const formData = new FormData();
        formData.append("image", newItem.file);
        formData.append("title", newItem.title || "Institutional Memory");
        formData.append("tags", newItem.tags);
        try {
            await adminService.uploadGalleryImage(formData, token);
            toast.success("Asset Synchronized.");
            setNewItem({ title: "", tags: "", file: null });
            fetchGallery();
        } catch (error) { toast.error("Upload failure."); } finally { setUploading(false); }
    };

    const handleDelete = async (id) => {
        try {
            await adminService.deleteGalleryImage(id, token);
            toast.success("Asset Decommissioned.");
            fetchGallery();
        } catch (error) { toast.error("Decommission Failure."); }
    };

    return (
        <div className="animate-fade-up space-y-8">
            <section className="bg-white rounded-2xl p-8 border border-gray-200 shadow-sm space-y-8">
                <SectionHeader icon={Upload} title="Asset Intake" />
                <form onSubmit={handleUpload} className="space-y-6">
                    <Input label="Asset Identifier" value={newItem.title} onChange={(e) => setNewItem({...newItem, title: e.target.value})} />
                    <div className="relative group border-2 border-dashed border-gray-100 rounded-2xl p-10 text-center hover:bg-gray-50 transition-all cursor-pointer">
                        <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => setNewItem({...newItem, file: e.target.files[0]})} />
                        <ImageIcon size={28} className="mx-auto text-accent-500 mb-2" />
                        <p className="text-sm font-bold">{newItem.file ? newItem.file.name : "Select Asset"}</p>
                    </div>
                    <button type="submit" disabled={uploading} className="bg-primary-950 text-white px-8 py-3.5 rounded-xl text-xs font-bold uppercase disabled:opacity-50 flex items-center gap-3">
                        {uploading ? <Loader2 className="animate-spin" size={16} /> : <Plus size={16} />}
                        Synchronize
                    </button>
                </form>
            </section>
            <section className="bg-white rounded-2xl p-8 border border-gray-200 shadow-sm space-y-8">
                <SectionHeader icon={ImageIcon} title="Institutional Registry" />
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    {images.map((img) => (
                        <div key={img._id} className="group relative aspect-[4/5] bg-gray-50 rounded-2xl overflow-hidden shadow-sm">
                            <img src={getImageUrl(img.url)} alt={img.title} className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-4">
                                <h4 className="text-white font-bold text-[10px] truncate mb-2">{img.title}</h4>
                                <button onClick={() => handleDelete(img._id)} className="w-full py-2 bg-red-500 text-white text-[10px] font-bold rounded hover:bg-red-600 transition-all">Delete</button>
                            </div>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
};

export default AdminSiteEditor;
