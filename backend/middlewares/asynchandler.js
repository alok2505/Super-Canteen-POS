const asyncHandler = (fn) => async (req, res) => {
  try {
    await fn(req, res);
  } catch (err) {
    console.error("Async error caught by handler:", err);
    if (!res.headersSent) {
      res.status(500).json({ 
        success: false, 
        message: err.message || "Internal Server Error" 
      });
    }
  }
};

module.exports = asyncHandler;