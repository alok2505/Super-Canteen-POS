import React, { useState, useEffect, useCallback } from "react";
import { getLocationInventory } from "../services/inventoryApi";
import { getFranchises } from "../services/franchiseApi";
import { FaSearch, FaFilter, FaEye, FaTimes, FaSpinner } from "react-icons/fa";

const StockBadge = ({ stock }) => {
  if (stock <= 5) return <span className="rounded-full bg-red-100 px-2 py-1 text-xs font-semibold text-red-700">Critical</span>;
  if (stock <= 10) return <span className="rounded-full bg-amber-100 px-2 py-1 text-xs font-semibold text-amber-700">Low Stock</span>;
  return <span className="rounded-full bg-emerald-100 px-2 py-1 text-xs font-semibold text-emerald-700">Available</span>;
};

const ExpiryBadge = ({ expiryDate }) => {
  if (!expiryDate) return null;
  const expiry = new Date(expiryDate);
  const now = new Date();
  const diffDays = Math.ceil((expiry - now) / (1000 * 60 * 60 * 24));

  if (diffDays <= 0) return <span className="ml-2 rounded-full bg-red-100 px-2 py-1 text-xs font-semibold text-red-700">Expired</span>;
  if (diffDays <= 30) return <span className="ml-2 rounded-full bg-amber-100 px-2 py-1 text-xs font-semibold text-amber-700">Near Expiry</span>;
  return null;
};

function LocationLookup() {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 20;

  // Filters & Search
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [filters, setFilters] = useState({ section: "", rack: "", shelf: "", bin: "" });

  // Admin Franchise Selection
  const [franchises, setFranchises] = useState([]);
  const [selectedFranchiseId, setSelectedFranchiseId] = useState("");
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const isAdmin = user?.role === "Admin";

  // Modal
  const [selectedItem, setSelectedItem] = useState(null);

  useEffect(() => {
    if (isAdmin) {
      getFranchises().then((res) => {
        setFranchises(res.data.franchises || []);
        if (res.data.franchises?.length > 0 && !selectedFranchiseId) {
          setSelectedFranchiseId(res.data.franchises[0]._id);
        }
      }).catch(err => console.error("Error fetching franchises:", err));
    }
  }, [isAdmin]);

  // Debounce Search
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 500);
    return () => clearTimeout(handler);
  }, [search]);

  const loadData = useCallback(async () => {
    if (isAdmin && !selectedFranchiseId) return;
    
    try {
      setLoading(true);
      setError(null);
      const params = {
        page,
        limit,
        search: debouncedSearch,
        ...filters,
        ...(isAdmin && { franchiseId: selectedFranchiseId })
      };
      // Clean up empty filters
      Object.keys(params).forEach(key => !params[key] && delete params[key]);

      const res = await getLocationInventory(params);
      setInventory(res.data.inventory || []);
      setTotalPages(res.data.totalPages || 1);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load inventory.");
    } finally {
      setLoading(false);
    }
  }, [page, debouncedSearch, filters, isAdmin, selectedFranchiseId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
    setPage(1);
  };

  const resetFilters = () => {
    setFilters({ section: "", rack: "", shelf: "", bin: "" });
    setSearch("");
    setPage(1);
  };

  const inputClass = "w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none transition focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-100";

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-6 lg:p-8">
      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900">Location Lookup</h1>
          <p className="mt-1 text-sm md:text-base text-slate-500">Find products in the warehouse by location or details.</p>
        </div>
        {isAdmin && (
          <div className="w-full sm:w-64">
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
          </div>
        )}
      </div>

      {/* Top Section: Search & Filters */}
      <div className="mb-6 rounded-2xl bg-white p-4 shadow-sm border border-slate-200">
        <div className="mb-4">
          <div className="relative">
            <FaSearch className="absolute left-4 top-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search by Product Name, Barcode, SKU, Batch..."
              className={`${inputClass} pl-10`}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="flex flex-col gap-4 md:flex-row md:items-end">
          <div className="flex-1 grid grid-cols-2 gap-4 md:grid-cols-4">
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-600">Section</label>
              <input type="text" name="section" value={filters.section} onChange={handleFilterChange} className={inputClass} placeholder="All" />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-600">Rack</label>
              <input type="text" name="rack" value={filters.rack} onChange={handleFilterChange} className={inputClass} placeholder="All" />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-600">Shelf</label>
              <input type="text" name="shelf" value={filters.shelf} onChange={handleFilterChange} className={inputClass} placeholder="All" />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-600">Bin</label>
              <input type="text" name="bin" value={filters.bin} onChange={handleFilterChange} className={inputClass} placeholder="All" />
            </div>
          </div>
          <div className="flex gap-2 mt-4 md:mt-0">
            <button onClick={resetFilters} className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition w-full md:w-auto">
              Reset
            </button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="border-b border-slate-200 bg-slate-50 text-xs font-bold uppercase text-slate-700">
              <tr>
                <th className="px-6 py-4">Product Details</th>
                <th className="px-6 py-4">Location (S/R/S/B)</th>
                <th className="px-6 py-4">Stock</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="4" className="px-6 py-12 text-center text-slate-400">
                    <FaSpinner className="mx-auto h-6 w-6 animate-spin mb-2" />
                    Loading inventory...
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan="4" className="px-6 py-12 text-center text-red-500">{error}</td>
                </tr>
              ) : inventory.length === 0 ? (
                <tr>
                  <td colSpan="4" className="px-6 py-12 text-center text-slate-400">
                    No products found matching your search.
                  </td>
                </tr>
              ) : (
                inventory.map((item) => (
                  <tr key={item._id} className="hover:bg-slate-50 transition">
                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-900">{item.productName}</div>
                      <div className="text-xs text-slate-500 mt-0.5">
                        <span className="font-mono">BC: {item.barcode}</span>
                        {item.sku && <span className="ml-2 font-mono">SKU: {item.sku}</span>}
                      </div>
                      <div className="text-xs text-slate-500">Batch: {item.batchNumber}</div>
                    </td>
                    <td className="px-6 py-4 font-mono text-sm">
                      <div className="flex gap-1.5">
                        <span className="rounded bg-indigo-50 px-1.5 py-0.5 text-indigo-700" title="Section">{item.section || "-"}</span>/
                        <span className="rounded bg-sky-50 px-1.5 py-0.5 text-sky-700" title="Rack">{item.rack || "-"}</span>/
                        <span className="rounded bg-teal-50 px-1.5 py-0.5 text-teal-700" title="Shelf">{item.shelf || "-"}</span>/
                        <span className="rounded bg-fuchsia-50 px-1.5 py-0.5 text-fuchsia-700" title="Bin">{item.bin || "-"}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-lg font-bold text-slate-900">{item.availableStock}</div>
                      <StockBadge stock={item.availableStock} />
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => setSelectedItem(item)}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-50 px-3 py-1.5 text-xs font-semibold text-indigo-700 transition hover:bg-indigo-100"
                      >
                        <FaEye /> View
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-slate-200 bg-white px-6 py-4">
            <span className="text-sm text-slate-500">
              Page {page} of {totalPages}
            </span>
            <div className="flex gap-2">
              <button
                disabled={page === 1}
                onClick={() => setPage(p => p - 1)}
                className="rounded-lg border px-3 py-1.5 text-sm font-semibold text-slate-600 disabled:opacity-50"
              >
                Prev
              </button>
              <button
                disabled={page === totalPages}
                onClick={() => setPage(p => p + 1)}
                className="rounded-lg border px-3 py-1.5 text-sm font-semibold text-slate-600 disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Details Modal */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white shadow-xl overflow-hidden">
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 bg-slate-50">
              <h3 className="text-lg font-bold text-slate-900">Product Details</h3>
              <button onClick={() => setSelectedItem(null)} className="text-slate-400 hover:text-slate-600">
                <FaTimes size={20} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <h4 className="text-xl font-extrabold text-slate-900">{selectedItem.productName}</h4>
                <div className="mt-1 flex flex-wrap gap-2">
                  <StockBadge stock={selectedItem.availableStock} />
                  <ExpiryBadge expiryDate={selectedItem.expiryDate} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="rounded-xl bg-slate-50 p-3">
                  <span className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Stock Details</span>
                  <p><span className="font-medium">Quantity:</span> {selectedItem.availableStock}</p>
                  <p><span className="font-medium">Batch:</span> {selectedItem.batchNumber}</p>
                  <p><span className="font-medium">Barcode:</span> {selectedItem.barcode}</p>
                  {selectedItem.sku && <p><span className="font-medium">SKU:</span> {selectedItem.sku}</p>}
                </div>
                
                <div className="rounded-xl bg-slate-50 p-3">
                  <span className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Pricing & Dates</span>
                  <p><span className="font-medium">Purchase:</span> ₹{selectedItem.purchasePrice}</p>
                  <p><span className="font-medium">Selling:</span> ₹{selectedItem.sellingPrice}</p>
                  {selectedItem.manufactureDate && <p><span className="font-medium">MFG:</span> {new Date(selectedItem.manufactureDate).toLocaleDateString()}</p>}
                  {selectedItem.expiryDate && <p><span className="font-medium">EXP:</span> {new Date(selectedItem.expiryDate).toLocaleDateString()}</p>}
                </div>
              </div>

              <div className="rounded-xl bg-indigo-50 p-4 border border-indigo-100">
                <span className="block text-xs font-semibold text-indigo-800 uppercase tracking-wider mb-2">Exact Location</span>
                <div className="grid grid-cols-4 gap-2 text-center">
                  <div><span className="block text-xs text-indigo-500">Section</span><span className="font-bold text-indigo-900 text-lg">{selectedItem.section || "-"}</span></div>
                  <div><span className="block text-xs text-indigo-500">Rack</span><span className="font-bold text-indigo-900 text-lg">{selectedItem.rack || "-"}</span></div>
                  <div><span className="block text-xs text-indigo-500">Shelf</span><span className="font-bold text-indigo-900 text-lg">{selectedItem.shelf || "-"}</span></div>
                  <div><span className="block text-xs text-indigo-500">Bin</span><span className="font-bold text-indigo-900 text-lg">{selectedItem.bin || "-"}</span></div>
                </div>
              </div>
            </div>
            <div className="border-t border-slate-100 p-4 text-right bg-slate-50">
              <button onClick={() => setSelectedItem(null)} className="rounded-xl bg-slate-900 px-6 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 transition">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default LocationLookup;
