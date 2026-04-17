import React, { useEffect, useState } from "react";
import { 
  Users, 
  Search, 
  Plus, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  CreditCard, 
  Calendar as CalendarIcon,
  ChevronRight,
  Filter,
  Download,
  DollarSign,
  Trash2,
  Eye,
  Edit3,
  TrendingUp,
  PieChart as PieChartIcon,
  FileText,
  IndianRupee,
  Activity
} from "lucide-react";
import useAuthStore from "../../stores/authStore";
import financeService from "../../api/financeService";
import { toast } from "react-toastify";
import Modal from "../../components/shared/Modal";
import ConfirmModal from "../../components/shared/ConfirmModal";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import Select from "../../components/ui/Select";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const COLORS = ['#10b981', '#f59e0b', '#ef4444'];

const AdminSalaries = () => {
  const { token } = useAuthStore();
  const [salaries, setSalaries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMonth, setSelectedMonth] = useState(MONTHS[new Date().getMonth()]);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  
  const [showPayModal, setShowPayModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [editingSalary, setEditingSalary] = useState(null);
  const [paymentForm, setPaymentForm] = useState({
    bonus: 0,
    deductions: 0,
    baseSalary: 0,
    paidAmount: 0,
    status: "Paid",
    paymentDate: new Date().toISOString().split('T')[0],
    paymentMethod: "Bank Transfer",
    remarks: ""
  });

  const fetchSalaries = async () => {
    setLoading(true);
    try {
      const res = await financeService.getSalaries(token);
      setSalaries(res || []);
    } catch (err) {
      toast.error("Failed to fetch salary records.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchSalaries();
  }, [token]);

  const handleGenerate = async () => {
    try {
      const res = await financeService.generateSalaries(selectedMonth, selectedYear, token);
      toast.success(res.message);
      fetchSalaries();
    } catch (err) {
      toast.error("Failed to generate salaries.");
    }
  };

  const handleDeleteSalary = async () => {
    try {
      await financeService.deleteSalary(deleteId, token);
      toast.success("Salary record deleted.");
      setShowDeleteConfirm(false);
      fetchSalaries();
    } catch (err) {
      toast.error("Failed to delete record.");
    }
  };

  const handlePay = async (e) => {
    e.preventDefault();
    const payload = {
        ...paymentForm,
        paidAmount: Math.round((Number(paymentForm.baseSalary) + Number(paymentForm.bonus) - Number(paymentForm.deductions)) * 100) / 100
    };
    try {
      await financeService.updateSalary(editingSalary._id, payload, token);
      toast.success("Payment recorded successfully.");
      setShowPayModal(false);
      fetchSalaries();
    } catch (err) {
      toast.error("Failed to record payment.");
    }
  };

  const openPayModal = (salary) => {
    setEditingSalary(salary);
    setPaymentForm({
      bonus: salary.bonus || 0,
      deductions: salary.deductions || 0,
      baseSalary: salary.baseSalary || 0,
      paidAmount: (salary.baseSalary || 0) + (salary.bonus || 0) - (salary.deductions || 0),
      status: "Paid",
      paymentDate: new Date().toISOString().split('T')[0],
      paymentMethod: salary.paymentMethod || "Bank Transfer",
      remarks: salary.remarks || ""
    });
    setShowPayModal(true);
  };

  const openDetailModal = (salary) => {
    setEditingSalary(salary);
    setShowDetailModal(true);
  };

  const filteredSalaries = salaries.filter(s => {
    const matchesSearch = s.teacher?.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         s.teacher?.uniqueId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesMonth = s.month === selectedMonth;
    const matchesYear = s.year === parseInt(selectedYear);
    return matchesSearch && matchesMonth && matchesYear;
  });

  const stats = {
      totalDue: filteredSalaries.reduce((acc, s) => acc + (s.baseSalary || 0), 0),
      totalPaid: filteredSalaries.reduce((acc, s) => acc + (s.paidAmount || 0), 0),
      totalBonus: filteredSalaries.reduce((acc, s) => acc + (s.bonus || 0), 0),
      totalDeductions: filteredSalaries.reduce((acc, s) => acc + (s.deductions || 0), 0),
      pendingCount: filteredSalaries.filter(s => s.status !== 'Paid').length,
      paidCount: filteredSalaries.filter(s => s.status === 'Paid').length
  };

  const pieData = [
      { name: 'Paid', value: stats.totalPaid },
      { name: 'Pending', value: Math.max(0, stats.totalDue - stats.totalPaid) }
  ];

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-12 h-12 border-4 border-primary-950 border-t-accent-500 rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50/50 pb-24 space-y-8">
      
      {/* HEADER SECTION - Minimal and clean */}
      <header className="px-8 md:px-14 pt-16 flex flex-col md:flex-row justify-between items-start md:items-end gap-8">
         <div className="space-y-4">
            <div className="flex items-center gap-3">
               <div className="w-2 h-2 rounded-full bg-accent-500"></div>
               <span className="text-[10px] font-black uppercase tracking-[0.5em] text-gray-400">Financial Hub</span>
            </div>
            <h1 className="text-5xl md:text-8xl font-black tracking-tighter leading-none text-primary-950">
              Salary <span className="text-gray-200">Management.</span>
            </h1>
         </div>
         
         <div className="flex gap-3">
             <button className="flex items-center gap-3 px-8 py-5 bg-white border border-gray-100 rounded-2xl text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-primary-950 hover:border-primary-950 transition-all shadow-sm">
                <Download size={16} />
                Export Ledger
            </button>
         </div>
      </header>

      <div className="px-8 md:px-14 space-y-10">
        {/* STATS SECTION remains as is */}
        
        {/* RE-ANALYZED CONTEXTUAL ACTIONS TOOLBAR */}
        <div className="bg-white p-4 rounded-[2.5rem] border border-gray-100 shadow-sm flex flex-col xl:flex-row items-center gap-4">
            <div className="flex flex-col md:flex-row items-center gap-4 w-full xl:w-auto">
                <div className="flex items-center gap-3 bg-gray-50/80 p-3 rounded-2xl border border-gray-100">
                    <div className="bg-white p-3 rounded-xl shadow-sm flex items-center gap-2 min-w-[150px]">
                        <CalendarIcon size={14} className="text-accent-500" />
                        <Select 
                          className="border-none bg-transparent p-0 text-primary-950 font-black text-xs uppercase cursor-pointer focus:ring-0"
                          value={selectedMonth}
                          onChange={(e) => setSelectedMonth(e.target.value)}
                        >
                            {MONTHS.map(m => <option key={m} value={m}>{m}</option>)}
                        </Select>
                    </div>
                    <div className="bg-white p-3 rounded-xl shadow-sm flex items-center gap-2 min-w-[110px]">
                        <Clock size={14} className="text-accent-500" />
                        <Select 
                          className="border-none bg-transparent p-0 text-primary-950 font-black text-xs uppercase cursor-pointer focus:ring-0"
                          value={selectedYear}
                          onChange={(e) => setSelectedYear(e.target.value)}
                        >
                            {[2023, 2024, 2025, 2026].map(y => <option key={y} value={y}>{y}</option>)}
                        </Select>
                    </div>
                </div>

                <button 
                  onClick={handleGenerate}
                  className="w-full md:w-auto px-8 h-14 rounded-2xl bg-primary-950 text-white hover:bg-emerald-500 transition-all flex items-center justify-center gap-3 group shadow-xl shadow-primary-950/10 active:scale-95 whitespace-nowrap"
                >
                   <Plus size={18} className="group-hover:rotate-90 transition-transform duration-500" />
                   <span className="text-[10px] font-black uppercase tracking-widest">Process {selectedMonth} Payroll</span>
                </button>
            </div>

            <div className="h-10 w-px bg-gray-100 hidden xl:block mx-2"></div>

            <div className="relative group flex-1 w-full">
                <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-accent-500 transition-colors" size={20} />
                <input 
                    type="text" 
                    placeholder="Search personnel ledger archives..."
                    className="w-full h-14 pl-16 pr-8 bg-gray-50/50 rounded-2xl border-none outline-none focus:ring-2 focus:ring-accent-500/10 transition-all text-xs font-bold text-primary-950 placeholder:text-gray-300"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
        </div>

        {/* TABLE SECTION - Restored Teacher Hub Style */}
        <section className="bg-white rounded-[2.5rem] p-8 md:p-12 border border-gray-100 shadow-sm overflow-hidden animate-fade-up">
           <table className="w-full border-separate border-spacing-y-4">
              <thead>
                <tr className="text-left text-[10px] font-black uppercase tracking-[0.4em] text-gray-300">
                  <th className="px-8 pb-4">Personnel Member</th>
                  <th className="px-8 pb-4 text-center">Status Protocol</th>
                  <th className="px-8 pb-4 text-center">Base Allocation</th>
                  <th className="px-8 pb-4 text-right">Net Disbursement</th>
                  <th className="px-8 pb-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="space-y-4">
                {filteredSalaries.map((s) => (
                  <tr key={s._id} className="group hover:bg-gray-50 transition-all duration-300 rounded-2xl">
                    <td className="px-8 py-6 rounded-l-2xl border-y border-l border-transparent group-hover:border-gray-100">
                       <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-2xl bg-violet-50 text-violet-500 items-center justify-center flex font-black text-sm">
                             {s.teacher?.name.substring(0, 1)}
                          </div>
                          <div className="flex flex-col">
                             <span className="font-black text-primary-950 tracking-tight">{s.teacher?.name}</span>
                             <span className="text-[10px] font-black text-accent-500 bg-accent-500/5 px-2 py-0.5 rounded-full tracking-widest italic w-fit mt-1 uppercase">{s.teacher?.uniqueId}</span>
                          </div>
                       </div>
                    </td>
                    <td className="px-8 py-6 border-y border-transparent group-hover:border-gray-100 text-center">
                       <div className="flex items-center justify-center">
                          {s.status === 'Paid' ? (
                              <span className="px-6 py-2 bg-emerald-50 text-emerald-500 text-[9px] font-black rounded-full flex items-center gap-2 border border-emerald-100 uppercase tracking-widest">
                                 <CheckCircle2 size={12} /> Finalized
                              </span>
                          ) : s.status === 'Partial' ? (
                              <span className="px-6 py-2 bg-amber-50 text-amber-600 text-[9px] font-black rounded-full flex items-center gap-2 border border-amber-100 uppercase tracking-widest">
                                 <Clock size={12} /> Partial Run
                              </span>
                          ) : (
                              <span className="px-6 py-2 bg-gray-50 text-gray-400 text-[9px] font-black rounded-full flex items-center gap-2 border border-gray-100 uppercase tracking-widest">
                                 <AlertCircle size={12} /> Pending
                              </span>
                          )}
                       </div>
                    </td>
                    <td className="px-8 py-6 border-y border-transparent group-hover:border-gray-100 text-center">
                       <span className="text-xs font-black text-primary-950 tracking-tight">₹{(s.baseSalary || 0).toLocaleString()}</span>
                    </td>
                    <td className="px-8 py-6 border-y border-transparent group-hover:border-gray-100 text-right">
                        <span className={`text-base font-black tracking-tighter ${s.status === 'Paid' ? 'text-emerald-500' : 'text-primary-950 opacity-40'}`}>
                           ₹{(s.paidAmount || s.baseSalary || 0).toLocaleString()}
                        </span>
                    </td>
                    <td className="px-8 py-6 rounded-r-2xl text-right border-y border-r border-transparent group-hover:border-gray-100">
                        <div className="flex gap-2 justify-end opacity-0 group-hover:opacity-100 transition-all">
                            <button 
                                onClick={() => openDetailModal(s)}
                                className="p-3 bg-white border border-gray-100 rounded-xl text-blue-500 hover:bg-blue-500 hover:text-white transition-all shadow-sm"
                                title="View Audit Details"
                            >
                                <Eye size={14} />
                            </button>
                            {s.status !== 'Paid' && (
                                <button 
                                    onClick={() => openPayModal(s)}
                                    className="p-3 bg-white border border-gray-100 rounded-xl text-emerald-600 hover:bg-emerald-600 hover:text-white transition-all shadow-sm"
                                    title="Process Disbursement"
                                >
                                    <IndianRupee size={14} />
                                </button>
                            )}
                            <button 
                                onClick={() => {
                                    setDeleteId(s._id);
                                    setShowDeleteConfirm(true);
                                }}
                                className="p-3 bg-white border border-gray-100 rounded-xl text-red-500 hover:bg-red-500 hover:text-white transition-all shadow-sm"
                                title="Purge Record"
                            >
                                <Trash2 size={14} />
                            </button>
                        </div>
                    </td>
                  </tr>
                ))}
              </tbody>
           </table>
           
           {filteredSalaries.length === 0 && (
               <div className="py-24 flex flex-col items-center justify-center opacity-40 space-y-4">
                   <FileText size={48} />
                   <p className="text-[10px] font-black uppercase tracking-widest">No archival matches found</p>
               </div>
           )}
        </section>
      </div>

      {/* MODALS - Maintained logic with standardized UI */}
      <Modal 
        isOpen={showPayModal} 
        onClose={() => setShowPayModal(false)}
        title="Disburse Personnel Funds"
        size="4xl"
      >
        <div className="p-10 space-y-8">
            <div className="bg-gray-50 p-8 rounded-[2.5rem] border border-gray-100 flex flex-col md:flex-row justify-between items-center gap-8">
                <div className="flex items-center gap-6 text-left w-full">
                    <div className="w-16 h-16 rounded-3xl bg-primary-950 text-white flex items-center justify-center text-2xl font-black shadow-xl">
                        {editingSalary?.teacher?.name.substring(0, 1)}
                    </div>
                    <div>
                        <h4 className="text-2xl font-black text-primary-950 tracking-tight">{editingSalary?.teacher?.name}</h4>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest italic">{editingSalary?.teacher?.uniqueId}</p>
                    </div>
                </div>
                <div className="text-right w-full md:w-auto">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Base Allocation</p>
                    <p className="text-3xl font-black text-primary-950 tracking-tighter">₹{(editingSalary?.baseSalary || 0).toLocaleString()}</p>
                </div>
            </div>

            <form onSubmit={handlePay} className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    <Input label="Base Allocation" type="number" value={paymentForm.baseSalary} onChange={(e) => setPaymentForm({...paymentForm, baseSalary: e.target.value})} />
                    <Input label="Performance Bonus" type="number" value={paymentForm.bonus} onChange={(e) => setPaymentForm({...paymentForm, bonus: e.target.value})} />
                    <Input label="Logistical Deductions" type="number" value={paymentForm.deductions} onChange={(e) => setPaymentForm({...paymentForm, deductions: e.target.value})} />
                    <div className="bg-emerald-50 p-5 rounded-3xl border border-emerald-100 flex flex-col justify-center">
                        <span className="text-[9px] font-black text-emerald-600 uppercase tracking-widest italic">Net Credit</span>
                        <span className="text-xl font-black text-emerald-700 tracking-tighter">
                            ₹{(Number(paymentForm.baseSalary) + Number(paymentForm.bonus) - Number(paymentForm.deductions)).toLocaleString()}
                        </span>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <Input label="Disbursement Date" type="date" value={paymentForm.paymentDate} onChange={(e) => setPaymentForm({...paymentForm, paymentDate: e.target.value})} required />
                    <Select label="Payment Channel" value={paymentForm.paymentMethod} onChange={(e) => setPaymentForm({...paymentForm, paymentMethod: e.target.value})}>
                        <option value="Bank Transfer">Bank Transfer</option>
                        <option value="Cash">Cash</option>
                        <option value="Cheque">Cheque</option>
                        <option value="Other">Other</option>
                    </Select>
                    <Select label="Transaction Status" value={paymentForm.status} onChange={(e) => setPaymentForm({...paymentForm, status: e.target.value})}>
                        <option value="Paid">Finalized (Paid)</option>
                        <option value="Partial">Partial Fulfillment</option>
                        <option value="Pending">Pending Archival</option>
                    </Select>
                </div>

                <Input label="Registry Remarks" placeholder="Supplementary notes for archives..." value={paymentForm.remarks} onChange={(e) => setPaymentForm({...paymentForm, remarks: e.target.value})} />

                <div className="pt-8 border-t border-gray-100 flex gap-4">
                    <button type="button" onClick={() => setShowPayModal(false)} className="px-8 py-4 bg-gray-50 text-gray-400 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-gray-100 transition-all">Abate</button>
                    <button type="submit" className="flex-1 py-4 bg-primary-950 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-primary-950/20 hover:bg-accent-500 transition-all">Commit Transaction</button>
                </div>
            </form>
        </div>
      </Modal>

      <Modal isOpen={showDetailModal} onClose={() => setShowDetailModal(false)} title="Audit Registry Detail" size="2xl">
        {editingSalary && (
            <div className="p-12 space-y-12">
                <div className="flex flex-col items-center text-center space-y-6">
                    <div className="w-24 h-24 rounded-[2.5rem] bg-primary-950 text-white flex items-center justify-center text-4xl font-black shadow-2xl shadow-primary-950/30">
                        {editingSalary.teacher?.name.substring(0, 1)}
                    </div>
                    <div>
                        <h2 className="text-4xl font-black text-primary-950 tracking-tighter leading-none">{editingSalary.teacher?.name}</h2>
                        <p className="text-[10px] font-black text-accent-500 uppercase tracking-[0.3em] mt-2 italic">{editingSalary.teacher?.uniqueId}</p>
                    </div>
                </div>

                <div className="bg-gray-50 rounded-[3rem] p-10 border border-gray-100 grid grid-cols-2 gap-y-10 gap-x-8">
                    <div>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 italic">Monthly Period</p>
                        <p className="text-xl font-black text-primary-950 tracking-tight">{editingSalary.month} {editingSalary.year}</p>
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 italic">Protocol Status</p>
                        <p className={`text-xl font-black tracking-tight ${editingSalary.status === 'Paid' ? 'text-emerald-500' : 'text-amber-500'}`}>{editingSalary.status}</p>
                    </div>
                    <div className="pt-8 border-t border-gray-100 col-span-2 grid grid-cols-2 gap-8">
                         <div>
                            <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest mb-1">Base Salary</p>
                            <p className="text-2xl font-black text-primary-950 tracking-tighter">₹{(editingSalary.baseSalary || 0).toLocaleString()}</p>
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mb-1">Final Disbursed</p>
                            <p className="text-4xl font-black text-emerald-600 tracking-tighter">₹{(editingSalary.paidAmount || 0).toLocaleString()}</p>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col items-center gap-6">
                    <button className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest hover:text-primary-950 transition-all">
                        <Download size={16} /> Download Digital Receipt
                    </button>
                    <button onClick={() => setShowDetailModal(false)} className="w-full py-5 bg-primary-950 text-white rounded-3xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-primary-950/20 hover:bg-accent-500 transition-all">Close Registry</button>
                </div>
            </div>
        )}
      </Modal>

      <ConfirmModal 
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDeleteSalary}
        title="Purge Ledger Record?"
        message="This action permanently archives this structural record. This process is irreversible."
      />
    </div>
  );
};

export default AdminSalaries;
