import { useEffect, useState } from "react";
import { createStaffUser, getAllUsers } from "../services/authApi";

function Staff() {
  const [staff, setStaff] = useState([]);
  const [form, setForm] = useState({ username: "", email: "", contactNo: "", password: "", role: "InventoryStaff" });
  const [saving, setSaving] = useState(false);

  const loadStaff = async () => {
    try {
      const { data } = await getAllUsers();
      setStaff(data.users || data.data || []);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => { loadStaff(); }, []);

  const submit = async (event) => {
    event.preventDefault();
    try {
      setSaving(true);
      await createStaffUser(form);
      setForm({ username: "", email: "", contactNo: "", password: "", role: "InventoryStaff" });
      loadStaff();
    } catch (error) {
      alert(error.response?.data?.message || "Could not create staff account.");
    } finally {
      setSaving(false);
    }
  };

  return <div className="min-h-screen bg-slate-50 p-8">
    <h1 className="text-3xl font-bold text-slate-800">My Franchise Staff</h1>
    <p className="mt-1 text-slate-500">Add staff for your active franchise. They cannot access other franchises.</p>
    <div className="mt-6 grid gap-6 lg:grid-cols-[420px_1fr]">
      <form onSubmit={submit} className="space-y-4 rounded-2xl bg-white p-6 shadow-sm">
        <h2 className="text-lg font-bold">Add Staff Member</h2>
        {[ ["username", "Full name", "text"], ["email", "Email", "email"], ["contactNo", "10-digit phone", "text"], ["password", "Temporary password", "password"] ].map(([field, label, type]) => <label key={field} className="block"><span className="mb-1 block text-sm font-medium">{label}</span><input required minLength={field === "password" ? 6 : undefined} pattern={field === "contactNo" ? "[0-9]{10}" : undefined} type={type} value={form[field]} onChange={(e) => setForm({ ...form, [field]: e.target.value })} className="w-full rounded-xl border border-slate-200 px-3 py-2" /></label>)}
        <label className="block"><span className="mb-1 block text-sm font-medium">Role</span><select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} className="w-full rounded-xl border border-slate-200 px-3 py-2"><option value="InventoryStaff">Inventory Staff</option><option value="PackingStaff">Packing Staff</option></select></label>
        <button disabled={saving} className="w-full rounded-xl bg-blue-600 py-2 font-semibold text-white disabled:opacity-60">{saving ? "Creating..." : "Create Staff Login"}</button>
      </form>
      <div className="rounded-2xl bg-white p-6 shadow-sm"><h2 className="text-lg font-bold">Current Staff</h2><div className="mt-4 space-y-3">{staff.length ? staff.map((user) => <div key={user._id} className="flex items-center justify-between rounded-xl border border-slate-100 p-4"><div><p className="font-semibold">{user.username}</p><p className="text-sm text-slate-500">{user.email} · {user.contactNo}</p></div><span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">{user.role}</span></div>) : <p className="text-slate-500">No staff added yet.</p>}</div></div>
    </div>
  </div>;
}

export default Staff;
