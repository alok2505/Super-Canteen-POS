import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:3000/api",
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const saveHoldBill = (data) =>
  api.post("/hold-bills", data);

export const getHoldBills = () =>
  api.get("/hold-bills");

export const getHoldBillById = (id) =>
  api.get(`/hold-bills/${id}`);

export const deleteHoldBill = (id) =>
  api.delete(`/hold-bills/${id}`);
