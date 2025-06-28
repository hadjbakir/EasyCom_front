'use client'

import { useState, useEffect } from 'react'

import { motion, AnimatePresence } from 'framer-motion'
import { Box, Typography, IconButton, Select, MenuItem, useTheme, useMediaQuery, Skeleton } from '@mui/material'
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react'

const AnimatedPagination = ({
  currentPage,
  totalPages,
  itemsPerPage,
  totalItems,
  onPageChange,
  onItemsPerPageChange,
  loading = false,
  color = 'primary',
  size = 'medium',
  showItemsPerPage = true,
  showSummary = true,
  maxVisiblePages = 5
}) => {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
  const [visiblePages, setVisiblePages] = useState([])

  // Calculer les pages visibles
  useEffect(() => {
    let newVisiblePages = []
    const halfVisible = Math.floor(maxVisiblePages / 2)

    if (totalPages <= maxVisiblePages) {
      // Afficher toutes les pages si leur nombre est inférieur au maximum visible
      newVisiblePages = Array.from({ length: totalPages }, (_, i) => i + 1)
    } else if (currentPage <= halfVisible + 1) {
      // Près du début
      newVisiblePages = Array.from({ length: maxVisiblePages }, (_, i) => i + 1)
    } else if (currentPage >= totalPages - halfVisible) {
      // Près de la fin
      newVisiblePages = Array.from({ length: maxVisiblePages }, (_, i) => totalPages - maxVisiblePages + i + 1)
    } else {
      // Au milieu
      newVisiblePages = Array.from({ length: maxVisiblePages }, (_, i) => currentPage - halfVisible + i)
    }

    setVisiblePages(newVisiblePages)
  }, [currentPage, totalPages, maxVisiblePages])

  // Gestionnaires d'événements
  const handlePageClick = page => {
    if (page !== currentPage && page >= 1 && page <= totalPages) {
      onPageChange(null, page)
    }
  }

  const handleItemsPerPageChange = event => {
    onItemsPerPageChange(event)
  }

  // Styles
  const getButtonStyle = isActive => ({
    width: { xs: 36, sm: 40 },
    height: { xs: 36, sm: 40 },
    minWidth: { xs: 36, sm: 40 },
    borderRadius: '50%',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    cursor: isActive ? 'default' : 'pointer',
    backgroundColor: isActive ? theme.palette[color].main : 'transparent',
    color: isActive ? theme.palette[color].contrastText : theme.palette.text.primary,
    border: isActive ? 'none' : `1px solid ${theme.palette.divider}`,
    transition: 'all 0.3s ease',
    '&:hover': {
      backgroundColor: isActive
        ? theme.palette[color].main
        : theme.palette.mode === 'dark'
          ? 'rgba(255, 255, 255, 0.08)'
          : 'rgba(0, 0, 0, 0.04)',
      transform: isActive ? 'none' : 'translateY(-2px)',
      boxShadow: isActive ? 'none' : '0 4px 8px rgba(0, 0, 0, 0.1)'
    }
  })

  const navButtonStyle = {
    width: { xs: 36, sm: 40 },
    height: { xs: 36, sm: 40 },
    borderRadius: '50%',
    border: `1px solid ${theme.palette.divider}`,
    color: theme.palette.text.primary,
    transition: 'all 0.3s ease',
    '&:hover': {
      backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.04)',
      transform: 'translateY(-2px)',
      boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)'
    },
    '&.Mui-disabled': {
      opacity: 0.5,
      cursor: 'not-allowed'
    }
  }

  // Animations
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        staggerChildren: 0.1
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 }
  }

  const pageButtonVariants = {
    initial: { scale: 0.8, opacity: 0 },
    animate: { scale: 1, opacity: 1 },
    exit: { scale: 0.8, opacity: 0 },
    hover: { scale: 1.1 }
  }

  // Calcul des indices pour l'affichage du résumé
  const startIndex = totalItems === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1
  const endIndex = Math.min(currentPage * itemsPerPage, totalItems)

  if (loading) {
    return (
      <Box sx={{ mt: 6, width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', justifyContent: 'center' }}>
          {Array.from({ length: 7 }).map((_, index) => (
            <Skeleton key={index} variant='circular' width={40} height={40} animation='wave' />
          ))}
        </Box>
        <Skeleton variant='text' width={200} height={30} sx={{ mt: 2 }} animation='wave' />
      </Box>
    )
  }

  return (
    <motion.div
      variants={containerVariants}
      initial='hidden'
      animate='visible'
      style={{
        width: '100%',
        marginTop: '2rem',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center'
      }}
    >
      <Box
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 1,
          justifyContent: 'center',
          p: 2,
          borderRadius: 2,
          backgroundColor: theme.palette.background.paper,
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
          width: 'fit-content',
          maxWidth: '100%'
        }}
      >
        {/* Bouton première page */}
        <IconButton
          onClick={() => handlePageClick(1)}
          disabled={currentPage === 1}
          aria-label='First page'
          sx={navButtonStyle}
        >
          <ChevronsLeft size={size === 'small' ? 16 : size === 'large' ? 24 : 20} />
        </IconButton>

        {/* Bouton page précédente */}
        <IconButton
          onClick={() => handlePageClick(currentPage - 1)}
          disabled={currentPage === 1}
          aria-label='Previous page'
          sx={navButtonStyle}
        >
          <ChevronLeft size={size === 'small' ? 16 : size === 'large' ? 24 : 20} />
        </IconButton>

        {/* Numéros de page */}
        <AnimatePresence mode='wait'>
          {!isMobile &&
            visiblePages.map(page => (
              <motion.div
                key={page}
                variants={pageButtonVariants}
                initial='initial'
                animate='animate'
                exit='exit'
                whileHover='hover'
                transition={{ duration: 0.2 }}
              >
                <Box component='button' onClick={() => handlePageClick(page)} sx={getButtonStyle(page === currentPage)}>
                  {page}
                </Box>
              </motion.div>
            ))}
        </AnimatePresence>

        {/* Affichage mobile simplifié */}
        {isMobile && (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              minWidth: 80,
              px: 2,
              py: 1,
              borderRadius: 1,
              backgroundColor: theme.palette.background.default
            }}
          >
            <Typography variant='body1' fontWeight='medium'>
              {currentPage} / {totalPages}
            </Typography>
          </Box>
        )}

        {/* Bouton page suivante */}
        <IconButton
          onClick={() => handlePageClick(currentPage + 1)}
          disabled={currentPage === totalPages}
          aria-label='Next page'
          sx={navButtonStyle}
        >
          <ChevronRight size={size === 'small' ? 16 : size === 'large' ? 24 : 20} />
        </IconButton>

        {/* Bouton dernière page */}
        <IconButton
          onClick={() => handlePageClick(totalPages)}
          disabled={currentPage === totalPages}
          aria-label='Last page'
          sx={navButtonStyle}
        >
          <ChevronsRight size={size === 'small' ? 16 : size === 'large' ? 24 : 20} />
        </IconButton>
      </Box>

      {/* Sélecteur d'éléments par page et résumé */}
      <motion.div
        variants={itemVariants}
        style={{
          display: 'flex',
          flexDirection: isMobile ? 'column' : 'row',
          alignItems: 'center',
          gap: '1rem',
          marginTop: '1rem'
        }}
      >
        {showItemsPerPage && (
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Typography variant='body2' sx={{ mr: 1 }}>
              Items per page:
            </Typography>
            <Select
              value={itemsPerPage}
              onChange={handleItemsPerPageChange}
              size='small'
              sx={{
                minWidth: 80,
                height: 32,
                '& .MuiSelect-select': {
                  py: 0.5
                }
              }}
            >
              <MenuItem value={12}>12</MenuItem>
              <MenuItem value={24}>24</MenuItem>
              <MenuItem value={48}>48</MenuItem>
              <MenuItem value={96}>96</MenuItem>
            </Select>
          </Box>
        )}

        {showSummary && (
          <Typography
            variant='body2'
            color='text.secondary'
            sx={{
              textAlign: isMobile ? 'center' : 'left',
              mt: isMobile ? 1 : 0
            }}
          >
            Showing {startIndex} to {endIndex} of {totalItems} items
          </Typography>
        )}
      </motion.div>
    </motion.div>
  )
}

export default AnimatedPagination
