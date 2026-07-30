import React from 'react';
import { usePrinter } from '../hooks/usePrinter';

const PrinterSettings = () => {
  const {
    printers,
    selectedPrinter,
    handleSelectPrinter,
    fetchPrinters,
    handleTestPrint,
    loading,
    error
  } = usePrinter();

  return (
    <div className="p-6 max-w-2xl mx-auto bg-white rounded-xl shadow-md space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">Printer Settings</h2>
      
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <label className="block text-sm font-medium text-gray-700">
            Select Printer
          </label>
          <button
            onClick={fetchPrinters}
            disabled={loading}
            className="px-3 py-1 text-sm bg-blue-50 text-blue-600 rounded hover:bg-blue-100 disabled:opacity-50"
          >
            Refresh Printers
          </button>
        </div>

        {error && (
          <div className="p-3 bg-red-50 text-red-600 text-sm rounded">
            {error} (Make sure QZ Tray is running)
          </div>
        )}

        <select
          value={selectedPrinter}
          onChange={(e) => handleSelectPrinter(e.target.value)}
          className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
        >
          <option value="" disabled>-- Select a printer --</option>
          {printers.map((printer, idx) => (
            <option key={idx} value={printer}>
              {printer}
            </option>
          ))}
        </select>
        
        {selectedPrinter && (
          <div className="mt-4 p-4 bg-green-50 rounded text-sm text-green-700 flex justify-between items-center">
            <span>Currently selected: <strong>{selectedPrinter}</strong></span>
            <button
              onClick={handleTestPrint}
              disabled={loading}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
            >
              Test Print
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PrinterSettings;
