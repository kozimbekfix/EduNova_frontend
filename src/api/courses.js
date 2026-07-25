import api from './axios';

export const getCourses = async () => {
  const { data } = await api.get('/courses');
  return data;
};

export const getCourse = async (id) => {
  const { data } = await api.get(`/courses/${id}`);
  return data;
};

export const createCourse = async (courseData) => {
  const { data } = await api.post('/courses', courseData);
  return data;
};

export const updateCourse = async (id, courseData) => {
  const { data } = await api.put(`/courses/${id}`, courseData);
  return data;
};

export const deleteCourse = async (id) => {
  const { data } = await api.delete(`/courses/${id}`);
  return data;
};
