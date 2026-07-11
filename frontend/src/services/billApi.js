
import axios from "axios";

// Bill API
const api = axios.create({
  baseURL: "http://localhost:3000/api",
});


export const saveBill = (billData) => {
  return api.post("/bills", billData);
};

export const getBills = () => {
  return api.get("/bills");
};

export const getBillById = (id) => {
  return api.get(`/bills/${id}`);
};

export const deleteBill = (id) => {
  return api.delete(`/bills/${id}`);
};