import api from "./apiConfig";

export const getFranchises = (params = {}) => {
  return api.get("/franchises", { params });
};

export const createFranchise = (franchiseData) => {
  return api.post("/franchises", franchiseData);
};

export const updateFranchise = (id, franchiseData) => {
  return api.patch(`/franchises/${id}`, franchiseData);
};

export const deleteFranchise = (id) => {
  return api.delete(`/franchises/${id}`);
};

export const toggleFranchiseStatus = (id) => {
  return api.patch(`/franchises/${id}/toggle-status`);
};
