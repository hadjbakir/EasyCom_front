// @/libs/api.js - Updated client-side API
import axios from 'axios'
import { getSession } from 'next-auth/react'

// Use direct Laravel API URL (bypass Next.js API routes)
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'

// Enhanced token cache
let tokenCache = {
  token: null,
  timestamp: 0,
  maxAge: 5 * 60 * 1000, // 5 minutes
  promise: null
}

// Response cache for GET requests
const responseCache = new Map()
const CACHE_DURATION = 5 * 60 * 1000

const getCachedResponse = (url) => {
  const cached = responseCache.get(url)
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data
  }
  responseCache.delete(url)
  return null
}

const getToken = async () => {
  const now = Date.now()

  if (tokenCache.token && now - tokenCache.timestamp < tokenCache.maxAge) {
    return tokenCache.token
  }

  if (tokenCache.promise) {
    try {
      await tokenCache.promise
      return tokenCache.token
    } catch (error) {
      tokenCache.promise = null
      throw error
    }
  }

  tokenCache.promise = getSession()

  try {
    const session = await tokenCache.promise
    tokenCache.token = session?.user?.accessToken || null
    tokenCache.timestamp = now
    tokenCache.promise = null
    return tokenCache.token
  } catch (error) {
    tokenCache.promise = null
    throw error
  }
}

// Create optimized axios instance with direct Laravel connection
const apiClient = axios.create({
  baseURL: API_BASE_URL, // Direct to Laravel - NO Next.js proxy
  timeout: 20000, // 20 secondes au lieu de 8
  headers: {
    'Accept': 'application/json'
  }
})

// Single request interceptor
apiClient.interceptors.request.use(
  async (config) => {
    // Check cache first for GET requests
    if (config.method === 'get') {
      const cachedData = getCachedResponse(config.url)
      if (cachedData) {
        return Promise.reject({
          __CACHED__: true,
          data: cachedData,
          status: 200,
          statusText: 'OK',
          headers: {},
          config
        })
      }
    }

    // Add authentication
    try {
      const token = await getToken()
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        const isPublicRoute = config.url.includes('/products') ||
                             config.url.includes('/suppliers') ||
                             config.url.includes('/public')
        if (!isPublicRoute) {
          console.warn('Auth error for route:', config.url)
        }
      }
    }

    // Set content type
    if (config.data && !(config.data instanceof FormData)) {
      config.headers['Content-Type'] = 'application/json'
    }

    return config
  },
  (error) => Promise.reject(error)
)

// Single response interceptor
apiClient.interceptors.response.use(
  (response) => {
    // Cache successful GET responses
    if (response.config.method === 'get' && response.status === 200) {
      responseCache.set(response.config.url, {
        data: response.data,
        timestamp: Date.now()
      })
    }
    return response
  },
  (error) => {
    // Handle cached responses
    if (error.__CACHED__) {
      return Promise.resolve({
        data: error.data,
        status: error.status,
        statusText: error.statusText,
        headers: error.headers,
        config: error.config
      })
    }

    // Clear token cache on 401
    if (error.response?.status === 401) {
      tokenCache.token = null
      tokenCache.timestamp = 0
      tokenCache.promise = null
    }

    // Development logging
    if (process.env.NODE_ENV === 'development') {
      const isPublicRoute = error.config?.url?.includes('/products') ||
                           error.config?.url?.includes('/suppliers') ||
                           error.config?.url?.includes('/public')

      if (!(error.response?.status === 401 && isPublicRoute)) {
        console.warn('Direct API Error:', {
          url: error.config?.url,
          status: error.response?.status,
          message: error.response?.data || error.message
        })
      }
    }

    return Promise.reject(error)
  }
)

export const clearApiCache = () => {
  responseCache.clear()
  tokenCache.token = null
  tokenCache.timestamp = 0
  tokenCache.promise = null
}

export const invalidateCache = (url) => {
  if (responseCache.has(url)) {
    responseCache.delete(url)
  }
}

export const preloadToken = async () => {
  try {
    await getToken()
  } catch (error) {
    console.warn('Failed to preload token:', error)
  }
}

export default apiClient
