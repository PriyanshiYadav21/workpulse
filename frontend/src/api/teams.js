import api from './axios';

export const teamsApi = {
  list: () => api.get('/teams').then((r) => r.data),
  create: (data) => api.post('/teams', data).then((r) => r.data),
  get: (id) => api.get(`/teams/${id}`).then((r) => r.data),
  invite: (id, email, role) => api.post(`/teams/${id}/members`, { email, role }).then((r) => r.data),
  removeMember: (id, userId) => api.delete(`/teams/${id}/members/${userId}`).then((r) => r.data),
};
