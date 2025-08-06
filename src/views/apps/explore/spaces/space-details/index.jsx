'use client'

import { useState, useEffect } from 'react'

import { useParams } from 'next/navigation'

import { Wifi, Coffee, Printer } from 'lucide-react'
import { Box, CircularProgress, Alert } from '@mui/material'

import apiClient from '@/libs/api'
import SpaceHeader from './SpaceHeader'
import SpaceTabs from './SpaceTabs' // Updated to use SpaceTabs
import RelatedSpaces from './RelatedSpaces'

// Configure Axios timeout and interceptors for debugging
apiClient.defaults.timeout = 10000 // 10-second timeout
apiClient.interceptors.request.use(
  config => {
    console.log('API Request:', config.method.toUpperCase(), config.url, config.headers)

    return config
  },
  error => {
    console.error('API Request Error:', error)

    return Promise.reject(error)
  }
)
apiClient.interceptors.response.use(
  response => {
    console.log('API Response:', response.status, response.data)

    return response
  },
  error => {
    console.error('API Response Error:', error.response?.status, error.message)

    return Promise.reject(error)
  }
)

const STORAGE_BASE_URL = (process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000').replace(/\/+$/, '')

const SpaceDetails = ({ id, user }) => {
  const [spaceData, setSpaceData] = useState(null)
  const [allSpaces, setAllSpaces] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // App Router: useParams
  const { lang } = useParams()

  // Log routing details
  useEffect(() => {
    console.log('Routing Details:', {
      params: { id, lang },
      workspace_id: id
    })
  }, [id, lang])

  // Log user data for debugging
  useEffect(() => {
    console.log('SpaceDetails user data:', user)
  }, [user])

  // Map API data to component's expected structure
  const mapSpaceData = workspace => {
    if (!workspace) {
      console.warn('mapSpaceData: Received empty workspace data')

      return null
    }

    const images = (workspace.images || [])
      .map(img => {
        if (!img.image_url) {
          console.warn('Missing image_url for image:', img)

          return null
        }

        // Normalize image_url by removing leading 'workspace_images/' if present
        const normalizedImageUrl = img.image_url.replace(/^workspace_images\//, '')

        const imageUrl = img.image_url.startsWith('/storage/')
          ? `${STORAGE_BASE_URL}${img.image_url}`
          : `${STORAGE_BASE_URL}/storage/workspace_images/${normalizedImageUrl}`

        console.log('Raw image_url:', img.image_url)
        console.log('Normalized image_url:', normalizedImageUrl)
        console.log('Mapped image URL:', imageUrl)

        return imageUrl
      })
      .filter(Boolean)

    console.log('Final images array:', images)

    // Map working_hours to availability
    const dayMap = {
      1: 'saturday',
      2: 'sunday',
      3: 'monday',
      4: 'tuesday',
      5: 'wednesday',
      6: 'thursday',
      7: 'friday'
    }

    const availability = {}
    const workingHours = Array.isArray(workspace.working_hours) ? workspace.working_hours : []

    workingHours.forEach(hour => {
      const dayName = dayMap[hour.day]

      if (dayName) {
        availability[dayName] = {
          open: hour.is_open,
          hours:
            hour.is_open && hour.time_from && hour.time_to
              ? `${hour.time_from.slice(0, 5)} - ${hour.time_to.slice(0, 5)}`
              : ''
        }
      }
    })

    // Ensure all days are present, even if not in working_hours
    Object.values(dayMap).forEach(day => {
      if (!availability[day]) {
        availability[day] = { open: false, hours: '' }
      }
    })

    console.log('Mapped availability:', availability)

    // Map reviews
    const reviews = Array.isArray(workspace.reviews)
      ? workspace.reviews.map(review => ({
          id: review.id,
          user: {
            name: review.user?.name || 'Anonymous',
            avatar: review.user?.avatar || '/images/avatars/default.png',
            email: review.user?.email || 'N/A'
          },
          rating: review.rating,
          comment: review.comment,
          created_at: review.created_at,
          reply: review.reply || null,
          reply_user_id: review.reply_user_id || null,
          reply_created_at: review.reply_created_at || null,
          replyUser: review.reply_user
            ? {
                name: review.reply_user.name || 'Workspace Owner',
                avatar: review.reply_user.avatar || '/images/avatars/default.png'
              }
            : null,
          workspace: {
            user_id: workspace.user_id || null // For owner check in ReviewsForm
          }
        }))
      : []

    console.log('Mapped reviews:', reviews)

    const reviewCount = reviews.length

    const rating = reviewCount > 0 ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviewCount : 0

    return {
      id: workspace.id,
      business_name: workspace.business_name || 'Untitled Space',
      type: workspace.type || 'Unknown',
      phone_number: workspace.phone_number || 'N/A',
      email: workspace.email || 'N/A',
      location: workspace.location || 'N/A',
      address: workspace.address || 'N/A',
      description: workspace.description || 'No description available.',
      opening_hours: workspace.opening_hours || 'N/A',
      user_id: workspace.user_id,
      availability,
      picture: workspace.picture
        ? workspace.picture.startsWith('/storage/')
          ? `${STORAGE_BASE_URL}${workspace.picture}`
          : `${STORAGE_BASE_URL}/storage/${workspace.picture}`
        : '/images/spaces/default.png',
      is_active: workspace.is_active ?? true,
      images: images.length > 0 ? images : ['/images/spaces/default.png'],
      verified: true,
      rating,
      reviewCount,
      studio:
        workspace.type === 'studio'
          ? {
              price_per_hour: workspace.studio?.price_per_hour || 0,
              price_per_day: workspace.studio?.price_per_day || 0,
              services:
                workspace.studio?.services?.map(s => ({
                  icon: [Wifi, Coffee, Printer][s.id % 3],
                  label: s.service
                })) || []
            }
          : null,
      coworking:
        workspace.type === 'coworking'
          ? {
              price_per_day: workspace.coworking?.price_per_day || 0,
              price_per_month: workspace.coworking?.price_per_month || 0,
              seating_capacity: workspace.coworking?.seating_capacity || 0,
              meeting_rooms: workspace.coworking?.meeting_rooms || 0
            }
          : null,
      pricePerDay:
        workspace.type === 'studio' ? workspace.studio?.price_per_day : workspace.coworking?.price_per_day || 0,
      pricePerMonth: workspace.type === 'coworking' ? workspace.coworking?.price_per_month : null,
      propertyDetails: {
        type: workspace.type === 'studio' ? 'Studio Space' : 'Commercial Building',
        yearBuilt: 2018,
        totalArea: 5000,
        floors: 3,
        securitySystem: true,
        elevatorAccess: true,
        reception: true
      },
      propertyFeatures: {
        totalDesks: workspace.coworking?.seating_capacity || 0,
        privateOffices: 5,
        phoneBooths: 3,
        kitchenettes: 2,
        restrooms: 4,
        bikeStorage: true,
        wifi: true,
        coffee: true,
        printer: true,
        parking: true,
        airConditioning: true,
        meetingRooms: workspace.coworking?.meeting_rooms || 0,
        motherRoom: true
      },
      amenities:
        workspace.type === 'studio'
          ? workspace.studio?.services?.map(s => ({
              icon: [Wifi, Coffee, Printer][s.id % 3],
              label: s.service
            })) || []
          : [
              { icon: 'wifi', label: 'High-Speed WiFi' },
              { icon: 'coffee', label: 'Coffee & Tea' },
              { icon: 'printer', label: 'Printing Facilities' },
              { icon: 'car', label: 'Parking Available' },
              { icon: 'wind', label: 'Air Conditioning' },
              { icon: 'monitor', label: 'Meeting Rooms' }
            ],
      spaceAreas: [
        { name: 'Open Workspace', area: 2500 },
        { name: 'Private Offices', area: 1000 },
        { name: 'Meeting Rooms', area: 800 }
      ],
      reviews,
      average_rating: workspace.average_rating || 0,
      host: {
        name: workspace.host?.name || 'Unknown Host',
        avatar: workspace.host?.avatar || '/images/avatars/default.png',
        role: 'Community Manager',
        responseTime: 'within 2 hours'
      }
    }
  }

  // Fetch space data by ID and all spaces
  useEffect(() => {
    const fetchData = async () => {
      if (!id) {
        console.warn('No workspace ID provided')
        setError('Invalid workspace ID')
        setLoading(false)

        return
      }

      setLoading(true)
      setError(null)

      try {
        // Fetch current space (includes reviews)
        console.log('Fetching data for workspace_id:', id)
        const spaceResponse = await apiClient.get(`/workspaces/${id}`)

        console.log('Raw API response (space):', spaceResponse)

        if (!spaceResponse.data || !spaceResponse.data.data) {
          throw new Error('Invalid response structure: missing data')
        }

        const workspace = spaceResponse.data.data

        console.log('Raw workspace data:', workspace)
        const mappedData = mapSpaceData(workspace)

        if (!mappedData) {
          throw new Error('Failed to map workspace data')
        }

        console.log('Mapped space data:', mappedData)
        setSpaceData(mappedData)

        // Fetch all spaces of the same type
        console.log(`Fetching all workspaces of type: ${mappedData.type}`)
        const allSpacesResponse = await apiClient.get(`/workspaces/type/${mappedData.type}`)

        console.log('Raw API response (all spaces):', allSpacesResponse)

        if (!allSpacesResponse.data || !Array.isArray(allSpacesResponse.data.data)) {
          throw new Error('Invalid response structure: missing or invalid all spaces data')
        }

        const allWorkspaces = allSpacesResponse.data.data
        const mappedAllSpaces = allWorkspaces.map(mapSpaceData).filter(Boolean)

        console.log('Mapped all spaces:', mappedAllSpaces)
        setAllSpaces(mappedAllSpaces)
      } catch (err) {
        console.error('Error fetching data:', {
          message: err.message,
          status: err.response?.status,
          data: err.response?.data
        })
        setError(err.response?.data?.message || 'Failed to load space details. Please try again.')
      } finally {
        setLoading(false)
        console.log('Fetch completed, loading:', false)
      }
    }

    fetchData()
  }, [id])

  return (
    <Box>
      {loading ? (
        <Box display='flex' justifyContent='center' alignItems='center' minHeight='400px'>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Alert severity='error'>{error}</Alert>
      ) : spaceData ? (
        <>
          <SpaceHeader space={spaceData} />
          <SpaceTabs space={spaceData} user={user} />
          <RelatedSpaces spaces={allSpaces} currentSpace={spaceData} locale={lang || 'en'} />
        </>
      ) : null}
    </Box>
  )
}

export default SpaceDetails
