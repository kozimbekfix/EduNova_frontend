import api from './axios';

export const getReviews = async () => {
  const { data } = await api.get('/reviews');
  return data;
};

export const getReview = async (id) => {
  const { data } = await api.get(`/reviews/${id}`);
  return data;
};

export const createReview = async (reviewData) => {
  const { data } = await api.post('/reviews', reviewData);
  return data;
};

export const updateReview = async (id, reviewData) => {
  const { data } = await api.put(`/reviews/${id}`, reviewData);
  return data;
};

export const deleteReview = async (id) => {
  const { data } = await api.delete(`/reviews/${id}`);
  return data;
};
