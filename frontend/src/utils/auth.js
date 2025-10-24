// Authentication utility functions

// Get token from sessionStorage (tab-specific) or localStorage (persistent)
export const getToken = () => {
  return sessionStorage.getItem("token") || localStorage.getItem("token");
};

// Get user from sessionStorage (tab-specific) or localStorage (persistent)
export const getUser = () => {
  const userString = sessionStorage.getItem("user") || localStorage.getItem("user");
  return userString ? JSON.parse(userString) : null;
};

// Set authentication data to both storages
export const setAuth = (token, user) => {
  localStorage.setItem("token", token);
  localStorage.setItem("user", JSON.stringify(user));
  sessionStorage.setItem("token", token);
  sessionStorage.setItem("user", JSON.stringify(user));
};

// Clear authentication data from both storages
export const clearAuth = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  sessionStorage.removeItem("token");
  sessionStorage.removeItem("user");
};

// Clear all data from both storages
export const clearAllAuth = () => {
  localStorage.clear();
  sessionStorage.clear();
};
