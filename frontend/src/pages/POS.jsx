import { useState } from "react";

import Navbar from "../components/Navbar";
import SearchBar from "../components/SearchBar";
import BillingTable from "../components/BillingTable";
import BillSummary from "../components/BillSummary";

function POS() {
  const [cart, setCart] = useState([]);

  const handleProductScanned = (product) => {

    setCart((prev) => {

        const existing = prev.find(
            (item) =>
                item.barcode === product.barcode
        );

        if (existing) {

            return prev.map((item) =>
                item.barcode === product.barcode
                    ? {
                          ...item,
                          quantity:
                              item.quantity + 1,
                      }
                    : item
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

  return (
    <div className="h-screen bg-slate-100 flex flex-col">

      <Navbar />

      <div className="flex flex-1 overflow-hidden">

        {/* LEFT */}

        <div className="w-[70%] p-4 flex flex-col gap-4">

          <SearchBar
    onProductScanned={handleProductScanned}
/>

          <BillingTable
            cart={cart}
            setCart={setCart}
          />

        </div>

        {/* RIGHT */}

        <div className="w-[30%] p-4">

          <BillSummary
            cart={cart}
          />

        </div>

      </div>

    </div>
  );
}

export default POS;