
import axios from "axios";

// Bill API
const api = axios.create({
  baseURL: "http://localhost:3000/api",
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});


export const saveBill = (billData) => {
  return api.post("/bills", billData);
};

export const previewBill = (previewData) => {
  return api.post("/bills/preview", previewData);
};

export const getBills = (startDate, endDate) => {
  const params = new URLSearchParams();
  if (startDate) params.append("startDate", startDate);
  if (endDate) params.append("endDate", endDate);
  
  return api.get("/bills", { params });
};

export const getBillById = (id) => {
  return api.get(`/bills/${id}`);
};

export const deleteBill = (id) => {
  return api.delete(`/bills/${id}`);
};
