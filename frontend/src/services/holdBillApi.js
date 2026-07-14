import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:3000/api",
});

export const saveHoldBill = (data) =>
  api.post("/hold-bills", data);

export const getHoldBills = () =>
  api.get("/hold-bills");

export const getHoldBillById = (id) =>
  api.get(`/hold-bills/${id}`);

export const deleteHoldBill = (id) =>
  api.delete(`/hold-bills/${id}`);