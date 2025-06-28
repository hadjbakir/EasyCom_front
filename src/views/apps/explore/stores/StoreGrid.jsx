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
  Button,
  CircularProgress
} from '@mui/material'
import { Search, X, Filter } from 'lucide-react'

import { useStore } from '@/components/contexts/StoreContext'
import StoreCard from './StoreCard'
import AnimatedPagination from '@/components/ui/pagination/AnimatedPagination'

const StoreGrid = ({ onViewStoreProducts }) => {
  const {
    filteredStores,
    paginatedStores,
    searchTerm,
    setSearchTerm,
    loading,

    // Propriétés pour la pagination
    currentPage,
    setCurrentPage,
    itemsPerPage,
    setItemsPerPage,
    totalPages
  } = useStore()

  const [showFilters, setShowFilters] = useState(false)
  const [sortBy, setSortBy] = useState('popularity')
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

      // Faire défiler vers le haut de la grille de magasins
      window.scrollTo({
        top: document.getElementById('stores-grid-top').offsetTop - 100,
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

  // Animations pour les magasins
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
      <Box id='stores-grid-top' sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant='h5'>Stores ({filteredStores.length})</Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <TextField
            placeholder='Search stores...'
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
              <MenuItem value='rating'>Highest Rating</MenuItem>
              <MenuItem value='newest'>Newest</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </Box>

      {/* Filtres spécifiques aux magasins si nécessaire */}
      {showFilters && (
        <Box sx={{ mb: 4, p: 2, bgcolor: 'background.paper', borderRadius: 1, boxShadow: 1 }}>
          {/* Contenu des filtres pour les magasins */}
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
              {paginatedStores.length > 0 ? (
                paginatedStores.map((store, index) => (
                  <Grid item xs={12} sm={6} md={4} lg={3} key={store.id}>
                    <motion.div
                      variants={itemVariants}
                      style={{ height: '100%' }} // Assurer une hauteur de 100%
                    >
                      <Box sx={{ height: '100%' }}>
                        {' '}
                        {/* Conteneur avec hauteur fixe */}
                        <StoreCard store={store} onViewStoreProducts={onViewStoreProducts} />
                      </Box>
                    </motion.div>
                  </Grid>
                ))
              ) : (
                <Grid item xs={12}>
                  <Box sx={{ textAlign: 'center', py: 6 }}>
                    <Typography variant='h6'>No stores found</Typography>
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
      {filteredStores.length > 0 && (
        <AnimatedPagination
          currentPage={currentPage}
          totalPages={totalPages || 1}
          itemsPerPage={itemsPerPage}
          totalItems={filteredStores.length}
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

export default StoreGrid
