import { useEffect, useRef, useState } from "react";
import { FaBarcode, FaSearch } from "react-icons/fa";
import { api } from "../services/ProductApi";

function SearchBar({ onProductScanned }) {
  const inputRef = useRef(null);

  const [barcode, setBarcode] = useState("");
  const [loading, setLoading] = useState(false);

  // Always focus barcode input
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const scanProduct = async () => {
    if (!barcode.trim()) return;

    try {
      setLoading(true);

      const { data } = await api.get(
        `/scan/${barcode.trim()}`
      );

      if (data.success) {
        onProductScanned(data.scannedVariant);
      }

      setBarcode("");

      inputRef.current.focus();
    } catch (err) {
      alert(
        err.response?.data?.message ||
          "Product not found"
      );

      inputRef.current.focus();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow p-5">

      <div className="flex items-center gap-4">

        <div className="relative flex-1">

          <FaSearch
            className="absolute left-4 top-4 text-gray-400"
          />

          <input
            ref={inputRef}
            type="text"
            value={barcode}
            placeholder="Scan Barcode / Search Product..."
            onChange={(e) =>
              setBarcode(e.target.value)
            }
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                scanProduct();
              }
            }}
            className="w-full pl-12 pr-5 py-3 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
          />

        </div>

        <button
          onClick={scanProduct}
          disabled={loading}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl flex items-center gap-2"
        >
          <FaBarcode />

          {loading ? "Searching..." : "Scan"}
        </button>

      </div>

    </div>
  );
}

export default SearchBar;