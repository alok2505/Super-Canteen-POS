import { useState, useEffect } from 'react';
import { getAvailablePrinters, getSelectedPrinter, selectPrinter, testPrint } from '../services/printerService';

export const usePrinter = () => {
  const [printers, setPrinters] = useState([]);
  const [selected, setSelected] = useState(getSelectedPrinter() || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchPrinters = async () => {
    setLoading(true);
    setError(null);
    try {
      const available = await getAvailablePrinters();
      setPrinters(available);
    } catch (err) {
      setError('Failed to fetch printers.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPrinters();
  }, []);

  const handleSelectPrinter = (name) => {
    selectPrinter(name);
    setSelected(name);
  };

  const handleTestPrint = async () => {
    setLoading(true);
    const result = await testPrint();
    setLoading(false);
    return result;
  };

  return {
    printers,
    selectedPrinter: selected,
    handleSelectPrinter,
    fetchPrinters,
    handleTestPrint,
    loading,
    error
  };
};
