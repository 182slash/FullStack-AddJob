import api from './api'

export const applicationService = {
  applyToJob: (jobId, formData) =>
    api.post(`/applications/jobs/${jobId}/apply`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),

  getMyApplications: (params) => api.get('/applications/my', { params }),

  getApplicationById: (id) => api.get(`/applications/${id}`),

  withdrawApplication: (id) => api.delete(`/applications/${id}/withdraw`),

  getJobApplicants: (jobId, params) =>
    api.get(`/applications/jobs/${jobId}/applicants`, { params }),

  getAllApplicants: (params) => api.get('/applications/employer/all', { params }),

  updateApplicationStatus: (id, status, note) =>
    api.patch(`/applications/${id}/status`, { status, note }),

  getApplicationStats: () => api.get('/applications/employer/stats'),

  scheduleInterview: (id, data) =>
    api.post(`/applications/${id}/interview`, data),

  downloadResume: (id) =>
    api.get(`/applications/${id}/resume`, { responseType: 'blob' }),
}
