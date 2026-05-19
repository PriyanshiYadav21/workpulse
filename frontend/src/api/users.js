import api from './axios';

export const usersApi = {
  list: () => api.get('/users').then((r) => r.data),
  updateProfile: (data) => api.patch('/users/me', data).then((r) => r.data),
  changePassword: (data) => api.post('/users/me/password', data).then((r) => r.data),
  setRole: (id, role) => api.patch(`/users/${id}/role`, { role }).then((r) => r.data),
  delete: (id) => api.delete(`/users/${id}`).then((r) => r.data),
};
