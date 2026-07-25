import api from "./apiConfig";

// GET /api/inventory/location
export const getLocationInventory = (params) => {
  return api.get("/inventory/location", { params });
};

// GET /api/inventory/stock
export const getAggregatedStock = (params) => {
  return api.get("/inventory/stock", { params });
};

// Batches endpoints (from /api/franchise-inventory)

// GET /api/franchise-inventory
export const getBatches = (params) => {
  return api.get("/franchise-inventory", { params });
};

// POST /api/franchise-inventory
export const receiveBatch = (data) => {
  return api.post("/franchise-inventory", data);
};

// PATCH /api/franchise-inventory/:batchId
export const updateBatch = (batchId, data) => {
  return api.patch(`/franchise-inventory/${batchId}`, data);
};

// DELETE /api/franchise-inventory/:batchId
export const deleteBatch = (batchId) => {
  return api.delete(`/franchise-inventory/${batchId}`);
};
