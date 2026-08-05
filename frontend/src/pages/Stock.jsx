import React, { useState, useEffect, useCallback } from "react";
import { getImageUrl } from "../utils/imageUtils";

import { getAggregatedStock } from "../services/inventoryApi";
import { getFranchises } from "../services/franchiseApi";
import { FaSearch, FaSpinner } from "react-icons/fa";

const StockBadge = ({ stock }) => {
  if (stock <= 5) return <span className="rounded-full bg-red-100 px-2 py-1 text-xs font-semibold text-red-700">Critical</span>;
  if (stock <= 10) return <span className="rounded-full bg-amber-100 px-2 py-1 text-xs font-semibold text-amber-700">Low Stock</span>;
  return <span className="rounded-full bg-emerald-100 px-2 py-1 text-xs font-semibold text-emerald-700">Available</span>;
};

function Stock() {
  const [stockData, setStockData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 20;

  // Search
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // Admin Franchise Selection
  const [franchises, setFranchises] = useState([]);
  const [selectedFranchiseId, setSelectedFranchiseId] = useState("");
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const isAdmin = user?.role === "Admin";

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
        ...(isAdmin && { franchiseId: selectedFranchiseId })
      };
      
      const res = await getAggregatedStock(params);
      setStockData(res.data.stock || []);
      setTotalPages(res.data.totalPages || 1);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load stock data.");
    } finally {
      setLoading(false);
    }
  }, [page, debouncedSearch, isAdmin, selectedFranchiseId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const inputClass = "w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none transition focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-100";

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-6 lg:p-8">
      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900">Total Stock</h1>
          <p className="mt-1 text-sm md:text-base text-slate-500">Aggregated stock view across all batches.</p>
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

      {/* Top Section: Search */}
      <div className="mb-6 rounded-2xl bg-white p-4 shadow-sm border border-slate-200">
        <div className="relative">
          <FaSearch className="absolute left-4 top-3.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search by Product Name or SKU..."
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
                <th className="px-6 py-4">Product Details</th>
                <th className="px-6 py-4">Associated Barcodes</th>
                <th className="px-6 py-4">No. of Batches</th>
                <th className="px-6 py-4">Total Stock</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="4" className="px-6 py-12 text-center text-slate-400">
                    <FaSpinner className="mx-auto h-6 w-6 animate-spin mb-2" />
                    Loading stock...
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan="4" className="px-6 py-12 text-center text-red-500">{error}</td>
                </tr>
              ) : stockData.length === 0 ? (
                <tr>
                  <td colSpan="4" className="px-6 py-12 text-center text-slate-400">
                    No products found matching your search.
                  </td>
                </tr>
              ) : (
                stockData.map((item) => (
                  <tr key={item._id} className="hover:bg-slate-50 transition">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {item.images && item.images.length > 0 ? (
                          <img src={getImageUrl(item.images[0])} alt={item.productName} className="h-10 w-10 rounded-lg object-cover bg-slate-200" />
                        ) : (
                          <div className="h-10 w-10 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400 font-bold uppercase">
                            {item.productName.substring(0, 2)}
                          </div>
                        )}
                        <div>
                          <div className="font-bold text-slate-900">{item.productName}</div>
                          {item.sku && <div className="text-xs text-slate-500 mt-0.5 font-mono">SKU: {item.sku}</div>}
                          <div className="text-xs text-slate-400 mt-0.5">{item.productType}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-mono text-xs text-slate-500 max-w-xs truncate">
                      {item.barcodes?.join(", ") || "-"}
                    </td>
                    <td className="px-6 py-4">
                      <span className="rounded-lg bg-slate-100 px-2 py-1 text-sm font-semibold text-slate-700">
                        {item.batchesCount}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col items-start gap-1">
                        <span className="text-lg font-bold text-slate-900">{item.totalStock}</span>
                        <StockBadge stock={item.totalStock} />
                      </div>
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
    </div>
  );
}

export default Stock;
