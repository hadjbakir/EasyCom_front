'use client'

import { useState, useEffect, useRef } from "react"

import {
  Box,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  CardMedia,
  CardActions,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress
} from "@mui/material"

import {
  Plus,
  Trash2,
  Edit,
  ChevronLeft,
  ChevronRight,
  ImageIcon
} from "lucide-react"

import DialogCloseButton from '@/components/dialogs/DialogCloseButton'
import apiClient from "@/libs/api"

const STORAGE_BASE_URL = (process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000').replace(/\/+$/, '');

const PortfolioTab = ({ skillId }) => {
  const [projectItems, setProjectItems] = useState([])
  const [pictureItems, setPictureItems] = useState([])
  const [portfolioItems, setPortfolioItems] = useState([])
  const [openDialog, setOpenDialog] = useState(false)
  const [currentItem, setCurrentItem] = useState(null)
  const [newItemType, setNewItemType] = useState("simple")

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    images: [],
    imageFiles: []
  })

  const [carouselIndexes, setCarouselIndexes] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [successMessage, setSuccessMessage] = useState(null)
  const [deleteDialog, setDeleteDialog] = useState({ open: false, type: null, id: null, imageIndex: null })
  const fileInputRef = useRef(null)

  // Auto-dismiss success message after 3 seconds
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage(null)
      }, 3000)

      return () => clearTimeout(timer)
    }
  }, [successMessage])

  // Fetch portfolio items
  useEffect(() => {
    const fetchPortfolioItems = async () => {
      setLoading(true)
      setError(null)

      try {
        const response = await apiClient.get(`/service-providers/${skillId}/portfolio`)
        const { projects, service_provider_pictures } = response.data.data

        const newProjectItems = projects.map(project => ({
          id: project.id.toString(),
          type: "title",
          title: project.title || "",
          description: project.description || "",
          images: project.pictures.map(p => ({
            id: p.id,
            url: p.picture.startsWith('/storage/')
              ? `${STORAGE_BASE_URL}${p.picture}`
              : `${STORAGE_BASE_URL}/storage/${p.picture}`
          })),
          created_at: project.created_at
        }))

        const newPictureItems = service_provider_pictures.length > 0 ? [{
          id: "simple-portfolio",
          type: "simple",
          title: "",
          description: "",
          images: service_provider_pictures.map(p => ({
            id: p.id,
            url: p.picture.startsWith('/storage/')
              ? `${STORAGE_BASE_URL}${p.picture}`
              : `${STORAGE_BASE_URL}/storage/${p.picture}`
          })),
          created_at: service_provider_pictures[0].created_at
        }] : []

        setProjectItems(newProjectItems)
        setPictureItems(newPictureItems)
        setPortfolioItems([...newProjectItems, ...newPictureItems])

        if (process.env.NODE_ENV !== 'production') {
          console.log('Projects fetched:', newProjectItems)
          console.log('Pictures fetched:', newPictureItems)
        }
      } catch (error) {
        setError(error.response?.data?.message || 'Failed to load portfolio items')
        console.error('Fetch portfolio error:', error)
      } finally {
        setLoading(false)
      }
    }

    if (skillId) {
      fetchPortfolioItems()
    }
  }, [skillId])

  const handleOpenDialog = (type = "simple", item = null) => {
    if (item) {
      setCurrentItem(item)
      setNewItemType(item.type)
      setFormData({
        title: item.title || "",
        description: item.description || "",
        images: item.images.map(img => img.url) || [],
        imageFiles: []
      })
    } else {
      setCurrentItem(null)
      setNewItemType(type)
      setFormData({
        title: "",
        description: "",
        images: [],
        imageFiles: []
      })
    }

    setOpenDialog(true)
  }

  const handleCloseDialog = () => {
    setOpenDialog(false)
    setCurrentItem(null)
    setError(null)
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target

    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleTypeChange = (e) => {
    setNewItemType(e.target.value)
    setFormData((prev) => ({
      ...prev,
      title: "",
      description: "",
      images: [],
      imageFiles: []
    }))
  }

  const handleAddImage = (e) => {
    const files = Array.from(e.target.files)

    if (files.length === 0) return

    const validFiles = files.filter(file => {
      if (file.size > 2 * 1024 * 1024) {
        setError(`File ${file.name} exceeds 2MB limit`)

        return false
      }

      return true
    })

    const newImages = validFiles.map(file => URL.createObjectURL(file))

    setFormData((prev) => ({
      ...prev,
      images: [...prev.images, ...newImages],
      imageFiles: [...prev.imageFiles, ...validFiles]
    }))
  }

  const handleRemoveImage = (index) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
      imageFiles: prev.imageFiles.filter((_, i) => i !== index)
    }))
  }

  const handleSaveItem = async () => {
    if (newItemType === "title" && (!formData.title || formData.images.length === 0)) {
      setError("Title and at least one image are required for Title and Photos type")

      return
    }

    if (newItemType === "simple" && formData.images.length === 0) {
      setError("At least one image is required for Simple Photos type")

      return
    }

    setLoading(true)
    setError(null)

    try {
      let projectId = null
      let uploadedImages = []

      if (newItemType === "title") {
        const formDataUpload = new FormData()

        formDataUpload.append('title', formData.title)
        formDataUpload.append('description', formData.description)
        formData.imageFiles.forEach(file => {
          formDataUpload.append('pictures[]', file)
        })

        const projectResponse = await apiClient.post(`/service-providers/${skillId}/portfolio/projects`, formDataUpload, {
          headers: { 'Content-Type': 'multipart/form-data' }
        })

        projectId = projectResponse.data.data.id
        uploadedImages = projectResponse.data.data.pictures.map(p => ({
          id: p.id,
          url: p.picture.startsWith('/storage/')
            ? `${STORAGE_BASE_URL}${p.picture}`
            : `${STORAGE_BASE_URL}/storage/${p.picture}`
        }))

        const newItem = {
          id: projectId.toString(),
          type: "title",
          title: formData.title,
          description: formData.description,
          images: uploadedImages,
          created_at: new Date().toISOString()
        }

        setProjectItems((prev) => [...prev, newItem])
        setPortfolioItems((prev) => [...prev.filter(item => item.type !== "simple"), newItem, ...prev.filter(item => item.type === "simple")])
      } else {
        if (formData.imageFiles.length > 0) {
          const formDataUpload = new FormData()

          formData.imageFiles.forEach(file => {
            formDataUpload.append('pictures[]', file)
          })

          const pictureResponse = await apiClient.post(`/service-providers/${skillId}/portfolio/pictures`, formDataUpload, {
            headers: { 'Content-Type': 'multipart/form-data' }
          })

          uploadedImages = pictureResponse.data.data.pictures.map(p => ({
            id: p.id,
            url: p.picture.startsWith('/storage/')
              ? `${STORAGE_BASE_URL}${p.picture}`
              : `${STORAGE_BASE_URL}/storage/${p.picture}`
          }))

          setPictureItems((prev) => {
            if (prev.length > 0) {
              return [{
                ...prev[0],
                images: [...new Set([...prev[0].images, ...uploadedImages].map(img => JSON.stringify(img)))].map(str => JSON.parse(str)),
                created_at: new Date().toISOString()
              }]
            }

            return [{
              id: "simple-portfolio",
              type: "simple",
              title: "",
              description: "",
              images: uploadedImages,
              created_at: new Date().toISOString()
            }]
          })
          setPortfolioItems((prev) => {
            const simpleItemIndex = prev.findIndex(item => item.type === "simple")
            const newImages = uploadedImages
            let updatedItems = [...prev.filter(item => item.type !== "simple")]

            if (simpleItemIndex >= 0) {
              updatedItems = [...updatedItems, {
                ...prev[simpleItemIndex],
                images: [...new Set([...prev[simpleItemIndex].images, ...newImages].map(img => JSON.stringify(img)))].map(str => JSON.parse(str)),
                created_at: new Date().toISOString()
              }]
            } else {
              updatedItems = [...updatedItems, {
                id: "simple-portfolio",
                type: "simple",
                title: "",
                description: "",
                images: newImages,
                created_at: new Date().toISOString()
              }]
            }

            return [...prev.filter(item => item.type === "title"), ...updatedItems]
          })
        }
      }

      setSuccessMessage("Portfolio item added successfully")
      handleCloseDialog()
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to create portfolio item')
      console.error('Create portfolio error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleOpenDeleteDialog = (type, id, imageIndex = null) => {
    setDeleteDialog({ open: true, type, id, imageIndex })
  }

  const handleCloseDeleteDialog = () => {
    setDeleteDialog({ open: false, type: null, id: null, imageIndex: null })
  }

  const handleDeleteItem = async () => {
    const { type, id, imageIndex } = deleteDialog

    setLoading(true)
    setError(null)

    try {
      if (type === "title") {
        await apiClient.delete(`/service-providers/portfolio/projects/${id}`)
        setProjectItems(prev => prev.filter(item => item.id !== id))
        setPortfolioItems(prev => prev.filter(item => item.id !== id))
        setSuccessMessage("Portfolio project deleted successfully")
      } else if (type === "simple") {
        const simpleItem = pictureItems.find(item => item.id === "simple-portfolio")

        if (simpleItem && imageIndex !== null) {
          const imageId = simpleItem.images[imageIndex].id

          await apiClient.delete(`/service-providers/portfolio/pictures/${imageId}`)
          setPictureItems(prev => {
            if (prev.length > 0) {
              const updatedImages = prev[0].images.filter((_, i) => i !== imageIndex)

              return updatedImages.length > 0 ? [{
                ...prev[0],
                images: updatedImages,
                created_at: new Date().toISOString()
              }] : []
            }

            return prev
          })
          setPortfolioItems(prev => {
            const simpleItemIndex = prev.findIndex(item => item.type === "simple")

            if (simpleItemIndex >= 0) {
              const updatedImages = prev[simpleItemIndex].images.filter((_, i) => i !== imageIndex)
              const updatedItems = [...prev.filter(item => item.type !== "simple")]

              if (updatedImages.length > 0) {
                updatedItems.push({
                  ...prev[simpleItemIndex],
                  images: updatedImages,
                  created_at: new Date().toISOString()
                })
              }

              return [...prev.filter(item => item.type === "title"), ...updatedItems]
            }

            return prev
          })
          setSuccessMessage("Portfolio image deleted successfully")
        }
      }

      handleCloseDeleteDialog()
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to delete item')
      console.error('Delete error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCarouselNav = (itemId, direction) => {
    const item = portfolioItems.find((i) => i.id === itemId)

    if (!item || !item.images || item.images.length <= 1) return

    const currentIndex = carouselIndexes[itemId] || 0
    let newIndex

    if (direction === "next") {
      newIndex = (currentIndex + 1) % item.images.length
    } else {
      newIndex = (currentIndex - 1 + item.images.length) % item.images.length
    }

    setCarouselIndexes((prev) => ({ ...prev, [itemId]: newIndex }))
  }

  const renderPortfolioItem = (item) => {
    switch (item.type) {
      case "simple":
        return (
          <Card>
            <CardContent>
              <Grid container spacing={2}>
                {item.images.map((image, index) => (
                  <Grid item xs={12} sm={6} md={4} key={index}>
                    <Box className="relative">
                      <CardMedia
                        component="img"
                        height="200"
                        image={image.url}
                        alt={`Portfolio image ${index + 1}`}
                        sx={{ borderRadius: 1 }}
                        onError={() => console.error(`Failed to load image: ${image.url}`)}
                      />
                      <IconButton
                        size="small"
                        className="absolute top-2 right-2 bg-default/80 hover:bg-white"
                        onClick={() => handleOpenDeleteDialog("simple", item.id, index)}
                        color="error"
                      >
                        <Trash2 size={16} />
                      </IconButton>
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </CardContent>
            <CardActions className="flex justify-end">
              <IconButton size="small" onClick={() => handleOpenDialog(item.type, item)} disabled>
                <Edit size={18} />
              </IconButton>
            </CardActions>
          </Card>
        )

      case "title":
        const carouselIndex = carouselIndexes[item.id] || 0

        return (
          <Card>
            <CardContent>
              <Typography variant="h6" className="mb-1">
                {item.title}
              </Typography>
              {item.description && (
                <Typography variant="body2" color="textSecondary" className="mb-3">
                  {item.description}
                </Typography>
              )}
              <Box className="relative">
                <CardMedia
                  component="img"
                  height="300"
                  image={item.images[carouselIndex]?.url || '/placeholder.svg'}
                  alt={item.title}
                  sx={{ borderRadius: 1 }}
                  onError={() => console.error(`Failed to load image: ${item.images[carouselIndex]?.url}`)}
                />
                {item.images.length > 1 && (
                  <>
                    <IconButton
                      className="absolute top-1/2 left-2 transform -translate-y-1/2 bg-default/80 hover:bg-default"
                      size="small"
                      onClick={() => handleCarouselNav(item.id, "prev")}
                      sx={{ color: 'black' }}
                    >
                      <ChevronLeft size={25} />
                    </IconButton>
                    <IconButton
                      className="absolute top-1/2 right-2 transform -translate-y-1/2 bg-default/80 hover:bg-default"
                      size="small"
                      onClick={() => handleCarouselNav(item.id, "next")}
                      sx={{ color: 'black' }}
                    >
                      <ChevronRight size={25} />
                    </IconButton>
                    <Box className="absolute bottom-2 left-0 right-0 flex justify-center">
                      <Box className="flex gap-1 bg-black/50 rounded-full px-2 py-1">
                        {item.images.map((_, index) => (
                          <Box
                            key={index}
                            className={`w-2 h-2 rounded-full ${index === carouselIndex ? "bg-white" : "bg-white/50"}`}
                          />
                        ))}
                      </Box>
                    </Box>
                  </>
                )}
              </Box>
            </CardContent>
            <CardActions className="flex justify-end">
              <IconButton size="small" onClick={() => handleOpenDialog(item.type, item)} disabled>
                <Edit size={18} />
              </IconButton>
              <IconButton
                size="small"
                color="error"
                onClick={() => handleOpenDeleteDialog("title", item.id)}
              >
                <Trash2 size={18} />
              </IconButton>
            </CardActions>
          </Card>
        )

      default:
        return null
    }
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="flex justify-center items-center p-6">
          <CircularProgress />
          <Typography className="ml-2">Loading portfolio items...</Typography>
        </CardContent>
      </Card>
    )
  }

  return (
    <Box>
      {successMessage && (
        <Alert severity="success" className="mb-4">
          {successMessage}
        </Alert>
      )}
      {error && (
        <Alert severity="error" className="mb-4">
          {error}
        </Alert>
      )}
      <Box className="flex justify-between items-center mb-6">
        <Typography variant="h6">Portfolio</Typography>
        <Button variant="contained" color="primary" startIcon={<Plus size={18} />} onClick={() => handleOpenDialog()}>
          Add Portfolio Item
        </Button>
      </Box>

      {/* Projects Section */}
      <Box className="mb-8">
        <Typography variant="h5" className="mb-4">Projects</Typography>
        <Grid container spacing={4}>
          {projectItems.map((item) => (
            <Grid item xs={12} md={6} key={item.id}>
              {renderPortfolioItem(item)}
            </Grid>
          ))}
          {projectItems.length === 0 && (
            <Grid item xs={12}>
              <Card>
                <CardContent className="text-center py-10">
                  <ImageIcon size={48} className="mx-auto mb-4 text-textSecondary" />
                  <Typography variant="h6">No Projects</Typography>
                  <Typography variant="body2" color="textSecondary" className="mt-1 mb-4">
                    Add projects to showcase your work
                  </Typography>
                  <Button
                    variant="outlined"
                    color="primary"
                    startIcon={<Plus size={18} />}
                    onClick={() => handleOpenDialog("title")}
                  >
                    Add Your First Project
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          )}
        </Grid>
      </Box>

      {/* Photos Section */}
      <Box>
        <Typography variant="h5" className="mb-4">Photos</Typography>
        <Grid container spacing={4}>
          {pictureItems.map((item) => (
            <Grid item xs={12} key={item.id}>
              {renderPortfolioItem(item)}
            </Grid>
          ))}
          {pictureItems.length === 0 && (
            <Grid item xs={12}>
              <Card>
                <CardContent className="text-center py-10">
                  <ImageIcon size={48} className="mx-auto mb-4 text-textSecondary" />
                  <Typography variant="h6">No Photos</Typography>
                  <Typography variant="body2" color="textSecondary" className="mt-1 mb-4">
                    Add photos to showcase your work
                  </Typography>
                  <Button
                    variant="outlined"
                    color="primary"
                    startIcon={<Plus size={18} />}
                    onClick={() => handleOpenDialog("simple")}
                  >
                    Add Your First Photo
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          )}
        </Grid>
      </Box>

      {/* Add/Edit Portfolio Item Dialog */}
      <Dialog
        fullWidth
        maxWidth="md"
        open={openDialog}
        onClose={handleCloseDialog}
        scroll="body"
        closeAfterTransition={false}
        sx={{ '& .MuiDialog-paper': { overflow: 'visible' } }}
      >
        <DialogCloseButton onClick={handleCloseDialog} disableRipple>
          <i className="tabler-x" />
        </DialogCloseButton>
        <DialogTitle variant="h4" className="flex gap-2 flex-col text-center sm:pbs-16 sm:pbe-6 sm:pli-16">
          {currentItem ? 'Edit Portfolio Item' : 'Add Portfolio Item'}
          <Typography component="span" className="flex flex-col text-center">
            {currentItem ? 'Update the portfolio item details.' : 'Create a new portfolio item.'}
          </Typography>
        </DialogTitle>
        <DialogContent className="pbs-0 sm:pli-16 sm:pbe-16">
          {error && (
            <Alert severity="error" className="mb-4">
              {error}
            </Alert>
          )}
          <Box className="mt-2">
            <FormControl fullWidth className="mb-4">
              <InputLabel id="portfolio-type-label">Portfolio Item Type</InputLabel>
              <Select
                labelId="portfolio-type-label"
                id="portfolio-type"
                value={newItemType}
                label="Portfolio Item Type"
                onChange={handleTypeChange}
              >
                <MenuItem value="simple">
                  <Box className="flex items-center gap-2">
                    <ImageIcon size={18} />
                    <span>Simple Photo Gallery</span>
                  </Box>
                </MenuItem>
                <MenuItem value="title">
                  <Box className="flex items-center gap-2">
                    <ImageIcon size={18} />
                    <span>Title and Photos</span>
                  </Box>
                </MenuItem>
              </Select>
            </FormControl>

            {newItemType === "title" && (
              <>
                <TextField
                  label="Title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  fullWidth
                  required
                  className="mb-4"
                />
                <TextField
                  label="Description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  fullWidth
                  multiline
                  rows={2}
                  className="mb-4"
                />
              </>
            )}

            <Typography variant="subtitle1" className="mb-2">
              Project Images
            </Typography>

            <Box className="mb-4">
              <input
                type="file"
                accept="image/png,image/jpeg"
                multiple
                ref={fileInputRef}
                onChange={handleAddImage}
                style={{ display: 'none' }}
              />
              <Button
                variant="outlined"
                startIcon={<Plus size={18} />}
                onClick={() => fileInputRef.current.click()}
                className="mb-4"
              >
                Add Images
              </Button>
              <Grid container spacing={2}>
                {formData.images.map((image, index) => (
                  <Grid item xs={6} sm={4} key={index}>
                    <Box className="relative">
                      <img
                        src={image}
                        alt={`Portfolio ${index + 1}`}
                        className="w-full h-[120px] object-cover rounded border border-gray-300"
                      />
                      <IconButton
                        size="small"
                        className="absolute top-2 right-2 bg-default/80 hover:bg-white"
                        onClick={() => handleRemoveImage(index)}
                        color="error"
                      >
                        <Trash2 size={16} />
                      </IconButton>
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} disabled={loading}>Cancel</Button>
          <Button
            onClick={handleSaveItem}
            variant="contained"
            color="primary"
            disabled={
              loading ||
              (newItemType === "title" && (!formData.title || formData.images.length === 0)) ||
              (newItemType === "simple" && formData.images.length === 0)
            }
          >
            {loading ? "Saving..." : currentItem ? "Update" : "Add Portfolio Item"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialog.open} onClose={handleCloseDeleteDialog}>
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete {deleteDialog.type === "title" ? "this project" : "this image"}?
            This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog} disabled={loading}>Cancel</Button>
          <Button
            onClick={handleDeleteItem}
            color="error"
            disabled={loading}
          >
            {loading ? "Deleting..." : "Delete"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default PortfolioTab
