import { useState } from "react";
import { FaMoneyBillWave, FaCreditCard, FaMobileAlt } from "react-icons/fa";
import { saveBill } from "../services/billApi";
import { saveHoldBill } from "../services/holdBillApi";

function BillSummary({ bill, cart, clearCart, clearBill }) {
  const [paymentMode, setPaymentMode] = useState("Cash");
  const [customerName, setCustomerName] = useState("Walk-in");
  const [customerMobile, setCustomerMobile] = useState("");
  const [customerPaid, setCustomerPaid] = useState("");

  // Values from backend
  const grossAmount = bill?.grossAmount || 0;
  const discount = bill?.discount || 0;
  const gst = bill?.gst || 0;
  const netAmount = bill?.netAmount || 0;

  // Payment calculation
  const paid = Number(customerPaid || 0);

  const change = paid >= netAmount ? paid - netAmount : 0;

  const remaining = paid < netAmount ? netAmount - paid : 0;

  // Handle Hold Bill
  const handleHoldBill = async () => {
    if (!bill || bill.items.length === 0) {
      alert("Cart is empty");
      return;
    }

    try {
      const res = await saveHoldBill({
        customerName: "Walk-in",

        items: bill.items,

        grossAmount: bill.grossAmount,

        sellingAmount: bill.sellingAmount,

        savings: bill.savings,

        discount: bill.discount,

        couponDiscount: bill.couponDiscount,

        gst: bill.gst,

        netAmount: bill.netAmount,

        totalItems: bill.totalItems,

        totalQuantity: bill.totalQuantity,
      });

      alert(res.data.message);

      clearCart();

      clearBill();

      setCustomerPaid("");
    } catch (err) {
      console.log(err);

      alert("Unable to hold bill");
    }
  };

  // Handle Checkout

  const handleCheckout = async () => {
    if (!bill || !bill.items?.length) {
      alert("No items in cart.");
      return;
    }

    try {
      const response = await saveBill({
        items: bill.items,

        grossAmount: bill.grossAmount,

        sellingAmount: bill.sellingAmount,

        savings: bill.savings,

        discount: bill.discount,

        couponDiscount: bill.couponDiscount,

        gst: bill.gst,

        netAmount: bill.netAmount,

        totalItems: bill.totalItems,

        totalQuantity: bill.totalQuantity,

        billNo: bill?.billNo,

        customerName: customerName.trim() || "Walk-in",

        customerMobile: customerMobile.trim(),

        paymentMode,

        customerPaid: Number(customerPaid),

        changeReturned: Number(customerPaid) - bill.netAmount,
      });

      alert(response.data.message);

      clearCart();

      setCustomerName("Walk-in");
      setCustomerMobile("");
      setCustomerPaid("");
    } catch (error) {
      console.log(error);

      alert("Unable to save bill.");
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg h-full flex flex-col">
      {/* Header */}
      <div className="border-b p-5">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-2xl font-bold">Bill Summary</h2>
          <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-700">
            {bill?.billNo || "Pending"}
          </span>
        </div>
      </div>

      {/* Body */}

      <div className="flex-1 p-5 space-y-4">
        <Row title="Gross Amount" value={grossAmount} />

        <Row title="Discount" value={discount} />

        <Row title="GST" value={gst} />
        <Row title="Savings" value={bill?.savings || 0} green />

        <hr />

        <div className="flex justify-between text-2xl font-bold">
          <span>Net Amount</span>

          <span className="text-blue-600">₹ {netAmount}</span>
        </div>

        <hr />

        {/* Payment Mode */}

        <div>
          <h3 className="font-semibold mb-3">Payment Mode</h3>

          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => setPaymentMode("Cash")}
              className={`rounded-lg border p-3 ${
                paymentMode === "Cash" ? "bg-green-600 text-white" : ""
              }`}
            >
              <FaMoneyBillWave className="mx-auto mb-2" />
              Cash
            </button>

            <button
              onClick={() => setPaymentMode("Card")}
              className={`rounded-lg border p-3 ${
                paymentMode === "Card" ? "bg-blue-600 text-white" : ""
              }`}
            >
              <FaCreditCard className="mx-auto mb-2" />
              Card
            </button>

            <button
              onClick={() => setPaymentMode("UPI")}
              className={`rounded-lg border p-3 ${
                paymentMode === "UPI" ? "bg-purple-600 text-white" : ""
              }`}
            >
              <FaMobileAlt className="mx-auto mb-2" />
              UPI
            </button>
          </div>
        </div>

        {/* Customer Name */}

        <div>
          <label className="font-semibold">Customer Name / Walk-in</label>

          <input
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            placeholder="Walk-in"
            className="w-full mt-2 border rounded-lg p-3 outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Customer Mobile */}

        <div>
          <label className="font-semibold">Mobile Number</label>

          <input
            value={customerMobile}
            onChange={(e) => setCustomerMobile(e.target.value)}
            placeholder="e.g. 9876543210"
            className="w-full mt-2 border rounded-lg p-3 outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Customer Paid */}

        <div>
          <label className="font-semibold">Customer Paid</label>

          <input
            type="number"
            value={customerPaid}
            onChange={(e) => setCustomerPaid(e.target.value)}
            placeholder="Enter Amount"
            className="w-full mt-2 border rounded-lg p-3 outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Change */}

        {paid >= netAmount ? (
          <div className="bg-green-100 rounded-xl p-4">
            <h3 className="text-green-700 font-semibold">Change Return</h3>

            <p className="text-3xl font-bold">₹ {change}</p>
          </div>
        ) : (
          <div className="bg-red-100 rounded-xl p-4">
            <h3 className="text-red-700 font-semibold">Remaining Amount</h3>

            <p className="text-3xl font-bold">₹ {remaining}</p>
          </div>
        )}
      </div>

      {/* Footer */}
      <button
        onClick={handleHoldBill}
        className="w-full bg-yellow-600 hover:bg-yellow-700 text-white py-3 rounded-xl font-semibold"
      >
        Hold Bill
      </button>

      <div className="border-t p-5 space-y-3">
        <button
          onClick={handleCheckout}
          className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-xl font-semibold"
        >
          Checkout
        </button>
      </div>
    </div>
  );
}

function Row({ title, value, green }) {
  return (
    <div className="flex justify-between">
      <span>{title}</span>

      <span className={`font-semibold ${green ? "text-green-600" : ""}`}>
        ₹ {value}
      </span>
    </div>
  );
}

export default BillSummary;
