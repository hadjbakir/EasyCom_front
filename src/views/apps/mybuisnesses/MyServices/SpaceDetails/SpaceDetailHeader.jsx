'use client'

// React Imports
import { useState } from 'react'

// MUI Imports
import Card from '@mui/material/Card'
import CardMedia from '@mui/material/CardMedia'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import CircularProgress from '@mui/material/CircularProgress'
import Alert from '@mui/material/Alert'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import Box from '@mui/material/Box'

// Icon Imports
import { ArrowLeft, MapPin, Calendar, Edit2, Trash2 } from 'lucide-react'

const SpaceDetailHeader = ({ data, onBack, onEdit, onDelete }) => {
  // States
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // Log image for debugging
  if (process.env.NODE_ENV !== 'production') {
    console.log('SpaceDetailHeader: data.mainImage:', data?.mainImage)
  }

  // Format date
  const formatDate = dateString => {
    return new Date(dateString).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
  }

  if (loading) {
    return (
      <Card sx={{ marginBottom: 6 }}>
        <CardContent sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', p: 6 }}>
          <CircularProgress />
          <Typography sx={{ ml: 2 }}>Loading workspace data...</Typography>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card sx={{ marginBottom: 6 }}>
        <CardContent>
          <Alert severity="error">{error}</Alert>
        </CardContent>
      </Card>
    )
  }

  // Banner image - use mainImage from data or default
  const bannerImage = data?.mainImage || '/images/spaces/default.jpg'

  return (
    <Card sx={{ marginBottom: 6 }}>
      <CardMedia image={bannerImage} sx={{ height: 250 }} />
      <CardContent sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 5, justifyContent: { xs: 'center', md: 'space-between' }, alignItems: { xs: 'center', md: 'end' }, pt: 0 }}>
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, width: '100%', justifyContent: { xs: 'center', sm: 'space-between' }, alignItems: { xs: 'center', sm: 'end' }, gap: 6 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: { xs: 'center', sm: 'start' }, gap: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Typography variant="h4">{data?.name || 'Workspace'}</Typography>
              <Chip
                label={data?.is_active ? 'Active' : 'Inactive'}
                color={data?.is_active ? 'success' : 'error'}
                size="small"
              />
            </Box>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 4, justifyContent: { xs: 'center', sm: 'start' } }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <i className="tabler-palette text-base" />
                <Typography sx={{ fontWeight: 'medium' }}>
                  {data?.type === 'studio' ? 'Studio Space' : 'Coworking Space'}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <MapPin size={16} />
                <Typography sx={{ fontWeight: 'medium' }}>{data?.city || data?.address || 'N/A'}</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Calendar size={16} />
                <Typography sx={{ fontWeight: 'medium' }}>
                  Since {data?.created_at ? formatDate(data?.created_at) : 'N/A'}
                </Typography>
              </Box>
            </Box>
          </Box>
          <Box sx={{ display: 'flex', gap: 2, mt: { xs: 4, sm: 0 } }}>
            <Button
              variant="contained"
              color="primary"
              startIcon={<Edit2 size={18} />}
              onClick={onEdit}
            >
              Edit Space
            </Button>
            <Button
              variant="outlined"
              color="error"
              startIcon={<Trash2 size={18} />}
              onClick={onDelete}
            >
              Delete Space
            </Button>
            <Button
              variant="outlined"
              startIcon={<ArrowLeft size={18} />}
              onClick={onBack}
            >
              Back to List
            </Button>
          </Box>
        </Box>
      </CardContent>
    </Card>
  )
}

export default SpaceDetailHeader
