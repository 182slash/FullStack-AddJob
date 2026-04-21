import api from './api'

export const authService = {
  login: (credentials) => api.post('/auth/login', credentials),

  register: (payload) => api.post('/auth/register', payload),

  googleAuth: (credential, role = 'seeker') => api.post('/auth/google', { credential, role }),  // ADD THIS

  logout: () => api.post('/auth/logout'),

  refreshToken: (refreshToken) => api.post('/auth/refresh', { refreshToken }),

  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),

  resetPassword: (token, password) =>
    api.post('/auth/reset-password', { token, password }),

  verifyEmail: (token) => api.get(`/auth/verify-email/${token}`),

  getProfile: () => api.get('/auth/me'),

  updateProfile: (data) => api.put('/auth/me', data),

  changePassword: (payload) => api.put('/auth/change-password', payload),

  uploadAvatar: (formData) =>
    api.post('/auth/avatar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
}