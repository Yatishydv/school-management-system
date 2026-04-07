// frontend/src/pages/student/StudentSubjects.jsx

import React, { useEffect, useState } from "react";
import useAuthStore from "../../stores/authStore";
import studentService from "../../api/studentService";
import { Book, User, GraduationCap, ArrowRight, Star, Search, Filter, BookOpen, Layers, MoreVertical } from "lucide-react";
import Spinner from "../../components/ui/Spinner";

const StudentSubjects = () => {
  const { token } = useAuthStore();
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const data = await studentService.getSubjects(token);
        setSubjects(data);
      } catch (err) {
        console.error("Failed to fetch subjects", err);
      } finally {
        setLoading(false);
      }
    };
    if (token) fetchSubjects();
  }, [token]);

  const filteredSubjects = subjects.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <div className="p-20 flex items-center justify-center min-h-screen animate-pulse"><Spinner size="xl" /></div>;

  return (
    <div className="min-h-screen bg-gray-50/20 pb-40 relative overflow-hidden font-body">
      {/* Vertical Editorial Watermark */}
      <div className="fixed right-[-5%] top-1/2 -translate-y-1/2 rotate-90 pointer-events-none select-none z-0 hidden lg:block">
        <h1 className="text-[18vh] font-black text-transparent uppercase tracking-tighter leading-none opacity-20" 
            style={{ WebkitTextStroke: '1px rgba(30, 58, 138, 0.15)' }}>
          CURRICULUM
        </h1>
      </div>

      <header className="px-8 md:px-14 pt-16 relative z-10 space-y-12 mb-20">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8">
           <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-px bg-blue-600"></div>
                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-blue-600">Scholastic Catalog</span>
              </div>
              <h1 className="text-5xl md:text-8xl font-black text-blue-950 tracking-tighter uppercase italic leading-none">
                My <span className="text-gray-200">Courses.</span>
              </h1>
           </div>
           
           <div className="relative group w-full md:w-96">
              <Search className="absolute left-8 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-blue-600 transition-all" size={20} />
              <input 
                type="text" 
                placeholder="Search Subjects..." 
                className="w-full pl-20 pr-10 py-6 bg-white border border-gray-100 rounded-[2.5rem] shadow-sm shadow-blue-900/5 focus:ring-8 focus:ring-blue-50 outline-none text-xs font-black uppercase italic tracking-widest transition-all"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
           </div>
        </div>
      </header>

      <div className="px-8 md:px-14 mt-16 relative z-10">
        {filteredSubjects.length === 0 ? (
          <div className="bg-white rounded-[4rem] p-32 border border-dashed border-gray-100 text-center space-y-8 shadow-sm">
             <div className="w-24 h-24 bg-blue-50/50 rounded-[2.5rem] mx-auto flex items-center justify-center text-blue-200">
                <Layers size={48} />
             </div>
             <div className="space-y-2">
                <p className="text-sm font-black uppercase italic text-blue-950 tracking-tighter">Academic Inventory Empty</p>
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-300 max-w-xs mx-auto leading-loose italic">
                   Please synchronize with the administrative registrar for official course enrollment.
                </p>
             </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
            {filteredSubjects.map((subject) => (
              <div 
                key={subject._id} 
                className="group bg-white rounded-[3.5rem] p-12 border border-gray-100 shadow-sm hover:shadow-3xl transition-all duration-700 hover:-translate-y-4 relative overflow-hidden"
              >
                {/* Visual Flair */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 translate-x-12 -translate-y-12 rotate-45 transition-all group-hover:bg-blue-600 z-0"></div>
                
                <div className="relative z-10 space-y-12">
                  <div className="flex justify-between items-start">
                    <div className="w-20 h-20 bg-blue-50 rounded-[2rem] text-blue-600 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-all transform group-hover:scale-110 duration-500 shadow-xl shadow-blue-900/5">
                      <BookOpen size={36} />
                    </div>
                    <div className="px-4 py-2 bg-gray-50 rounded-xl text-[10px] font-black text-blue-950 group-hover:bg-white transition-colors uppercase tracking-[0.2em] tabular-nums italic border border-gray-100 shadow-inner">
                       {subject.code || 'SUB-000'}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full bg-blue-50/50 text-blue-600 text-[9px] font-black uppercase tracking-widest border border-blue-50 group-hover:bg-white group-hover:border-transparent transition-all">
                       <Star size={12} fill="currentColor" /> Active Program
                    </div>
                    <h3 className="text-4xl font-black text-blue-950 tracking-tighter leading-none uppercase italic group-hover:text-blue-600 transition-colors duration-500 group-hover:translate-x-2">
                      {subject.name}
                    </h3>
                  </div>

                  <div className="pt-10 border-t border-gray-50 flex flex-col gap-10">
                    <div className="flex items-center gap-6">
                      <div className="w-16 h-16 rounded-[1.5rem] bg-gray-50 flex items-center justify-center text-blue-950 border border-gray-100 group-hover:bg-blue-50 group-hover:border-blue-100 transition-all shadow-sm">
                         <User size={28} className="group-hover:text-blue-600" />
                      </div>
                      <div className="space-y-1">
                         <div className="text-[10px] font-black text-gray-300 uppercase tracking-widest group-hover:text-blue-400">Assigned Faculty</div>
                         <div className="text-[11px] font-black text-blue-950 uppercase tracking-tight line-clamp-1 italic">
                            {subject.assignedTeachers?.length > 0 
                              ? subject.assignedTeachers.map(t => t.name).join(", ") 
                              : "Institutional Staff Pending"}
                         </div>
                      </div>
                    </div>
                    
                    <Link to="/student/assignments" className="w-full py-6 bg-gray-50 rounded-[1.5rem] text-blue-950 flex items-center justify-center gap-4 group-hover:bg-blue-600 group-hover:text-white transition-all transform group-hover:-translate-y-2 font-black uppercase text-[10px] tracking-[0.2em] shadow-sm hover:shadow-2xl hover:shadow-blue-900/20 active:scale-95 italic">
                       Access Studio <ArrowRight size={20} className="group-hover:translate-x-2 transition-transform" />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentSubjects;
