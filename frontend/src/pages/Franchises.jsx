import { useState, useEffect } from "react";
import {
  getFranchises,
  createFranchise,
  deleteFranchise,
  toggleFranchiseStatus,
  updateFranchise,
} from "../services/franchiseApi";
import { createStaffUser, getAllUsers } from "../services/authApi";

// Status badge component
const StatusBadge = ({ status }) => (
  <span
    className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ${
      status === "Active"
        ? "bg-emerald-100 text-emerald-700"
        : "bg-red-100 text-red-600"
    }`}
  >
    <span
      className={`h-1.5 w-1.5 rounded-full ${
        status === "Active" ? "bg-emerald-500" : "bg-red-500"
      }`}
    />
    {status}
  </span>
);

// Modal wrapper
const Modal = ({ title, subtitle, onClose, children }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
    <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl overflow-hidden">
      <div className="bg-gradient-to-r from-slate-800 to-slate-900 px-6 py-5">
        <h2 className="text-xl font-bold text-white">{title}</h2>
        {subtitle && <p className="mt-1 text-sm text-slate-400">{subtitle}</p>}
      </div>
      <div className="p-6">{children}</div>
    </div>
  </div>
);

// Reusable form field
const Field = ({ label, children }) => (
  <div>
    <label className="mb-1.5 block text-sm font-semibold text-slate-700">{label}</label>
    {children}
  </div>
);

const inputClass =
  "w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none transition focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-100";

function Franchises() {
  const [franchises, setFranchises] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal state
  const [activeModal, setActiveModal] = useState(null); // 'create' | 'manager' | 'assign'

  // For assigning/changing the manager of an existing franchise
  const [assignTarget, setAssignTarget] = useState(null); // franchise object
  const [assignManagerId, setAssignManagerId] = useState("");
  const [assignSaving, setAssignSaving] = useState(false);

  // Create franchise form
  const [formData, setFormData] = useState({
    name: "",
    contactNo: "",
    manager: "",
    address: { address: "", city: "", state: "", postalCode: "", currentLocation: { lat: "", lng: "" } },
  });

  // Create manager form
  const [managerForm, setManagerForm] = useState({
    username: "",
    email: "",
    contactNo: "",
    password: "",
  });
  const [managerSaving, setManagerSaving] = useState(false);

  // Alert state
  const [alert, setAlert] = useState(null); // { type: 'success'|'error', msg }

  const showAlert = (type, msg) => {
    setAlert({ type, msg });
    setTimeout(() => setAlert(null), 3500);
  };

  const loadData = async () => {
    try {
      setLoading(true);
      const [franchiseRes, userRes] = await Promise.all([
        getFranchises(),
        getAllUsers(),
      ]);
      setFranchises(franchiseRes.data.franchises || []);
      setUsers(userRes.data.users || userRes.data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Handle form field changes (supports nested address.*)
  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith("address.currentLocation.")) {
      const field = name.split(".")[2];
      setFormData((f) => ({
        ...f,
        address: {
          ...f.address,
          currentLocation: { ...f.address.currentLocation, [field]: value },
        },
      }));
    } else if (name.startsWith("address.")) {
      const field = name.split(".")[1];
      setFormData((f) => ({ ...f, address: { ...f.address, [field]: value } }));
    } else {
      setFormData((f) => ({ ...f, [name]: value }));
    }
  };

  // Create a new franchise
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await createFranchise(formData);
      setActiveModal(null);
      setFormData({ name: "", contactNo: "", manager: "", address: { address: "", city: "", state: "", postalCode: "", currentLocation: { lat: "", lng: "" } } });
      await loadData();
      showAlert("success", "Franchise created successfully.");
    } catch (err) {
      showAlert("error", err.response?.data?.message || "Failed to create franchise.");
    }
  };

  // Delete a franchise with confirmation
  const handleDelete = async (id) => {
    if (!window.confirm("Permanently delete this franchise? This cannot be undone.")) return;
    try {
      await deleteFranchise(id);
      await loadData();
      showAlert("success", "Franchise deleted.");
    } catch (err) {
      showAlert("error", err.response?.data?.message || "Failed to delete.");
    }
  };

  // Toggle Active/Inactive
  const handleToggle = async (id) => {
    try {
      await toggleFranchiseStatus(id);
      await loadData();
    } catch (err) {
      showAlert("error", "Failed to toggle status.");
    }
  };

  // Create a new StoreManager account
  const handleCreateManager = async (e) => {
    e.preventDefault();
    try {
      setManagerSaving(true);
      await createStaffUser({ ...managerForm, role: "StoreManager" });
      setManagerForm({ username: "", email: "", contactNo: "", password: "" });
      setActiveModal(null);
      await loadData();
      showAlert("success", "Store Manager created. You can now assign them to a franchise.");
    } catch (err) {
      showAlert("error", err.response?.data?.message || "Failed to create Store Manager.");
    } finally {
      setManagerSaving(false);
    }
  };

  // Assign or change the manager of an existing franchise
  const handleAssignManager = async (e) => {
    e.preventDefault();
    if (!assignTarget || !assignManagerId) return;
    try {
      setAssignSaving(true);
      await updateFranchise(assignTarget._id, { manager: assignManagerId });
      setActiveModal(null);
      setAssignTarget(null);
      setAssignManagerId("");
      await loadData();
      showAlert("success", "Store Manager assigned successfully.");
    } catch (err) {
      showAlert("error", err.response?.data?.message || "Failed to assign manager.");
    } finally {
      setAssignSaving(false);
    }
  };

  const storeManagers = users.filter((u) => u.role === "StoreManager");

  const stats = {
    total: franchises.length,
    active: franchises.filter((f) => f.status === "Active").length,
    inactive: franchises.filter((f) => f.status !== "Active").length,
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-8">

      {/* Toast Alert */}
      {alert && (
        <div
          className={`fixed top-6 right-6 z-[100] flex items-center gap-3 rounded-xl px-5 py-3.5 text-sm font-semibold shadow-xl transition-all ${
            alert.type === "success"
              ? "bg-emerald-600 text-white"
              : "bg-red-600 text-white"
          }`}
        >
          {alert.type === "success" ? "✓" : "✕"} {alert.msg}
        </div>
      )}

      {/* Header */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900">Franchises</h1>
          <p className="mt-1 text-slate-500">Manage all franchise locations and their store managers.</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setActiveModal("manager")}
            className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 hover:shadow"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" /></svg>
            New Store Manager
          </button>
          <button
            onClick={() => setActiveModal("create")}
            className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 hover:shadow"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
            Add Franchise
          </button>
        </div>
      </div>

      {/* Stats row */}
      <div className="mb-8 grid grid-cols-3 gap-4">
        {[
          { label: "Total", value: stats.total, color: "bg-indigo-50 text-indigo-700 border-indigo-100" },
          { label: "Active", value: stats.active, color: "bg-emerald-50 text-emerald-700 border-emerald-100" },
          { label: "Inactive", value: stats.inactive, color: "bg-red-50 text-red-700 border-red-100" },
        ].map(({ label, value, color }) => (
          <div key={label} className={`rounded-2xl border p-5 ${color}`}>
            <p className="text-sm font-medium opacity-70">{label}</p>
            <p className="mt-1 text-3xl font-extrabold">{value}</p>
          </div>
        ))}
      </div>

      {/* Franchise Cards Grid */}
      {loading ? (
        <div className="flex h-48 items-center justify-center text-slate-400">Loading franchises…</div>
      ) : franchises.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-white py-24 text-center">
          <svg className="h-16 w-16 text-slate-200" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
          <h3 className="mt-4 text-xl font-bold text-slate-400">No Franchises Yet</h3>
          <p className="mt-2 text-slate-400">Click "Add Franchise" to create your first branch.</p>
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {franchises.map((f) => (
            <div
              key={f._id}
              className="group flex flex-col rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:shadow-md"
            >
              {/* Card top bar — colored by status */}
              <div className={`h-1.5 w-full rounded-t-2xl ${f.status === "Active" ? "bg-gradient-to-r from-emerald-400 to-teal-400" : "bg-gradient-to-r from-red-300 to-rose-400"}`} />

              <div className="flex flex-1 flex-col p-5">
                {/* Header */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="text-lg font-bold text-slate-800 leading-tight">{f.name}</h3>
                    {f.code && <p className="mt-0.5 text-xs font-mono text-slate-400">#{f.code}</p>}
                  </div>
                  <StatusBadge status={f.status} />
                </div>

                {/* Info rows */}
                <div className="mt-4 space-y-2 text-sm text-slate-600">
                  <div className="flex items-center gap-2">
                    <svg className="h-4 w-4 shrink-0 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                    <span>{f.address?.city || "—"}{f.address?.state ? `, ${f.address.state}` : ""}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <svg className="h-4 w-4 shrink-0 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                    <span className={f.manager?.username ? "font-medium text-slate-800" : "italic text-slate-400"}>
                      {f.manager?.username || "No manager assigned"}
                    </span>
                  </div>
                  {f.contactNo && (
                    <div className="flex items-center gap-2">
                      <svg className="h-4 w-4 shrink-0 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                      <span>{f.contactNo}</span>
                    </div>
                  )}
                </div>

                {/* Action buttons */}
                <div className="mt-5 grid grid-cols-2 gap-2 border-t border-slate-100 pt-4">
                  {/* Toggle Active/Inactive */}
                  <button
                    onClick={() => handleToggle(f._id)}
                    className={`flex items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-semibold transition ${
                      f.status === "Active"
                        ? "bg-amber-50 text-amber-700 hover:bg-amber-100"
                        : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                    }`}
                  >
                    {f.status === "Active" ? (
                      <>
                        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" /></svg>
                        Deactivate
                      </>
                    ) : (
                      <>
                        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        Activate
                      </>
                    )}
                  </button>

                  {/* Assign / Change Manager */}
                  <button
                    onClick={() => {
                      setAssignTarget(f);
                      setAssignManagerId(f.manager?._id || "");
                      setActiveModal("assign");
                    }}
                    className="flex items-center justify-center gap-1.5 rounded-lg bg-indigo-50 py-2 text-xs font-semibold text-indigo-700 transition hover:bg-indigo-100"
                  >
                    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                    {f.manager ? "Change Manager" : "Assign Manager"}
                  </button>

                  {/* Delete — full width */}
                  <button
                    onClick={() => handleDelete(f._id)}
                    className="col-span-2 flex items-center justify-center gap-1.5 rounded-lg bg-red-50 py-2 text-xs font-semibold text-red-600 transition hover:bg-red-100"
                  >
                    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    Delete Franchise
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── MODAL: Create Franchise ── */}
      {activeModal === "create" && (
        <Modal
          title="Create New Franchise"
          subtitle="Fill in the branch details. You can assign a manager after creating."
          onClose={() => setActiveModal(null)}
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Field label="Franchise Name">
                <input required className={inputClass} type="text" name="name" value={formData.name} onChange={handleChange} placeholder="e.g. LPU Block 38" />
              </Field>
              <Field label="Contact No">
                <input required className={inputClass} type="text" name="contactNo" value={formData.contactNo} onChange={handleChange} placeholder="10-digit number" />
              </Field>
            </div>
            <Field label="Full Address">
              <input required className={inputClass} type="text" name="address.address" value={formData.address.address} onChange={handleChange} placeholder="Street / Area" />
            </Field>
            <div className="grid grid-cols-3 gap-3">
              <Field label="City">
                <input required className={inputClass} type="text" name="address.city" value={formData.address.city} onChange={handleChange} />
              </Field>
              <Field label="State">
                <input required className={inputClass} type="text" name="address.state" value={formData.address.state} onChange={handleChange} />
              </Field>
              <Field label="Postal Code">
                <input required className={inputClass} type="text" name="address.postalCode" value={formData.address.postalCode} onChange={handleChange} />
              </Field>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Latitude">
                <input required className={inputClass} type="number" step="any" name="address.currentLocation.lat" value={formData.address.currentLocation.lat} onChange={handleChange} placeholder="e.g. 28.7041" />
              </Field>
              <Field label="Longitude">
                <input required className={inputClass} type="number" step="any" name="address.currentLocation.lng" value={formData.address.currentLocation.lng} onChange={handleChange} placeholder="e.g. 77.1025" />
              </Field>
            </div>
            <Field label="Assign Store Manager (optional)">
              <select className={inputClass} name="manager" value={formData.manager} onChange={handleChange}>
                <option value="">— Select manager —</option>
                {storeManagers.map((m) => (
                  <option key={m._id} value={m._id}>{m.username} · {m.email}</option>
                ))}
              </select>
            </Field>
            <div className="flex justify-end gap-3 pt-2">
              <button type="button" onClick={() => setActiveModal(null)} className="rounded-xl border px-5 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50">Cancel</button>
              <button type="submit" className="rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700">Create Franchise</button>
            </div>
          </form>
        </Modal>
      )}

      {/* ── MODAL: Create Store Manager ── */}
      {activeModal === "manager" && (
        <Modal
          title="Create Store Manager"
          subtitle="Create the manager account first, then assign them to a franchise."
          onClose={() => setActiveModal(null)}
        >
          <form onSubmit={handleCreateManager} className="space-y-4">
            <Field label="Full Name">
              <input required className={inputClass} value={managerForm.username} onChange={(e) => setManagerForm({ ...managerForm, username: e.target.value })} placeholder="Manager's full name" />
            </Field>
            <Field label="Email">
              <input required type="email" className={inputClass} value={managerForm.email} onChange={(e) => setManagerForm({ ...managerForm, email: e.target.value })} placeholder="manager@example.com" />
            </Field>
            <Field label="Phone Number">
              <input required inputMode="numeric" pattern="[0-9]{10}" className={inputClass} value={managerForm.contactNo} onChange={(e) => setManagerForm({ ...managerForm, contactNo: e.target.value })} placeholder="10-digit mobile" />
            </Field>
            <Field label="Temporary Password">
              <input required minLength={6} type="password" className={inputClass} value={managerForm.password} onChange={(e) => setManagerForm({ ...managerForm, password: e.target.value })} placeholder="Min. 6 characters" />
            </Field>
            <div className="flex justify-end gap-3 pt-2">
              <button type="button" onClick={() => setActiveModal(null)} className="rounded-xl border px-5 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50">Cancel</button>
              <button disabled={managerSaving} type="submit" className="rounded-xl bg-slate-800 px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-900 disabled:opacity-60">
                {managerSaving ? "Creating…" : "Create Manager"}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* ── MODAL: Assign / Change Manager ── */}
      {activeModal === "assign" && assignTarget && (
        <Modal
          title={assignTarget.manager ? "Change Store Manager" : "Assign Store Manager"}
          subtitle={`Franchise: ${assignTarget.name}`}
          onClose={() => { setActiveModal(null); setAssignTarget(null); }}
        >
          <form onSubmit={handleAssignManager} className="space-y-5">
            {assignTarget.manager && (
              <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                <strong>Current manager:</strong> {assignTarget.manager.username} ({assignTarget.manager.email})
              </div>
            )}
            <Field label="Select New Store Manager">
              <select
                required
                className={inputClass}
                value={assignManagerId}
                onChange={(e) => setAssignManagerId(e.target.value)}
              >
                <option value="">— Select a manager —</option>
                {storeManagers.map((m) => (
                  <option key={m._id} value={m._id}>
                    {m.username} · {m.email}
                  </option>
                ))}
              </select>
            </Field>
            {storeManagers.length === 0 && (
              <p className="text-sm text-slate-500">
                No Store Managers found. Create one first using the "New Store Manager" button.
              </p>
            )}
            <div className="flex justify-end gap-3">
              <button type="button" onClick={() => { setActiveModal(null); setAssignTarget(null); }} className="rounded-xl border px-5 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50">Cancel</button>
              <button disabled={assignSaving || !assignManagerId} type="submit" className="rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-60">
                {assignSaving ? "Saving…" : "Assign Manager"}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}

export default Franchises;
