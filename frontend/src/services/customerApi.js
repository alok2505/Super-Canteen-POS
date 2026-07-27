import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:3000/api",
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const getCustomers = (filter = "", search = "") => {
  return api.get(`/customers?filter=${filter}&search=${search}`);
};

export const getCustomerById = (id) => {
  return api.get(`/customers/${id}`);
};

export const createOrUpdateCustomer = (data) => {
  return api.post(`/customers`, data);
};
