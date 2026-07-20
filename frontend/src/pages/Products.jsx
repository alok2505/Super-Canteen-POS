import { useEffect, useState } from "react";
import { FaEdit, FaPlus, FaTrash } from "react-icons/fa";
import api from "../services/apiConfig";

const blankLocation = { section: "", rack: "", shelf: "", bin: "" };

function Products() {
  const user = JSON.parse(localStorage.getItem("user") || "null");
  const isAdmin = user?.role === "Admin";
  const [items, setItems] = useState([]);
  const [masterProducts, setMasterProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null); // master | receive | edit
  const [form, setForm] = useState({ name: "", barcode: "", sku: "", mrp: "", tax: "0", productId: "", quantity: "0", sellingPrice: "", location: blankLocation, batchNo: "", expiryDate: "" });

  const load = async () => {
    try {
      setLoading(true);
      const endpoint = isAdmin ? "/master-products" : "/franchise-inventory";
      const { data } = await api.get(endpoint);
      setItems(isAdmin ? data.products : data.inventory);
    } catch (error) {
      alert(error.response?.data?.message || "Unable to load products.");
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const openReceive = async (preselectedId) => {
    try {
      const { data } = await api.get("/master-products");
      setMasterProducts(data.products || []);
      const selected = (data.products || []).find((product) => product._id === preselectedId);
      setForm({ name: "", barcode: selected?.barcode || "", sku: "", mrp: "", tax: "0", productId: selected?._id || "", quantity: "0", sellingPrice: selected?.mrp || "", location: blankLocation, batchNo: "", expiryDate: "", variants: selected ? variantRows(selected) : [] });
      setModal("receive");
    } catch (error) { alert(error.response?.data?.message || "Unable to load the master catalog."); }
  };

  useEffect(() => {
    if (isAdmin) return;
    const productId = sessionStorage.getItem("receiveMasterProductId");
    if (productId) {
      sessionStorage.removeItem("receiveMasterProductId");
      openReceive(productId);
    }
  }, []);

  const submit = async (event) => {
    event.preventDefault();
    try {
      if (modal === "master") {
        await api.post("/master-products", { name: form.name, barcode: form.barcode, sku: form.sku, mrp: Number(form.mrp), tax: Number(form.tax) });
      } else if (modal === "masterEdit") {
        await api.patch(`/master-products/${form.productId}`, { name: form.name, barcode: form.barcode, sku: form.sku, mrp: Number(form.mrp), tax: Number(form.tax) });
      } else if (modal === "receive") {
        await api.post("/franchise-inventory", { productId: form.productId, barcode: form.barcode, quantity: Number(form.quantity), sellingPrice: Number(form.sellingPrice), location: form.location, batchNo: form.batchNo, expiryDate: form.expiryDate || undefined, variants: form.variants || [] });
      } else {
        await api.patch(`/franchise-inventory/${form.inventoryId}`, { stock: Number(form.quantity), barcode: form.barcode, sellingPrice: Number(form.sellingPrice), location: form.location, batchNo: form.batchNo, expiryDate: form.expiryDate || undefined, variants: form.variants || [] });
      }
      setModal(null); await load();
    } catch (error) { alert(error.response?.data?.message || "Unable to save changes."); }
  };

  const updateLocation = (field, value) => setForm({ ...form, location: { ...form.location, [field]: value } });
  const openEdit = (item) => { setForm({ inventoryId: item._id, barcode: item.barcode || "", quantity: item.stock, sellingPrice: item.sellingPrice, location: item.location || blankLocation, batchNo: item.batchNo || "", expiryDate: item.expiryDate ? item.expiryDate.slice(0, 10) : "", variants: item.variants || [] }); setModal("edit"); };
  const openMasterEdit = (product) => { setForm({ productId: product._id, name: product.name, barcode: product.barcode, sku: product.sku || "", mrp: product.mrp, tax: product.tax || "0" }); setModal("masterEdit"); };
  const removeMaster = async (product) => { if (!window.confirm(`Delete ${product.name}?`)) return; try { await api.delete(`/master-products/${product._id}`); load(); } catch (error) { alert(error.response?.data?.message || "Unable to delete product."); } };
  const removeInventory = async (inventoryId, variant) => {
    const message = variant ? `Delete variant "${variant.label}" from this franchise inventory?` : "Delete this product and all of its franchise stock, locations, and batches?";
    if (!window.confirm(message)) return;
    try {
      await api.delete(`/franchise-inventory/${inventoryId}`, { params: variant ? { variantId: variant._id } : {} });
      setModal(null);
      await load();
    } catch (error) { alert(error.response?.data?.message || "Unable to delete inventory."); }
  };
  const variantRows = (product) => product.productType === "WeightPack" ? (product.flatVariants || []).map((variant) => ({ masterVariantId: variant._id, label: variant.size, size: variant.size, barcode: variant.barcode || "", stock: 0, sellingPrice: variant.offerPrice || variant.mrp || 0, location: blankLocation, batchNo: "", expiryDate: "" })) : product.productType === "ColorSize" ? (product.colorVariants || []).flatMap((color) => (color.sizes || []).map((size) => ({ masterVariantId: size._id, label: `${color.name} ${size.size}`, color: color.name, size: size.size, barcode: size.barcode || "", stock: 0, sellingPrice: size.offerPrice || size.mrp || 0, location: blankLocation, batchNo: "", expiryDate: "" }))) : [];
  const updateVariant = (index, field, value) => setForm({ ...form, variants: form.variants.map((variant, current) => current === index ? { ...variant, [field]: value } : variant) });
  return <div className="min-h-screen bg-slate-50 p-8">
    <div className="mb-6 flex items-start justify-between gap-4"><div><h1 className="text-3xl font-bold text-slate-800">{isAdmin ? "Master Product Catalog" : "My Franchise Inventory"}</h1><p className="mt-1 text-slate-500">{isAdmin ? "Common products used by every franchise. Creating a product does not add it to store inventory." : "Only products received into your franchise are shown here."}</p></div>
      {isAdmin ? <button onClick={() => { setForm({ name: "", barcode: "", sku: "", mrp: "", tax: "0" }); setModal("master"); }} className="rounded-xl bg-blue-600 px-4 py-2 font-semibold text-white"><FaPlus className="mr-2 inline" />Add Master Product</button> : <button onClick={openReceive} className="rounded-xl bg-blue-600 px-4 py-2 font-semibold text-white"><FaPlus className="mr-2 inline" />Receive from Master Catalog</button>}</div>
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"><table className="w-full text-left"><thead className="bg-slate-50 text-sm text-slate-500"><tr><th className="px-6 py-4">PRODUCT</th><th className="px-6 py-4">BARCODE</th><th className="px-6 py-4">MRP</th>{isAdmin ? <th className="px-6 py-4">ACTION</th> : <><th className="px-6 py-4">SELLING PRICE</th><th className="px-6 py-4">STOCK</th><th className="px-6 py-4">LOCATION</th><th className="px-6 py-4">ACTION</th></>}</tr></thead><tbody>
      {loading ? <tr><td colSpan="7" className="p-8 text-center text-slate-500">Loading…</td></tr> : items.length === 0 ? <tr><td colSpan="7" className="p-8 text-center text-slate-500">{isAdmin ? "No master products yet." : "No products received into this franchise yet."}</td></tr> : items.map((item) => { const product = isAdmin ? item : item.productId; const location = item.location || {}; const hasVariants = item.variants?.length > 0; const variantStock = (item.variants || []).reduce((total, variant) => total + Number(variant.stock || 0), 0); return <tr key={item._id} onClick={() => !isAdmin && openEdit(item)} className={`border-t border-slate-100 ${!isAdmin ? "cursor-pointer hover:bg-slate-50" : ""}`}><td className="px-6 py-4 font-semibold">{product.name}{hasVariants && <span className="ml-2 rounded-full bg-indigo-50 px-2 py-1 text-xs text-indigo-700">{item.variants.length} variants</span>}</td><td className="px-6 py-4 text-sm text-slate-600">{isAdmin ? product.barcode : hasVariants ? "Variant-specific barcodes" : item.barcode}</td><td className="px-6 py-4">₹{product.mrp}</td>{isAdmin ? <td className="px-6 py-4"><button onClick={() => openMasterEdit(product)} className="mr-2 rounded-lg bg-blue-50 p-2 text-blue-700"><FaEdit /></button><button onClick={() => removeMaster(product)} className="rounded-lg bg-red-50 p-2 text-red-700"><FaTrash /></button></td> : <><td className="px-6 py-4">{hasVariants ? "Per variant" : `₹${item.sellingPrice}`}</td><td className="px-6 py-4 font-semibold">{hasVariants ? variantStock : item.stock}</td><td className="px-6 py-4 text-sm text-blue-700">{hasVariants ? "Per variant — click for all details" : ([location.section && `Section ${location.section}`, location.rack && `Rack ${location.rack}`, location.shelf && `Shelf ${location.shelf}`, location.bin && `Bin ${location.bin}`].filter(Boolean).join(" → ") || "Unassigned")}</td><td className="px-6 py-4"><button onClick={(event) => { event.stopPropagation(); openEdit(item); }} className="mr-2 rounded-lg bg-blue-50 p-2 text-blue-700"><FaEdit /></button><button onClick={(event) => { event.stopPropagation(); removeInventory(item._id); }} className="rounded-lg bg-red-50 p-2 text-red-700"><FaTrash /></button></td></>}</tr>; })}</tbody></table></div>
    {modal && <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4"><form onSubmit={submit} className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl"><h2 className="text-xl font-bold">{modal === "master" ? "Add Master Product" : modal === "masterEdit" ? "Edit Master Product" : modal === "receive" ? "Receive Product" : "Update Franchise Inventory"}</h2>{modal === "edit" && form.variants?.length > 0 && <div className="mt-3 flex flex-wrap gap-2"><span className="text-sm text-slate-500">Delete a variant:</span>{form.variants.map((variant) => <button key={variant._id} type="button" onClick={() => removeInventory(form.inventoryId, variant)} className="rounded-lg bg-red-50 px-2 py-1 text-xs font-semibold text-red-700">{variant.label} ×</button>)}</div>}
      {["master", "masterEdit"].includes(modal) ? <div className="mt-5 grid grid-cols-2 gap-4"><Field label="Product name" value={form.name} set={(value) => setForm({ ...form, name: value })} wide /><Field label="Barcode" value={form.barcode} set={(value) => setForm({ ...form, barcode: value })} /><Field label="SKU (optional)" value={form.sku} set={(value) => setForm({ ...form, sku: value })} required={false} /><Field label="MRP" type="number" value={form.mrp} set={(value) => setForm({ ...form, mrp: value })} /><Field label="GST %" type="number" value={form.tax} set={(value) => setForm({ ...form, tax: value })} /></div> : <div className="mt-5 grid grid-cols-2 gap-4">{modal === "receive" && <label className="col-span-2"><span className="mb-1 block text-sm font-medium">Master product</span><select required value={form.productId} onChange={(event) => { const product = masterProducts.find((entry) => entry._id === event.target.value); setForm({ ...form, productId: event.target.value, barcode: product?.barcode || "", sellingPrice: product?.mrp || "", variants: variantRows(product) }); }} className="w-full rounded-xl border p-2"><option value="">Select product</option>{masterProducts.map((product) => <option key={product._id} value={product._id}>{product.name} — {product.barcode}</option>)}</select></label>}{form.variants?.length ? <div className="col-span-2 space-y-3 rounded-xl border border-slate-200 p-3"><p className="font-semibold text-slate-700">Franchise variant details</p>{form.variants.map((variant, index) => <div key={variant._id || variant.masterVariantId} className="grid grid-cols-2 gap-2 rounded-lg bg-slate-50 p-3"><p className="col-span-2 text-sm font-medium">{variant.label}</p><Field label="Franchise barcode" value={variant.barcode} set={(value) => updateVariant(index, "barcode", value)} /><Field label="Stock" type="number" value={variant.stock} set={(value) => updateVariant(index, "stock", value)} /><Field label="Selling price" type="number" value={variant.sellingPrice} set={(value) => updateVariant(index, "sellingPrice", value)} /><Field label="New batch no." value={variant.batchNo || ""} set={(value) => updateVariant(index, "batchNo", value)} required={false} /><Field label="Batch expiry" type="date" value={variant.expiryDate ? String(variant.expiryDate).slice(0, 10) : ""} set={(value) => updateVariant(index, "expiryDate", value)} required={false} /><div className="self-end text-xs text-slate-500">Previous batches: {(variant.batches || []).map((batch) => `${batch.batchNo || "No batch"}${batch.expiryDate ? ` (${String(batch.expiryDate).slice(0, 10)})` : ""}`).join(", ") || "None"}</div></div>)}</div> : <><Field label="Franchise barcode" value={form.barcode || ""} set={(value) => setForm({ ...form, barcode: value })} /><Field label="Stock quantity" type="number" value={form.quantity} set={(value) => setForm({ ...form, quantity: value })} /><Field label="Selling price" type="number" value={form.sellingPrice} set={(value) => setForm({ ...form, sellingPrice: value })} /><Field label="Batch no. (optional)" value={form.batchNo} set={(value) => setForm({ ...form, batchNo: value })} required={false} /><Field label="Expiry date (optional)" type="date" value={form.expiryDate} set={(value) => setForm({ ...form, expiryDate: value })} required={false} />{Object.keys(blankLocation).map((key) => <Field key={key} label={key[0].toUpperCase() + key.slice(1)} value={form.location?.[key] || ""} set={(value) => updateLocation(key, value)} required={false} />)}</>}</div>}
      <div className="mt-6 flex justify-end gap-3"><button type="button" onClick={() => setModal(null)} className="rounded-xl px-4 py-2 text-slate-600">Cancel</button><button className="rounded-xl bg-blue-600 px-4 py-2 font-semibold text-white">Save</button></div></form></div>}
  </div>;
}

function Field({ label, value, set, type = "text", required = true, wide = false }) { return <label className={wide ? "col-span-2" : ""}><span className="mb-1 block text-sm font-medium">{label}</span><input required={required} min={type === "number" ? "0" : undefined} type={type} value={value} onChange={(event) => set(event.target.value)} className="w-full rounded-xl border border-slate-200 p-2" /></label>; }
export default Products;
