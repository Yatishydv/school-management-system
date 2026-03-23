import React, { useEffect, useMemo, useState } from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import {
  Download,
  Plus,
  Edit2,
  Trash2,
  Key,
  UserPlus,
} from "lucide-react";
import useAuthStore from "../../state/authStore";
import { saveAs } from "file-saver";
import Modal from "../../components/shared/Modal";
import AddEditUserModal from "../../components/admin/AddEditUserModal";
import AddStudentForm from "../../components/admin/AddStudentForm";
import AddTeacherForm from "../../components/admin/AddTeacherForm";
import adminService from "../../api/adminService";
import { toast } from "react-toastify";

const KPI = ({ title, value, sub }) => (
  <div className="bg-white rounded-2xl p-5 shadow-sm border">
    <div className="text-sm text-gray-500">{title}</div>
    <div className="text-2xl font-bold mt-2 text-primary-900">{value}</div>
    {sub && <div className="text-xs text-gray-400 mt-1">{sub}</div>}
  </div>
);

const AdminDashboard = () => {
  const { token } = useAuthStore();

  const [stats, setStats] = useState({
    students: 0,
    teachers: 0,
    pendingFees: 0,
    classes: 0,
    monthlyRegistrations: [],
  });

  const [users, setUsers] = useState([]);
  const [roleFilter, setRoleFilter] = useState("student");
  const [loadingUsers, setLoadingUsers] = useState(false);

  // Modal state
  const [showUserModal, setShowUserModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null); // null → add new, not edit

  // -------- FETCH STATS --------
  const fetchStats = async () => {
    try {
      const res = await adminService.getDashboardStats(token);
      setStats(res || { monthlyRegistrations: [] });
    } catch (err) {
      console.error("STATS ERROR:", err);
      toast.error("Failed to fetch dashboard stats.");
    }
  };

  // -------- FETCH USERS --------
  const fetchUsers = async () => {
    setLoadingUsers(true);
    try {
      const res = await adminService.getUsers(roleFilter, token);
      setUsers(res || []);
    } catch (err) {
      console.error("USER FETCH ERROR:", err);
      toast.error("Failed to fetch users.");
    }
    setLoadingUsers(false);
  };

  useEffect(() => {
    if (token) {
      fetchStats();
      fetchUsers();
    }
  }, [roleFilter, token]);

  // ---------- Modal Logic Fix ----------
  const handleAddUser = (role) => {
    setEditingUser(null); // not editing
    setRoleFilter(role); // student or teacher
    setShowUserModal(true);
  };

  const handleEditUser = (user) => {
    setEditingUser(user);
    setShowUserModal(true);
  };

  // ---------- Delete User ----------
  const deleteUser = async (userId) => {
    if (!window.confirm("Are you sure? This cannot be undone.")) return;

    try {
      await adminService.deleteUser(userId, token);
      toast.success("User deleted successfully!");
      fetchUsers();
    } catch (err) {
      console.error("DELETE USER ERROR:", err);
      toast.error(err.response?.data?.message || "Failed to delete user.");
    }
  };

  // ---------- Reset Password ----------
  const resetUserPassword = async (userId) => {
    if (!window.confirm("Reset this user's password?")) return;

    try {
      await adminService.resetUserPassword(userId, token);
      toast.success("Password reset. Email sent!");
    } catch (err) {
      console.error("RESET PASSWORD ERROR:", err);
      toast.error(err.response?.data?.message || "Failed to reset password.");
    }
  };

  // ---------- Chart Data ----------
  const monthlyData = useMemo(
    () =>
      (stats?.monthlyRegistrations || []).map((m) => ({
        month: m.month || "N/A",
        count: m.count || 0,
      })),
    [stats]
  );

  // ---------- Export Users ----------
  const exportUsersToCsv = async () => {
    try {
      const students = await adminService.getUsers("student", token);
      const teachers = await adminService.getUsers("teacher", token);
      const allUsers = [...(students || []), ...(teachers || [])];

      if (!allUsers.length) {
        toast.info("No users to export.");
        return;
      }

      const headers = ["Name", "ID", "Email", "Role"];
      const rows = [headers.join(",")];

      allUsers.forEach((u) =>
        rows.push(`${u.name},${u.uniqueId},${u.email},${u.role}`)
      );

      const blob = new Blob([rows.join("\n")], {
        type: "text/csv;charset=utf-8",
      });
      saveAs(blob, "all_users.csv");
      toast.success("Users exported!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to export users.");
    }
  };

  return (
    <div className="space-y-8 p-4 sm:p-6 lg:p-8">
      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <KPI title="Students" value={stats.students} sub="Total Students" />
        <KPI title="Teachers" value={stats.teachers} sub="Total Teachers" />
        <KPI title="Fees Due" value={`₹${stats.pendingFees}`} sub="Pending" />
        <KPI title="Classes" value={stats.classes} sub="Total Classes" />
      </div>

      {/* Chart + Actions */}
      <div className="grid md:grid-cols-3 gap-6">
        {/* Chart */}
        <div className="md:col-span-2 bg-white p-4 rounded-2xl border shadow">
          <h3 className="font-bold mb-4 text-primary-900">
            Monthly Registrations
          </h3>

          <div style={{ width: "100%", height: "260px" }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyData}>
                <defs>
                  <linearGradient id="reg" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="10%" stopColor="#2E8B57" stopOpacity={0.7} />
                    <stop offset="90%" stopColor="#2E8B57" stopOpacity={0.05} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="4 3" />
                <XAxis dataKey="month" />
                <Tooltip />
                <Area
                  type="monotone"
                  dataKey="count"
                  stroke="#2E8B57"
                  fill="url(#reg)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white p-4 rounded-2xl border shadow space-y-3">
          <button
            className="w-full py-3 rounded-xl bg-accent-500 text-white flex items-center justify-center gap-2"
            onClick={() => handleAddUser("student")}
          >
            <UserPlus size={18} /> Add Student
          </button>

          <button
            className="w-full py-3 rounded-xl bg-primary-900 text-white flex items-center justify-center gap-2"
            onClick={() => handleAddUser("teacher")}
          >
            <UserPlus size={18} /> Add Teacher
          </button>

          <button
            className="w-full py-3 rounded-xl border flex items-center justify-center gap-2"
            onClick={exportUsersToCsv}
          >
            <Download size={18} /> Export Users
          </button>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-2xl shadow p-6 border">
        <div className="flex justify-between mb-4">
          <select
            className="p-2 border rounded"
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
          >
            <option value="student">Students</option>
            <option value="teacher">Teachers</option>
          </select>

          <button
            className="px-4 py-2 bg-accent-500 text-white rounded-xl flex items-center gap-2"
            onClick={() => handleAddUser(roleFilter)}
          >
            <Plus size={18} /> New {roleFilter}
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b text-gray-600">
                <th className="px-4 py-2">Name</th>
                <th className="px-4 py-2">ID</th>
                <th className="px-4 py-2">Email</th>
                <th className="px-4 py-2">Role</th>
                <th className="px-4 py-2">Actions</th>
              </tr>
            </thead>

            <tbody>
              {users.map((u) => (
                <tr key={u._id} className="border-b">
                  <td className="px-4 py-2">{u.name}</td>
                  <td className="px-4 py-2">{u.uniqueId}</td>
                  <td className="px-4 py-2">{u.email}</td>
                  <td className="px-4 py-2 capitalize">{u.role}</td>

                  <td className="px-4 py-2 flex gap-2">
                    <button
                      className="p-2 bg-neutral-bg-subtle rounded"
                      onClick={() => handleEditUser(u)}
                    >
                      <Edit2 size={18} />
                    </button>

                    <button
                      className="p-2 bg-neutral-bg-subtle rounded"
                      onClick={() => resetUserPassword(u._id)}
                    >
                      <Key size={18} />
                    </button>

                    <button
                      className="p-2 bg-red-600 text-white rounded"
                      onClick={() => deleteUser(u._id)}
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}

              {!users.length && (
                <tr>
                  <td
                    colSpan={5}
                    className="py-4 text-center text-gray-400 italic"
                  >
                    No users found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* FIXED MODAL — SHOWS CORRECT FORM */}
      <Modal
        isOpen={showUserModal}
        onClose={() => setShowUserModal(false)}
        title={
          editingUser
            ? "Edit User"
            : roleFilter === "student"
            ? "Add Student"
            : "Add Teacher"
        }
      >
        {editingUser ? (
          <AddEditUserModal
            onClose={() => setShowUserModal(false)}
            onUserAddedOrUpdated={fetchUsers}
            user={editingUser}
            role={editingUser.role}
          />
        ) : roleFilter === "student" ? (
          <AddStudentForm
            onClose={() => setShowUserModal(false)}
            onUserAdded={fetchUsers}
          />
        ) : (
          <AddTeacherForm
            onClose={() => setShowUserModal(false)}
            onUserAdded={fetchUsers}
          />
        )}
      </Modal>
    </div>
  );
};

export default AdminDashboard;
