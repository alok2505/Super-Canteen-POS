import { useEffect, useState } from "react";
import { FaEdit, FaPlus, FaTrash } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import api from "../services/apiConfig";

const blankLocation = { section: "", rack: "", shelf: "", bin: "" };

function Products() {
  const user = JSON.parse(localStorage.getItem("user") || "null");
  const isAdmin = user?.role === "Admin";
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null); // master | masterEdit | edit
  const [form, setForm] = useState({ name: "", barcode: "", sku: "", mrp: "", tax: "0", productId: "", quantity: "0", purchasePrice: "0", sellingPrice: "", location: blankLocation, batchNo: "", expiryDate: "" });
  const navigate = useNavigate();

  const load = async () => {
    try {
      setLoading(true);
      const endpoint = isAdmin ? "/master-products" : "/franchise-inventory";
      const { data } = await api.get(endpoint);
      setItems(isAdmin ? data.products : data.batches);
    } catch (error) {
      alert(error.response?.data?.message || "Unable to load products.");
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const submit = async (event) => {
    event.preventDefault();
    try {
      if (modal === "master") {
        await api.post("/master-products", { name: form.name, barcode: form.barcode, sku: form.sku, mrp: Number(form.mrp), tax: Number(form.tax) });
      } else if (modal === "masterEdit") {
        await api.patch(`/master-products/${form.productId}`, { name: form.name, barcode: form.barcode, sku: form.sku, mrp: Number(form.mrp), tax: Number(form.tax) });
      } else if (modal === "edit") {
        await api.patch(`/franchise-inventory/${form.inventoryId}`, { quantity: Number(form.quantity), barcode: form.barcode, purchasePrice: Number(form.purchasePrice), sellingPrice: Number(form.sellingPrice), location: form.location, batchNumber: form.batchNo, expiryDate: form.expiryDate || undefined });
      }
      setModal(null); await load();
    } catch (error) { alert(error.response?.data?.message || "Unable to save changes."); }
  };

  const updateLocation = (field, value) => setForm({ ...form, location: { ...form.location, [field]: value } });
  const openEdit = (item) => { setForm({ inventoryId: item._id, barcode: item.barcode || "", quantity: item.quantity, purchasePrice: item.purchasePrice || 0, sellingPrice: item.sellingPrice, location: item.location || blankLocation, batchNo: item.batchNumber || "", expiryDate: item.expiryDate ? item.expiryDate.slice(0, 10) : "" }); setModal("edit"); };
  const openMasterEdit = (product) => { setForm({ productId: product._id, name: product.name, barcode: product.barcode, sku: product.sku || "", mrp: product.mrp, tax: product.tax || "0" }); setModal("masterEdit"); };
  const removeMaster = async (product) => { if (!window.confirm(`Delete ${product.name}?`)) return; try { await api.delete(`/master-products/${product._id}`); load(); } catch (error) { alert(error.response?.data?.message || "Unable to delete product."); } };
  const removeInventory = async (inventoryId) => {
    const message = "Delete this inventory batch?";
    if (!window.confirm(message)) return;
    try {
      await api.delete(`/franchise-inventory/${inventoryId}`);
      setModal(null);
      await load();
    } catch (error) { alert(error.response?.data?.message || "Unable to delete inventory."); }
  };

  return <div className="min-h-screen bg-slate-50 p-8">
    <div className="mb-6 flex items-start justify-between gap-4"><div><h1 className="text-3xl font-bold text-slate-800">{isAdmin ? "Master Product Catalog" : "My Franchise Inventory"}</h1><p className="mt-1 text-slate-500">{isAdmin ? "Common products used by every franchise. Creating a product does not add it to store inventory." : "Only products received into your franchise are shown here."}</p></div>
      {isAdmin ? <button onClick={() => { setForm({ name: "", barcode: "", sku: "", mrp: "", tax: "0" }); setModal("master"); }} className="rounded-xl bg-blue-600 px-4 py-2 font-semibold text-white"><FaPlus className="mr-2 inline" />Add Master Product</button> : <button onClick={() => navigate("/catalog")} className="rounded-xl bg-blue-600 px-4 py-2 font-semibold text-white"><FaPlus className="mr-2 inline" />Receive from Master Catalog</button>}</div>
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"><table className="w-full text-left"><thead className="bg-slate-50 text-sm text-slate-500"><tr><th className="px-6 py-4">PRODUCT</th><th className="px-6 py-4">BARCODE</th><th className="px-6 py-4">MRP</th>{isAdmin ? <th className="px-6 py-4">ACTION</th> : <><th className="px-6 py-4">BATCH</th><th className="px-6 py-4">SELLING PRICE</th><th className="px-6 py-4">STOCK</th><th className="px-6 py-4">LOCATION</th><th className="px-6 py-4">ACTION</th></>}</tr></thead><tbody>
      {loading ? <tr><td colSpan="8" className="p-8 text-center text-slate-500">Loading…</td></tr> : items.length === 0 ? <tr><td colSpan="8" className="p-8 text-center text-slate-500">{isAdmin ? "No master products yet." : "No products received into this franchise yet."}</td></tr> : items.map((item) => { const product = isAdmin ? item : item.productId; const location = item.location || {}; return <tr key={item._id} onClick={() => !isAdmin && openEdit(item)} className={`border-t border-slate-100 ${!isAdmin ? "cursor-pointer hover:bg-slate-50" : ""}`}><td className="px-6 py-4 font-semibold">{product.name}</td><td className="px-6 py-4 text-sm text-slate-600">{isAdmin ? product.barcode : item.barcode}</td><td className="px-6 py-4">₹{product.mrp}</td>{isAdmin ? <td className="px-6 py-4"><button onClick={() => openMasterEdit(product)} className="mr-2 rounded-lg bg-blue-50 p-2 text-blue-700"><FaEdit /></button><button onClick={() => removeMaster(product)} className="rounded-lg bg-red-50 p-2 text-red-700"><FaTrash /></button></td> : <><td className="px-6 py-4">{item.batchNumber || "N/A"}<br/><span className="text-xs text-slate-500">{item.expiryDate ? `Exp: ${String(item.expiryDate).slice(0, 10)}` : ""}</span></td><td className="px-6 py-4">₹{item.sellingPrice}</td><td className="px-6 py-4 font-semibold">{item.quantity}</td><td className="px-6 py-4 text-sm text-blue-700">{([location.section && `Section ${location.section}`, location.rack && `Rack ${location.rack}`, location.shelf && `Shelf ${location.shelf}`, location.bin && `Bin ${location.bin}`].filter(Boolean).join(" → ") || "Unassigned")}</td><td className="px-6 py-4"><button onClick={(event) => { event.stopPropagation(); openEdit(item); }} className="mr-2 rounded-lg bg-blue-50 p-2 text-blue-700"><FaEdit /></button><button onClick={(event) => { event.stopPropagation(); removeInventory(item._id); }} className="rounded-lg bg-red-50 p-2 text-red-700"><FaTrash /></button></td></>}</tr>; })}</tbody></table></div>
    {modal && <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4"><form onSubmit={submit} className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl"><h2 className="text-xl font-bold mb-4">{modal === "master" ? "Add Master Product" : modal === "masterEdit" ? "Edit Master Product" : "Update Franchise Inventory Batch"}</h2>
      {["master", "masterEdit"].includes(modal) ? <div className="grid grid-cols-2 gap-4"><Field label="Product name" value={form.name} set={(value) => setForm({ ...form, name: value })} wide /><Field label="Barcode" value={form.barcode} set={(value) => setForm({ ...form, barcode: value })} /><Field label="SKU (optional)" value={form.sku} set={(value) => setForm({ ...form, sku: value })} required={false} /><Field label="MRP" type="number" value={form.mrp} set={(value) => setForm({ ...form, mrp: value })} /><Field label="GST %" type="number" value={form.tax} set={(value) => setForm({ ...form, tax: value })} /></div> : <div className="grid grid-cols-2 gap-4"><Field label="Franchise barcode" value={form.barcode || ""} set={(value) => setForm({ ...form, barcode: value })} /><Field label="Batch no." value={form.batchNo} set={(value) => setForm({ ...form, batchNo: value })} /><Field label="Stock quantity (read-only)" type="number" value={form.quantity} set={(value) => {}} disabled={true} /><Field label="Purchase price (read-only)" type="number" value={form.purchasePrice} set={(value) => {}} disabled={true} /><Field label="Selling price" type="number" value={form.sellingPrice} set={(value) => setForm({ ...form, sellingPrice: value })} /><Field label="Expiry date (optional)" type="date" value={form.expiryDate} set={(value) => setForm({ ...form, expiryDate: value })} required={false} />{Object.keys(blankLocation).map((key) => <Field key={key} label={key[0].toUpperCase() + key.slice(1)} value={form.location?.[key] || ""} set={(value) => updateLocation(key, value)} required={false} />)}</div>}
      <div className="mt-6 flex justify-end gap-3"><button type="button" onClick={() => setModal(null)} className="rounded-xl px-4 py-2 text-slate-600">Cancel</button><button className="rounded-xl bg-blue-600 px-4 py-2 font-semibold text-white">Save</button></div></form></div>}
  </div>;
}

function Field({ label, value, set, type = "text", required = true, wide = false, disabled = false }) { return <label className={wide ? "col-span-2" : ""}><span className="mb-1 block text-sm font-medium">{label}</span><input required={!disabled && required} disabled={disabled} min={type === "number" ? "0" : undefined} type={type} value={value} onChange={(event) => set(event.target.value)} className={`w-full rounded-xl border border-slate-200 p-2 ${disabled ? "bg-slate-100 text-slate-500" : ""}`} /></label>; }
export default Products;
