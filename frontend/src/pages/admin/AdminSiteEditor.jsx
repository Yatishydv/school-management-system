import React, { useState, useEffect } from "react";
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
  Copyright
} from "lucide-react";
import { toast } from "react-toastify";
import useAuthStore from "../../stores/authStore.js";
import adminService from "../../api/adminService";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";

const AdminSiteEditor = () => {
    const { token } = useAuthStore();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [activeTab, setActiveTab] = useState("global"); 
    const [settings, setSettings] = useState(null);
    const [uploadingImage, setUploadingImage] = useState(false);

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

    const handleUpdate = async () => {
        setSaving(true);
        try {
            await adminService.updateSiteSettings(settings, token);
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

    const SidebarBtn = ({ id, icon: Icon, label }) => (
        <button 
            onClick={() => setActiveTab(id)}
            className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-300 ${
                activeTab === id ? "bg-primary-950 text-white shadow-xl shadow-primary-950/20 translate-x-2" : "text-gray-400 hover:text-primary-950 hover:bg-white"
            }`}
        >
            <Icon size={18} />
            {label}
        </button>
    );

    const SectionHeader = ({ icon: Icon, title }) => (
        <div className="flex items-center gap-3 mb-8">
            <div className="p-2 bg-accent-50 rounded-lg">
                <Icon className="text-accent-500" size={20} />
            </div>
            <h3 className="text-xl font-black text-primary-950 uppercase tracking-tight italic border-b-2 border-accent-100 pb-1">{title}</h3>
        </div>
    );

    const ImagePicker = ({ label, value, path }) => (
        <div className="space-y-4">
            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">{label}</label>
            <div className="flex items-center gap-6">
                <div className="w-20 h-20 bg-gray-50 rounded-2xl border border-gray-100 flex items-center justify-center p-2 overflow-hidden shrink-0">
                    {value ? <img src={getImageUrl(value)} className="max-w-full max-h-full object-contain" /> : <ImageIcon size={24} className="opacity-10" />}
                </div>
                <div className="relative flex-1">
                    <button className="w-full px-6 py-4 bg-gray-50 border border-dashed border-gray-200 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-gray-100 transition-all flex items-center justify-center gap-2">
                        {uploadingImage ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />} 
                        {value ? "Update Asset" : "Upload Asset"}
                    </button>
                    <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => handleImageUpload(e.target.files[0], path)} />
                </div>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50/50 pb-24 space-y-12 relative overflow-hidden">
            {/* Watermark */}
            <div className="absolute top-20 left-1/2 -translate-x-1/2 text-[20vw] font-black text-gray-100/10 pointer-events-none select-none tracking-tighter uppercase whitespace-nowrap">
                {activeTab}
            </div>

            <header className="px-8 md:px-14 pt-16 flex flex-col md:flex-row justify-between items-start md:items-end gap-8 relative z-10 font-body">
                <div className="space-y-4">
                    <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-accent-500"></div>
                        <span className="text-[10px] font-black uppercase tracking-[0.5em] text-gray-400">Institutional Customization</span>
                    </div>
                    <h1 className="text-5xl md:text-8xl font-black tracking-tighter leading-none text-primary-950">
                        Site <span className="text-gray-200">Editor.</span>
                    </h1>
                </div>

                <div className="flex flex-wrap gap-4">
                    <button 
                        onClick={() => window.location.href = '/admin/profile'}
                        className="px-8 py-5 rounded-2xl border-2 border-gray-100 text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 hover:border-primary-950 hover:text-primary-950 transition-all active:scale-95 bg-white shadow-lg"
                    >
                        Back to Profile
                    </button>
                    <button 
                        onClick={handleUpdate}
                        disabled={saving}
                        className="group bg-primary-950 text-white px-10 py-5 rounded-2xl flex items-center gap-4 hover:bg-emerald-500 transition-all shadow-2xl shadow-primary-950/20 disabled:opacity-50 active:scale-95"
                    >
                        {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                        <span className="text-[10px] font-black uppercase tracking-[0.3em]">Commit Changes</span>
                    </button>
                </div>
            </header>

            <div className="px-8 md:px-14 grid grid-cols-1 lg:grid-cols-12 gap-12 relative z-10 font-body">
                {/* Left Mini-Nav */}
                <aside className="lg:col-span-3 lg:sticky lg:top-8 h-fit space-y-2 bg-white/50 backdrop-blur-sm p-4 rounded-3xl border border-gray-100 shadow-sm">
                    <SidebarBtn id="global" icon={Globe} label="Global & Socials" />
                    <SidebarBtn id="home" icon={Monitor} label="Home Page" />
                    <SidebarBtn id="about" icon={Layout} label="About Page" />
                    <SidebarBtn id="admissions" icon={FileText} label="Admissions" />
                    <SidebarBtn id="contact" icon={Phone} label="Contact Page" />
                    <SidebarBtn id="footer" icon={Copyright} label="Footer Settings" />
                </aside>

                {/* Right Content Area */}
                <main className="lg:col-span-9 space-y-12">
                    
                    {/* GLOBAL TAB */}
                    {activeTab === "global" && (
                        <div className="animate-fade-up space-y-12">
                            <section className="bg-white rounded-[2.5rem] p-10 border border-gray-100 shadow-sm space-y-8">
                                <SectionHeader icon={ShieldCheck} title="Institutional Brand" />
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <Input label="School Name" value={settings.schoolName || ""} onChange={(e) => setSettings({...settings, schoolName: e.target.value})} />
                                    <ImagePicker label="Institutional Logo" value={settings.logo} path="logo" />
                                </div>
                            </section>

                            <section className="bg-white rounded-[2.5rem] p-10 border border-gray-100 shadow-sm space-y-8">
                                <SectionHeader icon={Globe} title="Social Link Matrix" />
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2 mb-1">
                                            <Facebook size={14} className="text-blue-600" />
                                            <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Facebook URL</span>
                                        </div>
                                        <Input className="!mt-0" value={settings.socialLinks?.facebook || ""} onChange={(e) => updateNestedField("socialLinks.facebook", e.target.value)} placeholder="https://..." />
                                    </div>
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2 mb-1">
                                            <Instagram size={14} className="text-pink-600" />
                                            <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Instagram URL</span>
                                        </div>
                                        <Input className="!mt-0" value={settings.socialLinks?.instagram || ""} onChange={(e) => updateNestedField("socialLinks.instagram", e.target.value)} placeholder="https://..." />
                                    </div>
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2 mb-1">
                                            <Twitter size={14} className="text-gray-950" />
                                            <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Twitter URL</span>
                                        </div>
                                        <Input className="!mt-0" value={settings.socialLinks?.twitter || ""} onChange={(e) => updateNestedField("socialLinks.twitter", e.target.value)} placeholder="https://..." />
                                    </div>
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2 mb-1">
                                            <Youtube size={14} className="text-red-600" />
                                            <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">YouTube URL</span>
                                        </div>
                                        <Input className="!mt-0" value={settings.socialLinks?.youtube || ""} onChange={(e) => updateNestedField("socialLinks.youtube", e.target.value)} placeholder="https://..." />
                                    </div>
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2 mb-1">
                                            <MessageCircle size={14} className="text-emerald-500" />
                                            <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">WhatsApp Number</span>
                                        </div>
                                        <Input className="!mt-0" value={settings.socialLinks?.whatsapp || ""} onChange={(e) => updateNestedField("socialLinks.whatsapp", e.target.value)} placeholder="+91..." />
                                    </div>
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2 mb-1">
                                            <Linkedin size={14} className="text-blue-700" />
                                            <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">LinkedIn URL</span>
                                        </div>
                                        <Input className="!mt-0" value={settings.socialLinks?.linkedin || ""} onChange={(e) => updateNestedField("socialLinks.linkedin", e.target.value)} placeholder="https://..." />
                                    </div>
                                </div>
                            </section>
                        </div>
                    )}

                    {/* HOME TAB */}
                    {activeTab === "home" && (
                        <div className="animate-fade-up space-y-12">
                            {/* HERO SECTION */}
                            <section className="bg-white rounded-[2.5rem] p-10 border border-gray-100 shadow-sm space-y-8">
                                <SectionHeader icon={Sparkles} title="Hero Section" />
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                    <div className="space-y-6">
                                        <Input label="Hero Tagline (Badge)" value={settings.home?.hero?.badge || ""} onChange={(e) => updateNestedField("home.hero.badge", e.target.value)} />
                                        <Input label="Main Headline" value={settings.home?.hero?.title || ""} onChange={(e) => updateNestedField("home.hero.title", e.target.value)} />
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Hero Subtitle</label>
                                            <textarea className="w-full px-6 py-4 bg-gray-50 rounded-2xl font-bold text-sm outline-none focus:ring-4 focus:ring-accent-50 border border-transparent focus:border-accent-200 transition-all font-sans min-h-[120px]" value={settings.home?.hero?.subtitle || ""} onChange={(e) => updateNestedField("home.hero.subtitle", e.target.value)} />
                                        </div>
                                    </div>
                                    <div className="space-y-6">
                                        <ImagePicker label="Hero Main Image" value={settings.home?.hero?.image} path="home.hero.image" />
                                    </div>
                                </div>
                            </section>

                            {/* STATS SECTION */}
                            <section className="bg-white rounded-[2.5rem] p-10 border border-gray-100 shadow-sm space-y-8">
                                <SectionHeader icon={Award} title="Performance Stats" />
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                    {(settings.home?.stats || []).map((stat, idx) => (
                                        <div key={idx} className="bg-gray-50 p-6 rounded-3xl space-y-4 relative group">
                                            <button onClick={() => {
                                                const newStats = settings.home.stats.filter((_, i) => i !== idx);
                                                updateNestedField("home.stats", newStats);
                                            }} className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-all text-red-400 hover:text-red-600"><Trash2 size={14} /></button>
                                            <Input label={`Value ${idx + 1}`} value={stat.value} onChange={(e) => {
                                                const newStats = [...settings.home.stats];
                                                newStats[idx].value = e.target.value;
                                                updateNestedField("home.stats", newStats);
                                            }} />
                                            <Input label={`Label ${idx + 1}`} value={stat.label} onChange={(e) => {
                                                const newStats = [...settings.home.stats];
                                                newStats[idx].label = e.target.value;
                                                updateNestedField("home.stats", newStats);
                                            }} />
                                        </div>
                                    ))}
                                    <button onClick={() => {
                                        const newStats = [...(settings.home.stats || []), { label: "New Stat", value: "0" }];
                                        updateNestedField("home.stats", newStats);
                                    }} className="bg-gray-50 p-6 rounded-3xl border-2 border-dashed border-gray-100 flex flex-col items-center justify-center gap-2 hover:bg-gray-100 transition-all group">
                                        <Plus className="text-gray-300 group-hover:text-accent-500" size={24} />
                                        <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Add Stat</span>
                                    </button>
                                </div>
                            </section>

                            {/* ADVANTAGE SECTION */}
                            <section className="bg-white rounded-[2.5rem] p-10 border border-gray-100 shadow-sm space-y-10">
                                <SectionHeader icon={Star} title="Institutional Advantage" />
                                <div className="grid md:grid-cols-2 gap-8">
                                    <div className="space-y-6">
                                        <Input label="Section Badge" value={settings.home?.advantage?.badge || ""} onChange={(e) => updateNestedField("home.advantage.badge", e.target.value)} />
                                        <Input label="Section Title" value={settings.home?.advantage?.title || ""} onChange={(e) => updateNestedField("home.advantage.title", e.target.value)} />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Section Subtitle</label>
                                        <textarea className="w-full px-6 py-4 bg-gray-50 rounded-2xl font-bold text-sm outline-none focus:ring-4 focus:ring-accent-50 border border-transparent focus:border-accent-200 transition-all font-sans min-h-[100px]" value={settings.home?.advantage?.subtitle || ""} onChange={(e) => updateNestedField("home.advantage.subtitle", e.target.value)} />
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 italic">Feature Cards (Add/Edit)</label>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {(settings.home?.advantage?.features || []).map((feat, idx) => (
                                            <div key={idx} className="p-8 bg-gray-50 rounded-[2.5rem] border border-gray-200 relative group">
                                                <button onClick={() => {
                                                    const newFeats = settings.home.advantage.features.filter((_, i) => i !== idx);
                                                    updateNestedField("home.advantage.features", newFeats);
                                                }} className="absolute top-4 right-4 text-red-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-all">
                                                    <Trash2 size={16} />
                                                </button>
                                                <div className="space-y-6">
                                                    <div className="grid grid-cols-2 gap-4">
                                                        <Input label="Feature Title" value={feat.title} onChange={(e) => {
                                                            const newFeats = [...settings.home.advantage.features];
                                                            newFeats[idx].title = e.target.value;
                                                            updateNestedField("home.advantage.features", newFeats);
                                                        }} />
                                                        <Input label="Card Badge" value={feat.badge} onChange={(e) => {
                                                            const newFeats = [...settings.home.advantage.features];
                                                            newFeats[idx].badge = e.target.value;
                                                            updateNestedField("home.advantage.features", newFeats);
                                                        }} />
                                                    </div>
                                                    <textarea placeholder="Feature Description" className="w-full px-4 py-3 bg-white rounded-xl text-sm font-medium border border-gray-200 outline-none focus:border-accent-500 transition-all min-h-[80px]" value={feat.desc} onChange={(e) => {
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
                                        }} className="p-8 rounded-[2.5rem] border-2 border-dashed border-gray-200 hover:border-accent-200 hover:bg-accent-50 transition-all flex flex-col items-center justify-center gap-2 group">
                                            <Plus className="text-gray-300 group-hover:text-accent-500 group-hover:scale-110 transition-all" size={32} />
                                            <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 group-hover:text-accent-700">Add New Value Proposition</span>
                                        </button>
                                    </div>
                                </div>
                            </section>

                            {/* LEADERSHIP SECTION */}
                            <section className="bg-white rounded-[2.5rem] p-10 border border-gray-100 shadow-sm space-y-10">
                                <SectionHeader icon={Users} title="Leadership Hub" />
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                    <div className="space-y-6">
                                        <Input label="Leadership Section Heading" value={settings.home?.principal?.title || ""} onChange={(e) => updateNestedField("home.principal.title", e.target.value)} />
                                        <Input label="Leader Name" value={settings.home?.principal?.name || ""} onChange={(e) => updateNestedField("home.principal.name", e.target.value)} />
                                        <Input label="Institutional Designation" value={settings.home?.principal?.designation || ""} onChange={(e) => updateNestedField("home.principal.designation", e.target.value)} />
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Personal Philosophy (Quote)</label>
                                            <textarea className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-bold min-h-[120px]" value={settings.home?.principal?.quote || ""} onChange={(e) => updateNestedField("home.principal.quote", e.target.value)} />
                                        </div>
                                    </div>
                                    <div className="space-y-6">
                                        <ImagePicker label="Leader/Principal Portrait" value={settings.home?.principal?.image} path="home.principal.image" />
                                    </div>
                                </div>
                            </section>
                        </div>
                    )}

                    {/* ABOUT TAB */}
                    {activeTab === "about" && (
                        <div className="animate-fade-up space-y-12">
                            <section className="bg-white rounded-[2.5rem] p-10 border border-gray-100 shadow-sm space-y-8">
                                <SectionHeader icon={BookOpen} title="Heritage & Mission" />
                                <div className="space-y-8">
                                    <div className="grid md:grid-cols-2 gap-8">
                                        <Input label="Hero Title" value={settings.about?.hero?.title || ""} onChange={(e) => updateNestedField("about.hero.title", e.target.value)} />
                                        <Input label="Hero Tagline" value={settings.about?.hero?.badge || ""} onChange={(e) => updateNestedField("about.hero.badge", e.target.value)} />
                                    </div>
                                    <Input label="Heritage Section Headline" value={settings.about?.heritage?.title || ""} onChange={(e) => updateNestedField("about.heritage.title", e.target.value)} />
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Full Institutional Story</label>
                                        <textarea className="w-full px-6 py-4 bg-gray-50 rounded-2xl font-bold text-sm outline-none focus:ring-4 focus:ring-accent-50 border border-transparent focus:border-accent-200 transition-all font-sans min-h-[200px]" value={settings.about?.heritage?.story || ""} onChange={(e) => updateNestedField("about.heritage.story", e.target.value)} />
                                    </div>
                                    <div className="grid md:grid-cols-2 gap-8">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Mission Content</label>
                                            <textarea className="w-full px-4 py-3 bg-gray-50 rounded-2xl text-sm font-medium min-h-[120px]" value={settings.about?.mission?.content || ""} onChange={(e) => updateNestedField("about.mission.content", e.target.value)} />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Vision Content</label>
                                            <textarea className="w-full px-4 py-3 bg-gray-50 rounded-2xl text-sm font-medium min-h-[120px]" value={settings.about?.vision?.content || ""} onChange={(e) => updateNestedField("about.vision.content", e.target.value)} />
                                        </div>
                                    </div>
                                </div>
                            </section>

                            <section className="bg-white rounded-[2.5rem] p-10 border border-gray-100 shadow-sm space-y-8">
                                <SectionHeader icon={Award} title="Core Values Grid" />
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {(settings.about?.values || []).map((val, idx) => (
                                        <div key={idx} className="bg-gray-50 p-8 rounded-[2.5rem] border border-gray-200 relative group">
                                            <button onClick={() => {
                                                const newVals = settings.about.values.filter((_, i) => i !== idx);
                                                updateNestedField("about.values", newVals);
                                            }} className="absolute top-4 right-4 text-red-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-all">
                                                <Trash2 size={16} />
                                            </button>
                                            <div className="space-y-4">
                                                <Input label="Value Title" value={val.title} onChange={(e) => {
                                                    const newVals = [...settings.about.values];
                                                    newVals[idx].title = e.target.value;
                                                    updateNestedField("about.values", newVals);
                                                }} />
                                                <textarea placeholder="Value Description" className="w-full px-4 py-3 bg-white rounded-xl text-sm font-medium border border-gray-200 outline-none focus:border-accent-500 transition-all min-h-[80px]" value={val.desc} onChange={(e) => {
                                                    const newVals = [...settings.about.values];
                                                    newVals[idx].desc = e.target.value;
                                                    updateNestedField("about.values", newVals);
                                                }} />
                                            </div>
                                        </div>
                                    ))}
                                    <button onClick={() => {
                                        const newVals = [...(settings.about.values || []), { title: "New Value", desc: "Value description...", icon: "Shield" }];
                                        updateNestedField("about.values", newVals);
                                    }} className="p-8 rounded-[2.5rem] border-2 border-dashed border-gray-200 hover:border-accent-200 hover:bg-accent-50 transition-all flex flex-col items-center justify-center gap-2 group">
                                        <Plus className="text-gray-300 group-hover:text-accent-500 group-hover:scale-110 transition-all" size={32} />
                                        <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 group-hover:text-accent-700">Add Core Value</span>
                                    </button>
                                </div>
                            </section>
                        </div>
                    )}

                    {/* ADMISSIONS TAB */}
                    {activeTab === "admissions" && (
                        <div className="animate-fade-up space-y-12">
                            <section className="bg-white rounded-[2.5rem] p-10 border border-gray-100 shadow-sm space-y-8">
                                <SectionHeader icon={FileText} title="Enrollment Hub" />
                                <div className="grid md:grid-cols-2 gap-8">
                                    <div className="space-y-6">
                                        <Input label="Hero Headline" value={settings.admissions?.hero?.title || ""} onChange={(e) => updateNestedField("admissions.hero.title", e.target.value)} />
                                        <Input label="Hero Badge" value={settings.admissions?.hero?.badge || ""} onChange={(e) => updateNestedField("admissions.hero.badge", e.target.value)} />
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Hero Subtitle</label>
                                            <textarea className="w-full px-4 py-3 bg-gray-50 rounded-2xl text-sm font-medium min-h-[100px]" value={settings.admissions?.hero?.subtitle || ""} onChange={(e) => updateNestedField("admissions.hero.subtitle", e.target.value)} />
                                        </div>
                                    </div>
                                    <div className="space-y-4">
                                        <ImagePicker label="Admissions Cover Image" value={settings.admissions?.hero?.image} path="admissions.hero.image" />
                                    </div>
                                </div>
                            </section>

                            <section className="bg-white rounded-[2.5rem] p-10 border border-gray-100 shadow-sm space-y-8">
                                <SectionHeader icon={Trophy} title="Admission Cycle (4 Steps)" />
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {(settings.admissions?.process?.steps || []).map((step, idx) => (
                                        <div key={idx} className="bg-gray-50 p-8 rounded-[2.5rem] border border-gray-200">
                                            <div className="grid grid-cols-2 gap-4 mb-4">
                                                <Input label={`Step ${idx + 1} Title`} value={step.title} onChange={(e) => {
                                                    const newSteps = [...settings.admissions.process.steps];
                                                    newSteps[idx].title = e.target.value;
                                                    updateNestedField("admissions.process.steps", newSteps);
                                                }} />
                                                <Input label="Phase Label" value={step.badge} onChange={(e) => {
                                                    const newSteps = [...settings.admissions.process.steps];
                                                    newSteps[idx].badge = e.target.value;
                                                    updateNestedField("admissions.process.steps", newSteps);
                                                }} />
                                            </div>
                                            <textarea placeholder="Step Description" className="w-full px-4 py-3 bg-white rounded-xl text-sm font-medium border border-gray-200 min-h-[80px]" value={step.desc} onChange={(e) => {
                                                const newSteps = [...settings.admissions.process.steps];
                                                newSteps[idx].desc = e.target.value;
                                                updateNestedField("admissions.process.steps", newSteps);
                                            }} />
                                        </div>
                                    ))}
                                </div>
                            </section>

                            <section className="bg-white rounded-[2.5rem] p-10 border border-gray-100 shadow-sm space-y-8">
                                <SectionHeader icon={CheckCircle} title="Evidence Checklist (Documents)" />
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    {(settings.admissions?.checklist?.items || []).map((item, idx) => (
                                        <div key={idx} className="bg-gray-50 p-6 rounded-2xl border border-gray-200 relative group">
                                            <button onClick={() => {
                                                const newItems = settings.admissions.checklist.items.filter((_, i) => i !== idx);
                                                updateNestedField("admissions.checklist.items", newItems);
                                            }} className="absolute top-4 right-4 text-red-400 opacity-0 group-hover:opacity-100 transition-all"><Trash2 size={16} /></button>
                                            <div className="space-y-4">
                                                <Input label="Document Title" value={item.title} onChange={(e) => {
                                                    const newItems = [...settings.admissions.checklist.items];
                                                    newItems[idx].title = e.target.value;
                                                    updateNestedField("admissions.checklist.items", newItems);
                                                }} />
                                                <Input label="Required Logic/Hint" value={item.desc} onChange={(e) => {
                                                    const newItems = [...settings.admissions.checklist.items];
                                                    newItems[idx].desc = e.target.value;
                                                    updateNestedField("admissions.checklist.items", newItems);
                                                }} />
                                            </div>
                                        </div>
                                    ))}
                                    <button onClick={() => {
                                        const newItems = [...(settings.admissions?.checklist?.items || []), { title: "New Document", desc: "Digital or Physical", icon: "File" }];
                                        updateNestedField("admissions.checklist.items", newItems);
                                    }} className="bg-gray-50 p-6 rounded-2xl border-2 border-dashed border-gray-100 flex flex-col items-center justify-center gap-2 hover:bg-gray-100 transition-all group">
                                        <Plus className="text-gray-300 group-hover:text-accent-500" size={24} />
                                        <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Add Doc</span>
                                    </button>
                                </div>
                            </section>
                        </div>
                    )}

                    {/* CONTACT TAB */}
                    {activeTab === "contact" && (
                        <div className="animate-fade-up space-y-12">
                            <section className="bg-white rounded-[2.5rem] p-10 border border-gray-100 shadow-sm space-y-8">
                                <SectionHeader icon={Phone} title="Institutional Frequency & Mail" />
                                <div className="grid md:grid-cols-2 gap-8">
                                    {(settings.contact?.cards || []).map((card, idx) => (
                                        <div key={idx} className="bg-gray-50 p-8 rounded-[2.5rem] border border-gray-200 space-y-4 group relative">
                                            <button onClick={() => {
                                                const newCards = settings.contact.cards.filter((_, i) => i !== idx);
                                                updateNestedField("contact.cards", newCards);
                                            }} className="absolute top-4 right-4 text-red-400 opacity-0 group-hover:opacity-100 transition-all"><Trash2 size={16} /></button>
                                            <Input label="Channel Title (Phone, Email, etc.)" value={card.title} onChange={(e) => {
                                                const newCards = [...settings.contact.cards];
                                                newCards[idx].title = e.target.value;
                                                updateNestedField("contact.cards", newCards);
                                            }} />
                                            <Input label="Quick Narrative Label" value={card.label} onChange={(e) => {
                                                const newCards = [...settings.contact.cards];
                                                newCards[idx].label = e.target.value;
                                                updateNestedField("contact.cards", newCards);
                                            }} />
                                            <div className="space-y-4">
                                                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Details List</label>
                                                {(card.details || []).map((detail, dIdx) => (
                                                    <div key={dIdx} className="flex gap-2">
                                                        <Input className="flex-1" value={detail} onChange={(e) => {
                                                            const newCards = [...settings.contact.cards];
                                                            newCards[idx].details[dIdx] = e.target.value;
                                                            updateNestedField("contact.cards", newCards);
                                                        }} />
                                                        <button onClick={() => {
                                                            const newCards = [...settings.contact.cards];
                                                            newCards[idx].details = newCards[idx].details.filter((_, i) => i !== dIdx);
                                                            updateNestedField("contact.cards", newCards);
                                                        }} className="text-red-400 p-2"><Trash2 size={14} /></button>
                                                    </div>
                                                ))}
                                                <button onClick={() => {
                                                    const newCards = [...settings.contact.cards];
                                                    newCards[idx].details = [...(newCards[idx].details || []), "new detail"];
                                                    updateNestedField("contact.cards", newCards);
                                                }} className="text-[9px] font-black uppercase tracking-widest text-accent-500">+ Add Entry</button>
                                            </div>
                                        </div>
                                    ))}
                                    <button onClick={() => {
                                        const newCards = [...(settings.contact?.cards || []), { title: "New Channel", label: "Description", details: [], icon: "Phone", color: "bg-gray-50 text-gray-950" }];
                                        updateNestedField("contact.cards", newCards);
                                    }} className="bg-gray-50 p-8 rounded-[2.5rem] border-2 border-dashed border-gray-100 flex flex-col items-center justify-center gap-2 hover:bg-gray-100 transition-all group">
                                        <Plus className="text-gray-300 group-hover:text-accent-500" size={32} />
                                        <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Add Channel</span>
                                    </button>
                                </div>
                            </section>

                            <section className="bg-white rounded-[2.5rem] p-10 border border-gray-100 shadow-sm space-y-8">
                                <SectionHeader icon={Compass} title="Campus Residency & Residency" />
                                <div className="space-y-6">
                                    <Input label="Institutional Campus Title" value={settings.contact?.location?.campusName || ""} onChange={(e) => updateNestedField("contact.location.campusName", e.target.value)} />
                                    <Input label="Full Operational Address" value={settings.contact?.location?.address || ""} onChange={(e) => updateNestedField("contact.location.address", e.target.value)} />
                                    <Input label="Google Maps Embed URL" value={settings.contact?.location?.mapLink || ""} onChange={(e) => updateNestedField("contact.location.mapLink", e.target.value)} placeholder="https://www.google.com/maps/embed?..." />
                                </div>
                            </section>

                            <section className="bg-white rounded-[2.5rem] p-10 border border-gray-100 shadow-sm space-y-8">
                                <SectionHeader icon={MessageSquare} title="FAQ Registry" />
                                <div className="space-y-6">
                                    {(settings.contact?.faqs || []).map((faq, idx) => (
                                        <div key={idx} className="bg-gray-50 p-6 rounded-2xl border border-gray-200 relative group">
                                            <button onClick={() => {
                                                const newFaqs = settings.contact.faqs.filter((_, i) => i !== idx);
                                                updateNestedField("contact.faqs", newFaqs);
                                            }} className="absolute top-4 right-4 text-red-400 opacity-0 group-hover:opacity-100 transition-all"><Trash2 size={16} /></button>
                                            <div className="space-y-4">
                                                <Input label="Question" value={faq.q} onChange={(e) => {
                                                    const newFaqs = [...settings.contact.faqs];
                                                    newFaqs[idx].q = e.target.value;
                                                    updateNestedField("contact.faqs", newFaqs);
                                                }} />
                                                <textarea placeholder="Answer" className="w-full px-4 py-3 bg-white rounded-xl text-sm font-medium border border-gray-200 min-h-[80px]" value={faq.a} onChange={(e) => {
                                                    const newFaqs = [...settings.contact.faqs];
                                                    newFaqs[idx].a = e.target.value;
                                                    updateNestedField("contact.faqs", newFaqs);
                                                }} />
                                            </div>
                                        </div>
                                    ))}
                                    <button onClick={() => {
                                        const newFaqs = [...(settings.contact.faqs || []), { q: "New Question?", a: "Answer here." }];
                                        updateNestedField("contact.faqs", newFaqs);
                                    }} className="w-full py-4 rounded-2xl border-2 border-dashed border-gray-100 hover:border-accent-200 hover:bg-accent-50 transition-all flex items-center justify-center gap-2 group">
                                        <Plus className="text-gray-300 group-hover:text-accent-500" size={20} />
                                        <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 group-hover:text-accent-700">Add New FAQ</span>
                                    </button>
                                </div>
                            </section>
                        </div>
                    )}

                    {/* FOOTER TAB */}
                    {activeTab === "footer" && (
                        <div className="animate-fade-up space-y-12">
                            <section className="bg-white rounded-[2.5rem] p-10 border border-gray-100 shadow-sm space-y-8">
                                <SectionHeader icon={Copyright} title="Institutional Footer" />
                                <div className="space-y-8">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Footer Operational Mission</label>
                                        <textarea className="w-full px-6 py-4 bg-gray-50 rounded-2xl font-bold text-sm outline-none focus:ring-4 focus:ring-accent-50 border border-transparent focus:border-accent-200 transition-all font-sans min-h-[100px]" value={settings.global?.footerMission || ""} onChange={(e) => updateNestedField("global.footerMission", e.target.value)} />
                                    </div>
                                    <Input label="Legal Copyright Line" value={settings.global?.footerCopyright || ""} onChange={(e) => updateNestedField("global.footerCopyright", e.target.value)} placeholder="© 2024 School Name..." />
                                    <div className="grid md:grid-cols-2 gap-8">
                                        <Input label="Global vision Descriptor" value={settings.global?.visionStatement || ""} onChange={(e) => updateNestedField("global.visionStatement", e.target.value)} />
                                        <Input label="Footer CTA Text" value={settings.global?.ctaButtonText || ""} onChange={(e) => updateNestedField("global.ctaButtonText", e.target.value)} />
                                    </div>
                                </div>
                            </section>
                        </div>
                    )}

                </main>
            </div>
        </div>
    );
};

export default AdminSiteEditor;
