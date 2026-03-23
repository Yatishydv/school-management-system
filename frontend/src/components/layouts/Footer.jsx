import React from "react";
import { Link } from "react-router-dom";

const Footer = () => {
    return (
        <footer className="bg-gray-950 text-gray-300 py-16 border-t border-accent-500/30 shadow-inner">
            <div className="container mx-auto px-6 max-w-7xl">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12">

                    {/* Brand */}
                    <div>
                        <h3 className="text-2xl font-heading font-bold text-white tracking-wide mb-4">
                            SBS Badhwana
                        </h3>
                        <p className="text-gray-400 leading-relaxed font-sans">
                            Committed to excellence in education and character development.
                        </p>
                    </div>

                    {/* Links */}
                    <div>
                        <h3 className="text-xl font-heading font-semibold text-white mb-4">
                            Quick Links
                        </h3>
                        <ul className="space-y-3">
                            <li>
                                <Link to="/about" className="hover:text-accent-400 transition font-sans">
                                    About Us
                                </Link>
                            </li>
                            <li>
                                <Link to="/gallery" className="hover:text-accent-400 transition font-sans">
                                    Gallery
                                </Link>
                            </li>
                            <li>
                                <Link to="/teachers" className="hover:text-accent-400 transition font-sans">
                                    Our Teachers
                                </Link>
                            </li>
                            <li>
                                <Link to="/contact" className="hover:text-accent-400 transition font-sans">
                                    Contact
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Contact */}
                    <div>
                        <h3 className="text-xl font-heading font-semibold text-white mb-4">
                            Contact Us
                        </h3>
                        <p className="text-gray-400 font-sans">Main Street, Badhwana</p>
                        <p className="text-gray-400 font-sans">info@sbsbadhwana.edu</p>
                        <p className="text-gray-400 font-sans">+91 123 456 7890</p>
                    </div>

                    {/* Social (NO ICONS to avoid errors) */}
                    <div>
                        <h3 className="text-xl font-heading font-semibold text-white mb-4">
                            Follow Us
                        </h3>
                        <div className="flex flex-col space-y-2 text-gray-400 font-sans">
                            <span>Facebook</span>
                            <span>Instagram</span>
                            <span>Twitter</span>
                        </div>
                    </div>

                </div>

                {/* Bottom */}
                <div className="mt-12 text-center text-gray-500 border-t border-gray-800 pt-6 text-sm font-sans">
                    © {new Date().getFullYear()} SBS Badhwana — All Rights Reserved.
                </div>
            </div>
        </footer>
    );
};

export default Footer;
