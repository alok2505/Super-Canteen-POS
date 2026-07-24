import axios from "axios";

// Assume standard auth token fetching in api config, or pass manually
const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
};

const BASE_URL = "http://localhost:3000/api/reports";

export const getDashboardStats = async (startDate, endDate) => {
  const params = new URLSearchParams();
  if (startDate) params.append("startDate", startDate);
  if (endDate) params.append("endDate", endDate);
  
  const url = params.toString() ? `${BASE_URL}/stats?${params.toString()}` : `${BASE_URL}/stats`;
  return await axios.get(url, getAuthHeaders());
};

export const getLowStockAlerts = async (threshold = 10) => {
  return await axios.get(`${BASE_URL}/low-stock?threshold=${threshold}`, getAuthHeaders());
};
