import { useState, useEffect } from "react";
import { getFranchises, createFranchise, deleteFranchise, toggleFranchiseStatus } from "../services/franchiseApi";
import { getAllUsers } from "../services/authApi";

function Franchises() {
  const [franchises, setFranchises] = useState([]);
  const [users, setUsers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    contactNo: "",
    manager: "",
    address: {
      address: "",
      city: "",
      state: "",
      postalCode: "",
      currentLocation: { lat: 0, lng: 0 }
    }
  });

  const loadData = async () => {
    try {
      const [franchiseRes, userRes] = await Promise.all([
        getFranchises(),
        getAllUsers()
      ]);
      setFranchises(franchiseRes.data.franchises || []);
      setUsers(userRes.data.users || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith("address.")) {
      const field = name.split(".")[1];
      setFormData({
        ...formData,
        address: { ...formData.address, [field]: value }
      });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await createFranchise({
        ...formData,
        address: {
          ...formData.address,
          currentLocation: { lat: 21.2514, lng: 81.6296 } // Mock coordinates for now
        }
      });
      setShowModal(false);
      loadData();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to create franchise");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure?")) {
      try {
        await deleteFranchise(id);
        loadData();
      } catch (err) {
        alert(err.response?.data?.message || "Failed to delete");
      }
    }
  };

  const handleToggle = async (id) => {
    try {
      await toggleFranchiseStatus(id);
      loadData();
    } catch (err) {
      alert("Failed to toggle status");
    }
  };

  const storeManagers = users.filter(u => u.role === "StoreManager");

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Franchises</h1>
        <button 
          onClick={() => setShowModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700"
        >
          + Add Franchise
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {franchises.map(f => (
          <div key={f._id} className="bg-white p-6 rounded-xl shadow border">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-xl font-bold">{f.name}</h3>
              <span className={`px-2 py-1 text-xs font-bold rounded ${f.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                {f.status}
              </span>
            </div>
            <p className="text-gray-600 text-sm mb-2"><strong>Code:</strong> {f.code}</p>
            <p className="text-gray-600 text-sm mb-2"><strong>Manager:</strong> {f.manager?.username || 'None'}</p>
            <p className="text-gray-600 text-sm mb-4"><strong>City:</strong> {f.address?.city}</p>
            
            <div className="flex gap-2">
              <button onClick={() => handleToggle(f._id)} className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800 py-2 rounded text-sm font-semibold">
                Toggle Status
              </button>
              <button onClick={() => handleDelete(f._id)} className="flex-1 bg-red-100 hover:bg-red-200 text-red-600 py-2 rounded text-sm font-semibold">
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-lg">
            <h2 className="text-2xl font-bold mb-4">Create Franchise</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium">Name</label>
                <input required type="text" name="name" value={formData.name} onChange={handleChange} className="w-full border p-2 rounded" />
              </div>
              <div>
                <label className="block text-sm font-medium">Contact No</label>
                <input required type="text" name="contactNo" value={formData.contactNo} onChange={handleChange} className="w-full border p-2 rounded" />
              </div>
              <div>
                <label className="block text-sm font-medium">City</label>
                <input required type="text" name="address.city" value={formData.address.city} onChange={handleChange} className="w-full border p-2 rounded" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium">State</label>
                  <input required type="text" name="address.state" value={formData.address.state} onChange={handleChange} className="w-full border p-2 rounded" />
                </div>
                <div>
                  <label className="block text-sm font-medium">Postal Code</label>
                  <input required type="text" name="address.postalCode" value={formData.address.postalCode} onChange={handleChange} className="w-full border p-2 rounded" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium">Full Address</label>
                <input required type="text" name="address.address" value={formData.address.address} onChange={handleChange} className="w-full border p-2 rounded" />
              </div>
              <div>
                <label className="block text-sm font-medium">Manager (StoreManager role only)</label>
                <select required name="manager" value={formData.manager} onChange={handleChange} className="w-full border p-2 rounded">
                  <option value="">Select Manager</option>
                  {storeManagers.map(m => (
                    <option key={m._id} value={m._id}>{m.username} ({m.email})</option>
                  ))}
                </select>
              </div>
              
              <div className="flex gap-2 justify-end mt-6">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 bg-gray-200 rounded font-semibold">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded font-semibold hover:bg-blue-700">Create</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Franchises;
