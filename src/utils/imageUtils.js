// Utility functions for handling image URLs

const STORAGE_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000'
const USE_PROXY = process.env.NODE_ENV === 'production' && process.env.NEXT_PUBLIC_USE_IMAGE_PROXY === 'true'

/**
 * Builds a proper image URL from a path
 * @param {string} path - The image path from the API
 * @param {string} type - The type of image (optional, for specific handling)
 * @returns {string} - The complete image URL
 */
export const buildImageUrl = (path, type = null) => {
  if (!path) return null

  // If it's already a full URL, return as is
  if (path.startsWith('http')) {
    return path
  }

  // Clean the path
  const cleanPath = path.replace(/^\/+/, '')

  // Build the backend URL
  let backendUrl = STORAGE_BASE_URL

  // Handle different image types
  if (type === 'workspace') {
    backendUrl = `${STORAGE_BASE_URL}/storage/workspace_images/${cleanPath}`
  } else if (type === 'workspace_pictures') {
    backendUrl = `${STORAGE_BASE_URL}/storage/workspace_pictures/${cleanPath}`
  } else if (path.includes('workspace_pictures')) {
    backendUrl = `${STORAGE_BASE_URL}/storage/workspace_pictures/${cleanPath.replace(/^workspace_pictures\//, '')}`
  } else if (path.includes('workspace_images')) {
    backendUrl = `${STORAGE_BASE_URL}/storage/workspace_images/${cleanPath.replace(/^workspace_images\//, '')}`
  } else {
    backendUrl = `${STORAGE_BASE_URL}/storage/${cleanPath}`
  }

  // Use proxy in production if enabled
  if (USE_PROXY && process.env.NODE_ENV === 'production') {
    const proxyUrl = `/api/proxy/storage/${cleanPath}`

    console.log('Using proxy for image:', proxyUrl)

    return proxyUrl
  }

  // Debug logging
  if (process.env.NODE_ENV === 'development') {
    console.log('buildImageUrl:', { path, type, backendUrl })
  }

  return backendUrl
}

/**
 * Builds a user avatar URL
 * @param {string} picture - The user picture path
 * @returns {string} - The complete avatar URL
 */
export const buildAvatarUrl = picture => {
  if (!picture) return '/images/avatars/1.png'

  if (picture.startsWith('http')) {
    return picture
  }

  // Handle different avatar path formats
  if (picture.startsWith('/storage')) {
    const cleanPath = picture.replace(/^\/storage\//, '')

    // Use proxy in production if enabled
    if (USE_PROXY && process.env.NODE_ENV === 'production') {
      const proxyUrl = `/api/proxy/storage/${cleanPath}`

      console.log('Using proxy for avatar:', proxyUrl)

      return proxyUrl
    }

    return `${STORAGE_BASE_URL}${picture}`
  }

  const cleanPath = picture.replace(/^\/+/, '')
  const finalUrl = `${STORAGE_BASE_URL}/storage/${cleanPath}`

  // Use proxy in production if enabled
  if (USE_PROXY && process.env.NODE_ENV === 'production') {
    const proxyUrl = `/api/proxy/storage/${cleanPath}`

    console.log('Using proxy for avatar:', proxyUrl)

    return proxyUrl
  }

  // Debug logging
  if (process.env.NODE_ENV === 'development') {
    console.log('buildAvatarUrl:', { picture, finalUrl })
  }

  return finalUrl
}

/**
 * Builds a product image URL
 * @param {string} picture - The product picture path
 * @returns {string} - The complete product image URL
 */
export const buildProductImageUrl = picture => {
  if (!picture) return '/images/placeholder.jpg'

  if (picture.startsWith('http')) {
    return picture
  }

  return `${STORAGE_BASE_URL}/storage/${picture.replace(/^\/+/, '')}`
}

/**
 * Checks if an image URL is valid and accessible
 * @param {string} url - The image URL to check
 * @returns {Promise<boolean>} - Whether the image is accessible
 */
export const isImageAccessible = async url => {
  try {
    const response = await fetch(url, { method: 'HEAD' })

    return response.ok
  } catch (error) {
    console.warn('Image accessibility check failed:', error)

    return false
  }
}

/**
 * Gets a fallback image URL based on type
 * @param {string} type - The type of image
 * @returns {string} - The fallback image URL
 */
export const getFallbackImage = (type = 'default') => {
  const fallbacks = {
    avatar: '/images/avatars/1.png',
    product: '/images/placeholder.jpg',
    workspace: '/images/placeholder.jpg',
    default: '/images/placeholder.jpg'
  }

  return fallbacks[type] || fallbacks.default
}
