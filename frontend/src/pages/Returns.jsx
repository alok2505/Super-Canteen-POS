import { useEffect, useState } from "react";
import { getReturns } from "../services/returnApi";
import { FaUndo, FaEye } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

function Returns() {
  const [returns, setReturns] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadReturns();
  }, []);

  const loadReturns = async () => {
    try {
      setLoading(true);
      const res = await getReturns();
      setReturns(res.data.returns || []);
    } catch (err) {
      console.error(err);
      setReturns([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredReturns = (returns || []).filter((ret) => {
    const returnNo = String(ret?.returnNo || "").toLowerCase();
    const billNo = String(ret?.billId?.billNo || "").toLowerCase();
    const searchLower = search.toLowerCase();
    return returnNo.includes(searchLower) || billNo.includes(searchLower);
  });

  return (
    <div className="min-h-screen bg-slate-100 p-6">
      <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <FaUndo className="text-amber-500" /> Return History
        </h1>

        <div className="flex flex-col md:flex-row items-center gap-4">
          <input
            placeholder="Search Return No or Bill No..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-4 py-2 md:w-72"
          />
        </div>
      </div>

      <div className="space-y-4">
        {loading ? (
          <div className="rounded-xl bg-white p-6 text-center text-slate-500 font-medium shadow-sm animate-pulse">
            Loading returns...
          </div>
        ) : filteredReturns.length > 0 ? (
          filteredReturns.map((ret) => (
            <div key={ret._id} className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h2 className="font-bold text-xl flex items-center gap-2">
                  {ret.returnNo}
                  <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded-full font-bold">
                    {ret.status || "Completed"}
                  </span>
                </h2>
                <div className="text-slate-600 mt-2 space-y-1">
                  <p><span className="font-medium">Original Bill:</span> {ret.billId?.billNo || "N/A"}</p>
                  <p><span className="font-medium">Refund Amount:</span> ₹{ret.refundAmount?.toFixed(2)} ({ret.refundMethod})</p>
                  <p><span className="font-medium">Returned Items:</span> {ret.items?.length || 0}</p>
                  <p className="text-sm text-slate-400 mt-1">{new Date(ret.createdAt).toLocaleString()} by {ret.returnedBy?.username}</p>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => navigate(`/bills/${ret.billId?._id}`)}
                  className="bg-blue-100 hover:bg-blue-200 text-blue-700 px-4 py-2 font-medium rounded-lg flex items-center gap-2 transition"
                >
                  <FaEye /> View Original Bill
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="rounded-xl bg-white p-6 text-center text-slate-600 shadow-sm">
            No returns found.
          </div>
        )}
      </div>
    </div>
  );
}

export default Returns;
