'use client'

// React Imports
import { useState, useEffect, useMemo } from 'react'

// MUI Imports
import CardContent from '@mui/material/CardContent'
import Grid from '@mui/material/Grid2'
import MenuItem from '@mui/material/MenuItem'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'

// Component Imports
import CustomTextField from '@core/components/mui/TextField'

// API Imports
import apiClient from '@/libs/api'

/**
 * ProductTableFilters component for filtering product data
 * @param {object} props - Component props
 * @param {function} props.setData - Function to set filtered data
 * @param {array} props.tableData - Original table data
 */
const ProductTableFilters = ({ setData, tableData }) => {
  // States
  const [categoryId, setCategoryId] = useState('')
  const [priceMin, setPriceMin] = useState('')
  const [priceMax, setPriceMax] = useState('')
  const [categories, setCategories] = useState({}) // Map category_id -> name
  const [error, setError] = useState(null)

  // Memoized unique category IDs from tableData
  const uniqueCategoryIds = useMemo(
    () => [...new Set(tableData.map(product => product.category_id).filter(Boolean))],
    [tableData]
  )

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await apiClient.get('/categories')
        const categoriesData = response.data?.data || response.data || []

        const categoriesMap = categoriesData.reduce((acc, category) => {
          acc[category.id] = category.name

          return acc
        }, {})

        setCategories(categoriesMap)

        if (process.env.NODE_ENV !== 'production') {
          console.log('Categories fetched for filters:', categoriesMap)
        }
      } catch (err) {
        if (process.env.NODE_ENV !== 'production') {
          console.error('Failed to fetch categories:', err.message, err.response?.data)
        }

        setError('Failed to load categories.')
      }
    }

    fetchCategories()
  }, [])

  // Apply filters
  useEffect(() => {
    const filteredData = tableData.filter(product => {
      const productCategoryId = product.category_id || ''
      const productPrice = parseFloat(product.price) || 0

      if (categoryId && productCategoryId !== categoryId) return false
      if (priceMin && productPrice < parseFloat(priceMin)) return false
      if (priceMax && productPrice > parseFloat(priceMax)) return false

      return true
    })

    setData(filteredData)

    if (process.env.NODE_ENV !== 'production') {
      console.log('Product filters applied:', {
        categoryId,
        priceMin,
        priceMax,
        filteredCount: filteredData.length,
        totalCount: tableData.length
      })
    }
  }, [categoryId, priceMin, priceMax, tableData, setData])

  // Reset filters
  const resetFilters = () => {
    setCategoryId('')
    setPriceMin('')
    setPriceMax('')
    setData(tableData)

    if (process.env.NODE_ENV !== 'production') {
      console.log('Product filters reset')
    }
  }

  return (
    <CardContent>
      {error && (
        <Typography color='error' className='mb-4'>
          {error}
        </Typography>
      )}
      <Grid container spacing={6}>
        <Grid size={{ xs: 12, sm: 4 }}>
          <CustomTextField
            select
            fullWidth
            id='select-category'
            value={categoryId}
            onChange={e => setCategoryId(e.target.value)}
            slotProps={{ select: { displayEmpty: true } }}
          >
            <MenuItem value=''>Select Category</MenuItem>
            {uniqueCategoryIds.map(id => (
              <MenuItem key={id} value={id}>
                {categories[id] || `Category ${id}`}
              </MenuItem>
            ))}
          </CustomTextField>
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <CustomTextField
            fullWidth
            id='price-min'
            type='number'
            placeholder='Min Price'
            value={priceMin}
            onChange={e => setPriceMin(e.target.value)}
            inputProps={{ min: 0, step: '0.01' }}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <CustomTextField
            fullWidth
            id='price-max'
            type='number'
            placeholder='Max Price'
            value={priceMax}
            onChange={e => setPriceMax(e.target.value)}
            inputProps={{ min: 0, step: '0.01' }}
          />
        </Grid>
        <Grid size={{ xs: 12 }}>
          <Button variant='outlined' onClick={resetFilters}>
            Reset Filters
          </Button>
        </Grid>
      </Grid>
    </CardContent>
  )
}

export default ProductTableFilters
