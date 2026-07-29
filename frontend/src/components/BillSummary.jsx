import { useState, useEffect } from "react";
import { FaMoneyBillWave, FaCreditCard, FaMobileAlt, FaSearch, FaUserPlus, FaTag, FaStar } from "react-icons/fa";
import { saveBill } from "../services/billApi";
import { saveHoldBill, deleteHoldBill } from "../services/holdBillApi";
import { getCustomers, createOrUpdateCustomer } from "../services/customerApi";

function BillSummary({ bill, cart, clearCart, clearBill, resumeHoldBill, clearResumeHoldBill, customerId, setCustomerId, couponCode, setCouponCode }) {
  const [paymentMode, setPaymentMode] = useState("Cash");
  const [customerName, setCustomerName] = useState("");
  const [customerMobile, setCustomerMobile] = useState("");
  const [customerPaid, setCustomerPaid] = useState("");
  const [customerData, setCustomerData] = useState(null); // Full customer object
  const [isSearchingCustomer, setIsSearchingCustomer] = useState(false);
  const [showNewCustomerForm, setShowNewCustomerForm] = useState(false);
  const [couponInput, setCouponInput] = useState("");

  useEffect(() => {
    if (customerMobile && customerMobile.trim().length === 10) {
      handleCustomerSearch();
    }
  }, [customerMobile]);

  useEffect(() => {
    if (resumeHoldBill) {
      setCustomerName(resumeHoldBill.customerName || "");
      setCustomerMobile(resumeHoldBill.customerMobile || "");
      setPaymentMode(resumeHoldBill.paymentMode || "Cash");
      setCustomerPaid(resumeHoldBill.customerPaid || "");
      if (resumeHoldBill.customerId && setCustomerId) {
        setCustomerId(resumeHoldBill.customerId);
      }
    }
  }, [resumeHoldBill, setCustomerId]);

  // Values from backend
  const grossAmount = bill?.grossAmount || 0;
  const discount = bill?.discount || 0;
  const gst = bill?.gst || 0;
  const netAmount = bill?.netAmount || 0;

  // Payment calculation
  const paid = Number(customerPaid || 0);

  const change = paid >= netAmount ? paid - netAmount : 0;

  const remaining = paid < netAmount ? netAmount - paid : 0;

  const canSubmitBill = Boolean(bill?.items?.length);

  // Handle Hold Bill
  const handleHoldBill = async () => {
    if (!canSubmitBill) {
      alert("Cart is empty");
      return;
    }

    try {
      const res = await saveHoldBill({
        customerName: customerName.trim() || "Walk-in",
        customerMobile: customerMobile.trim(),
        customerId,
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
        billNo: bill?.billNo || resumeHoldBill?.billNo,
        appliedOffers: bill?.appliedOffers || [],
        totalSavings: bill?.totalSavings || bill?.savings || 0,
        paymentMode,
        customerPaid: Number(customerPaid),
        changeReturned: Number(customerPaid) - bill.netAmount,
      });

      if (res?.data?.success) {
        if (resumeHoldBill && resumeHoldBill._id) {
            await deleteHoldBill(resumeHoldBill._id);
        }
        alert(res.data.message || "Bill placed on hold successfully.");

        clearCart();
        clearBill();
        setCustomerName("");
        setCustomerMobile("");
        setCustomerPaid("");
        setPaymentMode("Cash");
        if (clearResumeHoldBill) clearResumeHoldBill();
      } else {
        alert(res?.data?.message || "Unable to hold bill");
      }
    } catch (err) {
      console.log(err);
      alert(err?.response?.data?.message || "Unable to hold bill");
    }
  };

  // Handle Checkout

  const handleCheckout = async () => {
    if (!canSubmitBill) {
      alert("No items in cart.");
      return;
    }

    const paidAmount = Number(customerPaid);

    if (!customerPaid || Number.isNaN(paidAmount)) {
      alert("Please enter a valid paid amount.");
      return;
    }

    if (paidAmount < netAmount) {
      alert(`Paid amount must be at least ₹${netAmount}.`);
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
        customerId,
        appliedOffers: bill?.appliedOffers || [],
        totalSavings: bill?.totalSavings || bill?.savings || 0,
        paymentMode,
        customerPaid: paidAmount,
        changeReturned: paidAmount - bill.netAmount,
      });

      if (response?.data?.success) {
        if (resumeHoldBill && resumeHoldBill._id) {
            await deleteHoldBill(resumeHoldBill._id);
        }
        alert(response.data.message || "Bill saved successfully.");

        clearCart();
        clearBill();
        setCustomerName("");
        setCustomerMobile("");
        setCustomerPaid("");
        setPaymentMode("Cash");
        setCustomerData(null);
        setShowNewCustomerForm(false);
        setCouponInput("");
        if (clearResumeHoldBill) clearResumeHoldBill();
      } else {
        alert(response?.data?.message || "Unable to save bill.");
      }
    } catch (error) {
      console.log(error);
      alert(error?.response?.data?.message || "Unable to save bill.");
    }
  };

  const handleCustomerSearch = async () => {
    if (!customerMobile.trim()) return;
    try {
      setIsSearchingCustomer(true);
      const res = await getCustomers("", customerMobile);
      const cust = res.data.customers?.[0];
      if (cust) {
        setCustomerData(cust);
        setCustomerName(cust.username);
        if (setCustomerId) setCustomerId(cust._id);
        setShowNewCustomerForm(false);
      } else {
        setCustomerData(null);
        if (setCustomerId) setCustomerId(null);
        setShowNewCustomerForm(true);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSearchingCustomer(false);
    }
  };

  const handleCreateCustomer = async () => {
    try {
      const res = await createOrUpdateCustomer({
        contactNo: customerMobile,
        username: customerName
      });
      setCustomerData(res.data.customer);
      if (setCustomerId) setCustomerId(res.data.customer._id);
      setShowNewCustomerForm(false);
    } catch (err) {
      alert("Failed to create customer");
    }
  };

  const applyCoupon = () => {
    if (setCouponCode) setCouponCode(couponInput);
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

      <div className="flex-1 p-5 space-y-4 overflow-y-auto max-h-[50vh]">
        <Row title="Subtotal" value={bill?.subtotal || 0} />
        
        {bill?.appliedOffers && bill.appliedOffers.length > 0 && (
          <div className="bg-indigo-50 border border-indigo-100 p-3 rounded-lg">
            <p className="text-xs font-bold text-indigo-800 uppercase tracking-wider mb-2">Applied Offers</p>
            {bill.appliedOffers.map((o, idx) => (
              <div key={idx} className="flex justify-between text-sm text-indigo-700 mb-1">
                <span><FaTag className="inline mr-1"/> {o.name}</span>
                {o.discountAmount > 0 && <span className="font-bold">-₹{o.discountAmount.toFixed(2)}</span>}
                {o.freeProductId && <span className="font-bold">FREE ITEM</span>}
              </div>
            ))}
          </div>
        )}

        <Row title="Total Savings" value={bill?.totalSavings || 0} green />

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

        {/* Coupon Code */}
        <div>
          <label className="font-semibold text-sm">Coupon Code</label>
          <div className="flex mt-1">
            <input
              value={couponInput}
              onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
              placeholder="e.g. WELCOME100"
              className="w-full border rounded-l-lg p-2 outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm uppercase"
            />
            <button onClick={applyCoupon} className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 rounded-r-lg font-medium text-sm transition">
              Apply
            </button>
          </div>
          {bill?.appliedOffers?.some(o => o.code && couponCode && o.code.toUpperCase() === couponCode.toUpperCase()) && !bill?.couponError && <p className="text-xs text-green-600 mt-1 font-medium">Applied: {couponCode}</p>}
          {bill?.couponError && <p className="text-xs text-red-600 mt-1 font-medium">{bill.couponError}</p>}
        </div>

        <hr />

        {/* Customer Section */}
        <div>
          <label className="font-semibold text-sm">Customer Mobile </label>
          <div className="flex mt-1 mb-3">
            <input
              value={customerMobile}
              onChange={(e) => setCustomerMobile(e.target.value)}
              placeholder="e.g. 9876543210"
              className="w-full border rounded-l-lg p-2 outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
            <button onClick={handleCustomerSearch} disabled={isSearchingCustomer} className="bg-slate-200 hover:bg-slate-300 text-slate-700 px-4 rounded-r-lg font-medium transition">
              <FaSearch />
            </button>
          </div>

          <label className="font-semibold text-sm">Customer Name</label>
          <input
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            placeholder="Walk-in Customer"
            className="w-full mt-1 border rounded-lg p-2 outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          />
        </div>

        {customerData && (
          <div className="bg-blue-50 border border-blue-100 p-3 rounded-lg text-sm mt-3">
            <div className="flex justify-between items-center mb-1">
              <span className="font-bold text-blue-800">{customerData.username}</span>
              {customerData.isFrequent && <FaStar className="text-amber-500" title="Frequent Customer" />}
            </div>
            <div className="flex justify-between text-blue-600 text-xs">
              <span>Visits: {customerData.totalVisits}</span>
              <span>Spent: ₹{customerData.totalSpent?.toFixed(2)}</span>
            </div>
          </div>
        )}

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
      <div className="border-t p-5  space-x-2.5 flex">

        <button
        onClick={handleHoldBill}
        className="w-1/2 bg-yellow-600 hover:bg-yellow-700 text-white py-3 rounded-xl font-semibold"
      >
        Hold Bill
      </button>

        <button
          onClick={handleCheckout}
          className="w-1/2 bg-green-600 hover:bg-green-700 text-white py-3 rounded-xl font-semibold"
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
