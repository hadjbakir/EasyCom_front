"use client"

import { useState, useEffect } from "react"

import { Card, Box, Typography, Stack, LinearProgress, Rating, Avatar, Button, Collapse } from "@mui/material"

import ReviewsForm from "./ReviewsForm"
import ManageReviewsTable from "./manage-reviews"

// Sample store replies data
const storeReplies = {
  1: {
    author: "TechGadgets Support",
    avatar: "/images/logos/tech-gadgets.png",
    date: "2 weeks ago",
    content:
      "Thank you for your positive feedback, John! We're glad you're enjoying the workspace and our amenities. We strive to create a welcoming and professional environment for all our members.",
  },
  3: {
    author: "TechGadgets Support",
    avatar: "/images/logos/tech-gadgets.png",
    date: "1 month ago",
    content:
      "We appreciate your feedback, Michael! We're happy to hear that the private office setup is working well for your team. Please let us know if there's anything else we can do to enhance your experience.",
  },
}

const Reviews = () => {
  // Initial reviews from the static data
  const [reviews, setReviews] = useState([
    {
      id: "1",
      author: "John Smith",
      avatar: "https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=600",
      date: "2 weeks ago",
      rating: 5,
      comment:
        "Fantastic product with great features. The build quality is excellent and it performs even better than expected. Highly recommended!",
      membershipType: "Verified Purchase",
      head: "Excellent product",
      para: "Fantastic product with great features. The build quality is excellent and it performs even better than expected. Highly recommended!",
      status: "Published",
      email: "john.smith@example.com",
    },
    {
      id: "2",
      author: "Emily Chen",
      avatar: "https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=600",
      date: "1 month ago",
      rating: 4,
      comment:
        "Good product overall. Fast delivery and works as described. The only minor issue is that the battery life could be better.",
      membershipType: "Verified Purchase",
      head: "Good product",
      para: "Good product overall. Fast delivery and works as described. The only minor issue is that the battery life could be better.",
      status: "Published",
      email: "emily.chen@example.com",
    },
    {
      id: "3",
      author: "Michael Brown",
      avatar: "https://images.pexels.com/photos/1681010/pexels-photo-1681010.jpeg?auto=compress&cs=tinysrgb&w=600",
      date: "2 months ago",
      rating: 5,
      comment:
        "Absolutely love this product! It's exactly what I needed and the quality is top-notch. Customer service was also excellent when I had questions.",
      membershipType: "Verified Purchase",
      head: "Absolutely love it",
      para: "Absolutely love this product! It's exactly what I needed and the quality is top-notch. Customer service was also excellent when I had questions.",
      status: "Published",
      email: "michael.brown@example.com",
    },
  ])

  // Calculate average rating
  const [averageRating, setAverageRating] = useState(0)
  const [expandedReplies, setExpandedReplies] = useState({})

  useEffect(() => {
    if (reviews.length > 0) {
      const total = reviews.reduce((sum, review) => sum + review.rating, 0)

      setAverageRating((total / reviews.length).toFixed(2))
    }
  }, [reviews])

  // Handle new review submission
  const handleSubmitReview = (newReview) => {
    setReviews((prevReviews) => [newReview, ...prevReviews])
  }

  // Toggle reply visibility
  const toggleReply = (reviewId) => {
    setExpandedReplies((prev) => ({
      ...prev,
      [reviewId]: !prev[reviewId],
    }))
  }

  // Calculate rating statistics
  const ratingCounts = [5, 4, 3, 2, 1].map((star) => {
    const count = reviews.filter((review) => review.rating === star).length

    return {
      star,
      count,
      percentage: reviews.length > 0 ? (count / reviews.length) * 100 : 0,
    }
  })

  return (
    <Card sx={{ mb: 3, p: 3 }}>
      <Typography variant="h6" my={3}>
        Customers Feedback:
      </Typography>

      {/* Rating Statistics */}
      <Card sx={{ p: 3, mb: 3 }}>
        <Stack direction={{ xs: "column", md: "row" }} spacing={3}>
          <Box flex={2}>
            {ratingCounts.map((item) => (
              <Stack key={item.star} direction="row" alignItems="center" spacing={2} mb={2}>
                <Rating value={item.star} max={item.star} readOnly />
                <LinearProgress variant="determinate" value={item.percentage} sx={{ flex: 1, height: 5 }} />
                <Typography>{item.count}</Typography>
              </Stack>
            ))}
          </Box>
          <Box flex={1} textAlign="center">
            <Typography variant="h2">{averageRating}</Typography>
            <Rating value={Number.parseFloat(averageRating)} precision={0.1} readOnly size="large" />
            <Typography>of {reviews.length} Reviews</Typography>
          </Box>
        </Stack>
      </Card>

      {/* Review Form */}

      {/* Reviews List */}
      <Typography variant="h6" my={3}>
        Customer Reviews:
      </Typography>
      <Box className="space-y-4">
        {reviews.map((review) => (
          <Card key={review.id} sx={{ mb: 2, p: 3 }}>
            <Box className="flex gap-4">
              <Avatar src={review.avatar} alt={review.author} className="w-10 h-10" />
              <Box className="flex-1">
                <Box className="flex justify-between items-start">
                  <Box>
                    <Typography variant="subtitle1" className="font-medium">
                      {review.author}
                    </Typography>
                    <Box className="flex items-center gap-1">
                      <Rating value={review.rating} size="small" readOnly />
                      <Typography variant="body2" className="text-textSecondary">
                        • {review.date}
                      </Typography>
                    </Box>
                  </Box>
                  <Typography variant="caption" className="text-textSecondary bg-background rounded-full px-2 py-0.5">
                    {review.membershipType}
                  </Typography>
                </Box>
                <Typography variant="body2" className="mt-2">
                  {review.comment}
                </Typography>

                {/* Store Reply Section */}
                {storeReplies[review.id] && (
                  <Box mt={2}>
                    <Button variant="text" size="small" onClick={() => toggleReply(review.id)} sx={{ mb: 1 }}>
                      {expandedReplies[review.id] ? "Hide Reply" : "Show Store Reply"}
                    </Button>
                    <Collapse in={expandedReplies[review.id]}>
                      <Box
                        sx={{
                          ml: 4,
                          p: 2,
                          bgcolor: "background.default",
                          borderRadius: 1,
                          border: "1px solid",
                          borderColor: "divider",
                        }}
                      >
                        <Box className="flex gap-2">
                          <Avatar
                            src={storeReplies[review.id].avatar}
                            alt={storeReplies[review.id].author}
                            sx={{ width: 32, height: 32 }}
                          />
                          <Box>
                            <Box className="flex items-center gap-1">
                              <Typography variant="subtitle2">{storeReplies[review.id].author}</Typography>
                              <Typography variant="caption" color="text.secondary">
                                • {storeReplies[review.id].date}
                              </Typography>
                            </Box>
                            <Typography variant="body2" mt={1}>
                              {storeReplies[review.id].content}
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

      <ReviewsForm onSubmitReview={handleSubmitReview} />

    </Card>
  )
}

export default Reviews
