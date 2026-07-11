import { useState, useEffect } from "react";

import Navbar from "../components/Navbar";
import SearchBar from "../components/Searchbar";
import BillingTable from "../components/BillingTable";
import BillSummary from "../components/BillSummary";
import { previewBill } from "../services/ProductApi";

function POS() {
  const [cart, setCart] = useState([]);
  const [bill, setBill] = useState(null);

  useEffect(() => {
    if (cart.length === 0) {
      setBill(null);
      return;
    }

    calculateBill();
  }, [cart]);

  const calculateBill = async () => {
    try {
      const items = cart.map((item) => ({
        barcode: item.barcode,
        quantity: item.quantity,
      }));

      const response = await previewBill(items);

      setBill(response.data.bill);
    } catch (error) {
      console.log(error);
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
      <Navbar />

      <div className="flex flex-1 overflow-hidden">
        {/* LEFT */}

        <div className="w-[70%] p-4 flex flex-col gap-4">
          <SearchBar onProductScanned={handleProductScanned} />

          <BillingTable
            cart={cart}
            onIncrease={increaseQuantity}
            onDecrease={decreaseQuantity}
            onRemove={removeProduct}
          />
        </div>

        {/* RIGHT */}

        <div className="w-[30%] p-4">
          <BillSummary bill={bill} cart={cart} clearCart={() => setCart([])} />
        </div>
      </div>
    </div>
  );
}

export default POS;
