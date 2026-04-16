import axiosInstance from "./axios";

const financeService = {
  // Summary
  getSummary: async (token) => {
    const res = await axiosInstance.get(`/finance/summary`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  },

  // Expenses
  getExpenses: async (token) => {
    const res = await axiosInstance.get(`/finance/expenses`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  },
  addExpense: async (expenseData, token) => {
    const res = await axiosInstance.post(`/finance/expenses`, expenseData, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  },
  deleteExpense: async (id, token) => {
    const res = await axiosInstance.delete(`/finance/expenses/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  },
  updateExpense: async (id, expenseData, token) => {
    const res = await axiosInstance.put(`/finance/expenses/${id}`, expenseData, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  },

  // Salaries (Admin)
  getSalaries: async (token) => {
    const res = await axiosInstance.get(`/finance/salaries`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  },
  generateSalaries: async (month, year, token) => {
    const res = await axiosInstance.post(`/finance/salaries/generate`, { month, year }, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  },
  updateSalary: async (id, salaryData, token) => {
    const res = await axiosInstance.put(`/finance/salaries/${id}`, salaryData, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  },
  deleteSalary: async (id, token) => {
    const res = await axiosInstance.delete(`/finance/salaries/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  },

  // Salaries (Teacher)
  getMySalaries: async (token) => {
    const res = await axiosInstance.get(`/finance/my-salaries`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  },
};

export default financeService;
