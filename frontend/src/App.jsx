// frontend/src/App.jsx
import React from "react";
import { Routes, Route, useLocation } from "react-router-dom";

// PUBLIC COMPONENTS
import Navbar from "./components/layouts/Navbar.jsx";
import Footer from "./components/layouts/Footer.jsx";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// PUBLIC PAGES
import HomePage from "./pages/public/HomePage.jsx";
import AboutPage from "./pages/public/AboutPage.jsx";
import Gallery from "./pages/public/Gallery.jsx";
import AdmissionsPage from "./pages/public/AdmissionsPage.jsx";
import ContactPage from "./pages/public/ContactPage.jsx";
import LoginPage from "./pages/public/LoginPage.jsx";
import ForgotPassword from "./pages/public/ForgotPassword.jsx";
import ResetPassword from "./pages/public/ResetPassword.jsx";
// PROTECTED ROUTE
import ProtectedRoute from "./components/ProtectedRoute.jsx";

// ADMIN LAYOUT + PAGES
import AdminLayout from "./layouts/AdminLayout.jsx";
import AdminDashboard from "./pages/admin/AdminDashboard.jsx";
import AdminGallery from "./pages/admin/AdminGallery.jsx";
import StudentsPage from "./pages/admin/StudentsPage.jsx";
import TeachersPage from "./pages/admin/TeachersPage.jsx";
import ClassesPage from "./pages/admin/ClassesPage.jsx";
import AdmissionsList from "./pages/admin/AdmissionsList.jsx";
import StudentDashboard from "./pages/student/StudentDashboard.jsx";
import StudentSubjects from "./pages/student/StudentSubjects.jsx";
import StudentTimetable from "./pages/student/StudentTimetable.jsx";
import TeacherDashboard from "./pages/teacher/TeacherDashboard.jsx";
import SubjectsPage from "./pages/admin/SubjectsPage.jsx";
import ClassDetailsPage from "./pages/admin/ClassDetailsPage.jsx";
import AdminTimetable from "./pages/admin/AdminTimetable.jsx";

// Student Pages
import StudentAssignments from "./pages/student/StudentAssignments.jsx";
import StudentResults from "./pages/student/StudentResults.jsx";
import StudentFees from "./pages/student/StudentFees.jsx";
import StudentAttendance from "./pages/student/StudentAttendance.jsx";

// Teacher Pages
import TeacherAssignments from "./pages/teacher/TeacherAssignments.jsx";
import TeacherResults from "./pages/teacher/TeacherResults.jsx";
import TeacherClasses from "./pages/teacher/TeacherClasses.jsx";
import TeacherAttendance from "./pages/teacher/TeacherAttendance.jsx";
import ExamsPage from "./pages/admin/ExamsPage.jsx";
import AdminFees from "./pages/admin/AdminFees.jsx";
import AdminNotifications from "./pages/admin/AdminNotifications.jsx";
import TeacherNotifications from "./pages/teacher/TeacherNotifications.jsx";
import NotificationsPage from "./pages/shared/NotificationsPage.jsx";
import StudentNotifications from "./pages/student/StudentNotifications.jsx";
import useAutoLogout from "./hooks/useAutoLogout";



const ScrollToTop = () => {
  const { pathname } = useLocation();

  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};

const App = () => {
  const location = useLocation();
  useAutoLogout(5); // Auto logout after 5 min of inactivity

  const isDashboardRoute =
    location.pathname.startsWith("/admin") ||
    location.pathname.startsWith("/teacher") ||
    location.pathname.startsWith("/student");

  return (
    <>
      <ScrollToTop />
      <ToastContainer 
        position="top-right" 
        autoClose={3000} 
        hideProgressBar={false} 
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
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
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />

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
        <Route
          path="/admin/students"
          element={
            <ProtectedRoute role="admin">
              <AdminLayout>
                <StudentsPage />
              </AdminLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/teachers"
          element={
            <ProtectedRoute role="admin">
              <AdminLayout>
                <TeachersPage />
              </AdminLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/classes"
          element={
            <ProtectedRoute role="admin">
              <AdminLayout>
                <ClassesPage />
              </AdminLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/classes/:id"
          element={
            <ProtectedRoute role="admin">
              <AdminLayout>
                <ClassDetailsPage />
              </AdminLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/admissions"
          element={
            <ProtectedRoute role="admin">
              <AdminLayout>
                <AdmissionsList />
              </AdminLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/gallery"
          element={
            <ProtectedRoute role="admin">
              <AdminLayout>
                <AdminGallery />
              </AdminLayout>
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/admin/notifications"
          element={
            <ProtectedRoute role="admin">
              <AdminLayout>
                <AdminNotifications />
              </AdminLayout>
            </ProtectedRoute>
          }
        />
        
        {/* STUDENT ROUTES */}

        <Route
          path="/student/dashboard"
          element={
            <ProtectedRoute role="student">
              <AdminLayout>
                <StudentDashboard />
              </AdminLayout>
            </ProtectedRoute>
          }
        />
        <Route path="/student/subjects" element={<ProtectedRoute role="student"><AdminLayout><StudentSubjects /></AdminLayout></ProtectedRoute>} />
        <Route path="/student/timetable" element={<ProtectedRoute role="student"><AdminLayout><StudentTimetable /></AdminLayout></ProtectedRoute>} />
        <Route path="/student/assignments" element={<ProtectedRoute role="student"><AdminLayout><StudentAssignments /></AdminLayout></ProtectedRoute>} />
        <Route path="/student/fees" element={<ProtectedRoute role="student"><AdminLayout><StudentFees /></AdminLayout></ProtectedRoute>} />
        <Route path="/student/results" element={<ProtectedRoute role="student"><AdminLayout><StudentResults /></AdminLayout></ProtectedRoute>} />
        <Route path="/student/notifications" element={<ProtectedRoute role="student"><AdminLayout><StudentNotifications /></AdminLayout></ProtectedRoute>} />
        <Route path="/student/attendance" element={<ProtectedRoute role="student"><AdminLayout><StudentAttendance /></AdminLayout></ProtectedRoute>} />


        {/* TEACHER ROUTES */}
        <Route
          path="/teacher/dashboard"
          element={
            <ProtectedRoute role="teacher">
              <AdminLayout>
                <TeacherDashboard />
              </AdminLayout>
            </ProtectedRoute>
          }
        />
        <Route path="/teacher/attendance" element={<ProtectedRoute role="teacher"><AdminLayout><TeacherAttendance /></AdminLayout></ProtectedRoute>} />
        <Route path="/teacher/results" element={<ProtectedRoute role="teacher"><AdminLayout><TeacherResults /></AdminLayout></ProtectedRoute>} />
        <Route path="/teacher/classes" element={<ProtectedRoute role="teacher"><AdminLayout><TeacherClasses /></AdminLayout></ProtectedRoute>} />
        <Route path="/teacher/assignments" element={<ProtectedRoute role="teacher"><AdminLayout><TeacherAssignments /></AdminLayout></ProtectedRoute>} />
        <Route path="/teacher/notifications" element={<ProtectedRoute role="teacher"><AdminLayout><TeacherNotifications /></AdminLayout></ProtectedRoute>} />


        {/* Admin Placeholders */}
        <Route path="/admin/subjects" element={<ProtectedRoute role="admin"><AdminLayout><SubjectsPage /></AdminLayout></ProtectedRoute>} />
        <Route path="/admin/timetable" element={<ProtectedRoute role="admin"><AdminLayout><AdminTimetable /></AdminLayout></ProtectedRoute>} />
        <Route path="/admin/exams" element={<ProtectedRoute role="admin"><AdminLayout><ExamsPage /></AdminLayout></ProtectedRoute>} />
        <Route path="/admin/fees" element={<ProtectedRoute role="admin"><AdminLayout><AdminFees /></AdminLayout></ProtectedRoute>} />
      </Routes>

      {/* Footer only on public pages */}
      {!isDashboardRoute && <Footer />}
    </>
  );
};

export default App;
