import api from "../services/apiConfig";

// Assuming the api base URL is something like http://localhost:3000/api
// We can extract the host part to point to the static uploads folder.
export const getImageUrl = (url) => {
  if (!url) return "";
  if (url.startsWith("/uploads/")) {
    // Determine base URL dynamically from api config or just hardcode for now
    // If api.defaults.baseURL is http://localhost:3000/api, we want http://localhost:3000
    const baseURL = api.defaults.baseURL ? api.defaults.baseURL.replace(/\/api\/?$/, "") : "http://localhost:3000";
    return `${baseURL}${url}`;
  }
  return url;
};
