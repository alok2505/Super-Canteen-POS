import api from "./apiConfig";

export const loginUser = (credentials) => {
  return api.post("/users/auth", credentials);
};

export const registerUser = (userData) => {
  return api.post("/users/signup", userData);
};

export const getAllUsers = () => {
  return api.get("/users/getAllUsers");
};

export const createStaffUser = (userData) => {
  return api.post("/users/add-user", userData);
};

export const logoutUser = () => {
  return api.post("/users/logout");
};
