'use client'

import { createContext, useState, useContext, useEffect } from 'react'

import { useSession } from 'next-auth/react'

import apiClient from '@/libs/api'
import { STORE_TYPES } from './StoreContext'

// Base URL for storage, matching backend configuration
const STORAGE_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000'

/**
 * Builds the URL for product images
 */
const buildImageUrl = picture => {
  if (!picture) return null
  if (picture.startsWith('http')) return picture
  const cleanPath = picture.replace(/^(storage\/|public\/)/, '')

  return `${STORAGE_BASE_URL}/storage/${cleanPath}`
}

// Create context
const ProductContext = createContext()

// Provider component
export const ProductProvider = ({ children }) => {
  const { data: session, status } = useSession()

  const [products, setProducts] = useState([])
  const [filteredProducts, setFilteredProducts] = useState([])
  const [selectedStoreType, setSelectedStoreType] = useState('all')
  const [selectedStoreId, setSelectedStoreId] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)
  const [sortBy, setSortBy] = useState('popularity')
  const [priceRange, setPriceRange] = useState([0, 1000000]) // Ajusté pour inclure tous les prix
  const [suppliers, setSuppliers] = useState([])
  const [error, setError] = useState(null)
  const [userSupplierId, setUserSupplierId] = useState(null)

  // Nouvel état pour la pagination côté client
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(24)
  const [paginatedProducts, setPaginatedProducts] = useState([])

  // Load suppliers and products from API
  useEffect(() => {
    if (status !== 'authenticated') {
      setProducts([])
      setFilteredProducts([])
      setLoading(false)

      return
    }

    const fetchData = async () => {
      setLoading(true)

      try {
        // Charger les suppliers d'abord
        const supplierResponse = await apiClient.get('/suppliers')

        console.log('Fetching suppliers...', supplierResponse.data)

        if (process.env.NODE_ENV === 'development') {
          console.log('Suppliers response:', JSON.stringify(supplierResponse.data, null, 2))
        }

        const fetchedSuppliers = Array.isArray(supplierResponse.data.data) ? supplierResponse.data.data : []

        // Find current user's supplier ID
        if (session && session.user) {
          const currentUserSupplier = fetchedSuppliers.find(
            supplier => supplier.user_id?.toString() === session.user.id?.toString()
          )

          if (currentUserSupplier) {
            setUserSupplierId(currentUserSupplier.id.toString())
            console.log('Found user supplier ID:', currentUserSupplier.id)
          }
        }

        // Créer un map des suppliers pour un accès rapide
        const suppliersMap = {}

        fetchedSuppliers.forEach(supplier => {
          suppliersMap[supplier.id] = supplier
        })

        setSuppliers(fetchedSuppliers)
        setError(null)

        // Ensuite, charger les produits
        const productResponse = await apiClient.get('/products')

        console.log('Fetching products...', productResponse.data)

        if (process.env.NODE_ENV === 'development') {
          console.log('Products response:', JSON.stringify(productResponse.data, null, 2))
        }

        const fetchedProducts = Array.isArray(productResponse.data.data) ? productResponse.data.data : []

        // Normaliser les produits sans requêtes API supplémentaires
        const normalizedProducts = fetchedProducts.map(product => {
          // Trouver le supplier pour ce produit
          const supplier = suppliersMap[product.supplier_id] || {}

          // Déterminer le type de magasin
          const storeType =
            supplier.type === 'merchant'
              ? STORE_TYPES.NORMAL
              : supplier.type === 'workshop'
                ? STORE_TYPES.RAW_MATERIAL
                : supplier.type === 'importer'
                  ? STORE_TYPES.IMPORT
                  : 'unknown'

          // Normaliser les images
          const pictures =
            Array.isArray(product.pictures) && product.pictures.length > 0
              ? product.pictures.map(pic => ({
                  id: pic.id,
                  picture: buildImageUrl(typeof pic === 'string' ? pic : pic.picture)
                }))
              : []

          // Normaliser les prix
          const price = typeof product.price === 'number' ? product.price : Number.parseFloat(product.price) || 0

          const originalPrice =
            typeof product.originalPrice === 'number'
              ? product.originalPrice
              : Number.parseFloat(product.originalPrice) || price || 0

          // Normaliser storeId
          const storeId = product.supplier_id?.toString() || null

          return {
            id: product.id.toString(),
            name: product.name || 'Unknown Product',
            price,
            originalPrice,
            image: pictures.length > 0 ? pictures[0].picture : 'https://placehold.co/300x300',
            rating:
              product.reviews && product.reviews.length > 0
                ? product.reviews.reduce((acc, review) => acc + (review.rating || 0), 0) / product.reviews.length
                : 0,
            reviewCount: product.reviews?.length || 0,
            storeId,
            storeType,
            storeName: supplier.business_name || 'Unknown Store',
            storeLogo: supplier.picture ? buildImageUrl(supplier.picture) : 'https://placehold.co/100x100',
            category: product.category || 'Unknown',
            featured: product.featured || false,
            inStock: (product.quantity || 0) > 0,
            pictures,
            description: product.description || '',
            minimumQuantity: product.minimum_quantity || 1,
            reviews: product.reviews || [],
            isSaved: product.is_saved || false
          }
        })

        if (process.env.NODE_ENV === 'development') {
          console.log('Normalized products:', JSON.stringify(normalizedProducts.slice(0, 2), null, 2))
        }

        setProducts(normalizedProducts)
        setFilteredProducts(normalizedProducts)
        setError(null)
      } catch (error) {
        console.error('Error fetching data:', error)

        // Only set error if it's not an authentication error
        if (error.response?.status !== 401) {
          setError('Failed to load products. Please try again later.')
        }

        setProducts([])
        setFilteredProducts([])
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [status, session])

  // Filter and sort products
  useEffect(() => {
    if (status !== 'authenticated') return

    if (process.env.NODE_ENV === 'development') {
      console.log('Filtering with:', {
        selectedStoreId,
        selectedStoreType,
        searchTerm,
        priceRange,
        productsCount: products.length
      })
    }

    let filtered = [...products]

    // Exclude user's own products only when not viewing a specific store
    if (userSupplierId && !selectedStoreId) {
      filtered = filtered.filter(product => product.storeId !== userSupplierId)
    }

    // Filter by store type
    if (selectedStoreType !== 'all') {
      filtered = filtered.filter(product => product.storeType === selectedStoreType)
    }

    // Filter by store ID
    if (selectedStoreId) {
      filtered = filtered.filter(product => {
        const match = String(product.storeId) === String(selectedStoreId)

        if (process.env.NODE_ENV === 'development') {
          console.log(
            `Product ${product.id} storeId: ${product.storeId}, selectedStoreId: ${selectedStoreId}, match: ${match}`
          )
        }

        return match
      })
    }

    // Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase()

      filtered = filtered.filter(
        product =>
          product.name.toLowerCase().includes(term) ||
          product.category.toLowerCase().includes(term) ||
          product.storeName.toLowerCase().includes(term)
      )
    }

    // Filter by price range
    filtered = filtered.filter(product => {
      const inRange = product.price >= priceRange[0] && product.price <= priceRange[1]

      if (process.env.NODE_ENV === 'development') {
        console.log(
          `Product ${product.id} price: ${product.price}, priceRange: [${priceRange[0]}, ${priceRange[1]}], inRange: ${inRange}`
        )
      }

      return inRange
    })

    // Sort products
    switch (sortBy) {
      case 'price-low-high':
        filtered.sort((a, b) => a.price - b.price)
        break
      case 'price-high-low':
        filtered.sort((a, b) => b.price - a.price)
        break
      case 'rating':
        filtered.sort((a, b) => b.rating - a.rating)
        break
      case 'newest':
        filtered.sort((a, b) => b.id.localeCompare(a.id))
        break
      case 'popularity':
      default:
        filtered.sort((a, b) => b.reviewCount - a.reviewCount)
        break
    }

    if (process.env.NODE_ENV === 'development') {
      console.log(
        'Filtered products:',
        filtered.map(p => ({ id: p.id, name: p.name, storeId: p.storeId, price: p.price }))
      )
    }

    setFilteredProducts(filtered)
  }, [products, selectedStoreType, selectedStoreId, searchTerm, sortBy, priceRange, userSupplierId])

  // Effet pour paginer les produits filtrés
  useEffect(() => {
    const startIndex = (currentPage - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage

    setPaginatedProducts(filteredProducts.slice(startIndex, endIndex))
  }, [filteredProducts, currentPage, itemsPerPage])

  // Get product by ID
  const getProductById = productId => {
    return products.find(product => product.id === productId)
  }

  // Get products by store ID
  const getProductsByStoreId = storeId => {
    return products.filter(product => String(product.storeId) === String(storeId))
  }

  // Get featured products
  const getFeaturedProducts = () => {
    return products.filter(product => product.featured)
  }

  if (status === 'authenticated' && process.env.NODE_ENV === 'development') {
    console.log('ProductContext values:', {
      filteredProductsLength: filteredProducts.length,
      itemsPerPage,
      totalPages: Math.ceil(filteredProducts.length / itemsPerPage),
      currentPage
    })
  }

  return (
    <ProductContext.Provider
      value={{
        products,
        filteredProducts,
        paginatedProducts,
        selectedStoreType,
        setSelectedStoreType,
        selectedStoreId,
        setSelectedStoreId: id => {
          const storeId = id ? String(id) : null

          if (process.env.NODE_ENV === 'development') {
            console.log('Setting selectedStoreId:', storeId)
          }

          setSelectedStoreId(storeId)
        },
        searchTerm,
        setSearchTerm,
        sortBy,
        setSortBy,
        priceRange,
        setPriceRange,
        loading,
        error,
        getProductById,
        getProductsByStoreId,
        getFeaturedProducts,

        // Nouvelles propriétés pour la pagination
        currentPage,
        setCurrentPage,
        itemsPerPage,
        setItemsPerPage,
        totalPages: Math.ceil(filteredProducts.length / itemsPerPage)
      }}
    >
      {children}
    </ProductContext.Provider>
  )
}

// Custom hook to use the product context
export const useProduct = () => {
  const context = useContext(ProductContext)

  if (!context) {
    throw new Error('useProduct must be used within a ProductProvider')
  }

  return context
}
