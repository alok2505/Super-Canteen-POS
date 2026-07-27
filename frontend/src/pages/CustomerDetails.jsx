import { useState, useEffect } from "react";
import { getCustomerById } from "../services/customerApi";
import { FaUser, FaStar, FaSpinner, FaArrowLeft, FaReceipt } from "react-icons/fa";
import { useParams, useNavigate } from "react-router-dom";

function CustomerDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [customer, setCustomer] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await getCustomerById(id);
      setCustomer(res.data.customer);
      setHistory(res.data.purchaseHistory || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center p-8">
        <FaSpinner className="animate-spin text-4xl text-indigo-500" />
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="p-8 text-center text-red-500 font-bold">
        Customer not found!
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 p-6">
      <button onClick={() => navigate("/customers")} className="mb-6 flex items-center gap-2 text-slate-600 hover:text-indigo-600 font-medium transition">
        <FaArrowLeft /> Back to Customers
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Col: Customer Profile */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center gap-4 mb-6">
              <div className="h-16 w-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                {customer.username.charAt(0).toUpperCase()}
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                  {customer.username}
                  {customer.isFrequent && <FaStar className="text-amber-400 text-lg" title="Frequent Customer" />}
                </h1>
                <p className="text-slate-500">{customer.contactNo}</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                <p className="text-sm text-slate-500 mb-1">Total Savings</p>
                <p className="text-2xl font-bold text-emerald-600">₹{(customer.totalSavings || 0).toFixed(2)}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                  <p className="text-sm text-slate-500 mb-1">Total Visits</p>
                  <p className="text-xl font-bold text-slate-800">{customer.totalVisits || 0}</p>
                </div>
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                  <p className="text-sm text-slate-500 mb-1">Total Spent</p>
                  <p className="text-xl font-bold text-slate-800">₹{(customer.totalSpent || 0).toFixed(2)}</p>
                </div>
              </div>

              {customer.email && (
                <div>
                  <p className="text-sm font-semibold text-slate-400">Email</p>
                  <p className="font-medium text-slate-700">{customer.email}</p>
                </div>
              )}
              {customer.addresses && customer.addresses.length > 0 && (
                <div>
                  <p className="text-sm font-semibold text-slate-400">Address</p>
                  <p className="font-medium text-slate-700">{customer.addresses[0].address}</p>
                </div>
              )}
              <div>
                <p className="text-sm font-semibold text-slate-400">Last Visit</p>
                <p className="font-medium text-slate-700">{customer.lastVisit ? new Date(customer.lastVisit).toLocaleDateString() : "N/A"}</p>
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-400">Joined</p>
                <p className="font-medium text-slate-700">{new Date(customer.createdAt).toLocaleDateString()}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Col: Purchase History */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden h-full flex flex-col">
            <div className="p-6 border-b border-slate-100">
              <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2"><FaReceipt className="text-indigo-500" /> Purchase History</h2>
            </div>
            <div className="p-6 flex-1 overflow-y-auto">
              {history.length > 0 ? (
                <div className="space-y-4">
                  {history.map(bill => (
                    <div key={bill._id} className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-bold text-slate-800">{bill.billNo}</span>
                          <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                              bill.status === 'Completed' || !bill.status ? 'bg-green-100 text-green-700' :
                              bill.status === 'Partially Returned' ? 'bg-amber-100 text-amber-700' :
                              'bg-red-100 text-red-700'
                            }`}>
                              {bill.status || 'Completed'}
                          </span>
                        </div>
                        <p className="text-sm text-slate-500">{new Date(bill.createdAt).toLocaleString()}</p>
                        
                        {bill.appliedOffers && bill.appliedOffers.length > 0 && (
                          <div className="mt-2 flex flex-wrap gap-1">
                            {bill.appliedOffers.map((o, idx) => (
                              <span key={idx} className="bg-indigo-100 text-indigo-700 text-xs px-2 py-1 rounded font-medium">{o.name}</span>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-6">
                        <div className="text-right">
                          <p className="font-bold text-lg text-slate-800">₹{bill.netAmount.toFixed(2)}</p>
                          {bill.totalSavings > 0 && <p className="text-xs text-emerald-600 font-bold">Saved ₹{bill.totalSavings.toFixed(2)}</p>}
                        </div>
                        <button onClick={() => navigate(`/bills/${bill._id}`)} className="bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 px-4 py-2 rounded-lg font-medium transition text-sm">
                          View
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="h-full flex items-center justify-center text-slate-500">
                  No purchases yet.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CustomerDetails;
