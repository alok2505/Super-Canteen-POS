import { useState, useEffect } from "react";
import { FaEdit, FaSearch } from "react-icons/fa";
import api from "../services/apiConfig";
import { getFranchises } from "../services/franchiseApi";

function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [franchises, setFranchises] = useState([]);
  const [selectedFranchiseId, setSelectedFranchiseId] = useState("");

  // Modal State
  const [editingItem, setEditingItem] = useState(null); // { productId, variantId, name, sku, countInStock, location }
  const [modalOpen, setModalOpen] = useState(false);
  const [updateLoading, setUpdateLoading] = useState(false);
  const [updateForm, setUpdateForm] = useState({
    countInStock: 0,
    section: "",
    rack: "",
    shelf: "",
    bin: "",
  });

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await api.get("/products", { params: selectedFranchiseId ? { franchiseId: selectedFranchiseId } : {} });
      if (res.data.success) {
        setProducts(res.data.products || res.data.data || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [selectedFranchiseId]);

  useEffect(() => {
    getFranchises({ limit: 100 })
      .then((res) => setFranchises(res.data.franchises || []))
      .catch((err) => console.error(err));
  }, []);

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      return fetchProducts();
    }
    try {
      setLoading(true);
      const res = await api.get("/products", { params: { search: searchQuery, ...(selectedFranchiseId ? { franchiseId: selectedFranchiseId } : {}) } });
      if (res.data.success) {
        setProducts(res.data.products || res.data.data || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const openEditModal = (product, variant, type) => {
    const inventory = product.franchiseInventory || product.franchiseInventories?.[0] || product;
    const loc = variant?.location || inventory.location || {};
    const stock = variant?.countInStock ?? inventory.countInStock ?? 0;

    setEditingItem({
      productId: product._id,
      variantId: variant ? variant._id : null,
      name: product.name,
      sku: variant ? variant.sku : product.sku,
      type,
    });

    setUpdateForm({
      countInStock: stock,
      section: loc.section || "",
      rack: loc.rack || "",
      shelf: loc.shelf || "",
      bin: loc.bin || "",
    });

    setModalOpen(true);
  };

  const handleUpdate = async () => {
    try {
      setUpdateLoading(true);
      const payload = {
        countInStock: Number(updateForm.countInStock),
        variantId: editingItem.variantId,
        ...(selectedFranchiseId ? { franchiseId: selectedFranchiseId } : {}),
        location: {
          section: updateForm.section,
          rack: updateForm.rack,
          shelf: updateForm.shelf,
          bin: updateForm.bin,
        },
      };

      await api.put(`/products/${editingItem.productId}/stock`, payload);
      
      setModalOpen(false);
      fetchProducts(); // Refresh list to get updated location and stock
    } catch (error) {
      alert("Failed to update stock and location.");
      console.error(error);
    } finally {
      setUpdateLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Products & Location</h1>
          <p className="text-slate-500 mt-1">Manage your inventory stock and storage locations.</p>
        </div>
        <select
          value={selectedFranchiseId}
          onChange={(e) => setSelectedFranchiseId(e.target.value)}
          className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700"
        >
          <option value="">Master / warehouse stock</option>
          {franchises.map((franchise) => (
            <option key={franchise._id} value={franchise._id}>
              {franchise.name} ({franchise.code})
            </option>
          ))}
        </select>
        
        <div className="flex bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden w-80">
          <input
            type="text"
            className="w-full px-4 py-2 outline-none text-slate-700 placeholder-slate-400"
            placeholder="Search SKU or location..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          />
          <button onClick={handleSearch} className="px-4 text-slate-400 hover:text-blue-600 transition">
            <FaSearch />
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-slate-500">Loading products...</div>
        ) : products.length === 0 ? (
          <div className="p-8 text-center text-slate-500">No products found.</div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-100/50 text-slate-500 text-sm tracking-wide border-b border-slate-200">
                <th className="py-4 px-6 font-semibold">PRODUCT / VARIANT</th>
                <th className="py-4 px-6 font-semibold">SKU / BARCODE</th>
                <th className="py-4 px-6 font-semibold text-center">STOCK</th>
                <th className="py-4 px-6 font-semibold">LOCATION</th>
                <th className="py-4 px-6 font-semibold text-center">ACTION</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => {
                const inv = product.franchiseInventory || product.franchiseInventories?.[0] || product;
                
                // If product is single
                if (!product.hasVariants || product.productType === "Single") {
                  return (
                    <tr key={product._id} className="border-b border-slate-50 hover:bg-slate-50 transition">
                      <td className="py-4 px-6">
                        <p className="font-medium text-slate-800">{product.name}</p>
                      </td>
                      <td className="py-4 px-6 text-sm text-slate-500">{product.sku}</td>
                      <td className="py-4 px-6 text-center">
                        <span className="bg-slate-100 text-slate-700 px-3 py-1 rounded-full text-sm font-medium">
                          {inv.countInStock || 0}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-sm">
                        {inv.location && (inv.location.section || inv.location.rack) ? (
                          <span className="text-blue-600 font-medium">
                            {[
                              inv.location.section && `Sec ${inv.location.section}`,
                              inv.location.rack && `Rack ${inv.location.rack}`,
                              inv.location.shelf && `Shelf ${inv.location.shelf}`,
                              inv.location.bin && `Bin ${inv.location.bin}`,
                            ].filter(Boolean).join(" → ")}
                          </span>
                        ) : (
                          <span className="text-slate-400 italic">Unassigned</span>
                        )}
                      </td>
                      <td className="py-4 px-6 text-center">
                        <button
                          onClick={() => openEditModal(product, null, "Single")}
                          className="text-blue-600 hover:text-blue-800 transition p-2 bg-blue-50 rounded-lg"
                        >
                          <FaEdit />
                        </button>
                      </td>
                    </tr>
                  );
                }

                // If WeightPack
                if (product.productType === "WeightPack" && inv.flatVariants) {
                  return inv.flatVariants.map((variant) => (
                    <tr key={variant._id} className="border-b border-slate-50 hover:bg-slate-50 transition">
                      <td className="py-4 px-6 flex items-center gap-2">
                        <p className="font-medium text-slate-800">{product.name}</p>
                        <span className="text-xs bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-full">{variant.size}</span>
                      </td>
                      <td className="py-4 px-6 text-sm text-slate-500">{variant.sku || variant.barcode}</td>
                      <td className="py-4 px-6 text-center">
                        <span className="bg-slate-100 text-slate-700 px-3 py-1 rounded-full text-sm font-medium">
                          {variant.countInStock || 0}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-sm">
                        {variant.location && (variant.location.section || variant.location.rack) ? (
                          <span className="text-blue-600 font-medium">
                            {[
                              variant.location.section && `Sec ${variant.location.section}`,
                              variant.location.rack && `Rack ${variant.location.rack}`,
                              variant.location.shelf && `Shelf ${variant.location.shelf}`,
                              variant.location.bin && `Bin ${variant.location.bin}`,
                            ].filter(Boolean).join(" → ")}
                          </span>
                        ) : (
                          <span className="text-slate-400 italic">Unassigned</span>
                        )}
                      </td>
                      <td className="py-4 px-6 text-center">
                        <button
                          onClick={() => openEditModal(product, variant, "WeightPack")}
                          className="text-blue-600 hover:text-blue-800 transition p-2 bg-blue-50 rounded-lg"
                        >
                          <FaEdit />
                        </button>
                      </td>
                    </tr>
                  ));
                }

                // If ColorSize
                if (product.productType === "ColorSize" && inv.colorVariants) {
                  return inv.colorVariants.map((color) => 
                    color.sizes.map((size) => (
                      <tr key={size._id} className="border-b border-slate-50 hover:bg-slate-50 transition">
                        <td className="py-4 px-6 flex items-center gap-2">
                          <p className="font-medium text-slate-800">{product.name}</p>
                          <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">{color.name}</span>
                          <span className="text-xs bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-full">{size.size}</span>
                        </td>
                        <td className="py-4 px-6 text-sm text-slate-500">{size.sku || size.barcode}</td>
                        <td className="py-4 px-6 text-center">
                          <span className="bg-slate-100 text-slate-700 px-3 py-1 rounded-full text-sm font-medium">
                            {size.countInStock || 0}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-sm">
                          {size.location && (size.location.section || size.location.rack) ? (
                            <span className="text-blue-600 font-medium">
                              {[
                                size.location.section && `Sec ${size.location.section}`,
                                size.location.rack && `Rack ${size.location.rack}`,
                                size.location.shelf && `Shelf ${size.location.shelf}`,
                                size.location.bin && `Bin ${size.location.bin}`,
                              ].filter(Boolean).join(" → ")}
                            </span>
                          ) : (
                            <span className="text-slate-400 italic">Unassigned</span>
                          )}
                        </td>
                        <td className="py-4 px-6 text-center">
                          <button
                            onClick={() => openEditModal(product, size, "ColorSize")}
                            className="text-blue-600 hover:text-blue-800 transition p-2 bg-blue-50 rounded-lg"
                          >
                            <FaEdit />
                          </button>
                        </td>
                      </tr>
                    ))
                  );
                }

                return null;
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Edit Location Modal */}
      {modalOpen && editingItem && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-xl overflow-hidden">
            <div className="p-6 border-b border-slate-100">
              <h3 className="text-xl font-bold text-slate-800">Update Stock & Location</h3>
              <p className="text-sm text-slate-500 mt-1">{editingItem.name} {editingItem.sku ? `(${editingItem.sku})` : ""}</p>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Count In Stock</label>
                <input
                  type="number"
                  className="w-full border-slate-200 border rounded-xl px-4 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                  value={updateForm.countInStock}
                  onChange={(e) => setUpdateForm({ ...updateForm, countInStock: e.target.value })}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Section</label>
                  <input
                    type="text"
                    placeholder="e.g. A"
                    className="w-full border-slate-200 border rounded-xl px-4 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                    value={updateForm.section}
                    onChange={(e) => setUpdateForm({ ...updateForm, section: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Rack</label>
                  <input
                    type="text"
                    placeholder="e.g. 1"
                    className="w-full border-slate-200 border rounded-xl px-4 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                    value={updateForm.rack}
                    onChange={(e) => setUpdateForm({ ...updateForm, rack: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Shelf</label>
                  <input
                    type="text"
                    placeholder="e.g. 2"
                    className="w-full border-slate-200 border rounded-xl px-4 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                    value={updateForm.shelf}
                    onChange={(e) => setUpdateForm({ ...updateForm, shelf: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Bin</label>
                  <input
                    type="text"
                    placeholder="e.g. Bottom"
                    className="w-full border-slate-200 border rounded-xl px-4 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                    value={updateForm.bin}
                    onChange={(e) => setUpdateForm({ ...updateForm, bin: e.target.value })}
                  />
                </div>
              </div>
            </div>

            <div className="p-4 bg-slate-50 flex justify-end gap-3 border-t border-slate-100">
              <button
                onClick={() => setModalOpen(false)}
                className="px-5 py-2 text-slate-600 font-medium hover:bg-slate-200 rounded-xl transition"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdate}
                disabled={updateLoading}
                className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition shadow-sm disabled:opacity-70"
              >
                {updateLoading ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Products;
