import { useEffect, useState, useCallback } from "react";
import { getBills, deleteBill } from "../services/billApi";
import { getReturns } from "../services/returnApi";
import BillCard from "../components/BillCard";
import DateFilter from "../components/DateFilter";

function Bills() {
  const [transactions, setTransactions] = useState([]);
  const [search, setSearch] = useState("");
  const [dateRange, setDateRange] = useState(null);
  const [filterType, setFilterType] = useState("All"); // "All", "Sales", "Returns"

  const loadTransactions = useCallback(async () => {
    try {
      const [resBills, resReturns] = await Promise.all([
        getBills(dateRange?.startDate, dateRange?.endDate).catch(() => ({ data: { bills: [] } })),
        getReturns().catch(() => ({ data: { returns: [] } }))
      ]);

      const billList = Array.isArray(resBills?.data?.bills) ? resBills.data.bills : [];
      let returnList = Array.isArray(resReturns?.data?.returns) ? resReturns.data.returns : [];

      // Filter returns by date locally since getReturns doesn't have date parameters yet
      if (dateRange?.startDate && dateRange?.endDate) {
        const start = new Date(dateRange.startDate);
        const end = new Date(dateRange.endDate);
        returnList = returnList.filter(r => {
          const rDate = new Date(r.createdAt);
          return rDate >= start && rDate <= end;
        });
      }

      const sales = billList.map(b => ({
        ...b,
        transactionType: "SALE",
        displayId: b.billNo || "Pending",
        displayAmount: b.netAmount || 0,
        displayCustomer: b.customerName || "Walk-in",
        displayCustomerMobile: b.customerMobile || "",
        displayDate: b.createdAt
      }));

      const returns = returnList.map(r => ({
        ...r,
        transactionType: "RETURN",
        displayId: r.returnNo || "Return",
        displayAmount: r.refundAmount || 0,
        displayCustomer: r.billId?.customerName || "Walk-in",
        displayCustomerMobile: r.billId?.customerMobile || "",
        displayDate: r.createdAt
      }));

      const merged = [...sales, ...returns].sort((a, b) => new Date(b.displayDate) - new Date(a.displayDate));
      setTransactions(merged);
    } catch (err) {
      console.log(err);
      setTransactions([]);
    }
  }, [dateRange]);

  useEffect(() => {
    loadTransactions();
  }, [loadTransactions]);

  const handleDeleteBill = async (id, type) => {
    if (type === "RETURN") {
      alert("Deleting returns is not supported directly.");
      return;
    }
    if (!window.confirm("Are you sure you want to delete this bill? This action cannot be undone.")) return;
    try {
      await deleteBill(id);
      loadTransactions();
    } catch (err) {
      console.error(err);
      alert(err?.response?.data?.message || "Failed to delete bill");
    }
  };

  const filteredTransactions = transactions.filter((tx) => {
    // Filter by type
    if (filterType === "Sales" && tx.transactionType !== "SALE") return false;
    if (filterType === "Returns" && tx.transactionType !== "RETURN") return false;

    // Filter by search (ID, Customer Name, Mobile)
    const searchLower = search.toLowerCase();
    const idMatch = String(tx.displayId).toLowerCase().includes(searchLower);
    const nameMatch = String(tx.displayCustomer).toLowerCase().includes(searchLower);
    const mobileMatch = String(tx.displayCustomerMobile).toLowerCase().includes(searchLower);
    
    return idMatch || nameMatch || mobileMatch;
  });

  return (
    <div className="min-h-screen bg-slate-100 p-6">
      <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <h1 className="text-3xl font-bold">Transaction History</h1>

        <div className="flex flex-col md:flex-row items-center gap-4">
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="rounded-lg border border-slate-300 px-4 py-2 bg-white"
          >
            <option value="All">All Transactions</option>
            <option value="Sales">Sales Only</option>
            <option value="Returns">Returns Only</option>
          </select>
          
          <DateFilter onDateChange={setDateRange} />
          
          <input
            placeholder="Search Bill No, Name, Mobile..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-4 py-2 md:w-72"
          />
        </div>
      </div>

      <div className="space-y-4">
        {filteredTransactions.length > 0 ? (
          filteredTransactions.map((tx) => (
            <BillCard 
              key={`${tx.transactionType}-${tx._id}`} 
              bill={tx} 
              onDelete={() => handleDeleteBill(tx._id, tx.transactionType)} 
            />
          ))
        ) : (
          <div className="rounded-xl bg-white p-6 text-center text-slate-600 shadow-sm">
            No transactions found.
          </div>
        )}
      </div>
    </div>
  );
}

export default Bills;