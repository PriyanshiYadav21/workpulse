import api from './axios';

export const tasksApi = {
  list: (params) => api.get('/tasks', { params }).then((r) => r.data),
  get: (id) => api.get(`/tasks/${id}`).then((r) => r.data),
  create: (data) => api.post('/tasks', data).then((r) => r.data),
  update: (id, data) => api.patch(`/tasks/${id}`, data).then((r) => r.data),
  remove: (id) => api.delete(`/tasks/${id}`).then((r) => r.data),
  reorder: (items) => api.post('/tasks/reorder', { items }).then((r) => r.data),

  listComments: (taskId) => api.get(`/tasks/${taskId}/comments`).then((r) => r.data),
  addComment: (taskId, content) => api.post(`/tasks/${taskId}/comments`, { content }).then((r) => r.data),
  deleteComment: (id) => api.delete(`/tasks/comments/${id}`).then((r) => r.data),

  listAttachments: (taskId) => api.get(`/tasks/${taskId}/attachments`).then((r) => r.data),
  uploadAttachment: (taskId, file) => {
    const fd = new FormData();
    fd.append('file', file);
    return api.post(`/tasks/${taskId}/attachments`, fd, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }).then((r) => r.data);
  },
  deleteAttachment: (id) => api.delete(`/tasks/attachments/${id}`).then((r) => r.data),
};
