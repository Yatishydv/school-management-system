import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from '../api/axios';

const SiteSettingsContext = createContext();

const INITIAL_SETTINGS = {
    schoolName: "SBS BADHWANA",
    logo: "",
    global: {
        footerMission: "Empowering the next generation with excellence in education, ethics, and innovation.",
        visionStatement: "Vision 2024",
        visionQuote: "Nurturing leaders for the Indian Armed Forces and beyond.",
        ctaButtonText: "Join Our Legacy",
        footerCopyright: "© 2024 SBS Badhwana. All rights reserved."
    },
    home: {
        hero: {
            badge: "Excellence Since 2004",
            title: "Inspiring Minds, Empowering Futures.",
            subtitle: "At SBS, we bridge the gap between curiosity and competence. Modern facilities meet timeless values.",
            image: ""
        },
        stats: [
            { label: "Annual Success", value: "98.5%" },
            { label: "Awards Won", value: "50+" },
            { label: "Alumni Network", value: "5,000+" },
            { label: "Faculty Ratio", value: "15:1" }
        ],
        advantage: {
            badge: "Core Value Proposition",
            title: "The SBS Advantage.",
            subtitle: "We've spent 20 years perfecting an educational model that works. Modern in approach, historical in results.",
            features: [
                { 
                    icon: "BookOpen", 
                    title: "Smart Learning", 
                    desc: "Interactive pedagogy for the 21st century focusing on critical thinking.",
                    badge: "Innovative",
                    details: ["Digital First Curricula", "Lego Robotics Lab", "Research-led Teaching"]
                },
                { 
                    icon: "Users", 
                    title: "Elite Alumni Network", 
                    desc: "Our graduates serve with distinction in the Indian Army, Air Force, and leading global corporations.",
                    badge: "Professional"
                },
                { 
                    icon: "Shield", 
                    title: "Safe Haven", 
                    desc: "24/7 security and a supportive environment for holistic well-being.",
                    badge: "Secure"
                },
                { 
                    icon: "Sparkles", 
                    title: "Creative Arts", 
                    desc: "Nurturing the next generation of artists and creators.",
                    badge: "Creative"
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
            badge: "20 Years of Educational Leadership",
            title: "Start your Elite Journey.",
            subtitle: "Join a tradition of excellence where we nurture future leaders.",
            primaryBtn: "Apply for Admission",
            secondaryBtn: "Virtual Tour",
            trustText: "Trusted by 5000+ parents across India."
        }
    },
    about: {
        hero: {
            badge: "Our Story",
            title: "Inspiring Minds, Empowering Futures.",
            subtitle: "Nurturing the leaders of tomorrow with modern technology and traditional values."
        },
        heritage: {
            badge: "Our Heritage",
            title: "A Legacy of Heart & Mind.",
            story: "Established in 2004, SBS Badhwana began as a vision to bring world-class education..."
        },
        mission: { title: "The Mission", content: "To provide an inclusive, stimulating environment..." },
        vision: { title: "The Vision", content: "To be a global leader in transformative education..." },
        values: [
            { icon: "Shield", title: "Integrity", desc: "Honesty and moral principles are the foundation..." },
            { icon: "Zap", title: "Passion", desc: "Igniting a lifelong love for learning in every student's heart." },
            { icon: "Star", title: "Excellence", desc: "Striving for the highest standards in academics and sports." },
            { icon: "Compass", title: "Empathy", desc: "Understanding and respecting ourselves and the global community." }
        ]
    },
    admissions: {
        hero: {
            badge: "Session 2024-25 Open",
            title: "Shape Their Elite Future.",
            subtitle: "Bridge the gap between potential and excellence.",
            image: ""
        },
        process: {
            badge: "The Admission Cycle",
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
        }
    },
    contact: {
        hero: {
            badge: "Connect with our Institution",
            title: "Contact Our Campus.",
            subtitle: "Reach out to our administrative team for inquiries."
        },
        cards: [
            { title: "Phone Support", icon: "Headphones", details: ["Office: +91 98765 43210", "Admin: +91 88001 23456"], color: "bg-blue-50 text-blue-600", label: "Call Us Anytime" },
            { title: "Email Inquiry", icon: "Mail", details: ["info@sbsschool.com", "admissions@sbsschool.com"], color: "bg-accent-50 text-accent-700", label: "Digital Response" },
            { title: "Campus Hours", icon: "Calendar", details: ["Mon – Fri: 9:00 AM - 3:00 PM", "Sat: 9:00 AM - 12:00 PM"], color: "bg-purple-50 text-purple-600", label: "Working Schedule" }
        ],
        location: {
            badge: "Campus Location",
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
    }
};

export const SiteSettingsProvider = ({ children }) => {
    const [settings, setSettings] = useState(INITIAL_SETTINGS);
    const [loading, setLoading] = useState(true);

    const fetchSettings = async () => {
        try {
            const response = await axios.get('/public/settings');
            
            // Defensive deep merge logic
            const mergeSettings = (defaults, data) => {
                if (!data) return defaults;
                const result = { ...defaults };
                
                Object.keys(data).forEach(key => {
                    if (data[key] && typeof data[key] === 'object' && !Array.isArray(data[key])) {
                        result[key] = (defaults[key] && typeof defaults[key] === 'object')
                            ? mergeSettings(defaults[key], data[key])
                            : data[key];
                    } else if (Array.isArray(data[key])) {
                        // Only override defaults if the provided array is not empty
                        result[key] = data[key].length > 0 ? data[key] : defaults[key];
                    } else if (data[key] !== undefined && data[key] !== null) {
                        result[key] = data[key];
                    }
                });
                return result;
            };

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
    }, []);

    const refreshSettings = () => fetchSettings();

    return (
        <SiteSettingsContext.Provider value={{ settings, loading, refreshSettings }}>
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
