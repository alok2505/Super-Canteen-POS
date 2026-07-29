import { FaEye, FaTrash } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

function BillCard({ bill, onDelete }) {
  const navigate = useNavigate();

  const isReturn = bill.transactionType === "RETURN";
  const badgeClass = isReturn 
    ? "bg-red-100 text-red-700" 
    : "bg-green-100 text-green-700";

  // Use the original billId for returns so they can view the original bill
  const handleView = () => {
    if (isReturn && bill.billId?._id) {
      navigate(`/bills/${bill.billId._id}`);
    } else {
      navigate(`/bills/${bill._id}`);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow p-5 flex justify-between items-center">
      <div>
        <h2 className="font-bold text-xl flex items-center gap-2">
          {bill.displayId}
          
          {/* Status Badge */}
          {bill.status && bill.status !== "Completed" ? (
            <span className="text-xs px-2 py-1 bg-amber-100 text-amber-700 rounded-full font-bold">
              {bill.status}
            </span>
          ) : (
            <span className={`text-xs px-2 py-1 rounded-full font-bold ${badgeClass}`}>
              {isReturn ? "RETURN" : "SALE"}
            </span>
          )}
        </h2>

        <p>Customer : {bill.displayCustomer}</p>
        
        {bill.displayCustomerMobile && (
          <p>Mobile : {bill.displayCustomerMobile}</p>
        )}

        <p>Amount : ₹ {bill.displayAmount}</p>

        {!isReturn && bill.paymentMode && (
          <p>Payment : {bill.paymentMode}</p>
        )}
        
        {isReturn && bill.refundMethod && (
          <p>Refund : {bill.refundMethod}</p>
        )}

        {!isReturn && (
          <>
            <p>Items : {bill.totalItems ?? bill.items?.length ?? 0}</p>
            <p>
              Qty :{" "}
              {bill.totalQuantity ??
                (bill.items || []).reduce(
                  (sum, item) => sum + Number(item.quantity || 0),
                  0,
                )}
            </p>
          </>
        )}
        {isReturn && (
          <p>
             Qty Returned: {
                (bill.items || []).reduce(
                  (sum, item) => sum + Number(item.returnedQty || 0),
                  0,
                )
             }
          </p>
        )}

        <p className="text-gray-500 text-sm mt-1">
          {new Date(bill.displayDate).toLocaleString()}
        </p>
      </div>

      <div className="flex gap-3">
        <button
          onClick={handleView}
          className="bg-blue-500 hover:bg-blue-600 text-white w-12 h-12 rounded-lg"
          title="View Original Bill"
        >
          <FaEye className="mx-auto" />
        </button>

        {!isReturn && (
          <button 
            onClick={() => onDelete && onDelete()}
            className="bg-red-500 hover:bg-red-600 text-white w-12 h-12 rounded-lg"
            title="Delete Bill"
          >
            <FaTrash className="mx-auto" />
          </button>
        )}
      </div>
    </div>
  );
}

export default BillCard;
