'use client'

// MUI Imports
import Grid from '@mui/material/Grid2'

// Component Imports
import StoreListTable from './StoreListTable'

/**
 * MyStores component - Main component for displaying user's stores
 */
const MyStores = () => {
  return (
    <Grid container spacing={6}>
      <Grid size={{ xs: 12 }}>
        <StoreListTable />
      </Grid>
    </Grid>
  )
}

export default MyStores
