import { useEffect, useState } from "react";
import { FaEdit, FaPlus, FaTrash, FaBoxOpen, FaLayerGroup } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import api from "../services/apiConfig";

// ─────────────────────────────────────────────
// Utility helpers
// ─────────────────────────────────────────────
const blankLocation = { section: "", rack: "", shelf: "", bin: "" };

const blankFlatVariant = () => ({
  _id: Date.now() + Math.random(),
  size: "",
  mrp: "",
  offerPrice: "",
  sku: "",
  barcode: "",
  countInStock: 0,
});

const blankColorVariant = () => ({
  _id: Date.now() + Math.random(),
  name: "",
  code: "#000000",
  sizes: [blankSizeVariant()],
});

function blankSizeVariant() {
  return {
    _id: Date.now() + Math.random(),
    size: "",
    mrp: "",
    offerPrice: "",
    sku: "",
    barcode: "",
    countInStock: 0,
  };
}

// ─────────────────────────────────────────────
// Small reusable UI pieces
// ─────────────────────────────────────────────
const inputClass =
  "w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none transition focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-100";
const disabledInputClass =
  "w-full rounded-xl border border-slate-200 bg-slate-100 px-3 py-2 text-sm text-slate-500 cursor-not-allowed";

function Field({ label, value, onChange, type = "text", required = true, disabled = false, placeholder = "" }) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</label>
      <input
        required={required && !disabled}
        disabled={disabled}
        type={type}
        step={type === "number" ? "0.01" : undefined}
        min={type === "number" ? "0" : undefined}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={disabled ? disabledInputClass : inputClass}
      />
    </div>
  );
}

// Modal shell
function Modal({ title, subtitle, onClose, children, wide = false }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className={`my-4 w-full ${wide ? "max-w-4xl" : "max-w-2xl"} rounded-2xl bg-white shadow-2xl overflow-hidden`}>
        <div className="bg-gradient-to-r from-slate-800 to-slate-900 px-6 py-5">
          <h2 className="text-xl font-bold text-white">{title}</h2>
          {subtitle && <p className="mt-1 text-sm text-slate-400">{subtitle}</p>}
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}

// Section divider
function Section({ title, children }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
      <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-slate-500">{title}</h3>
      {children}
    </div>
  );
}

// ─────────────────────────────────────────────
// Variant editors
// ─────────────────────────────────────────────
function FlatVariantRow({ v, idx, onChange, onRemove, canRemove }) {
  const set = (field, val) => onChange(idx, { ...v, [field]: val });
  return (
    <div className="mb-3 rounded-xl border border-slate-200 bg-white p-4">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-sm font-bold text-slate-700">Variant {idx + 1}</span>
        {canRemove && (
          <button type="button" onClick={() => onRemove(idx)}
            className="rounded-lg bg-red-50 px-2 py-1 text-xs font-semibold text-red-600 hover:bg-red-100">
            Remove
          </button>
        )}
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <Field label="Size / Weight / Pack" value={v.size} onChange={(val) => set("size", val)} placeholder="e.g. 500ml, 1kg, Pack of 6" />
        <Field label="MRP (₹)" type="number" value={v.mrp} onChange={(val) => set("mrp", val)} />
        <Field label="Offer Price (₹)" type="number" value={v.offerPrice} onChange={(val) => set("offerPrice", val)} />
        <Field label="Barcode" value={v.barcode} onChange={(val) => set("barcode", val)} required={false} placeholder="Unique barcode" />
        <Field label="SKU" value={v.sku} onChange={(val) => set("sku", val)} required={false} />
        <Field label="Stock" type="number" value={v.countInStock} onChange={(val) => set("countInStock", val)} />
      </div>
    </div>
  );
}

function ColorSizeEditor({ colors, onChange }) {
  const setColor = (ci, field, val) => {
    const next = colors.map((c, i) => i === ci ? { ...c, [field]: val } : c);
    onChange(next);
  };
  const setSize = (ci, si, field, val) => {
    const next = colors.map((c, i) => {
      if (i !== ci) return c;
      return { ...c, sizes: c.sizes.map((s, j) => j === si ? { ...s, [field]: val } : s) };
    });
    onChange(next);
  };
  const addSize = (ci) => {
    const next = colors.map((c, i) => i === ci ? { ...c, sizes: [...c.sizes, blankSizeVariant()] } : c);
    onChange(next);
  };
  const removeSize = (ci, si) => {
    const next = colors.map((c, i) => i === ci ? { ...c, sizes: c.sizes.filter((_, j) => j !== si) } : c);
    onChange(next);
  };
  const removeColor = (ci) => onChange(colors.filter((_, i) => i !== ci));
  const addColor = () => onChange([...colors, blankColorVariant()]);

  return (
    <div>
      {colors.map((c, ci) => (
        <div key={c._id} className="mb-4 rounded-xl border border-indigo-100 bg-white p-4">
          <div className="mb-3 flex items-center gap-3">
            <div className="flex-1 grid grid-cols-2 gap-3">
              <Field label="Color Name" value={c.name} onChange={(val) => setColor(ci, "name", val)} placeholder="e.g. Red, Ocean Blue" />
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">Color Code</label>
                <div className="flex items-center gap-2">
                  <input type="color" value={c.code || "#000000"} onChange={(e) => setColor(ci, "code", e.target.value)}
                    className="h-10 w-12 cursor-pointer rounded-lg border border-slate-200" />
                  <input value={c.code} onChange={(e) => setColor(ci, "code", e.target.value)}
                    className={`flex-1 ${inputClass}`} placeholder="#000000" />
                </div>
              </div>
            </div>
            {colors.length > 1 && (
              <button type="button" onClick={() => removeColor(ci)}
                className="self-end rounded-lg bg-red-50 px-3 py-2 text-sm font-semibold text-red-600 hover:bg-red-100">
                Remove Color
              </button>
            )}
          </div>
          <div className="ml-2 border-l-2 border-indigo-100 pl-4">
            <p className="mb-2 text-xs font-bold uppercase text-slate-400">Sizes for {c.name || `Color ${ci + 1}`}</p>
            {c.sizes.map((s, si) => (
              <div key={s._id} className="mb-2 grid grid-cols-2 gap-2 rounded-lg border border-slate-100 bg-slate-50 p-3 sm:grid-cols-3">
                <Field label="Size" value={s.size} onChange={(val) => setSize(ci, si, "size", val)} placeholder="S, M, L, XL…" />
                <Field label="MRP (₹)" type="number" value={s.mrp} onChange={(val) => setSize(ci, si, "mrp", val)} />
                <Field label="Offer Price (₹)" type="number" value={s.offerPrice} onChange={(val) => setSize(ci, si, "offerPrice", val)} />
                <Field label="Barcode" value={s.barcode} onChange={(val) => setSize(ci, si, "barcode", val)} required={false} />
                <Field label="SKU" value={s.sku} onChange={(val) => setSize(ci, si, "sku", val)} required={false} />
                <Field label="Stock" type="number" value={s.countInStock} onChange={(val) => setSize(ci, si, "countInStock", val)} />
                {c.sizes.length > 1 && (
                  <button type="button" onClick={() => removeSize(ci, si)}
                    className="col-span-full mt-1 rounded-lg bg-red-50 py-1 text-xs font-semibold text-red-600 hover:bg-red-100">
                    Remove Size
                  </button>
                )}
              </div>
            ))}
            <button type="button" onClick={() => addSize(ci)}
              className="mt-1 rounded-lg border border-dashed border-indigo-300 px-4 py-2 text-xs font-semibold text-indigo-600 hover:bg-indigo-50">
              + Add Size
            </button>
          </div>
        </div>
      ))}
      <button type="button" onClick={addColor}
        className="w-full rounded-xl border border-dashed border-indigo-300 py-3 text-sm font-semibold text-indigo-600 hover:bg-indigo-50">
        + Add Color
      </button>
    </div>
  );
}

// ─────────────────────────────────────────────
// Main Products page
// ─────────────────────────────────────────────
function Products() {
  const user = JSON.parse(localStorage.getItem("user") || "null");
  const isAdmin = user?.role === "Admin";
  const navigate = useNavigate();

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState(null);

  // modal type: null | "master" | "masterEdit" | "inventory" (for admin's own stock) | "edit" (inventory batch for SM)
  const [modal, setModal] = useState(null);

  // ── Master product form state ──
  const blankMaster = {
    name: "", barcode: "", sku: "", mrp: "", offerPrice: "",
    tax: "0", productType: "Single",
    flatVariants: [blankFlatVariant()],
    colorVariants: [blankColorVariant()],
  };
  const [masterForm, setMasterForm] = useState(blankMaster);
  const [editingProductId, setEditingProductId] = useState(null);

  // ── Inventory batch edit form (StoreManager) ──
  const blankBatch = { inventoryId: "", barcode: "", batchNo: "", quantity: 0, purchasePrice: 0, sellingPrice: "", expiryDate: "", location: blankLocation };
  const [batchForm, setBatchForm] = useState(blankBatch);

  const showAlert = (type, msg) => { setAlert({ type, msg }); setTimeout(() => setAlert(null), 3500); };

  // ── Load data ──
  const load = async () => {
    try {
      setLoading(true);
      const endpoint = isAdmin ? "/master-products" : "/franchise-inventory";
      const { data } = await api.get(endpoint);
      setItems(isAdmin ? (data.products || []) : (data.batches || []));
    } catch (err) {
      showAlert("error", err.response?.data?.message || "Unable to load products.");
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  // ── Open modals ──
  const openCreateMaster = () => { setMasterForm(blankMaster); setEditingProductId(null); setModal("master"); };
  const openEditMaster = (p) => {
    setMasterForm({
      name: p.name || "", barcode: p.barcode || "", sku: p.sku || "",
      mrp: p.mrp ?? "", offerPrice: p.offerPrice ?? "",
      tax: p.tax ?? "0", productType: p.productType || "Single",
      flatVariants: p.flatVariants?.length ? p.flatVariants.map(v => ({ ...v })) : [blankFlatVariant()],
      colorVariants: p.colorVariants?.length ? p.colorVariants.map(c => ({ ...c, sizes: c.sizes?.map(s => ({ ...s })) || [blankSizeVariant()] })) : [blankColorVariant()],
    });
    setEditingProductId(p._id);
    setModal("masterEdit");
  };
  const openEditBatch = (item) => {
    setBatchForm({ inventoryId: item._id, barcode: item.barcode || "", batchNo: item.batchNumber || "", quantity: item.quantity, purchasePrice: item.purchasePrice || 0, sellingPrice: item.sellingPrice, expiryDate: item.expiryDate ? item.expiryDate.slice(0, 10) : "", location: item.location || blankLocation });
    setModal("edit");
  };

  // ── Submit master product (create or edit) ──
  const submitMaster = async (e) => {
    e.preventDefault();
    const hasVariants = masterForm.productType !== "Single";
    const body = {
      name: masterForm.name,
      tax: Number(masterForm.tax),
      productType: masterForm.productType,
      hasVariants,
    };
    if (!hasVariants) {
      body.barcode = masterForm.barcode;
      body.sku = masterForm.sku || undefined;
      body.mrp = Number(masterForm.mrp);
      body.offerPrice = Number(masterForm.offerPrice || masterForm.mrp);
    } else if (masterForm.productType === "WeightPack") {
      body.flatVariants = masterForm.flatVariants.map(v => ({
        ...v,
        mrp: Number(v.mrp),
        offerPrice: Number(v.offerPrice || v.mrp),
        countInStock: Number(v.countInStock || 0),
        barcode: v.barcode || undefined,
        sku: v.sku || undefined,
      }));
    } else if (masterForm.productType === "ColorSize") {
      body.colorVariants = masterForm.colorVariants.map(c => ({
        ...c,
        sizes: c.sizes.map(s => ({
          ...s,
          mrp: Number(s.mrp),
          offerPrice: Number(s.offerPrice || s.mrp),
          countInStock: Number(s.countInStock || 0),
          barcode: s.barcode || undefined,
          sku: s.sku || undefined,
        })),
      }));
    }
    try {
      if (modal === "master") {
        await api.post("/master-products", body);
        showAlert("success", "Master product created.");
      } else {
        await api.patch(`/master-products/${editingProductId}`, body);
        showAlert("success", "Product updated.");
      }
      setModal(null);
      await load();
    } catch (err) { showAlert("error", err.response?.data?.message || "Failed to save product."); }
  };

  // ── Submit inventory batch edit (StoreManager) ──
  const submitBatch = async (e) => {
    e.preventDefault();
    try {
      await api.patch(`/franchise-inventory/${batchForm.inventoryId}`, {
        quantity: Number(batchForm.quantity),
        barcode: batchForm.barcode,
        purchasePrice: Number(batchForm.purchasePrice),
        sellingPrice: Number(batchForm.sellingPrice),
        location: batchForm.location,
        batchNumber: batchForm.batchNo,
        expiryDate: batchForm.expiryDate || undefined,
      });
      showAlert("success", "Inventory batch updated.");
      setModal(null);
      await load();
    } catch (err) { showAlert("error", err.response?.data?.message || "Failed to update batch."); }
  };

  const deleteMaster = async (p) => {
    if (!window.confirm(`Delete "${p.name}"? This cannot be undone.`)) return;
    try { await api.delete(`/master-products/${p._id}`); showAlert("success", "Product deleted."); await load(); }
    catch (err) { showAlert("error", err.response?.data?.message || "Unable to delete product."); }
  };
  const deleteBatch = async (id) => {
    if (!window.confirm("Delete this inventory batch?")) return;
    try { await api.delete(`/franchise-inventory/${id}`); setModal(null); await load(); }
    catch (err) { showAlert("error", err.response?.data?.message || "Unable to delete batch."); }
  };

  const updateLocation = (field, value) => setBatchForm(f => ({ ...f, location: { ...f.location, [field]: value } }));

  // ── Render variant badge for table ──
  const renderVariantBadge = (p) => {
    if (!p.hasVariants) return null;
    if (p.productType === "WeightPack")
      return <span className="ml-1 rounded-full bg-orange-100 px-2 py-0.5 text-xs font-semibold text-orange-700">{p.flatVariants?.length || 0} size{p.flatVariants?.length !== 1 ? "s" : ""}</span>;
    if (p.productType === "ColorSize")
      return <span className="ml-1 rounded-full bg-purple-100 px-2 py-0.5 text-xs font-semibold text-purple-700">{p.colorVariants?.length || 0} color{p.colorVariants?.length !== 1 ? "s" : ""}</span>;
    return null;
  };

  const isEditing = modal === "masterEdit";
  const productType = masterForm.productType;

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-8">

      {/* Toast alert */}
      {alert && (
        <div className={`fixed top-6 right-6 z-[100] flex items-center gap-3 rounded-xl px-5 py-3.5 text-sm font-semibold shadow-xl ${
          alert.type === "success" ? "bg-emerald-600 text-white" : "bg-red-600 text-white"
        }`}>
          {alert.type === "success" ? "✓" : "✕"} {alert.msg}
        </div>
      )}

      {/* Header */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900">
            {isAdmin ? "Master Product Catalogue" : "My Franchise Inventory"}
          </h1>
          <p className="mt-1 text-slate-500">
            {isAdmin
              ? "Global products used by all franchises. Adding here doesn't add stock to any store."
              : "Products received into your franchise. Showing all inventory batches."}
          </p>
        </div>
        {isAdmin ? (
          <button
            onClick={openCreateMaster}
            className="flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-indigo-700"
          >
            <FaPlus className="shrink-0" /> Add Master Product
          </button>
        ) : (
          <button
            onClick={() => navigate("/catalog")}
            className="flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-indigo-700"
          >
            <FaPlus className="shrink-0" /> Receive from Catalog
          </button>
        )}
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-slate-100 bg-slate-50 text-xs font-bold uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-6 py-4">Product</th>
              <th className="px-6 py-4">Barcode / Type</th>
              <th className="px-6 py-4">MRP</th>
              {isAdmin ? (
                <th className="px-6 py-4">Actions</th>
              ) : (
                <>
                  <th className="px-6 py-4">Batch</th>
                  <th className="px-6 py-4">Selling Price</th>
                  <th className="px-6 py-4">Stock</th>
                  <th className="px-6 py-4">Location</th>
                  <th className="px-6 py-4">Actions</th>
                </>
              )}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="8" className="py-12 text-center text-slate-400">Loading…</td></tr>
            ) : items.length === 0 ? (
              <tr>
                <td colSpan="8" className="py-16 text-center text-slate-400">
                  <FaBoxOpen className="mx-auto mb-3 text-4xl text-slate-200" />
                  <p className="font-semibold">{isAdmin ? "No master products yet." : "No products received yet."}</p>
                </td>
              </tr>
            ) : items.map((item) => {
              const product = isAdmin ? item : item.productId;
              const loc = item.location || {};
              const locStr = [loc.section && `S:${loc.section}`, loc.rack && `R:${loc.rack}`, loc.shelf && `Sh:${loc.shelf}`, loc.bin && `B:${loc.bin}`].filter(Boolean).join(" › ") || "—";
              return (
                <tr key={item._id} className="border-t border-slate-100 hover:bg-slate-50 transition">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-800">{product?.name}</span>
                      {isAdmin && renderVariantBadge(item)}
                    </div>
                    {isAdmin && item.productType !== "Single" && (
                      <p className="mt-0.5 text-xs text-slate-400">{item.productType}</p>
                    )}
                  </td>
                  <td className="px-6 py-4 font-mono text-xs text-slate-600">
                    {isAdmin ? (item.barcode || <span className="text-slate-400 italic">varies by variant</span>) : item.barcode}
                  </td>
                  <td className="px-6 py-4 font-semibold text-slate-700">
                    {isAdmin
                      ? (item.hasVariants ? <span className="italic text-slate-400">per variant</span> : `₹${item.mrp}`)
                      : `₹${product?.mrp}`}
                  </td>
                  {isAdmin ? (
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button onClick={() => openEditMaster(item)}
                          className="flex items-center gap-1 rounded-lg bg-indigo-50 px-3 py-1.5 text-xs font-semibold text-indigo-700 transition hover:bg-indigo-100">
                          <FaEdit className="text-xs" /> Edit
                        </button>
                        <button onClick={() => deleteMaster(item)}
                          className="flex items-center gap-1 rounded-lg bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-600 transition hover:bg-red-100">
                          <FaTrash className="text-xs" /> Delete
                        </button>
                      </div>
                    </td>
                  ) : (
                    <>
                      <td className="px-6 py-4">
                        <p className="font-medium">{item.batchNumber || "N/A"}</p>
                        {item.expiryDate && <p className="text-xs text-slate-400">Exp: {item.expiryDate.slice(0, 10)}</p>}
                      </td>
                      <td className="px-6 py-4 font-semibold text-emerald-700">₹{item.sellingPrice}</td>
                      <td className="px-6 py-4">
                        <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${
                          item.quantity <= 5 ? "bg-red-100 text-red-700" : item.quantity <= 20 ? "bg-amber-100 text-amber-700" : "bg-emerald-100 text-emerald-700"
                        }`}>{item.quantity}</span>
                      </td>
                      <td className="px-6 py-4 text-xs text-indigo-700">{locStr}</td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <button onClick={() => openEditBatch(item)}
                            className="flex items-center gap-1 rounded-lg bg-indigo-50 px-3 py-1.5 text-xs font-semibold text-indigo-700 hover:bg-indigo-100">
                            <FaEdit className="text-xs" /> Edit
                          </button>
                          <button onClick={() => deleteBatch(item._id)}
                            className="flex items-center gap-1 rounded-lg bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-100">
                            <FaTrash className="text-xs" /> Del
                          </button>
                        </div>
                      </td>
                    </>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* ──────────── MASTER PRODUCT MODAL (Create / Edit) ──────────── */}
      {(modal === "master" || modal === "masterEdit") && (
        <Modal
          title={isEditing ? "Edit Master Product" : "Add Master Product"}
          subtitle={isEditing ? "Update product details and variants" : "Creates a global product — does not add stock to any store"}
          onClose={() => setModal(null)}
          wide={productType !== "Single"}
        >
          <form onSubmit={submitMaster} className="space-y-5">

            {/* Basic info */}
            <Section title="Basic Information">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <Field label="Product Name" value={masterForm.name} onChange={(v) => setMasterForm(f => ({ ...f, name: v }))} placeholder="e.g. Mango Juice" />
                </div>
                <Field label="GST %" type="number" value={masterForm.tax} onChange={(v) => setMasterForm(f => ({ ...f, tax: v }))} required={false} />
                <div>
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">Product Type</label>
                  <select
                    value={masterForm.productType}
                    onChange={(e) => setMasterForm(f => ({ ...f, productType: e.target.value }))}
                    className={inputClass}
                  >
                    <option value="Single">Single (one barcode, one price)</option>
                    <option value="WeightPack">Weight / Pack variants (e.g. 250g, 500g, 1kg)</option>
                    <option value="ColorSize">Color + Size variants (e.g. clothing)</option>
                  </select>
                </div>
              </div>
            </Section>

            {/* Single product fields */}
            {productType === "Single" && (
              <Section title="Pricing & Identification">
                <div className="grid grid-cols-2 gap-4">
                  <Field label="Barcode" value={masterForm.barcode} onChange={(v) => setMasterForm(f => ({ ...f, barcode: v }))} placeholder="EAN / UPC barcode" />
                  <Field label="SKU (optional)" value={masterForm.sku} onChange={(v) => setMasterForm(f => ({ ...f, sku: v }))} required={false} />
                  <Field label="MRP (₹)" type="number" value={masterForm.mrp} onChange={(v) => setMasterForm(f => ({ ...f, mrp: v }))} />
                  <Field label="Offer Price (₹)" type="number" value={masterForm.offerPrice} onChange={(v) => setMasterForm(f => ({ ...f, offerPrice: v }))} required={false} placeholder="Leave blank to use MRP" />
                </div>
              </Section>
            )}

            {/* Weight/Pack variants */}
            {productType === "WeightPack" && (
              <Section title="Weight / Pack Variants">
                <p className="mb-3 text-xs text-slate-500">Add one row per size/weight option. Each gets its own barcode and pricing.</p>
                {masterForm.flatVariants.map((v, idx) => (
                  <FlatVariantRow
                    key={v._id}
                    v={v}
                    idx={idx}
                    canRemove={masterForm.flatVariants.length > 1}
                    onChange={(i, updated) => setMasterForm(f => ({ ...f, flatVariants: f.flatVariants.map((x, j) => j === i ? updated : x) }))}
                    onRemove={(i) => setMasterForm(f => ({ ...f, flatVariants: f.flatVariants.filter((_, j) => j !== i) }))}
                  />
                ))}
                <button type="button"
                  onClick={() => setMasterForm(f => ({ ...f, flatVariants: [...f.flatVariants, blankFlatVariant()] }))}
                  className="mt-1 w-full rounded-xl border border-dashed border-indigo-300 py-3 text-sm font-semibold text-indigo-600 hover:bg-indigo-50">
                  + Add Another Variant
                </button>
              </Section>
            )}

            {/* Color + Size variants */}
            {productType === "ColorSize" && (
              <Section title="Color + Size Variants">
                <p className="mb-3 text-xs text-slate-500">Each color can have multiple sizes. Each size gets its own barcode, price, and stock.</p>
                <ColorSizeEditor
                  colors={masterForm.colorVariants}
                  onChange={(next) => setMasterForm(f => ({ ...f, colorVariants: next }))}
                />
              </Section>
            )}

            <div className="flex justify-end gap-3 pt-2">
              <button type="button" onClick={() => setModal(null)} className="rounded-xl border px-5 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50">Cancel</button>
              <button type="submit" className="rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-indigo-700">
                {isEditing ? "Save Changes" : "Create Product"}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* ──────────── INVENTORY BATCH EDIT MODAL (StoreManager) ──────────── */}
      {modal === "edit" && (
        <Modal title="Edit Inventory Batch" subtitle="Update selling price, stock quantity, and location" onClose={() => setModal(null)}>
          <form onSubmit={submitBatch} className="space-y-5">
            <Section title="Batch Details">
              <div className="grid grid-cols-2 gap-4">
                <Field label="Franchise Barcode" value={batchForm.barcode} onChange={(v) => setBatchForm(f => ({ ...f, barcode: v }))} />
                <Field label="Batch No." value={batchForm.batchNo} onChange={(v) => setBatchForm(f => ({ ...f, batchNo: v }))} />
                <Field label="Current Stock" type="number" value={batchForm.quantity} onChange={() => {}} disabled={true} />
                <Field label="Purchase Price (₹)" type="number" value={batchForm.purchasePrice} onChange={() => {}} disabled={true} />
                <Field label="Selling Price (₹)" type="number" value={batchForm.sellingPrice} onChange={(v) => setBatchForm(f => ({ ...f, sellingPrice: v }))} />
                <Field label="Expiry Date" type="date" value={batchForm.expiryDate} onChange={(v) => setBatchForm(f => ({ ...f, expiryDate: v }))} required={false} />
              </div>
            </Section>
            <Section title="Location in Store">
              <div className="grid grid-cols-2 gap-4">
                {["section", "rack", "shelf", "bin"].map((key) => (
                  <Field key={key} label={key.charAt(0).toUpperCase() + key.slice(1)} value={batchForm.location?.[key] || ""} onChange={(v) => updateLocation(key, v)} required={false} />
                ))}
              </div>
            </Section>
            <div className="flex justify-end gap-3 pt-2">
              <button type="button" onClick={() => setModal(null)} className="rounded-xl border px-5 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50">Cancel</button>
              <button type="submit" className="rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-indigo-700">Save Changes</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}

export default Products;
