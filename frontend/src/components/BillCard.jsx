import { FaEye, FaTrash } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

function BillCard({ bill }) {
  const navigate = useNavigate();
  console.log("BillCard bill:", bill);
  return (
    <div className="bg-white rounded-xl shadow p-5 flex justify-between items-center">
      <div>
        <h2 className="font-bold text-xl flex items-center gap-2">
          {bill.billNumber || bill.billNo || "N/A"}
          {bill.status && bill.status !== "Completed" && (
            <span className="text-xs px-2 py-1 bg-amber-100 text-amber-700 rounded-full font-bold">
              {bill.status}
            </span>
          )}
        </h2>

        <p>Customer : {bill.customerName || "Walk-in"}</p>

        <p>Amount : ₹ {bill.netAmount}</p>

        <p>Payment : {bill.paymentMode}</p>

        <p>Items : {bill.totalItems ?? bill.items?.length ?? 0}</p>

        <p>
          Qty :{" "}
          {bill.totalQuantity ??
            (bill.items || []).reduce(
              (sum, item) => sum + Number(item.quantity || 0),
              0,
            )}
        </p>

        <p className="text-gray-500 text-sm">
          {new Date(bill.createdAt).toLocaleString()}
        </p>
      </div>

      <div className="flex gap-3">
        <button
          onClick={() => navigate(`/bills/${bill._id}`)}
          className="bg-blue-500 hover:bg-blue-600 text-white w-12 h-12 rounded-lg"
        >
          <FaEye className="mx-auto" />
        </button>

        <button className="bg-red-500 hover:bg-red-600 text-white w-12 h-12 rounded-lg">
          <FaTrash className="mx-auto" />
        </button>
      </div>
    </div>
  );
}

export default BillCard;
