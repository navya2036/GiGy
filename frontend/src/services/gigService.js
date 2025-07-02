import api from './api';

// Get all gigs with optional filters
export const getGigs = async (filters = {}) => {
  let queryParams = '';
  
  if (Object.keys(filters).length > 0) {
    queryParams = '?' + new URLSearchParams(filters).toString();
  }
  
  const response = await api.get(`/gigs${queryParams}`);
  return response.data;
};

// Get a single gig by ID
export const getGigById = async (id) => {
  const response = await api.get(`/gigs/${id}`);
  return response.data;
};

// Create a new gig
export const createGig = async (gigData) => {
  const response = await api.post('/gigs', gigData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

// Update an existing gig
export const updateGig = async (id, gigData) => {
  const response = await api.put(`/gigs/${id}`, gigData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

// Delete a gig
export const deleteGig = async (id) => {
  const response = await api.delete(`/gigs/${id}`);
  return response.data;
};

// Get gigs posted by the current user
export const getMyGigs = async () => {
  const response = await api.get('/gigs/user/mygigs');
  return response.data;
};

// Get gigs assigned to the current user
export const getMyAssignments = async () => {
  const response = await api.get('/gigs/user/myassignments');
  return response.data;
};

// Mark a gig as completed
export const completeGig = async (id) => {
  const response = await api.put(`/gigs/${id}/complete`);
  return response.data;
};
