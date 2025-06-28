"use client"

import { useState } from "react"

import { Card, Box, Typography, TextField, Button, Rating, Snackbar, Alert } from "@mui/material"

const ReviewsForm = ({ onSubmit }) => {
  const [formData, setFormData] = useState({
    comment: "",
    rating: 5,
  })

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleRatingChange = (event, newValue) => {
    setFormData((prev) => ({
      ...prev,
      rating: newValue,
    }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    // Validate form
    if (!formData.comment.trim()) {
      setSnackbar({
        open: true,
        message: "Please write a comment",
        severity: "error",
      })
      return
    }

    // Pass the review data to parent component
    onSubmit(formData)

    // Reset form
    setFormData({
      comment: "",
      rating: 5,
    })
  }

  const handleCloseSnackbar = () => {
    setSnackbar((prev) => ({
      ...prev,
      open: false,
    }))
  }

  return (
    <>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h6">Write Feedback Here:</Typography>
        <Rating value={formData.rating} onChange={handleRatingChange} size="large" />
      </Box>

      <Card sx={{ p: 3 }}>
        <Box component="form" onSubmit={handleSubmit}>
          <TextField
            label="Write Comment"
            name="comment"
            value={formData.comment}
            onChange={handleChange}
            multiline
            rows={6}
            fullWidth
            sx={{ mb: 3 }}
            required
          />
          <Button variant="contained" size="large" type="submit">
            Submit
          </Button>
        </Box>
      </Card>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: "100%" }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  )
}

export default ReviewsForm
