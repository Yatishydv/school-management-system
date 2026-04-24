import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { LogOut, Menu, X } from "lucide-react";
import useAuthStore from "../../stores/authStore";
import Button from "../ui/Button";
import { useSiteSettings } from "../../context/SiteSettingsContext";
import EditableRegion from "../ui/EditableRegion";

const Navbar = () => {
  const { settings, loading } = useSiteSettings();
  const [isOpen, setIsOpen] = useState(false);

  const { token, user, logout } = useAuthStore();
  const isAuthenticated = !!token;

  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { name: "Home", path: "/" },
    { name: "About", path: "/about" },
    { name: "Gallery", path: "/gallery" },
    { name: "Admissions", path: "/admissions" },
    { name: "Contact", path: "/contact" },
  ];

  const dashboardPath = user ? `/${user.role}/dashboard` : "/login";

  if (loading || !settings) return null;

  const theme = settings.theme || { primaryColor: "#0a0a0a", accentColor: "#10b981" };

  return (
    <header className={`fixed left-1/2 -translate-x-1/2 w-[90%] max-w-6xl z-50 transition-all duration-500 rounded-full border border-white/50 ${
      scrolled 
        ? "top-3 bg-white/70 backdrop-blur-2xl shadow-xl py-0" 
        : "top-6 bg-white/50 backdrop-blur-xl shadow-md py-0.5"
    }`}>
      <div className="container mx-auto px-6">
        <div className="flex items-center justify-between h-14">
          {/* LOGO */}
          <Link
            to="/"
            className="text-2xl font-heading font-extrabold tracking-tight"
            style={{ color: theme.primaryColor }}
          >
            <EditableRegion type="text" path="schoolName" label="School Name">
                {settings.schoolName || "Institution"}<span style={{ color: theme.accentColor }}>.</span>
            </EditableRegion>
          </Link>

          {/* Desktop Menu */}
          <nav className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                className="text-base font-medium transition-colors duration-300 relative group"
                style={{ color: theme.primaryColor }}
              >
                {link.name}
                <span className="absolute left-0 bottom-0 w-full h-0.5 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 ease-out" style={{ backgroundColor: theme.accentColor }} />
              </Link>
            ))}
          </nav>

          {/* Desktop Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                <Link to={dashboardPath}>
                  <Button
                    variant="secondary"
                    size="sm"
                    className="!rounded-full border border-gray-100 bg-white/50 backdrop-blur-sm shadow-sm font-black"
                  >
                    Dashboard
                  </Button>
                </Link>
                <Button
                  variant="ghost"
                  onClick={logout}
                  className="p-1 hover:bg-transparent -translate-y-0 transition-all"
                  style={{ "--hover-color": theme.accentColor }}
                >
                  <LogOut size={22} className="opacity-70 group-hover:opacity-100" />
                </Button>
              </>
            ) : (
              <Link to="/login">
                <Button
                  variant="accent"
                  size="sm"
                  className="!rounded-full border border-white/20 shadow-xl"
                  style={{ backgroundColor: theme.accentColor, boxShadow: `0 20px 25px -5px ${theme.accentColor}30` }}
                >
                  Login
                </Button>
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              onClick={() => setIsOpen(!isOpen)}
              className="text-primary-900 hover:bg-gray-200"
            >
              {isOpen ? <X size={28} /> : <Menu size={28} />}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        className={`md:hidden overflow-hidden transition-all duration-500 ease-in-out mt-2 ${
          isOpen ? "max-h-screen opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <nav className="px-4 pt-2 pb-8 space-y-2 bg-white/90 backdrop-blur-lg rounded-[2rem] shadow-xl border border-white/40 mx-2 mb-4">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              to={link.path}
              onClick={() => setIsOpen(false)}
              className="block px-6 py-4 rounded-xl text-lg font-medium transition-all duration-200"
              style={{ color: theme.primaryColor }}
            >
              {link.name}
            </Link>
          ))}

          <div className="pt-4 border-t border-gray-100/50">
            {isAuthenticated ? (
              <div className="space-y-3 px-2">
                <Link to={dashboardPath} onClick={() => setIsOpen(false)}>
                  <Button 
                    variant="primary"
                    size="md"
                    className="w-full !rounded-full shadow-xl"
                    style={{ backgroundColor: theme.primaryColor }}
                  >
                    Dashboard
                  </Button>
                </Link>

                <Button
                  onClick={logout}
                  variant="ghost"
                  className="w-full !rounded-full text-red-600 hover:bg-red-50 py-3"
                >
                  Logout
                </Button>
              </div>
            ) : (
              <div className="px-2">
                <Link to="/login" onClick={() => setIsOpen(false)}>
                  <Button 
                    variant="accent"
                    size="md"
                    className="w-full !rounded-full shadow-xl"
                    style={{ backgroundColor: theme.accentColor }}
                  >
                    Login
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
};

export default Navbar;
