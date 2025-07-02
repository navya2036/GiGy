import api from './api';

// Submit an application for a gig
export const applyForGig = async (applicationData) => {
  const response = await api.post('/applications', applicationData);
  return response.data;
};

// Get applications for a specific gig (for gig poster)
export const getGigApplications = async (gigId) => {
  const response = await api.get(`/applications/gig/${gigId}`);
  return response.data;
};

// Get applications submitted by the current user
export const getMyApplications = async () => {
  const response = await api.get('/applications/myapplications');
  return response.data;
};

// Accept an application
export const acceptApplication = async (applicationId) => {
  const response = await api.put(`/applications/${applicationId}/accept`);
  return response.data;
};

// Reject an application
export const rejectApplication = async (applicationId) => {
  const response = await api.put(`/applications/${applicationId}/reject`);
  return response.data;
};
