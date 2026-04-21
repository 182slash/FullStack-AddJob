import api from './api'

export const jobService = {
  getJobs: (params) => api.get('/jobs', { params }),

  getJobById: (id) => api.get(`/jobs/${id}`),

  getFeaturedJobs: () => api.get('/jobs/featured'),

  getRecommendedJobs: () => api.get('/jobs/recommended'),

  searchJobs: (query, filters) => api.get('/jobs/search', { params: { q: query, ...filters } }),

  createJob: (data) => api.post('/jobs', data),

  updateJob: (id, data) => api.put(`/jobs/${id}`, data),

  deleteJob: (id) => api.delete(`/jobs/${id}`),

  toggleJobActive: (id) => api.patch(`/jobs/${id}/toggle`),

  getEmployerJobs: (params) => api.get('/jobs/employer/my-jobs', { params }),

  saveJob: (jobId) => api.post(`/jobs/${jobId}/save`),

  unsaveJob: (jobId) => api.delete(`/jobs/${jobId}/save`),

  getSavedJobs: () => api.get('/jobs/saved'),

  getCategories: () => api.get('/jobs/categories'),
  getSkills: () => api.get('/jobs/skills'),

  getJobStats: () => api.get('/jobs/employer/stats'),
}
