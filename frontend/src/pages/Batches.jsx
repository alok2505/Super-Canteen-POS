import React, { useState, useEffect, useCallback } from "react";
import { getBatches, receiveBatch, updateBatch, deleteBatch } from "../services/inventoryApi";
import { getFranchises } from "../services/franchiseApi";
import api from "../services/apiConfig"; // For fetching master products directly if needed
import { FaSearch, FaSpinner, FaPlus, FaEdit, FaTrash, FaTimes } from "react-icons/fa";

const StockBadge = ({ stock }) => {
  if (stock <= 5) return <span className="rounded-full bg-red-100 px-2 py-1 text-xs font-semibold text-red-700">Critical</span>;
  if (stock <= 10) return <span className="rounded-full bg-amber-100 px-2 py-1 text-xs font-semibold text-amber-700">Low Stock</span>;
  return <span className="rounded-full bg-emerald-100 px-2 py-1 text-xs font-semibold text-emerald-700">Available</span>;
};

function Batches() {
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [masterProducts, setMasterProducts] = useState([]);
  
  // Search
  const [search, setSearch] = useState("");

  // Admin Franchise Selection
  const [franchises, setFranchises] = useState([]);
  const [selectedFranchiseId, setSelectedFranchiseId] = useState("");
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const isAdmin = user?.role === "Admin";
  const canEdit = user?.role === "StoreManager";

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBatch, setEditingBatch] = useState(null);
  const [formData, setFormData] = useState({
    productId: "", barcode: "", batchNumber: "", quantity: "", purchasePrice: "", sellingPrice: "",
    expiryDate: "", section: "", rack: "", shelf: "", bin: ""
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isAdmin) {
      getFranchises().then((res) => {
        setFranchises(res.data.franchises || []);
        if (res.data.franchises?.length > 0 && !selectedFranchiseId) {
          setSelectedFranchiseId(res.data.franchises[0]._id);
        }
      }).catch(err => console.error(err));
    }
    if (canEdit) {
      api.get("/master-products").then(res => setMasterProducts(res.data.products || [])).catch(console.error);
    }
  }, [isAdmin, canEdit]);

  const loadData = useCallback(async () => {
    if (isAdmin && !selectedFranchiseId) return;
    try {
      setLoading(true);
      setError(null);
      // Ensure we hit franchise-inventory list endpoint
      const params = isAdmin ? { franchiseId: selectedFranchiseId } : {};
      const res = await getBatches(params);
      setBatches(res.data.batches || []);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load batches.");
    } finally {
      setLoading(false);
    }
  }, [isAdmin, selectedFranchiseId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const filteredBatches = batches.filter(b => 
    b.productId?.name?.toLowerCase().includes(search.toLowerCase()) ||
    b.barcode?.toLowerCase().includes(search.toLowerCase()) ||
    b.batchNumber?.toLowerCase().includes(search.toLowerCase())
  );

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const openModal = (batch = null) => {
    if (batch) {
      setEditingBatch(batch);
      setFormData({
        productId: batch.productId?._id || "",
        barcode: batch.barcode || "",
        batchNumber: batch.batchNumber || "",
        quantity: batch.quantity || "",
        purchasePrice: batch.purchasePrice || "",
        sellingPrice: batch.sellingPrice || "",
        expiryDate: batch.expiryDate ? new Date(batch.expiryDate).toISOString().split('T')[0] : "",
        section: batch.location?.section || "",
        rack: batch.location?.rack || "",
        shelf: batch.location?.shelf || "",
        bin: batch.location?.bin || ""
      });
    } else {
      setEditingBatch(null);
      setFormData({
        productId: "", barcode: "", batchNumber: "", quantity: "", purchasePrice: "", sellingPrice: "",
        expiryDate: "", section: "", rack: "", shelf: "", bin: ""
      });
    }
    setIsModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        productId: formData.productId,
        barcode: formData.barcode,
        batchNumber: formData.batchNumber,
        quantity: Number(formData.quantity),
        purchasePrice: Number(formData.purchasePrice),
        sellingPrice: Number(formData.sellingPrice),
        expiryDate: formData.expiryDate || undefined,
        location: { section: formData.section, rack: formData.rack, shelf: formData.shelf, bin: formData.bin }
      };

      if (editingBatch) {
        await updateBatch(editingBatch._id, payload);
      } else {
        await receiveBatch(payload);
      }
      setIsModalOpen(false);
      loadData();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to save batch");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this batch?")) return;
    try {
      await deleteBatch(id);
      loadData();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete batch");
    }
  };

  const inputClass = "w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm outline-none transition focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-100";

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-6 lg:p-8">
      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900">Batches</h1>
          <p className="mt-1 text-sm md:text-base text-slate-500">Manage individual inventory deliveries.</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          {isAdmin && (
            <select
              className={inputClass}
              value={selectedFranchiseId}
              onChange={(e) => setSelectedFranchiseId(e.target.value)}
            >
              <option value="" disabled>Select Franchise</option>
              {franchises.map(f => (
                <option key={f._id} value={f._id}>{f.name}</option>
              ))}
            </select>
          )}
          {canEdit && (
            <button
              onClick={() => openModal()}
              className="flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700"
            >
              <FaPlus /> Receive Batch
            </button>
          )}
        </div>
      </div>

      {/* Top Section: Search */}
      <div className="mb-6 rounded-2xl bg-white p-4 shadow-sm border border-slate-200">
        <div className="relative">
          <FaSearch className="absolute left-4  top-3.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search by Product Name, Barcode or Batch No..."
            className={`${inputClass} pl-10`}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="border-b border-slate-200 bg-slate-50 text-xs font-bold uppercase text-slate-700">
              <tr>
                <th className="px-6 py-4">Batch Details</th>
                <th className="px-6 py-4">Location</th>
                <th className="px-6 py-4">Stock</th>
                <th className="px-6 py-4">Dates</th>
                {canEdit && <th className="px-6 py-4 text-right">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={canEdit ? 5 : 4} className="px-6 py-12 text-center text-slate-400">
                    <FaSpinner className="mx-auto h-6 w-6 animate-spin mb-2" />
                    Loading batches...
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={canEdit ? 5 : 4} className="px-6 py-12 text-center text-red-500">{error}</td>
                </tr>
              ) : filteredBatches.length === 0 ? (
                <tr>
                  <td colSpan={canEdit ? 5 : 4} className="px-6 py-12 text-center text-slate-400">
                    No batches found.
                  </td>
                </tr>
              ) : (
                filteredBatches.map((batch) => (
                  <tr key={batch._id} className="hover:bg-slate-50 transition">
                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-900">{batch.productId?.name || "Unknown Product"}</div>
                      <div className="text-xs text-slate-500 mt-1">Batch: <span className="font-mono text-slate-700">{batch.batchNumber}</span></div>
                      <div className="text-xs text-slate-500 mt-0.5">Barcode: <span className="font-mono text-slate-700">{batch.barcode}</span></div>
                    </td>
                    <td className="px-6 py-4 font-mono text-sm">
                      <div className="flex flex-wrap gap-1">
                        <span className="rounded bg-indigo-50 px-1.5 py-0.5 text-indigo-700" title="Section">{batch.location?.section || "-"}</span>/
                        <span className="rounded bg-sky-50 px-1.5 py-0.5 text-sky-700" title="Rack">{batch.location?.rack || "-"}</span>/
                        <span className="rounded bg-teal-50 px-1.5 py-0.5 text-teal-700" title="Shelf">{batch.location?.shelf || "-"}</span>/
                        <span className="rounded bg-fuchsia-50 px-1.5 py-0.5 text-fuchsia-700" title="Bin">{batch.location?.bin || "-"}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-lg font-bold text-slate-900">{batch.quantity}</div>
                      <StockBadge stock={batch.quantity} />
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-500 whitespace-nowrap">
                      <div>Recv: {new Date(batch.createdAt).toLocaleDateString()}</div>
                      <div>Exp: {batch.expiryDate ? new Date(batch.expiryDate).toLocaleDateString() : "-"}</div>
                    </td>
                    {canEdit && (
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => openModal(batch)}
                            className="rounded-lg bg-slate-100 p-2 text-slate-600 hover:bg-slate-200 hover:text-slate-900 transition"
                            title="Edit Batch"
                          >
                            <FaEdit />
                          </button>
                          <button
                            onClick={() => handleDelete(batch._id)}
                            className="rounded-lg bg-red-50 p-2 text-red-600 hover:bg-red-100 hover:text-red-700 transition"
                            title="Delete Batch"
                          >
                            <FaTrash />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Receive / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="w-full max-w-2xl rounded-2xl bg-white shadow-xl my-8">
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 bg-slate-50 sticky top-0 rounded-t-2xl z-10">
              <h3 className="text-lg font-bold text-slate-900">
                {editingBatch ? "Edit Batch" : "Receive New Batch"}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <FaTimes size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSave} className="p-6">
              <div className="space-y-6">
                {/* Product Selection */}
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-slate-700">Product</label>
                  <select 
                    required 
                    name="productId" 
                    value={formData.productId} 
                    onChange={handleInputChange}
                    className={inputClass}
                    disabled={!!editingBatch}
                  >
                    <option value="" disabled>Select a Master Product...</option>
                    {masterProducts.map(p => (
                      <option key={p._id} value={p._id}>{p.name} ({p.sku || 'No SKU'})</option>
                    ))}
                  </select>
                </div>

                {/* Batch Identifiers */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="mb-1.5 block text-sm font-semibold text-slate-700">Barcode</label>
                    <input required type="text" name="barcode" value={formData.barcode} onChange={handleInputChange} className={inputClass} />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-semibold text-slate-700">Batch Number</label>
                    <input required type="text" name="batchNumber" value={formData.batchNumber} onChange={handleInputChange} className={inputClass} />
                  </div>
                </div>

                {/* Quantities & Prices */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="mb-1.5 block text-sm font-semibold text-slate-700">Quantity</label>
                    <input required type="number" min="0" name="quantity" value={formData.quantity} onChange={handleInputChange} className={inputClass} />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-semibold text-slate-700">Purchase Price (₹)</label>
                    <input required type="number" min="0" step="0.01" name="purchasePrice" value={formData.purchasePrice} onChange={handleInputChange} className={inputClass} />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-semibold text-slate-700">Selling Price (₹)</label>
                    <input required type="number" min="0" step="0.01" name="sellingPrice" value={formData.sellingPrice} onChange={handleInputChange} className={inputClass} />
                  </div>
                </div>

                {/* Expiry & Location */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="mb-1.5 block text-sm font-semibold text-slate-700">Expiry Date</label>
                    <input type="date" name="expiryDate" value={formData.expiryDate} onChange={handleInputChange} className={inputClass} />
                  </div>
                  
                  <div className="rounded-xl border border-slate-200 p-4 bg-slate-50">
                    <label className="mb-3 block text-sm font-semibold text-slate-700">Storage Location</label>
                    <div className="grid grid-cols-2 gap-3">
                      <input type="text" name="section" value={formData.section} onChange={handleInputChange} placeholder="Section" className={inputClass} />
                      <input type="text" name="rack" value={formData.rack} onChange={handleInputChange} placeholder="Rack" className={inputClass} />
                      <input type="text" name="shelf" value={formData.shelf} onChange={handleInputChange} placeholder="Shelf" className={inputClass} />
                      <input type="text" name="bin" value={formData.bin} onChange={handleInputChange} placeholder="Bin" className={inputClass} />
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-8 flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button type="button" onClick={() => setIsModalOpen(false)} className="rounded-xl border border-slate-200 px-6 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition">
                  Cancel
                </button>
                <button type="submit" disabled={saving} className="rounded-xl bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 transition disabled:opacity-70">
                  {saving ? "Saving..." : "Save Batch"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Batches;
