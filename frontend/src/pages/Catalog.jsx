import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/apiConfig";

function Catalog() {
  const [products, setProducts] = useState([]);
  const [inventoryIds, setInventoryIds] = useState(new Set());
  const [currentStock, setCurrentStock] = useState({});
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const navigate = useNavigate();
  const [form, setForm] = useState({ barcode: "", stock: 0, currentStock: 0, purchasePrice: "", sellingPrice: "", batchNo: "", expiryDate: "", location: { section: "", rack: "", shelf: "", bin: "" }, variants: [] });

  useEffect(() => {
    Promise.all([api.get("/master-products"), api.get("/franchise-inventory")])
      .then(([catalog, inventory]) => {
        setProducts(catalog.data.products || []);
        const batches = inventory.data.batches || [];
        setInventoryIds(new Set(batches.map((item) => item.productId._id)));
        
        const stockMap = {};
        batches.forEach(batch => {
          const key = batch.masterVariantId ? `${batch.productId._id}_${batch.masterVariantId}` : batch.productId._id;
          stockMap[key] = (stockMap[key] || 0) + batch.quantity;
        });
        setCurrentStock(stockMap);
      })
      .catch((error) => alert(error.response?.data?.message || "Unable to load the catalog."))
      .finally(() => setLoading(false));
  }, []);

  const variantRows = (product) => product.productType === "WeightPack" ? (product.flatVariants || []).map((variant) => ({ masterVariantId: variant._id, label: variant.size, barcode: variant.barcode || "", currentStock: currentStock[`${product._id}_${variant._id}`] || 0, stock: 0, purchasePrice: "", sellingPrice: variant.offerPrice || variant.mrp || 0, batchNo: "", expiryDate: "", location: { section: "", rack: "", shelf: "", bin: "" } })) : product.productType === "ColorSize" ? (product.colorVariants || []).flatMap((color) => (color.sizes || []).map((size) => ({ masterVariantId: size._id, label: `${color.name} ${size.size}`, color: color.name, size: size.size, barcode: size.barcode || "", currentStock: currentStock[`${product._id}_${size._id}`] || 0, stock: 0, purchasePrice: "", sellingPrice: size.offerPrice || size.mrp || 0, batchNo: "", expiryDate: "", location: { section: "", rack: "", shelf: "", bin: "" } }))) : [];
  const addToInventory = (product) => { setSelected(product); setForm({ barcode: product.barcode || "", currentStock: currentStock[product._id] || 0, stock: 0, purchasePrice: "", sellingPrice: product.mrp || "", batchNo: "", expiryDate: "", location: { section: "", rack: "", shelf: "", bin: "" }, variants: variantRows(product) }); };
  const updateVariant = (index, field, value) => setForm({ ...form, variants: form.variants.map((variant, current) => current === index ? { ...variant, [field]: value } : variant) });
  const updateVariantLocation = (index, field, value) => setForm({ ...form, variants: form.variants.map((variant, current) => current === index ? { ...variant, location: { ...variant.location, [field]: value } } : variant) });
  
  const submit = async (event) => { 
    event.preventDefault(); 
    try { 
      if (form.variants && form.variants.length > 0) {
        for (const variant of form.variants) {
          if (variant.stock > 0 || variant.batchNo) {
            await api.post("/franchise-inventory", { productId: selected._id, masterVariantId: variant.masterVariantId, barcode: variant.barcode, quantity: Number(variant.stock), purchasePrice: Number(variant.purchasePrice || 0), sellingPrice: Number(variant.sellingPrice), batchNumber: variant.batchNo || "Unknown", expiryDate: variant.expiryDate || undefined, location: variant.location });
          }
        }
      } else {
        await api.post("/franchise-inventory", { productId: selected._id, barcode: form.barcode, quantity: Number(form.stock), purchasePrice: Number(form.purchasePrice || 0), sellingPrice: Number(form.sellingPrice), batchNumber: form.batchNo || "Unknown", expiryDate: form.expiryDate || undefined, location: form.location }); 
      }
      setInventoryIds(new Set([...inventoryIds, selected._id])); 
      setSelected(null); 
    } catch (error) { 
      alert(error.response?.data?.message || "Unable to add inventory."); 
    } 
  };

  return <div className="min-h-screen bg-slate-50 p-8">
    <div className="mb-6"><h1 className="text-3xl font-bold text-slate-800">Master Product Catalog</h1><p className="mt-1 text-slate-500">Select a central product to receive it into your franchise. Products already received cannot be added twice.</p></div>
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"><table className="w-full text-left"><thead className="bg-slate-50 text-sm text-slate-500"><tr><th className="px-6 py-4">PRODUCT</th><th className="px-6 py-4">TYPE</th><th className="px-6 py-4">BARCODE</th><th className="px-6 py-4">MRP</th><th className="px-6 py-4">STATUS</th><th className="px-6 py-4">ACTION</th></tr></thead><tbody>{loading ? <tr><td colSpan="6" className="p-8 text-center text-slate-500">Loading…</td></tr> : products.map((product) => { const added = inventoryIds.has(product._id); return <tr key={product._id} className="border-t border-slate-100"><td className="px-6 py-4 font-semibold">{product.name}</td><td className="px-6 py-4 text-sm text-slate-600">{product.productType}</td><td className="px-6 py-4 text-sm text-slate-600">{product.barcode || "Variant product"}</td><td className="px-6 py-4">₹{product.mrp}</td><td className="px-6 py-4"><span className={`rounded-full px-3 py-1 text-xs font-semibold ${added ? "bg-green-50 text-green-700" : "bg-slate-100 text-slate-600"}`}>{added ? "In inventory" : "Not in inventory"}</span></td><td className="px-6 py-4"><button onClick={() => addToInventory(product)} className={`rounded-xl px-3 py-2 text-sm font-semibold bg-blue-600 text-white hover:bg-blue-700`}>{added ? "Add new batch / variant" : "Receive product"}</button></td></tr>; })}</tbody></table></div>
    {selected && <div className="fixed inset-0 z-50 overflow-auto bg-slate-900/50 p-6"><form onSubmit={submit} className="mx-auto my-6 max-w-4xl rounded-2xl bg-white p-6 shadow-xl"><h2 className="text-2xl font-bold">Add {selected.name} to Franchise Inventory</h2><p className="mt-1 text-sm text-slate-500">Set franchise-specific barcode, price, stock, batch, expiry, and storage location before adding. Only variants with 'Qty to receive' &gt; 0 will be added as batches.</p>{form.variants.length ? <div className="mt-5 space-y-4">{form.variants.map((variant, index) => <div key={variant.masterVariantId} className="rounded-xl border border-slate-200 p-4"><h3 className="font-semibold flex items-center gap-3">{variant.label} <span className="rounded bg-indigo-50 px-2 py-1 text-xs text-indigo-700">Current Stock: {variant.currentStock}</span></h3><div className="mt-3 grid grid-cols-2 gap-3 md:grid-cols-4"><Input label="Franchise barcode" value={variant.barcode} set={(value) => updateVariant(index, "barcode", value)} /><Input label="Qty to receive" type="number" value={variant.stock} set={(value) => updateVariant(index, "stock", value)} required={false} /><Input label="Purchase price" type="number" value={variant.purchasePrice} set={(value) => updateVariant(index, "purchasePrice", value)} required={false} /><Input label="Selling price" type="number" value={variant.sellingPrice} set={(value) => updateVariant(index, "sellingPrice", value)} /><Input label="Batch no." value={variant.batchNo} set={(value) => updateVariant(index, "batchNo", value)} required={false} /><Input label="Expiry" type="date" value={variant.expiryDate} set={(value) => updateVariant(index, "expiryDate", value)} required={false} />{["section", "rack", "shelf", "bin"].map((field) => <Input key={field} label={field} value={variant.location[field]} set={(value) => updateVariantLocation(index, field, value)} required={false} />)}</div></div>)}</div> : <div className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-4"><div className="col-span-full mb-2"><span className="rounded bg-indigo-50 px-3 py-2 text-sm font-semibold text-indigo-700">Current Total Stock: {form.currentStock}</span></div><Input label="Franchise barcode" value={form.barcode} set={(value) => setForm({ ...form, barcode: value })} /><Input label="Qty to receive" type="number" value={form.stock} set={(value) => setForm({ ...form, stock: value })} /><Input label="Purchase price" type="number" value={form.purchasePrice} set={(value) => setForm({ ...form, purchasePrice: value })} required={false} /><Input label="Selling price" type="number" value={form.sellingPrice} set={(value) => setForm({ ...form, sellingPrice: value })} /><Input label="Batch no." value={form.batchNo} set={(value) => setForm({ ...form, batchNo: value })} required={false} /><Input label="Expiry" type="date" value={form.expiryDate} set={(value) => setForm({ ...form, expiryDate: value })} required={false} />{["section", "rack", "shelf", "bin"].map((field) => <Input key={field} label={field} value={form.location[field]} set={(value) => setForm({ ...form, location: { ...form.location, [field]: value } })} required={false} />)}</div>}<div className="mt-6 flex justify-end gap-3"><button type="button" onClick={() => setSelected(null)} className="rounded-xl px-4 py-2 text-slate-600">Cancel</button><button className="rounded-xl bg-blue-600 px-4 py-2 font-semibold text-white">Add to Inventory</button></div></form></div>}
  </div>;
}

export default Catalog;

function Input({ label, value, set, type = "text", required = true }) { return <label><span className="mb-1 block text-xs font-medium uppercase text-slate-500">{label}</span><input required={required} min={type === "number" ? "0" : undefined} type={type} value={value} onChange={(event) => set(event.target.value)} className="w-full rounded-lg border border-slate-200 p-2" /></label>; }
