import {
  FaTrash,
  FaPlus,
  FaMinus,
} from "react-icons/fa";

function BillingRow({
  item,
  onIncrease,
  onDecrease,
  onRemove,
}) {
  const total = item.offerPrice * item.quantity;

  return (
    <tr className="border-b hover:bg-slate-50 transition">

      {/* Product */}

      <td className="px-4 py-3">

        <div className="flex items-center gap-3">

          <img
            src={item.image}
            alt={item.name}
            className="w-14 h-14 rounded-lg border object-cover"
          />

          <div>

            <h3 className="font-semibold text-gray-800">
              {item.name}
            </h3>

            <p className="text-xs text-gray-500">
              {item.barcode}
            </p>

            <div className="flex gap-2 text-xs text-gray-500 mt-1">

              {item.color && (
                <span>{item.color}</span>
              )}

              {item.size && (
                <span>| {item.size}</span>
              )}

              {item.location && (item.location.section || item.location.rack || item.location.shelf || item.location.bin) && (
                <span className="text-blue-600 font-medium">
                  | Location: {[
                    item.location.section && `Section ${item.location.section}`,
                    item.location.rack && `Rack ${item.location.rack}`,
                    item.location.shelf && `Shelf ${item.location.shelf}`,
                    item.location.bin && `Bin ${item.location.bin}`
                  ].filter(Boolean).join(" → ")}
                </span>
              )}

            </div>

          </div>

        </div>

      </td>

      {/* MRP */}

      <td className="text-center font-medium">

        ₹{item.mrp}

      </td>

      {/* Selling Price */}

      <td className="text-center">

        <input
          value={item.offerPrice}
          readOnly
          className="w-20 border rounded-lg text-center py-1"
        />

      </td>

      {/* Quantity */}

      <td>

        <div className="flex justify-center items-center gap-2">

          <button
            onClick={() => onDecrease(item.barcode)}
            className="bg-red-100 hover:bg-red-200 w-8 h-8 rounded-full"
          >
            <FaMinus
              className="mx-auto"
              size={12}
            />
          </button>

          <span className="font-bold w-8 text-center">

            {item.quantity}

          </span>

          <button
            onClick={() => onIncrease(item.barcode)}
            className="bg-green-100 hover:bg-green-200 w-8 h-8 rounded-full"
          >
            <FaPlus
              className="mx-auto"
              size={12}
            />
          </button>

        </div>

      </td>

      {/* Discount */}

      <td className="text-center">

        ₹0

      </td>

      {/* Total */}

      <td className="text-center font-bold text-blue-700">

        ₹{total}

      </td>

      {/* Delete */}

      <td className="text-center">

        <button
          onClick={() => onRemove(item.barcode)}
          className="bg-red-500 hover:bg-red-600 text-white w-9 h-9 rounded-lg"
        >
          <FaTrash className="mx-auto" />
        </button>

      </td>

    </tr>
  );
}

export default BillingRow;