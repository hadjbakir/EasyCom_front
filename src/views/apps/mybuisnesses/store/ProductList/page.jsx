'use client'

// React Imports
import { useParams } from 'next/navigation'

// MUI Imports
import Grid from '@mui/material/Grid2'

// Component Imports
import ProductListTable from '@/views/apps/mybuisnesses/store/ProductList/ProductListTable'
import ProductCard from '@/views/apps/mybuisnesses/store/ProductList/ProductCard'

/**
 * ECommerceProductsList component - Displays product list and card for a store
 * @returns {JSX.Element} - Rendered component
 */
const ECommerceProductsList = () => {
  // Hooks
  const { id: storeId } = useParams()

  return (
    <Grid container spacing={6}>
      {/* <Grid size={{ xs: 12 }}>
        <ProductCard />
      </Grid> */}
      <Grid size={{ xs: 12 }}>
        <ProductListTable storeId={storeId} />
      </Grid>
    </Grid>
  )
}

export default ECommerceProductsList
