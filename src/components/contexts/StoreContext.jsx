'use client'

import { createContext, useState, useContext, useEffect } from 'react'

import { useSession } from 'next-auth/react'

import apiClient from '@/libs/api'

// Base URL for storage, matching backend configuration
const STORAGE_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000'

/**
 * Builds the URL for store images
 */
const buildImageUrl = picture => {
  if (!picture) return null
  if (picture.startsWith('http')) return picture

  return `${STORAGE_BASE_URL}/storage/${picture}`
}

// Create context
const StoreContext = createContext()

// Store types
export const STORE_TYPES = {
  NORMAL: 'normal',
  RAW_MATERIAL: 'raw_material',
  IMPORT: 'import'
}

// Provider component
export const StoreProvider = ({ children }) => {
  const { data: session, status } = useSession()
  const [stores, setStores] = useState([])
  const [filteredStores, setFilteredStores] = useState([])
  const [selectedStoreType, setSelectedStoreType] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [userSupplierId, setUserSupplierId] = useState(null)

  // Nouvel état pour la pagination côté client
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(24)
  const [paginatedStores, setPaginatedStores] = useState([])

  // Load stores from API
  useEffect(() => {
    const fetchStores = async () => {
      setLoading(true)

      try {
        const response = await apiClient.get('/suppliers')

        // Réduire la quantité de logs
        if (process.env.NODE_ENV === 'development') {
          console.log('Suppliers count:', response.data.data?.length || 0)
        }

        const fetchedStores = Array.isArray(response.data.data) ? response.data.data : []

        // Find current user's supplier ID from the raw store data
        if (status === 'authenticated' && session && session.user) {
          const currentUserSupplier = fetchedStores.find(
            store => store.user_id?.toString() === session.user.id?.toString()
          )

          if (currentUserSupplier) {
            setUserSupplierId(currentUserSupplier.id.toString())
          }
        }

        const normalizedStores = fetchedStores.map(store => {
          const logoUrl = buildImageUrl(store.picture)
          const coverImageUrl = buildImageUrl(store.cover_image)

          // Calculate average rating and review count from the reviews array
          const averageRating = store.reviews && store.reviews.length > 0
            ? store.reviews.reduce((acc, review) => acc + (review.rating || 0), 0) / store.reviews.length
            : 0
          const reviewCount = store.reviews?.length || 0

          return {
            id: store.id.toString(),
            name: store.business_name || 'Unknown Store',
            type:
              store.type === 'merchant'
                ? STORE_TYPES.NORMAL
                : store.type === 'workshop'
                  ? STORE_TYPES.RAW_MATERIAL
                  : store.type === 'importer'
                    ? STORE_TYPES.IMPORT
                    : 'unknown',
            logo: logoUrl || '/images/pages/logos/slack.png',
            coverImage: coverImageUrl || '/images/pages/profile-banner.png',
            rating: averageRating,
            reviewCount: reviewCount,
            reviews: store.reviews || [], // Include the reviews array
            verified: store.verified || false,
            since: store.since || 'Unknown',
            location: store.location || 'Unknown',
            description: store.description || '',
            productCount: store.product_count || 0,
            followers: store.followers || 0,
            featured: store.featured || false,
            isSaved: store.is_saved || false // Include saved status from API
          }
        })

        setStores(normalizedStores)
        setFilteredStores(normalizedStores)
        setError(null)
      } catch (error) {
        console.error('Error fetching stores:', error)

        // Only set error if it's not an authentication error
        if (error.response?.status !== 401) {
          setError('Failed to load stores. Please try again later.')
        }

        setStores([])
        setFilteredStores([])
      } finally {
        setLoading(false)
      }
    }

    fetchStores()
  }, [status, session])

  // Filter stores based on type and search term
  useEffect(() => {
    let filtered = [...stores]

    // Exclude the user's own store
    if (userSupplierId) {
      filtered = filtered.filter(store => store.id !== userSupplierId)
    }

    // Filter by store type
    if (selectedStoreType !== 'all') {
      filtered = filtered.filter(store => store.type === selectedStoreType)
    }

    // Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase()

      filtered = filtered.filter(
        store =>
          store.name.toLowerCase().includes(term) ||
          store.description.toLowerCase().includes(term) ||
          store.location.toLowerCase().includes(term)
      )
    }

    setFilteredStores(filtered)
  }, [stores, selectedStoreType, searchTerm, userSupplierId])

  // Effet pour paginer les magasins filtrés
  useEffect(() => {
    const startIndex = (currentPage - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage

    setPaginatedStores(filteredStores.slice(startIndex, endIndex))
  }, [filteredStores, currentPage, itemsPerPage])

  // Get store by ID
  const getStoreById = storeId => {
    return stores.find(store => store.id === storeId)
  }

  return (
    <StoreContext.Provider
      value={{
        stores,
        filteredStores,
        paginatedStores,
        selectedStoreType,
        setSelectedStoreType,
        searchTerm,
        setSearchTerm,
        loading,
        error,
        getStoreById,
        storeTypes: STORE_TYPES,

        // Nouvelles propriétés pour la pagination
        currentPage,
        setCurrentPage,
        itemsPerPage,
        setItemsPerPage,
        totalPages: Math.ceil(filteredStores.length / itemsPerPage)
      }}
    >
      {children}
    </StoreContext.Provider>
  )
}

// Custom hook to use the store context
export const useStore = () => {
  const context = useContext(StoreContext)

  if (!context) {
    throw new Error('useStore must be used within a StoreProvider')
  }

  return context
}
