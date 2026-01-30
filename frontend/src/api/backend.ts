import axios from "axios";

// Base URL for Flask backend
const API_BASE = process.env.REACT_APP_API_URL || "http://192.168.1.16:5000";

// Authentication functions
export const register = async (userData: {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  password: string;
}) => {
  const response = await axios.post(`${API_BASE}/api/auth/register`, userData);
  return response.data;
};

export const login = async (credentials: {
  email: string;
  password: string;
}) => {
  const response = await axios.post(`${API_BASE}/api/auth/login`, credentials);
  return response.data;
};

// Upload image
export const uploadImage = async (imageFile: File) => {
  const formData = new FormData();
  formData.append("image", imageFile);

  const response = await axios.post(`${API_BASE}/api/image/upload`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

  return response.data;
};

// Growth classification
export const classifyGrowth = async (imageFile: File) => {
  const formData = new FormData();
  formData.append("image", imageFile);

  const response = await axios.post(`${API_BASE}/api/growth/classify`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

  return response.data;
};
