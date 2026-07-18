import axios from "axios";

export const api = axios.create({
  baseURL: "http://localhost:3000/api/products",
});

const billingApi = axios.create({
  baseURL: "http://localhost:3000/api/billing",
});

const attachToken = (config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
};

api.interceptors.request.use(attachToken, (err) => Promise.reject(err));
billingApi.interceptors.request.use(attachToken, (err) => Promise.reject(err));

export const previewBill = (items, discount = 0) => {
    return billingApi.post("/preview", {
        items,
        discount,
    });
};



