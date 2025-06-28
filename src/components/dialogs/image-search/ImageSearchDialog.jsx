"use client"

import { useState, useCallback, useEffect } from "react"
import Dialog from "@mui/material/Dialog"
import DialogTitle from "@mui/material/DialogTitle"
import DialogContent from "@mui/material/DialogContent"
import DialogActions from "@mui/material/DialogActions"
import Button from "@mui/material/Button"
import Box from "@mui/material/Box"
import Typography from "@mui/material/Typography"
import IconButton from "@mui/material/IconButton"
import CloseIcon from "@mui/icons-material/Close"
import List from "@mui/material/List"
import ListItem from "@mui/material/ListItem"
import CircularProgress from "@mui/material/CircularProgress"
import CustomAvatar from "@mui/material/Avatar"
import { useDropzone } from "react-dropzone"
import AppReactDropzone from "@/libs/styles/AppReactDropzone"
import styled from "@mui/material/styles/styled"
import { useRouter } from 'next/navigation'
import { useImageSearchResults } from '@/components/contexts/ImageSearchResultsContext'
import { searchProductsByImage, getSupplierById } from '@/libs/api/productOrders'
import { useParams } from 'next/navigation'
import { getLocalizedUrl } from '@/utils/i18n'

// Styled Dropzone component similar to EditProductDrawer
const Dropzone = styled(AppReactDropzone)(({ theme }) => ({
  "& .dropzone": {
    minHeight: "unset",
    padding: theme.spacing(6),
    [theme.breakpoints.down("sm")]: {
      paddingInline: theme.spacing(3),
    },
    "&+.MuiList-root .MuiListItem-root .file-name": {
      fontWeight: theme.typography.body1.fontWeight,
    },
  },
}))

const ImageSearchDialog = ({ open, setOpen, onImageSubmit }) => {
  const [selectedFile, setSelectedFile] = useState(null)
  const [preview, setPreview] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState(null)
  const router = useRouter()
  const { setResults } = useImageSearchResults()
  const [fetchingSuppliers, setFetchingSuppliers] = useState(false)
  const { lang: locale } = useParams()

  // Reset state when dialog opens/closes
  useEffect(() => {
    if (!open) {
      setSelectedFile(null)
      setPreview(null)
      setError(null)
    }
  }, [open])

  // Handle file drop
  const onDrop = useCallback((acceptedFiles) => {
    setError(null)
    const file = acceptedFiles[0]

    if (file) {
      setSelectedFile(file)
      const reader = new FileReader()
      reader.onloadend = () => setPreview(reader.result)
      reader.readAsDataURL(file)
    }
  }, [])

  // Handle drop rejection
  const onDropRejected = useCallback((rejectedFiles) => {
    const rejection = rejectedFiles[0]
    if (rejection.errors[0].code === "file-too-large") {
      setError("L'image doit faire moins de 2 Mo.")
    } else if (rejection.errors[0].code === "file-invalid-type") {
      setError("L'image doit être au format JPEG, PNG ou JPG.")
    } else {
      setError("Une erreur s'est produite lors du téléchargement de l'image.")
    }
  }, [])

  // Configure dropzone
  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    accept: { "image/jpeg": [], "image/png": [], "image/jpg": [] },
    maxSize: 2 * 1024 * 1024, // 2MB
    multiple: false,
    onDrop,
    onDropRejected,
  })

  // Render file preview
  const renderFilePreview = (file) => {
    if (file && preview) {
      return (
        <img
          width={180}
          height={180}
          alt={file.name}
          src={preview || "/placeholder.svg"}
          className="rounded object-cover"
        />
      )
    }
    return null
  }

  // Handle file removal
  const handleRemoveFile = () => {
    setSelectedFile(null)
    setPreview(null)
  }

  // Handle dialog close
  const handleClose = () => {
    setOpen(false)
    setSelectedFile(null)
    setPreview(null)
    setError(null)
  }

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!selectedFile) return
    setIsSubmitting(true)
    setError(null)
    setFetchingSuppliers(false)
    try {
      // Appel API backend
      const data = await searchProductsByImage(selectedFile)
      console.log('ImageSearchDialog - API response:', data)
      if (data && data.data && Array.isArray(data.data) && data.data.length > 0) {
        // Regrouper par produit
        const productMap = {}
        data.data.forEach(item => {
          const prodId = item.product.id
          if (!productMap[prodId]) {
            productMap[prodId] = {
              ...item.product,
              price: item.product.price ? parseFloat(item.product.price) : 0,
              originalPrice: item.product.originalPrice ? parseFloat(item.product.originalPrice) : (item.product.price ? parseFloat(item.product.price) : 0),
              pictures: [],
              supplier_id: item.product.supplier_id
            }
          }
          // Ajoute chaque image au tableau pictures (en respectant la logique explore)
          const picPath = item.picture
          let url = picPath.startsWith('http')
            ? picPath
            : `${process.env.NEXT_PUBLIC_BACKEND_URL}/storage/${picPath.startsWith('/') ? picPath.slice(1) : picPath}`
          url = url.replace('/api/storage/', '/storage/')
          productMap[prodId].pictures.push({ id: item.id, picture: url })
        })
        // Pour chaque produit, définit 'image' comme la première image du tableau pictures
        const products = Object.values(productMap).map(prod => ({
          ...prod,
          image: prod.pictures.length > 0 ? prod.pictures[0].picture : '/images/placeholder.jpg',
        }))
        // Récupérer les infos de chaque store en parallèle
        setFetchingSuppliers(true)
        const productsWithStore = await Promise.all(products.map(async prod => {
          let storeName = ''
          let storeLogo = ''
          let storeId = prod.supplier_id ? prod.supplier_id.toString() : null
          let storeType = 'unknown'
          try {
            const supplier = await getSupplierById(prod.supplier_id)
            storeName = supplier.business_name || ''
            if (supplier.picture) {
              storeLogo = supplier.picture.startsWith('http')
                ? supplier.picture
                : `${process.env.NEXT_PUBLIC_BACKEND_URL}/storage/${supplier.picture.startsWith('/') ? supplier.picture.slice(1) : supplier.picture}`
              storeLogo = storeLogo.replace('/api/storage/', '/storage/')
            } else {
              storeLogo = '/images/avatars/1.png'
            }
            storeType = supplier.type === 'merchant'
              ? 'normal'
              : supplier.type === 'workshop'
                ? 'raw_material'
                : supplier.type === 'importer'
                  ? 'import'
                  : 'unknown'
          } catch (err) {
            storeName = `Store #${prod.supplier_id}`
            storeLogo = '/images/avatars/1.png'
            storeType = 'unknown'
          }
          return {
            ...prod,
            storeName,
            storeLogo,
            storeId,
            storeType,
            inStock: (prod.quantity || 0) > 0,
            reviewCount: 12,
            rating: 4.5,
            minimumQuantity: prod.minimum_quantity || 1,
            featured: prod.featured || false,
            category: prod.category || 'Unknown',
            description: prod.description || '',
          }
        }))
        setResults(productsWithStore)
        setFetchingSuppliers(false)
        handleClose()
        router.push(getLocalizedUrl(`/apps/explore/products-and-stores/image-search-results`, locale))
      } else {
        setError("Aucun produit similaire trouvé.")
      }
    } catch (err) {
      setError(
        err?.response?.data?.message ||
        "Une erreur s'est produite lors de la recherche. Veuillez réessayer."
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        Recherche par image
        <IconButton aria-label="close" onClick={handleClose} sx={{ position: "absolute", right: 8, top: 8 }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent>
          {(isSubmitting || fetchingSuppliers) && (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 120 }}>
              <CircularProgress />
            </Box>
          )}
          <Dropzone>
            <div {...getRootProps({ className: "dropzone" })}>
              <input {...getInputProps()} />
              <div className="flex items-center flex-col gap-2 text-center">
                <CustomAvatar variant="rounded" skin="light" color="secondary">
                  <i className="tabler-upload" />
                </CustomAvatar>
                <Typography variant="h6">
                  {isDragActive
                    ? isDragReject
                      ? "Type de fichier non accepté"
                      : "Déposez l'image ici..."
                    : "Glissez-déposez une image"}
                </Typography>
                <Typography color="text.disabled">ou</Typography>
                <Button variant="tonal" size="small">
                  Parcourir
                </Button>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  Formats acceptés : JPG, PNG, max 2 Mo
                </Typography>
              </div>
            </div>
            {selectedFile && (
              <>
                <Typography variant="body2" className="mt-4">
                  Image sélectionnée
                </Typography>
                <List>
                  <ListItem className="pis-4 plb-3">
                    <div className="file-details flex items-center gap-3">
                      <div className="file-preview">{renderFilePreview(selectedFile)}</div>
                      <div>
                        <Typography className="file-name font-medium" color="text.primary">
                          {selectedFile.name}
                        </Typography>
                        <Typography className="file-size" variant="body2">
                          {Math.round(selectedFile.size / 100) / 10 > 1000
                            ? `${(Math.round(selectedFile.size / 100) / 10000).toFixed(1)} MB`
                            : `${(Math.round(selectedFile.size / 100) / 10).toFixed(1)} KB`}
                        </Typography>
                      </div>
                    </div>
                    <IconButton onClick={handleRemoveFile}>
                      <i className="tabler-x text-xl" />
                    </IconButton>
                  </ListItem>
                </List>
              </>
            )}
          </Dropzone>

          {error && (
            <Box sx={{ mt: 2, p: 1, bgcolor: "error.lighter", borderRadius: 1, color: "error.main" }}>
              <Typography variant="body2">{error}</Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="secondary">
            Annuler
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={!selectedFile || isSubmitting}
            startIcon={isSubmitting ? <CircularProgress size={20} /> : null}
          >
            {isSubmitting ? "Recherche en cours..." : "Rechercher"}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  )
}

export default ImageSearchDialog
