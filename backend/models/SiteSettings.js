import mongoose from 'mongoose';

const siteSettingsSchema = new mongoose.Schema({
    // --- GLOBAL SETTINGS ---
    schoolName: { type: String, default: "SBS Badhwana" },
    logo: { type: String },
    global: {
        footerMission: { type: String, default: "Empowering the next generation with excellence in education, ethics, and innovation." },
        visionStatement: { type: String, default: "Vision 2024" },
        visionQuote: { type: String, default: "Nurturing leaders for the Indian Armed Forces and beyond." },
        ctaButtonText: { type: String, default: "Join Our Legacy" },
        footerCopyright: { type: String, default: "© 2024 SBS Badhwana. All rights reserved." }
    },

    // --- HOME PAGE ---
    home: {
        hero: {
            badge: { type: String, default: "Excellence Since 2004" },
            title: { type: String, default: "Inspiring Minds, Empowering Futures." },
            subtitle: { type: String, default: "At SBS, we bridge the gap between curiosity and competence. Modern facilities meet timeless values." },
            image: { type: String }
        },
        stats: [
            { label: { type: String, default: "Annual Success" }, value: { type: String, default: "98.5%" } },
            { label: { type: String, default: "Awards Won" }, value: { type: String, default: "50+" } },
            { label: { type: String, default: "Alumni Network" }, value: { type: String, default: "5,000+" } },
            { label: { type: String, default: "Faculty Ratio" }, value: { type: String, default: "15:1" } }
        ],
        advantage: {
            badge: { type: String, default: "Core Value Proposition" },
            title: { type: String, default: "The SBS Advantage." },
            subtitle: { type: String, default: "We've spent 20 years perfecting an educational model that works. Modern in approach, historical in results." },
            features: [
                { 
                    icon: { type: String, default: "BookOpen" }, 
                    title: { type: String, default: "Smart Learning" }, 
                    desc: { type: String, default: "Interactive pedagogy for the 21st century focusing on critical thinking." },
                    badge: { type: String, default: "Innovative" },
                    details: [{ type: String }]
                }
            ]
        },
        principal: {
            title: { type: String, default: "Leadership with Vision." },
            name: { type: String, default: "Mr. Sanjay Sharma" },
            designation: { type: String, default: "Principal & Founder" },
            quote: { type: String, default: "We believe that every child is a unique universe. Our mission is to help them discover their own path to excellence." },
            image: { type: String },
            points: [{ type: String, default: "Expertise" }]
        },
        cta: {
            badge: { type: String, default: "20 Years of Educational Leadership" },
            title: { type: String, default: "Start your Elite Journey." },
            subtitle: { type: String, default: "Join a tradition of excellence where we nurture future leaders." },
            primaryBtn: { type: String, default: "Apply for Admission" },
            secondaryBtn: { type: String, default: "Virtual Tour" },
            trustText: { type: String, default: "Trusted by 5000+ parents across India." }
        }
    },

    // --- ABOUT PAGE ---
    about: {
        hero: {
            badge: { type: String, default: "Sparkles" },
            title: { type: String, default: "Inspiring Minds, Empowering Futures." },
            subtitle: { type: String, default: "Nurturing the leaders of tomorrow with modern technology and traditional values." }
        },
        heritage: {
            badge: { type: String, default: "Our Heritage" },
            title: { type: String, default: "A Legacy of Heart & Mind." },
            story: { type: String, default: "Established in 2004, SBS Badhwana began as a vision to bring world-class education to the heart of Badhwana. What started as a small cohort has blossomed into a community of over 5,000 successful alumni." }
        },
        mission: { title: { type: String, default: "The Mission" }, content: { type: String, default: "To provide an inclusive, stimulating environment..." } },
        vision: { title: { type: String, default: "The Vision" }, content: { type: String, default: "To be a global leader in transformative education..." } },
        values: [
            { icon: { type: String, default: "Shield" }, title: { type: String, default: "Integrity" }, desc: { type: String, default: "Honesty and moral principles are the foundation..." } }
        ]
    },

    // --- ADMISSIONS PAGE ---
    admissions: {
        hero: {
            badge: { type: String, default: "Session 2024-25 Open" },
            title: { type: String, default: "Shape Their Elite Future." },
            subtitle: { type: String, default: "Bridge the gap between potential and excellence." },
            image: { type: String }
        },
        process: {
            badge: { type: String, default: "The Admission Cycle" },
            title: { type: String, default: "Four Steps to Excellence." },
            steps: [
                { title: { type: String, default: "Discovery" }, desc: { type: String, default: "Connect with our admissions office." }, icon: { type: String, default: "Search" }, badge: { type: String, default: "Inquiry" } }
            ]
        },
        checklist: {
            title: { type: String, default: "Essentials for Application." },
            subtitle: { type: String, default: "Required Documents Checklist" },
            items: [
                { title: { type: String, default: "Birth Certificate" }, desc: { type: String, default: "Original digital copy or scanned physical." }, icon: { type: String, default: "ClipboardList" } }
            ]
        }
    },

    // --- CONTACT PAGE ---
    contact: {
        hero: {
            badge: { type: String, default: "Connect with our Institution" },
            title: { type: String, default: "Contact Our Campus." },
            subtitle: { type: String, default: "Reach out to our administrative team for inquiries." }
        },
        cards: [
            { title: { type: String, default: "Phone Support" }, icon: { type: String, default: "Headphones" }, details: [{ type: String, default: "Office: +91 98765 43210" }], color: { type: String, default: "bg-blue-50 text-blue-600" }, label: { type: String, default: "Call Us Anytime" } }
        ],
        location: {
            badge: { type: String, default: "Campus Location" },
            title: { type: String, default: "Visit Our Institution." },
            campusName: { type: String, default: "S.B.S. Senior Secondary School" },
            address: { type: String, default: "Village Badhwana, Tehsil Dadri, Charkhi Dadri, Haryana – 127308" },
            mapLink: { type: String, default: "https://www.google.com/maps/embed?..." }
        },
        messagePortal: {
            title: { type: String, default: "Connect With Us." },
            subtitle: { type: String, default: "Your inquiries drive our campus forward." },
            features: [{ title: { type: String, default: "Secure Data Protocol" }, icon: { type: String, default: "Shield" } }]
        },
        faqs: [
            { q: { type: String, default: "How can I apply?" }, a: { type: String, default: "Applications can be initiated via our online portal." } }
        ],
        socialSection: {
            title: { type: String, default: "Stay Connected." },
            subtitle: { type: String, default: "Follow our legacy through modern digital space" }
        }
    },

    // --- UNIFIED SOCIALS ---
    socialLinks: {
        facebook: { type: String, default: "" },
        instagram: { type: String, default: "" },
        twitter: { type: String, default: "" },
        youtube: { type: String, default: "" },
        whatsapp: { type: String, default: "" },
        linkedin: { type: String, default: "" }
    },

    // --- THEME & LAYOUT ENGINE ---
    theme: {
        primaryColor: { type: String, default: "#0a0a0a" }, // primary-950
        accentColor: { type: String, default: "#10b981" },  // emerald-500
        secondaryColor: { type: String, default: "#6366f1" }, // indigo-500
        fontFamily: { type: String, default: "Inter, sans-serif" }
    },

    layout: {
        home: {
            showHero: { type: Boolean, default: true },
            showStats: { type: Boolean, default: true },
            showAdvantage: { type: Boolean, default: true },
            showPrincipal: { type: Boolean, default: true },
            showCta: { type: Boolean, default: true }
        },
        about: {
            showHero: { type: Boolean, default: true },
            showHeritage: { type: Boolean, default: true },
            showMissionVision: { type: Boolean, default: true },
            showValues: { type: Boolean, default: true }
        },
        admissions: {
            showHero: { type: Boolean, default: true },
            showProcess: { type: Boolean, default: true },
            showChecklist: { type: Boolean, default: true }
        },
        contact: {
            showHero: { type: Boolean, default: true },
            showCards: { type: Boolean, default: true },
            showLocation: { type: Boolean, default: true },
            showForm: { type: Boolean, default: true },
            showFaqs: { type: Boolean, default: true }
        }
    }
}, { timestamps: true });


const SiteSettings = mongoose.model('SiteSettings', siteSettingsSchema);

export default SiteSettings;
