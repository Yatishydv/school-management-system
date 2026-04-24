import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from '../api/axios';

const SiteSettingsContext = createContext();

export const INITIAL_SETTINGS = {
    schoolName: "SBS BADHWANA",
    logo: "",
    global: {
        footerMission: "Empowering the next generation with excellence in education, ethics, and innovation.",
        visionStatement: "Vision 2024",
        visionQuote: "Nurturing leaders for the Indian Armed Forces and beyond.",
        ctaButtonText: "Join Our Legacy",
        footerCopyright: "© 2024 SBS Badhwana. All rights reserved.",
        foundationYear: "20Y+",
        holisticVision: "100%",
        aboutStats: [
            { label: "Proven Excellence", value: "20Y+", icon: "TrendingUp" },
            { label: "Holistic Vision", value: "100%", icon: "Globe" }
        ]
    },
    home: {
        hero: {
            badge: { text: "Excellence Since 2004", icon: "Sparkles" },
            title: "Inspiring Minds, Empowering Futures.",
            subtitle: "At SBS, we bridge the gap between curiosity and competence. Modern facilities meet timeless values.",
            image: "",
            primaryBtn: { text: "Learn More", url: "/about" },
            secondaryBtn: { text: "Contact Us", url: "/contact" }
        },
        stats: [
            { label: "Annual Success", value: "98.5%" },
            { label: "Awards Won", value: "50+" },
            { label: "Alumni Network", value: "5,000+" },
            { label: "Faculty Ratio", value: "15:1" }
        ],
        advantage: {
            badge: { text: "Core Value Proposition", icon: "Award" },
            title: "The SBS Advantage.",
            subtitle: "We've spent 20 years perfecting an educational model that works. Modern in approach, historical in results.",
            features: [
                { 
                    icon: "BookOpen", 
                    title: "Smart Learning", 
                    desc: "Interactive pedagogy for the 21st century focusing on critical thinking.",
                    badge: "Innovative",
                    link: { text: "Learn More", url: "/about" },
                    details: ["Digital First Curricula", "Lego Robotics Lab", "Research-led Teaching"]
                },
                { 
                    icon: "Users", 
                    title: "Elite Alumni Network", 
                    desc: "Our graduates serve with distinction in the Indian Army, Air Force, and leading global corporations.",
                    badge: "Professional",
                    link: { text: "Learn More", url: "/about" }
                },
                { 
                    icon: "Shield", 
                    title: "Safe Haven", 
                    desc: "24/7 security and a supportive environment for holistic well-being.",
                    badge: "Secure",
                    link: { text: "Learn More", url: "/about" }
                },
                { 
                    icon: "Sparkles", 
                    title: "Creative Arts", 
                    desc: "Nurturing the next generation of artists and creators.",
                    badge: "Creative",
                    link: { text: "Learn More", url: "/about" }
                }
            ]
        },
        principal: {
            title: "Leadership with Vision.",
            name: "Mr. Sanjay Sharma",
            designation: "Principal & Founder",
            quote: "We believe that every child is a unique universe. Our mission is to help them discover their own path to excellence.",
            image: "",
            points: ["Expertise", "Integrity", "Results"]
        },
        cta: {
            badge: { text: "20 Years of Educational Leadership", icon: "Trophy" },
            title: "Join Our Legacy.",
            subtitle: "Vision 2024",
            primaryBtn: { text: "Apply Now", url: "/admissions" }
        },
    },
    about: {
        hero: {
            badge: { text: "Our Story", icon: "Sparkles" },
            title: "Inspiring Minds, Empowering Futures.",
            subtitle: "Nurturing the leaders of tomorrow with modern technology and traditional values.",
            points: ["Academic Rigor", "Character Building", "Global Outlook"]
        },
        heritage: {
            badge: { text: "Our Heritage", icon: "History" },
            title: "A Legacy of Heart & Mind.",
            story: "Established in 2004, SBS Badhwana began as a vision to bring world-class education..."
        },
        mission: { title: "The Mission", content: "To provide an inclusive, stimulating environment that fosters curiosity and academic excellence." },
        vision: { title: "The Vision", content: "To be a global leader in transformative education, shaping character and competence." },
        philosophy: { title: "Core", accent: "Philosophy." },
        values: [
            { icon: "Shield", title: "Integrity", desc: "Honesty and moral principles are the foundation of everything we do." },
            { icon: "Zap", title: "Passion", desc: "Igniting a lifelong love for learning in every student's heart." },
            { icon: "Star", title: "Excellence", desc: "Striving for the highest standards in academics and sports." },
            { icon: "Compass", title: "Empathy", desc: "Understanding and respecting ourselves and the global community." }
        ],
        cta: {
            title: "Begin Your Journey With",
            subtitle: "Admissions are now open for the new academic session. Join us today.",
            btnText: "Apply for Admission"
        }
    },
    admissions: {
        hero: {
            badge: { text: "Session 2024-25 Open", icon: "Sparkles" },
            title: "Shape Their Elite Future.",
            subtitle: "Bridge the gap between potential and excellence.",
            image: ""
        },
        process: {
            badge: { text: "The Admission Cycle", icon: "RotateCcw" },
            title: "Four Steps to Excellence.",
            steps: [
                { title: "Discovery", desc: "Connect with our admissions office.", icon: "Search", badge: "Inquiry" },
                { title: "Digital Dossier", desc: "Complete the online application.", icon: "FileText", badge: "Document" },
                { title: "Interaction", desc: "A personalized evaluation session.", icon: "Users", badge: "Assessment" },
                { title: "Victory", desc: "Secure your legacy.", icon: "Trophy", badge: "Enrollment" }
            ]
        },
        checklist: {
            title: "Essentials for Application.",
            subtitle: "Required Documents Checklist",
            items: [
                { title: "Birth Certificate", desc: "Original digital copy or scanned physical.", icon: "ClipboardList" },
                { title: "Identity Records", desc: "Aadhar card of student and both parents.", icon: "ShieldCheck" },
                { title: "Academic History", desc: "Previous report cards and transfer certs.", icon: "BookOpen" }
            ]
        },
        support: {
            badge: "Need Assistance?",
            title: "Admissions Counseling",
            subtitle: "Our team is here to guide you through every step of the enrollment process."
        },
        cta: {
            title: "Ready to Apply?",
            subtitle: "The application portal is open for all classes from Nursery to XII."
        }
    },
    contact: {
        hero: {
            badge: { text: "Connect with our Institution", icon: "Phone" },
            title: "Contact Our Campus.",
            subtitle: "Reach out to our administrative team for inquiries."
        },
        cards: [
            { title: "Phone Support", icon: "Headphones", details: ["Office: +91 98765 43210", "Admin: +91 88001 23456"], color: "bg-blue-50 text-blue-600", label: "Call Us Anytime" },
            { title: "Email Inquiry", icon: "Mail", details: ["info@sbsschool.com", "admissions@sbsschool.com"], color: "bg-accent-50 text-accent-700", label: "Digital Response" },
            { title: "Campus Hours", icon: "Calendar", details: ["Mon – Fri: 9:00 AM - 3:00 PM", "Sat: 9:00 AM - 12:00 PM"], color: "bg-purple-50 text-purple-600", label: "Working Schedule" }
        ],
        location: {
            badge: { text: "Campus Location", icon: "MapPin" },
            title: "Visit Our Institution.",
            campusName: "SBS Badhwana",
            address: "Village Badhwana, Tehsil Dadri, Charkhi Dadri, Haryana – 127308",
            mapLink: ""
        },
        messagePortal: {
            title: "Connect With Us.",
            subtitle: "Your inquiries drive our campus forward.",
            features: [
                { title: "Secure Data Protocol", icon: "Shield" },
                { title: "Priority Campus Support", icon: "Users" }
            ]
        },
        faqs: [
            { q: "How can I apply for admission?", a: "Applications can be initiated via our online digital portal or through a physical kit." },
            { q: "What are the standard office hours?", a: "We are operational Monday through Friday, 9:00 AM to 3:00 PM." }
        ],
        socialSection: {
            title: "Stay Connected.",
            subtitle: "Follow our legacy through modern digital space"
        }
    },
    socialLinks: {
        facebook: "",
        instagram: "",
        twitter: "",
        youtube: "",
        whatsapp: "",
        linkedin: ""
    },
    theme: {
        primaryColor: "#0a0a0a",
        accentColor: "#10b981",
        secondaryColor: "#6366f1",
        fontFamily: "Inter, sans-serif"
    },
    layout: {
        home: { showHero: true, showStats: true, showAdvantage: true, showPrincipal: true, showCta: true },
        about: { showHero: true, showHeritage: true, showMissionVision: true, showValues: true, showPrincipal: true, showCta: true },
        admissions: { showHero: true, showProcess: true, showChecklist: true, showForm: true, showSupport: true },
        contact: { showHero: true, showCards: true, showLocation: true, showForm: true, showFaqs: true }
    }
};

// Defensive deep merge logic
export const mergeSettings = (defaults, data) => {
    if (!data) return defaults;
    const result = { ...defaults };
    
    Object.keys(data).forEach(key => {
        if (data[key] && typeof data[key] === 'object' && !Array.isArray(data[key])) {
            result[key] = (defaults[key] && typeof defaults[key] === 'object')
                ? mergeSettings(defaults[key], data[key])
                : data[key];
        } else if (Array.isArray(data[key])) {
            result[key] = data[key].length > 0 ? data[key] : defaults[key];
        } else if (data[key] !== undefined && data[key] !== null) {
            result[key] = data[key];
        }
    });
    return result;
};

export const SiteSettingsProvider = ({ children }) => {
    const [settings, setSettings] = useState(INITIAL_SETTINGS);
    const [loading, setLoading] = useState(true);

    const fetchSettings = async () => {
        try {
            const response = await axios.get('/public/settings');
            
            // Use external mergeSettings
            const finalSettings = mergeSettings(INITIAL_SETTINGS, response.data);
            setSettings(finalSettings);
        } catch (error) {
            console.error("Failed to load site settings, using defaults:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSettings();

        // Listen for live preview messages from AdminSiteEditor
        const handleMessage = (event) => {
            if (event.data?.type === 'LIVE_PREVIEW_UPDATE') {
                setSettings(prev => ({ ...prev, ...event.data.settings }));
            }
        };

        window.addEventListener('message', handleMessage);
        
        // Notify parent editor that the iframe is ready to receive live configurations
        if (window.parent !== window) {
            window.parent.postMessage({ type: 'IFRAME_READY' }, '*');
            
            // Prevent navigation in editor mode
            const preventNav = (e) => {
                const link = e.target.closest('a, button');
                if (link) {
                    e.preventDefault();
                }
            };
            document.addEventListener('click', preventNav, true);
            
            return () => {
                window.removeEventListener('message', handleMessage);
                document.removeEventListener('click', preventNav, true);
            };
        }

        return () => window.removeEventListener('message', handleMessage);
    }, []);

    const refreshSettings = () => fetchSettings();

    const isEditorMode = window.parent !== window;

    const dispatchInlineEdit = (path, value) => {
        if (isEditorMode) {
            window.parent.postMessage({
                type: 'LIVE_INLINE_UPDATE',
                path,
                value
            }, '*');
        }
    };

    const dispatchElementClick = (elementType, path, label) => {
        if (isEditorMode) {
            window.parent.postMessage({
                type: 'LIVE_FOCUS_FIELD',
                elementType,
                path,
                label
            }, '*');
        }
    };

    return (
        <SiteSettingsContext.Provider value={{ settings, setSettings, loading, refreshSettings, isEditorMode, dispatchInlineEdit, dispatchElementClick }}>
            {children}
        </SiteSettingsContext.Provider>
    );
};

export const useSiteSettings = () => {
    const context = useContext(SiteSettingsContext);
    if (!context) {
        throw new Error('useSiteSettings must be used within a SiteSettingsProvider');
    }
    return context;
};
