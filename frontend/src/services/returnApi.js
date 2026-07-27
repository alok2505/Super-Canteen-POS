import api from "./apiConfig";

export const searchBill = async (billNo) => {
  return await api.post("/returns/search-bill", { billNo });
};

export const processReturn = async (data) => {
  return await api.post("/returns/process", data);
};

export const getReturnById = async (id) => {
  return await api.get(`/returns/${id}`);
};

export const getReturnsByBillId = async (billId) => {
  return await api.get(`/returns/bill/${billId}`);
};

export const getReturns = async () => {
  return await api.get(`/returns`);
};
