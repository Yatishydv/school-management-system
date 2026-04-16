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
  Info,
  X,
  FileText
} from "lucide-react";
import useAuthStore from "../../stores/authStore";
import financeService from "../../api/financeService";
import { toast } from "react-toastify";
import Modal from "../../components/shared/Modal";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import Select from "../../components/ui/Select";

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const AdminSalaries = () => {
  const { token } = useAuthStore();
  const [salaries, setSalaries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMonth, setSelectedMonth] = useState(MONTHS[new Date().getMonth()]);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  
  const [showPayModal, setShowPayModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
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
      toast.error("Failed to sync payroll archives.");
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
      toast.error("Generation protocol failed.");
    }
  };

  const handleDeleteSalary = async (id) => {
    if (window.confirm("Are you sure you want to purge this salary record? This will remove it from the teacher's history.")) {
      try {
        await financeService.deleteSalary(id, token);
        toast.success("Payroll record purged.");
        fetchSalaries();
      } catch (err) {
        toast.error("Deletion failed.");
      }
    }
  };

  const handlePay = async (e) => {
    const payload = {
        ...paymentForm,
        paidAmount: Number(paymentForm.baseSalary) + Number(paymentForm.bonus) - Number(paymentForm.deductions)
    };
    try {
      await financeService.updateSalary(editingSalary._id, payload, token);
      toast.success("Transaction Compiled.");
      setShowPayModal(false);
      fetchSalaries();
    } catch (err) {
      toast.error("Payment registration failed.");
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
      totalDue: filteredSalaries.reduce((acc, s) => acc + s.baseSalary, 0),
      totalPaid: filteredSalaries.reduce((acc, s) => acc + s.paidAmount, 0),
      pendingCount: filteredSalaries.filter(s => s.status !== 'Paid').length
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-12 h-12 border-4 border-primary-950 border-t-accent-500 rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50/50 space-y-12 pb-24 relative overflow-hidden">
      {/* Watermark */}
      <div className="absolute top-20 left-1/2 -translate-x-1/2 text-[20vw] font-black text-gray-100/50 pointer-events-none select-none tracking-tighter uppercase whitespace-nowrap">
        PAYROLL
      </div>

      <header className="px-8 md:px-14 pt-16 flex flex-col md:flex-row justify-between items-start md:items-end gap-8 relative z-10">
         <div className="space-y-4">
            <div className="flex items-center gap-3">
               <div className="w-2 h-2 rounded-full bg-accent-500"></div>
               <span className="text-[10px] font-black uppercase tracking-[0.5em] text-gray-400">Personnel Disbursement</span>
            </div>
            <h1 className="text-5xl md:text-8xl font-black tracking-tighter leading-none text-primary-950">
              Salary <span className="text-gray-200">Management.</span>
            </h1>
         </div>
         
         <div className="flex gap-3">
             <button 
               onClick={handleGenerate}
               className="px-6 py-4 rounded-2xl bg-primary-950 text-white hover:bg-accent-500 transition-all flex items-center gap-3 group shadow-xl shadow-primary-950/20"
             >
                <span className="text-xs font-black uppercase tracking-widest hidden md:block">Process {selectedMonth}</span>
                <Plus size={20} className="group-hover:rotate-180 transition-transform duration-500" />
             </button>
         </div>
      </header>

      <div className="px-8 md:px-14 relative z-10">
        <div className="flex flex-col md:flex-row gap-6 mb-12">
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-6 flex-1">
                <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex flex-col justify-between">
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest italic">Target Month</span>
                    <Select 
                      className="border-none bg-transparent p-0 text-primary-950 font-black"
                      value={selectedMonth}
                      onChange={(e) => setSelectedMonth(e.target.value)}
                    >
                        {MONTHS.map(m => <option key={m} value={m}>{m}</option>)}
                    </Select>
                </div>
                <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex flex-col justify-between">
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest italic">Target Year</span>
                    <Select 
                      className="border-none bg-transparent p-0 text-primary-950 font-black"
                      value={selectedYear}
                      onChange={(e) => setSelectedYear(e.target.value)}
                    >
                        {[2023, 2024, 2025, 2026].map(y => <option key={y} value={y}>{y}</option>)}
                    </Select>
                </div>
                <div className="hidden lg:flex bg-primary-950 p-6 rounded-3xl shadow-xl flex-col justify-between text-white">
                    <span className="text-[10px] font-black opacity-60 uppercase tracking-widest italic">Cycle Summary</span>
                    <div className="flex justify-between items-end">
                        <div className="text-2xl font-black">₹{stats.totalPaid.toLocaleString()}</div>
                        <div className="text-[10px] uppercase font-bold text-accent-500">{stats.pendingCount} Pending</div>
                    </div>
                </div>
            </div>
            
            <div className="relative group md:w-96">
                <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-accent-500 transition-colors" size={20} />
                <input 
                    type="text" 
                    placeholder="Search Teacher..."
                    className="w-full pl-16 pr-8 py-6 bg-white rounded-3xl border border-gray-100 shadow-sm outline-none focus:ring-4 focus:ring-accent-50 transition-all text-xs font-bold"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
        </div>

        <section className="bg-white rounded-[3rem] p-8 md:p-12 border border-gray-100 shadow-sm overflow-hidden animate-fade-up">
           <table className="w-full border-separate border-spacing-y-4">
              <thead>
                <tr className="text-left text-[10px] font-black uppercase tracking-[0.4em] text-gray-300">
                  <th className="px-8 pb-4">Personnel</th>
                  <th className="px-8 pb-4">Account ID</th>
                  <th className="px-8 pb-4 text-center">Base Salary</th>
                  <th className="px-8 pb-4 text-center">Status</th>
                  <th className="px-8 pb-4 text-center italic">Institutional Actions</th>
                  <th className="px-8 pb-4 text-right">Net Credit</th>
                </tr>
              </thead>
              <tbody>
                {filteredSalaries.map((s) => (
                  <tr key={s._id} className="group hover:bg-gray-50 transition-all duration-300 rounded-2xl">
                    <td className="px-8 py-6 rounded-l-2xl border-y border-l border-transparent group-hover:border-gray-100">
                       <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-violet-50 text-violet-500 flex items-center justify-center font-black text-xs">
                             {s.teacher?.name.substring(0, 1)}
                          </div>
                          <span className="font-black text-primary-950 tracking-tight">{s.teacher?.name}</span>
                       </div>
                    </td>
                    <td className="px-8 py-6 border-y border-transparent group-hover:border-gray-100">
                       <span className="text-[10px] font-black text-gray-400 bg-gray-100 px-3 py-1 rounded-full">{s.teacher?.uniqueId}</span>
                    </td>
                    <td className="px-8 py-6 text-center border-y border-transparent group-hover:border-gray-100">
                       <span className="text-xs font-black text-primary-950">₹{s.baseSalary.toLocaleString()}</span>
                    </td>
                    <td className="px-8 py-6 text-center border-y border-transparent group-hover:border-gray-100">
                       <div className="flex items-center justify-center gap-2">
                          {s.status === 'Paid' ? (
                              <span className="px-4 py-1 bg-emerald-50 text-emerald-500 text-[10px] font-black rounded-full flex items-center gap-2">
                                <CheckCircle2 size={12} /> PAID
                              </span>
                          ) : s.status === 'Partial' ? (
                              <span className="px-4 py-1 bg-amber-50 text-amber-600 text-[10px] font-black rounded-full flex items-center gap-2">
                                <Clock size={12} /> PARTIAL
                              </span>
                          ) : (
                              <span className="px-4 py-1 bg-gray-100 text-gray-400 text-[10px] font-black rounded-full flex items-center gap-2">
                                <AlertCircle size={12} /> PENDING
                              </span>
                          )}
                       </div>
                    </td>
                    <td className="px-8 py-6 text-center border-y border-transparent group-hover:border-gray-100">
                        <div className="flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button 
                                onClick={() => openDetailModal(s)}
                                className="p-2.5 bg-blue-50 text-blue-500 rounded-xl hover:bg-blue-500 hover:text-white transition-all shadow-sm"
                                title="View Payslip Audit"
                            >
                                <Eye size={14} />
                            </button>
                            {s.status !== 'Paid' && (
                                <button 
                                    onClick={() => openPayModal(s)}
                                    className="p-2.5 bg-amber-50 text-amber-500 rounded-xl hover:bg-amber-500 hover:text-white transition-all shadow-sm"
                                    title="Process Payment"
                                >
                                    <Edit3 size={14} />
                                </button>
                            )}
                            <button 
                                onClick={() => handleDeleteSalary(s._id)}
                                className="p-2.5 bg-red-50 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all shadow-sm"
                                title="Purge Payroll"
                            >
                                <Trash2 size={14} />
                            </button>
                        </div>
                    </td>
                    <td className="px-8 py-6 rounded-r-2xl text-right border-y border-r border-transparent group-hover:border-gray-100 font-mono">
                        <span className={`text-sm font-black tracking-tighter ${s.status === 'Paid' ? 'text-emerald-600' : 'text-gray-400'}`}>
                           ₹{(s.paidAmount || s.baseSalary).toLocaleString()}
                        </span>
                    </td>
                  </tr>
                ))}
                {filteredSalaries.length === 0 && (
                    <tr>
                        <td colSpan="6" className="px-8 py-20 text-center">
                            <div className="flex flex-col items-center gap-4">
                                <Users size={40} className="text-gray-200" />
                                <span className="text-xs font-black text-gray-300 uppercase tracking-widest">No payroll records generated for this cycle.</span>
                            </div>
                        </td>
                    </tr>
                )}
              </tbody>
           </table>
        </section>
      </div>

      {/* Pay Modal */}
      <Modal 
        isOpen={showPayModal} 
        onClose={() => setShowPayModal(false)}
        title="Disburse Personnel Funds"
        size="4xl"
      >
        <div className="p-10">
            <div className="bg-gray-50 p-8 rounded-[2rem] border border-gray-100 mb-10 flex flex-col md:flex-row justify-between items-center gap-8">
                <div className="flex items-center gap-6">
                    <div className="w-16 h-16 rounded-3xl bg-primary-950 text-white flex items-center justify-center text-2xl font-black shadow-xl">
                        {editingSalary?.teacher?.name.substring(0, 1)}
                    </div>
                    <div>
                        <h4 className="text-2xl font-black text-primary-950 tracking-tight">{editingSalary?.teacher?.name}</h4>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest italic">{editingSalary?.teacher?.uniqueId}</p>
                    </div>
                </div>
                <div className="text-right">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Base Allocation</p>
                    <p className="text-3xl font-black text-primary-950 tracking-tighter">₹{editingSalary?.baseSalary.toLocaleString()}</p>
                </div>
            </div>

            <form onSubmit={handlePay} className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    <Input 
                        label="Base Allocation" 
                        type="number"
                        placeholder="0"
                        value={paymentForm.baseSalary}
                        onChange={(e) => setPaymentForm({...paymentForm, baseSalary: e.target.value})}
                    />
                    <Input 
                        label="Performance Bonus" 
                        type="number"
                        placeholder="0"
                        value={paymentForm.bonus}
                        onChange={(e) => setPaymentForm({...paymentForm, bonus: e.target.value})}
                    />
                    <Input 
                        label="Logistical Deductions" 
                        type="number"
                        placeholder="0"
                        value={paymentForm.deductions}
                        onChange={(e) => setPaymentForm({...paymentForm, deductions: e.target.value})}
                    />
                    <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-100 flex flex-col justify-center">
                        <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest italic">Net Disbursement</span>
                        <span className="text-xl font-black text-emerald-700 tracking-tighter">
                            ₹{(Number(paymentForm.baseSalary) + Number(paymentForm.bonus) - Number(paymentForm.deductions)).toLocaleString()}
                        </span>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <Input 
                        label="Disbursement Date" 
                        type="date"
                        value={paymentForm.paymentDate}
                        onChange={(e) => setPaymentForm({...paymentForm, paymentDate: e.target.value})}
                        required
                    />
                    <Select 
                        label="Payment Channel"
                        value={paymentForm.paymentMethod}
                        onChange={(e) => setPaymentForm({...paymentForm, paymentMethod: e.target.value})}
                    >
                        <option value="Bank Transfer">Direct Bank Transfer</option>
                        <option value="Cash">Physical Currency (Cash)</option>
                        <option value="Cheque">Institutional Cheque</option>
                        <option value="Other">Alternative Channel</option>
                    </Select>
                    <Select 
                        label="Transaction Status"
                        value={paymentForm.status}
                        onChange={(e) => setPaymentForm({...paymentForm, status: e.target.value})}
                    >
                        <option value="Paid">Completed (Paid)</option>
                        <option value="Partial">Partial Fulfillment</option>
                        <option value="Pending">Pending Archival</option>
                    </Select>
                </div>

                <Input 
                    label="Transaction Remarks" 
                    placeholder="Supplementary notes for archives..."
                    value={paymentForm.remarks}
                    onChange={(e) => setPaymentForm({...paymentForm, remarks: e.target.value})}
                />

                <div className="pt-8 border-t border-gray-100 flex gap-4">
                    <Button variant="secondary" onClick={() => setShowPayModal(false)} type="button">Abate</Button>
                    <Button variant="accent" className="flex-1" type="submit">Commit Transaction</Button>
                </div>
            </form>
        </div>
      </Modal>

      {/* Salary Detail Modal (Audit) */}
      <Modal
        isOpen={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        title="Institutional Payroll Audit"
        size="2xl"
      >
        {editingSalary && (
            <div className="p-12 space-y-12">
                <div className="flex justify-between items-start">
                    <div className="space-y-4">
                        <div className="flex items-center gap-4">
                            <div className="w-16 h-16 rounded-3xl bg-primary-950 text-white flex items-center justify-center text-2xl font-black">
                                {editingSalary.teacher?.name.substring(0, 1)}
                            </div>
                            <div>
                                <h2 className="text-3xl font-black text-primary-950 tracking-tighter">{editingSalary.teacher?.name}</h2>
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">{editingSalary.teacher?.uniqueId}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                           <span className="px-3 py-1 bg-gray-100 text-primary-950 text-[10px] font-black rounded-full uppercase">{editingSalary.month} {editingSalary.year}</span>
                           <span className={`px-3 py-1 text-[10px] font-black rounded-full uppercase ${editingSalary.status === 'Paid' ? 'bg-emerald-50 text-emerald-500' : 'bg-amber-50 text-amber-500'}`}>
                              {editingSalary.status}
                           </span>
                        </div>
                    </div>
                    <div className="text-right">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Digital Invoice #</p>
                        <p className="text-xs font-black text-primary-950 italic">{editingSalary.invoiceNumber}</p>
                    </div>
                </div>

                <div className="bg-gray-50 rounded-[2.5rem] p-10 space-y-8 border border-gray-100">
                    <div className="grid grid-cols-2 gap-8">
                        <div>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Base Salary</p>
                            <p className="text-xl font-black text-primary-950">₹{editingSalary.baseSalary.toLocaleString()}</p>
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest italic">Performance Bonus</p>
                            <p className="text-xl font-black text-emerald-600">+₹{editingSalary.bonus?.toLocaleString() || '0'}</p>
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-red-500 uppercase tracking-widest italic">Logistical Deductions</p>
                            <p className="text-xl font-black text-red-600">-₹{editingSalary.deductions?.toLocaleString() || '0'}</p>
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-primary-950 uppercase tracking-widest">Net Disbursed</p>
                            <p className="text-2xl font-black text-emerald-700 underline underline-offset-4 decoration-accent-500">₹{editingSalary.paidAmount?.toLocaleString() || '0'}</p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-12 text-sm">
                    <div className="space-y-2">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest italic flex items-center gap-2">
                           <CreditCard size={12} /> Payment Protocol
                        </p>
                        <p className="font-black text-primary-950">{editingSalary.paymentMethod || 'Manual Fulfillment'}</p>
                    </div>
                    <div className="space-y-2">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest italic flex items-center gap-2">
                           <CalendarIcon size={12} /> Fulfillment Date
                        </p>
                        <p className="font-black text-primary-950">{editingSalary.paymentDate ? new Date(editingSalary.paymentDate).toLocaleDateString() : 'N/A'}</p>
                    </div>
                </div>

                {editingSalary.remarks && (
                    <div className="p-6 bg-violet-50 text-violet-600 rounded-2xl italic text-xs font-bold leading-relaxed border border-violet-100">
                       " {editingSalary.remarks} "
                    </div>
                )}

                <div className="flex justify-between items-center pt-8 border-t border-gray-50">
                    <button className="flex items-center gap-2 text-[10px] font-black text-primary-950 uppercase tracking-widest hover:text-accent-500 transition-all">
                        <Download size={14} /> Download Digital Receipt
                    </button>
                    <button 
                        onClick={() => setShowDetailModal(false)}
                        className="px-8 py-4 bg-primary-950 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-primary-950/20 hover:bg-accent-500 transition-all"
                    >
                        Close Registry
                    </button>
                </div>
            </div>
        )}
      </Modal>
    </div>
  );
};

export default AdminSalaries;
