"use client"

import { useState } from "react"

import { useForm, Controller } from "react-hook-form"
import { yupResolver } from "@hookform/resolvers/yup"

import * as yup from "yup"

// MUI Imports
import {
  Box,
  Grid,
  TextField,
  Button,
  FormControlLabel,
  Switch,
  Typography,
  Divider,
  CircularProgress,
  InputAdornment,
} from "@mui/material"

// Icon Imports
import { Upload, Clock, Users } from "lucide-react"

import apiClient from "@/libs/api"

// Component Imports
import OpeningHoursInput from "./OpeningHoursInput"
import ImageUpload from "./ImageUpload"

// Form validation schema
const coworkingSchema = yup.object({
  business_name: yup.string().required("Business name is required"),
  phone_number: yup.string().required("Phone number is required"),
  email: yup.string().email("Enter a valid email").required("Email is required"),
  location: yup.string().required("Location is required"),
  address: yup.string().required("Address is required"),
  description: yup.string().required("Description is required"),
  is_active: yup.boolean(),
  price_per_day: yup.number().positive("Price must be positive").required("Price per day is required"),
  price_per_month: yup.number().positive("Price must be positive").required("Price per month is required"),
  seating_capacity: yup
    .number()
    .positive("Capacity must be positive")
    .integer("Capacity must be a whole number")
    .required("Seating capacity is required"),
  meeting_rooms: yup
    .number()
    .min(0, "Cannot be negative")
    .integer("Must be a whole number")
    .required("Number of meeting rooms is required"),
  picture: yup
    .mixed()
    .nullable()
    .test("fileType", "Only JPG or PNG files are allowed", (value) =>
      !value || ["image/jpeg", "image/png"].includes(value.type)
    )
    .test("fileSize", "File size must be less than 2MB", (value) =>
      !value || value.size <= 2 * 1024 * 1024
    ),
})

const STORAGE_BASE_URL = (process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000').replace(/\/+$/, '');

const CoworkingTab = ({ onSuccess, onError }) => {
  const [loading, setLoading] = useState(false)
  const [images, setImages] = useState([])
  const [picture, setPicture] = useState(null)
  const [openingHours, setOpeningHours] = useState({})

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm({
    defaultValues: {
      business_name: "",
      phone_number: "",
      email: "",
      location: "",
      address: "",
      description: "",
      is_active: true,
      price_per_day: "",
      price_per_month: "",
      seating_capacity: "",
      meeting_rooms: "",
      picture: null,
    },
    resolver: yupResolver(coworkingSchema),
  })

  const handleImageChange = (newImages) => {
    setImages(newImages)
  }

  const handleFileInputChange = (event) => {
    const file = event.target.files[0]

    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        onError("Picture size must be less than 2MB")

        return
      }

      setPicture(file)
      setValue("picture", file, { shouldValidate: true })
    }
  }

  const handleOpeningHoursChange = (day, field, value) => {
    setOpeningHours((prev) => ({
      ...prev,
      [day]: {
        ...prev[day],
        [field]: value,
      },
    }))
  }

  const onSubmit = async (data) => {
    try {
      setLoading(true)

      // Prepare the form data
      const formData = new FormData()

      formData.append("business_name", data.business_name)
      formData.append("phone_number", data.phone_number)
      formData.append("email", data.email)
      formData.append("location", data.location)
      formData.append("address", data.address)
      formData.append("description", data.description)
      formData.append("is_active", data.is_active ? '1' : '0')
      formData.append("price_per_day", data.price_per_day)
      formData.append("price_per_month", data.price_per_month)
      formData.append("seating_capacity", data.seating_capacity)
      formData.append("meeting_rooms", data.meeting_rooms)
      formData.append("opening_hours", JSON.stringify(openingHours))
      formData.append("type", "coworking")

      if (picture) {
        formData.append("picture", picture)
      }

      // Log FormData for debugging
      console.log("FormData contents:", Object.fromEntries(formData))

      // Create the coworking space
      const response = await apiClient.post("/workspaces/coworking/create", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })

      console.log("Coworking creation response:", response.data)

      // If successful, upload additional images
      const workspaceId = response.data.data.id
      let imageUrls = []

      if (images && images.length > 0) {
        const imageFormData = new FormData()

        images.forEach((file, index) => imageFormData.append(`pictures[${index}]`, file))

        const imageResponse = await apiClient.post(`/workspaces/${workspaceId}/coworking/images`, imageFormData, {
          headers: { "Content-Type": "multipart/form-data" }
        })

        console.log("Image upload response:", imageResponse.data)

        imageUrls = imageResponse.data.data.map(img => img.image_url)
      }

      // Construct new space object
      const newSpace = {
        id: workspaceId,
        business_name: data.business_name,
        phone_number: data.phone_number,
        email: data.email,
        location: data.location,
        address: data.address,
        description: data.description,
        opening_hours: JSON.stringify(openingHours),
        type: "coworking",
        is_active: data.is_active,
        picture: response.data.data.picture
          ? `${STORAGE_BASE_URL}/storage/${response.data.data.picture}`
          : "/images/spaces/default-coworking.jpg",
        images: imageUrls.map(url =>
          url.startsWith('/storage/')
            ? `${STORAGE_BASE_URL}${url}`
            : `${STORAGE_BASE_URL}/storage/${url}`
        ),
        coworking: {
          id: response.data.data.coworking?.id || Date.now(),
          price_per_day: data.price_per_day,
          price_per_month: data.price_per_month,
          seating_capacity: data.seating_capacity,
          meeting_rooms: data.meeting_rooms,
        },
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }

      onSuccess("Coworking space created successfully!", newSpace)
      reset()
      setImages([])
      setPicture(null)
    } catch (error) {
      console.error("Error creating coworking space:", error)
      const message = error.response?.data?.message || "Failed to create coworking space."
      const errors = error.response?.data?.errors || {}

      onError(`${message} ${Object.values(errors).flat().join(", ")}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Box className="mb-6">
        <Typography variant="h6" className="mb-4">
          Basic Information
        </Typography>
        <Grid item xs={12}>
          <Controller
            name="picture"
            control={control}
            render={({ field }) => (
              <Box
                className="flex max-sm:flex-col items-center gap-6"
                sx={{
                  flexDirection: { xs: "column", sm: "row" },
                  alignItems: "center",
                  gap: 3,
                }}
              >
                <img
                  height={100}
                  width={100}
                  className="rounded"
                  src={picture ? URL.createObjectURL(picture) : "/images/avatars/Tannemirt.png"}
                  alt="Profile"
                  style={{ borderRadius: "4px" }}
                />
                <Box
                  className="flex flex-grow flex-col gap-4"
                  sx={{ flexGrow: 1, display: "flex", flexDirection: "column", gap: 2 }}
                >
                  <Box
                    className="flex flex-col sm:flex-row gap-4"
                    sx={{ flexDirection: { xs: "column", sm: "row" }, gap: 2 }}
                  >
                    <Button
                      component="label"
                      variant="contained"
                      htmlFor="coworking-picture-upload"
                      disabled={loading}
                    >
                      Upload New Photo
                      <input
                        hidden
                        type="file"
                        accept="image/png, image/jpeg"
                        onChange={handleFileInputChange}
                        id="coworking-picture-upload"
                        disabled={loading}
                      />
                    </Button>
                  </Box>
                  <Typography>Allowed JPG or PNG. Max size of 2MB</Typography>
                  {errors.picture && (
                    <Typography variant="caption" color="error">
                      {errors.picture.message}
                    </Typography>
                  )}
                </Box>
              </Box>
            )}
          />
        </Grid>
                <Divider className="my-6" />

        <Grid container spacing={4}>
          <Grid item xs={12} md={6}>
            <Controller
              name="business_name"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Business Name"
                  fullWidth
                  error={!!errors.business_name}
                  helperText={errors.business_name?.message}
                  disabled={loading}
                />
              )}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <Controller
              name="phone_number"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Phone Number"
                  fullWidth
                  error={!!errors.phone_number}
                  helperText={errors.phone_number?.message}
                  disabled={loading}
                />
              )}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <Controller
              name="email"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Email"
                  fullWidth
                  error={!!errors.email}
                  helperText={errors.email?.message}
                  disabled={loading}
                />
              )}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <Controller
              name="location"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Location (City)"
                  fullWidth
                  error={!!errors.location}
                  helperText={errors.location?.message}
                  disabled={loading}
                />
              )}
            />
          </Grid>
          <Grid item xs={12}>
            <Controller
              name="address"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Full Address"
                  fullWidth
                  error={!!errors.address}
                  helperText={errors.address?.message}
                  disabled={loading}
                />
              )}
            />
          </Grid>
          <Grid item xs={12}>
            <Controller
              name="description"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Description"
                  fullWidth
                  multiline
                  rows={4}
                  error={!!errors.description}
                  helperText={errors.description?.message}
                  disabled={loading}
                />
              )}
            />
          </Grid>
          <Grid item xs={12}>
            <Controller
              name="is_active"
              control={control}
              render={({ field }) => (
                <FormControlLabel
                  control={
                    <Switch
                      checked={field.value}
                      onChange={(e) => field.onChange(e.target.checked)}
                      disabled={loading}
                    />
                  }
                  label="Coworking space is active and available for booking"
                />
              )}
            />
          </Grid>
        </Grid>
      </Box>

      <Divider className="my-6" />



      <Box className="mb-6">
        <Typography variant="h6" className="mb-4 flex items-center">
          <Users size={20} className="mr-2" />
          Coworking Details
        </Typography>
        <Grid container spacing={4}>
          <Grid item xs={12} md={6}>
            <Controller
              name="price_per_day"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Price per Day"
                  fullWidth
                  type="number"
                  InputProps={{
                    startAdornment: <InputAdornment position="start">$</InputAdornment>,
                  }}
                  error={!!errors.price_per_day}
                  helperText={errors.price_per_day?.message}
                  disabled={loading}
                />
              )}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <Controller
              name="price_per_month"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Price per Month"
                  fullWidth
                  type="number"
                  InputProps={{
                    startAdornment: <InputAdornment position="start">$</InputAdornment>,
                  }}
                  error={!!errors.price_per_month}
                  helperText={errors.price_per_month?.message}
                  disabled={loading}
                />
              )}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <Controller
              name="seating_capacity"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Seating Capacity"
                  fullWidth
                  type="number"
                  error={!!errors.seating_capacity}
                  helperText={errors.seating_capacity?.message}
                  disabled={loading}
                />
              )}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <Controller
              name="meeting_rooms"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Number of Meeting Rooms"
                  fullWidth
                  type="number"
                  error={!!errors.meeting_rooms}
                  helperText={errors.meeting_rooms?.message}
                  disabled={loading}
                />
              )}
            />
          </Grid>
        </Grid>
      </Box>

      <Divider className="my-6" />

      <Box className="mb-6">
        <Typography variant="h6" className="mb-4 flex items-center">
          <Upload size={20} className="mr-2" />
          Coworking Space Images
        </Typography>
        <ImageUpload images={images} onChange={handleImageChange} disabled={loading} />
      </Box>

      <Box className="mt-8 flex justify-end">
        <Button
          type="submit"
          variant="contained"
          color="primary"
          size="large"
          disabled={loading}
          startIcon={loading ? <CircularProgress size={20} /> : null}
        >
          {loading ? "Creating..." : "Create Coworking Space"}
        </Button>
      </Box>
    </form>
  )
}

export default CoworkingTab
