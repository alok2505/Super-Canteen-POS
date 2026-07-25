import { useState, useEffect } from "react";
import { getDashboardStats, getLowStockAlerts } from "../services/reportApi";
import { FaChartLine, FaBoxOpen, FaFileInvoiceDollar, FaExclamationTriangle, FaCalendarAlt } from "react-icons/fa";
import DateFilter from "../components/DateFilter";

function Dashboard() {
  const [stats, setStats] = useState(null);
  const [lowStock, setLowStock] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState(null);
  const [timeLabel, setTimeLabel] = useState("Today");

  useEffect(() => {
    if (dateRange) {
      loadDashboardData();
    }
  }, [dateRange]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [statsRes, lowStockRes] = await Promise.all([
        getDashboardStats(dateRange?.startDate, dateRange?.endDate),
        getLowStockAlerts(10), // Threshold of 10
      ]);
      setStats(statsRes?.data?.stats?.period || null);
      setLowStock(lowStockRes?.data?.lowStockItems || []);
    } catch (error) {
      console.error("Error loading dashboard data", error);
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="p-8 bg-slate-50 min-h-screen">
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-800">Store Dashboard</h1>
          <p className="text-slate-500 mt-1">Overview of your franchise performance and alerts.</p>
        </div>
        
        <div className="bg-white p-2 rounded-xl shadow-sm border border-slate-200">
          <DateFilter onDateChange={(range) => {
            setDateRange(range);
            setTimeLabel(range.label);
          }} />
        </div>
      </div>

      {loading ? (
        <div className="text-center text-slate-500 py-12 text-lg font-medium">Loading Dashboard Data...</div>
      ) : (
        <>
          {/* Stats Cards */}
          <h2 className="text-xl font-bold mb-4 text-slate-700 flex items-center gap-2">
            <FaCalendarAlt className="text-indigo-500" /> Performance Overview ({timeLabel})
          </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex items-center gap-4">
          <div className="bg-blue-100 p-4 rounded-xl text-blue-600">
            <FaChartLine size={24} />
          </div>
          <div>
            <p className="text-sm text-slate-500 font-medium">Total Sales</p>
            <p className="text-2xl font-bold text-slate-800">₹{(stats?.sales || 0).toFixed(2)}</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex items-center gap-4">
          <div className="bg-emerald-100 p-4 rounded-xl text-emerald-600">
            <FaFileInvoiceDollar size={24} />
          </div>
          <div>
            <p className="text-sm text-slate-500 font-medium">Total Profit</p>
            <p className="text-2xl font-bold text-slate-800">₹{(stats?.profit || 0).toFixed(2)}</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex items-center gap-4">
          <div className="bg-purple-100 p-4 rounded-xl text-purple-600">
            <FaBoxOpen size={24} />
          </div>
          <div>
            <p className="text-sm text-slate-500 font-medium">Bills Generated</p>
            <p className="text-2xl font-bold text-slate-800">{stats?.count || 0}</p>
          </div>
        </div>
      </div>

      {/* Low Stock Alerts */}
      <h2 className="text-xl font-bold mb-4 text-slate-700 flex items-center gap-2">
        <FaExclamationTriangle className="text-amber-500" /> Low Stock Alerts
      </h2>
      
      {(!lowStock || lowStock.length === 0) ? (
        <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-100 text-center">
          <p className="text-slate-500 font-medium">All products are sufficiently stocked. Great job!</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-slate-600 text-sm">
              <tr>
                <th className="p-4 font-semibold">Product</th>
                <th className="p-4 font-semibold">Barcode</th>
                <th className="p-4 font-semibold">Current Stock</th>
                <th className="p-4 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {lowStock.map((item) => (
                <tr key={item._id} className="hover:bg-slate-50 transition">
                  <td className="p-4 flex items-center gap-3">
                    {item.image ? (
                      <img src={item.image} alt={item.name} className="w-10 h-10 rounded object-cover border" />
                    ) : (
                      <div className="w-10 h-10 rounded bg-slate-200 flex items-center justify-center text-xs text-slate-500">No Img</div>
                    )}
                    <span className="font-semibold text-slate-800">{item.name}</span>
                  </td>
                  <td className="p-4 text-sm text-slate-500 font-mono">{item.barcode}</td>
                  <td className="p-4 font-bold text-slate-800">{item.totalStock}</td>
                  <td className="p-4">
                    <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-700">
                      Restock Needed
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
        </>
      )}
    </div>
  );
}

export default Dashboard;
