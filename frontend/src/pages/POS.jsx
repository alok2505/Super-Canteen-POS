import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";

import Navbar from "../components/Navbar";
import SearchBar from "../components/Searchbar";
import BillingTable from "../components/BillingTable";
import BillSummary from "../components/BillSummary";
import ReturnMode from "../components/POS/ReturnMode";
import { previewBill } from "../services/billApi";

function POS() {
  const [cart, setCart] = useState([]);
  const [bill, setBill] = useState(null);
  const [billError, setBillError] = useState("");
  const [customerId, setCustomerId] = useState(null);
  const [couponCode, setCouponCode] = useState("");
  const location = useLocation();

  const [activeTab, setActiveTab] = useState("Billing");
  const user = JSON.parse(localStorage.getItem("user") || "null");
  const canReturn = user?.role === "Admin" || user?.role === "StoreManager" || user?.role === "InventoryStaff";

  const [resumeHoldBill, setResumeHoldBill] = useState(null);

  useEffect(() => {
    if (location.state?.resumeHoldBill) {
      const holdBill = location.state.resumeHoldBill;
      setResumeHoldBill(holdBill);
      if (holdBill.items && holdBill.items.length > 0) {
        setCart(holdBill.items.map(item => ({
          ...item,
          quantity: item.quantity || 1
        })));
      }
      // Clear state so we don't reload it on refresh
      window.history.replaceState({}, document.title)
    }
  }, [location]);

  useEffect(() => {
    if (cart.length === 0) {
      setBill(null);
      setBillError("");
      return;
    }

    calculateBill();
  }, [cart, customerId, couponCode]);

  const calculateBill = async () => {
    try {
      const items = cart.map((item) => ({
        barcode: item.barcode,
        quantity: item.quantity,
        location: item.location,
        sellingPrice: item.offerPrice ?? item.sellingPrice ?? 0,
        mrp: item.mrp,
        name: item.name,
        productId: item.productId || item._id,
      }));

      const response = await previewBill({
        items,
        customerId,
        couponCode
      });

      setBill({
        ...response.data,
        billNo: response.data.billNo || "Pending",
      });
    } catch (error) {
      console.log(error);
      setBill(null);
      setBillError(error.response?.data?.message || "Unable to calculate the bill. Please check the product stock.");
    }
  };

  const handleProductScanned = (product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.barcode === product.barcode);

      if (existing) {
        if (existing.quantity >= product.countInStock) {
          alert(`Cannot add more. Only ${product.countInStock} left in stock for ${product.name}`);
          return prev;
        }
        return prev.map((item) =>
          item.barcode === product.barcode
            ? {
                ...item,
                quantity: item.quantity + 1,
              }
            : item,
        );
      }

      if (product.countInStock <= 0) {
        alert(`Product ${product.name} is out of stock!`);
        return prev;
      }

      return [
        ...prev,
        {
          ...product,
          quantity: 1,
        },
      ];
    });
  };

  const increaseQuantity = (barcode) => {
    setCart((prev) => {
      const existingItem = prev.find((i) => i.barcode === barcode);
      if (existingItem && existingItem.quantity >= existingItem.countInStock) {
        alert(`Cannot add more. Only ${existingItem.countInStock} left in stock for ${existingItem.name}`);
        return prev;
      }
      return prev.map((item) =>
        item.barcode === barcode
          ? {
              ...item,
              quantity: item.quantity + 1,
            }
          : item,
      );
    });
  };

  const decreaseQuantity = (barcode) => {
    setCart((prev) =>
      prev
        .map((item) =>
          item.barcode === barcode
            ? {
                ...item,
                quantity: item.quantity - 1,
              }
            : item,
        )
        .filter((item) => item.quantity > 0),
    );
  };

  const removeProduct = (barcode) => {
    setCart((prev) => prev.filter((item) => item.barcode !== barcode));
  };

  return (
    <div className="h-screen bg-slate-100 flex flex-col">
      <Navbar billNo={bill?.billNo && bill.billNo !== "Pending" ? bill.billNo : "New Bill"} />

      {canReturn && (
        <div className="bg-white border-b px-6 flex gap-6 shrink-0">
          <button 
            className={`py-3 px-2 border-b-2 font-medium text-sm transition-colors ${activeTab === 'Billing' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
            onClick={() => setActiveTab('Billing')}
          >
            Billing
          </button>
          <button 
            className={`py-3 px-2 border-b-2 font-medium text-sm transition-colors ${activeTab === 'Returns' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
            onClick={() => setActiveTab('Returns')}
          >
            Returns
          </button>
        </div>
      )}

      <div className="flex flex-1 overflow-hidden p-4">
        {activeTab === "Billing" ? (
          <>
            {/* LEFT */}
            <div className="w-[70%] flex flex-col gap-4 pr-4 border-r border-slate-200">
              <SearchBar onProductScanned={handleProductScanned} />

              {billError && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {billError}
                </div>
              )}

              <BillingTable
                cart={cart}
                onIncrease={increaseQuantity}
                onDecrease={decreaseQuantity}
                onRemove={removeProduct}
              />
            </div>

            {/* RIGHT */}
            <div className="w-[30%] pl-4">
              <BillSummary 
                bill={bill} 
                cart={cart} 
                clearCart={() => setCart([])}
                clearBill={() => { setBill(null); setCustomerId(null); setCouponCode(""); }}
                resumeHoldBill={resumeHoldBill}
                clearResumeHoldBill={() => setResumeHoldBill(null)}
                customerId={customerId}
                setCustomerId={setCustomerId}
                couponCode={couponCode}
                setCouponCode={setCouponCode}
              />
            </div>
          </>
        ) : (
          <ReturnMode />
        )}
      </div>
    </div>
  );
}

export default POS;
