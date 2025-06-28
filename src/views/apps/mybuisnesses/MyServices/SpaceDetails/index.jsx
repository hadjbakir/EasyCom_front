'use client'

// React Imports
import { useState, useEffect } from 'react'

import { useRouter } from 'next/navigation'

import { useSession } from 'next-auth/react'

// MUI Imports
import Grid from '@mui/material/Grid2'
import Tab from '@mui/material/Tab'
import TabContext from '@mui/lab/TabContext'
import TabPanel from '@mui/lab/TabPanel'
import {
  Card,
  CardContent,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  CircularProgress,
  Typography
} from '@mui/material'

// Icon Imports
import { Home, Image, Calendar, Star } from 'lucide-react'

// Component Imports
import SpaceDetailHeader from './SpaceDetailHeader'
import CustomTabList from '@core/components/mui/TabList'
import OverviewTab from './tabs/OverviewTab'
import ImagesTab from './tabs/ImagesTab'
import EditDrawer from './EditDrawer'
import ReviewsTab from './tabs/ReviewsTab'

import apiClient from '@/libs/api'

const STORAGE_BASE_URL = (process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000').replace(/\/+$/, '')

// Helper function to construct workspace main picture URL
const constructMainPictureUrl = picturePath => {
  if (!picturePath) return '/images/spaces/default.jpg'
  if (picturePath.startsWith('http://') || picturePath.startsWith('https://')) return picturePath
  const cleanPath = picturePath.replace(/^\/+/, '')

  return `${STORAGE_BASE_URL}/storage/${cleanPath}`
}

// Helper function to construct workspace additional images URLs
const constructWorkspaceImageUrl = imagePath => {
  if (!imagePath) return null
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) return imagePath
  const cleanPath = imagePath.replace(/^\/+/, '')

  return `${STORAGE_BASE_URL}/storage/${cleanPath}`
}

// Day mapping: number (1-7) to name (aligned with backend)
const dayNumberToName = {
  1: 'saturday',
  2: 'sunday',
  3: 'monday',
  4: 'tuesday',
  5: 'wednesday',
  6: 'thursday',
  7: 'friday'
}

const SpaceDetailView = ({ id }) => {
  // States
  const [activeTab, setActiveTab] = useState('overview')
  const [spaceData, setSpaceData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [editDrawerOpen, setEditDrawerOpen] = useState(false)

  // Get session data
  const { data: session } = useSession()
  const router = useRouter()

  // Map workspace data
  const mapWorkspaceData = workspace => {
    if (!workspace) {
      console.warn('mapWorkspaceData: Received empty workspace data')

      return null
    }

    const mainImage = constructMainPictureUrl(workspace.picture)
    let workspaceImages = []

    if (workspace.images && Array.isArray(workspace.images) && workspace.images.length > 0) {
      workspaceImages = workspace.images
        .map(img => {
          if (!img || !img.image_url) {
            console.log('Invalid image object:', img)

            return null
          }

          return { id: img.id, image_url: constructWorkspaceImageUrl(img.image_url) }
        })
        .filter(img => img !== null)
    }

    // Map working_hours to availability
    let availability = {}

    if (workspace.working_hours && Array.isArray(workspace.working_hours) && workspace.working_hours.length > 0) {
      workspace.working_hours.forEach(hour => {
        const dayName = dayNumberToName[hour.day]

        if (dayName) {
          availability[dayName] = {
            open: hour.is_open,
            hours: hour.is_open && hour.time_from && hour.time_to ? `${hour.time_from} - ${hour.time_to}` : ''
          }
        }
      })
    }

    return {
      id: workspace.id,
      name: workspace.business_name,
      description: workspace.description,
      address: workspace.address,
      city: workspace.location,
      type: workspace.type,
      email: workspace.email,
      phone: workspace.phone_number,
      is_active: workspace.is_active,
      created_at: workspace.created_at,
      mainImage,
      images: workspaceImages,
      hourlyRate: workspace.studio?.price_per_hour || 0,
      dailyRate: workspace.studio?.price_per_day || workspace.coworking?.price_per_day || 0,
      monthlyRate: workspace.coworking?.price_per_month || 0,
      capacity: workspace.coworking?.seating_capacity || 15,
      amenities: workspace.studio?.services?.map(s => s.service) || ['WiFi', 'Meeting Room'],
      rating: 4.7,
      reviewCount: 48,
      availability,
      studio: workspace.studio,
      coworking: workspace.coworking,
      picture: workspace.picture,
      user_id: workspace.user_id // Add user_id for ownership check
    }
  }

  // Fetch workspace data
  useEffect(() => {
    const fetchWorkspace = async () => {
      if (!id) {
        setError('Workspace ID is missing')
        setLoading(false)

        return
      }

      setLoading(true)
      setError(null)

      try {
        console.log('Fetching workspace with ID:', id)
        const response = await apiClient.get(`/workspaces/${id}`)

        if (!response.data?.data) throw new Error('Invalid response format from API')
        const mappedData = mapWorkspaceData(response.data.data)

        if (!mappedData) throw new Error('Failed to map workspace data')
        setSpaceData(mappedData)
      } catch (err) {
        console.error('Error fetching workspace:', err)
        setError(
          err.response?.status === 404
            ? 'Workspace not found'
            : err.code === 'ERR_NETWORK'
              ? 'Network error: Unable to connect to the server.'
              : 'Failed to load workspace data. Please try again.'
        )
      } finally {
        setLoading(false)
      }
    }

    fetchWorkspace()
  }, [id])

  // Handle back navigation
  const handleBack = () => router.back()

  // Handle tab change
  const handleTabChange = (event, newValue) => setActiveTab(newValue)

  // Handle space update
  const handleSpaceUpdated = updatedSpace => {
    const mappedData = mapWorkspaceData(updatedSpace)

    if (mappedData) setSpaceData(mappedData)
    setEditDrawerOpen(false)
    setSuccess('Workspace updated successfully')
    setTimeout(() => setSuccess(null), 3000)
  }

  // Handle working hours update
  const handleWorkingHoursUpdated = updatedWorkingHours => {
    // Transform working hours array into availability object
    const newAvailability = {}

    updatedWorkingHours.forEach(hour => {
      const dayName = dayNumberToName[hour.day]

      if (dayName) {
        newAvailability[dayName] = {
          open: hour.is_open,
          hours: hour.is_open && hour.time_from && hour.time_to ? `${hour.time_from} - ${hour.time_to}` : ''
        }
      }
    })

    // Update spaceData with new availability
    setSpaceData(prev => ({ ...prev, availability: newAvailability }))
    setSuccess('Working hours updated successfully')
    setTimeout(() => setSuccess(null), 3000)
  }

  // Handle images update
  const handleImagesUpdated = () => {
    // Refresh the workspace data to get updated images
    const fetchWorkspace = async () => {
      try {
        const response = await apiClient.get(`/workspaces/${id}`)
        if (response.data?.data) {
          const mappedData = mapWorkspaceData(response.data.data)
          if (mappedData) {
            setSpaceData(mappedData)
          }
        }
      } catch (err) {
        console.error('Error refreshing workspace data:', err)
      }
    }
    fetchWorkspace()
  }

  // Handle delete dialog
  const handleDeleteDialogOpen = () => setDeleteDialogOpen(true)

  // Handle delete space
  const handleDeleteSpace = async () => {
    if (!spaceData?.id) return

    try {
      const endpoint =
        spaceData.type === 'studio' ? `/workspaces/studio/${spaceData.id}` : `/workspaces/coworking/${spaceData.id}`

      await apiClient.delete(endpoint)
      setSuccess('Workspace deleted successfully')
      setTimeout(() => {
        setSuccess(null)
        router.back()
      }, 2000)
    } catch (err) {
      console.error('Error deleting workspace:', err)
      setError('Failed to delete workspace. Please try again.')
    } finally {
      setDeleteDialogOpen(false)
    }
  }

  if (loading) {
    return (
      <Card>
        <CardContent className='flex justify-center items-center p-6'>
          <CircularProgress />
          <Typography className='ml-2'>Loading workspace data...</Typography>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardContent>
          <Alert severity='error'>{error}</Alert>
        </CardContent>
      </Card>
    )
  }

  if (!spaceData) {
    return (
      <Card>
        <CardContent>
          <Alert severity='warning'>Workspace not found</Alert>
        </CardContent>
      </Card>
    )
  }

  const tabContentList = {
    overview: <OverviewTab space={spaceData} onUpdateWorkingHours={handleWorkingHoursUpdated} />,
    images: <ImagesTab space={spaceData} onImagesUpdated={handleImagesUpdated} />,
    reviews: <ReviewsTab space={spaceData} />
  }

  const tabs = [
    { value: 'overview', label: 'Overview', icon: <Home size={20} /> },
    { value: 'images', label: 'Images', icon: <Image size={20} /> },
    { value: 'reviews', label: 'Reviews', icon: <Star size={20} /> }
  ]

  return (
    <Grid container spacing={6}>
      <Grid size={{ xs: 12 }}>
        <SpaceDetailHeader
          data={spaceData}
          onBack={handleBack}
          onEdit={() => setEditDrawerOpen(true)}
          onDelete={handleDeleteDialogOpen}
        />
      </Grid>
      {success && (
        <Grid size={{ xs: 12 }}>
          <Alert severity='success'>{success}</Alert>
        </Grid>
      )}
      {activeTab === undefined ? null : (
        <Grid size={{ xs: 12 }} className='flex flex-col gap-6'>
          <TabContext value={activeTab}>
            <CustomTabList onChange={handleTabChange} variant='scrollable' pill='true'>
              {tabs.map((tab, index) => (
                <Tab
                  key={index}
                  label={
                    <div className='flex items-center gap-1.5'>
                      {tab.icon}
                      {tab.label}
                    </div>
                  }
                  value={tab.value}
                />
              ))}
            </CustomTabList>
            <TabPanel value={activeTab} className='p-0'>
              {tabContentList[activeTab]}
            </TabPanel>
          </TabContext>
        </Grid>
      )}
      <EditDrawer
        open={editDrawerOpen}
        handleClose={() => setEditDrawerOpen(false)}
        onSpaceUpdated={handleSpaceUpdated}
        initialData={spaceData}
      />
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete the workspace {spaceData?.name}? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)} color='secondary'>
            Cancel
          </Button>
          <Button onClick={handleDeleteSpace} variant='contained' color='error'>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Grid>
  )
}

export default SpaceDetailView
