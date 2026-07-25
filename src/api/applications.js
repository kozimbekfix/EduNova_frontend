import api from './axios';

export const submitApplication = async (formData) => {
  const { data } = await api.post('/applications', formData);
  return data;
};

export const getApplications = async () => {
  const { data } = await api.get('/applications');
  return data;
};

export const updateApplicationStatus = async (id, status) => {
  const { data } = await api.put(`/applications/${id}/status`, { status });
  return data;
};

export const checkMyApplication = async (clientId) => {
  const { data } = await api.get(`/applications/my/${clientId}`);
  return data;
};

export const checkApplicationByPhone = async (phone, clientId) => {
  const { data } = await api.post('/applications/check', { phone, clientId });
  return data;
};

export const clientUpdateApplication = async (id, formData) => {
  const { data } = await api.put(`/applications/${id}/client-update`, formData);
  return data;
};

export const notifyApplication = async (id, notifyData) => {
  const { data } = await api.put(`/applications/${id}/notify`, notifyData);
  return data;
};

export const deleteApplication = async (id) => {
  const { data } = await api.delete(`/applications/${id}`);
  return data;
};
