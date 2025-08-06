'use client'

import { useState, useEffect } from 'react'

import { useParams } from 'next/navigation'

import {
  Card,
  Box,
  Typography,
  Stack,
  LinearProgress,
  Rating,
  Avatar,
  Button,
  Collapse,
  CircularProgress,
  Alert
} from '@mui/material'
import { formatDistanceToNow } from 'date-fns'
import { useSession } from 'next-auth/react'

import ReviewsForm from './ReviewsForm/ReviewsForm'
import ManageReviewsTable from './manage-reviews/ManageReviews'
import apiClient from '@/libs/api'

const Reviews = ({ reviews: initialReviews, averageRating, user, workspaceOwnerId, workspaceId }) => {
  const { data: session } = useSession()
  const [reviews, setReviews] = useState(initialReviews || [])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const [stats, setStats] = useState({
    averageRating: averageRating || 0,
    totalRating: 0,
    reviewCount: initialReviews?.length || 0
  })

  const [expandedReplies, setExpandedReplies] = useState({})
  const [submitError, setSubmitError] = useState(null)
  const [submitSuccess, setSubmitSuccess] = useState(false)

  const isOwner = user && user.id && workspaceOwnerId && user.id === workspaceOwnerId

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        setLoading(true)
        const response = await apiClient.get(`/workspaces/${workspaceId}/reviews`)
        const { reviews: reviewsData, average_rating, total_rating, review_count } = response.data.data

        setReviews(reviewsData)
        setStats({
          averageRating: average_rating,
          totalRating: total_rating,
          reviewCount: review_count
        })
      } catch (err) {
        console.error('Error fetching reviews:', err)
        setError('Failed to load reviews. Please try again later.')
      } finally {
        setLoading(false)
      }
    }

    if (workspaceId) {
      fetchReviews()
    } else {
      setLoading(false)
    }
  }, [workspaceId])

  const handleSubmitReview = async reviewData => {
    try {
      setSubmitError(null)
      setSubmitSuccess(false)

      if (!session) {
        setSubmitError('Please log in to submit a review')

        return
      }

      if (isOwner) {
        setSubmitError('Workspace owners cannot review their own workspace')

        return
      }

      const response = await apiClient.post(`/workspaces/${workspaceId}/reviews`, {
        rating: reviewData.rating,
        comment: reviewData.comment
      })

      const newReview = {
        ...response.data.data,
        user: session.user
      }

      setReviews(prevReviews => [newReview, ...prevReviews])
      setSubmitSuccess(true)

      setStats(prev => ({
        ...prev,
        reviewCount: prev.reviewCount + 1,
        totalRating: prev.totalRating + reviewData.rating,
        averageRating: (prev.totalRating + reviewData.rating) / (prev.reviewCount + 1)
      }))
    } catch (err) {
      console.error('Error submitting review:', err)
      setSubmitError(err.response?.data?.message || 'Failed to submit review. Please try again.')
    }
  }

  const toggleReply = reviewId => {
    setExpandedReplies(prev => ({
      ...prev,
      [reviewId]: !prev[reviewId]
    }))
  }

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
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    )
  }

  if (error) {
    return (
      <Card sx={{ mb: 3, p: 3 }}>
        <Typography color='error'>{error}</Typography>
      </Card>
    )
  }

  return (
    <Card sx={{ mb: 3, p: 3 }}>
      <Typography variant='h6' my={3}>
        Customers Feedback:
      </Typography>

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
            <Typography variant='h2'>{stats.averageRating.toFixed(1)}</Typography>
            <Rating value={stats.averageRating} precision={0.1} readOnly size='large' />
            <Typography>of {stats.reviewCount} Reviews</Typography>
          </Box>
        </Stack>
      </Card>

      {!isOwner && (
        <>
          {submitError && (
            <Alert severity='error' sx={{ mb: 2 }}>
              {submitError}
            </Alert>
          )}
          {submitSuccess && (
            <Alert severity='success' sx={{ mb: 2 }}>
              Review submitted successfully!
            </Alert>
          )}
          <ReviewsForm onSubmit={handleSubmitReview} />
        </>
      )}

      <Typography variant='h6' my={3}>
        Customer Reviews:
      </Typography>
      <Box className='space-y-4'>
        {reviews.map(review => (
          <Card key={review.id} sx={{ mb: 2, p: 3 }}>
            <Box className='flex gap-4'>
              <Avatar
                src={review.user?.picture || '/images/avatars/1.png'}
                alt={review.user?.full_name}
                className='w-10 h-10'
              />
              <Box className='flex-1'>
                <Box className='flex justify-between items-start'>
                  <Box>
                    <Typography variant='subtitle1' className='font-medium'>
                      {review.user?.full_name}
                    </Typography>
                    <Box className='flex items-center gap-1'>
                      <Rating value={review.rating} size='small' readOnly />
                      <Typography variant='body2' className='text-textSecondary'>
                        • {formatDistanceToNow(new Date(review.created_at), { addSuffix: true })}
                      </Typography>
                    </Box>
                  </Box>
                </Box>
                <Typography variant='body2' className='mt-2'>
                  {review.comment}
                </Typography>

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
                            src={review.reply_user?.picture || '/images/avatars/1.png'}
                            alt={review.reply_user?.full_name}
                            sx={{ width: 32, height: 32 }}
                          />
                          <Box>
                            <Box className='flex items-center gap-1'>
                              <Typography variant='subtitle2'>{review.reply_user?.full_name}</Typography>
                              <Typography variant='caption' color='text.secondary'>
                                • {formatDistanceToNow(new Date(review.reply_created_at), { addSuffix: true })}
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
    </Card>
  )
}

export default Reviews
