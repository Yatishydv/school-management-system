// frontend/src/App.jsx
import React from "react";
import { Routes, Route, useLocation } from "react-router-dom";

// PUBLIC COMPONENTS
import Navbar from "./components/layouts/Navbar.jsx";
import Footer from "./components/layouts/Footer.jsx";

// PUBLIC PAGES
import HomePage from "./pages/public/HomePage.jsx";
import AboutPage from "./pages/public/AboutPage.jsx";
import Gallery from "./pages/public/Gallery.jsx";
import AdmissionsPage from "./pages/public/AdmissionsPage.jsx";
import ContactPage from "./pages/public/ContactPage.jsx";
import LoginPage from "./pages/public/LoginPage.jsx";

// PROTECTED ROUTE
import ProtectedRoute from "./components/ProtectedRoute.jsx";

// ADMIN LAYOUT + DASHBOARD
import AdminLayout from "./layouts/AdminLayout.jsx";
import AdminDashboard from "./pages/admin/AdminDashboard.jsx";

const App = () => {
  const location = useLocation();

  const isDashboardRoute =
    location.pathname.startsWith("/admin") ||
    location.pathname.startsWith("/teacher") ||
    location.pathname.startsWith("/student");

  return (
    <>
      {/* Navbar only on public pages */}
      {!isDashboardRoute && <Navbar />}

      <Routes>
        {/* PUBLIC ROUTES */}
        <Route path="/" element={<HomePage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/gallery" element={<Gallery />} />
        <Route path="/admissions" element={<AdmissionsPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/login" element={<LoginPage />} />

        {/* ADMIN ROUTES */}
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute role="admin">
              <AdminLayout>
                <AdminDashboard />
              </AdminLayout>
            </ProtectedRoute>
          }
        />
      </Routes>

      {/* Footer only on public pages */}
      {!isDashboardRoute && <Footer />}
    </>
  );
};

export default App;
