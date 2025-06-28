'use client'

import { Box, Tabs, Tab, Typography, Chip } from '@mui/material'
import { Store, Factory, Ship, ShoppingBag } from 'lucide-react'

import { useProduct } from '@/components/contexts/ProductContext'
import { STORE_TYPES } from '@/components/contexts/StoreContext'

const StoreTypeFilter = () => {
  const { selectedStoreType, setSelectedStoreType, products } = useProduct()

  // Count products by store type, with fallback for undefined products
  const normalCount = products ? products.filter(product => product.storeType === STORE_TYPES.NORMAL).length : 0

  const rawMaterialCount = products
    ? products.filter(product => product.storeType === STORE_TYPES.RAW_MATERIAL).length
    : 0

  const importCount = products ? products.filter(product => product.storeType === STORE_TYPES.IMPORT).length : 0
  const totalCount = products ? products.length : 0

  const handleChange = (event, newValue) => {
    setSelectedStoreType(newValue)
  }

  return (
    <Box sx={{ width: '100%', mb: 4 }}>
      <Typography variant='h6' sx={{ mb: 2 }}>
        Shop by Store Type
      </Typography>
      <Tabs
        value={selectedStoreType}
        onChange={handleChange}
        variant='scrollable'
        scrollButtons='auto'
        aria-label='store type tabs'
      >
        <Tab
          value='all'
          label={
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <ShoppingBag size={18} />
              <span>All Stores</span>
              <Chip size='small' label={totalCount} />
            </Box>
          }
        />
        <Tab
          value={STORE_TYPES.NORMAL}
          label={
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Store size={18} />
              <span>Retail Stores</span>
              <Chip size='small' label={normalCount} />
            </Box>
          }
        />
        <Tab
          value={STORE_TYPES.RAW_MATERIAL}
          label={
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Factory size={18} />
              <span>Raw Material Stores</span>
              <Chip size='small' label={rawMaterialCount} />
            </Box>
          }
        />
        <Tab
          value={STORE_TYPES.IMPORT}
          label={
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Ship size={18} />
              <span>Import Stores</span>
              <Chip size='small' label={importCount} />
            </Box>
          }
        />
      </Tabs>
    </Box>
  )
}

export default StoreTypeFilter
