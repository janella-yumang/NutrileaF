import axios from "axios";

// Base URL for Flask backend
const API_BASE = process.env.REACT_APP_API_URL || "http://192.168.1.16:5000";

// Upload image
export const uploadImage = async (imageFile: File) => {
  const formData = new FormData();
  formData.append("image", imageFile);

  const response = await axios.post(`${API_BASE}/image/upload`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

  return response.data;
};

// Growth classification
export const classifyGrowth = async (imageFile: File) => {
  const formData = new FormData();
  formData.append("image", imageFile);

  const response = await axios.post(`${API_BASE}/growth/classify`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

  return response.data;
};