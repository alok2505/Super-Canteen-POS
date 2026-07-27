import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:3000/api",
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const getOffers = (activeOnly = false) => {
  return api.get(`/offers?activeOnly=${activeOnly}`);
};

export const getOfferById = (id) => {
  return api.get(`/offers/${id}`);
};

export const createOffer = (data) => {
  return api.post(`/offers`, data);
};

export const updateOffer = (id, data) => {
  return api.put(`/offers/${id}`, data);
};

export const deleteOffer = (id) => {
  return api.delete(`/offers/${id}`);
};
