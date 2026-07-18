import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";

import Navbar from "../components/Navbar";
import SearchBar from "../components/Searchbar";
import BillingTable from "../components/BillingTable";
import BillSummary from "../components/BillSummary";
import { previewBill } from "../services/ProductApi";

function POS() {
  const [cart, setCart] = useState([]);
  const [bill, setBill] = useState(null);
  const [billError, setBillError] = useState("");
  const location = useLocation();

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
  }, [cart]);

  const calculateBill = async () => {
    try {
      const items = cart.map((item) => ({
        barcode: item.barcode,
        quantity: item.quantity,
        location: item.location,
      }));

      const response = await previewBill(items);

      setBill({
        ...response.data.bill,
        billNo: response.data.billNo,
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
        return prev.map((item) =>
          item.barcode === product.barcode
            ? {
                ...item,
                quantity: item.quantity + 1,
              }
            : item,
        );
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
    setCart((prev) =>
      prev.map((item) =>
        item.barcode === barcode
          ? {
              ...item,
              quantity: item.quantity + 1,
            }
          : item,
      ),
    );
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
      <Navbar billNo={bill?.billNo} />

      <div className="flex flex-1 overflow-hidden">
        {/* LEFT */}

        <div className="w-[70%] p-4 flex flex-col gap-4">
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

        <div className="w-[30%] p-4">
          <BillSummary 
            bill={bill} 
            cart={cart} 
            clearCart={() => setCart([])}
            clearBill={() => setBill(null)}
            resumeHoldBill={resumeHoldBill}
            clearResumeHoldBill={() => setResumeHoldBill(null)}
          />
        </div>
      </div>
    </div>
  );
}

export default POS;
