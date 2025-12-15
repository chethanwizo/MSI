import axios from 'axios'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 
  (process.env.NODE_ENV === 'production' 
    ? 'https://msi-tseg.onrender.com/api' 
    : 'http://localhost:5000/api')

export const api = axios.create({
  baseURL: API_URL,
  timeout: 120000, // 2 minutes for file uploads
})

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// API functions
export const authAPI = {
  login: (email: string, password: string) => 
    api.post('/auth/login', { email, password }),
  register: (data: { email: string; password: string; name: string; role?: string }) =>
    api.post('/auth/register', data),
  me: () => api.get('/auth/me'),
  logout: () => api.post('/auth/logout'),
}

export const uploadAPI = {
  uploadMIS: (file: File) => {
    const formData = new FormData()
    formData.append('misFile', file)
    return api.post('/upload/mis', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 300000 // 5 minutes for file uploads
    })
  },
  uploadDump: (file: File) => {
    const formData = new FormData()
    formData.append('dumpFile', file)
    return api.post('/upload/dump', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 300000 // 5 minutes for file uploads
    })
  },
  getHistory: (page = 1, limit = 20) =>
    api.get(`/upload/history?page=${page}&limit=${limit}`),
}

export const dashboardAPI = {
  getMetrics: (params?: { dateFrom?: string; dateTo?: string; employeeId?: number }) =>
    api.get('/dashboard/metrics', { params }),
  getEmployeePerformance: (params?: { dateFrom?: string; dateTo?: string; limit?: number }) =>
    api.get('/dashboard/employee-performance', { params }),
  getRejectionAnalysis: (params?: { dateFrom?: string; dateTo?: string }) =>
    api.get('/dashboard/rejection-analysis', { params }),
  getTrends: (days = 30) =>
    api.get(`/dashboard/trends?days=${days}`),
  getKYCFunnel: (params?: { dateFrom?: string; dateTo?: string }) =>
    api.get('/dashboard/kyc-funnel', { params }),
}

export const searchAPI = {
  search: (params: {
    query?: string
    employeeName?: string
    arn?: string
    customerName?: string
    mobileNo?: string
    status?: string
    dateFrom?: string
    dateTo?: string
    page?: number
    limit?: number
  }) => api.get('/search', { params }),
  getUnmapped: (page = 1, limit = 20) =>
    api.get(`/search/unmapped?page=${page}&limit=${limit}`),
  export: (filters: any) =>
    api.post('/search/export', filters),
}

export const employeeAPI = {
  getAll: (page = 1, limit = 50) =>
    api.get(`/employee?page=${page}&limit=${limit}`),
  getById: (id: number, params?: { page?: number; limit?: number; dateFrom?: string; dateTo?: string }) =>
    api.get(`/employee/${id}`, { params }),
  getPerformanceComparison: (params?: { dateFrom?: string; dateTo?: string; limit?: number }) =>
    api.get('/employee/performance/comparison', { params }),
  getTopPerformers: (params?: { metric?: string; limit?: number; dateFrom?: string; dateTo?: string }) =>
    api.get('/employee/performance/top', { params }),
}