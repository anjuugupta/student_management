import axios from 'axios';

const API_URL = 'http://localhost:5000/api/students';

export const getStudents = (page = 1, limit = 5, search = '', course = '') => {
  return axios.get(`${API_URL}?page=${page}&limit=${limit}&search=${search}&course=${course}`);
};

export const getStudentById = (id) => {
  return axios.get(`${API_URL}/${id}`);
};

export const createStudent = (formData) => {
  return axios.post(API_URL, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
};

export const updateStudent = (id, formData) => {
  return axios.put(`${API_URL}/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
};

export const deleteStudent = (id) => {
  return axios.delete(`${API_URL}/${id}`);
};
