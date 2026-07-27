import { useState, useEffect } from "react";
import { getCustomers } from "../services/customerApi";
import { FaUser, FaSearch, FaStar, FaSpinner, FaEye } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

function Customers() {
  const [customers, setCustomers] = useState([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadCustomers();
  }, [filter]); // Re-load when filter changes

  const loadCustomers = async () => {
    try {
      setLoading(true);
      const res = await getCustomers(filter, search);
      setCustomers(res.data.customers || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    loadCustomers();
  };

  return (
    <div className="min-h-screen bg-slate-100 p-6">
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <h1 className="text-3xl font-bold flex items-center gap-2 text-slate-800">
          <FaUser className="text-indigo-500" /> Customers
        </h1>

        <div className="flex flex-col md:flex-row items-center gap-4">
          <form onSubmit={handleSearch} className="flex w-full md:w-auto">
            <input
              placeholder="Search Name or Mobile..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-l-lg border border-slate-300 px-4 py-2 focus:outline-none"
            />
            <button type="submit" className="bg-indigo-600 px-4 text-white hover:bg-indigo-700 rounded-r-lg">
              <FaSearch />
            </button>
          </form>

          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="rounded-lg border border-slate-300 px-4 py-2 focus:outline-none"
          >
            <option value="">All Customers</option>
            <option value="frequent">Frequent Customers</option>
            <option value="new">New Customers (7 days)</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center flex flex-col items-center justify-center text-slate-500">
            <FaSpinner className="animate-spin text-4xl mb-4 text-indigo-500" />
            <p>Loading customers...</p>
          </div>
        ) : customers.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-500 text-sm uppercase tracking-wider border-b border-slate-200">
                  <th className="px-6 py-4 font-semibold">Customer</th>
                  <th className="px-6 py-4 font-semibold">Mobile</th>
                  <th className="px-6 py-4 font-semibold text-center">Visits</th>
                  <th className="px-6 py-4 font-semibold text-right">Total Spent</th>
                  <th className="px-6 py-4 font-semibold">Status</th>
                  <th className="px-6 py-4 font-semibold text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {customers.map((c) => (
                  <tr key={c._id} className="hover:bg-slate-50 transition">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-800">{c.username}</span>
                        {c.isFrequent && <FaStar className="text-amber-400" title="Frequent Customer" />}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-600">{c.contactNo}</td>
                    <td className="px-6 py-4 text-center font-medium text-slate-700">{c.totalVisits || 0}</td>
                    <td className="px-6 py-4 text-right font-bold text-emerald-600">₹{(c.totalSpent || 0).toFixed(2)}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-bold ${c.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {c.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => navigate(`/customers/${c._id}`)}
                        className="text-indigo-600 hover:text-indigo-800 p-2 rounded-lg hover:bg-indigo-50 transition"
                        title="View Details"
                      >
                        <FaEye />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-8 text-center text-slate-500 font-medium">
            No customers found.
          </div>
        )}
      </div>
    </div>
  );
}

export default Customers;
