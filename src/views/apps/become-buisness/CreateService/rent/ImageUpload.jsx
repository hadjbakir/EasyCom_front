"use client"

import { useState, useCallback } from "react"

import { useDropzone } from "react-dropzone"
import { Box, Typography, Button, CircularProgress, IconButton } from "@mui/material"
import { Upload, X, ImageIcon } from "lucide-react"

const ImageUpload = ({ images, onChange, disabled }) => {
  const [uploading, setUploading] = useState(false)

  const onDrop = useCallback(
    (acceptedFiles) => {
      setUploading(true)

      // Filter for image files only
      const imageFiles = acceptedFiles.filter((file) => file.type.startsWith("image/"))

      // Add new images to existing ones
      const newImages = [...images, ...imageFiles]

      onChange(newImages)

      setUploading(false)
    },
    [images, onChange],
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [],
    },
    disabled: disabled || uploading,
  })

  const removeImage = (index) => {
    const newImages = [...images]

    newImages.splice(index, 1)
    onChange(newImages)
  }

  return (
    <Box>
      {/* Dropzone */}
      <Box
        {...getRootProps()}
        className={`border-2 border-dashed rounded-md p-6 text-center cursor-pointer transition-colors ${
          isDragActive ? "border-primary bg-primary/10" : "border-divider"
        } ${disabled || uploading ? "opacity-60 cursor-not-allowed" : ""}`}
      >
        <input {...getInputProps()} />
        <Upload size={36} className="mx-auto mb-4 text-textSecondary" />
        <Typography variant="h6" className="mb-1">
          Drop images here or click to upload
        </Typography>
        <Typography variant="body2" color="textSecondary" className="mb-4">
          Supported formats: JPG, PNG, GIF (Max 5MB each)
        </Typography>
        <Button variant="outlined" disabled={disabled || uploading}>
          {uploading ? <CircularProgress size={24} className="mr-2" /> : "Select Files"}
        </Button>
      </Box>

      {/* Preview */}
      {images.length > 0 && (
        <Box className="mt-6">
          <Typography variant="subtitle1" className="mb-3">
            {images.length} {images.length === 1 ? "Image" : "Images"} Selected
          </Typography>
          <Box className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {images.map((file, index) => (
              <Box key={index} className="relative group">
                <Box className="aspect-square rounded-md overflow-hidden border bg-background">
                  {file.type?.startsWith("image/") ? (
                    <img
                      src={URL.createObjectURL(file) || "/placeholder.svg"}
                      alt={`Preview ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Box className="w-full h-full flex items-center justify-center">
                      <ImageIcon size={40} className="text-textSecondary" />
                    </Box>
                  )}
                </Box>
                <IconButton
                  size="small"
                  className="absolute top-2 right-2 bg-background opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={(e) => {
                    e.stopPropagation()
                    removeImage(index)
                  }}
                  disabled={disabled}
                >
                  <X size={16} />
                </IconButton>
              </Box>
            ))}
          </Box>
        </Box>
      )}
    </Box>
  )
}

export default ImageUpload
