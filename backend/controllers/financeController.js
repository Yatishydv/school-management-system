import Salary from '../models/Salary.js';
import Expense from '../models/Expense.js';
import Fee from '../models/Fee.js';
import User from '../models/User.js';
import { v4 as uuidv4 } from 'uuid';

// @desc    Get financial summary (Revenue vs Expenses)
// @route   GET /api/finance/summary
// @access  Private/Admin
export const getFinancialSummary = async (req, res) => {
    try {
        // 1. Calculate Revenue from Fee payments
        const fees = await Fee.find({});
        let totalRevenue = 0;
        fees.forEach(fee => {
            fee.paymentHistory.forEach(payment => {
                totalRevenue += payment.amount;
            });
        });

        // 2. Calculate Expenses from Salaries
        const salaries = await Salary.find({ status: 'Paid' });
        let totalSalariesPaid = 0;
        salaries.forEach(s => totalSalariesPaid += s.paidAmount);

        // 3. Calculate Other Expenses
        const otherExpenses = await Expense.find({});
        let totalOtherExpenses = 0;
        otherExpenses.forEach(e => totalOtherExpenses += e.amount);

        res.json({
            totalRevenue,
            totalExpenses: totalSalariesPaid + totalOtherExpenses,
            netProfit: totalRevenue - (totalSalariesPaid + totalOtherExpenses),
            breakdown: {
                salaries: totalSalariesPaid,
                other: totalOtherExpenses
            }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Add a new expense
// @route   POST /api/finance/expenses
// @access  Private/Admin
export const addExpense = async (req, res) => {
    try {
        const { title, category, amount, description, paidTo, paymentMethod, referenceNumber, vendorName, vendorContact, vendorVerification } = req.body;
        const expense = new Expense({
            title,
            category,
            amount,
            description,
            paidTo,
            paymentMethod,
            referenceNumber,
            vendorName,
            vendorContact,
            vendorVerification,
            addedBy: req.user._id
        });
        await expense.save();
        res.status(201).json({ message: "Expense recorded archive successfully", expense });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Get all expenses
// @route   GET /api/finance/expenses
// @access  Private/Admin
export const getExpenses = async (req, res) => {
    try {
        const expenses = await Expense.find({}).sort({ date: -1 }).populate('addedBy', 'name');
        res.json(expenses);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Generate pending salaries for all teachers
// @route   POST /api/finance/salaries/generate
// @access  Private/Admin
export const generateMonthlySalaries = async (req, res) => {
    const { month, year } = req.body;
    try {
        const teachers = await User.find({ role: 'teacher' });
        const existingSalaries = await Salary.find({ month, year });
        const existingTeacherIds = existingSalaries.map(s => s.teacher.toString());

        const newSalaries = [];
        for (const teacher of teachers) {
            if (!existingTeacherIds.includes(teacher._id.toString())) {
                newSalaries.push({
                    teacher: teacher._id,
                    month,
                    year,
                    baseSalary: teacher.baseSalary || 0,
                    paidAmount: 0,
                    status: 'Pending',
                    invoiceNumber: `SAL-${month.substring(0, 3).toUpperCase()}-${year}-${uuidv4().substring(0, 8)}`
                });
            }
        }

        if (newSalaries.length > 0) {
            await Salary.insertMany(newSalaries);
        }

        res.status(201).json({ message: `Generated ${newSalaries.length} salary records.` });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Get all salaries
// @route   GET /api/finance/salaries
// @access  Private/Admin
export const getAllSalaries = async (req, res) => {
    try {
        const salaries = await Salary.find({}).populate('teacher', 'name uniqueId baseSalary').sort({ year: -1, createdAt: -1 });
        res.json(salaries);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update/Pay salary
// @route   PUT /api/finance/salaries/:id
// @access  Private/Admin
export const updateSalary = async (req, res) => {
    try {
        const { bonus, deductions, status, paymentDate, paymentMethod, remarks, baseSalary } = req.body;
        const salary = await Salary.findById(req.params.id);
        
        if (salary) {
            // Force numeric types for precision
            const activeBase = Number(baseSalary ?? salary.baseSalary);
            const activeBonus = Number(bonus ?? salary.bonus ?? 0);
            const activeDeductions = Number(deductions ?? salary.deductions ?? 0);

            // Precision calculation on server side with 2-decimal rounding
            salary.baseSalary = Math.round(activeBase * 100) / 100;
            salary.bonus = Math.round(activeBonus * 100) / 100;
            salary.deductions = Math.round(activeDeductions * 100) / 100;
            salary.paidAmount = Math.round((activeBase + activeBonus - activeDeductions) * 100) / 100;
            
            salary.status = status ?? salary.status;
            salary.paymentDate = paymentDate ?? salary.paymentDate;
            salary.paymentMethod = paymentMethod ?? salary.paymentMethod;
            salary.remarks = remarks ?? salary.remarks;

            const updatedSalary = await salary.save();
            res.json(updatedSalary);
        } else {
            res.status(404).json({ message: 'Salary record not found' });
        }
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Get detailed revenue history (Fee payments)
// @route   GET /api/finance/revenue/history
// @access  Private/Admin
export const getRevenueHistory = async (req, res) => {
    try {
        const fees = await Fee.find({}).populate('student', 'name uniqueId');
        let history = [];

        fees.forEach(fee => {
            fee.paymentHistory.forEach(payment => {
                history.push({
                    _id: payment._id,
                    student: fee.student,
                    feeType: fee.feeType,
                    amount: payment.amount,
                    date: payment.date,
                    paymentMethod: payment.paymentMethod,
                    referenceNumber: payment.referenceNumber,
                    month: fee.month,
                    year: fee.year
                });
            });
        });

        // Sort by date descending
        history.sort((a, b) => new Date(b.date) - new Date(a.date));

        res.json(history);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all transactions (Unified Ledger)
// @route   GET /api/finance/transactions
// @access  Private/Admin
export const getAllTransactions = async (req, res) => {
    try {
        // 1. Get Fee Payments (Income)
        const fees = await Fee.find({}).populate('student', 'name uniqueId');
        let income = [];
        fees.forEach(fee => {
            fee.paymentHistory.forEach(payment => {
                income.push({
                    _id: payment._id,
                    type: 'Income',
                    category: 'Student Fees',
                    title: fee.student?.name || 'Unknown Student',
                    subtitle: fee.feeType,
                    amount: payment.amount,
                    date: payment.date,
                    paymentMethod: payment.paymentMethod,
                    reference: payment.referenceNumber
                });
            });
        });

        // 2. Get Expenses (Outflow)
        const expenses = await Expense.find({}).populate('addedBy', 'name');
        let outflows = expenses.map(ex => ({
            _id: ex._id,
            type: 'Expense',
            category: ex.category,
            title: ex.title,
            subtitle: ex.paidTo,
            amount: ex.amount,
            date: ex.date,
            paymentMethod: ex.paymentMethod,
            reference: ex.referenceNumber
        }));

        // 3. Get Paid Salaries (Outflow)
        const salaries = await Salary.find({ status: 'Paid' }).populate('teacher', 'name uniqueId');
        let staffPayments = salaries.map(s => ({
            _id: s._id,
            type: 'Expense',
            category: 'Staff Salary',
            title: s.teacher?.name || 'Unknown Teacher',
            subtitle: `${s.month} ${s.year}`,
            amount: s.paidAmount,
            date: s.paymentDate || s.updatedAt,
            paymentMethod: s.paymentMethod,
            reference: s.invoiceNumber
        }));

        // Combine and Sort
        const allTransactions = [...income, ...outflows, ...staffPayments].sort((a, b) => new Date(b.date) - new Date(a.date));

        res.json(allTransactions);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get salaries for logged in teacher
// @route   GET /api/finance/my-salaries
// @access  Private/Teacher
export const getMySalaries = async (req, res) => {
    try {
        const salaries = await Salary.find({ teacher: req.user._id }).sort({ year: -1, createdAt: -1 });
        res.json(salaries);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
// @desc    Delete an expense
// @route   DELETE /api/finance/expenses/:id
// @access  Private/Admin
export const deleteExpense = async (req, res) => {
    try {
        const expense = await Expense.findByIdAndDelete(req.params.id);
        if (!expense) return res.status(404).json({ message: 'Expense record not found' });
        res.json({ message: 'Expense record removed successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update an expense
// @route   PUT /api/finance/expenses/:id
// @access  Private/Admin
export const updateExpense = async (req, res) => {
    try {
        const expense = await Expense.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!expense) return res.status(404).json({ message: 'Expense record not found' });
        res.json({ message: 'Expense record updated successfully', expense });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Delete a salary record
// @route   DELETE /api/finance/salaries/:id
// @access  Private/Admin
export const deleteSalary = async (req, res) => {
    try {
        const salary = await Salary.findByIdAndDelete(req.params.id);
        if (!salary) return res.status(404).json({ message: 'Salary record not found' });
        res.json({ message: 'Salary record removed successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
