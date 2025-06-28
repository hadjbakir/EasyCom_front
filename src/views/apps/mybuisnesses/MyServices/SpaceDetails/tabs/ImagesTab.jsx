'use client'

import { useState, useRef } from 'react'

import Image from 'next/image'

import { useSession } from 'next-auth/react'

// MUI Imports
import Typography from '@mui/material/Typography'
import Grid from '@mui/material/Grid'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'
import Alert from '@mui/material/Alert'
import CircularProgress from '@mui/material/CircularProgress'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import Divider from '@mui/material/Divider'
import Tooltip from '@mui/material/Tooltip'
import Fade from '@mui/material/Fade'

// Icon Imports
import { ImageIcon, ZoomIn, Download, Trash2, Upload, Info } from 'lucide-react'

// API Client
import apiClient from '@/libs/api'

const STORAGE_BASE_URL = (process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000').replace(/\/+$/, '')

const constructWorkspaceImageUrl = path => {
  if (!path) return '/images/spaces/default.jpg'
  if (path.startsWith('http')) return path

  return `${STORAGE_BASE_URL}/storage/${path.replace(/^\/+/, '')}`
}

const ImagesTab = ({ space, onImagesUpdated }) => {
  // Session for authentication
  const { data: session } = useSession()

  // States
  const [images, setImages] = useState(
    (space?.images || []).filter(Boolean).map(img => ({
      id: img.id || null,
      image_url: constructWorkspaceImageUrl(img.image_url)
    }))
  )

  const [selectedFiles, setSelectedFiles] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [imageToDelete, setImageToDelete] = useState(null)

  // Ref for file input
  const fileInputRef = useRef(null)

  // Debug logging
  if (process.env.NODE_ENV !== 'production') {
    console.log('ImagesTab: space.images:', space?.images)
    console.log('ImagesTab: images state:', images)
  }

  // Handle file selection
  const handleFileChange = event => {
    const files = Array.from(event.target.files)

    const validFiles = files.filter(file => {
      const isValidType = ['image/jpeg', 'image/png', 'image/jpg'].includes(file.type)
      const isValidSize = file.size <= 2 * 1024 * 1024 // 2MB

      return isValidType && isValidSize
    })

    if (files.length !== validFiles.length) {
      setError('All images must be JPEG, PNG, or JPG and less than 2MB')

      return
    }

    setSelectedFiles(validFiles)
    setError(null)
    handleUpload(validFiles)
  }

  // Handle upload
  const handleUpload = async files => {
    if (!session?.user?.id) {
      setError('You must be logged in to upload images')

      return
    }

    if (!files.length) {
      setError('No valid files selected')

      return
    }

    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      const formData = new FormData()

      files.forEach(file => {
        formData.append(space.type === 'coworking' ? 'pictures[]' : 'images[]', file)
      })

      const endpoint = `/workspaces/${space.id}/${space.type}/images`

      const response = await apiClient.post(endpoint, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })

      if (process.env.NODE_ENV !== 'production') {
        console.log('ImagesTab: Upload response:', response.data)
      }

      const newImages = response.data.data.map(img => ({
        id: img.id,
        image_url: constructWorkspaceImageUrl(img.image_url)
      }))

      setImages(prev => [...prev, ...newImages])
      setSuccess(`${files.length} image${files.length > 1 ? 's' : ''} uploaded successfully`)
      setSelectedFiles([])
      fileInputRef.current.value = null

      // Notify parent component to refresh data
      if (onImagesUpdated) {
        onImagesUpdated()
      }

      setTimeout(() => setSuccess(null), 3000)
    } catch (err) {
      console.error('ImagesTab: Upload failed:', err)
      const message = err.response?.data?.message || 'Failed to upload images'
      const errors = err.response?.data?.errors || {}

      setError(`${message} ${Object.values(errors).flat().join(', ')}`)
    } finally {
      setLoading(false)
    }
  }

  // Open delete confirmation
  const handleDeleteClick = image => {
    if (!image.id || isNaN(image.id)) {
      setError('Cannot delete this image: Invalid or missing image ID')
      console.warn('ImagesTab: Attempted to delete image with invalid ID:', image)

      return
    }

    setImageToDelete(image)
    setDeleteDialogOpen(true)
  }

  // Handle delete
  const handleDelete = async () => {
    if (!session?.user?.id) {
      setError('You must be logged in to delete images')
      setDeleteDialogOpen(false)

      return
    }

    if (!imageToDelete.id || isNaN(imageToDelete.id)) {
      setError('Cannot delete: Invalid image ID')
      setDeleteDialogOpen(false)

      return
    }

    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      const endpoint = `/workspaces/${space.id}/${space.type}/images/${imageToDelete.id}`

      console.log('ImagesTab: Sending DELETE request to:', endpoint)
      await apiClient.delete(endpoint)

      setImages(prev => prev.filter(img => img.id !== imageToDelete.id))
      setSuccess('Image deleted successfully')
      setDeleteDialogOpen(false)
      setImageToDelete(null)

      // Notify parent component to refresh data
      if (onImagesUpdated) {
        onImagesUpdated()
      }

      setTimeout(() => setSuccess(null), 3000)
    } catch (err) {
      console.error('ImagesTab: Delete failed:', err)
      const message = err.response?.data?.message || 'Failed to delete image'

      setError(message)
    } finally {
      setLoading(false)
    }
  }

  // Trigger file input
  const handleUploadClick = () => {
    fileInputRef.current.click()
  }

  return (
    <Card sx={{ marginBottom: 6, borderRadius: 2, boxShadow: theme => theme.shadows[3] }}>
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <ImageIcon size={24} color='primary' />
            <Typography variant='h5' fontWeight='600'>
              Gallery
            </Typography>
          </Box>
          <Box>
            <input
              type='file'
              multiple
              accept='image/jpeg,image/png,image/jpg'
              ref={fileInputRef}
              style={{ display: 'none' }}
              onChange={handleFileChange}
            />
            <Tooltip title='Upload JPEG, PNG, or JPG (max 2MB)' placement='top'>
              <Button
                variant='contained'
                size='medium'
                startIcon={loading ? <CircularProgress size={20} color='inherit' /> : <Upload size={18} />}
                onClick={handleUploadClick}
                disabled={loading}
                sx={{
                  borderRadius: 1.5,
                  px: 3,
                  py: 1,
                  boxShadow: 2,
                  '&:hover': {
                    boxShadow: 4
                  }
                }}
              >
                {loading ? 'Uploading...' : 'Upload Images'}
              </Button>
            </Tooltip>
          </Box>
        </Box>

        <Divider sx={{ mb: 3 }} />

        {error && (
          <Alert
            severity='error'
            sx={{
              mb: 3,
              borderRadius: 1.5,
              boxShadow: 1
            }}
            onClose={() => setError(null)}
            icon={<Info size={24} />}
          >
            {error}
          </Alert>
        )}

        {success && (
          <Alert
            severity='success'
            sx={{
              mb: 3,
              borderRadius: 1.5,
              boxShadow: 1
            }}
            onClose={() => setSuccess(null)}
          >
            {success}
          </Alert>
        )}

        {images.length > 0 ? (
          <Grid container spacing={3}>
            {images.map((image, index) => (
              <Grid item xs={12} sm={6} md={4} key={image.id || `image-${index}`}>
                <Fade in={true} timeout={300 + index * 100}>
                  <Card
                    variant='outlined'
                    sx={{
                      borderRadius: 2,
                      overflow: 'hidden',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-8px)',
                        boxShadow: theme => theme.shadows[8]
                      },
                      border: '1px solid',
                      borderColor: 'divider',
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column'
                    }}
                  >
                    <Box
                      sx={{
                        position: 'relative',
                        aspectRatio: '16/10',
                        overflow: 'hidden',
                        flexGrow: 1
                      }}
                    >
                      <Image
                        src={image.image_url || '/images/spaces/default.jpg'}
                        alt={`Workspace image`}
                        fill
                        style={{
                          objectFit: 'cover',
                          transition: 'transform 0.5s ease'
                        }}
                        quality={90}
                        sizes='(max-width: 600px) 100vw, (max-width: 960px) 50vw, 33vw'
                        onError={e => {
                          e.target.src = '/images/spaces/default.jpg'
                        }}
                      />
                      <Box
                        sx={{
                          position: 'absolute',
                          inset: 0,
                          bgcolor: 'rgba(0,0,0,0)',
                          transition: 'all 0.3s ease',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          opacity: 0,
                          '&:hover': {
                            bgcolor: 'rgba(0,0,0,0.6)',
                            opacity: 1,
                            backdropFilter: 'blur(2px)'
                          }
                        }}
                      >
                        <Box sx={{ display: 'flex', gap: 2 }}>
                          <Tooltip title='View full size' placement='top'>
                            <IconButton
                              size='medium'
                              sx={{
                                color: 'white',
                                bgcolor: 'rgba(255,255,255,0.15)',
                                '&:hover': {
                                  bgcolor: 'rgba(255,255,255,0.25)',
                                  transform: 'scale(1.1)'
                                },
                                transition: 'all 0.2s ease'
                              }}
                              onClick={() => window.open(image.image_url, '_blank')}
                            >
                              <ZoomIn size={22} />
                            </IconButton>
                          </Tooltip>

                          <Tooltip title='Delete image' placement='top'>
                            <IconButton
                              size='medium'
                              sx={{
                                color: 'white',
                                bgcolor: 'rgba(255,255,255,0.15)',
                                '&:hover': {
                                  bgcolor: 'rgba(255,0,0,0.25)',
                                  transform: 'scale(1.1)'
                                },
                                transition: 'all 0.2s ease'
                              }}
                              onClick={() => handleDeleteClick(image)}
                              disabled={loading || !image.id || isNaN(image.id)}
                            >
                              <Trash2 size={22} />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </Box>
                    </Box>
                  </Card>
                </Fade>
              </Grid>
            ))}
          </Grid>
        ) : (
          <Box
            sx={{
              textAlign: 'center',
              py: 10,
              px: 3,
              bgcolor: 'background.paper',
              borderRadius: 2,
              border: '2px dashed',
              borderColor: 'divider'
            }}
          >
            <ImageIcon
              size={64}
              style={{
                margin: '0 auto',
                marginBottom: '16px',
                color: 'text.disabled',
                opacity: 0.6
              }}
            />
            <Typography variant='h6' color='text.secondary' mb={1}>
              No images available
            </Typography>
            <Typography variant='body2' color='text.secondary' mb={4} sx={{ maxWidth: 400, mx: 'auto' }}>
              Upload images to showcase your workspace and attract more clients
            </Typography>
            <Button
              variant='contained'
              size='large'
              startIcon={loading ? <CircularProgress size={20} color='inherit' /> : <Upload size={20} />}
              onClick={handleUploadClick}
              disabled={loading}
              sx={{
                borderRadius: 1.5,
                px: 4,
                py: 1.5,
                boxShadow: 3,
                '&:hover': {
                  boxShadow: 5
                }
              }}
            >
              {loading ? 'Uploading...' : 'Upload Images'}
            </Button>
          </Box>
        )}

        <Dialog
          open={deleteDialogOpen}
          onClose={() => setDeleteDialogOpen(false)}
          PaperProps={{
            sx: {
              borderRadius: 2,
              boxShadow: 24
            }
          }}
        >
          <DialogTitle sx={{ pb: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Trash2 size={20} color='error' />
              <Typography variant='h6'>Confirm Image Deletion</Typography>
            </Box>
          </DialogTitle>
          <Divider />
          <DialogContent sx={{ pt: 3 }}>
            <Typography variant='body1'>
              Are you sure you want to delete this image? This action cannot be undone.
            </Typography>
            <Typography variant='caption' color='text.secondary' sx={{ display: 'block', mt: 1 }}>
              Image ID: {imageToDelete?.id}
            </Typography>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 3 }}>
            <Button
              onClick={() => setDeleteDialogOpen(false)}
              disabled={loading}
              variant='outlined'
              sx={{ borderRadius: 1.5 }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleDelete}
              variant='contained'
              color='error'
              startIcon={loading ? <CircularProgress size={16} color='inherit' /> : <Trash2 size={16} />}
              disabled={loading}
              sx={{
                borderRadius: 1.5,
                ml: 2
              }}
            >
              {loading ? 'Deleting...' : 'Delete Image'}
            </Button>
          </DialogActions>
        </Dialog>
      </CardContent>
    </Card>
  )
}

export default ImagesTab
