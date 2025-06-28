'use client'

// React Imports
import { useState, useEffect, useMemo } from 'react'

// MUI Imports
import CardContent from '@mui/material/CardContent'
import Grid from '@mui/material/Grid2'
import MenuItem from '@mui/material/MenuItem'
import Button from '@mui/material/Button'

// Component Imports
import CustomTextField from '@core/components/mui/TextField'

// API Imports
import apiClient from '@/libs/api'

/**
 * TableFilters component for filtering store data
 * @param {object} props - Component props
 * @param {function} props.setData - Function to set filtered data
 * @param {array} props.tableData - Original table data
 */
const TableFilters = ({ setData, tableData }) => {
  // States
  const [type, setType] = useState('')
  const [domainId, setDomainId] = useState('')
  const [domains, setDomains] = useState({}) // Map domain_id -> name

  // Memoized unique domain IDs and type IDs from tableData
  const uniqueDomainIds = useMemo(
    () => [...new Set(tableData.map(store => store.domain_id).filter(Boolean))],
    [tableData]
  )

  const uniqueTypeIds = useMemo(() => [...new Set(tableData.map(store => store.type).filter(Boolean))], [tableData])

  // Fetch domains
  useEffect(() => {
    const fetchDomains = async () => {
      try {
        const response = await apiClient.get('/domains')
        const domainsData = response.data?.data || response.data || []

        const domainsMap = domainsData.reduce((acc, domain) => {
          acc[domain.id] = domain.name

          return acc
        }, {})

        setDomains(domainsMap)

        if (process.env.NODE_ENV !== 'production') {
          console.log('Domains fetched for filters:', domainsMap)
        }
      } catch (err) {
        if (process.env.NODE_ENV !== 'production') {
          console.error('Failed to fetch domains:', err.message, err.response?.data)
        }

        setDomains({})
      }
    }

    fetchDomains()
  }, [])

  // Apply filters
  useEffect(() => {
    const filteredData = tableData.filter(store => {
      const storeType = store.type?.toLowerCase() || ''
      if (type && storeType !== type.toLowerCase()) return false
      if (domainId && store.domain_id !== domainId) return false
      return true
    })

    setData(filteredData)

    if (process.env.NODE_ENV !== 'production') {
      console.log('Filters applied:', {
        type,
        domainId,
        filteredCount: filteredData.length,
        totalCount: tableData.length,
        uniqueTypeIds // Log types for debugging
      })
    }
  }, [type, domainId, tableData, setData, uniqueTypeIds])

  // Reset filters
  const resetFilters = () => {
    setType('')
    setDomainId('')
    setData(tableData)

    if (process.env.NODE_ENV !== 'production') {
      console.log('Filters reset')
    }
  }

  // Capitalize type for display
  const capitalizeType = type => {
    return type ? type.charAt(0).toUpperCase() + type.slice(1) : type
  }

  // Log unique types for initial debugging
  if (process.env.NODE_ENV !== 'production') {
    console.log('Unique store types extracted:', uniqueTypeIds)
  }

  return (
    <CardContent>
      <Grid container spacing={6}>
        <Grid size={{ xs: 12, sm: 4 }}>
          <CustomTextField
            select
            fullWidth
            id='select-type'
            value={type}
            onChange={e => setType(e.target.value)}
            slotProps={{ select: { displayEmpty: true } }}
          >
            <MenuItem value=''>Select Type</MenuItem>
            {uniqueTypeIds.map(id => (
              <MenuItem key={id} value={id}>
                {capitalizeType(id)}
              </MenuItem>
            ))}
          </CustomTextField>
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <CustomTextField
            select
            fullWidth
            id='select-domain'
            value={domainId}
            onChange={e => setDomainId(e.target.value)}
            slotProps={{ select: { displayEmpty: true } }}
          >
            <MenuItem value=''>Select Domain</MenuItem>
            {uniqueDomainIds.map(id => (
              <MenuItem key={id} value={id}>
                {domains[id] || `Domain ${id}`}
              </MenuItem>
            ))}
          </CustomTextField>
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

export default TableFilters
