'use client'

// React Imports
import { useState, useEffect, useCallback, useMemo } from 'react'

// Next Imports
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'

import { useSession } from 'next-auth/react'

// MUI Imports
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import IconButton from '@mui/material/IconButton'
import MenuItem from '@mui/material/MenuItem'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import TablePagination from '@mui/material/TablePagination'
import CircularProgress from '@mui/material/CircularProgress'
import Alert from '@mui/material/Alert'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import Switch from '@mui/material/Switch'
import FormControlLabel from '@mui/material/FormControlLabel'

// Third-party Imports
import classnames from 'classnames'
import { rankItem } from '@tanstack/match-sorter-utils'
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getFilteredRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFacetedMinMaxValues,
  getPaginationRowModel,
  getSortedRowModel
} from '@tanstack/react-table'

// Component Imports
import CustomTextField from '@core/components/mui/TextField'
import CustomAvatar from '@core/components/mui/Avatar'
import TablePaginationComponent from '@components/TablePaginationComponent'
import TableFilters from './TableFilters'
import AddStoreDrawer from './AddStoreDrawer'
import EditStoreDrawer from './EditStoreDrawer'

// Util Imports
import { getLocalizedUrl } from '@/utils/i18n'

// API Imports
import apiClient from '@/libs/api'

// Style Imports
import tableStyles from '@core/styles/table.module.css'

// Base URL for static files
const STORAGE_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000'

/**
 * Fuzzy filter function for table search
 */
const fuzzyFilter = (row, columnId, value, addMeta) => {
  const itemRank = rankItem(row.getValue(columnId), value)

  addMeta({ itemRank })

  return itemRank.passed
}

/**
 * Debounced input component for search field
 */
const DebouncedInput = ({ value: initialValue, onChange, debounce = 500, ...props }) => {
  const [value, setValue] = useState(initialValue)

  useEffect(() => {
    setValue(initialValue)
  }, [initialValue])

  useEffect(() => {
    const timeout = setTimeout(() => {
      onChange(value)
    }, debounce)

    return () => clearTimeout(timeout)
  }, [value, debounce, onChange])

  return <CustomTextField {...props} value={value} onChange={e => setValue(e.target.value)} />
}

// Store type object for styling and icons
const storeTypeObj = {
  workshop: { icon: 'tabler-tool', color: 'info' },
  importer: { icon: 'tabler-truck-loading', color: 'warning' },
  merchant: { icon: 'tabler-shopping-cart', color: 'success' }
}

// Store status object for styling
const storeStatusObj = {
  active: 'success',
  pending: 'warning',
  inactive: 'secondary'
}

// Column Definitions
const columnHelper = createColumnHelper()

/**
 * StoreListTable component - Displays a table of user's stores with hover effect
 */
const StoreListTable = () => {
  // States
  const [addStoreOpen, setAddStoreOpen] = useState(false)
  const [editStoreOpen, setEditStoreOpen] = useState(false)
  const [selectedStoreId, setSelectedStoreId] = useState(null)
  const [rowSelection, setRowSelection] = useState({})
  const [storesData, setStoresData] = useState([])
  const [filteredData, setFilteredData] = useState([])
  const [domains, setDomains] = useState({})
  const [globalFilter, setGlobalFilter] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [storeToDelete, setStoreToDelete] = useState(null)

  // Hooks
  const { lang: locale } = useParams()
  const { data: session, status } = useSession()
  const router = useRouter()

  // Memoize onChange for DebouncedInput
  const handleSearchChange = useCallback(value => setGlobalFilter(String(value)), [])

  // Handle row click to navigate to store detail
  const handleRowClick = useCallback(
    (e, storeId) => {
      if (
        e.target.type === 'checkbox' ||
        e.target.closest('button') ||
        e.target.closest('a') ||
        e.target.tagName === 'INPUT'
      ) {
        return
      }

      router.push(getLocalizedUrl(`/apps/mybuisnesses/store/detaille/${storeId}`, locale))
    },
    [router, locale]
  )

  // Log session for debugging
  useEffect(() => {
    if (process.env.NODE_ENV !== 'production') {
      console.log('Session:', { status, userId: session?.user?.id })
    }
  }, [status, session])

  // Redirect to login if unauthenticated
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push(getLocalizedUrl('/login', locale))
    }
  }, [status, router, locale])

  // Fetch domains and stores data
  useEffect(() => {
    const fetchData = async () => {
      if (status !== 'authenticated' || !session?.user?.id) {
        return
      }

      setError(null)
      const startTime = performance.now()

      try {
        // Fetch domains
        const domainsResponse = await apiClient.get('/domains')
        const domainsData = domainsResponse.data?.data || domainsResponse.data || []

        const domainsMap = domainsData.reduce((acc, domain) => {
          acc[domain.id] = domain.name

          return acc
        }, {})

        setDomains(domainsMap)

        if (process.env.NODE_ENV !== 'production') {
          console.log('Domains fetched:', domainsMap)
        }

        // Fetch stores list
        const response = await apiClient.get(`/suppliers/by-user/${session.user.id}`)

        console.log('Response:', response)

        const initialStores = response.data?.data || response.data || []

        if (!Array.isArray(initialStores)) {
          throw new Error('Unexpected API response format: Data is not an array')
        }

        // Initialize stores with default types and statuses
        const initialData = initialStores.map(store => ({
          ...store,
          type: store.type || 'merchant',
          status: store.status || 'active'
        }))

        setStoresData(initialData)
        setFilteredData(initialData)

        if (process.env.NODE_ENV !== 'production') {
          console.log('Initial stores fetched:', initialData)
        }

        // Fetch types for each store
        const storePromises = initialStores.map(async store => {
          try {
            const storeResponse = await apiClient.get(`/suppliers/${store.id}`)

            return {
              id: store.id,
              type: storeResponse.data.data.type || store.type || 'merchant'
            }
          } catch (err) {
            if (process.env.NODE_ENV !== 'production') {
              console.error(`Failed to fetch type for store ${store.id}:`, err)
            }

            return { id: store.id, type: store.type || 'merchant' }
          }
        })

        const typesData = await Promise.all(storePromises)

        // Update types in existing data
        const updatedData = initialData.map(store => {
          const typeData = typesData.find(t => t.id === store.id)

          return { ...store, type: typeData?.type || store.type }
        })

        setStoresData(updatedData)
        setFilteredData(updatedData)

        if (process.env.NODE_ENV !== 'production') {
          console.log('Stores updated with types:', updatedData)
          console.log('Fetch time:', (performance.now() - startTime) / 1000, 'seconds')
        }
      } catch (err) {
        if (process.env.NODE_ENV !== 'production') {
          console.error('Failed to fetch data:', err.message, err.response?.data)
        }

        setError(
          err.response?.status === 401
            ? 'Unauthorized. Please log in again.'
            : err.response?.status === 404
              ? 'No stores found for this user.'
              : `Failed to load data: ${err.message}`
        )
      } finally {
        setLoading(false)
      }
    }

    if (status !== 'loading') {
      fetchData()
    }
  }, [session?.user?.id, status])

  // Helper to fetch a store by ID and update state after add/edit
  const fetchAndUpdateStore = async (storeId, updateMode = 'add') => {
    try {
      const response = await apiClient.get(`/suppliers/${storeId}`)
      const store = response.data.data

      if (updateMode === 'add') {
        setStoresData(prev => [...prev, store])
        setFilteredData(prev => [...prev, store])
      } else if (updateMode === 'edit') {
        setStoresData(prev => prev.map(s => (s.id === store.id ? store : s)))
        setFilteredData(prev => prev.map(s => (s.id === store.id ? store : s)))
      }
    } catch (err) {
      console.error('Failed to fetch store after add/edit:', err)
    }
  }

  // Define table columns
  const columns = useMemo(
    () => [
      {
        id: 'select',
        header: ({ table }) => (
          <div className='px-1'>
            <input
              type='checkbox'
              checked={table.getIsAllRowsSelected()}
              ref={input => {
                if (input) {
                  input.indeterminate = table.getIsSomeRowsSelected() && !table.getIsAllRowsSelected()
                }
              }}
              onChange={table.getToggleAllRowsSelectedHandler()}
            />
          </div>
        ),
        cell: ({ row }) => (
          <div className='px-1'>
            <input
              type='checkbox'
              checked={row.getIsSelected()}
              disabled={!row.getCanSelect()}
              ref={input => {
                if (input) {
                  input.indeterminate = row.getIsSomeSelected() && !row.getIsSelected()
                }
              }}
              onChange={row.getToggleSelectedHandler()}
            />
          </div>
        )
      },
      columnHelper.accessor('business_name', {
        header: 'Store',
        cell: ({ row }) => {
          const imageUrl = row.original.picture
            ? `${STORAGE_BASE_URL}/storage/${row.original.picture}`
            : '/images/avatars/Tannemirt.png'

          return (
            <div className='flex items-center gap-4'>
              <CustomAvatar
                src={imageUrl}
                variant='rounded'
                size={34}
                alt={row.original.business_name}
                imgProps={{
                  onError: e => {
                    e.target.src = '/images/avatars/Tannemirt.png'

                    if (process.env.NODE_ENV !== 'production') {
                      console.log('Image failed to load, using fallback')
                    }
                  }
                }}
              />
              <div className='flex flex-col'>
                <Typography className='font-medium' color='text.primary'>
                  {row.original.business_name}
                </Typography>
                <Typography variant='body2'>{row.original.type || 'N/A'}</Typography>
              </div>
            </div>
          )
        }
      }),
      columnHelper.accessor('type', {
        header: 'Type',
        cell: ({ row }) => {
          const type = row.original.type?.toLowerCase() || 'merchant'

          return (
            <div className='flex items-center gap-2'>
              <i
                className={storeTypeObj[type]?.icon || 'tabler-store'}
                style={{ color: `var(--mui-palette-${storeTypeObj[type]?.color || 'primary'}-main)` }}
              />
              <Typography className='capitalize' color='text.primary'>
                {row.original.type || 'N/A'}
              </Typography>
            </div>
          )
        }
      }),
      columnHelper.accessor('domain_id', {
        header: 'Domain',
        cell: ({ row }) => (
          <Typography className='capitalize' color='text.primary'>
            {domains[row.original.domain_id] || 'N/A'}
          </Typography>
        )
      }),
      columnHelper.accessor('address', {
        header: 'Address',
        cell: ({ row }) => <Typography>{row.original.address || 'N/A'}</Typography>
      }),
      columnHelper.accessor('status', {
        header: 'Activation',
        cell: ({ row }) => {
          const status = row.original.status?.toLowerCase() || 'active'
          const isActive = status === 'active'

          return (
            <FormControlLabel
              control={
                <Switch
                  checked={isActive}
                  color={isActive ? 'success' : 'error'}
                  onClick={e => e.stopPropagation()}
                  onChange={e => {
                    // Toggle status localement
                    const newStatus = isActive ? 'inactive' : 'active'

                    setStoresData(prev =>
                      prev.map(store => (store.id === row.original.id ? { ...store, status: newStatus } : store))
                    )
                    setFilteredData(prev =>
                      prev.map(store => (store.id === row.original.id ? { ...store, status: newStatus } : store))
                    )
                    setSuccess(`Store ${isActive ? 'deactivated' : 'activated'} (local only)`)
                    setTimeout(() => setSuccess(null), 2000)
                  }}
                />
              }
              label={
                <Typography color={isActive ? 'success.main' : 'text.secondary'} fontWeight={500}>
                  {isActive ? 'Active' : 'Inactive'}
                </Typography>
              }
              labelPlacement='end'
              sx={{ m: 0 }}
            />
          )
        }
      }),
      columnHelper.accessor('action', {
        header: 'Action',
        cell: ({ row }) => (
          <div className='flex items-center'>
            <IconButton
              onClick={() => {
                setStoreToDelete(row.original)
                setDeleteDialogOpen(true)
              }}
              aria-label='Delete store'
            >
              <i className='tabler-trash text-textSecondary' />
            </IconButton>
            <IconButton>
              <Link
                href={getLocalizedUrl(`/apps/mybuisnesses/store/detaille/${row.original.id}?tab=Listproduct`, locale)}
                className='flex'
                aria-label='View store'
              >
                <i className='tabler-eye text-textSecondary' />
              </Link>
            </IconButton>
            <IconButton
              onClick={() => {
                setSelectedStoreId(row.original.id)
                setEditStoreOpen(true)
              }}
              aria-label='Edit store'
            >
              <i className='tabler-edit text-textSecondary' />
            </IconButton>
          </div>
        ),
        enableSorting: false
      })
    ],
    [locale, domains]
  )

  // Handle store deletion
  const handleDeleteStore = async () => {
    if (!storeToDelete) return

    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      await apiClient.delete(`/suppliers/${storeToDelete.id}`)
      const updatedData = storesData.filter(store => store.id !== storeToDelete.id)

      setStoresData(updatedData)
      setFilteredData(updatedData)
      setSuccess('Store deleted successfully')

      if (process.env.NODE_ENV !== 'production') {
        console.log('Store deleted:', storeToDelete.id)
      }

      setTimeout(() => setSuccess(null), 3000)
    } catch (err) {
      if (process.env.NODE_ENV !== 'production') {
        console.error('Failed to delete store:', err)
      }

      setError('Failed to delete store. Please try again.')
    } finally {
      setLoading(false)
      setDeleteDialogOpen(false)
      setStoreToDelete(null)
    }
  }

  // Handle store creation success
  const handleStoreCreated = useCallback(async newStore => {
    await fetchAndUpdateStore(newStore.id, 'add')
    setAddStoreOpen(false)

    if (process.env.NODE_ENV !== 'production') {
      console.log('New store created:', newStore)
    }
  }, [])

  // Handle store update success
  const handleStoreUpdated = useCallback(async updatedStore => {
    await fetchAndUpdateStore(updatedStore.id, 'edit')
    setEditStoreOpen(false)
    setSelectedStoreId(null)
    setSuccess('Store updated successfully')
    setTimeout(() => setSuccess(null), 3000)

    if (process.env.NODE_ENV !== 'production') {
      console.log('Store updated:', updatedStore)
    }
  }, [])

  // Initialize table
  const table = useReactTable({
    data: filteredData,
    columns,
    filterFns: { fuzzy: fuzzyFilter },
    state: { rowSelection, globalFilter },
    initialState: { pagination: { pageSize: 10 } },
    enableRowSelection: true,
    globalFilterFn: fuzzyFilter,
    onRowSelectionChange: setRowSelection,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues,
    getFacetedMinMaxValues: getFacetedMinMaxValues()
  })

  // Loading state
  if (loading || status === 'loading') {
    return (
      <Card>
        <CardContent className='flex justify-center items-center p-6'>
          <CircularProgress />
          <Typography className='ml-2'>Loading stores...</Typography>
        </CardContent>
      </Card>
    )
  }

  // Error state
  if (error) {
    return (
      <Card>
        <CardContent>
          <Alert severity='error'>{error}</Alert>
        </CardContent>
      </Card>
    )
  }

  // Debug table data
  if (process.env.NODE_ENV !== 'production') {
    console.log('Table data:', {
      filteredRows: table.getFilteredRowModel().rows.length,
      totalRows: storesData.length,
      domains
    })
  }

  return (
    <div>
      <Card>
        {success && (
          <Alert severity='success' className='m-4'>
            {success}
          </Alert>
        )}
        <CardHeader title='Filters' className='pbe-4' />
        <TableFilters setData={setFilteredData} tableData={storesData} />
        <div className='flex justify-between flex-col items-start md:flex-row md:items-center p-6 border-bs gap-4'>
          <CustomTextField
            select
            value={table.getState().pagination.pageSize}
            onChange={e => table.setPageSize(Number(e.target.value))}
            className='max-sm:is-full sm:is-[70px]'
          >
            <MenuItem value='10'>10</MenuItem>
            <MenuItem value='25'>25</MenuItem>
            <MenuItem value='50'>50</MenuItem>
          </CustomTextField>
          <div className='flex flex-col sm:flex-row max-sm:is-full items-start sm:items-center gap-4'>
            <DebouncedInput
              value={globalFilter ?? ''}
              onChange={handleSearchChange}
              placeholder='Search Store'
              className='max-sm:is-full'
            />
            <Button
              color='secondary'
              variant='tonal'
              startIcon={<i className='tabler-upload' />}
              className='max-sm:is-full'
            >
              Export
            </Button>
            <Button
              variant='contained'
              startIcon={<i className='tabler-plus' />}
              onClick={() => setAddStoreOpen(true)}
              className='max-sm:is-full'
            >
              Add New Store
            </Button>
          </div>
        </div>
        <TableContainer>
          <Table className={tableStyles.table}>
            <TableHead>
              {table.getHeaderGroups().map(headerGroup => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map(header => (
                    <TableCell
                      key={header.id}
                      className={classnames('is-full-width font-medium', {
                        'no-wrap': header.column.id !== 'business_name'
                      })}
                    >
                      <div
                        className={classnames('flex items-center gap-2', {
                          'cursor-pointer select-none': header.column.getCanSort()
                        })}
                        onClick={header.column.getToggleSortingHandler()}
                      >
                        {flexRender(header.column.columnDef.header, header.getContext())}
                        {header.column.getCanSort() && (
                          <i
                            className={classnames('tabler-arrows-sort text-[18px]', {
                              'tabler-chevron-up': header.column.getIsSorted() === 'asc',
                              'tabler-chevron-down': header.column.getIsSorted() === 'desc'
                            })}
                          />
                        )}
                      </div>
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableHead>
            {table.getFilteredRowModel().rows.length === 0 ? (
              <TableBody>
                <TableRow>
                  <TableCell colSpan={table.getVisibleFlatColumns().length} className='text-center'>
                    {storesData.length === 0
                      ? 'No stores found. Create your first store!'
                      : 'No matching stores found. Try adjusting the filters or search.'}
                  </TableCell>
                </TableRow>
              </TableBody>
            ) : (
              <TableBody>
                {table.getRowModel().rows.map(row => (
                  <TableRow
                    key={row.id}
                    hover
                    className={classnames({
                      selected: row.getIsSelected(),
                      'cursor-pointer': true
                    })}
                    onClick={e => handleRowClick(e, row.original.id)}
                  >
                    {row.getVisibleCells().map(cell => (
                      <TableCell
                        key={cell.id}
                        className={classnames({
                          'no-wrap': cell.column.id !== 'business_name'
                        })}
                      >
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            )}
          </Table>
        </TableContainer>
        <TablePagination
          component={() => <TablePaginationComponent table={table} />}
          count={table.getFilteredRowModel().rows.length}
          rowsPerPage={table.getState().pagination.pageSize}
          page={table.getState().pagination.pageIndex}
          onPageChange={(_, page) => {
            table.setPageIndex(page)
          }}
        />
      </Card>
      <AddStoreDrawer
        open={addStoreOpen}
        handleClose={() => setAddStoreOpen(false)}
        onStoreCreated={handleStoreCreated}
      />
      <EditStoreDrawer
        open={editStoreOpen}
        handleClose={() => {
          setEditStoreOpen(false)
          setSelectedStoreId(null)
        }}
        storeId={selectedStoreId}
        onStoreUpdated={handleStoreUpdated}
      />
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent>Are you sure you want to delete the store {storeToDelete?.business_name}?</DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)} color='secondary'>
            Cancel
          </Button>
          <Button onClick={handleDeleteStore} variant='contained' color='error'>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  )
}

export default StoreListTable
