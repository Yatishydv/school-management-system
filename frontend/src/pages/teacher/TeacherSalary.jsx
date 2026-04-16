import React, { useEffect, useState } from "react";
import { 
  CreditCard, 
  Calendar as CalendarIcon, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  FileText,
  DollarSign,
  ArrowRight,
  Printer,
  ChevronDown,
  Eye,
  Download,
  Info
} from "lucide-react";
import useAuthStore from "../../stores/authStore";
import financeService from "../../api/financeService";
import { toast } from "react-toastify";
import Modal from "../../components/shared/Modal";

const TeacherSalary = () => {
  const { token, user } = useAuthStore();
  const [salaries, setSalaries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedSalary, setSelectedSalary] = useState(null);

  const fetchMySalaries = async () => {
    setLoading(true);
    try {
      const res = await financeService.getMySalaries(token);
      setSalaries(res || []);
    } catch (err) {
      toast.error("Failed to sync personal payroll archives.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchMySalaries();
  }, [token]);

  const handleOpenDetails = (salary) => {
    setSelectedSalary(salary);
    setShowDetailModal(true);
  };

  if (loading) {
    return (
        <div className="flex items-center justify-center min-h-[60vh]">
            <div className="w-10 h-10 border-4 border-primary-950 border-t-accent-500 rounded-full animate-spin"></div>
        </div>
    );
  }

  const latestSalary = salaries[0];

  return (
    <div className="min-h-screen bg-gray-50/50 space-y-12 pb-24 relative overflow-hidden">
      {/* Watermark */}
      <div className="absolute top-20 left-1/2 -translate-x-1/2 text-[20vw] font-black text-gray-100/50 pointer-events-none select-none tracking-tighter uppercase whitespace-nowrap">
        PAYSLIP
      </div>

      <header className="px-8 md:px-14 pt-16 flex flex-col md:flex-row justify-between items-start md:items-end gap-8 relative z-10">
         <div className="space-y-4">
            <div className="flex items-center gap-3">
               <div className="w-2 h-2 rounded-full bg-accent-500"></div>
               <span className="text-[10px] font-black uppercase tracking-[0.5em] text-gray-400">Personal Disbursement</span>
            </div>
            <h1 className="text-5xl md:text-8xl font-black tracking-tighter leading-none text-primary-950">
              Salary <span className="text-gray-200">Hub.</span>
            </h1>
         </div>
      </header>

      <div className="px-8 md:px-14 relative z-10">
        {/* Highlight Card */}
        {latestSalary && (
            <div className="bg-primary-950 rounded-[3rem] p-10 md:p-16 mb-12 shadow-2xl relative overflow-hidden group border border-white/10">
                <div className="absolute top-0 right-0 p-10 opacity-10 group-hover:scale-110 transition-transform duration-700">
                    <DollarSign size={200} className="text-white" />
                </div>
                
                <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-12">
                    <div className="space-y-6">
                        <div className="flex items-center gap-3">
                           <span className="px-4 py-1.5 bg-white/10 text-white text-[10px] font-black rounded-full uppercase tracking-widest">Latest Disbursement</span>
                           {latestSalary.status === 'Paid' ? (
                               <span className="px-4 py-1.5 bg-emerald-500 text-white text-[10px] font-black rounded-full uppercase tracking-widest flex items-center gap-2 animate-pulse">
                                  <CheckCircle2 size={12} /> PAID
                               </span>
                           ) : (
                               <span className="px-4 py-1.5 bg-amber-500 text-white text-[10px] font-black rounded-full uppercase tracking-widest flex items-center gap-2">
                                  <Clock size={12} /> PENDING
                               </span>
                           )}
                        </div>
                        <div className="space-y-1">
                            <h2 className="text-white text-5xl md:text-7xl font-black tracking-tighter italic">
                               ₹{(latestSalary.paidAmount || latestSalary.baseSalary).toLocaleString()}
                            </h2>
                            <p className="text-white/40 text-sm font-bold uppercase tracking-widest italic">For {latestSalary.month} {latestSalary.year}</p>
                        </div>
                        <button 
                          onClick={() => handleOpenDetails(latestSalary)}
                          className="flex items-center gap-3 text-accent-500 text-[10px] font-black uppercase tracking-widest hover:text-white transition-all"
                        >
                            View Digital Payslip <ArrowRight size={14} />
                        </button>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-x-12 gap-y-8 text-white">
                        <div className="space-y-1">
                            <p className="text-[10px] font-black opacity-40 uppercase tracking-widest italic">Base Allocation</p>
                            <p className="text-2xl font-black">₹{latestSalary.baseSalary.toLocaleString()}</p>
                        </div>
                        <div className="space-y-1 text-emerald-400 italic">
                            <p className="text-[10px] font-black opacity-40 uppercase tracking-widest">Performance Bonus</p>
                            <p className="text-2xl font-black">+₹{(latestSalary.bonus || 0).toLocaleString()}</p>
                        </div>
                        <div className="space-y-1 text-red-400 italic">
                            <p className="text-[10px] font-black opacity-40 uppercase tracking-widest">Logistical Deductions</p>
                            <p className="text-2xl font-black">-₹{(latestSalary.deductions || 0).toLocaleString()}</p>
                        </div>
                        <div className="space-y-1">
                            <p className="text-[10px] font-black opacity-40 uppercase tracking-widest italic">Fulfillment Protocol</p>
                            <p className="text-sm font-black uppercase opacity-80">{latestSalary.paymentMethod || 'Institutional Transfer'}</p>
                        </div>
                    </div>
                </div>
            </div>
        )}

        {/* History Ledger */}
        <section className="bg-white rounded-[3rem] p-8 md:p-12 border border-gray-100 shadow-sm overflow-hidden animate-fade-up">
           <div className="flex justify-between items-center mb-12">
               <div className="space-y-1">
                   <h3 className="text-2xl font-black text-primary-950 tracking-tight italic">Transaction Ledger.</h3>
                   <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">Historical Disbursement Archives</p>
               </div>
               <button className="p-4 bg-gray-50 text-secondary-500 rounded-2xl hover:bg-primary-950 hover:text-white transition-all shadow-sm group">
                  <Printer size={20} className="group-hover:scale-110 transition-transform" />
               </button>
           </div>

           <table className="w-full border-separate border-spacing-y-4">
              <thead>
                <tr className="text-left text-[10px] font-black uppercase tracking-[0.4em] text-gray-300">
                  <th className="px-8 pb-4">Cycle Period</th>
                  <th className="px-8 pb-4">Digital Invoice #</th>
                  <th className="px-8 pb-4 text-center">Protocol Status</th>
                  <th className="px-8 pb-4 text-center italic">Actions</th>
                  <th className="px-8 pb-4 text-right">Net Credit</th>
                </tr>
              </thead>
              <tbody>
                {salaries.map((s) => (
                  <tr key={s._id} className="group hover:bg-gray-50 transition-all duration-300 rounded-2xl">
                    <td className="px-8 py-6 rounded-l-2xl border-y border-l border-transparent group-hover:border-gray-100">
                       <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl bg-violet-50 text-violet-500 flex items-center justify-center font-black text-xs">
                             <CalendarIcon size={18} />
                          </div>
                          <div className="flex flex-col">
                             <span className="font-black text-primary-950 tracking-tight">{s.month}</span>
                             <span className="text-[10px] font-bold text-gray-400 uppercase">{s.year}</span>
                          </div>
                       </div>
                    </td>
                    <td className="px-8 py-6 border-y border-transparent group-hover:border-gray-100">
                       <span className="text-[10px] font-black text-gray-400 italic bg-gray-100/50 px-3 py-1 rounded-full">{s.invoiceNumber || 'PENDING_GEN'}</span>
                    </td>
                    <td className="px-8 py-6 text-center border-y border-transparent group-hover:border-gray-100">
                       <div className="flex items-center justify-center">
                          {s.status === 'Paid' ? (
                              <span className="px-4 py-1.5 bg-emerald-50 text-emerald-500 text-[9px] font-black rounded-full uppercase tracking-widest flex items-center gap-2">
                                <CheckCircle2 size={10} /> CLEAR
                              </span>
                          ) : (
                              <span className="px-4 py-1.5 bg-amber-50 text-amber-500 text-[9px] font-black rounded-full uppercase tracking-widest flex items-center gap-2">
                                <Clock size={10} /> PENDING
                              </span>
                          )}
                       </div>
                    </td>
                    <td className="px-8 py-6 text-center border-y border-transparent group-hover:border-gray-100">
                        <button 
                            onClick={() => handleOpenDetails(s)}
                            className="p-2.5 bg-gray-100 text-primary-950 rounded-xl hover:bg-primary-950 hover:text-white transition-all shadow-sm group/eye"
                            title="Audit Payslip"
                        >
                            <Eye size={14} className="group-hover/eye:scale-110" />
                        </button>
                    </td>
                    <td className="px-8 py-6 rounded-r-2xl text-right border-y border-r border-transparent group-hover:border-gray-100 font-mono">
                       <span className={`text-sm font-black tracking-tighter ${s.status === 'Paid' ? 'text-emerald-600' : 'text-gray-400'}`}>
                          ₹{(s.paidAmount || s.baseSalary).toLocaleString()}
                       </span>
                    </td>
                  </tr>
                ))}
                {salaries.length === 0 && (
                    <tr>
                        <td colSpan="5" className="px-8 py-20 text-center">
                            <div className="flex flex-col items-center gap-4">
                                <AlertCircle size={40} className="text-gray-200" />
                                <span className="text-xs font-black text-gray-300 uppercase tracking-widest">No personal records found in current archive cycle.</span>
                            </div>
                        </td>
                    </tr>
                )}
              </tbody>
           </table>
        </section>
      </div>

      {/* Digital Payslip Modal */}
      <Modal
        isOpen={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        title="Institutional Payslip Audit"
        size="2xl"
      >
        {selectedSalary && (
            <div className="p-12 space-y-12">
                <div className="flex justify-between items-start">
                    <div className="space-y-4">
                        <div className="flex items-center gap-4">
                            <div className="w-16 h-16 rounded-3xl bg-primary-950 text-white flex items-center justify-center text-2xl font-black shadow-xl">
                                {user?.name.substring(0, 1)}
                            </div>
                            <div>
                                <h2 className="text-3xl font-black text-primary-950 tracking-tighter">{user?.name}</h2>
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">{user?.uniqueId}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                           <span className="px-3 py-1 bg-gray-100 text-primary-950 text-[10px] font-black rounded-full uppercase italic">{selectedSalary.month} {selectedSalary.year}</span>
                           <span className={`px-3 py-1 text-[10px] font-black rounded-full uppercase tracking-widest ${selectedSalary.status === 'Paid' ? 'bg-emerald-50 text-emerald-500' : 'bg-amber-50 text-amber-500'}`}>
                              {selectedSalary.status}
                           </span>
                        </div>
                    </div>
                    <div className="text-right">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest italic">Digital Invoice</p>
                        <p className="text-xs font-black text-primary-950">{selectedSalary.invoiceNumber || 'PENDING_GEN'}</p>
                    </div>
                </div>

                <div className="bg-gray-50 rounded-[2.5rem] p-10 space-y-8 border border-gray-100">
                    <div className="grid grid-cols-2 gap-8">
                        <div>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest italic">Base Allocation</p>
                            <p className="text-xl font-black text-primary-950">₹{selectedSalary.baseSalary.toLocaleString()}</p>
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest italic">Performance Bonus</p>
                            <p className="text-xl font-black text-emerald-600">+₹{(selectedSalary.bonus || 0).toLocaleString()}</p>
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-red-500 uppercase tracking-widest italic">Logistical Deductions</p>
                            <p className="text-xl font-black text-red-600">-₹{(selectedSalary.deductions || 0).toLocaleString()}</p>
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-primary-950 uppercase tracking-widest italic">Total Disbursed</p>
                            <p className="text-3xl font-black text-emerald-700 tracking-tighter decoration-accent-500 underline underline-offset-4">₹{(selectedSalary.paidAmount || selectedSalary.baseSalary).toLocaleString()}</p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-12 text-sm italic">
                    <div className="space-y-2">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                           <CreditCard size={12} /> Fulfillment Protocol
                        </p>
                        <p className="font-black text-primary-950">{selectedSalary.paymentMethod || 'Institutional Fulfillment'}</p>
                    </div>
                    <div className="space-y-2">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                           <CalendarIcon size={12} /> Fulfillment Date
                        </p>
                        <p className="font-black text-primary-950">{selectedSalary.paymentDate ? new Date(selectedSalary.paymentDate).toLocaleDateString() : 'Awaiting Archival'}</p>
                    </div>
                </div>

                {selectedSalary.remarks && (
                    <div className="p-6 bg-violet-50 text-violet-600 rounded-2xl italic text-xs font-bold leading-relaxed border border-violet-100">
                       " {selectedSalary.remarks} "
                    </div>
                )}

                <div className="flex justify-between items-center pt-8 border-t border-gray-50">
                    <button className="flex items-center gap-2 text-[10px] font-black text-primary-950 uppercase tracking-widest hover:text-accent-500 transition-all border-b border-transparent hover:border-accent-500">
                        <Download size={14} /> Download PDF Audit
                    </button>
                    <button 
                        onClick={() => setShowDetailModal(false)}
                        className="px-8 py-4 bg-primary-950 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-primary-950/20 hover:bg-accent-500 transition-all"
                    >
                        Close Payslip
                    </button>
                </div>
            </div>
        )}
      </Modal>
    </div>
  );
};

export default TeacherSalary;
