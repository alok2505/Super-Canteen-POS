import axios from "axios";

export const api = axios.create({
  baseURL: "http://localhost:3000/api/products",
});

const billingApi = axios.create({
  baseURL: "http://localhost:3000/api/billing",
});

export const previewBill = (items, discount = 0) => {
    return billingApi.post("/preview", {
        items,
        discount,
    });
};



