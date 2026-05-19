import api from './axios';

export const analyticsApi = {
  overview: () => api.get('/analytics/overview').then((r) => r.data),
};
