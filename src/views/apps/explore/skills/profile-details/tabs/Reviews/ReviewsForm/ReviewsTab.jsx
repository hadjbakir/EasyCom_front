'use client'

import { useState } from 'react'

import { Card, Box, Typography, TextField, Button, Rating, Snackbar, Alert } from '@mui/material'

const ReviewsForm = ({ onSubmitReview, user, isDisabled, isOwner }) => {
  const [formData, setFormData] = useState({
    comment: '',
    rating: 5
  })

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  })

  console.log('ReviewsForm: Props:', {
    userId: user?.id,
    userEmail: user?.email,
    isDisabled,
    isOwner
  })

  const handleChange = e => {
    const { name, value } = e.target

    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    console.log('ReviewsForm: Form data updated:', { name, value })
  }

  const handleRatingChange = (event, newValue) => {
    setFormData(prev => ({
      ...prev,
      rating: newValue || 5
    }))
    console.log('ReviewsForm: Rating updated:', { rating: newValue || 5 })
  }

  const handleSubmit = e => {
    e.preventDefault()

    console.log('ReviewsForm: Submit attempt:', {
      rating: formData.rating,
      commentLength: formData.comment.length
    })

    if (!formData.comment || !formData.rating) {
      setSnackbar({
        open: true,
        message: 'Please provide a rating and comment.',
        severity: 'error'
      })
      console.log('ReviewsForm: Submission blocked: Missing rating or comment')

      return
    }

    onSubmitReview({
      rating: formData.rating,
      comment: formData.comment
    })

    setFormData({
      comment: '',
      rating: 5
    })

    setSnackbar({
      open: true,
      message: 'Review submitted successfully!',
      severity: 'success'
    })
  }

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({
      ...prev,
      open: false
    }))
  }

  const isFormDisabled = isDisabled || isOwner

  return (
    <>
      <Box display='flex' justifyContent='space-between' alignItems='center' mb={3}>
        <Typography variant='h6'>Write Feedback Here:</Typography>
        <Rating value={formData.rating} onChange={handleRatingChange} size='large' disabled={isFormDisabled} />
      </Box>

      <Card sx={{ p: 3 }}>
        {isOwner && (
          <Alert severity='info' sx={{ mb: 2 }}>
            Service provider owners cannot review their own profile.
          </Alert>
        )}
        <Box component='form' onSubmit={handleSubmit}>
          <TextField
            label='Write Comment'
            name='comment'
            value={formData.comment}
            onChange={handleChange}
            multiline
            rows={6}
            fullWidth
            sx={{ mb: 3 }}
            disabled={isFormDisabled}
          />
          <Button variant='contained' size='large' type='submit' disabled={isFormDisabled}>
            Submit
          </Button>
        </Box>
      </Card>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  )
}

export default ReviewsForm
