import { useState, useEffect } from "react";
import { getOffers, createOffer, updateOffer, deleteOffer } from "../services/offerApi";
import { getProducts } from "../services/productApi";
import { FaTag, FaPlus, FaEdit, FaTrash, FaSpinner, FaTimes } from "react-icons/fa";

function Offers() {
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState([]);
  
  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState(getInitialForm());

  function getInitialForm() {
    return {
      _id: null,
      name: "",
      code: "",
      type: "Flat Discount",
      conditions: { minBillAmount: 0, minQuantity: 0, applicableProducts: [], customerType: "All" },
      benefits: { discountValue: 0, maxDiscount: 0, freeProduct: { productId: "", quantity: 0 } },
      validity: { startDate: new Date().toISOString().slice(0,10), endDate: new Date(Date.now() + 30*24*60*60*1000).toISOString().slice(0,10) },
      isActive: true,
    };
  }

  useEffect(() => {
    loadOffers();
    loadProducts();
  }, []);

  const loadOffers = async () => {
    try {
      setLoading(true);
      const res = await getOffers();
      setOffers(res.data.offers || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadProducts = async () => {
    try {
      const res = await getProducts();
      setProducts(res.data.products || []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleOpenNew = () => {
    setFormData(getInitialForm());
    setIsEditing(false);
    setShowModal(true);
  };

  const handleEdit = (offer) => {
    setFormData({
      ...offer,
      validity: {
        startDate: new Date(offer.validity.startDate).toISOString().slice(0, 10),
        endDate: new Date(offer.validity.endDate).toISOString().slice(0, 10),
      },
      conditions: {
        ...offer.conditions,
        applicableProducts: offer.conditions.applicableProducts.map(p => p._id)
      },
      benefits: {
        ...offer.benefits,
        freeProduct: {
          productId: offer.benefits.freeProduct?.productId?._id || "",
          quantity: offer.benefits.freeProduct?.quantity || 0,
        }
      }
    });
    setIsEditing(true);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Delete this offer?")) {
      try {
        await deleteOffer(id);
        loadOffers();
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEditing) {
        await updateOffer(formData._id, formData);
      } else {
        await createOffer(formData);
      }
      setShowModal(false);
      loadOffers();
    } catch (err) {
      console.error(err);
      alert("Failed to save offer.");
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 p-6">
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <h1 className="text-3xl font-bold flex items-center gap-2 text-slate-800">
          <FaTag className="text-indigo-500" /> Coupons & Offers
        </h1>
        <button onClick={handleOpenNew} className="bg-indigo-600 px-6 py-2.5 text-white hover:bg-indigo-700 rounded-lg font-medium flex items-center gap-2 shadow-sm transition cursor-pointer">
          <FaPlus /> Create Offer
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full p-12 text-center text-slate-500 flex flex-col items-center">
            <FaSpinner className="animate-spin text-4xl mb-4 text-indigo-500" />
            <p>Loading offers...</p>
          </div>
        ) : offers.length > 0 ? (
          offers.map(offer => (
            <div key={offer._id} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
              <div className={`p-4 border-b border-slate-100 flex justify-between items-start ${offer.isActive ? 'bg-indigo-50' : 'bg-slate-50'}`}>
                <div>
                  <h2 className="font-bold text-lg text-slate-800">{offer.name}</h2>
                  <span className="text-xs font-bold px-2 py-1 rounded bg-indigo-100 text-indigo-700 mt-1 inline-block">{offer.type}</span>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => handleEdit(offer)} className="text-slate-400 hover:text-indigo-600 p-1"><FaEdit /></button>
                  <button onClick={() => handleDelete(offer._id)} className="text-slate-400 hover:text-red-500 p-1"><FaTrash /></button>
                </div>
              </div>
              <div className="p-5 flex-1 space-y-3 text-sm">
                {offer.code && (
                  <div className="flex justify-between border-b border-slate-50 pb-2">
                    <span className="text-slate-500">Coupon Code:</span>
                    <span className="font-mono font-bold text-slate-800 bg-slate-100 px-2 rounded">{offer.code}</span>
                  </div>
                )}
                <div className="flex justify-between border-b border-slate-50 pb-2">
                  <span className="text-slate-500">Benefit:</span>
                  <span className="font-bold text-emerald-600">
                    {offer.type === 'Free Product' ? `Free ${offer.benefits.freeProduct?.productId?.name || 'Item'}` : 
                     offer.type === 'Percentage Discount' ? `${offer.benefits.discountValue}% OFF` : 
                     `₹${offer.benefits.discountValue} OFF`}
                  </span>
                </div>
                <div className="flex justify-between border-b border-slate-50 pb-2">
                  <span className="text-slate-500">Min Bill:</span>
                  <span className="font-medium text-slate-700">₹{offer.conditions.minBillAmount}</span>
                </div>
                <div className="flex justify-between border-b border-slate-50 pb-2">
                  <span className="text-slate-500">Valid:</span>
                  <span className="font-medium text-slate-700">
                    {new Date(offer.validity.startDate).toLocaleDateString()} - {new Date(offer.validity.endDate).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex justify-between pb-2">
                  <span className="text-slate-500">Status:</span>
                  <span className={`font-bold ${offer.isActive ? 'text-green-500' : 'text-red-500'}`}>{offer.isActive ? "Active" : "Inactive"}</span>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full p-12 text-center text-slate-500 bg-white rounded-2xl border border-slate-200">
            No offers configured yet.
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center sticky top-0 bg-white z-10">
              <h2 className="text-xl font-bold text-slate-800">{isEditing ? "Edit Offer" : "Create Offer"}</h2>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-red-500"><FaTimes className="text-xl" /></button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-600 mb-1">Offer Name</label>
                  <input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="e.g. Diwali Dhamaka" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-600 mb-1">Coupon Code (Optional)</label>
                  <input value={formData.code} onChange={e => setFormData({...formData, code: e.target.value.toUpperCase()})} className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 outline-none font-mono" placeholder="e.g. WELCOME100" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-600 mb-1">Offer Type</label>
                  <select value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})} className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 outline-none">
                    <option>Flat Discount</option>
                    <option>Percentage Discount</option>
                    <option>Free Product</option>
                    <option>Bill Value Discount</option>
                    <option>Product Offer</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-600 mb-1">Status</label>
                  <select value={formData.isActive} onChange={e => setFormData({...formData, isActive: e.target.value === 'true'})} className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 outline-none">
                    <option value="true">Active</option>
                    <option value="false">Inactive</option>
                  </select>
                </div>
              </div>

              {/* Conditions */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                <h3 className="font-bold text-slate-700 mb-3">Conditions</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-600 mb-1">Min Bill Amount (₹)</label>
                    <input type="number" min="0" value={formData.conditions.minBillAmount} onChange={e => setFormData({...formData, conditions: {...formData.conditions, minBillAmount: Number(e.target.value)}})} className="w-full border border-slate-300 rounded-lg px-3 py-2" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-600 mb-1">Customer Type</label>
                    <select value={formData.conditions.customerType} onChange={e => setFormData({...formData, conditions: {...formData.conditions, customerType: e.target.value}})} className="w-full border border-slate-300 rounded-lg px-3 py-2">
                      <option>All</option>
                      <option>Frequent</option>
                      <option>New</option>
                    </select>
                  </div>
                </div>
                {formData.type === "Product Offer" && (
                  <div className="mt-4">
                    <label className="block text-sm font-semibold text-slate-600 mb-1">Applicable Product</label>
                    <select multiple className="w-full border border-slate-300 rounded-lg px-3 py-2 h-24" value={formData.conditions.applicableProducts} onChange={e => setFormData({...formData, conditions: {...formData.conditions, applicableProducts: Array.from(e.target.selectedOptions, option => option.value)}})}>
                      {products.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
                    </select>
                    <p className="text-xs text-slate-500 mt-1">Hold Cmd/Ctrl to select multiple</p>
                  </div>
                )}
              </div>

              {/* Benefits */}
              <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100">
                <h3 className="font-bold text-indigo-800 mb-3">Benefits</h3>
                
                {formData.type === "Free Product" ? (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-indigo-700 mb-1">Free Product</label>
                      <select required={formData.type === "Free Product"} value={formData.benefits.freeProduct.productId} onChange={e => setFormData({...formData, benefits: {...formData.benefits, freeProduct: {...formData.benefits.freeProduct, productId: e.target.value}}})} className="w-full border border-slate-300 rounded-lg px-3 py-2">
                        <option value="">Select Product...</option>
                        {products.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-indigo-700 mb-1">Quantity Free</label>
                      <input type="number" min="1" value={formData.benefits.freeProduct.quantity} onChange={e => setFormData({...formData, benefits: {...formData.benefits, freeProduct: {...formData.benefits.freeProduct, quantity: Number(e.target.value)}}})} className="w-full border border-slate-300 rounded-lg px-3 py-2" />
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-indigo-700 mb-1">
                        {formData.type === "Percentage Discount" ? "Discount (%)" : "Discount (₹)"}
                      </label>
                      <input type="number" min="0" required value={formData.benefits.discountValue} onChange={e => setFormData({...formData, benefits: {...formData.benefits, discountValue: Number(e.target.value)}})} className="w-full border border-slate-300 rounded-lg px-3 py-2" />
                    </div>
                    {formData.type === "Percentage Discount" && (
                      <div>
                        <label className="block text-sm font-semibold text-indigo-700 mb-1">Max Discount (₹)</label>
                        <input type="number" min="0" value={formData.benefits.maxDiscount} onChange={e => setFormData({...formData, benefits: {...formData.benefits, maxDiscount: Number(e.target.value)}})} className="w-full border border-slate-300 rounded-lg px-3 py-2" />
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Validity */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-600 mb-1">Start Date</label>
                  <input type="date" required value={formData.validity.startDate} onChange={e => setFormData({...formData, validity: {...formData.validity, startDate: e.target.value}})} className="w-full border border-slate-300 rounded-lg px-3 py-2" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-600 mb-1">End Date</label>
                  <input type="date" required value={formData.validity.endDate} onChange={e => setFormData({...formData, validity: {...formData.validity, endDate: e.target.value}})} className="w-full border border-slate-300 rounded-lg px-3 py-2" />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
                <button type="button" onClick={() => setShowModal(false)} className="px-6 py-2 rounded-lg font-medium text-slate-600 bg-slate-100 hover:bg-slate-200">Cancel</button>
                <button type="submit" className="px-6 py-2 rounded-lg font-medium text-white bg-indigo-600 hover:bg-indigo-700">Save Offer</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Offers;
