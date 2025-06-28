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
import { Upload, Clock, Building } from "lucide-react"

import apiClient from "@/libs/api"


// Component Imports
import OpeningHoursInput from "./OpeningHoursInput"
import ImageUpload from "./ImageUpload"

// Form validation schema
const studioSchema = yup.object({
  business_name: yup.string().required("Business name is required"),
  phone_number: yup.string().required("Phone number is required"),
  email: yup.string().email("Enter a valid email").required("Email is required"),
  location: yup.string().required("Location is required"),
  address: yup.string().required("Address is required"),
  description: yup.string().required("Description is required"),
  is_active: yup.boolean(),
  price_per_hour: yup.number().positive("Price must be positive").required("Price per hour is required"),
  price_per_day: yup.number().positive("Price must be positive").required("Price per day is required"),
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

const StudioTab = ({ onSuccess, onError }) => {
  const [loading, setLoading] = useState(false)
  const [images, setImages] = useState([])
  const [picture, setPicture] = useState(null)

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
      price_per_hour: "",
      price_per_day: "",
      picture: null,
    },
    resolver: yupResolver(studioSchema),
  })

  const handleImageChange = (newImages) => {
    setImages(newImages)
  }

  const handleFileInputChange = (event) => {
    const file = event.target.files[0]

    if (file) {
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

  const [openingHours, setOpeningHours] = useState({})

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
      formData.append("is_active", data.is_active)
      formData.append("price_per_hour", data.price_per_hour)
      formData.append("price_per_day", data.price_per_day)
      formData.append("opening_hours", JSON.stringify(openingHours))
      formData.append("type", "studio")

      if (picture) {
        formData.append("picture", picture)
      }

      // Create the studio space
      const response = await apiClient.post("/workspaces/studio/create", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })

      // If successful, upload additional images
      if (response.data && response.data.data && response.data.data.id) {
        const workspaceId = response.data.data.id

        if (images.length > 0) {
          await uploadImages(workspaceId)
        }

        onSuccess("Studio space created successfully!")
        reset()
        setImages([])
        setPicture(null)
      }
    } catch (error) {
      console.error("Error creating studio space:", error)
      const message = error.response?.data?.message || "Failed to create studio space."
      const errors = error.response?.data?.errors || {}

      onError(`${message} ${Object.values(errors).join(", ")}`)
    } finally {
      setLoading(false)
    }
  }

  const uploadImages = async (workspaceId) => {
    try {
      const formData = new FormData()

      images.forEach((image, index) => {
        formData.append(`images[${index}]`, image)
      })

      await apiClient.post(`/workspaces/${workspaceId}/studio/images`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })
    } catch (error) {
      console.error("Error uploading images:", error)
      onError("Studio created, but failed to upload images.")
      throw error
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Box className="mb-6">
        <Typography variant="h6" className="mb-4">
          Basic Information
        </Typography>

           <Grid item xs={12} >
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
                        htmlFor="studio-picture-upload"
                        disabled={loading}
                      >
                        Upload New Photo
                        <input
                          hidden
                          type="file"
                          accept="image/png, image/jpeg"
                          onChange={handleFileInputChange}
                          id="studio-picture-upload"
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
    {/* add espace between this two grid and not divider */}

        <Divider className="my-6" />

        <Grid container spacing={4}>
          {/* Business Name */}
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

          {/* Phone Number */}
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

          {/* Email */}
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

          {/* Location */}
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

          {/* Address */}
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

          {/* Description */}
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

          {/* Profile Picture */}


          {/* Is Active */}
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
                  label="Studio is active and available for booking"
                />
              )}
            />
          </Grid>
        </Grid>
      </Box>



      {/* Opening Hours */}


      <Divider className="my-6" />

      {/* Studio-specific fields */}
      <Box className="mb-6">
        <Typography variant="h6" className="mb-4 flex items-center">
          <Building size={20} className="mr-2" />
          Studio Details
        </Typography>

        <Grid container spacing={4}>
          {/* Price per hour */}
          <Grid item xs={12} md={6}>
            <Controller
              name="price_per_hour"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Price per Hour"
                  fullWidth
                  type="number"
                  InputProps={{
                    startAdornment: <InputAdornment position="start">$</InputAdornment>,
                  }}
                  error={!!errors.price_per_hour}
                  helperText={errors.price_per_hour?.message}
                  disabled={loading}
                />
              )}
            />
          </Grid>

          {/* Price per day */}
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
        </Grid>
      </Box>

      <Divider className="my-6" />

      {/* Image Upload */}
      <Box className="mb-6">
        <Typography variant="h6" className="mb-4 flex items-center">
          <Upload size={20} className="mr-2" />
          Studio Images
        </Typography>
        <ImageUpload images={images} onChange={handleImageChange} disabled={loading} />
      </Box>

      {/* Submit Button */}
      <Box className="mt-8 flex justify-end">
        <Button
          type="submit"
          variant="contained"
          color="primary"
          size="large"
          disabled={loading}
          startIcon={loading ? <CircularProgress size={20} /> : null}
        >
          {loading ? "Creating..." : "Create Studio Space"}
        </Button>
      </Box>
    </form>
  )
}

export default StudioTab
