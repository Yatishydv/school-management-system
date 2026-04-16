import React, { useEffect, useState } from "react";
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  Users, 
  Plus, 
  Calendar as CalendarIcon, 
  Search,
  ArrowUpRight,
  ArrowDownRight,
  Filter,
  CreditCard,
  Building,
  Phone,
  ShieldCheck,
  FileText,
  Edit3,
  Trash2,
  Eye,
  Info,
  X
} from "lucide-react";
import useAuthStore from "../../stores/authStore";
import financeService from "../../api/financeService";
import { toast } from "react-toastify";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts';
import Modal from "../../components/shared/Modal";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import Select from "../../components/ui/Select";

const AdminFinance = () => {
  const { token } = useAuthStore();
  const [summary, setSummary] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  const [expenseForm, setExpenseForm] = useState({
    title: "",
    category: "Other",
    amount: "",
    description: "",
    paidTo: "",
    vendorName: "",
    vendorContact: "",
    vendorVerification: "",
    paymentMethod: "Cash",
    referenceNumber: ""
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const summaryData = await financeService.getSummary(token);
      const expensesData = await financeService.getExpenses(token);
      setSummary(summaryData);
      setExpenses(expensesData || []);
    } catch (err) {
      toast.error("Financial synchronization failed.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchData();
  }, [token]);

  const handleOpenAdd = () => {
    setIsEditing(false);
    setSelectedExpense(null);
    setExpenseForm({
      title: "",
      category: "Other",
      amount: "",
      description: "",
      paidTo: "",
      vendorName: "",
      vendorContact: "",
      vendorVerification: "",
      paymentMethod: "Cash",
      referenceNumber: ""
    });
    setShowExpenseModal(true);
  };

  const handleOpenEdit = (expense) => {
    setIsEditing(true);
    setSelectedExpense(expense);
    setExpenseForm({
      title: expense.title,
      category: expense.category,
      amount: expense.amount,
      description: expense.description || "",
      paidTo: expense.paidTo,
      vendorName: expense.vendorName || "",
      vendorContact: expense.vendorContact || "",
      vendorVerification: expense.vendorVerification || "",
      paymentMethod: expense.paymentMethod,
      referenceNumber: expense.referenceNumber || ""
    });
    setShowExpenseModal(true);
  };

  const handleViewDetails = (expense) => {
    setSelectedExpense(expense);
    setShowDetailModal(true);
  };

  const handleDeleteExpense = async (id) => {
    if (window.confirm("Are you sure you want to purge this financial archive? This action cannot be undone.")) {
      try {
        await financeService.deleteExpense(id, token);
        toast.success("Expense archive purged.");
        fetchData();
      } catch (err) {
        toast.error("Deletion protocol failed.");
      }
    }
  };

  const handleSubmitExpense = async (e) => {
    e.preventDefault();
    try {
      if (isEditing) {
        await financeService.updateExpense(selectedExpense._id, expenseForm, token);
        toast.success("Expense archive updated.");
      } else {
        await financeService.addExpense(expenseForm, token);
        toast.success("Expense protocol logged.");
      }
      setShowExpenseModal(false);
      fetchData();
    } catch (err) {
      toast.error(`Failed to ${isEditing ? 'update' : 'commit'} expense archive.`);
    }
  };

  const chartData = [
    { name: 'Revenue', value: summary?.totalRevenue || 0, color: '#0f172a' },
    { name: 'Expenses', value: summary?.totalExpenses || 0, color: '#f59e0b' }
  ];

  const filteredExpenses = expenses.filter(e => 
    e.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    e.paidTo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (e.vendorName && e.vendorName.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-12 h-12 border-4 border-primary-950 border-t-accent-500 rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50/50 space-y-12 pb-24 relative overflow-hidden">
       {/* Decorative Watermark */}
       <div className="absolute top-20 left-1/2 -translate-x-1/2 text-[20vw] font-black text-gray-100/50 pointer-events-none select-none tracking-tighter uppercase whitespace-nowrap">
        ACCOUNTS
      </div>

      <header className="px-8 md:px-14 pt-16 flex flex-col md:flex-row justify-between items-start md:items-end gap-8 relative z-10">
         <div className="space-y-4">
            <div className="flex items-center gap-3">
               <div className="w-2 h-2 rounded-full bg-accent-500"></div>
               <span className="text-[10px] font-black uppercase tracking-[0.5em] text-gray-400">Institutional Ledger</span>
            </div>
            <h1 className="text-5xl md:text-8xl font-black tracking-tighter leading-none text-primary-950">
              Finance <span className="text-gray-200">Suite.</span>
            </h1>
         </div>
         
         <div className="flex gap-3">
             <button 
               onClick={handleOpenAdd}
               className="px-6 py-4 rounded-2xl bg-primary-950 text-white hover:bg-accent-500 transition-all flex items-center gap-3 group shadow-xl shadow-primary-950/20"
             >
                <span className="text-xs font-black uppercase tracking-widest hidden md:block">Record Expense</span>
                <Plus size={20} className="group-hover:rotate-180 transition-transform duration-500" />
             </button>
         </div>
      </header>

      <div className="px-8 md:px-14 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* School Got (Income) */}
                <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm space-y-8 flex flex-col justify-between group">
                    <div className="flex justify-between items-start">
                        <div className="p-4 bg-gray-50 rounded-2xl group-hover:bg-primary-950 group-hover:text-white transition-all">
                            <TrendingUp size={24} />
                        </div>
                        <ArrowUpRight className="text-emerald-500" size={20} />
                    </div>
                    <div className="space-y-1">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest italic">School Got (Incoming)</p>
                        <h3 className="text-4xl font-black text-primary-950 tracking-tighter">₹{(summary?.totalRevenue || 0).toLocaleString()}</h3>
                    </div>
                </div>

                {/* School Paid (Outgoing) */}
                <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm space-y-8 flex flex-col justify-between group">
                    <div className="flex justify-between items-start">
                        <div className="p-4 bg-gray-50 rounded-2xl group-hover:bg-primary-950 group-hover:text-white transition-all">
                            <TrendingDown size={24} />
                        </div>
                        <ArrowDownRight className="text-amber-500" size={20} />
                    </div>
                    <div className="space-y-1">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest italic">School Paid (Outgoing)</p>
                        <h3 className="text-4xl font-black text-primary-950 tracking-tighter">₹{(summary?.totalExpenses || 0).toLocaleString()}</h3>
                    </div>
                </div>

                {/* Net Balance */}
                <div className="bg-primary-950 p-8 rounded-[2.5rem] shadow-2xl space-y-8 flex flex-col justify-between text-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-16 translate-x-16"></div>
                    <div className="flex justify-between items-start">
                        <div className="p-4 bg-white/10 rounded-2xl">
                            <DollarSign size={24} className="text-accent-500" />
                        </div>
                    </div>
                    <div className="space-y-1 relative z-10">
                        <p className="text-[10px] font-black opacity-40 uppercase tracking-widest italic">Net Liquidity</p>
                        <h3 className="text-4xl font-black tracking-tighter">₹{(summary?.netProfit || 0).toLocaleString()}</h3>
                    </div>
                </div>
            </div>

            {/* Visual breakdown */}
            <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm flex flex-col">
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest italic mb-6">Allocation Spectrum</span>
                <div className="flex-1 h-32 flex items-center justify-center">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData}>
                            <Bar dataKey="value" radius={[10, 10, 0, 0]}>
                                {chartData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Bar>
                            <Tooltip 
                                cursor={{fill: 'transparent'}}
                                contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontSize: '10px' }}
                            />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
                <div className="flex justify-between mt-6 pt-6 border-t border-gray-50">
                    {chartData.map(c => (
                        <div key={c.name} className="flex flex-col gap-1">
                            <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">{c.name}</span>
                            <span className="text-xs font-black text-primary-950">₹{c.value.toLocaleString()}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>

        {/* Search and Filters */}
        <div className="mt-16 flex flex-col md:flex-row gap-6 mb-12">
            <div className="relative group flex-1">
                <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-accent-500 transition-colors" size={20} />
                <input 
                    type="text" 
                    placeholder="Search by Title, Receiver, or Vendor details..."
                    className="w-full pl-16 pr-8 py-6 bg-white rounded-3xl border border-gray-100 shadow-sm outline-none focus:ring-4 focus:ring-accent-50 transition-all text-xs font-bold"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
            <button className="px-8 py-6 bg-white rounded-3xl border border-gray-100 shadow-sm flex items-center gap-3 text-xs font-black uppercase text-gray-400 hover:text-primary-950 transition-all">
                <Filter size={16} />
                <span>Filters</span>
            </button>
        </div>

        {/* Ledger Table */}
        <section className="bg-white rounded-[3rem] p-8 md:p-12 border border-gray-100 shadow-sm overflow-hidden animate-fade-up">
           <div className="overflow-x-auto">
                <table className="w-full border-separate border-spacing-y-4">
                   <thead>
                     <tr className="text-left text-[10px] font-black uppercase tracking-[0.4em] text-gray-300">
                       <th className="px-8 pb-4">Verification Artifacts</th>
                       <th className="px-8 pb-4">Category</th>
                       <th className="px-8 pb-4">Recipient Detail</th>
                       <th className="px-8 pb-4 text-center">Protocol</th>
                       <th className="px-8 pb-4 text-center italic">Actions</th>
                       <th className="px-8 pb-4 text-right">Magnitude</th>
                     </tr>
                   </thead>
                   <tbody>
                     {filteredExpenses.map((ex) => (
                       <tr key={ex._id} className="group hover:bg-gray-50 transition-all duration-300 rounded-2xl">
                         <td className="px-8 py-6 rounded-l-2xl border-y border-l border-transparent group-hover:border-gray-100">
                            <div className="flex items-center gap-4">
                               <div className="w-10 h-10 rounded-xl bg-violet-50 text-violet-500 flex items-center justify-center font-black text-xs">
                                  <FileText size={18} />
                               </div>
                               <div className="flex flex-col">
                                  <span className="font-black text-primary-950 tracking-tight">{ex.title}</span>
                                  <span className="text-[10px] font-bold text-gray-400 uppercase">{new Date(ex.date).toLocaleDateString()}</span>
                               </div>
                            </div>
                         </td>
                         <td className="px-8 py-6 border-y border-transparent group-hover:border-gray-100">
                            <span className="px-3 py-1 bg-gray-100 text-gray-500 text-[9px] font-black rounded-full uppercase italic">{ex.category}</span>
                         </td>
                         <td className="px-8 py-6 border-y border-transparent group-hover:border-gray-100">
                            <div className="flex flex-col gap-1">
                               <div className="flex items-center gap-2">
                                  <span className="text-xs font-black text-primary-950">{ex.vendorName || ex.paidTo}</span>
                                  {ex.vendorVerification && (
                                     <span className="text-[10px] text-accent-500" title="Verified ID"><ShieldCheck size={12} /></span>
                                  )}
                               </div>
                            </div>
                         </td>
                         <td className="px-8 py-6 text-center border-y border-transparent group-hover:border-gray-100">
                            <span className="text-xs font-bold text-gray-400 uppercase tracking-tighter italic">{ex.paymentMethod}</span>
                         </td>
                         <td className="px-8 py-6 text-center border-y border-transparent group-hover:border-gray-100">
                            <div className="flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button 
                                    onClick={() => handleViewDetails(ex)}
                                    className="p-2.5 bg-blue-50 text-blue-500 rounded-xl hover:bg-blue-500 hover:text-white transition-all shadow-sm"
                                    title="View Deep Audit"
                                >
                                    <Eye size={14} />
                                </button>
                                <button 
                                    onClick={() => handleOpenEdit(ex)}
                                    className="p-2.5 bg-amber-50 text-amber-500 rounded-xl hover:bg-amber-500 hover:text-white transition-all shadow-sm"
                                    title="Edit Protocol"
                                >
                                    <Edit3 size={14} />
                                </button>
                                <button 
                                    onClick={() => handleDeleteExpense(ex._id)}
                                    className="p-2.5 bg-red-50 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all shadow-sm"
                                    title="Purge Archive"
                                >
                                    <Trash2 size={14} />
                                </button>
                            </div>
                         </td>
                         <td className="px-8 py-6 rounded-r-2xl text-right border-y border-r border-transparent group-hover:border-gray-100 font-mono">
                            <span className="text-sm font-black text-primary-950 tracking-tighter">₹{ex.amount.toLocaleString()}</span>
                         </td>
                       </tr>
                     ))}
                     {filteredExpenses.length === 0 && (
                         <tr>
                             <td colSpan="6" className="px-8 py-20 text-center">
                                 <div className="flex flex-col items-center gap-4">
                                     <CreditCard size={40} className="text-gray-200" />
                                     <span className="text-xs font-black text-gray-300 uppercase tracking-widest">No detailed archives match your query.</span>
                                 </div>
                             </td>
                         </tr>
                     )}
                   </tbody>
                </table>
           </div>
        </section>
      </div>

      {/* Record/Edit Expense Modal */}
      <Modal 
        isOpen={showExpenseModal} 
        onClose={() => setShowExpenseModal(false)}
        title={isEditing ? "Modify Institutional Outflow" : "Record Institutional Outflow"}
        size="4xl"
      >
        <form onSubmit={handleSubmitExpense} className="p-10 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <Input 
                    label="Transaction Purpose" 
                    placeholder="e.g. Oct Transport Maintenance"
                    value={expenseForm.title}
                    onChange={(e) => setExpenseForm({...expenseForm, title: e.target.value})}
                    required
                />
                <Select 
                    label="Institutional Category"
                    value={expenseForm.category}
                    onChange={(e) => setExpenseForm({...expenseForm, category: e.target.value})}
                >
                    <option value="Transport">Logistics & Transport</option>
                    <option value="Maintenance">Infrastructure Maintenance</option>
                    <option value="Staff (Non-Teaching)">Non-Teaching Staff Funds</option>
                    <option value="Utilities">Utilities & Services</option>
                    <option value="Supplies">Educational Supplies</option>
                    <option value="Events">Institutional Events</option>
                    <option value="Other">Other Archives</option>
                </Select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <Input 
                    label="Disbursement Magnitude (INR)" 
                    type="number"
                    placeholder="0.00"
                    value={expenseForm.amount}
                    onChange={(e) => setExpenseForm({...expenseForm, amount: e.target.value})}
                    required
                />
                <Select 
                    label="Disbursement Protocol"
                    value={expenseForm.paymentMethod}
                    onChange={(e) => setExpenseForm({...expenseForm, paymentMethod: e.target.value})}
                >
                    <option value="Cash">Physical Currency (Cash)</option>
                    <option value="Bank Transfer">Digital Wire Transfer</option>
                    <option value="Cheque">Institutional Cheque</option>
                    <option value="UPI">Real-time UPI</option>
                    <option value="Other">Special Protocol</option>
                </Select>
            </div>

            <div className="bg-gray-50/50 p-8 rounded-[2rem] border border-gray-100 space-y-6">
                <div className="flex items-center gap-3 mb-2">
                    <Building size={16} className="text-accent-500" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-primary-950 italic">Recipient / Vendor Details</span>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <Input 
                        label="Primary Recipient Title" 
                        placeholder="Organization or Individual Name"
                        value={expenseForm.paidTo}
                        onChange={(e) => setExpenseForm({...expenseForm, paidTo: e.target.value})}
                        required
                    />
                    <Input 
                        label="Specific Vendor Name" 
                        placeholder="Point of Contact"
                        value={expenseForm.vendorName}
                        onChange={(e) => setExpenseForm({...expenseForm, vendorName: e.target.value})}
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <Input 
                        label="Communication Protocol (Phone)" 
                        placeholder="+91 XXXXX XXXXX"
                        value={expenseForm.vendorContact}
                        onChange={(e) => setExpenseForm({...expenseForm, vendorContact: e.target.value})}
                    />
                    <Input 
                        label="Identification Verification" 
                        placeholder="ID/GST/Aadhar Artifact ID"
                        value={expenseForm.vendorVerification}
                        onChange={(e) => setExpenseForm({...expenseForm, vendorVerification: e.target.value})}
                    />
                </div>
            </div>

            <Input 
                label="Supplementary Description" 
                placeholder="Internal auditing notes..."
                value={expenseForm.description}
                onChange={(e) => setExpenseForm({...expenseForm, description: e.target.value})}
            />

            <div className="pt-8 border-t border-gray-100 flex gap-4">
                <Button variant="secondary" onClick={() => setShowExpenseModal(false)} type="button">Abate</Button>
                <Button variant="accent" className="flex-1" type="submit">{isEditing ? 'Commit Update' : 'Commit Record'}</Button>
            </div>
        </form>
      </Modal>

      {/* Deep Audit Mode (Detail View) */}
      <Modal
        isOpen={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        title="Institutional Audit Archive"
        size="2xl"
      >
        {selectedExpense && (
            <div className="p-12 space-y-12">
                <div className="flex justify-between items-start">
                    <div className="space-y-2">
                        <span className="px-3 py-1 bg-violet-50 text-violet-600 text-[9px] font-black rounded-full uppercase italic tracking-widest">{selectedExpense.category}</span>
                        <h2 className="text-4xl font-black text-primary-950 tracking-tighter">{selectedExpense.title}</h2>
                        <div className="flex items-center gap-2 text-gray-400">
                           <CalendarIcon size={14} />
                           <span className="text-[10px] font-bold uppercase">{new Date(selectedExpense.date).toLocaleString()}</span>
                        </div>
                    </div>
                    <div className="text-right">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest italic">Archived Magnitude</p>
                        <p className="text-4xl font-black text-primary-950 tracking-tighter">₹{selectedExpense.amount.toLocaleString()}</p>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-12 pt-12 border-t border-gray-50">
                    <div className="space-y-6">
                        <div className="flex items-center gap-2 text-primary-950 font-black text-xs uppercase italic tracking-widest">
                           <Building size={16} className="text-accent-500" />
                           Beneficiary Info
                        </div>
                        <div className="space-y-4">
                            <div>
                                <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Recipient</p>
                                <p className="text-sm font-black text-primary-950">{selectedExpense.paidTo}</p>
                            </div>
                            <div>
                                <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Vendor Name</p>
                                <p className="text-sm font-black text-primary-950">{selectedExpense.vendorName || 'N/A'}</p>
                            </div>
                        </div>
                    </div>
                    <div className="space-y-6">
                        <div className="flex items-center gap-2 text-primary-950 font-black text-xs uppercase italic tracking-widest">
                           <ShieldCheck size={16} className="text-accent-500" />
                           Security Protocol
                        </div>
                        <div className="space-y-4">
                            <div>
                                <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Verification ID</p>
                                <p className="text-sm font-black text-primary-950">{selectedExpense.vendorVerification || 'NOT_VERIFIED'}</p>
                            </div>
                            <div>
                                <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Contact Trace</p>
                                <p className="text-sm font-black text-primary-950">{selectedExpense.vendorContact || 'UNAVAILABLE'}</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="p-8 bg-gray-50 rounded-3xl space-y-3">
                    <div className="flex items-center gap-2 text-[10px] font-black text-primary-950 uppercase tracking-widest italic">
                        <Info size={14} className="text-gray-400" />
                        Auditor Notes
                    </div>
                    <p className="text-xs text-gray-500 leading-relaxed font-bold italic">
                        {selectedExpense.description || "Institutional archive contains no supplementary notes for this disbursement protocol."}
                    </p>
                </div>

                <div className="flex justify-between items-center pt-8 border-t border-gray-50">
                    <div className="flex flex-col">
                        <span className="text-[8px] font-black text-gray-300 uppercase tracking-widest italic">Recorded By</span>
                        <span className="text-[10px] font-black text-primary-950 uppercase">{selectedExpense.addedBy?.name || 'SYSTEM_CORE'}</span>
                    </div>
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

export default AdminFinance;
