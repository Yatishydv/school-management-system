import React, { useState, useEffect } from "react";
import { 
  Plus, 
  Search,
  Filter,
  TrendingDown,
  ArrowDownRight,
  TrendingUp,
  CreditCard,
  Building,
  ShieldCheck,
  FileText,
  Edit3,
  Trash2,
  Eye,
  Info,
  X,
  User,
  Settings,
  Truck,
  Zap,
  Package,
  Calendar,
  IndianRupee,
  Activity,
  Coffee,
  CheckCircle2
} from "lucide-react";
import useAuthStore from "../../stores/authStore";
import financeService from "../../api/financeService";
import { toast } from "react-toastify";
import Modal from "../../components/shared/Modal";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import Select from "../../components/ui/Select";
import ConfirmModal from "../../components/shared/ConfirmModal";

const AdminExpenses = () => {
    const { token } = useAuthStore();
    const [expenses, setExpenses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [showExpenseModal, setShowExpenseModal] = useState(false);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [selectedExpense, setSelectedExpense] = useState(null);
    const [deleteId, setDeleteId] = useState(null);
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
            const expensesData = await financeService.getExpenses(token);
            setExpenses(expensesData || []);
        } catch (err) {
            toast.error("Failed to load bill history.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (token) fetchData();
    }, [token]);

    const handleOpenAdd = (defaults = {}) => {
        setIsEditing(false);
        setSelectedExpense(null);
        setExpenseForm({
            title: defaults.title || "",
            category: defaults.category || "Other",
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

    const handleDeleteExpense = async () => {
        try {
            await financeService.deleteExpense(deleteId, token);
            toast.success("Bill reference removed.");
            setShowDeleteConfirm(false);
            fetchData();
        } catch (err) {
            toast.error("Could not remove record.");
        }
    };

    const handleSubmitExpense = async (e) => {
        e.preventDefault();
        try {
            if (isEditing) {
                await financeService.updateExpense(selectedExpense._id, expenseForm, token);
                toast.success("Bill updated successfully.");
            } else {
                await financeService.addExpense(expenseForm, token);
                toast.success("Payment recorded.");
            }
            setShowExpenseModal(false);
            fetchData();
        } catch (err) {
            toast.error(`Failed to save payment.`);
        }
    };

    const filteredExpenses = expenses.filter(e => {
        const title = e.title || "";
        const paidTo = e.paidTo || "";
        const vendorName = e.vendorName || "";
        const category = e.category || "";

        return title.toLowerCase().includes(searchTerm.toLowerCase()) || 
               paidTo.toLowerCase().includes(searchTerm.toLowerCase()) ||
               vendorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
               category.toLowerCase().includes(searchTerm.toLowerCase());
    });

    const stats = {
        totalSpent: expenses.reduce((acc, curr) => acc + (curr.amount || 0), 0),
        transport: expenses.filter(e => e.category === 'Transport').reduce((acc, curr) => acc + (curr.amount || 0), 0),
        maintenance: expenses.filter(e => e.category === 'Maintenance').reduce((acc, curr) => acc + (curr.amount || 0), 0),
        other: expenses.filter(e => !['Transport', 'Maintenance'].includes(e.category)).reduce((acc, curr) => acc + (curr.amount || 0), 0)
    };

    const quickTools = [
        { title: "Oct Fuel", category: "Transport", icon: <Truck size={14}/> },
        { title: "School Repair", category: "Maintenance", icon: <Settings size={14}/> },
        { title: "Stationery Buy", category: "Supplies", icon: <Package size={14}/> },
        { title: "Staff Tea/Misc", category: "Staff (Non-Teaching)", icon: <Coffee size={14}/> },
    ];

    if (loading) return (
        <div className="flex items-center justify-center min-h-[60vh]">
            <div className="w-12 h-12 border-4 border-primary-950 border-t-amber-500 rounded-full animate-spin"></div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50/50 pb-24 space-y-10">
            {/* HEADER */}
            <header className="px-8 md:px-14 pt-16 flex flex-col md:flex-row justify-between items-start md:items-end gap-8">
                <div className="space-y-4">
                    <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-amber-500"></div>
                        <span className="text-[10px] font-black uppercase tracking-[0.5em] text-gray-400">School Spending Hub</span>
                    </div>
                    <h1 className="text-5xl md:text-8xl font-black tracking-tighter leading-none text-primary-950">
                        Bills & <span className="text-gray-200">Payments.</span>
                    </h1>
                    <p className="text-gray-400 font-bold max-w-md mt-4 tracking-tight">
                        Log and track all school expenses, vendor bills, and daily spending.
                    </p>
                </div>
                
                <div className="flex gap-3">
                    <button 
                        onClick={() => handleOpenAdd()}
                        className="px-8 py-5 rounded-2xl bg-primary-950 text-white hover:bg-amber-500 transition-all flex items-center gap-3 group shadow-xl shadow-primary-950/20 active:scale-95"
                    >
                        <Plus size={20} className="group-hover:rotate-180 transition-transform duration-500" />
                        <span className="text-[10px] font-black uppercase tracking-widest">Add New Bill</span>
                    </button>
                </div>
            </header>

            <div className="px-8 md:px-14 space-y-10">
                {/* HIGH TOOLS - QUICK LOG */}
                <section className="space-y-4">
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest italic flex items-center gap-2">
                        <Activity size={12}/> Quick Log Tools
                    </span>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {quickTools.map((tool, idx) => (
                            <button 
                                key={idx}
                                onClick={() => handleOpenAdd(tool)}
                                className="p-6 bg-white border border-gray-100 rounded-[2rem] flex items-center gap-4 hover:border-primary-950 hover:shadow-xl transition-all group"
                            >
                                <div className="p-3 bg-gray-50 text-gray-400 rounded-xl group-hover:bg-primary-950 group-hover:text-white transition-all">
                                    {tool.icon}
                                </div>
                                <div className="text-left">
                                    <p className="text-xs font-black text-primary-950 leading-tight">{tool.title}</p>
                                    <p className="text-[9px] font-bold text-gray-300 uppercase tracking-widest">{tool.category}</p>
                                </div>
                            </button>
                        ))}
                    </div>
                </section>

                {/* SUMMARY STATS */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm space-y-4 group hover:border-amber-500 transition-all">
                        <div className="flex justify-between items-start">
                            <div className="p-4 bg-amber-50 text-amber-500 rounded-2xl group-hover:bg-amber-500 group-hover:text-white transition-all">
                                <TrendingDown size={24} />
                            </div>
                            <span className="text-[10px] font-black text-amber-500 uppercase tracking-widest italic">Total Spent</span>
                        </div>
                        <div>
                            <h3 className="text-3xl font-black text-primary-950 tracking-tighter">₹{stats.totalSpent.toLocaleString()}</h3>
                            <p className="text-[9px] font-bold text-gray-300 uppercase tracking-widest mt-1 italic">All time spending</p>
                        </div>
                    </div>

                    <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm space-y-4 group hover:border-blue-500 transition-all">
                        <div className="flex justify-between items-start">
                            <div className="p-4 bg-blue-50 text-blue-500 rounded-2xl group-hover:bg-blue-500 group-hover:text-white transition-all">
                                <Truck size={24} />
                            </div>
                            <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest italic">Transport</span>
                        </div>
                        <div>
                            <h3 className="text-3xl font-black text-primary-950 tracking-tighter">₹{stats.transport.toLocaleString()}</h3>
                            <p className="text-[9px] font-bold text-gray-300 uppercase tracking-widest mt-1 italic">Diesel & Drivers</p>
                        </div>
                    </div>

                    <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm space-y-4 group hover:border-violet-500 transition-all">
                        <div className="flex justify-between items-start">
                            <div className="p-4 bg-violet-50 text-violet-500 rounded-2xl group-hover:bg-violet-500 group-hover:text-white transition-all">
                                <Zap size={24} />
                            </div>
                            <span className="text-[10px] font-black text-violet-500 uppercase tracking-widest italic">Operations</span>
                        </div>
                        <div>
                            <h3 className="text-3xl font-black text-primary-950 tracking-tighter">₹{stats.maintenance.toLocaleString()}</h3>
                            <p className="text-[9px] font-bold text-gray-300 uppercase tracking-widest mt-1 italic">Repairs & Lights</p>
                        </div>
                    </div>

                    <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm space-y-4 group hover:border-gray-900 transition-all">
                        <div className="flex justify-between items-start">
                            <div className="p-4 bg-gray-50 text-gray-400 rounded-2xl group-hover:bg-gray-900 group-hover:text-white transition-all">
                                <Activity size={24} />
                            </div>
                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest italic">Other</span>
                        </div>
                        <div>
                            <h3 className="text-3xl font-black text-primary-950 tracking-tighter">₹{stats.other.toLocaleString()}</h3>
                            <p className="text-[9px] font-bold text-gray-300 uppercase tracking-widest mt-1 italic">Miscellaneous</p>
                        </div>
                    </div>
                </div>

                {/* SEARCH BAR */}
                <div className="relative group max-w-2xl">
                    <Search className="absolute left-8 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-amber-500 transition-colors" size={20} />
                    <input 
                        type="text" 
                        placeholder="Search bills by person, company, or category..."
                        className="w-full h-20 pl-20 pr-10 bg-white rounded-3xl border border-gray-100 shadow-sm outline-none focus:ring-4 focus:ring-amber-50 transition-all text-sm font-black text-primary-950 placeholder:text-gray-300"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                {/* BILL HISTORY TABLE */}
                <section className="bg-white rounded-[2.5rem] p-8 md:p-12 border border-gray-100 shadow-sm overflow-hidden animate-fade-up">
                    <div className="flex justify-between items-center mb-10 px-4">
                        <div className="flex items-center gap-3 text-left">
                            <div className="w-1.5 h-6 bg-amber-500 rounded-full"></div>
                            <h3 className="text-xl font-black text-primary-950 tracking-tight italic">Bill Ledger.</h3>
                        </div>
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{filteredExpenses.length} Total Bills</span>
                    </div>

                    <table className="w-full border-separate border-spacing-y-4">
                        <thead>
                            <tr className="text-left text-[10px] font-black uppercase tracking-[0.4em] text-gray-300">
                                <th className="px-8 pb-4">Payment Reason</th>
                                <th className="px-8 pb-4">Category</th>
                                <th className="px-8 pb-4">Receiver</th>
                                <th className="px-8 pb-4 text-center italic">Actions</th>
                                <th className="px-8 pb-4 text-right">Amount</th>
                            </tr>
                        </thead>
                        <tbody className="space-y-4">
                            {filteredExpenses.map((ex) => (
                                <tr key={ex._id} className="group hover:bg-gray-50 transition-all duration-300 rounded-2xl">
                                    <td className="px-8 py-6 rounded-l-2xl border-y border-l border-transparent group-hover:border-gray-100">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-2xl bg-violet-50 text-violet-500 flex items-center justify-center font-black">
                                                <FileText size={20} />
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="font-black text-primary-950 tracking-tight">{ex.title}</span>
                                                <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">{new Date(ex.date).toLocaleDateString()}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6 border-y border-transparent group-hover:border-gray-100">
                                        <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest italic border ${
                                            ex.category === 'Transport' ? 'bg-blue-50 text-blue-500 border-blue-100' :
                                            ex.category === 'Maintenance' ? 'bg-violet-50 text-violet-500 border-violet-100' :
                                            'bg-gray-50 text-gray-400 border-gray-100'
                                        }`}>
                                            {ex.category}
                                        </span>
                                    </td>
                                    <td className="px-8 py-6 border-y border-transparent group-hover:border-gray-100">
                                        <div className="flex flex-col gap-1">
                                            <div className="flex items-center gap-2">
                                                <span className="text-xs font-black text-primary-950">{ex.paidTo}</span>
                                                {ex.vendorVerification && (
                                                    <span className="text-[10px] text-emerald-500" title="Identity Verified"><CheckCircle2 size={14} /></span>
                                                )}
                                            </div>
                                            <span className="text-[9px] font-bold text-gray-300 uppercase tracking-widest">{ex.vendorName || "No extra data"}</span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6 text-center border-y border-transparent group-hover:border-gray-100">
                                        <div className="flex items-center justify-center gap-2">
                                            <button 
                                                onClick={() => handleViewDetails(ex)}
                                                className="p-3 bg-white border border-gray-100 text-blue-500 rounded-xl hover:bg-blue-500 hover:text-white transition-all shadow-sm"
                                            >
                                                <Eye size={14} />
                                            </button>
                                            <button 
                                                onClick={() => handleOpenEdit(ex)}
                                                className="p-3 bg-white border border-gray-100 text-amber-500 rounded-xl hover:bg-amber-500 hover:text-white transition-all shadow-sm"
                                            >
                                                <Edit3 size={14} />
                                            </button>
                                            <button 
                                                onClick={() => {
                                                    setDeleteId(ex._id);
                                                    setShowDeleteConfirm(true);
                                                }}
                                                className="p-3 bg-white border border-gray-100 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all shadow-sm"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6 rounded-r-2xl text-right border-y border-r border-transparent group-hover:border-gray-100">
                                        <span className="text-base font-black text-primary-950 tracking-tighter cursor-default">₹{(ex.amount || 0).toLocaleString()}</span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {!filteredExpenses.length && (
                        <div className="py-24 flex flex-col items-center justify-center opacity-40 space-y-4">
                            <CreditCard size={48} />
                            <p className="text-[10px] font-black uppercase tracking-widest">No matching bills found</p>
                        </div>
                    )}
                </section>
            </div>

            {/* MODALS */}
            <Modal isOpen={showExpenseModal} onClose={() => setShowExpenseModal(false)} title="Log School Bill" size="4xl">
                <form onSubmit={handleSubmitExpense} className="p-10 space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <Input label="What was this for?" placeholder="e.g. October Petrol / Bus Repair" value={expenseForm.title} onChange={(e) => setExpenseForm({...expenseForm, title: e.target.value})} required />
                        <Select label="Type of Expense" value={expenseForm.category} onChange={(e) => setExpenseForm({...expenseForm, category: e.target.value})}>
                            <option value="Transport">Buses & Drivers (Fuel/Repair)</option>
                            <option value="Maintenance">School Repairs & Cleaning</option>
                            <option value="Staff (Non-Teaching)">Staff Food / Others</option>
                            <option value="Utilities">Electricity / Water / Internet</option>
                            <option value="Supplies">School Stationery / Assets</option>
                            <option value="Events">Function & School Events</option>
                            <option value="Other">Other Miscellaneous</option>
                        </Select>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <Input label="Amount (₹)" type="number" value={expenseForm.amount} onChange={(e) => setExpenseForm({...expenseForm, amount: e.target.value})} required />
                        <Select label="Payment How?" value={expenseForm.paymentMethod} onChange={(e) => setExpenseForm({...expenseForm, paymentMethod: e.target.value})}>
                            <option value="Cash">Cash Handover</option>
                            <option value="Bank Transfer">Net Banking</option>
                            <option value="Cheque">School Cheque</option>
                            <option value="UPI">UPI / PhonePe / GPay</option>
                            <option value="Other">Other Mode</option>
                        </Select>
                    </div>

                    <div className="p-8 bg-gray-50 rounded-3xl border border-gray-100 space-y-6">
                        <div className="flex items-center gap-3">
                            <User size={16} className="text-amber-500" />
                            <span className="text-[10px] font-black uppercase tracking-widest italic">Person/Vendor Details</span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <Input label="Paid To (Name)" placeholder="Name of person receiving money" value={expenseForm.paidTo} onChange={(e) => setExpenseForm({...expenseForm, paidTo: e.target.value})} required />
                            <Input label="Shop or Company Name" placeholder="Optional" value={expenseForm.vendorName} onChange={(e) => setExpenseForm({...expenseForm, vendorName: e.target.value})} />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <Input label="Mobile Number" placeholder="For contact" value={expenseForm.vendorContact} onChange={(e) => setExpenseForm({...expenseForm, vendorContact: e.target.value})} />
                            <Input label="Receipt Number / ID" placeholder="Bill ID or Govt ID" value={expenseForm.vendorVerification} onChange={(e) => setExpenseForm({...expenseForm, vendorVerification: e.target.value})} />
                        </div>
                    </div>

                    <Input label="Extra Notes" placeholder="Any details you want to remember..." value={expenseForm.description} onChange={(e) => setExpenseForm({...expenseForm, description: e.target.value})} />

                    <div className="pt-8 border-t border-gray-100 flex gap-4">
                        <Button variant="secondary" onClick={() => setShowExpenseModal(false)}>Cancel</Button>
                        <Button variant="accent" className="flex-1" type="submit">Save Money Record</Button>
                    </div>
                </form>
            </Modal>

            <Modal isOpen={showDetailModal} onClose={() => setShowDetailModal(false)} title="Official School Receipt" size="2xl">
                {selectedExpense && (
                    <div className="p-12 space-y-12">
                        <div className="flex justify-between items-start">
                            <div className="space-y-2 text-left">
                                <span className="px-4 py-1.5 bg-amber-50 text-amber-500 text-[10px] font-black rounded-full uppercase italic tracking-widest border border-amber-100">{selectedExpense.category}</span>
                                <h4 className="text-4xl font-black text-primary-950 tracking-tighter leading-none">{selectedExpense.title}</h4>
                                <div className="flex items-center gap-2 text-gray-400">
                                    <Calendar size={14} />
                                    <span className="text-[10px] font-bold uppercase tracking-widest">{new Date(selectedExpense.date).toLocaleDateString()}</span>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest italic">Paid Amount</p>
                                <p className="text-4xl font-black text-primary-950 tracking-tighter">₹{(selectedExpense.amount || 0).toLocaleString()}</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-12 bg-gray-50 p-10 rounded-[3rem] border border-gray-100">
                            <div className="space-y-1 text-left">
                                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Money Given To</p>
                                <p className="text-lg font-black text-primary-950 tracking-tight leading-tight">{selectedExpense.paidTo}</p>
                            </div>
                            <div className="space-y-1 text-left">
                                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Receipt ID / Ref</p>
                                <p className="text-lg font-black text-primary-950 italic">{selectedExpense.vendorVerification || "NOT_PROVIDED"}</p>
                            </div>
                        </div>

                        <div className="p-8 border-l-4 border-amber-500 bg-amber-50/20 text-left">
                            <h5 className="text-[9px] font-black text-amber-500 uppercase tracking-widest mb-2 italic">Notes for Records</h5>
                            <p className="text-xs text-gray-600 leading-relaxed font-bold italic">
                                {selectedExpense.description || "No extra notes were added for this school payment."}
                            </p>
                        </div>

                        <button onClick={() => setShowDetailModal(false)} className="w-full py-5 bg-primary-950 text-white rounded-3xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-primary-950/20 hover:bg-amber-500 transition-all">Done Viewing</button>
                    </div>
                )}
            </Modal>

            <ConfirmModal 
                isOpen={showDeleteConfirm}
                onClose={() => setShowDeleteConfirm(false)}
                onConfirm={handleDeleteExpense}
                title="Remove this bill?"
                message="Are you sure you want to delete this payment record? You cannot get it back."
            />
        </div>
    );
};

export default AdminExpenses;
