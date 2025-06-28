// auth.js - Optimized NextAuth configuration
import CredentialProvider from 'next-auth/providers/credentials'
import GoogleProvider from 'next-auth/providers/google'

// Direct server-to-server API calls (no proxy through Next.js)
const LARAVEL_API_URL = process.env.API_URL || 'http://localhost:8000/api'

// Optimized API client for server-side use only
const serverApiCall = async (endpoint, options = {}) => {
  const url = `${LARAVEL_API_URL}${endpoint}`

  const defaultOptions = {
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    },
    timeout: 5000, // 5 second timeout
  }

  const mergedOptions = {
    ...defaultOptions,
    ...options,
    headers: {
      ...defaultOptions.headers,
      ...options.headers,
    }
  }

  try {
    // Use native fetch with timeout
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), mergedOptions.timeout)

    const response = await fetch(url, {
      ...mergedOptions,
      signal: controller.signal
    })

    clearTimeout(timeoutId)

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }

    return await response.json()
  } catch (error) {
    console.error(`Server API call failed: ${url}`, error.message)
    throw error
  }
}

export const authOptions = {
  providers: [
    CredentialProvider({
      name: 'Credentials',
      type: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        const { email, password } = credentials

        try {
          // Direct call to Laravel API (no proxy)
          const data = await serverApiCall('/login', {
            method: 'POST',
            body: JSON.stringify({ email, password })
          })

          if (!data.access_token) {
            throw new Error('No access token provided by the server')
          }

          return {
            email,
            accessToken: data.access_token
          }
        } catch (error) {
          console.error('Login failed:', error.message)
          throw new Error(error.message || 'Authentication failed')
        }
      }
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      authorization: {
        params: {
          prompt: 'consent',
          access_type: 'offline',
          response_type: 'code'
        }
      }
    })
  ],

  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60 // 30 days
  },

  pages: {
    signIn: '/login'
  },

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.email = user.email
        token.accessToken = user.accessToken
      }
      return token
    },

    async session({ session, token }) {
      if (token.accessToken) {
        try {
          // Direct server-to-server call (MUCH faster)
          const data = await serverApiCall('/user', {
            method: 'GET',
            headers: {
              Authorization: `Bearer ${token.accessToken}`
            }
          })

          const userData = data.user

          // Build session with full user data
          session.user = {
            id: userData.id,
            fullName: userData.full_name,
            email: userData.email,
            phoneNumber: userData.phone_number,
            role: userData.role,
            picture: userData.picture || null,
            city: userData.city || '',
            address: userData.address || '',
            accessToken: token.accessToken
          }
        } catch (error) {
          console.error('Failed to fetch user data in session callback:', error)

          // Fallback to minimal data
          session.user = {
            email: token.email,
            accessToken: token.accessToken,
            picture: null,
            city: '',
            address: ''
          }
        }
      }

      return session
    }
  },

  secret: process.env.NEXTAUTH_SECRET
}

// Optional: Add session caching to reduce database calls
const sessionCache = new Map()
const SESSION_CACHE_TTL = 5 * 60 * 1000 // 5 minutes

// Enhanced session callback with caching
const cachedSessionCallback = async ({ session, token }) => {
  if (!token.accessToken) return session

  const cacheKey = `user_${token.email}_${token.accessToken.slice(-10)}`
  const cached = sessionCache.get(cacheKey)

  // Return cached data if still valid
  if (cached && Date.now() - cached.timestamp < SESSION_CACHE_TTL) {
    return {
      ...session,
      user: {
        ...cached.userData,
        accessToken: token.accessToken
      }
    }
  }

  try {
    const data = await serverApiCall('/user', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token.accessToken}`
      }
    })

    const userData = data.user
    const fullUserData = {
      id: userData.id,
      fullName: userData.full_name,
      email: userData.email,
      phoneNumber: userData.phone_number,
      role: userData.role,
      picture: userData.picture || null,
      city: userData.city || '',
      address: userData.address || ''
    }

    // Cache the user data
    sessionCache.set(cacheKey, {
      userData: fullUserData,
      timestamp: Date.now()
    })

    session.user = {
      ...fullUserData,
      accessToken: token.accessToken
    }
  } catch (error) {
    console.error('Session callback error:', error)
    session.user = {
      email: token.email,
      accessToken: token.accessToken,
      picture: null,
      city: '',
      address: ''
    }
  }

  return session
}

// Use the cached version
export const authOptionsWithCache = {
  ...authOptions,
  callbacks: {
    ...authOptions.callbacks,
    session: cachedSessionCallback
  }
}
