'use client'

// MUI Imports
import Grid from '@mui/material/Grid2'

// Component Imports
import Skill from './create-skill'

const StoreDetails = () => {
  return (
    <Grid container spacing={6}>

      <Grid size={{ xs: 12 }}>
        <Skill />

      </Grid>


    </Grid>
  )
}

export default StoreDetails
