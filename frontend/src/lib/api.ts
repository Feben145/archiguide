// frontend/src/lib/api.ts

import axios, { AxiosInstance } from 'axios'

const BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  'http://localhost:8000/api'

export const api: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
})

// -------------------------------------------------------------------------
// Attach JWT token to every request
// -------------------------------------------------------------------------

api.interceptors.request.use(config => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('access_token')

    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
  }

  return config
})

// -------------------------------------------------------------------------
// Automatically refresh JWT on 401
// -------------------------------------------------------------------------

api.interceptors.response.use(
  response => response,

  async error => {
    const original = error.config

    if (
      error.response?.status === 401 &&
      original &&
      !original._retry
    ) {
      original._retry = true

      const refresh = localStorage.getItem('refresh_token')

      if (refresh) {
        try {
          const response = await axios.post(
            `${BASE_URL}/auth/token/refresh/`,
            { refresh }
          )

          const { access } = response.data

          localStorage.setItem('access_token', access)

          original.headers.Authorization = `Bearer ${access}`

          return api(original)

        } catch {
          localStorage.removeItem('access_token')
          localStorage.removeItem('refresh_token')

          window.location.href = '/auth/login'

          return Promise.reject(error)
        }
      }

      window.location.href = '/auth/login'
    }

    return Promise.reject(error)
  }
)

export default api
