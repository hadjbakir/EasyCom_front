'use client'

import { useState, useEffect } from 'react'

import { Card, Box, Typography, Stack, LinearProgress, Rating, Avatar, Button, Collapse, Alert } from '@mui/material'

import apiClient from '@/libs/api'
import ReviewsForm from './ReviewsForm/ReviewsTab'
import ManageReviewsTable from './manage-reviews/ManageReviews'

const Reviews = ({
  reviews: initialReviews = [],
  rating,
  reviewCount,
  user,
  serviceProviderId,
  isOwner: propIsOwner,
  providerUserId
}) => {
  const [reviews, setReviews] = useState(initialReviews)
  const [averageRating, setAverageRating] = useState(rating || 0)
  const [expandedReplies, setExpandedReplies] = useState({})
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)

  // Calculate rating distribution
  const ratingCounts = [5, 4, 3, 2, 1].map(star => {
    const count = reviews.filter(review => review.rating === star).length
    const percentage = reviews.length > 0 ? (count / reviews.length) * 100 : 0

    return {
      star,
      count,
      percentage
    }
  })

  // Determine if user is owner
  const isOwner = user?.id && providerUserId ? user.id === providerUserId : propIsOwner

  console.log('Reviews: Initial data:', {
    userId: user?.id,
    userEmail: user?.email,
    providerUserId,
    isOwner,
    propIsOwner,
    serviceProviderId,
    initialReviewCount: initialReviews.length,
    user
  })

  // Log reviews state changes
  useEffect(() => {
    console.log('Reviews: Reviews state updated:', {
      reviewCount: reviews.length,
      reviews: reviews.map(r => ({ id: r.id, rating: r.rating, comment: r.comment }))
    })
  }, [reviews])

  // Handle new review submission
  const handleSubmitReview = async ({ rating, comment }) => {
    console.log('Reviews: Attempting review submission:', {
      userId: user?.id,
      rating,
      commentLength: comment.length,
      serviceProviderId
    })

    if (!user?.accessToken) {
      setError('You must be logged in to submit a review.')
      console.log('Reviews: Submission blocked: No access token')

      return
    }

    if (!serviceProviderId) {
      setError('Invalid service provider ID.')
      console.log('Reviews: Submission blocked: Invalid serviceProviderId')

      return
    }

    if (isOwner) {
      setError('Service provider owners cannot review their own profile.')
      console.log('Reviews: Submission blocked: User is owner')

      return
    }

    setError(null)
    setSuccess(null)

    try {
      console.log('Reviews: Sending POST /service-providers/{id}/reviews', {
        url: `/service-providers/${serviceProviderId}/review`,
        headers: { Authorization: `Bearer ${user.accessToken}` },
        body: { rating, comment }
      })

      const response = await apiClient.post(
        `/service_providers/${serviceProviderId}/reviews`,
        { rating, comment },
        {
          headers: {
            Authorization: `Bearer ${user.accessToken}`
          }
        }
      )

      console.log('Reviews: Review submission response:', {
        status: response.status,
        data: response.data
      })

      const newReview = {
        id: response.data.data.id.toString(),
        author: user.full_Name || 'Anonymous',
        avatar: user.picture || '/images/avatars/default.png',
        date: new Date().toLocaleDateString('en-US', {
          month: 'short',
          day: '2-digit',
          year: 'numeric'
        }),
        rating: response.data.data.rating,
        comment: response.data.data.comment,
        email: user.email || 'N/A',
        status: 'Published',
        reply: null,
        replyUser: user.fullName
      }

      setReviews([newReview, ...reviews])
      setSuccess('Review submitted successfully!')

      // Update average rating
      const total = reviews.reduce((sum, review) => sum + review.rating, 0) + newReview.rating

      setAverageRating((total / (reviews.length + 1)).toFixed(2))
    } catch (err) {
      console.error('Reviews: Error submitting review:', {
        message: err.message,
        status: err.response?.status,
        data: err.response?.data
      })

      const errorMessage =
        err.response?.status === 403
          ? 'Service provider owners cannot review their own profile.'
          : err.response?.data?.message || 'Failed to submit review. Please try again.'

      setError(errorMessage)
    }
  }

  // Toggle reply visibility
  const toggleReply = reviewId => {
    setExpandedReplies(prev => ({
      ...prev,
      [reviewId]: !prev[reviewId]
    }))
  }

  return (
    <Card sx={{ mb: 3, p: 3 }}>
      {error && (
        <Alert severity='error' sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert severity='success' sx={{ mb: 2 }}>
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
            <Typography variant='h2'>{averageRating}</Typography>
            <Rating value={Number.parseFloat(averageRating)} precision={0.1} readOnly size='large' />
            <Typography>of {reviewCount} Reviews</Typography>
          </Box>
        </Stack>
      </Card>

      {/* Conditional Rendering */}
      <Typography variant='h6' my={3}>
        Customer Reviews:
      </Typography>
      <Box className='space-y-4'>
        {reviews.map(review => (
          <Card key={review.id} sx={{ mb: 2, p: 3 }}>
            <Box className='flex gap-4'>
              <Avatar src={review.avatar} alt={review.author} className='w-10 h-10' />
              <Box className='flex-1'>
                <Box className='flex justify-between items-start'>
                  <Box>
                    <Typography variant='subtitle1' className='font-medium'>
                      {review.author}
                    </Typography>
                    <Box className='flex items-center gap-1'>
                      <Rating value={review.rating} size='small' readOnly />
                      <Typography variant='body2' className='text-textSecondary'>
                        • {review.date}
                      </Typography>
                    </Box>
                  </Box>
                  <Typography variant='caption' className='text-textSecondary bg-background rounded-full px-2 py-0.5'>
                    Customer
                  </Typography>
                </Box>
                <Typography variant='body2' className='mt-2'>
                  {review.comment}
                </Typography>
                {review.reply && review.replyUser && (
                  <Box mt={2}>
                    <Button variant='text' size='small' onClick={() => toggleReply(review.id)} sx={{ mb: 1 }}>
                      {expandedReplies[review.id] ? 'Hide Reply' : 'Show Reply'}
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
                            src={review.replyUser.avatar}
                            alt={review.replyUser.name}
                            sx={{ width: 32, height: 32 }}
                          />
                          <Box>
                            <Box className='flex items-center gap-1'>
                              <Typography variant='subtitle2'>{review.replyUser.name}</Typography>
                              <Typography variant='caption' color='text.secondary'>
                                • {review.date}
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
        ))}
      </Box>

      {/* Show ReviewsForm for non-owners only */}
      {!isOwner && (
        <ReviewsForm
          onSubmitReview={handleSubmitReview}
          user={user}
          isDisabled={!user || !serviceProviderId}
          isOwner={isOwner}
        />
      )}
    </Card>
  )
}

export default Reviews
