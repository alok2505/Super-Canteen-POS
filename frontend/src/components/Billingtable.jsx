import BillingRow from "./BillingRow";

function BillingTable({
  cart,
  onIncrease,
  onDecrease,
  onRemove,
}) {
  return (
    <div className="bg-white rounded-xl shadow overflow-hidden">

      <table className="w-full">

        <thead className="bg-blue-600 text-white">
          <tr>
            <th className="p-3 text-left">Product</th>
            <th className="p-3">MRP</th>
            <th className="p-3">Price</th>
            <th className="p-3">Qty</th>
            <th className="p-3">Discount</th>
            <th className="p-3">Total</th>
            <th className="p-3">Action</th>
          </tr>
        </thead>

        <tbody>
          {cart.length === 0 ? (
            <tr>
              <td
                colSpan={7}
                className="text-center py-10 text-gray-500"
              >
                Scan a barcode to add products
              </td>
            </tr>
          ) : (
            cart.map((item) => (
              <BillingRow
                key={item.barcode}
                item={item}
                onIncrease={onIncrease}
                onDecrease={onDecrease}
                onRemove={onRemove}
              />
            ))
          )}
        </tbody>

      </table>

    </div>
  );
}

export default BillingTable;