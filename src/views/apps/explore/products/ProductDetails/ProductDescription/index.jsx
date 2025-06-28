'use client'

// ** React Imports
import { useState } from 'react'

import { Tab, Tabs, Box } from '@mui/material'

import Description from './Description'
import StoreDetails from './StoreDetails'
import Reviews from './Reviews'

const ProductDescription = ({ product }) => {
  const [value, setValue] = useState('description')

  const handleChange = (event, newValue) => {
    setValue(newValue)
  }

  return (
    <Box sx={{ width: '100%' }}>
      <Tabs
        value={value}
        onChange={handleChange}
        variant='fullWidth'
        sx={{
          '& .MuiTabs-indicator': {
            backgroundColor: 'primary.main'
          }
        }}
      >
        <Tab label='Description' value='description' />
        <Tab label='Store Details' value='storeDetails' />
        <Tab label='Reviews' value='reviews' />
      </Tabs>

      <Box sx={{ mt: 3 }}>
        {value === 'description' && <Description product={product} />}
        {value === 'storeDetails' && <StoreDetails product={product} />}
        {value === 'reviews' && <Reviews productId={product?.id} supplierId={product?.supplier_id} />}
      </Box>
    </Box>
  )
}

export default ProductDescription
