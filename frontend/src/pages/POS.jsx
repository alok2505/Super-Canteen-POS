import { useState } from "react";
import Navbar from "../components/Navbar";
import BarcodeInput from "../components/BarcodeInput";
import ProductDetails from "../components/ProductDetails";
import Cart from "../components/Cart";

function POS() {
  const [cart, setCart] = useState([]);
  const [lastScanned, setLastScanned] = useState(null);

  const handleProductScanned = (product) => {
    // Show product details
    setLastScanned(product);

    // Add to cart
    setCart((prevCart) => {
      const existing = prevCart.find(
        (item) => item.barcode === product.barcode
      );

      if (existing) {
        return prevCart.map((item) =>
          item.barcode === product.barcode
            ? {
                ...item,
                quantity: item.quantity + 1,
              }
            : item
        );
      }

      return [
        ...prevCart,
        {
          ...product,
          quantity: 1,
        },
      ];
    });
  };

  return (
    <>
      <Navbar />

      <div className="bg-slate-100 min-h-[calc(100vh-64px)] p-5">

        <div className="grid grid-cols-12 gap-5">

          {/* LEFT */}

          <div className="col-span-8 space-y-5">

            <BarcodeInput
              onProductScanned={handleProductScanned}
            />

            <ProductDetails
              product={lastScanned}
            />

          </div>

          {/* RIGHT */}

          <div className="col-span-4">

            <Cart
              cart={cart}
              setCart={setCart}
            />

          </div>

        </div>

      </div>
    </>
  );
}

export default POS;