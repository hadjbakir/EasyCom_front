'use client'

// React Imports
import { useState, useEffect, useCallback } from 'react'

// Next Imports
import { useRouter, useParams } from 'next/navigation'

import { useSession } from 'next-auth/react'

// MUI Imports
import Drawer from '@mui/material/Drawer'
import Button from '@mui/material/Button'
import Grid from '@mui/material/Grid2'
import Typography from '@mui/material/Typography'
import Alert from '@mui/material/Alert'
import CircularProgress from '@mui/material/CircularProgress'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Divider from '@mui/material/Divider'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import IconButton from '@mui/material/IconButton'
import MenuItem from '@mui/material/MenuItem'
import styled from '@mui/material/styles/styled'
import FormControlLabel from '@mui/material/FormControlLabel'
import Checkbox from '@mui/material/Checkbox'

// Third-party Imports
import classnames from 'classnames'
import { useDropzone } from 'react-dropzone'
import { useForm, Controller } from 'react-hook-form'
import { useEditor, EditorContent } from '@tiptap/react'
import { StarterKit } from '@tiptap/starter-kit'
import { Underline } from '@tiptap/extension-underline'
import { Placeholder } from '@tiptap/extension-placeholder'
import { TextAlign } from '@tiptap/extension-text-align'

// Component Imports
import CustomIconButton from '@core/components/mui/IconButton'
import CustomTextField from '@core/components/mui/TextField'
import CustomAvatar from '@core/components/mui/Avatar'
import AppReactDropzone from '@/libs/styles/AppReactDropzone'

// API Imports
import apiClient from '@/libs/api'

// Util Imports
import { getLocalizedUrl } from '@/utils/i18n'

// Style Imports
import '@/libs/styles/tiptapEditor.css'

// Styled Dropzone
const Dropzone = styled(AppReactDropzone)(({ theme }) => ({
  '& .dropzone': {
    minHeight: 'unset',
    padding: theme.spacing(8),
    [theme.breakpoints.down('sm')]: {
      paddingInline: theme.spacing(4)
    },
    '&+.MuiList-root .MuiListItem-root .file-name': {
      fontWeight: theme.typography.body1.fontWeight
    }
  }
}))

// Editor Toolbar Component
const EditorToolbar = ({ editor }) => {
  if (!editor) {
    return null
  }

  return (
    <div className='flex flex-wrap gap-x-3 gap-y-1 pbs-4 pbe-2 pli-4'>
      <CustomIconButton
        {...(editor.isActive('bold') && { color: 'primary' })}
        variant='tonal'
        size='small'
        onClick={() => editor.chain().focus().toggleBold().run()}
      >
        <i className={classnames('tabler-bold', { 'text-textSecondary': !editor.isActive('bold') })} />
      </CustomIconButton>
      <CustomIconButton
        {...(editor.isActive('underline') && { color: 'primary' })}
        variant='tonal'
        size='small'
        onClick={() => editor.chain().focus().toggleUnderline().run()}
      >
        <i className={classnames('tabler-underline', { 'text-textSecondary': !editor.isActive('underline') })} />
      </CustomIconButton>
      <CustomIconButton
        {...(editor.isActive('italic') && { color: 'primary' })}
        variant='tonal'
        size='small'
        onClick={() => editor.chain().focus().toggleItalic().run()}
      >
        <i className={classnames('tabler-italic', { 'text-textSecondary': !editor.isActive('italic') })} />
      </CustomIconButton>
      <CustomIconButton
        {...(editor.isActive('strike') && { color: 'primary' })}
        variant='tonal'
        size='small'
        onClick={() => editor.chain().focus().toggleStrike().run()}
      >
        <i className={classnames('tabler-strikethrough', { 'text-textSecondary': !editor.isActive('strike') })} />
      </CustomIconButton>
      <CustomIconButton
        {...(editor.isActive({ textAlign: 'left' }) && { color: 'primary' })}
        variant='tonal'
        size='small'
        onClick={() => editor.chain().focus().setTextAlign('left').run()}
      >
        <i
          className={classnames('tabler-align-left', { 'text-textSecondary': !editor.isActive({ textAlign: 'left' }) })}
        />
      </CustomIconButton>
      <CustomIconButton
        {...(editor.isActive({ textAlign: 'center' }) && { color: 'primary' })}
        variant='tonal'
        size='small'
        onClick={() => editor.chain().focus().setTextAlign('center').run()}
      >
        <i
          className={classnames('tabler-align-center', {
            'text-textSecondary': !editor.isActive({ textAlign: 'center' })
          })}
        />
      </CustomIconButton>
      <CustomIconButton
        {...(editor.isActive({ textAlign: 'right' }) && { color: 'primary' })}
        variant='tonal'
        size='small'
        onClick={() => editor.chain().focus().setTextAlign('right').run()}
      >
        <i
          className={classnames('tabler-align-right', {
            'text-textSecondary': !editor.isActive({ textAlign: 'right' })
          })}
        />
      </CustomIconButton>
      <CustomIconButton
        {...(editor.isActive({ textAlign: 'justify' }) && { color: 'primary' })}
        variant='tonal'
        size='small'
        onClick={() => editor.chain().focus().setTextAlign('justify').run()}
      >
        <i
          className={classnames('tabler-align-justified', {
            'text-textSecondary': !editor.isActive({ textAlign: 'justify' })
          })}
        />
      </CustomIconButton>
    </div>
  )
}

// Product Media Component
const ProductMedia = ({ onFilesChange, selectedFiles, existingImages = [], onImageDelete }) => {
  useEffect(() => {
    setFiles(selectedFiles || [])
  }, [selectedFiles])

  const [files, setFiles] = useState(selectedFiles || [])

  const { getRootProps, getInputProps } = useDropzone({
    accept: { 'image/jpeg': [], 'image/png': [], 'image/jpg': [] },
    maxSize: 2 * 1024 * 1024, // 2MB
    multiple: true,
    onDrop: acceptedFiles => {
      const newFiles = [...files, ...acceptedFiles]

      setFiles(newFiles)
      onFilesChange(newFiles)
    },
    onDropRejected: () => {
      alert('Images must be JPEG, PNG, or JPG and less than 2MB')
    }
  })

  const renderFilePreview = file => {
    if (file.type?.startsWith('image') || file instanceof File) {
      return <img width={38} height={38} alt={file.name} src={URL.createObjectURL(file)} className='rounded' />
    }

    return <i className='tabler-file-description' />
  }

  const renderExistingImagePreview = image => (
    <img width={38} height={38} alt={`Existing image ${image.id}`} src={image.picture} className='rounded' />
  )

  const handleRemoveFile = fileToRemove => {
    const newFiles = files.filter(f => f !== fileToRemove)

    setFiles(newFiles)
    onFilesChange(newFiles)
  }

  const fileList = files.map(file => (
    <ListItem key={file.name} className='pis-4 plb-3'>
      <div className='file-details flex items-center gap-3'>
        <div className='file-preview'>{renderFilePreview(file)}</div>
        <div>
          <Typography className='file-name font-medium' color='text.primary'>
            {file.name}
          </Typography>
          <Typography className='file-size' variant='body2'>
            {Math.round(file.size / 100) / 10 > 1000
              ? `${(Math.round(file.size / 100) / 10000).toFixed(1)} MB`
              : `${(Math.round(file.size / 100) / 10).toFixed(1)} KB`}
          </Typography>
        </div>
      </div>
      <IconButton onClick={() => handleRemoveFile(file)}>
        <i className='tabler-x text-xl' />
      </IconButton>
    </ListItem>
  ))

  const existingImageList = existingImages.map(image => (
    <ListItem key={image.id} className='pis-4 plb-3'>
      <div className='file-details flex items-center gap-3'>
        <div className='file-preview'>{renderExistingImagePreview(image)}</div>
        <div>
          <Typography className='file-name font-medium' color='text.primary'>
            {image.picture.split('/').pop()}
          </Typography>
        </div>
      </div>
      <IconButton onClick={() => onImageDelete(image.id)}>
        <i className='tabler-x text-xl' />
      </IconButton>
    </ListItem>
  ))

  return (
    <Dropzone>
      <div {...getRootProps({ className: 'dropzone' })}>
        <input {...getInputProps()} />
        <div className='flex items-center flex-col gap-2 text-center'>
          <CustomAvatar variant='rounded' skin='light' color='secondary'>
            <i className='tabler-upload' />
          </CustomAvatar>
          <Typography variant='h6'>Drag and Drop Images Here</Typography>
          <Typography color='text.disabled'>or</Typography>
          <Button variant='tonal' size='small'>
            Browse Images
          </Button>
        </div>
      </div>
      {files.length || existingImages.length ? (
        <>
          <Typography variant='body2' className='mt-4'>
            Uploaded Files ({files.length})
          </Typography>
          <List>{fileList}</List>
          <Typography variant='body2' className='mt-4'>
            Existing Images ({existingImages.length})
          </Typography>
          <List>{existingImageList}</List>
        </>
      ) : null}
    </Dropzone>
  )
}

// Main Component
const EditProductDrawer = ({ open, handleClose, onProductUpdated, product, storeId, categories = [], onSuccess }) => {
  // States
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [selectedFiles, setSelectedFiles] = useState([])
  const [existingImages, setExistingImages] = useState([])
  const [imagesToDelete, setImagesToDelete] = useState([])
  const [openConfirm, setOpenConfirm] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)
  const [initialValues, setInitialValues] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Hooks
  const { data: session, status } = useSession()
  const router = useRouter()
  const { lang: locale } = useParams()

  // Form hook
  const {
    control,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isValid }
  } = useForm({
    defaultValues: {
      name: '',
      categoryId: '',
      price: '',
      quantity: '',
      minimumQuantity: '',
      description: '',
      clearance: false
    },
    mode: 'onChange'
  })

  // Watch form values for changes
  const formValues = watch()

  // Tiptap Editor
  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: 'Write product description here...'
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph']
      }),
      Underline
    ],
    immediatelyRender: false,
    content: '',
    onUpdate: () => {
      checkForChanges()
    }
  })

  // Prevent negative input for number fields
  const preventNegativeInput = e => {
    if (['-', 'e'].includes(e.key)) {
      e.preventDefault()
    }
  }

  // Ensure non-negative value
  const handleNumberChange = (field, value) => {
    if (value === '' || parseFloat(value) >= 0) {
      field.onChange(value)
    }
  }

  // Initialize form and editor when product changes
  useEffect(() => {
    if (product && open) {
      const initial = {
        name: product.name || '',
        categoryId: product.category_id ? product.category_id.toString() : '',
        price: product.price ? product.price.toString() : '',
        quantity: product.quantity ? product.quantity.toString() : '',
        minimumQuantity: product.minimum_quantity ? product.minimum_quantity.toString() : '',
        description: product.description || '',
        clearance: Boolean(product.clearance)
      }

      console.log('Setting initial values:', {
        ...initial,
        original_clearance: product.clearance
      })

      setInitialValues(initial)
      reset(initial)
      setValue('name', initial.name)
      setValue('categoryId', initial.categoryId)
      setValue('price', initial.price)
      setValue('quantity', initial.quantity)
      setValue('minimumQuantity', initial.minimumQuantity)
      setValue('clearance', initial.clearance)
      editor?.commands.setContent(initial.description)
      setExistingImages(product.pictures || [])
      setSelectedFiles([])
      setImagesToDelete([])
      setError(null)
      setHasChanges(false)
      setIsSubmitting(false)
    }
  }, [product, open, setValue, editor, reset])

  // Check for changes in form or images
  const checkForChanges = useCallback(() => {
    if (!initialValues) return

    const hasFormChanges =
      formValues.name.trim() !== initialValues.name ||
      formValues.categoryId !== initialValues.categoryId ||
      parseFloat(formValues.price || 0) !== parseFloat(initialValues.price || 0) ||
      parseInt(formValues.quantity || 0) !== parseInt(initialValues.quantity || 0) ||
      parseInt(formValues.minimumQuantity || 0) !== parseInt(initialValues.minimumQuantity || 0) ||
      formValues.clearance !== initialValues.clearance ||
      (editor?.getText() || '') !== initialValues.description

    const hasImageChanges = selectedFiles.length > 0 || imagesToDelete.length > 0

    setHasChanges(hasFormChanges || hasImageChanges)

    if (process.env.NODE_ENV !== 'production') {
      console.log('Checking for changes:', {
        hasFormChanges,
        hasImageChanges,
        formValues,
        initialValues,
        editorContent: editor?.getText(),
        selectedFiles: selectedFiles.map(f => f.name),
        imagesToDelete,
        clearance_changed: formValues.clearance !== initialValues.clearance
      })
    }
  }, [formValues, initialValues, editor, selectedFiles, imagesToDelete])

  // Watch for form and image changes
  useEffect(() => {
    if (open) {
      checkForChanges()
    }
  }, [formValues, selectedFiles, imagesToDelete, checkForChanges, open])

  // Redirect to login if unauthenticated
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push(getLocalizedUrl('/login', locale))
    }
  }, [status, router, locale])

  // Validate storeId and product only when drawer is open
  useEffect(() => {
    if (!open) {
      setError(null)

      return
    }

    if (storeId === undefined || product === undefined) {
      if (process.env.NODE_ENV !== 'production') {
        console.log('Props still loading:', { storeId, productId: product?.id })
      }

      return
    }

    if (process.env.NODE_ENV !== 'production') {
      console.log('Validating props:', { storeId, productId: product?.id })
    }

    if (!storeId || isNaN(storeId) || !product?.id) {
      setError('Invalid store or product ID')
      setLoading(false)
    } else {
      setError(null)
    }
  }, [storeId, product, open])

  // Handle form submission
  const onSubmit = () => {
    setOpenConfirm(true)
  }

  // Confirm submission
  const confirmSubmit = async data => {
    setOpenConfirm(false)
    setIsSubmitting(true)

    if (!session?.user?.accessToken || !storeId || !product?.id) {
      setError('You must be logged in and select a store/product to update')
      setIsSubmitting(false)
      router.push(getLocalizedUrl('/login', locale))
      return
    }

    setLoading(true)
    setError(null)

    try {
      const formData = new FormData()

      // Log des données avant l'envoi
      console.log('Submitting form data:', {
        ...data,
        clearance: data.clearance,
        clearance_value: data.clearance ? '1' : '0',
        productId: product.id
      })

      // Ajouter l'ID du produit dans le formData
      formData.append('id', product.id)
      formData.append('supplier_id', storeId)
      formData.append('name', data.name.trim())
      formData.append('description', editor?.getText() || '')
      if (data.categoryId) formData.append('category_id', data.categoryId)
      formData.append('price', parseFloat(data.price))
      formData.append('quantity', parseInt(data.quantity))
      formData.append('minimum_quantity', parseInt(data.minimumQuantity))
      formData.append('clearance', data.clearance ? '1' : '0')
      selectedFiles.forEach(file => {
        formData.append('pictures[]', file)
      })
      imagesToDelete.forEach(id => {
        formData.append('images_to_delete[]', id)
      })

      // Utiliser la méthode POST avec l'ID
      const response = await apiClient.post(`/products/${product.id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${session.user.accessToken}`,
          Accept: 'application/json'
        }
      })

      console.log('Update response:', response.data)

      const updatedProduct = {
        ...response.data.data,
        price: parseFloat(response.data.data.price) || 0,
        quantity: parseInt(response.data.data.quantity) || 0,
        minimum_quantity: parseInt(response.data.data.minimum_quantity) || 0,
        clearance: Boolean(response.data.data.clearance),
        pictures: response.data.data.pictures.map(pic => ({
          ...pic,
          picture: pic.picture ? `${process.env.NEXT_PUBLIC_BACKEND_URL}/storage/${pic.picture}` : null
        }))
      }

      // Pass success message to parent
      onSuccess('Product updated successfully')
      setError(null)

      // Reset form and initial values
      const newInitial = {
        name: updatedProduct.name || '',
        categoryId: updatedProduct.category_id ? updatedProduct.category_id.toString() : '',
        price: updatedProduct.price ? updatedProduct.price.toString() : '',
        quantity: updatedProduct.quantity ? updatedProduct.quantity.toString() : '',
        minimumQuantity: updatedProduct.minimum_quantity ? updatedProduct.minimum_quantity.toString() : '',
        description: updatedProduct.description || '',
        clearance: Boolean(updatedProduct.clearance)
      }

      setInitialValues(newInitial)
      reset(newInitial)
      editor?.commands.setContent(updatedProduct.description || '')
      setSelectedFiles([])
      setExistingImages(updatedProduct.pictures || [])
      setImagesToDelete([])
      setHasChanges(false)
      onProductUpdated(updatedProduct)
      setTimeout(() => {
        setError(null)
        setIsSubmitting(false)
        handleClose()
      }, 2000)
    } catch (error) {
        console.error('Failed to update product:', error.response?.data || error)

      const errorMessage =
        error.response?.status === 422
          ? error.response.data.errors
            ? Object.values(error.response.data.errors).flat().join(', ')
            : error.response.data.message || 'Validation failed'
          : error.response?.status === 401
            ? 'Unauthorized. Please log in again.'
            : error.response?.status === 404
              ? 'Product or store not found'
              : error.response?.data?.message || 'Failed to update product'

      setError(errorMessage)
      setIsSubmitting(false)
    } finally {
      setLoading(false)
    }
  }

  // Handle form reset
  const handleReset = useCallback(() => {
    if (product && initialValues) {
      reset(initialValues)
      editor?.commands.setContent(initialValues.description)
    } else {
      reset({
        name: '',
        categoryId: '',
        price: '',
        quantity: '',
        minimumQuantity: '',
        description: '',
        clearance: false
      })
      editor?.commands.setContent('')
    }

    setSelectedFiles([])
    setExistingImages(product?.pictures || [])
    setImagesToDelete([])
    setError(null)
    setHasChanges(false)
    setIsSubmitting(false)
  }, [reset, editor, product, initialValues])

  // Handle drawer close
  const handleDrawerClose = useCallback(() => {
    setError(null) // Clear error before closing
    handleReset()
    handleClose()
  }, [handleReset, handleClose])

  // Handle image deletion
  const handleImageDelete = useCallback(imageId => {
    setExistingImages(prev => prev.filter(img => img.id !== imageId))
    setImagesToDelete(prev => [...prev, parseInt(imageId)])
  }, [])

  // Handle dialog key press
  const handleDialogKeyDown = e => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleSubmit(confirmSubmit)()
    }
  }

  return (
    <Drawer
      open={open}
      anchor='right'
      variant='temporary'
      onClose={handleDrawerClose}
      sx={{ '& .MuiDrawer-paper': { width: { xs: 300, sm: 400 } } }}
    >
      <div className='p-6'>
        <Typography variant='h6' className='mb-4'>
          Edit Product
        </Typography>
        {error && (
          <Alert severity='error' className='mb-4'>
            {error}
          </Alert>
        )}
        <form onSubmit={handleSubmit(onSubmit)}>
          <Grid container spacing={4}>
            <Grid size={{ xs: 12 }}>
              <Controller
                name='name'
                control={control}
                rules={{ required: 'Product name is required' }}
                render={({ field }) => (
                  <CustomTextField
                    {...field}
                    fullWidth
                    label='Product Name'
                    placeholder='Smartphone X'
                    {...(errors.name && { error: true, helperText: errors.name.message })}
                  />
                )}
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <Controller
                name='categoryId'
                control={control}
                rules={{ required: 'Category is required' }}
                render={({ field }) => (
                  <CustomTextField
                    select
                    fullWidth
                    label='Category'
                    {...field}
                    {...(errors.categoryId && { error: true, helperText: errors.categoryId.message })}
                    disabled={categories.length === 0}
                  >
                    <MenuItem value='' disabled>
                      Select Category
                    </MenuItem>
                    {categories.map(category => (
                      <MenuItem key={category.id} value={category.id.toString()}>
                        {category.name}
                      </MenuItem>
                    ))}
                  </CustomTextField>
                )}
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <Controller
                name='price'
                control={control}
                rules={{
                  required: 'Price is required',
                  min: { value: 0, message: 'Price must be positive or zero' }
                }}
                render={({ field }) => (
                  <CustomTextField
                    {...field}
                    fullWidth
                    type='number'
                    label='Price'
                    placeholder='599.99'
                    step='0.01'
                    min='0'
                    onKeyDown={preventNegativeInput}
                    onChange={e => handleNumberChange(field, e.target.value)}
                    {...(errors.price && { error: true, helperText: errors.price.message })}
                  />
                )}
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <Controller
                name='quantity'
                control={control}
                rules={{
                  required: 'Quantity is required',
                  min: { value: 0, message: 'Quantity must be positive or zero' }
                }}
                render={({ field }) => (
                  <CustomTextField
                    {...field}
                    fullWidth
                    type='number'
                    label='Quantity'
                    placeholder='100'
                    min='0'
                    onKeyDown={preventNegativeInput}
                    onChange={e => handleNumberChange(field, e.target.value)}
                    {...(errors.quantity && { error: true, helperText: errors.quantity.message })}
                  />
                )}
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <Controller
                name='minimumQuantity'
                control={control}
                rules={{
                  required: 'Minimum quantity is required',
                  min: { value: 0, message: 'Minimum quantity must be positive or zero' }
                }}
                render={({ field }) => (
                  <CustomTextField
                    {...field}
                    fullWidth
                    type='number'
                    label='Minimum Quantity'
                    placeholder='10'
                    min='0'
                    onKeyDown={preventNegativeInput}
                    onChange={e => handleNumberChange(field, e.target.value)}
                    {...(errors.minimumQuantity && {
                      error: true,
                      helperText: errors.minimumQuantity.message
                    })}
                  />
                )}
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <Controller
                name='clearance'
                control={control}
                render={({ field }) => (
                  <FormControlLabel
                    control={
                      <Checkbox
                        {...field}
                        checked={field.value}
                        onChange={e => field.onChange(e.target.checked)}
                      />
                    }
                    label='Add to Clearance'
                  />
                )}
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <Typography className='mbe-1'>Description (Optional)</Typography>
              <Card className='p-0 border shadow-none'>
                <CardContent className='p-0'>
                  <EditorToolbar editor={editor} />
                  <Divider className='mli-4' />
                  <EditorContent editor={editor} className='bs-[100px] overflow-y-auto flex' />
                </CardContent>
              </Card>
            </Grid>
            <Grid size={{ xs: 12 }}>
              <ProductMedia
                onFilesChange={setSelectedFiles}
                selectedFiles={selectedFiles}
                existingImages={existingImages}
                onImageDelete={handleImageDelete}
              />
            </Grid>
            <Grid size={{ xs: 12 }} className='flex gap-4'>
              <Button
                variant='contained'
                type='submit'
                disabled={loading || !isValid || !hasChanges}
                startIcon={loading ? <CircularProgress size={20} /> : <i className='tabler-check' />}
              >
                {loading ? 'Updating...' : 'Update Product'}
              </Button>
              <Button variant='outlined' color='secondary' onClick={handleDrawerClose} disabled={loading}>
                Cancel
              </Button>
            </Grid>
          </Grid>
        </form>
        <Dialog open={openConfirm} onClose={() => setOpenConfirm(false)} onKeyDown={handleDialogKeyDown}>
          <DialogTitle>Confirm Product Update</DialogTitle>
          <DialogContent>Are you sure you want to update this product?</DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenConfirm(false)}>Cancel</Button>
            <Button onClick={handleSubmit(confirmSubmit)} variant='contained' autoFocus>
              Confirm
            </Button>
          </DialogActions>
        </Dialog>
      </div>
    </Drawer>
  )
}

export default EditProductDrawer
