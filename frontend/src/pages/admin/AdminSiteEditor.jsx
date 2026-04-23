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
  MousePointerClick
} from "lucide-react";
import { toast } from "react-toastify";
import useAuthStore from "../../stores/authStore.js";
import adminService from "../../api/adminService";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import { useSiteSettings } from "../../context/SiteSettingsContext";


// --- HOISTED SHARED UI COMPONENTS (GLOBAL SCOPE) ---
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
    const [previewDevice, setPreviewDevice] = useState("desktop"); // desktop, tablet, mobile
    const [containerWidth, setContainerWidth] = useState(0);
    const containerRef = useRef(null);
    const iframeRef = useRef(null);

    useEffect(() => {
        if (!containerRef.current) return;
        
        const observer = new ResizeObserver((entries) => {
            for (let entry of entries) {
                setContainerWidth(entry.contentRect.width);
            }
        });

        observer.observe(containerRef.current);
        return () => observer.disconnect();
    }, [showPreview]); // Re-observe when showPreview changes

    const fetchSettings = async () => {
        try {
            const data = await adminService.getSiteSettings(token);
            setSettings(data);
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
                    const newSettings = { ...prev };
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
            setGlobalSettings(updated); // Sync with global context immediately
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
                if (!current[pathParts[i]]) current[pathParts[i]] = {};
                current = current[pathParts[i]];
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
            {/* LEFT SIDEBAR (Control Panel) */}
            <aside className={`h-full bg-white border-r border-gray-200 flex flex-col shrink-0 transition-all duration-300 ${showPreview ? "w-[400px] xl:w-[480px]" : "w-full max-w-4xl mx-auto border-x shadow-2xl"}`}>
                
                {/* Header Actions */}
                <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between bg-primary-950 text-white relative z-20 shadow-md">
                    <div className="flex items-center gap-3">
                        <button onClick={() => window.location.href = '/admin/dashboard'} className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all">
                            <X size={16} />
                        </button>
                        <div>
                            <h2 className="text-sm font-bold tracking-tight">Site Editor</h2>
                            <p className="text-[10px] text-white/60 uppercase tracking-widest font-bold">Unsaved Changes</p>
                        </div>
                    </div>
                    
                    <button 
                        onClick={handleUpdate}
                        disabled={saving}
                        className="bg-accent-500 text-white px-5 py-2.5 rounded-lg flex items-center gap-2 hover:bg-accent-400 transition-all shadow-lg disabled:opacity-50 text-xs font-bold"
                    >
                        {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                        Save
                    </button>
                </div>

                {/* Contextual Top Navigation */}
                {!selectedElement ? (
                    <div className="flex border-b border-gray-100 overflow-x-auto no-scrollbar bg-gray-50/50 p-3 gap-2 relative z-10 shrink-0 shadow-inner">
                        <SidebarBtn id="global" activeTab={activeTab} setActiveTab={setActiveTab} icon={Globe} label="Brand & Global" />
                        <SidebarBtn id="theme" activeTab={activeTab} setActiveTab={setActiveTab} icon={Palette} label="Theme Engine" />
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

                {/* Content Area (Scrollable) */}
                <main className="flex-1 overflow-y-auto p-6 space-y-8 bg-gray-50/50 scroll-smooth flex flex-col relative">
                        
                        {/* CONTEXTUAL INSPECTOR */}
                        {selectedElement && (
                            <div className="animate-fade-up space-y-6 flex-1">
                                <section className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm space-y-6">
                                    {selectedElement.type === "text" && (
                                        <div className="space-y-4">
                                            <label className="text-xs font-bold text-gray-600 uppercase tracking-widest">{selectedElement.label}</label>
                                            <textarea 
                                                className="w-full px-5 py-4 bg-gray-50 rounded-xl border border-gray-200 text-sm font-medium outline-none focus:ring-2 focus:ring-accent-500/20 focus:border-accent-500 transition-all min-h-[250px]"
                                                value={getNestedField(settings, selectedElement.path) || ""}
                                                onChange={(e) => updateNestedField(selectedElement.path, e.target.value)}
                                            />
                                        </div>
                                    )}
                                    {selectedElement.type === "image" && (
                                        <ImagePicker 
                                            label={selectedElement.label} 
                                            value={getNestedField(settings, selectedElement.path)} 
                                            path={selectedElement.path} 
                                            handleImageUpload={handleImageUpload} 
                                            getImageUrl={getImageUrl} 
                                            uploadingImage={uploadingImage} 
                                        />
                                    )}
                                </section>
                            </div>
                        )}

                        {/* EMPTY STATE */}
                        {!selectedElement && !activeTab && (
                            <div className="flex-1 flex flex-col items-center justify-center text-center p-8 mt-20 space-y-4">
                                <div className="w-16 h-16 bg-white rounded-2xl shadow-sm border border-gray-200 flex items-center justify-center">
                                    <MousePointerClick size={24} className="text-accent-500 animate-bounce" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-black tracking-tight text-primary-950">Visual Editor Active</h3>
                                    <p className="text-sm text-gray-500 font-medium max-w-[250px] mx-auto mt-2 leading-relaxed">
                                        Click any text, image, or button on the canvas to inspect and edit its properties.
                                    </p>
                                </div>
                            </div>
                        )}
                        
                        {/* THEME TAB */}
                        {activeTab === "theme" && (
                            <div className="animate-fade-up space-y-8">
                                <section className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm space-y-6">
                                    <SectionHeader icon={Palette} title="Theme Engine" />
                                    <div className="grid grid-cols-1 gap-6">
                                        <div className="space-y-4">
                                            <div className="flex items-center justify-between px-1">
                                                <label className="text-[13px] font-semibold text-gray-500">Primary Branding Color</label>
                                                <span className="text-[11px] font-bold text-primary-950/40 uppercase tracking-wider">{settings.theme?.primaryColor}</span>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <input type="color" value={settings.theme?.primaryColor || "#0a0a0a"} onChange={(e) => updateNestedField("theme.primaryColor", e.target.value)} className="w-16 h-14 rounded-xl border border-gray-200 p-1 cursor-pointer bg-white" />
                                                <div className="flex-1">
                                                    <Input placeholder="#000000" value={settings.theme?.primaryColor || "#0a0a0a"} onChange={(e) => updateNestedField("theme.primaryColor", e.target.value)} />
                                                </div>
                                            </div>
                                        </div>
                                        <div className="space-y-4">
                                            <div className="flex items-center justify-between px-1">
                                                <label className="text-[13px] font-semibold text-gray-500">Accent Highlight Color</label>
                                                <span className="text-[11px] font-bold text-primary-950/40 uppercase tracking-wider">{settings.theme?.accentColor}</span>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <input type="color" value={settings.theme?.accentColor || "#10b981"} onChange={(e) => updateNestedField("theme.accentColor", e.target.value)} className="w-16 h-14 rounded-xl border border-gray-200 p-1 cursor-pointer bg-white" />
                                                <div className="flex-1">
                                                    <Input placeholder="#000000" value={settings.theme?.accentColor || "#10b981"} onChange={(e) => updateNestedField("theme.accentColor", e.target.value)} />
                                                </div>
                                            </div>
                                        </div>
                                        <div className="md:col-span-2">
                                            <Input label="Primary Typography (Font Family)" value={settings.theme?.fontFamily || "Inter, sans-serif"} onChange={(e) => updateNestedField("theme.fontFamily", e.target.value)} placeholder="e.g. 'Inter', sans-serif" />
                                        </div>
                                    </div>
                                </section>
                            </div>
                        )}

                        {/* LAYOUT TAB */}
                        {activeTab === "layout" && (
                            <div className="animate-fade-up space-y-8">
                                <section className="bg-white rounded-2xl p-8 border border-gray-200 shadow-sm space-y-8">
                                    <SectionHeader icon={LayoutTemplate} title="Home Page Visibility" />
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <Toggle label="Hero Section" value={settings.layout?.home?.showHero} onChange={(v) => updateNestedField("layout.home.showHero", v)} />
                                        <Toggle label="Performance Metrics" value={settings.layout?.home?.showStats} onChange={(v) => updateNestedField("layout.home.showStats", v)} />
                                        <Toggle label="Institutional Advantage" value={settings.layout?.home?.showAdvantage} onChange={(v) => updateNestedField("layout.home.showAdvantage", v)} />
                                        <Toggle label="Leadership Message" value={settings.layout?.home?.showPrincipal} onChange={(v) => updateNestedField("layout.home.showPrincipal", v)} />
                                        <Toggle label="Application CTA" value={settings.layout?.home?.showCta} onChange={(v) => updateNestedField("layout.home.showCta", v)} />
                                    </div>
                                </section>

                                <section className="bg-white rounded-2xl p-8 border border-gray-200 shadow-sm space-y-8">
                                    <SectionHeader icon={Info} title="About Page Visibility" />
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <Toggle label="Hero Section" value={settings.layout?.about?.showHero} onChange={(v) => updateNestedField("layout.about.showHero", v)} />
                                        <Toggle label="Heritage & Story" value={settings.layout?.about?.showHeritage} onChange={(v) => updateNestedField("layout.about.showHeritage", v)} />
                                        <Toggle label="Core Value Grid" value={settings.layout?.about?.showValues} onChange={(v) => updateNestedField("layout.about.showValues", v)} />
                                        <Toggle label="Leadership Portraits" value={settings.layout?.about?.showPrincipal} onChange={(v) => updateNestedField("layout.about.showPrincipal", v)} />
                                        <Toggle label="Final CTA Section" value={settings.layout?.about?.showCta} onChange={(v) => updateNestedField("layout.about.showCta", v)} />
                                    </div>
                                </section>

                                <section className="bg-white rounded-2xl p-8 border border-gray-200 shadow-sm space-y-8">
                                    <SectionHeader icon={ShieldCheck} title="Admissions Visibility" />
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <Toggle label="Hero Section" value={settings.layout?.admissions?.showHero} onChange={(v) => updateNestedField("layout.admissions.showHero", v)} />
                                        <Toggle label="Enrollment Cycle" value={settings.layout?.admissions?.showProcess} onChange={(v) => updateNestedField("layout.admissions.showProcess", v)} />
                                        <Toggle label="Document Checklist" value={settings.layout?.admissions?.showChecklist} onChange={(v) => updateNestedField("layout.admissions.showChecklist", v)} />
                                        <Toggle label="Digital Application" value={settings.layout?.admissions?.showForm} onChange={(v) => updateNestedField("layout.admissions.showForm", v)} />
                                        <Toggle label="Counselor Support" value={settings.layout?.admissions?.showSupport} onChange={(v) => updateNestedField("layout.admissions.showSupport", v)} />
                                    </div>
                                </section>

                                <section className="bg-white rounded-2xl p-8 border border-gray-200 shadow-sm space-y-8">
                                    <SectionHeader icon={Phone} title="Contact Page Visibility" />
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <Toggle label="Hero Section" value={settings.layout?.contact?.showHero} onChange={(v) => updateNestedField("layout.contact.showHero", v)} />
                                        <Toggle label="Information Cards" value={settings.layout?.contact?.showCards} onChange={(v) => updateNestedField("layout.contact.showCards", v)} />
                                        <Toggle label="Campus Locator (Map)" value={settings.layout?.contact?.showLocation} onChange={(v) => updateNestedField("layout.contact.showLocation", v)} />
                                        <Toggle label="Direct Message Hub" value={settings.layout?.contact?.showForm} onChange={(v) => updateNestedField("layout.contact.showForm", v)} />
                                        <Toggle label="FAQ Integration" value={settings.layout?.contact?.showFaqs} onChange={(v) => updateNestedField("layout.contact.showFaqs", v)} />
                                    </div>
                                </section>
                            </div>
                        )}

                        {/* GLOBAL TAB */}
                        {activeTab === "global" && (
                            <div className="animate-fade-up space-y-8">
                                <section className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm space-y-6">
                                    <SectionHeader icon={ShieldCheck} title="Institutional Brand" />
                                    <div className="grid grid-cols-1 gap-6">
                                        <div className="space-y-6">
                                            <Input label="Official School Name" value={settings.schoolName || ""} onChange={(e) => setSettings({...settings, schoolName: e.target.value})} placeholder="e.g. S.B.S. School" />
                                            <p className="text-xs text-gray-400 font-medium px-1">This name appears in the logo, footer, and browser title bar.</p>
                                        </div>
                                        <ImagePicker label="Institutional Identity (Logo)" value={settings.logo} path="logo" handleImageUpload={handleImageUpload} getImageUrl={getImageUrl} uploadingImage={uploadingImage} />
                                    </div>
                                </section>

                                <section className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm space-y-6">
                                    <SectionHeader icon={Globe} title="Social Connectivity" />
                                    <div className="grid grid-cols-1 gap-6">
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2 mb-1.5 px-1">
                                                <Facebook size={16} className="text-[#1877F2]" />
                                                <span className="text-[13px] font-semibold text-gray-500">Facebook URL</span>
                                            </div>
                                            <Input value={settings.socialLinks?.facebook || ""} onChange={(e) => updateNestedField("socialLinks.facebook", e.target.value)} placeholder="https://facebook.com/..." />
                                        </div>
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2 mb-1.5 px-1">
                                                <Instagram size={16} className="text-[#E4405F]" />
                                                <span className="text-[13px] font-semibold text-gray-500">Instagram URL</span>
                                            </div>
                                            <Input value={settings.socialLinks?.instagram || ""} onChange={(e) => updateNestedField("socialLinks.instagram", e.target.value)} placeholder="https://instagram.com/..." />
                                        </div>
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2 mb-1.5 px-1">
                                                <Twitter size={16} className="text-[#000000]" />
                                                <span className="text-[13px] font-semibold text-gray-500">X (Twitter) URL</span>
                                            </div>
                                            <Input value={settings.socialLinks?.twitter || ""} onChange={(e) => updateNestedField("socialLinks.twitter", e.target.value)} placeholder="https://x.com/..." />
                                        </div>
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2 mb-1.5 px-1">
                                                <Youtube size={16} className="text-[#FF0000]" />
                                                <span className="text-[13px] font-semibold text-gray-500">YouTube Channel</span>
                                            </div>
                                            <Input value={settings.socialLinks?.youtube || ""} onChange={(e) => updateNestedField("socialLinks.youtube", e.target.value)} placeholder="https://youtube.com/..." />
                                        </div>
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2 mb-1.5 px-1">
                                                <MessageCircle size={16} className="text-[#25D366]" />
                                                <span className="text-[13px] font-semibold text-gray-500">WhatsApp Connectivity</span>
                                            </div>
                                            <Input value={settings.socialLinks?.whatsapp || ""} onChange={(e) => updateNestedField("socialLinks.whatsapp", e.target.value)} placeholder="Phone number with country code" />
                                        </div>
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2 mb-1.5 px-1">
                                                <Linkedin size={16} className="text-[#0A66C2]" />
                                                <span className="text-[13px] font-semibold text-gray-500">LinkedIn Page</span>
                                            </div>
                                            <Input value={settings.socialLinks?.linkedin || ""} onChange={(e) => updateNestedField("socialLinks.linkedin", e.target.value)} placeholder="https://linkedin.com/..." />
                                        </div>
                                    </div>
                                </section>
                            </div>
                        )}

                        {/* HOME TAB */}
                        {activeTab === "home" && (
                            <div className="animate-fade-up space-y-8">
                                <section className="bg-white rounded-2xl p-8 border border-gray-200 shadow-sm space-y-8">
                                    <SectionHeader icon={Sparkles} title="Hero Experience" />
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                                        <div className="space-y-6">
                                            <Input label="Short Tagline (Badge)" value={settings.home?.hero?.badge || ""} onChange={(e) => updateNestedField("home.hero.badge", e.target.value)} placeholder="e.g. Excellence in Education" />
                                            <Input label="Primary Headline Title" value={settings.home?.hero?.title || ""} onChange={(e) => updateNestedField("home.hero.title", e.target.value)} placeholder="e.g. Shaping Future Leaders" />
                                            <div className="space-y-2">
                                                <label className="text-[13px] font-semibold text-gray-500 ml-1">Hero Description Subtext</label>
                                                <textarea className="w-full px-5 py-4 bg-white rounded-2xl border border-gray-200 text-sm font-medium outline-none focus:ring-4 focus:ring-accent-500/5 focus:border-accent-500 transition-all min-h-[120px] placeholder:text-gray-400" value={settings.home?.hero?.subtitle || ""} onChange={(e) => updateNestedField("home.hero.subtitle", e.target.value)} placeholder="Describe your institutional vision..." />
                                            </div>
                                        </div>
                                        <div id="field-home-hero-image">
                                            <ImagePicker label="Hero Cover Visual" value={settings.home?.hero?.image} path="home.hero.image" handleImageUpload={handleImageUpload} getImageUrl={getImageUrl} uploadingImage={uploadingImage} />
                                        </div>
                                    </div>
                                </section>

                                <section className="bg-white rounded-2xl p-8 border border-gray-200 shadow-sm space-y-8">
                                    <SectionHeader icon={Award} title="Institutional Metrics" />
                                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                                        {(settings.home?.stats || []).map((stat, idx) => (
                                            <div key={idx} className="bg-gray-50 p-5 rounded-2xl border border-gray-100 relative group">
                                                <button onClick={() => {
                                                    const newStats = settings.home.stats.filter((_, i) => i !== idx);
                                                    updateNestedField("home.stats", newStats);
                                                }} className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-all text-red-500 hover:scale-110"><Trash2 size={14} /></button>
                                                <div className="space-y-3">
                                                    <Input placeholder="99+" value={stat.value} onChange={(e) => {
                                                        const newStats = [...settings.home.stats];
                                                        newStats[idx].value = e.target.value;
                                                        updateNestedField("home.stats", newStats);
                                                    }} />
                                                    <Input placeholder="Students" value={stat.label} onChange={(e) => {
                                                        const newStats = [...settings.home.stats];
                                                        newStats[idx].label = e.target.value;
                                                        updateNestedField("home.stats", newStats);
                                                    }} />
                                                </div>
                                            </div>
                                        ))}
                                        { (settings.home?.stats || []).length < 4 && (
                                            <button onClick={() => {
                                                const newStats = [...(settings.home.stats || []), { label: "New Stat", value: "0" }];
                                                updateNestedField("home.stats", newStats);
                                            }} className="bg-gray-50 p-5 rounded-2xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center gap-2 hover:bg-gray-100 hover:border-accent-200 transition-all group">
                                                <Plus className="text-gray-400 group-hover:text-accent-600" size={24} />
                                                <span className="text-xs font-bold text-gray-500 uppercase tracking-tight">Add Metric</span>
                                            </button>
                                        )}
                                    </div>
                                </section>

                                <section className="bg-white rounded-2xl p-8 border border-gray-200 shadow-sm space-y-10">
                                    <SectionHeader icon={Star} title="Institutional Advantage" />
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                                        <div className="space-y-6">
                                            <Input label="Section Tagline" value={settings.home?.advantage?.badge || ""} onChange={(e) => updateNestedField("home.advantage.badge", e.target.value)} />
                                            <Input label="Section Main Title" value={settings.home?.advantage?.title || ""} onChange={(e) => updateNestedField("home.advantage.title", e.target.value)} />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[13px] font-semibold text-gray-500 ml-1">Section Overview</label>
                                            <textarea className="w-full px-5 py-4 bg-white rounded-2xl border border-gray-200 text-sm font-medium outline-none focus:ring-4 focus:ring-accent-500/5 focus:border-accent-500 transition-all min-h-[100px]" value={settings.home?.advantage?.subtitle || ""} onChange={(e) => updateNestedField("home.advantage.subtitle", e.target.value)} />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {(settings.home?.advantage?.features || []).map((feat, idx) => (
                                            <div key={idx} className="p-6 bg-gray-50 rounded-2xl border border-gray-200 relative group">
                                                <button onClick={() => {
                                                    const newFeats = settings.home.advantage.features.filter((_, i) => i !== idx);
                                                    updateNestedField("home.advantage.features", newFeats);
                                                }} className="absolute top-3 right-3 text-red-500 hover:scale-110 opacity-0 group-hover:opacity-100 transition-all">
                                                    <Trash2 size={16} />
                                                </button>
                                                <div className="space-y-5">
                                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                        <Input label="Feature Heading" value={feat.title} onChange={(e) => {
                                                            const newFeats = [...settings.home.advantage.features];
                                                            newFeats[idx].title = e.target.value;
                                                            updateNestedField("home.advantage.features", newFeats);
                                                        }} />
                                                        <Input label="Category Badge" value={feat.badge} onChange={(e) => {
                                                            const newFeats = [...settings.home.advantage.features];
                                                            newFeats[idx].badge = e.target.value;
                                                            updateNestedField("home.advantage.features", newFeats);
                                                        }} />
                                                    </div>
                                                    <textarea placeholder="Supporting details..." className="w-full px-4 py-3 bg-white rounded-xl text-sm font-medium border border-gray-200 outline-none focus:border-accent-500 transition-all min-h-[80px]" value={feat.desc} onChange={(e) => {
                                                        const newFeats = [...settings.home.advantage.features];
                                                        newFeats[idx].desc = e.target.value;
                                                        updateNestedField("home.advantage.features", newFeats);
                                                    }} />
                                                </div>
                                            </div>
                                        ))}
                                        <button onClick={() => {
                                            const newFeats = [...(settings.home.advantage.features || []), { title: "New Feature", badge: "Core", desc: "Description here", icon: "Star" }];
                                            updateNestedField("home.advantage.features", newFeats);
                                        }} className="p-6 rounded-2xl border-2 border-dashed border-gray-200 hover:bg-gray-50 transition-all flex flex-col items-center justify-center gap-2 group">
                                            <Plus className="text-gray-300 group-hover:text-accent-600" size={32} />
                                            <span className="text-xs font-bold text-gray-500 uppercase tracking-tight">Add Proposition</span>
                                        </button>
                                    </div>
                                </section>

                                <section className="bg-white rounded-2xl p-8 border border-gray-200 shadow-sm space-y-8">
                                    <SectionHeader icon={Users} title="Leadership Hub" />
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                                        <div className="space-y-6">
                                            <Input label="Leadership Heading" value={settings.home?.principal?.title || ""} onChange={(e) => updateNestedField("home.principal.title", e.target.value)} />
                                            <div className="grid grid-cols-2 gap-4">
                                                <Input label="Leader Name" value={settings.home?.principal?.name || ""} onChange={(e) => updateNestedField("home.principal.name", e.target.value)} />
                                                <Input label="Designation" value={settings.home?.principal?.designation || ""} onChange={(e) => updateNestedField("home.principal.designation", e.target.value)} />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[13px] font-semibold text-gray-500 ml-1">Personal Statement / Quote</label>
                                                <textarea className="w-full px-5 py-4 bg-white border border-gray-200 rounded-2xl text-sm font-medium min-h-[140px] outline-none focus:border-accent-500 transition-all" value={settings.home?.principal?.quote || ""} onChange={(e) => updateNestedField("home.principal.quote", e.target.value)} />
                                            </div>
                                        </div>
                                        <ImagePicker label="Portrait Visual" value={settings.home?.principal?.image} path="home.principal.image" handleImageUpload={handleImageUpload} getImageUrl={getImageUrl} uploadingImage={uploadingImage} />
                                    </div>
                                </section>

                                <section className="bg-white rounded-2xl p-8 border border-gray-200 shadow-sm space-y-8">
                                    <SectionHeader icon={Zap} title="Enrollment CTA" />
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                                        <div className="space-y-6">
                                            <Input label="Action Tagline" value={settings.home?.cta?.badge || ""} onChange={(e) => updateNestedField("home.cta.badge", e.target.value)} />
                                            <Input label="Call-to-Action Title" value={settings.home?.cta?.title || ""} onChange={(e) => updateNestedField("home.cta.title", e.target.value)} />
                                            <div className="space-y-2">
                                                <label className="text-[13px] font-semibold text-gray-500 ml-1">Action Subtext</label>
                                                <textarea className="w-full px-5 py-4 bg-white border border-gray-200 rounded-2xl text-sm font-medium min-h-[100px] outline-none focus:border-accent-500 transition-all" value={settings.home?.cta?.subtitle || ""} onChange={(e) => updateNestedField("home.cta.subtitle", e.target.value)} />
                                            </div>
                                        </div>
                                        <div className="space-y-6">
                                            <div className="grid grid-cols-2 gap-4">
                                                <Input label="Primary Button" value={settings.home?.cta?.primaryBtn || ""} onChange={(e) => updateNestedField("home.cta.primaryBtn", e.target.value)} />
                                                <Input label="Secondary Button" value={settings.home?.cta?.secondaryBtn || ""} onChange={(e) => updateNestedField("home.cta.secondaryBtn", e.target.value)} />
                                            </div>
                                            <Input label="Social Proof / Trust Text" value={settings.home?.cta?.trustText || ""} onChange={(e) => updateNestedField("home.cta.trustText", e.target.value)} />
                                        </div>
                                    </div>
                                </section>
                            </div>
                        )}

                        {/* ABOUT TAB */}
                        {activeTab === "about" && (
                            <div className="animate-fade-up space-y-8">
                                <section className="bg-white rounded-2xl p-8 border border-gray-200 shadow-sm space-y-8">
                                    <SectionHeader icon={BookOpen} title="Heritage & Mission" />
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                                        <div className="space-y-6">
                                            <Input label="Short Tagline (Badge)" value={settings.about?.hero?.badge || ""} onChange={(e) => updateNestedField("about.hero.badge", e.target.value)} />
                                            <Input label="Primary Narrative Heading" value={settings.about?.hero?.title || ""} onChange={(e) => updateNestedField("about.hero.title", e.target.value)} />
                                            <div className="space-y-2">
                                                <label className="text-[13px] font-semibold text-gray-500 ml-1">Institutional Story (Teaser)</label>
                                                <textarea className="w-full px-5 py-4 bg-white rounded-2xl border border-gray-200 text-sm font-medium outline-none focus:ring-4 focus:ring-accent-500/5 focus:border-accent-500 transition-all min-h-[120px]" value={settings.about?.hero?.subtitle || ""} onChange={(e) => updateNestedField("about.hero.subtitle", e.target.value)} />
                                            </div>
                                        </div>
                                        <div className="space-y-6">
                                            <Input label="Historical Heritage Title" value={settings.about?.heritage?.title || ""} onChange={(e) => updateNestedField("about.heritage.title", e.target.value)} />
                                            <div className="space-y-2">
                                                <label className="text-[13px] font-semibold text-gray-500 ml-1">The Full Legacy Tale</label>
                                                <textarea className="w-full px-5 py-4 bg-white rounded-2xl border border-gray-200 text-sm font-medium outline-none focus:ring-4 focus:ring-accent-500/5 focus:border-accent-500 transition-all min-h-[160px]" value={settings.about?.heritage?.story || ""} onChange={(e) => updateNestedField("about.heritage.story", e.target.value)} />
                                            </div>
                                        </div>
                                    </div>
                                </section>

                                <section className="bg-white rounded-2xl p-8 border border-gray-200 shadow-sm space-y-8">
                                    <SectionHeader icon={Target} title="Core Directives" />
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div className="p-6 bg-gray-50 rounded-2xl border border-gray-100 space-y-4">
                                            <Input label="Principal Mission Title" value={settings.about?.mission?.title || ""} onChange={(e) => updateNestedField("about.mission.title", e.target.value)} />
                                            <textarea placeholder="Define your institutional mission..." className="w-full px-4 py-3 bg-white rounded-xl text-sm font-medium border border-gray-200 outline-none focus:border-accent-500 transition-all min-h-[120px]" value={settings.about?.mission?.content || ""} onChange={(e) => updateNestedField("about.mission.content", e.target.value)} />
                                        </div>
                                        <div className="p-6 bg-gray-50 rounded-2xl border border-gray-100 space-y-4">
                                            <Input label="Future Vision Title" value={settings.about?.vision?.title || ""} onChange={(e) => updateNestedField("about.vision.title", e.target.value)} />
                                            <textarea placeholder="Define your vision for the future..." className="w-full px-4 py-3 bg-white rounded-xl text-sm font-medium border border-gray-200 outline-none focus:border-accent-500 transition-all min-h-[120px]" value={settings.about?.vision?.content || ""} onChange={(e) => updateNestedField("about.vision.content", e.target.value)} />
                                        </div>
                                    </div>
                                </section>

                                <section className="bg-white rounded-2xl p-8 border border-gray-200 shadow-sm space-y-8">
                                    <SectionHeader icon={Award} title="Value Pillars" />
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {(settings.about?.values || []).map((val, idx) => (
                                            <div key={idx} className="p-6 bg-gray-50 rounded-2xl border border-gray-100 relative group">
                                                <button onClick={() => {
                                                    const newVals = settings.about.values.filter((_, i) => i !== idx);
                                                    updateNestedField("about.values", newVals);
                                                }} className="absolute top-3 right-3 text-red-500 hover:scale-110 opacity-0 group-hover:opacity-100 transition-all">
                                                    <Trash2 size={16} />
                                                </button>
                                                <div className="space-y-4">
                                                    <Input label="Pillar Heading" value={val.title} onChange={(e) => {
                                                        const newVals = [...settings.about.values];
                                                        newVals[idx].title = e.target.value;
                                                        updateNestedField("about.values", newVals);
                                                    }} />
                                                    <textarea placeholder="Pillar description..." className="w-full px-4 py-3 bg-white rounded-xl text-sm font-medium border border-gray-200 outline-none focus:border-accent-500 transition-all min-h-[80px]" value={val.desc} onChange={(e) => {
                                                        const newVals = [...settings.about.values];
                                                        newVals[idx].desc = e.target.value;
                                                        updateNestedField("about.values", newVals);
                                                    }} />
                                                </div>
                                            </div>
                                        ))}
                                        <button onClick={() => {
                                            const newVals = [...(settings.about.values || []), { title: "Resilience", desc: "Always moving forward...", icon: "Shield" }];
                                            updateNestedField("about.values", newVals);
                                        }} className="p-6 rounded-2xl border-2 border-dashed border-gray-200 hover:border-accent-200 hover:bg-accent-50 transition-all flex flex-col items-center justify-center gap-2 group">
                                            <Plus className="text-gray-300 group-hover:text-accent-600" size={32} />
                                            <span className="text-xs font-bold text-gray-500 uppercase tracking-tight">Add Value Pillar</span>
                                        </button>
                                    </div>
                                </section>

                                <section className="bg-white rounded-2xl p-8 border border-gray-200 shadow-sm space-y-8">
                                    <SectionHeader icon={Zap} title="Institutional CTA" />
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div className="space-y-4">
                                            <Input label="Decision Title" value={settings.about?.cta?.title || ""} onChange={(e) => updateNestedField("about.cta.title", e.target.value)} />
                                            <textarea placeholder="Why choose us? Summarize here..." className="w-full px-4 py-3 bg-gray-50 rounded-2xl text-sm font-medium min-h-[100px]" value={settings.about?.cta?.subtitle || ""} onChange={(e) => updateNestedField("about.cta.subtitle", e.target.value)} />
                                        </div>
                                        <div className="space-y-4">
                                            <Input label="Primary Action Text" value={settings.about?.cta?.btnText || "Contact Admissions"} onChange={(e) => updateNestedField("about.cta.btnText", e.target.value)} />
                                        </div>
                                    </div>
                                </section>
                            </div>
                        )}

                        {/* ADMISSIONS TAB */}
                        {activeTab === "admissions" && (
                            <div className="animate-fade-up space-y-8">
                                <section className="bg-white rounded-2xl p-8 border border-gray-200 shadow-sm space-y-8">
                                    <SectionHeader icon={FileText} title="Enrollment Strategy" />
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                                        <div className="space-y-6">
                                            <Input label="Short Tagline (Badge)" value={settings.admissions?.hero?.badge || ""} onChange={(e) => updateNestedField("admissions.hero.badge", e.target.value)} />
                                            <Input label="Primary Enrollment Heading" value={settings.admissions?.hero?.title || ""} onChange={(e) => updateNestedField("admissions.hero.title", e.target.value)} />
                                            <div className="space-y-2">
                                                <label className="text-[13px] font-semibold text-gray-500 ml-1">Admission Overview</label>
                                                <textarea className="w-full px-5 py-4 bg-white rounded-2xl border border-gray-200 text-sm font-medium outline-none focus:ring-4 focus:ring-accent-500/5 focus:border-accent-500 transition-all min-h-[120px]" value={settings.admissions?.hero?.subtitle || ""} onChange={(e) => updateNestedField("admissions.hero.subtitle", e.target.value)} />
                                            </div>
                                        </div>
                                        <ImagePicker label="Admissions Hub Visual" value={settings.admissions?.hero?.image} path="admissions.hero.image" handleImageUpload={handleImageUpload} getImageUrl={getImageUrl} uploadingImage={uploadingImage} />
                                    </div>
                                </section>

                                <section className="bg-white rounded-2xl p-8 border border-gray-200 shadow-sm space-y-8">
                                    <SectionHeader icon={Trophy} title="Enrollment Cycle" />
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {(settings.admissions?.process?.steps || []).map((step, idx) => (
                                            <div key={idx} className="bg-gray-50 p-6 rounded-2xl border border-gray-100 relative group">
                                                <button onClick={() => {
                                                    const newSteps = settings.admissions.process.steps.filter((_, i) => i !== idx);
                                                    updateNestedField("admissions.process.steps", newSteps);
                                                }} className="absolute top-3 right-3 text-red-500 hover:scale-110 opacity-0 group-hover:opacity-100 transition-all"><Trash2 size={16} /></button>
                                                <div className="space-y-4">
                                                    <div className="grid grid-cols-2 gap-4">
                                                        <Input label="Step Milestone" value={step.title} onChange={(e) => {
                                                            const newSteps = [...settings.admissions.process.steps];
                                                            newSteps[idx].title = e.target.value;
                                                            updateNestedField("admissions.process.steps", newSteps);
                                                        }} />
                                                        <Input label="Phase Status" value={step.badge} onChange={(e) => {
                                                            const newSteps = [...settings.admissions.process.steps];
                                                            newSteps[idx].badge = e.target.value;
                                                            updateNestedField("admissions.process.steps", newSteps);
                                                        }} />
                                                    </div>
                                                    <textarea placeholder="Supporting details..." className="w-full px-4 py-3 bg-white rounded-xl text-sm font-medium border border-gray-200 min-h-[80px] outline-none focus:border-accent-500 transition-all" value={step.desc} onChange={(e) => {
                                                        const newSteps = [...settings.admissions.process.steps];
                                                        newSteps[idx].desc = e.target.value;
                                                        updateNestedField("admissions.process.steps", newSteps);
                                                    }} />
                                                </div>
                                            </div>
                                        ))}
                                        <button onClick={() => {
                                            const newSteps = [...(settings.admissions?.process?.steps || []), { title: "Inquiry", desc: "Start the journey...", icon: "Star", badge: "Phase 1" }];
                                            updateNestedField("admissions.process.steps", newSteps);
                                        }} className="p-6 rounded-2xl border-2 border-dashed border-gray-200 hover:bg-gray-50 transition-all flex flex-col items-center justify-center gap-2 group">
                                            <Plus className="text-gray-300 group-hover:text-accent-600" size={32} />
                                            <span className="text-xs font-bold text-gray-500 uppercase tracking-tight">Add Cycle Stage</span>
                                        </button>
                                    </div>
                                </section>

                                <section className="bg-white rounded-2xl p-8 border border-gray-200 shadow-sm space-y-8">
                                    <SectionHeader icon={CheckCircle} title="Evidence Checklist" />
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                        {(settings.admissions?.checklist?.items || []).map((item, idx) => (
                                            <div key={idx} className="bg-gray-50 p-5 rounded-2xl border border-gray-100 relative group">
                                                <button onClick={() => {
                                                    const newItems = settings.admissions.checklist.items.filter((_, i) => i !== idx);
                                                    updateNestedField("admissions.checklist.items", newItems);
                                                }} className="absolute top-3 right-3 text-red-500 hover:scale-110 opacity-0 group-hover:opacity-100 transition-all"><Trash2 size={14} /></button>
                                                <div className="space-y-3">
                                                    <Input placeholder="Document Name" value={item.title} onChange={(e) => {
                                                        const newItems = [...settings.admissions.checklist.items];
                                                        newItems[idx].title = e.target.value;
                                                        updateNestedField("admissions.checklist.items", newItems);
                                                    }} />
                                                    <Input placeholder="Format/Hint" value={item.desc} onChange={(e) => {
                                                        const newItems = [...settings.admissions.checklist.items];
                                                        newItems[idx].desc = e.target.value;
                                                        updateNestedField("admissions.checklist.items", newItems);
                                                    }} />
                                                </div>
                                            </div>
                                        ))}
                                        <button onClick={() => {
                                            const newItems = [...(settings.admissions?.checklist?.items || []), { title: "Identity Proof", desc: "Birth Certificate", icon: "File" }];
                                            updateNestedField("admissions.checklist.items", newItems);
                                        }} className="bg-gray-50 p-5 rounded-2xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center gap-1 hover:bg-gray-100 transition-all group">
                                            <Plus className="text-gray-300 group-hover:text-accent-600" size={20} />
                                            <span className="text-[11px] font-bold text-gray-500 uppercase tracking-tight">Add Requirement</span>
                                        </button>
                                    </div>
                                </section>

                                <section className="bg-white rounded-2xl p-8 border border-gray-200 shadow-sm space-y-8">
                                    <SectionHeader icon={Zap} title="Portal & Support" />
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                                        <div className="space-y-6">
                                            <Input label="Application Heading" value={settings.admissions?.cta?.title || ""} onChange={(e) => updateNestedField("admissions.cta.title", e.target.value)} />
                                            <div className="space-y-2">
                                                <label className="text-[13px] font-semibold text-gray-500 ml-1">Portal Description</label>
                                                <textarea className="w-full px-5 py-4 bg-gray-50 rounded-2xl text-sm font-medium min-h-[100px] outline-none focus:bg-white focus:border-accent-500 transition-all" value={settings.admissions?.cta?.subtitle || ""} onChange={(e) => updateNestedField("admissions.cta.subtitle", e.target.value)} />
                                            </div>
                                        </div>
                                        <div className="space-y-6">
                                            <Input label="Counseling Badge" value={settings.admissions?.support?.badge || ""} onChange={(e) => updateNestedField("admissions.support.badge", e.target.value)} />
                                            <Input label="Counseling Heading" value={settings.admissions?.support?.title || ""} onChange={(e) => updateNestedField("admissions.support.title", e.target.value)} />
                                            <div className="space-y-2">
                                                <label className="text-[13px] font-semibold text-gray-500 ml-1">Support Narrative</label>
                                                <textarea className="w-full px-5 py-4 bg-gray-50 rounded-2xl text-sm font-medium min-h-[100px] outline-none focus:bg-white focus:border-accent-500 transition-all" value={settings.admissions?.support?.subtitle || ""} onChange={(e) => updateNestedField("admissions.support.subtitle", e.target.value)} />
                                            </div>
                                        </div>
                                    </div>
                                </section>
                            </div>
                        )}

                        {/* CONTACT TAB */}
                        {activeTab === "contact" && (
                            <div className="animate-fade-up space-y-8">
                                <section className="bg-white rounded-2xl p-8 border border-gray-200 shadow-sm space-y-8">
                                    <SectionHeader icon={Phone} title="Institutional Reach" />
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                                        <div className="space-y-6">
                                            <Input label="Short Tagline (Badge)" value={settings.contact?.hero?.badge || ""} onChange={(e) => updateNestedField("contact.hero.badge", e.target.value)} />
                                            <Input label="Primary Contact Heading" value={settings.contact?.hero?.title || ""} onChange={(e) => updateNestedField("contact.hero.title", e.target.value)} />
                                            <div className="space-y-2">
                                                <label className="text-[13px] font-semibold text-gray-500 ml-1">Contact Narrative</label>
                                                <textarea className="w-full px-5 py-4 bg-white rounded-2xl border border-gray-200 text-sm font-medium outline-none focus:ring-4 focus:ring-accent-500/5 focus:border-accent-500 transition-all min-h-[100px]" value={settings.contact?.hero?.subtitle || ""} onChange={(e) => updateNestedField("contact.hero.subtitle", e.target.value)} />
                                            </div>
                                        </div>
                                        <div className="space-y-6">
                                            <Input label="Message Hub Heading" value={settings.contact?.messagePortal?.title || ""} onChange={(e) => updateNestedField("contact.messagePortal.title", e.target.value)} />
                                            <div className="space-y-2">
                                                <label className="text-[13px] font-semibold text-gray-500 ml-1">Message Hub Overview</label>
                                                <textarea className="w-full px-5 py-4 bg-white rounded-2xl border border-gray-200 text-sm font-medium outline-none focus:ring-4 focus:ring-accent-500/5 focus:border-accent-500 transition-all min-h-[100px]" value={settings.contact?.messagePortal?.subtitle || ""} onChange={(e) => updateNestedField("contact.messagePortal.subtitle", e.target.value)} />
                                            </div>
                                        </div>
                                    </div>
                                </section>

                                <section className="bg-white rounded-2xl p-8 border border-gray-200 shadow-sm space-y-8">
                                    <SectionHeader icon={Zap} title="Direct Support Channels" />
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {(settings.contact?.cards || []).map((card, idx) => (
                                            <div key={idx} className="bg-gray-50 p-6 rounded-2xl border border-gray-100 relative group">
                                                <button onClick={() => {
                                                    const newCards = settings.contact.cards.filter((_, i) => i !== idx);
                                                    updateNestedField("contact.cards", newCards);
                                                }} className="absolute top-3 right-3 text-red-500 hover:scale-110 opacity-0 group-hover:opacity-100 transition-all"><Trash2 size={16} /></button>
                                                <div className="space-y-4">
                                                    <div className="grid grid-cols-2 gap-4">
                                                        <Input label="Channel Title" value={card.title} onChange={(e) => {
                                                            const newCards = [...settings.contact.cards];
                                                            newCards[idx].title = e.target.value;
                                                            updateNestedField("contact.cards", newCards);
                                                        }} />
                                                        <Input label="Narrative Label" value={card.label} onChange={(e) => {
                                                            const newCards = [...settings.contact.cards];
                                                            newCards[idx].label = e.target.value;
                                                            updateNestedField("contact.cards", newCards);
                                                        }} />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <label className="text-[11px] font-bold text-gray-400 px-1 uppercase tracking-tight">Active Frequency</label>
                                                        {(card.details || []).map((detail, dIdx) => (
                                                            <div key={dIdx} className="flex gap-2 mb-2">
                                                                <div className="flex-1">
                                                                    <Input placeholder="Detail (e.g. phone number)" value={detail} onChange={(e) => {
                                                                        const newCards = [...settings.contact.cards];
                                                                        newCards[idx].details[dIdx] = e.target.value;
                                                                        updateNestedField("contact.cards", newCards);
                                                                    }} />
                                                                </div>
                                                                <button onClick={() => {
                                                                    const newCards = [...settings.contact.cards];
                                                                    newCards[idx].details = newCards[idx].details.filter((_, i) => i !== dIdx);
                                                                    updateNestedField("contact.cards", newCards);
                                                                }} className="p-2 text-red-400 hover:text-red-600 transition-colors"><Trash2 size={14} /></button>
                                                            </div>
                                                        ))}
                                                        <button onClick={() => {
                                                            const newCards = [...settings.contact.cards];
                                                            newCards[idx].details = [...(newCards[idx].details || []), "new detail"];
                                                            updateNestedField("contact.cards", newCards);
                                                        }} className="text-[11px] font-bold text-accent-600 hover:text-accent-700 flex items-center gap-1.5 px-1 py-1 transition-all">
                                                            <Plus size={12} /> Add Detail
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                        <button onClick={() => {
                                            const newCards = [...(settings.contact?.cards || []), { title: "New Channel", label: "Direct Support", details: [""] }];
                                            updateNestedField("contact.cards", newCards);
                                        }} className="p-6 rounded-2xl border-2 border-dashed border-gray-200 hover:bg-gray-50 transition-all flex flex-col items-center justify-center gap-2 group">
                                            <Plus className="text-gray-300 group-hover:text-accent-600" size={32} />
                                            <span className="text-xs font-bold text-gray-500 uppercase tracking-tight">Add Support Channel</span>
                                        </button>
                                    </div>
                                </section>

                                <section className="bg-white rounded-2xl p-8 border border-gray-200 shadow-sm space-y-8">
                                    <SectionHeader icon={Compass} title="Campus Residency" />
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div className="space-y-6">
                                            <Input label="Institutional Campus Title" value={settings.contact?.location?.campusName || ""} onChange={(e) => updateNestedField("contact.location.campusName", e.target.value)} />
                                            <Input label="Full Operational Address" value={settings.contact?.location?.address || ""} onChange={(e) => updateNestedField("contact.location.address", e.target.value)} />
                                        </div>
                                        <div className="space-y-6">
                                            <Input label="Google Maps Embed URL" value={settings.contact?.location?.mapLink || ""} onChange={(e) => updateNestedField("contact.location.mapLink", e.target.value)} placeholder="https://www.google.com/maps/embed?..." />
                                            <p className="text-[11px] text-gray-400 font-medium leading-relaxed italic px-1">
                                                Paste the iframe SRC from Google Maps 'Share' -&gt; 'Embed a map' to synchronize the physical location visual.
                                            </p>
                                        </div>
                                    </div>
                                </section>

                                <section className="bg-white rounded-2xl p-8 border border-gray-200 shadow-sm space-y-8">
                                    <SectionHeader icon={Info} title="FAQ Repository" />
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {(settings.contact?.faqs || []).map((faq, idx) => (
                                            <div key={idx} className="bg-gray-50 p-6 rounded-2xl border border-gray-100 relative group">
                                                <button onClick={() => {
                                                    const newFaqs = settings.contact.faqs.filter((_, i) => i !== idx);
                                                    updateNestedField("contact.faqs", newFaqs);
                                                }} className="absolute top-3 right-3 text-red-500 hover:scale-110 opacity-0 group-hover:opacity-100 transition-all"><Trash2 size={16} /></button>
                                                <div className="space-y-4">
                                                    <Input label="Frequency Question" value={faq.q} onChange={(e) => {
                                                        const newFaqs = [...settings.contact.faqs];
                                                        newFaqs[idx].q = e.target.value;
                                                        updateNestedField("contact.faqs", newFaqs);
                                                    }} />
                                                    <textarea placeholder="Institutional response..." className="w-full px-4 py-3 bg-white rounded-xl text-sm font-medium border border-gray-200 min-h-[100px] outline-none focus:border-accent-500 transition-all" value={faq.a} onChange={(e) => {
                                                        const newFaqs = [...settings.contact.faqs];
                                                        newFaqs[idx].a = e.target.value;
                                                        updateNestedField("contact.faqs", newFaqs);
                                                    }} />
                                                </div>
                                            </div>
                                        ))}
                                        <button onClick={() => {
                                            const newFaqs = [...(settings.contact.faqs || []), { q: "What are your hours?", a: "Mon-Sat, 8AM to 4PM." }];
                                            updateNestedField("contact.faqs", newFaqs);
                                        }} className="p-6 rounded-2xl border-2 border-dashed border-gray-200 hover:bg-gray-50 transition-all flex flex-col items-center justify-center gap-2 group">
                                            <Plus className="text-gray-300 group-hover:text-accent-600" size={32} />
                                            <span className="text-xs font-bold text-gray-500 uppercase tracking-tight">Add FAQ Entry</span>
                                        </button>
                                    </div>
                                </section>
                            </div>
                        )}

                        {/* FOOTER TAB */}
                        {activeTab === "footer" && (
                            <div className="animate-fade-up space-y-8">
                                <section className="bg-white rounded-2xl p-8 border border-gray-200 shadow-sm space-y-8">
                                    <SectionHeader icon={Copyright} title="Institutional Footer" />
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                                        <div className="space-y-6">
                                            <div className="space-y-2">
                                                <label className="text-[13px] font-semibold text-gray-500 ml-1">Operational Mission (Left Column)</label>
                                                <textarea className="w-full px-5 py-4 bg-white rounded-2xl border border-gray-200 text-sm font-medium outline-none focus:ring-4 focus:ring-accent-500/5 focus:border-accent-500 transition-all min-h-[120px]" value={settings.global?.footerMission || ""} onChange={(e) => updateNestedField("global.footerMission", e.target.value)} />
                                            </div>
                                            <Input label="Legal Copyright Line" value={settings.global?.footerCopyright || ""} onChange={(e) => updateNestedField("global.footerCopyright", e.target.value)} placeholder="© 2026 Institutional Name..." />
                                        </div>
                                        <div className="space-y-6">
                                            <Input label="Vision Statement Descriptor" value={settings.global?.visionStatement || ""} onChange={(e) => updateNestedField("global.visionStatement", e.target.value)} />
                                            <div className="space-y-2">
                                                <label className="text-[13px] font-semibold text-gray-500 ml-1">Vision Quote (Featured)</label>
                                                <textarea className="w-full px-5 py-4 bg-white rounded-2xl border border-gray-200 text-sm font-medium outline-none focus:ring-4 focus:ring-accent-500/5 focus:border-accent-500 transition-all min-h-[100px]" value={settings.global?.visionQuote || ""} onChange={(e) => updateNestedField("global.visionQuote", e.target.value)} />
                                            </div>
                                            <Input label="Global Hub Button Text" value={settings.global?.ctaButtonText || ""} onChange={(e) => updateNestedField("global.ctaButtonText", e.target.value)} />
                                        </div>
                                    </div>
                                </section>
                            </div>
                        )}

                        {/* GALLERY TAB */}
                        {activeTab === "gallery" && (
                            <GalleryManager token={token} getImageUrl={getImageUrl} />
                        )}

                    </main>
            </aside>

            {/* RIGHT PREVIEW (Canvas) */}
            <div className={`flex-1 h-full bg-gray-100/80 relative flex flex-col transition-all duration-300 ${!showPreview && "hidden"}`}>
                
                {/* Canvas Toolbar */}
                <div className="h-14 bg-white/80 backdrop-blur border-b border-gray-200 flex items-center justify-between px-6 shrink-0 relative z-20">
                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-2 bg-accent-50 text-accent-700 px-3 py-1.5 rounded-md border border-accent-100">
                            <div className="w-1.5 h-1.5 rounded-full bg-accent-500 animate-pulse"></div>
                            <span className="text-[10px] font-bold uppercase tracking-widest">Live Sync Active</span>
                        </div>
                    </div>
                    
                    <div className="flex items-center bg-gray-100/80 p-1 rounded-lg border border-gray-200/50">
                        {[
                            { id: "mobile", icon: Smartphone },
                            { id: "tablet", icon: Tablet },
                            { id: "desktop", icon: Monitor }
                        ].map(device => (
                            <button 
                                key={device.id}
                                onClick={() => setPreviewDevice(device.id)}
                                className={`p-2 rounded-md transition-all duration-300 ${
                                    previewDevice === device.id 
                                    ? "bg-white text-primary-950 shadow-sm border border-gray-200/60" 
                                    : "text-gray-400 hover:text-gray-700"
                                }`}
                            >
                                <device.icon size={14} />
                            </button>
                        ))}
                    </div>

                    <div className="flex items-center gap-3">
                        <button onClick={() => window.open('/', '_blank')} className="text-xs font-bold text-gray-500 hover:text-primary-950 flex items-center gap-1.5 transition-colors">
                            <Eye size={14} /> View Live
                        </button>
                        <div className="w-px h-4 bg-gray-300"></div>
                        <button onClick={() => setShowPreview(false)} className="text-xs font-bold text-red-500 hover:text-red-600 flex items-center gap-1.5 transition-colors">
                            <EyeOff size={14} /> Close
                        </button>
                    </div>
                </div>

                {/* Canvas Frame */}
                <div 
                    ref={containerRef}
                    className="flex-1 overflow-hidden p-6 md:p-10 flex items-center justify-center relative bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px]"
                >
                    <div 
                        className={`bg-white shadow-2xl transition-all duration-700 ease-in-out relative flex flex-col overflow-hidden ring-1 ring-gray-200/50 ${
                            previewDevice === "mobile" ? "w-[375px] h-full rounded-[3rem] ring-[12px] ring-gray-900" :
                            previewDevice === "tablet" ? "w-[768px] h-full rounded-[2.5rem] ring-[10px] ring-gray-900" :
                            "w-full h-full rounded-2xl"
                        }`}
                        style={previewDevice === "desktop" ? {
                            width: "1440px",
                            height: `${(100 / Math.max(0.1, Math.min(1, (containerWidth - 80) / 1440)))}%`,
                            maxWidth: "none",
                            transform: `scale(${Math.max(0.1, Math.min(1, (containerWidth - 80) / 1440))})`,
                            transformOrigin: "top center",
                            position: "absolute",
                            top: "40px",
                            left: "50%",
                            marginLeft: "-720px",
                        } : {}}
                    >
                        <div className="flex-1 overflow-auto bg-white">
                            <iframe 
                                ref={iframeRef}
                                src="/" 
                                className="w-full h-full border-none"
                                title="Institutional Site Preview"
                                key={previewDevice}
                                onLoad={() => {
                                    if (iframeRef.current && settings) {
                                        iframeRef.current.contentWindow.postMessage({
                                            type: 'LIVE_PREVIEW_UPDATE',
                                            settings: settings
                                        }, '*');
                                    }
                                }}
                            />
                        </div>
                        {previewDevice !== "desktop" && (
                            <div className="h-6 bg-gray-900 flex items-center justify-center">
                                <div className="w-12 h-1 bg-white/20 rounded-full"></div>
                            </div>
                        )}
                    </div>
                </div>

            </div>
            
            {/* Show Preview Toggle (When Hidden) */}
            {!showPreview && (
                <button 
                    onClick={() => setShowPreview(true)}
                    className="absolute bottom-8 right-8 bg-primary-950 text-white px-5 py-3 rounded-xl shadow-2xl flex items-center gap-2 hover:bg-black transition-all hover:-translate-y-1 z-50 text-xs font-bold"
                >
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
        } catch (error) {
            toast.error("Protocol Failure: Could not synchronize assets.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (token) fetchGallery();
    }, [token]);

    const handleUpload = async (e) => {
        e.preventDefault();
        if (!newItem.file) return toast.warning("Selection Required: Please pick an institutional asset.");
        
        setUploading(true);
        const formData = new FormData();
        formData.append("image", newItem.file);
        formData.append("title", newItem.title || "Institutional Memory");
        formData.append("tags", newItem.tags);

        try {
            await adminService.uploadGalleryImage(formData, token);
            toast.success("Digital Asset Synchronized Successfully.");
            setNewItem({ title: "", tags: "", file: null });
            fetchGallery();
        } catch (error) {
            toast.error("Upload failure: Check digital integrity.");
        } finally {
            setUploading(false);
        }
    };

    const handleDelete = async (id) => {
        try {
            await adminService.deleteGalleryImage(id, token);
            toast.success("Asset Decommissioned Successfully.");
            fetchGallery();
        } catch (error) {
            toast.error("Decommission Failure.");
        }
    };

    return (
        <div className="animate-fade-up space-y-8">
            <section className="bg-white rounded-2xl p-8 border border-gray-200 shadow-sm space-y-8">
                <SectionHeader icon={Upload} title="Asset Intake" />

                <form onSubmit={handleUpload} className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <Input 
                        label="Asset Identifier" 
                        placeholder="e.g. Campus Event 2024"
                        value={newItem.title}
                        onChange={(e) => setNewItem({...newItem, title: e.target.value})}
                    />
                    <Input 
                        label="Discovery Tags" 
                        placeholder="e.g. Sports, Award (Comma Separated)"
                        value={newItem.tags}
                        onChange={(e) => setNewItem({...newItem, tags: e.target.value})}
                    />
                    
                    <div className="col-span-full">
                        <div className="relative group border-2 border-dashed border-gray-100 rounded-2xl p-10 text-center hover:bg-gray-50 hover:border-accent-200 transition-all cursor-pointer">
                            <input 
                                type="file" 
                                className="absolute inset-0 opacity-0 cursor-pointer z-10"
                                onChange={(e) => setNewItem({...newItem, file: e.target.files[0]})}
                            />
                            <div className="space-y-4">
                                <div className="w-14 h-14 bg-accent-50 rounded-2xl flex items-center justify-center text-accent-500 mx-auto group-hover:scale-110 transition-transform">
                                    <ImageIcon size={28} />
                                </div>
                                <div className="space-y-1">
                                    <p className="text-sm font-bold text-gray-700">
                                        {newItem.file ? newItem.file.name : "Select Primary Resolution Asset"}
                                    </p>
                                    <p className="text-xs text-gray-400 font-medium">
                                        Drag & drop or click to browse institutional files
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="col-span-full">
                        <button 
                            type="submit" 
                            disabled={uploading}
                            className="bg-primary-950 text-white px-8 py-3.5 rounded-xl text-[11px] font-bold uppercase tracking-wider hover:bg-black transition-all flex items-center gap-3 disabled:opacity-50"
                        >
                            {uploading ? <Loader2 className="animate-spin" size={16} /> : <Plus size={16} />}
                            Synchronize to Gallery
                        </button>
                    </div>
                </form>
            </section>

            <section className="bg-white rounded-2xl p-8 border border-gray-200 shadow-sm space-y-8">
                <SectionHeader icon={ImageIcon} title="Institutional Registry" />

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20 gap-4 opacity-50">
                        <Loader2 className="animate-spin text-accent-600" size={32} />
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Synchronizing...</span>
                    </div>
                ) : images.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 space-y-4 opacity-50">
                        <ImageIcon size={48} className="text-gray-200" />
                        <p className="text-sm font-bold text-gray-400">Registry is currently empty.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {images.map((img) => (
                            <div key={img._id} className="group relative aspect-[4/5] bg-gray-50 rounded-2xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500">
                                <img src={getImageUrl(img.url)} alt={img.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                                <div className="absolute inset-0 bg-gradient-to-t from-gray-950/90 via-gray-950/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-5">
                                    <h4 className="text-white font-bold text-xs truncate mb-3">{img.title}</h4>
                                    <button 
                                        onClick={() => handleDelete(img._id)}
                                        className="w-full py-2.5 bg-red-500 text-white text-[10px] font-bold uppercase tracking-wider rounded-lg hover:bg-red-600 transition-all flex items-center justify-center gap-2"
                                    >
                                        <Trash2 size={12} /> Purge
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </section>
        </div>
    );
};

export default AdminSiteEditor;
