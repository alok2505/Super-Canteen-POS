import qz from 'qz-tray';

// Provide a certificate and signature for production (optional for local testing, but recommended)
// qz.security.setCertificatePromise(function(resolve, reject) { resolve("..."); });
// qz.security.setSignaturePromise(function(toSign) { return function(resolve, reject) { resolve("..."); }; });

export const connectPrinter = async () => {
  if (qz.websocket.isActive()) {
    return true;
  }
  
  try {
    await qz.websocket.connect();
    return true;
  } catch (error) {
    console.error('Failed to connect to QZ Tray:', error);
    return false;
  }
};

export const disconnectPrinter = async () => {
  if (qz.websocket.isActive()) {
    try {
      await qz.websocket.disconnect();
      return true;
    } catch (error) {
      console.error('Failed to disconnect from QZ Tray:', error);
      return false;
    }
  }
  return true;
};

export const getAvailablePrinters = async () => {
  try {
    await connectPrinter();
    const printers = await qz.printers.find();
    return printers;
  } catch (error) {
    console.error('Failed to get printers:', error);
    return [];
  }
};

export const getPrinters = getAvailablePrinters;

export const selectPrinter = (printerName) => {
  localStorage.setItem('selectedPrinter', printerName);
  return printerName;
};

export const getSelectedPrinter = () => {
  return localStorage.getItem('selectedPrinter');
};

export const printReceipt = async (receiptData) => {
  try {
    await connectPrinter();
    const printerName = getSelectedPrinter();
    
    if (!printerName) {
      throw new Error("No printer selected");
    }

    // Configure the printer
    const config = qz.configs.create(printerName);

    // Assuming receiptData is ESC/POS or plain text, or an array of print commands
    // We'll wrap it if it's a string
    const data = Array.isArray(receiptData) ? receiptData : [receiptData];

    await qz.print(config, data);
    return { success: true };
  } catch (error) {
    console.error('Print failed:', error);
    return { success: false, error: error.message || 'Print failed' };
  }
};

export const openCashDrawer = async () => {
  try {
    // await connectPrinter();
    // const printerName = getSelectedPrinter();
    
    // if (!printerName) {
    //   throw new Error("No printer selected");
    // }
    console.log("Cash Drwer open -- for testing") //logs for testing cash drawer open or not
    // const config = qz.configs.create(printerName);
    
    // ESC/POS command to open cash drawer
    // ESC p m t1 t2
    // Decimal: 27 112 0 25 250
    // Hex: \x1B\x70\x00\x19\xFA
    // const drawerCommand = '\x1B\x70\x00\x19\xFA';
    
    // await qz.print(config, [drawerCommand]);
    return { success: true };
  } catch (error) {
    console.error('Open drawer failed:', error);
    return { success: false, error: error.message || 'Open drawer failed' };
  }
};

export const testPrint = async () => {
  try {
    await connectPrinter();
    const printerName = getSelectedPrinter();
    
    if (!printerName) {
      throw new Error("No printer selected");
    }

    const config = qz.configs.create(printerName);
    const data = [
      '\x1B\x40',          // init
      '\x1B\x61\x01',      // center align
      'TEST PRINT\n',
      'Hello World!\n',
      'QZ Tray is working.\n',
      '\x1B\x64\x05',      // feed 5 lines
      '\x1D\x56\x41\x00'   // cut paper
    ];

    await qz.print(config, data);
    return { success: true };
  } catch (error) {
    console.error('Test print failed:', error);
    return { success: false, error: error.message || 'Test print failed' };
  }
};
