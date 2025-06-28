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
  CircularProgress,
  Tabs,
  Tab
} from '@mui/material'
import { Search, X } from 'lucide-react'

import CustomTextField from '@core/components/mui/TextField'
import apiClient from '@/libs/api'

// Static data for testing
const staticStoreReviews = [
  {
    id: 1,
    rating: 5,
    comment:
      'Excellent store! The products are high quality and the delivery was fast. Will definitely shop here again.',
    created_at: '2024-03-15T10:30:00Z',
    user: {
      full_name: 'John Doe',
      picture: '/images/avatars/1.png'
    },
    reply: "Thank you for your kind words! We're glad you enjoyed shopping with us.",
    reply_created_at: '2024-03-15T11:00:00Z',
    replyUser: {
      name: 'Store Owner',
      picture: '/images/avatars/store-owner.png'
    }
  },
  {
    id: 2,
    rating: 4,
    comment: 'Good products and reasonable prices. The only reason for 4 stars is the slightly delayed shipping.',
    created_at: '2024-03-14T15:45:00Z',
    user: {
      full_name: 'Jane Smith',
      picture: '/images/avatars/2.png'
    }
  }
]

const staticProductReviews = [
  {
    id: 1,
    product_id: 1,
    product_name: 'Product 1',
    rating: 5,
    comment: 'Amazing product quality! Exactly what I was looking for.',
    created_at: '2024-03-13T09:20:00Z',
    user: {
      full_name: 'Mike Johnson',
      picture: '/images/avatars/3.png'
    },
    reply: "We're happy to help! Thank you for choosing our product.",
    reply_created_at: '2024-03-13T10:00:00Z',
    replyUser: {
      name: 'Store Owner',
      picture: '/images/avatars/store-owner.png'
    }
  },
  {
    id: 2,
    product_id: 2,
    product_name: 'Product 2',
    rating: 3,
    comment: 'Products are okay, but could use some improvements.',
    created_at: '2024-03-12T14:15:00Z',
    user: {
      full_name: 'Sarah Wilson',
      picture: '/images/avatars/4.png'
    }
  },
  {
    id: 3,
    product_id: 1,
    product_name: 'Product 1',
    rating: 5,
    comment: "Best product I've found! Highly recommended!",
    created_at: '2024-03-11T16:30:00Z',
    user: {
      full_name: 'David Brown',
      picture: '/images/avatars/5.png'
    }
  }
]

const ReviewsTab = ({ storeId }) => {
  // States
  const [activeTab, setActiveTab] = useState('store')
  const [searchTerm, setSearchTerm] = useState('')
  const [replyFilter, setReplyFilter] = useState('all')
  const [replyForms, setReplyForms] = useState({})
  const [expandedReplies, setExpandedReplies] = useState({})
  const [storeReviews, setStoreReviews] = useState([])
  const [productReviews, setProductReviews] = useState([])
  const [storeAverageRating, setStoreAverageRating] = useState(0)
  const [productAverageRating, setProductAverageRating] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)

  // Get session data
  const { data: session } = useSession()

  const username = session?.user?.fullName || 'Guest'
  const userPicture = session?.user?.picture || '/images/avatars/default.png'

  // Fetch reviews
  useEffect(() => {
    const fetchReviews = async () => {
      if (!storeId) return

      setLoading(true)
      setError(null)

      try {
        // Fetch store reviews
        const storeResponse = await apiClient.get(`/suppliers/${storeId}/reviews`)
        const storeData = storeResponse.data.data

        setStoreReviews(storeData.reviews)
        setStoreAverageRating(storeData.average_rating)

        // Fetch product reviews
        const productsResponse = await apiClient.get(`/suppliers/${storeId}/products`)
        const products = productsResponse.data.data

        // Fetch reviews for each product
        const allProductReviews = []
        let totalRating = 0
        let totalReviews = 0

        for (const product of products) {
          try {
            const productReviewsResponse = await apiClient.get(`/products/${product.id}/reviews`)
            const productData = productReviewsResponse.data.data

            // Add product name to each review
            const reviewsWithProduct = productData.reviews.map(review => ({
              ...review,
              product_name: product.name
            }))

            allProductReviews.push(...reviewsWithProduct)
            totalRating += productData.total_rating
            totalReviews += productData.review_count
          } catch (err) {
            console.error(`Error fetching reviews for product ${product.id}:`, err)
          }
        }

        setProductReviews(allProductReviews)
        setProductAverageRating(totalReviews > 0 ? totalRating / totalReviews : 0)
      } catch (err) {
        console.error('Error fetching reviews:', err)
        setError('Failed to load reviews. Please try again.')
      } finally {
        setLoading(false)
      }
    }

    fetchReviews()
  }, [storeId])

  // Calculate rating statistics
  const calculateRatingStats = reviews => {
    return [5, 4, 3, 2, 1].map(star => {
      const count = reviews.filter(review => review.rating === star).length

      return {
        star,
        count,
        percentage: reviews.length > 0 ? (count / reviews.length) * 100 : 0
      }
    })
  }

  // Filter reviews based on search term and reply status
  const filterReviews = reviews => {
    return reviews.filter(review => {
      const matchesSearch =
        review.user?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        review.comment?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (review.product_name && review.product_name.toLowerCase().includes(searchTerm.toLowerCase()))

      const matchesReplyFilter =
        replyFilter === 'all' ||
        (replyFilter === 'replied' && review.reply) ||
        (replyFilter === 'not_replied' && !review.reply)

      return matchesSearch && matchesReplyFilter
    })
  }

  // Handle reply submission
  const handleReplySubmit = async (reviewId, isProductReview = false) => {
    if (!storeId || !session?.user?.accessToken) {
      setError('You must be logged in to reply to reviews.')

      return
    }

    const replyText = replyForms[reviewId]?.comment

    if (!replyText) return

    try {
      if (isProductReview) {
        // Find the product ID for this review
        const review = productReviews.find(r => r.id === reviewId)

        if (!review) throw new Error('Review not found')

        await apiClient.post(
          `/products/${review.product_id}/reviews/${reviewId}/reply`,
          { comment: replyText },
          {
            headers: {
              Authorization: `Bearer ${session.user.accessToken}`
            }
          }
        )
      } else {
        await apiClient.post(
          `/suppliers/${storeId}/reviews/${reviewId}/reply`,
          { comment: replyText },
          {
            headers: {
              Authorization: `Bearer ${session.user.accessToken}`
            }
          }
        )
      }

      // Update the review in the list with the new reply
      const updateReviews = prevReviews =>
        prevReviews.map(review =>
          review.id === reviewId
            ? {
                ...review,
                reply: replyText,
                reply_created_at: new Date().toISOString(),
                replyUser: {
                  name: session.user.fullName || 'Store Owner',
                  avatar: session.user.picture || '/images/avatars/default.png'
                }
              }
            : review
        )

      if (isProductReview) {
        setProductReviews(updateReviews)
      } else {
        setStoreReviews(updateReviews)
      }

      // Close the reply form
      setReplyForms(prev => ({
        ...prev,
        [reviewId]: false
      }))

      setSuccess('Reply submitted successfully')
      setTimeout(() => setSuccess(null), 3000)
    } catch (err) {
      console.error('Error submitting reply:', err)
      setError('Failed to submit reply. Please try again.')
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

  // Render rating statistics
  const renderRatingStats = (reviews, averageRating) => (
    <Card sx={{ p: 3, mb: 3 }}>
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={3}>
        <Box flex={2}>
          {calculateRatingStats(reviews).map(item => (
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
  )

  // Render reviews list
  const renderReviewsList = (reviews, isProductReview = false) => (
    <Stack spacing={3}>
      {reviews.length === 0 ? (
        <Typography color='text.secondary' textAlign='center' py={4}>
          No reviews found
        </Typography>
      ) : (
        filterReviews(reviews).map(review => (
          <Card key={review.id} variant='outlined'>
            <CardContent>
              <Stack direction='row' spacing={2} alignItems='flex-start'>
                <Avatar src={review.user?.picture || '/images/avatars/default.png'} alt={review.user?.full_name} />
                <Box flex={1}>
                  <Stack direction='row' justifyContent='space-between' alignItems='flex-start'>
                    <Box>
                      <Typography variant='subtitle1'>{review.user?.full_name || 'Anonymous'}</Typography>
                      {isProductReview && (
                        <Typography variant='subtitle2' color='primary'>
                          {review.product_name}
                        </Typography>
                      )}
                      <Typography variant='caption' color='text.secondary'>
                        {formatDate(review.created_at)}
                      </Typography>
                    </Box>
                    <Rating value={review.rating} readOnly />
                  </Stack>
                  <Typography variant='body1' mt={1}>
                    {review.comment}
                  </Typography>

                  {/* Reply Section */}
                  {review.reply && (
                    <>
                      <Button variant='text' size='small' onClick={() => toggleReply(review.id)} sx={{ mt: 1 }}>
                        {expandedReplies[review.id] ? 'Hide Reply' : 'Show Reply'}
                      </Button>
                      <Collapse in={expandedReplies[review.id]}>
                        <Box mt={2} pl={2} borderLeft={4} borderColor='divider'>
                          <Stack direction='row' spacing={2} alignItems='flex-start'>
                            <Avatar
                              src={review.replyUser?.picture || '/images/avatars/default.png'}
                              alt={review.replyUser?.name}
                            />
                            <Box>
                              <Typography variant='subtitle2'>{review.replyUser?.name || 'Store Owner'}</Typography>
                              <Typography variant='caption' color='text.secondary'>
                                {formatDate(review.reply_created_at)}
                              </Typography>
                              <Typography variant='body2' mt={0.5}>
                                {review.reply}
                              </Typography>
                            </Box>
                          </Stack>
                        </Box>
                      </Collapse>
                    </>
                  )}

                  {/* Reply Form */}
                  {!review.reply && (
                    <Collapse in={replyForms[review.id]}>
                      <Box mt={2}>
                        <TextField
                          fullWidth
                          multiline
                          rows={3}
                          placeholder='Write your reply...'
                          value={replyForms[review.id]?.comment || ''}
                          onChange={e =>
                            setReplyForms(prev => ({
                              ...prev,
                              [review.id]: { ...prev[review.id], comment: e.target.value }
                            }))
                          }
                        />
                        <Stack direction='row' spacing={2} mt={2}>
                          <Button
                            variant='contained'
                            onClick={() => handleReplySubmit(review.id, isProductReview)}
                            disabled={!replyForms[review.id]?.comment}
                          >
                            Submit Reply
                          </Button>
                          <Button
                            variant='outlined'
                            onClick={() =>
                              setReplyForms(prev => ({
                                ...prev,
                                [review.id]: false
                              }))
                            }
                          >
                            Cancel
                          </Button>
                        </Stack>
                      </Box>
                    </Collapse>
                  )}

                  {/* Reply Button */}
                  {!review.reply && !replyForms[review.id] && (
                    <Button
                      variant='text'
                      size='small'
                      onClick={() =>
                        setReplyForms(prev => ({
                          ...prev,
                          [review.id]: { comment: '' }
                        }))
                      }
                      sx={{ mt: 1 }}
                    >
                      Reply
                    </Button>
                  )}
                </Box>
              </Stack>
            </CardContent>
          </Card>
        ))
      )}
    </Stack>
  )

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
          Store Feedback:
        </Typography>

        {/* Tabs */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
          <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)}>
            <Tab label='Store Reviews' value='store' />
            <Tab label='Product Reviews' value='products' />
          </Tabs>
        </Box>

        {/* Rating Statistics */}
        {activeTab === 'store'
          ? renderRatingStats(storeReviews, storeAverageRating)
          : renderRatingStats(productReviews, productAverageRating)}

        {/* Filters */}
        <Box className='flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6'>
          <Typography variant='h6'>{activeTab === 'store' ? 'Store Reviews:' : 'Product Reviews:'}</Typography>
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
              placeholder='Search reviews...'
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
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
        {activeTab === 'store' ? renderReviewsList(storeReviews) : renderReviewsList(productReviews, true)}
      </CardContent>
    </Card>
  )
}

export default ReviewsTab
