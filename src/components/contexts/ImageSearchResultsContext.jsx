'use client'

import { createContext, useContext, useState, useEffect, useMemo } from 'react'

const ImageSearchResultsContext = createContext()

export const ImageSearchResultsProvider = ({ children }) => {
  const [results, setResultsState] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState('popularity')
  const [priceRange, setPriceRange] = useState([0, 200000])
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(12)
  const [isRestoring, setIsRestoring] = useState(true)

  // Restaure les résultats depuis le sessionStorage au chargement
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = window.sessionStorage.getItem('imageSearchResults')

      if (stored) setResultsState(JSON.parse(stored))
      setIsRestoring(false)
    }
  }, [])

  // Met à jour le state et le sessionStorage
  const setResults = data => {
    setResultsState(data)

    if (typeof window !== 'undefined') {
      window.sessionStorage.setItem('imageSearchResults', JSON.stringify(data))
    }
  }

  // Filtrage par recherche et prix
  const filteredProducts = useMemo(() => {
    return results.filter(product => {
      const matchesSearch = product.name?.toLowerCase().includes(searchTerm.toLowerCase())
      const price = typeof product.price === 'number' ? product.price : parseFloat(product.price)
      const matchesPrice = price >= priceRange[0] && price <= priceRange[1]

      return matchesSearch && matchesPrice
    })
  }, [results, searchTerm, priceRange])

  // Tri
  const sortedProducts = useMemo(() => {
    let sorted = [...filteredProducts]

    switch (sortBy) {
      case 'price-low-high':
        sorted.sort((a, b) => a.price - b.price)
        break
      case 'price-high-low':
        sorted.sort((a, b) => b.price - a.price)
        break
      case 'rating':
        sorted.sort((a, b) => (b.rating || 0) - (a.rating || 0))
        break
      case 'newest':
        sorted.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        break
      default:
        break
    }

    return sorted
  }, [filteredProducts, sortBy])

  // Pagination
  const totalPages = Math.ceil(sortedProducts.length / itemsPerPage)

  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage

    return sortedProducts.slice(start, start + itemsPerPage)
  }, [sortedProducts, currentPage, itemsPerPage])

  return (
    <ImageSearchResultsContext.Provider
      value={{
        results,
        setResults,
        searchTerm,
        setSearchTerm,
        sortBy,
        setSortBy,
        priceRange,
        setPriceRange,
        currentPage,
        setCurrentPage,
        itemsPerPage,
        setItemsPerPage,
        totalPages,
        filteredProducts,
        paginatedProducts,
        isRestoring
      }}
    >
      {children}
    </ImageSearchResultsContext.Provider>
  )
}

export const useImageSearchResults = () => useContext(ImageSearchResultsContext)
