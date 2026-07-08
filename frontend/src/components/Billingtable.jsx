import BillingRow from "./BillingRow";

function BillingTable({ cart, setCart }) {
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  const totalQty = cart.reduce((sum, item) => sum + item.quantity, 0);

  const grandTotal = cart.reduce(
    (sum, item) => sum + item.offerPrice * item.quantity,
    0
  );

  return (
    <div className="bg-white rounded-xl shadow h-full flex flex-col">

      {/* Header */}
      <div className="bg-blue-600 text-white grid grid-cols-12 gap-2 p-3 font-semibold rounded-t-xl">

        <div className="col-span-4">Product</div>

        <div className="text-center">MRP</div>

        <div className="text-center">Price</div>

        <div className="text-center">Qty</div>

        <div className="text-center">Discount</div>

        <div className="text-center">Total</div>

        <div className="text-center col-span-2">
          Action
        </div>

      </div>

      {/* Rows */}

      <div className="flex-1 overflow-y-auto">

        {cart.length === 0 ? (
          <div className="flex items-center justify-center h-80 text-gray-400 text-xl">

            Scan barcode to add products

          </div>
        ) : (
          cart.map((item) => (
            <BillingRow
              key={item.barcode}
              item={item}
              cart={cart}
              setCart={setCart}
            />
          ))
        )}

      </div>

      {/* Footer */}

      <div className="border-t bg-gray-50 p-4 rounded-b-xl">

        <div className="flex justify-between text-lg">

          <span>

            Total Items :
            <b className="ml-2">{totalItems}</b>

          </span>

          <span>

            Total Qty :
            <b className="ml-2">{totalQty}</b>

          </span>

          <span className="text-2xl font-bold text-blue-600">

            ₹ {grandTotal}

          </span>

        </div>

      </div>

    </div>
  );
}

export default BillingTable;