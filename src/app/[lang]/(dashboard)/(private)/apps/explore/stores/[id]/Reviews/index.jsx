'use client'

import { useState, useEffect } from 'react'

import { useParams } from 'next/navigation'

import { useSession } from 'next-auth/react'

import { Card, Box, Typography, Stack, LinearProgress, Rating, Avatar, Button, Collapse, Alert } from '@mui/material'

import ReviewsForm from './ReviewsForm'
import apiClient from '@/libs/api'

const Reviews = () => {
  const params = useParams()
  const storeId = params.id
  const { data: session } = useSession()

  const [reviews, setReviews] = useState([])
  const [averageRating, setAverageRating] = useState(0)
  const [expandedReplies, setExpandedReplies] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const [isStoreOwner, setIsStoreOwner] = useState(false)

  // Fetch reviews and check if user is store owner
  useEffect(() => {
    const fetchReviews = async () => {
      if (!storeId) return

      setLoading(true)
      setError(null)

      try {
        // Fetch store details to check if user is store owner
        const storeResponse = await apiClient.get(`/suppliers/${storeId}`)
        const storeData = storeResponse.data.data

        // Check if authenticated user is the store owner
        if (session?.user?.id === storeData.user_id) {
          setIsStoreOwner(true)
        }

        // Fetch store reviews
        const reviewsResponse = await apiClient.get(`/suppliers/${storeId}/reviews`)
        const reviewsData = reviewsResponse.data.data

        setReviews(reviewsData.reviews)
        setAverageRating(reviewsData.average_rating)
      } catch (err) {
        console.error('Error fetching reviews:', err)
        setError('Failed to load reviews. Please try again.')
      } finally {
        setLoading(false)
      }
    }

    fetchReviews()
  }, [storeId, session?.user?.id])

  // Handle new review submission
  const handleSubmitReview = async newReview => {
    if (!session?.user?.accessToken) {
      setError('You must be logged in to submit a review.')

      return
    }

    try {
      const response = await apiClient.post(`/suppliers/${storeId}/reviews`, newReview, {
        headers: {
          Authorization: `Bearer ${session.user.accessToken}`
        }
      })

      const addedReview = response.data.data

      setReviews(prevReviews => [addedReview, ...prevReviews])
      setSuccess('Review submitted successfully')
      setTimeout(() => setSuccess(null), 3000)
    } catch (err) {
      console.error('Error submitting review:', err)
      setError('Failed to submit review. Please try again.')
    }
  }

  // Toggle reply visibility
  const toggleReply = reviewId => {
    setExpandedReplies(prev => ({
      ...prev,
      [reviewId]: !prev[reviewId]
    }))
  }

  // Calculate rating statistics
  const ratingCounts = [5, 4, 3, 2, 1].map(star => {
    const count = reviews.filter(review => review.rating === star).length

    return {
      star,
      count,
      percentage: reviews.length > 0 ? (count / reviews.length) * 100 : 0
    }
  })

  if (loading) {
    return (
      <Card sx={{ p: 3 }}>
        <Typography>Loading reviews...</Typography>
      </Card>
    )
  }

  if (error) {
    return (
      <Card sx={{ p: 3 }}>
        <Alert severity='error'>{error}</Alert>
      </Card>
    )
  }

  return (
    <Card sx={{ mb: 3, p: 3 }}>
      {success && (
        <Alert severity='success' sx={{ mb: 3 }}>
          {success}
        </Alert>
      )}

      <Typography variant='h6' my={3}>
        Customers Feedback:
      </Typography>

      {/* Rating Statistics */}
      <Card sx={{ p: 3, mb: 3 }}>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={3}>
          <Box flex={2}>
            {ratingCounts.map(item => (
              <Stack key={item.star} direction='row' alignItems='center' spacing={2} mb={2}>
                <Rating value={item.star} max={item.star} readOnly />
                <LinearProgress variant='determinate' value={item.percentage} sx={{ flex: 1, height: 5 }} />
                <Typography>{item.count}</Typography>
              </Stack>
            ))}
          </Box>
          <Box flex={1} textAlign='center'>
            <Typography variant='h2'>{averageRating.toFixed(1)}</Typography>
            <Rating value={Number.parseFloat(averageRating)} precision={0.1} readOnly size='large' />
            <Typography>of {reviews.length} Reviews</Typography>
          </Box>
        </Stack>
      </Card>

      {/* Review Form - Only show if user is not the store owner */}
      {!isStoreOwner && <ReviewsForm onSubmit={handleSubmitReview} />}

      {/* Reviews List */}
      <Typography variant='h6' my={3}>
        Customer Reviews:
      </Typography>
      <Box className='space-y-4'>
        {reviews.length === 0 ? (
          <Typography color='text.secondary' textAlign='center' py={4}>
            No reviews yet
          </Typography>
        ) : (
          reviews.map(review => (
            <Card key={review.id} sx={{ mb: 2, p: 3 }}>
              <Box className='flex gap-4'>
                <Avatar
                  src={review.user?.picture || '/images/avatars/default.png'}
                  alt={review.user?.full_name}
                  className='w-10 h-10'
                />
                <Box className='flex-1'>
                  <Box className='flex justify-between items-start'>
                    <Box>
                      <Typography variant='subtitle1' className='font-medium'>
                        {review.user?.full_name || 'Anonymous'}
                      </Typography>
                      <Box className='flex items-center gap-1'>
                        <Rating value={review.rating} size='small' readOnly />
                        <Typography variant='body2' className='text-textSecondary'>
                          • {new Date(review.created_at).toLocaleDateString()}
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                  <Typography variant='body2' className='mt-2'>
                    {review.comment}
                  </Typography>

                  {/* Store Reply Section */}
                  {review.reply && (
                    <Box mt={2}>
                      <Button variant='text' size='small' onClick={() => toggleReply(review.id)} sx={{ mb: 1 }}>
                        {expandedReplies[review.id] ? 'Hide Reply' : 'Show Store Reply'}
                      </Button>
                      <Collapse in={expandedReplies[review.id]}>
                        <Box
                          sx={{
                            ml: 4,
                            p: 2,
                            bgcolor: 'background.default',
                            borderRadius: 1,
                            border: '1px solid',
                            borderColor: 'divider'
                          }}
                        >
                          <Box className='flex gap-2'>
                            <Avatar
                              src={review.replyUser?.picture || '/images/avatars/default.png'}
                              alt={review.replyUser?.name}
                              sx={{ width: 32, height: 32 }}
                            />
                            <Box>
                              <Box className='flex items-center gap-1'>
                                <Typography variant='subtitle2'>{review.replyUser?.name || 'Store Owner'}</Typography>
                                <Typography variant='caption' color='text.secondary'>
                                  • {new Date(review.reply_created_at).toLocaleDateString()}
                                </Typography>
                              </Box>
                              <Typography variant='body2' mt={1}>
                                {review.reply}
                              </Typography>
                            </Box>
                          </Box>
                        </Box>
                      </Collapse>
                    </Box>
                  )}
                </Box>
              </Box>
            </Card>
          ))
        )}
      </Box>
    </Card>
  )
}

export default Reviews
