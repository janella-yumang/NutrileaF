import axios from "axios";

// Base URL for Flask backend
const API_BASE = process.env.REACT_APP_API_URL || "https://nutrileaf-10.onrender.com/api";

// Create axios instance with default configuration
const api = axios.create({
  baseURL: API_BASE,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Authentication functions
export const register = async (userData: {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  password: string;
}) => {
  const response = await api.post("/auth/register", userData);
  return response.data;
};

export const login = async (credentials: {
  email: string;
  password: string;
}) => {
  const response = await api.post("/auth/login", credentials);
  return response.data;
};

// Upload image
export const uploadImage = async (imageFile: File) => {
  const formData = new FormData();
  formData.append("image", imageFile);

  const response = await api.post("/image/upload", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

  return response.data;
};

// Growth classification
export const classifyGrowth = async (imageFile: File) => {
  const formData = new FormData();
  formData.append("image", imageFile);

  const response = await api.post("/growth/classify", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

  return response.data;
};
