'use client'

import { useState } from 'react'

import { motion, AnimatePresence } from 'framer-motion'

import {
  Grid,
  Box,
  Typography,
  TextField,
  InputAdornment,
  IconButton,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Slider,
  Button,
  CircularProgress
} from '@mui/material'
import { Search, X, Filter } from 'lucide-react'

import { useProduct } from '@/components/contexts/ProductContext'
import ProductCard from './ProductCard'
import AnimatedPagination from '@/components/ui/pagination/AnimatedPagination'

const ProductGrid = ({ onAddToCart }) => {
  const {
    filteredProducts,
    paginatedProducts,
    searchTerm,
    setSearchTerm,
    sortBy,
    setSortBy,
    priceRange,
    setPriceRange,
    loading,
    selectedStoreId,
    selectedStoreType,

    // Propriétés pour la pagination
    currentPage,
    setCurrentPage,
    itemsPerPage,
    setItemsPerPage,
    totalPages
  } = useProduct()

  const [showFilters, setShowFilters] = useState(false)
  const [localPriceRange, setLocalPriceRange] = useState(priceRange)
  const [isChangingPage, setIsChangingPage] = useState(false)

  const handleSearchChange = e => {
    setSearchTerm(e.target.value)
    setCurrentPage(1) // Réinitialiser à la première page lors d'une recherche
  }

  const handleClearSearch = () => {
    setSearchTerm('')
    setCurrentPage(1) // Réinitialiser à la première page lors de l'effacement de la recherche
  }

  const handleSortChange = e => {
    setSortBy(e.target.value)
  }

  const handlePriceChange = (event, newValue) => {
    setLocalPriceRange(newValue)
  }

  const handlePriceChangeCommitted = (event, newValue) => {
    setPriceRange(newValue)
    setCurrentPage(1) // Réinitialiser à la première page lors du changement de filtre de prix
  }

  const toggleFilters = () => {
    setShowFilters(!showFilters)
  }

  // Gestionnaire de changement de page avec animation
  const handlePageChange = (event, newPage) => {
    if (newPage === currentPage) return

    setIsChangingPage(true)

    // Petit délai pour permettre à l'animation de sortie de se terminer
    setTimeout(() => {
      setCurrentPage(newPage)

      // Faire défiler vers le haut de la grille de produits
      window.scrollTo({
        top: document.getElementById('products-grid-top').offsetTop - 100,
        behavior: 'smooth'
      })

      // Réactiver l'animation d'entrée après le changement de page
      setTimeout(() => {
        setIsChangingPage(false)
      }, 100)
    }, 300)
  }

  // Gestionnaire de changement d'éléments par page
  const handleItemsPerPageChange = event => {
    setItemsPerPage(Number(event.target.value))
    setCurrentPage(1) // Réinitialiser à la première page
  }

  // Animations pour les produits
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05
      }
    },
    exit: {
      opacity: 0,
      transition: {
        duration: 0.2
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.4,
        ease: 'easeOut'
      }
    },
    exit: {
      opacity: 0,
      y: -20,
      transition: {
        duration: 0.2
      }
    }
  }

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress />
      </Box>
    )
  }

  return (
    <Box>
      <Box
        id='products-grid-top'
        sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}
      >
        <Typography variant='h5'>Products ({filteredProducts.length})</Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <TextField
            placeholder='Search products...'
            value={searchTerm}
            onChange={handleSearchChange}
            size='small'
            sx={{ width: 250 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position='start'>
                  <Search size={20} />
                </InputAdornment>
              ),
              endAdornment: searchTerm && (
                <InputAdornment position='end'>
                  <IconButton size='small' onClick={handleClearSearch}>
                    <X size={16} />
                  </IconButton>
                </InputAdornment>
              )
            }}
          />
          <Button
            variant={showFilters ? 'contained' : 'outlined'}
            startIcon={<Filter size={16} />}
            onClick={toggleFilters}
            aria-label='Toggle filters'
          >
            Filters
          </Button>
          <FormControl size='small' sx={{ minWidth: 150 }}>
            <InputLabel>Sort By</InputLabel>
            <Select value={sortBy} onChange={handleSortChange} label='Sort By'>
              <MenuItem value='popularity'>Popularity</MenuItem>
              <MenuItem value='price-low-high'>Price: Low to High</MenuItem>
              <MenuItem value='price-high-low'>Price: High to Low</MenuItem>
              <MenuItem value='rating'>Highest Rating</MenuItem>
              <MenuItem value='newest'>Newest</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </Box>

      {showFilters && (
        <Box sx={{ mb: 4, p: 2, bgcolor: 'background.paper', borderRadius: 1, boxShadow: 1 }}>
          <Typography variant='subtitle1' gutterBottom>
            Price Range
          </Typography>
          <Box sx={{ px: 2 }}>
            <Slider
              value={localPriceRange}
              onChange={handlePriceChange}
              onChangeCommitted={handlePriceChangeCommitted}
              valueLabelDisplay='auto'
              min={0}
              max={200000} // Ajusté pour inclure les prix élevés
              step={1000}
              marks={[
                { value: 0, label: '0 DA' },
                { value: 50000, label: '50K DA' },
                { value: 100000, label: '100K DA' },
                { value: 200000, label: '200K+ DA' }
              ]}
              valueLabelFormat={value => `${value} DA`}
            />
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
            <Typography variant='body2'>{localPriceRange[0]} DA</Typography>
            <Typography variant='body2'>{localPriceRange[1]} DA</Typography>
          </Box>
        </Box>
      )}

      <AnimatePresence mode='wait'>
        {!isChangingPage && (
          <motion.div
            key={`page-${currentPage}`}
            variants={containerVariants}
            initial='hidden'
            animate='visible'
            exit='exit'
          >
            <Grid container spacing={3}>
              {paginatedProducts.length > 0 ? (
                paginatedProducts.map((product, index) => (
                  <Grid item xs={12} sm={6} md={4} lg={3} key={product.id}>
                    <motion.div
                      variants={itemVariants}
                      style={{ height: '100%' }} // Assurer une hauteur de 100%
                    >
                      <Box sx={{ height: '100%' }}>
                        {' '}
                        {/* Conteneur avec hauteur fixe */}
                        <ProductCard product={product} onAddToCart={onAddToCart} />
                      </Box>
                    </motion.div>
                  </Grid>
                ))
              ) : (
                <Grid item xs={12}>
                  <Box sx={{ textAlign: 'center', py: 6 }}>
                    <Typography variant='h6'>No products found</Typography>
                    <Typography variant='body2' color='text.secondary'>
                      Try adjusting your search or filters
                    </Typography>
                  </Box>
                </Grid>
              )}
            </Grid>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Composant de pagination amélioré */}
      {filteredProducts.length > 0 && (
        <AnimatedPagination
          currentPage={currentPage}
          totalPages={totalPages || 1}
          itemsPerPage={itemsPerPage}
          totalItems={filteredProducts.length}
          onPageChange={handlePageChange}
          onItemsPerPageChange={handleItemsPerPageChange}
          loading={isChangingPage}
          color='primary'
          size='medium'
          showItemsPerPage={true}
          showSummary={true}
          maxVisiblePages={5}
        />
      )}
    </Box>
  )
}

export default ProductGrid
