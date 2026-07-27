import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { getBillById } from "../services/billApi";
import { getReturnsByBillId } from "../services/returnApi";
import { FaArrowLeft, FaPrint, FaReceipt, FaUndo } from "react-icons/fa";

function BillDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [bill, setBill] = useState(null);
    const [returns, setReturns] = useState([]);
    const [showReturns, setShowReturns] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadBill();
    }, [id]);

    const loadBill = async () => {
        try {
            const res = await getBillById(id);
            setBill(res.data.bill);
            if (res.data.bill.status && res.data.bill.status !== "Completed") {
                const retRes = await getReturnsByBillId(id);
                setReturns(retRes.data.returns || []);
            }
        } catch (error) {
            console.error("Failed to fetch bill", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen bg-slate-50">
                <div className="text-xl text-slate-500 font-semibold animate-pulse">Loading Bill Details...</div>
            </div>
        );
    }

    if (!bill) {
        return (
            <div className="flex flex-col justify-center items-center h-screen bg-slate-50 py-20">
                <h2 className="text-2xl font-bold text-slate-600 mb-4">Bill not found</h2>
                <button onClick={() => navigate("/bills")} className="text-blue-500 hover:underline flex items-center justify-center gap-2">
                    <FaArrowLeft /> Back to Bills
                </button>
            </div>
        );
    }

    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="min-h-screen bg-slate-100 p-4 md:p-8 pb-24">
            {/* Header */}
            <div className="mb-6 max-w-4xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <button 
                        onClick={() => navigate("/bills")}
                        className="p-3 bg-white rounded-full shadow-sm hover:bg-slate-50 hover:shadow transition"
                    >
                        <FaArrowLeft className="text-slate-600" />
                    </button>
                    <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-2">
                        <FaReceipt className="text-blue-500" /> Bill Details
                    </h1>
                </div>
                <div className="flex gap-2 w-full md:w-auto">
                    {bill.status && bill.status !== "Completed" && (
                        <button 
                            onClick={() => setShowReturns(!showReturns)}
                            className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white px-6 py-2.5 rounded-lg font-medium shadow-md transition justify-center cursor-pointer"
                        >
                            <FaUndo /> {showReturns ? "Hide Returns" : "View Returns"}
                        </button>
                    )}
                    <button 
                        onClick={handlePrint}
                        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg font-medium shadow-md transition justify-center cursor-pointer"
                    >
                        <FaPrint /> Print Bill
                    </button>
                </div>
            </div>

            {showReturns && returns.length > 0 && (
                <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden max-w-4xl mx-auto mb-6 p-6">
                    <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2"><FaUndo className="text-amber-500" /> Return History</h2>
                    <div className="space-y-4">
                        {returns.map(ret => (
                            <div key={ret._id} className="bg-slate-50 border border-slate-200 p-4 rounded-lg">
                                <div className="flex justify-between items-center border-b pb-2 mb-2">
                                    <span className="font-bold text-slate-700">Return ID: {ret.returnNo}</span>
                                    <span className="text-sm text-slate-500">{new Date(ret.createdAt).toLocaleString()}</span>
                                </div>
                                <div className="mb-2">
                                    <span className="text-sm text-slate-500">Refund: </span>
                                    <span className="font-bold text-emerald-600">₹{ret.refundAmount.toFixed(2)}</span>
                                    <span className="text-sm text-slate-500 ml-2">({ret.refundMethod})</span>
                                </div>
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="text-left text-slate-500">
                                            <th>Item</th>
                                            <th>Qty</th>
                                            <th>Reason</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {ret.items.map(item => (
                                            <tr key={item._id} className="border-t border-slate-100">
                                                <td className="py-1 font-medium">{item.name}</td>
                                                <td className="py-1 text-red-500 font-bold">{item.returnedQty}</td>
                                                <td className="py-1 text-slate-600">{item.reason}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Bill Content - Printable Area */}
            <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden max-w-4xl mx-auto print:shadow-none print:border-none printable-bill">
                
                {/* Bill Header Info */}
                <div className="bg-slate-50 p-6 md:p-8 border-b border-slate-200 flex flex-col md:flex-row justify-between gap-6 print:bg-transparent">
                    <div>
                        <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-1">Bill Number</h2>
                        <div className="flex items-center gap-3">
                            <p className="text-2xl font-bold text-slate-800">{bill.billNo || "N/A"}</p>
                            {bill.status && bill.status !== "Completed" && (
                                <span className="px-2 py-1 bg-amber-100 text-amber-700 text-xs font-bold rounded-full">{bill.status}</span>
                            )}
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-x-6 gap-y-4">
                        <div>
                            <p className="text-sm text-slate-500 mb-1">Date</p>
                            <p className="font-medium text-slate-800 whitespace-nowrap">{new Date(bill.createdAt).toLocaleDateString()}</p>
                            <p className="text-xs text-slate-500">{new Date(bill.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                        </div>
                        <div>
                            <p className="text-sm text-slate-500 mb-1">Customer</p>
                            <p className="font-medium text-slate-800">{bill.customerName || "Walk-in"}</p>
                        </div>
                        <div>
                            <p className="text-sm text-slate-500 mb-1">Mobile</p>
                            <p className="font-medium text-slate-800">{bill.customerMobile || "N/A"}</p>
                        </div>
                        <div>
                            <p className="text-sm text-slate-500 mb-1">Payment Mode</p>
                            <p className="font-medium flex items-center gap-1.5 text-slate-800">
                                <span className={`inline-block w-2 h-2 rounded-full ${bill.paymentMode === 'Cash' ? 'bg-green-500' : 'bg-blue-500'}`}></span>
                                {bill.paymentMode || "N/A"}
                            </p>
                        </div>
                        <div>
                            <p className="text-sm text-slate-500 mb-1">Cashier</p>
                            <p className="font-medium text-slate-800">{bill.cashier || "Admin"}</p>
                        </div>
                    </div>
                </div>

                {/* Items Table */}
                <div className="p-6 md:p-8 overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b-2 border-slate-100 text-slate-500 text-sm tracking-wide">
                                <th className="py-3 font-semibold w-12">#</th>
                                <th className="py-3 font-semibold">ITEM DETAILS</th>
                                <th className="py-3 font-semibold text-center w-24">QTY</th>
                                <th className="py-3 font-semibold text-right w-28">MRP</th>
                                <th className="py-3 font-semibold text-right w-28">PRICE</th>
                                <th className="py-3 font-semibold text-right w-32">TOTAL</th>
                            </tr>
                        </thead>
                        <tbody>
                            {(bill.items || []).map((item, index) => (
                                <tr key={index} className="border-b border-slate-50 hover:bg-slate-50/70 transition group">
                                    <td className="py-4 text-slate-400 group-hover:text-slate-600">{index + 1}</td>
                                    <td className="py-4">
                                        <p className="font-medium text-slate-800">{item.name} {item.isFree && <span className="text-xs bg-emerald-100 text-emerald-700 font-bold px-2 py-0.5 rounded ml-2">FREE</span>}</p>
                                        {item.barcode && <p className="text-xs text-slate-400 mt-0.5">BC: {item.barcode}</p>}
                                        {item.location && (item.location.section || item.location.rack || item.location.shelf || item.location.bin) && (
                                            <p className="text-xs text-blue-600 mt-0.5 font-medium">
                                                Loc: {[
                                                    item.location.section && `Section ${item.location.section}`,
                                                    item.location.rack && `Rack ${item.location.rack}`,
                                                    item.location.shelf && `Shelf ${item.location.shelf}`,
                                                    item.location.bin && `Bin ${item.location.bin}`
                                                ].filter(Boolean).join(" → ")}
                                            </p>
                                        )}
                                    </td>
                                    <td className="py-4 text-center font-medium text-slate-700">{item.quantity}</td>
                                    <td className="py-4 text-right text-slate-400 line-through">₹{item.mrp?.toFixed(2) || "0.00"}</td>
                                    <td className="py-4 text-right font-medium text-slate-700">
                                        {item.isFree || item.sellingPrice === 0 ? "₹0.00" : `₹${item.sellingPrice?.toFixed(2) || item.mrp?.toFixed(2) || "0.00"}`}
                                    </td>
                                    <td className="py-4 text-right font-bold text-slate-800">
                                        {item.isFree || item.sellingPrice === 0 ? "₹0.00" : `₹${item.total?.toFixed(2) || ((item.quantity || 1) * (item.sellingPrice || item.mrp || 0)).toFixed(2)}`}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Bill Summary */}
                <div className="bg-slate-50 p-6 md:p-8 flex flex-col md:flex-row justify-between items-start gap-8 border-t border-slate-200 print:bg-transparent">
                    
                    {/* Summary Info (Left) */}
                    <div className="w-full md:w-1/2 space-y-5">
                        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                            <h3 className="font-semibold text-slate-700 mb-3 border-b border-slate-100 pb-2 flex items-center gap-2">
                                Payment Summary
                            </h3>
                            <div className="flex justify-between mb-2 text-sm">
                                <span className="text-slate-500">Customer Paid:</span>
                                <span className="font-medium text-slate-800">₹{bill.customerPaid?.toFixed(2) || bill.netAmount?.toFixed(2) || "0.00"}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-slate-500">Change Returned:</span>
                                <span className="font-medium text-slate-800">₹{bill.changeReturned?.toFixed(2) || "0.00"}</span>
                            </div>
                        </div>

                        <div className="flex items-center gap-8 text-sm text-slate-500 px-2 bg-slate-100/50 p-3 rounded-lg border border-slate-100">
                            <p><strong className="text-slate-700 font-semibold">Items:</strong> {bill.totalItems || bill.items?.length || 0}</p>
                            <p><strong className="text-slate-700 font-semibold">Total Qty:</strong> {bill.totalQuantity || bill.items?.reduce((acc, curr) => acc + (curr.quantity || 0), 0) || 0}</p>
                        </div>
                    </div>

                    {/* Cost Breakdown (Right) */}
                    <div className="w-full md:w-1/3 space-y-3.5">
                        <div className="flex justify-between text-slate-500">
                            <span>Gross Amount</span>
                            <span className="font-medium text-slate-800">₹{bill.grossAmount?.toFixed(2) || "0.00"}</span>
                        </div>
                        
                        {((bill.discount || 0) + (bill.couponDiscount || 0)) > 0 && (
                            <div className="flex justify-between text-red-500">
                                <span>Discount</span>
                                <span className="font-medium">-₹{((bill.discount || 0) + (bill.couponDiscount || 0)).toFixed(2)}</span>
                            </div>
                        )}
                        
                        {bill.appliedOffers && bill.appliedOffers.length > 0 && (
                            <div className="border-t border-slate-100 pt-2 mt-2">
                                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">Applied Offers</span>
                                {bill.appliedOffers.map((offer, idx) => (
                                    <div key={idx} className="flex justify-between text-indigo-600 text-sm mb-0.5">
                                        <span>{offer.name}</span>
                                        {offer.discountAmount > 0 && <span className="font-medium">-₹{offer.discountAmount.toFixed(2)}</span>}
                                        {offer.freeProductId && <span className="font-medium uppercase">Free Item</span>}
                                    </div>
                                ))}
                            </div>
                        )}
                        
                        {(bill.totalSavings > 0 || bill.savings > 0) && (
                            <div className="flex justify-between text-emerald-600 text-sm border-t border-slate-100 pt-2 mt-2">
                                <span>Total Savings</span>
                                <span className="font-medium">₹{(bill.totalSavings || bill.savings)?.toFixed(2)}</span>
                            </div>
                        )}
                        
                        {bill.gst > 0 && (
                            <div className="flex justify-between text-slate-500">
                                <span>GST / Taxes</span>
                                <span className="font-medium text-slate-800">₹{bill.gst?.toFixed(2)}</span>
                            </div>
                        )}

                        <div className="border-t-2 border-slate-200 pt-4 mt-2 flex justify-between items-center">
                            <span className="text-lg font-bold text-slate-800 tracking-tight">Net Amount</span>
                            <span className="text-3xl font-bold text-blue-600">₹{bill.netAmount?.toFixed(2) || "0.00"}</span>
                        </div>
                    </div>
                </div>

            </div>
            
            {/* Print Styles */}
            <style>{`
                @media print {
                    body * {
                        visibility: hidden;
                    }
                    .printable-bill, .printable-bill * {
                        visibility: visible;
                    }
                    .printable-bill {
                        position: absolute;
                        left: 0;
                        top: 0;
                        width: 100%;
                        margin: 0;
                        padding: 20px;
                        box-shadow: none !important;
                        border: none !important;
                    }
                    .print\\:bg-transparent {
                        background-color: transparent !important;
                    }
                    .text-blue-600 {
                        color: #2563eb !important;
                        -webkit-print-color-adjust: exact;
                        print-color-adjust: exact;
                    }
                    .bg-white {
                        background-color: #ffffff !important;
                        -webkit-print-color-adjust: exact;
                        print-color-adjust: exact;
                    }
                    .bg-slate-50 {
                        background-color: #f8fafc !important;
                        -webkit-print-color-adjust: exact;
                        print-color-adjust: exact;
                    }
                }
            `}</style>
        </div>
    );
}

export default BillDetails;