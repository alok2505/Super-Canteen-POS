import { useEffect, useState } from "react";
import { getBills } from "../services/billApi";
import BillCard from "../components/BillCard";

function Bills() {
  const [bills, setBills] = useState([]);
  const [search, setSearch] = useState("");

  const loadBills = async () => {
    try {
      const res = await getBills();
      const billList = Array.isArray(res?.data?.bills) ? res.data.bills : [];
      setBills(billList);
    } catch (err) {
      console.log(err);
      setBills([]);
    }
  };

  useEffect(() => {
    loadBills();
  }, []);

  const filteredBills = (bills || []).filter((bill) => {
    const billNumber = String(bill?.billNumber ?? bill?.billNo ?? "").toLowerCase();
    return billNumber.includes(search.toLowerCase());
  });

  return (
    <div className="min-h-screen bg-slate-100 p-6">
      <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <h1 className="text-3xl font-bold">Bills History</h1>

        <input
          placeholder="Search Bill..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-lg border border-slate-300 px-4 py-2 md:w-72"
        />
      </div>

      <div className="space-y-4">
        {filteredBills.length > 0 ? (
          filteredBills.map((bill) => <BillCard key={bill._id} bill={bill} />)
        ) : (
          <div className="rounded-xl bg-white p-6 text-center text-slate-600 shadow-sm">
            No bills found.
          </div>
        )}
      </div>
    </div>
  );
}

export default Bills;