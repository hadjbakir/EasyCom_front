'use client'

import { useState, useEffect } from 'react'

import { Box, Card, CardContent, Tabs, Tab } from '@mui/material'

import AboutTab from './tabs/AboutTab'
import ImagesTab from './tabs/ImagesTab'
import Reviews from './tabs/Reviews/index'
import apiClient from '@/libs/api'

function TabPanel(props) {
  const { children, value, index, ...other } = props

  return (
    <div
      role='tabpanel'
      hidden={value !== index}
      id={`space-tabpanel-${index}`}
      aria-labelledby={`space-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  )
}

function a11yProps(index) {
  return {
    id: `space-tab-${index}`,
    'aria-controls': `space-tabpanel-${index}`
  }
}

const SpaceTabs = ({ space, user }) => {
  console.log('SpaceTabs Component:', space)

  const [value, setValue] = useState(0)

  const [reviewsData, setReviewsData] = useState({
    reviews: [],
    average_rating: 0,
    total_rating: 0,
    review_count: 0
  })

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const response = await apiClient.get(`/workspaces/${space.id}/reviews`)

        setReviewsData(response.data.data)
        console.log('Fetched reviews:', response.data.data)
      } catch (error) {
        console.error('Failed to fetch reviews:', error)
      }
    }

    if (space.id) {
      fetchReviews()
    }
  }, [space.id])

  const handleChange = (event, newValue) => {
    setValue(newValue)
  }

  return (
    <Card className='mb-6'>
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={value} onChange={handleChange} aria-label='space details tabs' className='px-4'>
          <Tab label='About' {...a11yProps(0)} />
          <Tab label='Images' {...a11yProps(1)} />
          <Tab label={`Reviews (${reviewsData.review_count})`} {...a11yProps(2)} />
        </Tabs>
      </Box>
      <CardContent>
        <TabPanel value={value} index={0}>
          <AboutTab space={space} />
        </TabPanel>
        <TabPanel value={value} index={1}>
          <ImagesTab space={space} />
        </TabPanel>
        <TabPanel value={value} index={2}>
          <Reviews
            reviews={reviewsData.reviews}
            averageRating={reviewsData.average_rating}
            user={user}
            workspaceOwnerId={space.user_id}
            workspaceId={space.id}
          />
        </TabPanel>
      </CardContent>
    </Card>
  )
}

export default SpaceTabs
