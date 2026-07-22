import { useEffect, useState } from "react";
import { createStaffUser, getAllUsers } from "../services/authApi";
import api from "../services/apiConfig";

const inputClass =
  "w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none transition focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-100";

// Role colour map
const roleColors = {
  InventoryStaff: { bg: "bg-indigo-50", text: "text-indigo-700", dot: "bg-indigo-500" },
  PackingStaff:   { bg: "bg-purple-50", text: "text-purple-700", dot: "bg-purple-500" },
};

const RoleBadge = ({ role }) => {
  const c = roleColors[role] || { bg: "bg-slate-100", text: "text-slate-600", dot: "bg-slate-400" };
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ${c.bg} ${c.text}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${c.dot}`} />
      {role === "InventoryStaff" ? "Inventory Staff" : role === "PackingStaff" ? "Packing Staff" : role}
    </span>
  );
};

// Status badge
const StatusBadge = ({ status }) => (
  <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${
    status === "Active" ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-600"
  }`}>
    {status || "Active"}
  </span>
);

function Staff() {
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [alert, setAlert] = useState(null);

  // Confirm delete modal
  const [deleteTarget, setDeleteTarget] = useState(null);

  const [form, setForm] = useState({
    username: "",
    email: "",
    contactNo: "",
    password: "",
    role: "InventoryStaff",
  });

  const showAlert = (type, msg) => {
    setAlert({ type, msg });
    setTimeout(() => setAlert(null), 3500);
  };

  const loadStaff = async () => {
    try {
      setLoading(true);
      const { data } = await getAllUsers();
      const allUsers = data.users || data.data || [];
      // Only show staff roles — filter out Admin/StoreManager/Customer
      const staffOnly = allUsers.filter((u) =>
        ["InventoryStaff", "PackingStaff"].includes(u.role)
      );
      setStaff(staffOnly);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStaff();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      await createStaffUser(form);
      setForm({ username: "", email: "", contactNo: "", password: "", role: "InventoryStaff" });
      await loadStaff();
      showAlert("success", `${form.role === "InventoryStaff" ? "Inventory Staff" : "Packing Staff"} account created.`);
    } catch (err) {
      showAlert("error", err.response?.data?.message || "Could not create staff account.");
    } finally {
      setSaving(false);
    }
  };

  // Toggle Active / Inactive status for a staff member
  const handleToggleStatus = async (userId, currentStatus) => {
    try {
      const newStatus = currentStatus === "Active" ? "Inactive" : "Active";
      await api.patch(`/users/updateUserById/${userId}`, { status: newStatus });
      await loadStaff();
      showAlert("success", `Staff member ${newStatus === "Active" ? "activated" : "deactivated"}.`);
    } catch (err) {
      showAlert("error", err.response?.data?.message || "Failed to update status.");
    }
  };

  // Hard delete a staff member (Admin only in production — StoreManager can deactivate)
  const handleDelete = async (userId) => {
    try {
      await api.delete(`/users/deleteUserById/${userId}`);
      setDeleteTarget(null);
      await loadStaff();
      showAlert("success", "Staff member removed.");
    } catch (err) {
      showAlert("error", err.response?.data?.message || "Failed to delete.");
    }
  };

  const filtered = staff.filter(
    (u) =>
      u.username?.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase()) ||
      u.contactNo?.includes(search)
  );

  const stats = {
    total: staff.length,
    inventory: staff.filter((u) => u.role === "InventoryStaff").length,
    packing: staff.filter((u) => u.role === "PackingStaff").length,
    active: staff.filter((u) => (u.status || "Active") === "Active").length,
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-8">

      {/* Toast Alert */}
      {alert && (
        <div className={`fixed top-6 right-6 z-[100] flex items-center gap-3 rounded-xl px-5 py-3.5 text-sm font-semibold shadow-xl ${
          alert.type === "success" ? "bg-emerald-600 text-white" : "bg-red-600 text-white"
        }`}>
          {alert.type === "success" ? "✓" : "✕"} {alert.msg}
        </div>
      )}

      {/* Delete Confirm Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-100">
              <svg className="h-7 w-7 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
            </div>
            <h3 className="text-lg font-bold text-slate-800">Remove Staff Member?</h3>
            <p className="mt-2 text-sm text-slate-500">
              <strong>{deleteTarget.username}</strong>'s account will be permanently deleted. This cannot be undone.
            </p>
            <div className="mt-5 flex gap-3">
              <button onClick={() => setDeleteTarget(null)} className="flex-1 rounded-xl border py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50">Cancel</button>
              <button onClick={() => handleDelete(deleteTarget._id)} className="flex-1 rounded-xl bg-red-600 py-2.5 text-sm font-semibold text-white hover:bg-red-700">Delete</button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-slate-900">My Staff</h1>
        <p className="mt-1 text-slate-500">Manage Inventory and Packing Staff for your franchise.</p>
      </div>

      {/* Stats row */}
      <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { label: "Total Staff", value: stats.total, color: "bg-indigo-50 text-indigo-700 border-indigo-100" },
          { label: "Active", value: stats.active, color: "bg-emerald-50 text-emerald-700 border-emerald-100" },
          { label: "Inventory Staff", value: stats.inventory, color: "bg-blue-50 text-blue-700 border-blue-100" },
          { label: "Packing Staff", value: stats.packing, color: "bg-purple-50 text-purple-700 border-purple-100" },
        ].map(({ label, value, color }) => (
          <div key={label} className={`rounded-2xl border p-4 ${color}`}>
            <p className="text-xs font-medium opacity-70">{label}</p>
            <p className="mt-1 text-3xl font-extrabold">{value}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-[380px_1fr]">

        {/* ── Add Staff Form ── */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-bold text-slate-800">Add Staff Member</h2>
          <p className="mt-1 text-sm text-slate-500">They can only access your franchise.</p>
          <form onSubmit={handleSubmit} className="mt-5 space-y-4">
            {[
              ["username", "Full Name", "text", "e.g. Rahul Kumar"],
              ["email", "Email", "email", "staff@example.com"],
              ["contactNo", "Phone Number", "text", "10-digit mobile"],
              ["password", "Temporary Password", "password", "Min. 6 characters"],
            ].map(([field, label, type, placeholder]) => (
              <div key={field}>
                <label className="mb-1.5 block text-sm font-semibold text-slate-700">{label}</label>
                <input
                  required
                  type={type}
                  placeholder={placeholder}
                  minLength={field === "password" ? 6 : undefined}
                  pattern={field === "contactNo" ? "[0-9]{10}" : undefined}
                  value={form[field]}
                  onChange={(e) => setForm({ ...form, [field]: e.target.value })}
                  className={inputClass}
                />
              </div>
            ))}

            <div>
              <label className="mb-1.5 block text-sm font-semibold text-slate-700">Role</label>
              <select
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value })}
                className={inputClass}
              >
                <option value="InventoryStaff">Inventory Staff (Billing)</option>
                <option value="PackingStaff">Packing Staff</option>
              </select>
            </div>

            <button
              disabled={saving}
              className="mt-2 w-full rounded-xl bg-indigo-600 py-2.5 text-sm font-bold text-white transition hover:bg-indigo-700 disabled:opacity-60"
            >
              {saving ? "Creating…" : "Create Staff Login"}
            </button>
          </form>
        </div>

        {/* ── Staff List ── */}
        <div className="flex flex-col rounded-2xl border border-slate-200 bg-white shadow-sm">
          {/* List header with search */}
          <div className="flex items-center gap-3 border-b border-slate-100 px-6 py-4">
            <h2 className="flex-1 text-lg font-bold text-slate-800">Current Staff</h2>
            <div className="relative">
              <svg className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search staff…"
                className="rounded-xl border border-slate-200 bg-slate-50 py-2 pl-9 pr-4 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
              />
            </div>
          </div>

          <div className="flex-1 divide-y divide-slate-50 overflow-auto">
            {loading ? (
              <div className="flex h-40 items-center justify-center text-slate-400 text-sm">Loading…</div>
            ) : filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <svg className="h-14 w-14 text-slate-200" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                <p className="mt-3 font-semibold text-slate-400">{search ? "No matching staff found." : "No staff added yet."}</p>
              </div>
            ) : (
              filtered.map((user) => (
                <div
                  key={user._id}
                  className="flex items-center gap-4 px-6 py-4 transition hover:bg-slate-50"
                >
                  {/* Avatar initials */}
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-sm font-bold text-white">
                    {user.username?.slice(0, 2).toUpperCase() || "??"}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="truncate font-semibold text-slate-800">{user.username}</p>
                    <p className="truncate text-sm text-slate-500">
                      {user.email}{user.contactNo ? ` · ${user.contactNo}` : ""}
                    </p>
                  </div>

                  {/* Badges */}
                  <div className="flex shrink-0 flex-col items-end gap-1.5">
                    <RoleBadge role={user.role} />
                    <StatusBadge status={user.status || "Active"} />
                  </div>

                  {/* Action buttons */}
                  <div className="flex shrink-0 gap-1.5">
                    {/* Toggle active/inactive */}
                    <button
                      onClick={() => handleToggleStatus(user._id, user.status || "Active")}
                      title={(user.status || "Active") === "Active" ? "Deactivate" : "Activate"}
                      className={`rounded-lg p-2 text-xs font-semibold transition ${
                        (user.status || "Active") === "Active"
                          ? "bg-amber-50 text-amber-600 hover:bg-amber-100"
                          : "bg-emerald-50 text-emerald-600 hover:bg-emerald-100"
                      }`}
                    >
                      {(user.status || "Active") === "Active" ? (
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" /></svg>
                      ) : (
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                      )}
                    </button>

                    {/* Delete */}
                    <button
                      onClick={() => setDeleteTarget(user)}
                      title="Remove staff member"
                      className="rounded-lg bg-red-50 p-2 text-red-500 transition hover:bg-red-100"
                    >
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Staff;
