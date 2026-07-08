import {
  FaPlus,
  FaMinus,
  FaTrash,
} from "react-icons/fa";

function BillingRow({ item, cart, setCart }) {
  const increase = () => {
    setCart(
      cart.map((p) =>
        p.barcode === item.barcode
          ? {
              ...p,
              quantity: p.quantity + 1,
            }
          : p
      )
    );
  };

  const decrease = () => {
    if (item.quantity === 1) {
      remove();
      return;
    }

    setCart(
      cart.map((p) =>
        p.barcode === item.barcode
          ? {
              ...p,
              quantity: p.quantity - 1,
            }
          : p
      )
    );
  };

  const remove = () => {
    setCart(
      cart.filter(
        (p) => p.barcode !== item.barcode
      )
    );
  };

  return (
    <div className="grid grid-cols-12 gap-2 items-center border-b px-3 py-3 hover:bg-gray-50">

      {/* Product */}

      <div className="col-span-4 flex items-center gap-3">

        <img
          src={item.image}
          alt={item.name}
          className="w-12 h-12 rounded border object-cover"
        />

        <div>

          <h3 className="font-semibold">

            {item.name}

          </h3>

          <p className="text-xs text-gray-500">

            {item.color} {item.size}

          </p>

        </div>

      </div>

      {/* MRP */}

      <div className="text-center">

        ₹{item.mrp}

      </div>

      {/* Price */}

      <div className="text-center text-green-600 font-semibold">

        ₹{item.offerPrice}

      </div>

      {/* Qty */}

      <div className="flex justify-center items-center gap-2">

        <button
          onClick={decrease}
          className="bg-gray-200 rounded p-1"
        >
          <FaMinus size={10} />
        </button>

        <span>

          {item.quantity}

        </span>

        <button
          onClick={increase}
          className="bg-blue-600 text-white rounded p-1"
        >
          <FaPlus size={10} />
        </button>

      </div>

      {/* Discount */}

      <div className="text-center">

        ₹0

      </div>

      {/* Total */}

      <div className="text-center font-bold">

        ₹{item.offerPrice * item.quantity}

      </div>

      {/* Action */}

      <div className="col-span-2 flex justify-center">

        <button
          onClick={remove}
          className="bg-red-500 hover:bg-red-600 text-white rounded-lg p-2"
        >
          <FaTrash />
        </button>

      </div>

    </div>
  );
}

export default BillingRow;