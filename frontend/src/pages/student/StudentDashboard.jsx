import React, { useEffect, useState } from "react";
import useAuthStore from "../../stores/authStore";
import studentService from "../../api/studentService";
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Hash, 
  BookOpen, 
  Fingerprint, 
  Clock, 
  Star, 
  TrendingUp,
  Layout,
  Wallet,
  Trophy,
  ChevronRight
} from "lucide-react";
import { Link } from "react-router-dom";

const StudentDashboard = () => {
  const { user, token } = useAuthStore();
  const [profile, setProfile] = useState(user);
  const [loading, setLoading] = useState(true);
  const [dashStats, setDashStats] = useState(null);
  const [timetable, setTimetable] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [notices, setNotices] = useState([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [profileData, summaryData, timetableData, subjectsData, noticesData] = await Promise.all([
          studentService.getProfile(token),
          studentService.getDashboardSummary(token),
          studentService.getTimetable(token),
          studentService.getSubjects(token),
          studentService.getNotices(token)
        ]);
        setProfile(profileData);
        setDashStats(summaryData);
        setTimetable(timetableData);
        setSubjects(subjectsData);
        setNotices(noticesData);
      } catch (err) {
        console.error("Failed to fetch dashboard data", err);
      } finally {
        setLoading(false);
      }
    };
    if (token) fetchDashboardData();
  }, [token]);

  if (loading) return <div className="p-10 animate-pulse text-sky-400 font-black uppercase tracking-widest">Waking up the Scholar Portal...</div>;

  return (
    <div className="min-h-screen bg-blue-50/20 pb-24 font-body">
      {/* ------------------------------------------------------------------ */}
      {/*                        HERO HEADER SECTION                        */}
      {/* ------------------------------------------------------------------ */}
      <section className="px-8 md:px-14 pt-12">
        <div className="bg-white rounded-[3rem] p-4 border border-gray-100 shadow-sm overflow-hidden relative group">
           {/* Gradient Backdrop */}
           <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-sky-400 opacity-90 transition-all duration-700"></div>
           <div className="absolute top-0 right-0 w-[40%] h-full bg-white/10 -skew-x-12 translate-x-20"></div>
           
           <div className="relative z-10 flex flex-col md:flex-row items-center justify-between p-8 md:pt-14 md:pb-32 gap-12">
              <div className="space-y-6 flex-1 text-center md:text-left">
                 <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-white text-[10px] font-black uppercase tracking-[0.3em]">
                    <Star size={14} className="animate-spin-slow" />
                    <span>Academic Excellence Hub</span>
                 </div>
                 <h1 className="text-5xl md:text-7xl font-black text-white tracking-tighter leading-none">
                    Welcome Back, <br />
                    <span className="text-blue-100 italic">{(profile?.name || user?.name || "Scholar")?.split(' ')[0]}!</span>
                 </h1>
                  <p className="text-[10px] font-bold text-blue-100/60 uppercase tracking-[0.2em] max-w-md">
                     Your academic journey is in full bloom. Explore your modules, track your attendance, and reach for the stars.
                  </p>
                  <div className="flex flex-wrap gap-4 pt-4">
                     <Link to="/student/timetable" className="px-8 py-4 bg-white text-blue-600 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-50 transition-all shadow-xl shadow-blue-900/20 flex items-center justify-center">
                        View Timetable
                     </Link>
                     <Link to="/student/subjects" className="px-8 py-4 bg-blue-700/50 text-white border border-white/20 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all backdrop-blur-md flex items-center justify-center">
                        Resources
                     </Link>
                  </div>
              </div>

              <div className="relative">
                 <div className="w-56 h-56 md:w-64 md:h-64 rounded-full border-[10px] border-white/20 relative overflow-hidden bg-white/10 backdrop-blur-sm">
                    {(profile?.profileImage || user?.profileImage) ? (
                       <img 
                         src={`http://localhost:5005/${profile?.profileImage || user?.profileImage}`} 
                         alt={profile?.name || user?.name} 
                         className="w-full h-full object-cover" 
                         onError={(e) => { e.target.onerror = null; e.target.src = "https://ui-avatars.com/api/?name=" + (profile?.name || user?.name || "Student"); }}
                       />
                    ) : (
                       <div className="w-full h-full flex items-center justify-center">
                          <User size={80} className="text-white opacity-40" />
                       </div>
                    )}
                    {/* Decorative Rings */}
                    <div className="absolute inset-0 border-[1px] border-white/40 rounded-full scale-90 animate-ping-slow"></div>
                 </div>
                 <div className="absolute -bottom-24 left-1/2 -translate-x-1/2 bg-white p-4 rounded-2xl shadow-2xl border border-gray-50 flex items-center gap-4 z-20 whitespace-nowrap">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
                       <Trophy size={20} />
                    </div>
                    <div>
                       <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Class Rank</p>
                       <p className="text-xl font-black text-blue-600 leading-none">Top 3%</p>
                    </div>
                 </div>
              </div>
           </div>
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/*                        KPI & STATS ROW                           */}
      {/* ------------------------------------------------------------------ */}
      <section className="px-8 md:px-14 mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
        {[
          { label: "Overall Attendance", value: `${dashStats?.attendance || '0'}%`, icon: Clock, color: "bg-blue-500", trend: "+2.1%", path: "/student/attendance" },
          { label: "Academic GPA", value: `${dashStats?.gpa || '0.0'}/4.0`, icon: TrendingUp, color: "bg-sky-500", trend: "Latest", path: "/student/results" },
          { label: "Assignments Due", value: String(dashStats?.pendingAssignments || '0').padStart(2, '0'), icon: BookOpen, color: "bg-indigo-500", trend: "Action Required", path: "/student/assignments" },
          { label: "Outstanding Dues", value: `₹${(dashStats?.totalDues || 0).toLocaleString()}`, icon: Wallet, color: "bg-red-500", trend: "Awaiting", path: "/student/fees" },
          { label: "Institutional Roll", value: `#${profile?.rollNumber || user?.rollNumber || '—'}`, icon: Hash, color: "bg-blue-900", trend: "Verified", path: "#" }
        ].map((stat, i) => (
          <Link key={i} to={stat.path} className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm space-y-6 hover:shadow-xl transition-all group">
             <div className="flex justify-between items-center">
                <div className={`w-12 h-12 rounded-2xl ${stat.color} text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}>
                   <stat.icon size={20} />
                </div>
                <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest bg-gray-50 px-3 py-1 rounded-full">{stat.trend}</span>
             </div>
             <div className="space-y-1">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">{stat.label}</p>
                <p className="text-3xl font-black text-primary-950 tracking-tighter tabular-nums">{stat.value}</p>
             </div>
          </Link>
        ))}
      </section>

      {/* ------------------------------------------------------------------ */}
      {/*                        MAIN CONTENT GRID                          */}
      {/* ------------------------------------------------------------------ */}
      <section className="px-8 md:px-14 mt-12 grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Profile Details (Redesigned) */}
        <div className="lg:col-span-1 space-y-8">
           <div className="bg-white rounded-[2.5rem] p-10 border border-gray-100 shadow-sm space-y-10">
              <h3 className="text-xl font-black uppercase italic tracking-tighter text-primary-950 flex items-center gap-3">
                 Profile Overview <ChevronRight size={20} className="text-blue-500" />
              </h3>

              <div className="space-y-8">
                <div className="space-y-2">
                   <div className="flex items-center gap-3 text-gray-400">
                      <Fingerprint size={16} className="text-blue-500" />
                      <span className="text-[9px] font-black uppercase tracking-widest">Unique ID</span>
                   </div>
                   <p className="text-sm font-black text-primary-950 tabular-nums uppercase tracking-widest">{profile?.uniqueId || user?.uniqueId}</p>
                </div>

                <div className="space-y-2">
                   <div className="flex items-center gap-3 text-gray-400">
                      <GraduationCap size={16} className="text-blue-500" />
                      <span className="text-[9px] font-black uppercase tracking-widest">Class</span>
                   </div>
                   <p className="text-sm font-black text-primary-950 uppercase">{profile?.classId ? `${profile.classId.name}${profile.classId.stream !== 'General' ? ` (${profile.classId.stream})` : ''}` : "Allocating..."}</p>
                </div>

                <div className="space-y-2">
                   <div className="flex items-center gap-3 text-gray-400">
                      <Mail size={16} className="text-blue-500" />
                      <span className="text-[9px] font-black uppercase tracking-widest">Email Address</span>
                   </div>
                   <p className="text-sm font-black text-primary-950 lowercase truncate">{profile?.email || user?.email}</p>
                </div>

                <div className="space-y-2">
                   <div className="flex items-center gap-3 text-gray-400">
                      <MapPin size={16} className="text-blue-500" />
                      <span className="text-[9px] font-black uppercase tracking-widest">Address</span>
                   </div>
                   <p className="text-sm font-black text-primary-950 uppercase line-clamp-1">{profile?.address || user?.address || 'N/A'}</p>
                </div>
              </div>

              <div className="pt-8 border-t border-gray-50">
                 <button className="w-full py-5 bg-blue-50 text-blue-600 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-600 hover:text-white transition-all">
                    Update Profile Details
                 </button>
              </div>
           </div>

            <div className="bg-primary-950 rounded-[2.5rem] p-10 text-white space-y-8 relative overflow-hidden group">
               <div className="absolute top-0 right-0 w-48 h-48 bg-blue-500/20 rounded-full translate-x-20 -translate-y-20 blur-[100px] group-hover:scale-125 transition-transform duration-1000"></div>
               <h4 className="text-lg font-black uppercase tracking-widest text-blue-400 italic">Today's Schedule</h4>
               <div className="space-y-4">
                  {timetable.length > 0 ? timetable.filter(item => item.day === new Date().toLocaleDateString('en-US', { weekday: 'long' })).sort((a,b) => a.startTime.localeCompare(b.startTime)).map((session, i) => (
                    <div key={i} className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
                       <div className="text-center min-w-[60px] border-r border-white/10 pr-4">
                          <p className="text-[10px] font-black text-blue-400">{session.startTime}</p>
                       </div>
                       <div className="space-y-0.5">
                          <p className="text-xs font-black uppercase italic tracking-tighter">{session.subject?.name}</p>
                          <p className="text-[9px] font-bold text-white/40 uppercase">{session.subject?.assignedTeachers?.[0]?.name || 'Institutional Staff'}</p>
                       </div>
                    </div>
                  )) : (
                    <div className="py-8 text-center bg-white/5 rounded-2xl border border-white/10 border-dashed">
                       <p className="text-[9px] font-bold text-white/30 uppercase tracking-[0.2em]">No Sessions Slated Today</p>
                    </div>
                  )}
               </div>

               <Link to="/student/timetable" className="block w-full py-4 bg-white/10 hover:bg-white/20 text-center rounded-xl text-[9px] font-black uppercase tracking-widest transition-all">
                  Full Weekly Roster
               </Link>
            </div>
        </div>

        {/* Learning Journey / Recent Lessons */}
        <div className="lg:col-span-2 space-y-12">
            <div className="flex items-center justify-between">
               <h2 className="text-4xl font-black uppercase italic tracking-tighter text-primary-950">Learning Matrix</h2>
               <div className="flex items-center gap-2">
                  <div className="w-8 h-px bg-gray-200"></div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-gray-300">Fall Semester 24</span>
               </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
               {subjects.length > 0 ? subjects.map((subject, i) => (
                  <div key={i} className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm space-y-8 group hover:shadow-2xl transition-all duration-500">
                    <div className="flex justify-between items-start">
                       <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-all">
                          <BookOpen size={24} />
                       </div>
                       <div className="text-right">
                          <p className="text-[9px] font-black uppercase tracking-widest text-gray-300">Subject Code</p>
                          <p className="text-xl font-black text-blue-600 tabular-nums">{subject.code || 'N/A'}</p>
                       </div>
                    </div>
                    
                    <div className="space-y-2">
                       <h5 className="text-2xl font-black text-primary-950 uppercase italic leading-none">{subject.name}</h5>
                       <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                          Instructors: {subject.assignedTeachers?.map(t => t.name).join(', ') || 'Staff Allocated'}
                       </p>
                    </div>

                    <div className="space-y-4">
                       <div className="h-1.5 w-full bg-gray-50 rounded-full overflow-hidden">
                          <div 
                             className="h-full bg-blue-600 rounded-full transition-all duration-1000 group-hover:bg-sky-400" 
                             style={{ width: `75%` }} // Default progress for demo until we have module tracking
                          ></div>
                       </div>
                       <button className="w-full py-4 text-[9px] font-black uppercase tracking-[0.2em] text-blue-600 hover:text-blue-800 flex items-center justify-center gap-2 transition-colors">
                          View Module Content <ChevronRight size={14} />
                       </button>
                    </div>
                  </div>
               )) : (
                 <div className="col-span-full py-20 bg-gray-50 rounded-[3rem] border border-dashed border-gray-200 flex flex-col items-center justify-center text-center space-y-4">
                    <div className="w-16 h-16 rounded-3xl bg-white flex items-center justify-center text-gray-300 shadow-sm">
                       <Layout size={32} />
                    </div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Curriculum Pending Allocation</p>
                 </div>
               )}
            </div>
        </div>
      </section>
    </div>
  );
};

export default StudentDashboard;

const GraduationCap = ({ size, className }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
    <path d="M6 12v5c3 3 9 3 12 0v-5" />
  </svg>
);
