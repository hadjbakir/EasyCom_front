'use client'

import { useState, useEffect } from 'react'

import { useSession } from 'next-auth/react'
import {
  Card,
  CardContent,
  Typography,
  Box,
  Rating,
  Button,
  TextField,
  Chip,
  IconButton,
  MenuItem,
  InputAdornment,
  Stack,
  LinearProgress,
  Avatar,
  Collapse,
  Alert,
  CircularProgress
} from '@mui/material'
import { Search, X } from 'lucide-react'

import CustomTextField from '@core/components/mui/TextField'
import apiClient from '@/libs/api'

const ReviewsTab = ({ skillId }) => {
  // States
  const [searchTerm, setSearchTerm] = useState('')
  const [replyFilter, setReplyFilter] = useState('all') // 'all', 'replied', 'not_replied'
  const [replyForms, setReplyForms] = useState({})
  const [expandedReplies, setExpandedReplies] = useState({})
  const [reviews, setReviews] = useState([])
  const [averageRating, setAverageRating] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)

  // Get session data
  const { data: session } = useSession()

  const username = session?.user?.fullName || 'Guest'
  const userPicture = session?.user?.picture || '/images/avatars/default.png'

  console.log('Session data:', session)

  // Fetch reviews
  useEffect(() => {
    const fetchReviews = async () => {
      if (!skillId) return

      setLoading(true)
      setError(null)

      try {
        const response = await apiClient.get(`/service_providers/${skillId}/reviews`)

        if (!response.data?.data) throw new Error('Invalid response format from API')

        const reviewsData = response.data.data.reviews || []

        console.log('Fetched reviews:', reviewsData)
        const avgRating = response.data.data.average_rating || 0

        setReviews(reviewsData)
        setAverageRating(avgRating)
      } catch (err) {
        console.error('Error fetching reviews:', err)
        setError(
          err.response?.status === 404
            ? 'No reviews found'
            : err.code === 'ERR_NETWORK'
              ? 'Network error: Unable to connect to the server.'
              : 'Failed to load reviews. Please try again.'
        )
      } finally {
        setLoading(false)
      }
    }

    fetchReviews()
  }, [skillId])

  // Calculate rating statistics
  const ratingCounts = [5, 4, 3, 2, 1].map(star => {
    const count = reviews.filter(review => review.rating === star).length

    return {
      star,
      count,
      percentage: reviews.length > 0 ? (count / reviews.length) * 100 : 0
    }
  })

  // Filter reviews based on search term and reply status
  const filteredReviews = reviews.filter(review => {
    const matchesSearch =
      review.user?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      review.comment?.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesReplyFilter =
      replyFilter === 'all' ||
      (replyFilter === 'replied' && review.reply) ||
      (replyFilter === 'not_replied' && !review.reply)

    return matchesSearch && matchesReplyFilter
  })

  // Handle reply submission
  const handleReplySubmit = async reviewId => {
    if (!skillId || !session?.user?.accessToken) {
      setError('You must be logged in to reply to reviews.')

      return
    }

    const replyText = replyForms[reviewId]?.comment

    if (!replyText) return

    try {
      const response = await apiClient.post(
        `/service_providers/${skillId}/reviews/${reviewId}/reply`,
        { comment: replyText },
        {
          headers: {
            Authorization: `Bearer ${session.user.accessToken}`
          }
        }
      )

      if (!response.data?.data) throw new Error('Invalid response format from API')

      // Update the review in the list with the new reply
      setReviews(prevReviews =>
        prevReviews.map(review =>
          review.id === reviewId
            ? {
                ...review,
                reply: response.data.data.reply,
                reply_created_at: response.data.data.reply_created_at,
                replyUser: {
                  name: session.user.fullName || 'Service Provider',
                  avatar: session.user.picture || '/images/avatars/default.png'
                }
              }
            : review
        )
      )

      // Close the reply form
      setReplyForms(prev => ({
        ...prev,
        [reviewId]: false
      }))

      setSuccess('Reply submitted successfully')
      setTimeout(() => setSuccess(null), 3000)
    } catch (err) {
      console.error('Error submitting reply:', err)
      setError(err.response?.data?.message || 'Failed to submit reply. Please try again.')
    }
  }

  // Toggle reply visibility
  const toggleReply = reviewId => {
    setExpandedReplies(prev => ({
      ...prev,
      [reviewId]: !prev[reviewId]
    }))
  }

  // Format date
  const formatDate = dateString => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  if (loading) {
    return (
      <Card>
        <CardContent className='flex justify-center items-center p-6'>
          <CircularProgress />
          <Typography className='ml-2'>Loading reviews...</Typography>
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

  return (
    <Card>
      <CardContent>
        {success && (
          <Alert severity='success' sx={{ mb: 3 }}>
            {success}
          </Alert>
        )}

        <Typography variant='h6' my={3}>
          Service Provider Feedback:
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
              <Rating value={averageRating} precision={0.1} readOnly size='large' />
              <Typography>of {reviews.length} Reviews</Typography>
            </Box>
          </Stack>
        </Card>

        {/* Filters */}
        <Box className='flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6'>
          <Typography variant='h6'>Service Provider Reviews:</Typography>
          <Box className='flex flex-col sm:flex-row gap-4 w-full md:w-auto'>
            <CustomTextField
              select
              value={replyFilter}
              onChange={e => setReplyFilter(e.target.value)}
              className='w-full sm:w-[200px]'
            >
              <MenuItem value='all'>All Reviews</MenuItem>
              <MenuItem value='replied'>Replied</MenuItem>
              <MenuItem value='not_replied'>Not Replied</MenuItem>
            </CustomTextField>
            <CustomTextField
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder='Search reviews...'
              InputProps={{
                startAdornment: (
                  <InputAdornment position='start'>
                    <Search size={20} />
                  </InputAdornment>
                ),
                endAdornment: searchTerm && (
                  <InputAdornment position='end'>
                    <IconButton size='small' onClick={() => setSearchTerm('')}>
                      <X size={20} />
                    </IconButton>
                  </InputAdornment>
                )
              }}
              className='w-full sm:w-[300px]'
            />
          </Box>
        </Box>

        {/* Reviews List */}
        <Box className='space-y-4'>
          {filteredReviews.map(review => (
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
                          • {formatDate(review.created_at)}
                        </Typography>
                      </Box>
                    </Box>
                    <Box className='flex gap-2'>
                      <Chip
                        label={review.reply ? 'Replied' : 'Not Replied'}
                        color={review.reply ? 'success' : 'warning'}
                        size='small'
                        variant='outlined'
                      />
                    </Box>
                  </Box>
                  <Typography variant='body2' className='mt-2'>
                    {review.comment}
                  </Typography>

                  {/* Reply Section */}
                  {review.reply ? (
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
                              src={review.reply_user?.avatar || '/images/avatars/default.png'}
                              alt={review.reply_user?.full_name}
                              sx={{ width: 32, height: 32 }}
                            />
                            <Box>
                              <Box className='flex items-center gap-1'>
                                <Typography variant='subtitle2'>{review.reply_user?.full_name}</Typography>
                                <Typography variant='caption' color='text.secondary'>
                                  • {formatDate(review.reply_created_at)}
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
                  ) : (
                    <Box mt={2}>
                      {replyForms[review.id] ? (
                        <Box sx={{ ml: 4 }}>
                          <TextField
                            multiline
                            rows={3}
                            value={replyForms[review.id].comment}
                            onChange={e =>
                              setReplyForms(prev => ({
                                ...prev,
                                [review.id]: { ...prev[review.id], comment: e.target.value }
                              }))
                            }
                            placeholder='Write your reply...'
                            fullWidth
                            sx={{ mb: 2 }}
                          />
                          <Box className='flex gap-2'>
                            <Button
                              variant='contained'
                              onClick={() => handleReplySubmit(review.id)}
                              disabled={!replyForms[review.id].comment}
                            >
                              Submit Reply
                            </Button>
                            <Button
                              variant='outlined'
                              onClick={() =>
                                setReplyForms(prev => ({
                                  ...prev,
                                  [reviewId]: false
                                }))
                              }
                            >
                              Cancel
                            </Button>
                          </Box>
                        </Box>
                      ) : (
                        <Button
                          variant='text'
                          size='small'
                          onClick={() =>
                            setReplyForms(prev => ({
                              ...prev,
                              [review.id]: { comment: '' }
                            }))
                          }
                        >
                          Reply to Review
                        </Button>
                      )}
                    </Box>
                  )}
                </Box>
              </Box>
            </Card>
          ))}
        </Box>
      </CardContent>
    </Card>
  )
}

export default ReviewsTab
