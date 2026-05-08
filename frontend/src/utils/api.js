import axios from 'axios';

const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
});

// Upload asset with progress callback
export const uploadAsset = (formData, onUploadProgress) =>
  API.post('/assets/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress,
  });

// Get all assets with optional filters
export const getAssets = (params = {}) => API.get('/assets', { params });

// Get single asset
export const getAsset = (id) => API.get(`/assets/${id}`);

// Download asset
export const getDownloadUrl = (id) =>
  `${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/assets/${id}/download`;

// Update tags
export const updateTags = (id, tags) => API.patch(`/assets/${id}/tags`, { tags });

// Delete asset
export const deleteAsset = (id) => API.delete(`/assets/${id}`);

export default API;
