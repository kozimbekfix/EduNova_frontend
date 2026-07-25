import api from './axios';

export const getBranches = async () => {
  const { data } = await api.get('/branches');
  return data;
};

export const getBranch = async (id) => {
  const { data } = await api.get(`/branches/${id}`);
  return data;
};

export const createBranch = async (branchData) => {
  const { data } = await api.post('/branches', branchData);
  return data;
};

export const updateBranch = async (id, branchData) => {
  const { data } = await api.put(`/branches/${id}`, branchData);
  return data;
};

export const deleteBranch = async (id) => {
  const { data } = await api.delete(`/branches/${id}`);
  return data;
};
