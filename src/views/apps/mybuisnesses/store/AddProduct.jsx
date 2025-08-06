'use client'

// React Imports
import { useState, useEffect, useCallback } from 'react'

// Next Imports
import { useRouter, useParams } from 'next/navigation'

import { useSession } from 'next-auth/react'

// MUI Imports
import Divider from '@mui/material/Divider'
import Grid from '@mui/material/Grid2'
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import MenuItem from '@mui/material/MenuItem'
import Button from '@mui/material/Button'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import IconButton from '@mui/material/IconButton'
import Alert from '@mui/material/Alert'
import CircularProgress from '@mui/material/CircularProgress'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import styled from '@mui/material/styles/styled'
import FormControlLabel from '@mui/material/FormControlLabel'
import Checkbox from '@mui/material/Checkbox'
import FormControl from '@mui/material/FormControl'

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
    padding: theme.spacing(12),
    [theme.breakpoints.down('sm')]: {
      paddingInline: theme.spacing(5)
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
    <div className='flex flex-wrap gap-x-3 gap-y-1 pbs-6 pbe-4 pli-6'>
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
const ProductMedia = ({ onFilesChange, selectedFiles }) => {
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

  return (
    <Dropzone>
      <Card>
        <CardHeader title='Product Media' />
        <CardContent>
          <div {...getRootProps({ className: 'dropzone' })}>
            <input {...getInputProps()} />
            <div className='flex items-center flex-col gap-2 text-center'>
              <CustomAvatar variant='rounded' skin='light' color='secondary'>
                <i className='tabler-upload' />
              </CustomAvatar>
              <Typography variant='h4'>Drag and Drop Images Here</Typography>
              <Typography color='text.disabled'>or</Typography>
              <Button variant='tonal' size='small'>
                Browse Images
              </Button>
            </div>
          </div>
          {files.length ? (
            <>
              <Typography variant='body2' className='mt-4'>
                Uploaded Files ({files.length})
              </Typography>
              <List>{fileList}</List>
            </>
          ) : null}
        </CardContent>
      </Card>
    </Dropzone>
  )
}

// Product Add Header Component
const ProductAddHeader = ({ onSubmit, onReset, loading, isFormValid }) => {
  return (
    <div className='flex flex-wrap sm:items-center justify-between max-sm:flex-col gap-6'>
      <div className='flex flex-wrap max-sm:flex-col gap-4'>
        <Button variant='tonal' color='secondary' onClick={onReset} disabled={loading}>
          Discard
        </Button>
        <Button variant='contained' onClick={onSubmit} disabled={loading || !isFormValid}>
          {loading ? 'Publishing...' : 'Publish Product'}
        </Button>
      </div>
    </div>
  )
}

// Main Component
const AddProduct = ({ storeId }) => {
  // States
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const [categories, setCategories] = useState([])
  const [categoriesLoading, setCategoriesLoading] = useState(true)
  const [categoriesError, setCategoriesError] = useState(null)
  const [selectedFiles, setSelectedFiles] = useState([])
  const [openConfirm, setOpenConfirm] = useState(false)

  // Hooks
  const { data: session, status } = useSession()
  const router = useRouter()
  const { lang: locale } = useParams()

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

  // Form hook
  const {
    control,
    handleSubmit,
    reset,
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
    content: ''
  })

  // Fetch categories
  useEffect(() => {
    let isMounted = true

    const fetchCategories = async () => {
      try {
        if (process.env.NODE_ENV !== 'production') {
          console.log('Fetching categories')
        }

        const response = await apiClient.get('/categories')

        if (isMounted) {
          setCategories(response.data.data || [])

          if (process.env.NODE_ENV !== 'production') {
            console.log('Categories fetched:', response.data.data)
          }
        }
      } catch (error) {
        if (isMounted) {
          setCategoriesError('Failed to load categories. Please try again.')

          if (process.env.NODE_ENV !== 'production') {
            console.error('Failed to fetch categories:', error.response?.data || error)
          }
        }
      } finally {
        if (isMounted) {
          setCategoriesLoading(false)
        }
      }
    }

    if (status === 'authenticated') {
      fetchCategories()
    }

    return () => {
      isMounted = false
    }
  }, [status])

  // Redirect to login if unauthenticated
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push(getLocalizedUrl('/login', locale))
    }
  }, [status, router, locale])

  // Validate storeId
  useEffect(() => {
    if (!storeId || isNaN(storeId)) {
      setError('Invalid store ID')
      setLoading(false)
    }
  }, [storeId])

  // Handle form submission
  const onSubmit = () => {
    setOpenConfirm(true)
  }

  // Confirm submission
  const confirmSubmit = async data => {
    setOpenConfirm(false)

    if (!session?.user?.accessToken || !storeId) {
      setError('You must be logged in and select a store to create a product')
      router.push(getLocalizedUrl('/login', locale))

      return
    }

    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      const formData = new FormData()

      // Log des données avant l'envoi
      console.log('Creating product with data:', {
        ...data,
        clearance: data.clearance,
        clearance_value: data.clearance ? '1' : '0'
      })

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

      if (process.env.NODE_ENV !== 'production') {
        console.log('Creating product with data:', {
          supplier_id: storeId,
          name: data.name,
          description: editor?.getText(),
          category_id: data.categoryId,
          price: data.price,
          quantity: data.quantity,
          minimum_quantity: data.minimumQuantity,
          clearance: data.clearance,
          pictures: selectedFiles.length ? `${selectedFiles.length} files` : 'No files'
        })
      }

      const response = await apiClient.post('/products', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${session.user.accessToken}`
        }
      })

      const newProduct = {
        ...response.data.data,
        price: parseFloat(response.data.data.price) || 0,
        quantity: parseInt(response.data.data.quantity) || 0,
        minimum_quantity: parseInt(response.data.data.minimum_quantity) || 0,
        pictures: response.data.data.pictures.map(pic => ({
          ...pic,
          picture: pic.picture ? `${process.env.NEXT_PUBLIC_BACKEND_URL}/storage/${pic.picture}` : null
        }))
      }

      setSuccess('Product created successfully')

      // Reset form
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
      setSelectedFiles([])
      setTimeout(() => setSuccess(null), 3000)

      if (process.env.NODE_ENV !== 'production') {
        console.log('Product created:', newProduct)
      }
    } catch (error) {
      if (process.env.NODE_ENV !== 'production') {
        console.error('Failed to create product:', error.response?.data || error)
      }

      const errorMessage =
        error.response?.status === 422
          ? error.response.data.errors
            ? Object.values(error.response.data.errors).flat().join(', ')
            : error.response.data.message || 'Validation failed'
          : error.response?.status === 401
            ? 'Unauthorized. Please log in again.'
            : error.response?.status === 404
              ? 'Store not found'
              : error.response?.data?.message || 'Failed to create product'

      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  // Handle form reset
  const handleReset = useCallback(() => {
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
    setSelectedFiles([])
    setError(null)
    setSuccess(null)
  }, [reset, editor])

  // Handle dialog key press
  const handleDialogKeyDown = e => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleSubmit(confirmSubmit)()
    }
  }

  // Loading state UI
  if (status === 'loading' || categoriesLoading) {
    return (
      <Card>
        <CardContent className='flex justify-center items-center p-6'>
          <CircularProgress />
          <Typography className='ml-2'>Loading...</Typography>
        </CardContent>
      </Card>
    )
  }

  // Error state UI
  if (error || categoriesError) {
    return (
      <Card>
        <CardContent>
          <Alert severity='error'>{error || categoriesError}</Alert>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader title='Add Product' />
      <CardContent>
        {error && (
          <Alert severity='error' className='mb-4'>
            {error}
          </Alert>
        )}
        {success && (
          <Alert severity='success' className='mb-4'>
            {success}
          </Alert>
        )}
        <form onSubmit={handleSubmit(onSubmit)}>
          <Grid container spacing={6} className='mbe-6'>
            <Grid size={{ xs: 12, sm: 6 }}>
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
            <Grid size={{ xs: 12, sm: 6 }}>
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
            <Grid size={{ xs: 12, sm: 6 }}>
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
            <Grid size={{ xs: 12, sm: 6 }}>
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
            <Grid size={{ xs: 12, sm: 6 }}>
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
                      <Checkbox {...field} checked={field.value} onChange={e => field.onChange(e.target.checked)} />
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
                  <Divider className='mli-6' />
                  <EditorContent editor={editor} className='bs-[150px] overflow-y-auto flex' />
                </CardContent>
              </Card>
            </Grid>
            <Grid size={{ xs: 12 }}>
              <ProductMedia onFilesChange={setSelectedFiles} selectedFiles={selectedFiles} />
            </Grid>
          </Grid>
          <ProductAddHeader onSubmit={onSubmit} onReset={handleReset} loading={loading} isFormValid={isValid} />
        </form>
        <Dialog open={openConfirm} onClose={() => setOpenConfirm(false)} onKeyDown={handleDialogKeyDown}>
          <DialogTitle>Confirm Product Creation</DialogTitle>
          <DialogContent>Are you sure you want to create this product?</DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenConfirm(false)}>Cancel</Button>
            <Button onClick={handleSubmit(confirmSubmit)} variant='contained' autoFocus>
              Confirm
            </Button>
          </DialogActions>
        </Dialog>
      </CardContent>
    </Card>
  )
}

export default AddProduct
