'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'

import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'

import dynamic from 'next/dynamic'

import { useSession } from 'next-auth/react'

import {
  Card,
  CardHeader,
  CardContent,
  Typography,
  Button,
  Chip,
  IconButton,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  InputAdornment
} from '@mui/material'

import { Plus, Search, X, Eye, Edit, Trash2 } from 'lucide-react'

import CustomAvatar from '@core/components/mui/Avatar'
import CustomTextField from '@core/components/mui/TextField'
import TableFilters from './TableFilters'
import apiClient from '@/libs/api'
import { getLocalizedUrl } from '@/utils/i18n'

// Lazy loaded drawers
const AddStudioDrawer = dynamic(() => import('./AddStudioDrawer'), { ssr: false })
const AddCoworkingDrawer = dynamic(() => import('./AddCoworkingDrawer'), { ssr: false })

const spaceStatusObj = { active: 'success', inactive: 'secondary' }
const STORAGE_BASE_URL = (process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000').replace(/\/+$/, '')

const DebouncedInput = ({ value: initialValue, onChange, debounce = 500, ...props }) => {
  const [value, setValue] = useState(initialValue)

  useEffect(() => setValue(initialValue), [initialValue])

  useEffect(() => {
    const timeout = setTimeout(() => onChange(value), debounce)

    return () => clearTimeout(timeout)
  }, [value, debounce, onChange])

  return <CustomTextField {...props} value={value} onChange={e => setValue(e.target.value)} />
}

const MyServices = () => {
  const [addStudioDrawerOpen, setAddStudioDrawerOpen] = useState(false)
  const [addCoworkingDrawerOpen, setAddCoworkingDrawerOpen] = useState(false)
  const [selectedSpace, setSelectedSpace] = useState(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [spaceToDelete, setSpaceToDelete] = useState(null)
  const [spaces, setSpaces] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [searchTerm, setSearchTerm] = useState('')
  const [filteredSpaces, setFilteredSpaces] = useState([])

  const { lang: locale } = useParams()
  const router = useRouter()
  const { data: session } = useSession()

  const constructWorkspaceImageUrl = useCallback(path => {
    if (!path) return '/images/spaces/default.png'
    if (path.startsWith('http')) return path

    return `${STORAGE_BASE_URL}/storage/${path.replace(/^\/+/, '')}`
  }, [])

  const processWorkspace = useCallback(
    workspace => {
      console.log('MyServices: Processing workspace ID:', workspace.id, 'Images:', workspace.images)

      const processedImages = (workspace.images || [])
        .filter(img => img && (img.image_url || typeof img === 'string'))
        .map(img => {
          if (typeof img === 'string') {
            console.warn(`MyServices: Image is string for workspace ${workspace.id}, no ID available:`, img)

            return {
              id: null,
              image_url: constructWorkspaceImageUrl(img)
            }
          }

          if (!img.id || isNaN(img.id)) {
            console.warn(`MyServices: Invalid or missing image ID for workspace ${workspace.id}:`, img)

            return {
              id: null,
              image_url: constructWorkspaceImageUrl(img.image_url)
            }
          }

          return {
            id: img.id, // Preserve numeric ID
            image_url: constructWorkspaceImageUrl(img.image_url)
          }
        })
        .filter(img => img.image_url)

      return {
        ...workspace,
        picture: constructWorkspaceImageUrl(workspace.picture),
        images: processedImages
      }
    },
    [constructWorkspaceImageUrl]
  )

  useEffect(() => {
    const fetchWorkspaces = async () => {
      if (!session?.user?.id) {
        setLoading(false)

        return
      }

      try {
        const { data } = await apiClient.get('/workspaces/user')

        console.log('MyServices: Fetched workspaces:', data.data)
        const mapped = data.data.map(processWorkspace)

        setSpaces(mapped)
      } catch (err) {
        console.error('MyServices: Fetch error:', err)
        setError('Failed to load your workspaces. Please try again.')
      } finally {
        setLoading(false)
      }
    }

    fetchWorkspaces()
  }, [session, processWorkspace])

  const searchFilteredSpaces = useMemo(() => {
    if (!searchTerm || typeof searchTerm !== 'string') return filteredSpaces
    const query = searchTerm.toLowerCase()

    return filteredSpaces.filter(
      space =>
        space.business_name?.toLowerCase().includes(query) ||
        space.location?.toLowerCase().includes(query) ||
        space.phone_number?.toLowerCase().includes(query)
    )
  }, [searchTerm, filteredSpaces])

  // Initialize filtered spaces when spaces data changes
  useEffect(() => {
    setFilteredSpaces(spaces)
  }, [spaces])

  const handleSearchChange = useCallback(value => {
    if (typeof value === 'string') {
      setSearchTerm(value)
    }
  }, [])

  const handleSpaceCreated = useCallback(
    newSpace => {
      setSpaces(prev => [...prev, processWorkspace(newSpace)])
      setSuccess(`${newSpace.business_name} has been created.`)
      setTimeout(() => setSuccess(null), 3000)
    },
    [processWorkspace]
  )

  const handleSpaceUpdated = useCallback(
    updatedSpace => {
      setSpaces(prev => prev.map(space => (space.id === updatedSpace.id ? processWorkspace(updatedSpace) : space)))
      setSuccess(`${updatedSpace.business_name} has been updated.`)
      setTimeout(() => setSuccess(null), 3000)
    },
    [processWorkspace]
  )

  const paginatedSpaces = searchFilteredSpaces.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
  const emptyRows = page > 0 ? Math.max(0, (1 + page) * rowsPerPage - searchFilteredSpaces.length) : 0

  const handleDeleteSpace = async () => {
    if (!spaceToDelete) return

    try {
      const endpoint = `/workspaces/${spaceToDelete.type}/${spaceToDelete.id}`

      await apiClient.delete(endpoint)
      setSpaces(prev => prev.filter(space => space.id !== spaceToDelete.id))
      setSuccess(`${spaceToDelete.business_name} has been deleted.`)
      setTimeout(() => setSuccess(null), 3000)
    } catch {
      setError('Failed to delete workspace.')
    } finally {
      setDeleteDialogOpen(false)
      setSpaceToDelete(null)
    }
  }

  if (loading)
    return (
      <Card>
        <CardContent className='flex justify-center items-center p-6'>
          <CircularProgress />
          <Typography ml={2}>Loading...</Typography>
        </CardContent>
      </Card>
    )

  if (error)
    return (
      <Card>
        <CardContent>
          <Alert severity='error'>{error}</Alert>
        </CardContent>
      </Card>
    )

  return (
    <Card>
      {success && (
        <Alert severity='success' className='m-4'>
          {success}
        </Alert>
      )}
      <CardHeader title='My Workspaces' className='pb-4' />
      <TableFilters setFilteredSpaces={setFilteredSpaces} spaces={spaces} />
      <div className='flex justify-between flex-col md:flex-row p-6 border-b gap-4'>
        <CustomTextField
          select
          value={rowsPerPage}
          onChange={e => setRowsPerPage(+e.target.value)}
          className='w-[70px]'
        >
          {[5, 10, 25].map(n => (
            <MenuItem key={n} value={n}>
              {n}
            </MenuItem>
          ))}
        </CustomTextField>
        <div className='flex flex-col sm:flex-row items-center gap-4'>
          <DebouncedInput
            value={searchTerm}
            onChange={handleSearchChange}
            placeholder='Search Workspace'
            InputProps={{
              startAdornment: (
                <InputAdornment position='start'>
                  <Search size={20} />
                </InputAdornment>
              ),
              endAdornment: searchTerm && (
                <InputAdornment position='end'>
                  <IconButton onClick={() => setSearchTerm('')}>
                    <X size={16} />
                  </IconButton>
                </InputAdornment>
              )
            }}
          />
          <Button variant='contained' startIcon={<Plus size={18} />} onClick={() => setAddStudioDrawerOpen(true)}>
            Add Studio
          </Button>
          <Button variant='outlined' startIcon={<Plus size={18} />} onClick={() => setAddCoworkingDrawerOpen(true)}>
            Add Coworking
          </Button>
        </div>
      </div>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Picture</TableCell>
              <TableCell>Business Name</TableCell>
              <TableCell>Phone</TableCell>
              <TableCell>Location</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align='right'>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedSpaces.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className='text-center'>
                  No matching workspaces.
                </TableCell>
              </TableRow>
            ) : (
              paginatedSpaces.map(space => (
                <TableRow
                  key={space.id}
                  hover
                  onClick={e => {
                    if (!['BUTTON', 'A', 'INPUT'].includes(e.target.tagName)) {
                      router.push(getLocalizedUrl(`/apps/mybuisnesses/spaces/${space.id}`, locale))
                    }
                  }}
                  sx={{ cursor: 'pointer' }}
                >
                  <TableCell>
                    <CustomAvatar src={space.picture} variant='rounded' size={34} alt={space.business_name} />
                  </TableCell>
                  <TableCell>
                    <Typography fontWeight='medium'>{space.business_name}</Typography>
                  </TableCell>
                  <TableCell>{space.phone_number}</TableCell>
                  <TableCell>{space.location}</TableCell>
                  <TableCell>
                    <Chip
                      variant='tonal'
                      label={space.is_active ? 'Active' : 'Inactive'}
                      size='small'
                      color={space.is_active ? 'success' : 'secondary'}
                    />
                  </TableCell>
                  <TableCell align='right'>
                    <IconButton
                      onClick={e => {
                        e.stopPropagation()
                        setSpaceToDelete(space)
                        setDeleteDialogOpen(true)
                      }}
                    >
                      <Trash2 size={18} />
                    </IconButton>
                    <Link href={getLocalizedUrl(`/apps/mybuisnesses/spaces/${space.id}`, locale)}>
                      <IconButton>
                        <Eye size={18} />
                      </IconButton>
                    </Link>
                    <IconButton
                      onClick={e => {
                        e.stopPropagation()
                        setSelectedSpace(space)
                        space.type === 'studio' ? setAddStudioDrawerOpen(true) : setAddCoworkingDrawerOpen(true)
                      }}
                    >
                      <Edit size={18} />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
            {emptyRows > 0 && (
              <TableRow style={{ height: 53 * emptyRows }}>
                <TableCell colSpan={6} />
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        component='div'
        count={searchFilteredSpaces.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={(e, p) => setPage(p)}
        onRowsPerPageChange={e => {
          setRowsPerPage(+e.target.value)
          setPage(0)
        }}
      />

      <AddStudioDrawer
        open={addStudioDrawerOpen}
        handleClose={() => {
          setAddStudioDrawerOpen(false)
          setSelectedSpace(null)
        }}
        onSpaceCreated={handleSpaceCreated}
        onSpaceUpdated={handleSpaceUpdated}
        initialData={selectedSpace?.type === 'studio' ? selectedSpace : null}
      />
      <AddCoworkingDrawer
        open={addCoworkingDrawerOpen}
        handleClose={() => {
          setAddCoworkingDrawerOpen(false)
          setSelectedSpace(null)
        }}
        onSpaceCreated={handleSpaceCreated}
        onSpaceUpdated={handleSpaceUpdated}
        initialData={selectedSpace?.type === 'coworking' ? selectedSpace : null}
      />

      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent>
          <Typography>Delete {spaceToDelete?.business_name}?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleDeleteSpace} variant='contained' color='error'>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Card>
  )
}

export default MyServices
