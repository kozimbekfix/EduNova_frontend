import api from './axios';

export const getBlogPosts = async () => {
  const { data } = await api.get('/blog');
  return data;
};

export const getBlogPost = async (id) => {
  const { data } = await api.get(`/blog/${id}`);
  return data;
};

export const createBlogPost = async (postData) => {
  const { data } = await api.post('/blog', postData);
  return data;
};

export const updateBlogPost = async (id, postData) => {
  const { data } = await api.put(`/blog/${id}`, postData);
  return data;
};

export const deleteBlogPost = async (id) => {
  const { data } = await api.delete(`/blog/${id}`);
  return data;
};
