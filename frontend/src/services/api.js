import axios from 'axios'

const BASE_URL = import.meta.env.VITE_API_URL || '/api'

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor — attach access token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Track whether we're already refreshing
let isRefreshing = false
let failedQueue  = []

const processQueue = (error, token = null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) reject(error)
    else resolve(token)
  })
  failedQueue = []
}

const redirectToLogin = () => {
  const _role = JSON.parse(localStorage.getItem('user') || '{}')?.role
  if (_role === 'superadmin') window.location.href = '/superadmin-login'
  else if (_role === 'sales') window.location.href = '/sales-login'
  else window.location.href = '/login'
}

// Response interceptor — handle 401 + token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config
    const isAuthEndpoint  = originalRequest.url?.includes('/auth/')

    const isMultipart = originalRequest.headers['Content-Type']?.includes('multipart/form-data')

    if (error.response?.status === 401 && !originalRequest._retry && !isAuthEndpoint && !isMultipart) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`
            return api(originalRequest)
          })
          .catch((err) => Promise.reject(err))
      }

      originalRequest._retry = true
      isRefreshing = true

      const refreshToken = localStorage.getItem('refreshToken')

      if (!refreshToken) {
        redirectToLogin()
        localStorage.removeItem('accessToken')
        localStorage.removeItem('refreshToken')
        localStorage.removeItem('user')
        return Promise.reject(error)
      }

      try {
        const { data } = await axios.post(`${BASE_URL}/auth/refresh`, {
          refreshToken,
        })

        const { accessToken } = data
        localStorage.setItem('accessToken', accessToken)
        api.defaults.headers.common.Authorization = `Bearer ${accessToken}`
        originalRequest.headers.Authorization = `Bearer ${accessToken}`

        processQueue(null, accessToken)
        return api(originalRequest)
      } catch (refreshError) {
        processQueue(refreshError, null)
        redirectToLogin()
        localStorage.removeItem('accessToken')
        localStorage.removeItem('refreshToken')
        localStorage.removeItem('user')
        return Promise.reject(refreshError)
      } finally {
        isRefreshing = false
      }
    }

    // Format error message
    if (error.response?.data?.errors) {
      error.validationErrors = error.response.data.errors
    }

    return Promise.reject(error)
  }
)

export default api