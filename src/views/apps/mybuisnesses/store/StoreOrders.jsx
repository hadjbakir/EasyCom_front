'use client'

// React Imports
import { useState, useEffect, useCallback, useMemo } from 'react'

// Next Imports
import { useSession } from 'next-auth/react'

// MUI Imports
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
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
import FormControl from '@mui/material/FormControl'
import Select from '@mui/material/Select'
import Chip from '@mui/material/Chip'
import Checkbox from '@mui/material/Checkbox'
import Tooltip from '@mui/material/Tooltip'
import Box from '@mui/material/Box'

// Third-party Imports
import classnames from 'classnames'
import { rankItem } from '@tanstack/match-sorter-utils'
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getPaginationRowModel,
  getSortedRowModel
} from '@tanstack/react-table'
import { CSVLink } from 'react-csv'

import CustomAvatar from '@core/components/mui/Avatar'

// Component Imports
import CustomTextField from '@core/components/mui/TextField'
import OrderTableFilters from './OrderTableFilters'
import ProductOrderDetails from '@/views/components/ProductOrderDetails'
import TablePaginationComponent from '@components/TablePaginationComponent'

// API Imports
import apiClient from '@/libs/api'
import { getSupplierOrders, updateOrderStatus } from '@/libs/api/productOrders'

// Style Imports
import tableStyles from '@core/styles/table.module.css'

// Base URL for static files
const STORAGE_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000'

/**
 * Builds the URL for product images
 */
const buildImageUrl = picture => {
  if (!picture) return '/images/avatars/Tannemirt.png'
  if (picture.startsWith('http')) return picture
  const cleanPath = picture.replace(/^(storage\/|public\/)/, '')

  return `${STORAGE_BASE_URL}/storage/${cleanPath}`
}

/**
 * Fuzzy filter function for table search
 */
const fuzzyFilter = (row, columnId, value, addMeta) => {
  // Skip certain columns from global search
  if (columnId === 'select' || columnId === 'action') return true

  // Convert search value to lowercase for case-insensitive comparison
  const searchValue = value.toLowerCase()

  // For columns with complex data like order_products, we need special handling
  if (columnId === 'order_products') {
    const products = row.original.order_products || []

    // Search in all product names
    for (const product of products) {
      const productName = product.product?.name || ''

      if (productName.toLowerCase().includes(searchValue)) {
        return true
      }
    }

    return false
  }

  // For total_price which is calculated, not a direct field
  if (columnId === 'total_price') {
    const products = row.original.order_products || []
    const total = products.reduce((sum, op) => sum + (op.unit_price || 0) * (op.quantity || 0), 0).toFixed(2)

    return total.includes(searchValue)
  }

  // For quantity which is calculated
  if (columnId === 'quantity') {
    const products = row.original.order_products || []
    const qty = products.reduce((sum, op) => sum + (op.quantity || 0), 0)

    return qty.toString().includes(searchValue)
  }

  // For date fields, allow searching in formatted date
  if (columnId === 'created_at' && row.original.created_at) {
    const formattedDate = new Date(row.original.created_at).toLocaleDateString('en-GB')

    return formattedDate.toLowerCase().includes(searchValue)
  }

  // For ID field, convert to string for comparison
  if (columnId === 'id') {
    return row.original.id.toString().includes(searchValue)
  }

  // For status field
  if (columnId === 'status') {
    return (row.original.status || '').toLowerCase().includes(searchValue)
  }

  // For client name
  if (columnId === 'full_name') {
    return (row.original.full_name || '').toLowerCase().includes(searchValue)
  }

  // Default fuzzy search for other columns
  const itemRank = rankItem(row.getValue(columnId), value)

  addMeta({ itemRank })

  return itemRank.passed
}

/**
 * Global filter function that searches across all columns
 */
const globalFilterFn = (row, columnId, filterValue) => {
  // Skip certain columns from global search
  if (columnId === 'select' || columnId === 'action') return true

  const searchValue = filterValue.toLowerCase()

  // Check ID
  if (row.original.id.toString().includes(searchValue)) return true

  // Check client name
  if ((row.original.full_name || '').toLowerCase().includes(searchValue)) return true

  // Check status
  if ((row.original.status || '').toLowerCase().includes(searchValue)) return true

  // Check date
  if (row.original.created_at) {
    const formattedDate = new Date(row.original.created_at).toLocaleDateString('en-GB')

    if (formattedDate.toLowerCase().includes(searchValue)) return true
  }

  // Check products
  const products = row.original.order_products || []

  for (const product of products) {
    const productName = product.product?.name || ''

    if (productName.toLowerCase().includes(searchValue)) return true
  }

  // Check total price
  const total = products.reduce((sum, op) => sum + (op.unit_price || 0) * (op.quantity || 0), 0).toFixed(2)

  if (total.includes(searchValue)) return true

  // Check quantity
  const qty = products.reduce((sum, op) => sum + (op.quantity || 0), 0).toString()

  if (qty.includes(searchValue)) return true

  return false
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

// Order status options
const statusOptions = [
  { value: 'pending', label: 'Pending', color: 'warning' },
  { value: 'processing', label: 'Processing', color: 'info' },
  { value: 'delivered', label: 'Delivered', color: 'success' }
]

// Get status chip component
const getStatusChip = status => {
  const opt = statusOptions.find(o => o.value === status) || statusOptions[0]

  return <Chip label={opt.label} color={opt.color} size='small' variant='filled' sx={{ fontWeight: 600 }} />
}

// Column Definitions
const columnHelper = createColumnHelper()

/**
 * StoreOrders component - Displays a table of orders for a specific store
 */
const StoreOrders = ({ storeId }) => {
  // States
  const [orders, setOrders] = useState([])
  const [filteredData, setFilteredData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const [globalFilter, setGlobalFilter] = useState('')
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [detailsOpen, setDetailsOpen] = useState(false)
  const [statusUpdatingId, setStatusUpdatingId] = useState(null)
  const [rowSelection, setRowSelection] = useState({})

  // Hooks
  const { data: session, status } = useSession()

  // Memoize onChange for DebouncedInput
  const handleSearchChange = useCallback(value => setGlobalFilter(String(value)), [])

  // Apply global filter manually
  useEffect(() => {
    if (!globalFilter) {
      setFilteredData(orders)

      return
    }

    const filtered = orders.filter(order => {
      const searchValue = globalFilter.toLowerCase()

      // Check ID
      if (order.id.toString().includes(searchValue)) return true

      // Check client name
      if ((order.full_name || '').toLowerCase().includes(searchValue)) return true

      // Check status
      if ((order.status || '').toLowerCase().includes(searchValue)) return true

      // Check date
      if (order.created_at) {
        const formattedDate = new Date(order.created_at).toLocaleDateString('en-GB')

        if (formattedDate.toLowerCase().includes(searchValue)) return true
      }

      // Check products
      const products = order.order_products || []

      for (const product of products) {
        const productName = product.product?.name || ''

        if (productName.toLowerCase().includes(searchValue)) return true
      }

      // Check total price
      const total = products.reduce((sum, op) => sum + (op.unit_price || 0) * (op.quantity || 0), 0).toFixed(2)

      if (total.includes(searchValue)) return true

      // Check quantity
      const qty = products.reduce((sum, op) => sum + (op.quantity || 0), 0).toString()

      if (qty.includes(searchValue)) return true

      return false
    })

    setFilteredData(filtered)
  }, [globalFilter, orders])

  // Fetch store and orders data
  useEffect(() => {
    const fetchData = async () => {
      if (!storeId || !session) {
        return
      }

      setError(null)
      setLoading(true)

      try {
        // Fetch store info
        const res = await apiClient.get(`/suppliers/${storeId}`)
        const supplier = res.data.data

        // Fetch orders
        const data = await getSupplierOrders(supplier.id)

        if (Array.isArray(data)) {
          setOrders(data)
          setFilteredData(data)
        } else {
          setOrders([])
          setFilteredData([])
        }

        if (process.env.NODE_ENV !== 'production') {
          console.log('Store orders fetched:', data)
        }
      } catch (err) {
        if (process.env.NODE_ENV !== 'production') {
          console.error('Failed to fetch data:', err.message, err.response?.data)
        }

        setError(
          err.response?.status === 401
            ? 'Unauthorized. Please log in again.'
            : err.response?.status === 404
              ? 'No orders found for this store.'
              : `Failed to load data: ${err.message}`
        )
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [storeId, session])

  // Handle order status update
  const handleStatusUpdate = async (orderId, newStatus) => {
    setStatusUpdatingId(orderId)
    setError(null)
    setSuccess(null)

    try {
      await updateOrderStatus(orderId, newStatus)

      setOrders(prev => prev.map(order => (order.id === orderId ? { ...order, status: newStatus } : order)))

      setFilteredData(prev => prev.map(order => (order.id === orderId ? { ...order, status: newStatus } : order)))

      setSuccess('Order status updated successfully')

      if (process.env.NODE_ENV !== 'production') {
        console.log('Order status updated:', { orderId, newStatus })
      }

      setTimeout(() => setSuccess(null), 3000)
    } catch (err) {
      if (process.env.NODE_ENV !== 'production') {
        console.error('Failed to update order status:', err)
      }

      setError('Failed to update order status. Please try again.')
    } finally {
      setStatusUpdatingId(null)
    }
  }

  // Define table columns
  const columns = useMemo(
    () => [
      {
        id: 'select',
        header: ({ table }) => (
          <Checkbox
            checked={table.getIsAllRowsSelected()}
            indeterminate={table.getIsSomeRowsSelected() && !table.getIsAllRowsSelected()}
            onChange={table.getToggleAllRowsSelectedHandler()}
          />
        ),
        cell: ({ row }) => (
          <Checkbox
            checked={row.getIsSelected()}
            disabled={!row.getCanSelect()}
            indeterminate={row.getIsSomeSelected() && !row.getIsSelected()}
            onChange={row.getToggleSelectedHandler()}
            onClick={e => e.stopPropagation()}
          />
        ),
        meta: { align: 'center' },
        enableSorting: false
      },
      columnHelper.accessor('id', {
        header: 'Order ID',
        cell: ({ row }) => <Typography fontWeight={600}>#{row.original.id}</Typography>
      }),
      columnHelper.accessor('full_name', {
        header: 'Client',
        cell: ({ row }) => <Typography>{row.original.full_name || 'N/A'}</Typography>
      }),
      columnHelper.accessor('order_products', {
        header: 'Products',
        cell: ({ row }) => (
          <div className='flex flex-col gap-2'>
            {row.original.order_products?.map(op => (
              <div key={op.id} className='flex items-center gap-2'>
                <img
                  src={getProductImageUrl(op.product)}
                  alt={op.product?.name || `Product #${op.product_id} (deleted)`}
                  style={{ width: 34, height: 34, borderRadius: 6, objectFit: 'cover' }}
                  onError={e => {
                    e.target.src = '/images/placeholder.jpg'
                  }}
                />
                <Typography variant='body2' fontWeight={500} color='text.primary'>
                  {op.product?.name || `Product #${op.product_id} (deleted)`}
                </Typography>
              </div>
            )) || (
              <Typography variant='body2' color='text.secondary'>
                No products
              </Typography>
            )}
          </div>
        )
      }),
      columnHelper.accessor('quantity', {
        header: 'Quantity',
        cell: ({ row }) => (
          <Typography align='center'>
            {row.original.order_products?.reduce((sum, op) => sum + (op.quantity || 0), 0) || 0}
          </Typography>
        ),
        meta: { align: 'center' }
      }),
      columnHelper.accessor('total_price', {
        header: 'Total Price',
        cell: ({ row }) => (
          <Typography align='center' fontWeight={600} color='primary.main'>
            {row.original.order_products?.reduce((sum, op) => sum + op.unit_price * op.quantity, 0).toFixed(2) ||
              '0.00'}{' '}
            DZ
          </Typography>
        ),
        meta: { align: 'center' }
      }),
      columnHelper.accessor('status', {
        header: 'Status',
        cell: ({ row }) => {
          const status = row.original.status?.toLowerCase() || 'pending'
          const isDelivered = status === 'delivered'

          if (isDelivered) {
            return (
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {getStatusChip(status)}
              </Box>
            )
          }

          return (
            <FormControl size='small' sx={{ minWidth: 100, justifyContent: 'center', display: 'flex' }}>
              <Select
                value={status}
                onChange={e => handleStatusUpdate(row.original.id, e.target.value)}
                disabled={statusUpdatingId === row.original.id}
                sx={{ fontWeight: 600 }}
                onClick={e => e.stopPropagation()} // Stop click propagation
                MenuProps={{
                  onClick: e => e.stopPropagation() // Stop click propagation on menu
                }}
              >
                {statusOptions.map(opt => (
                  <MenuItem
                    key={opt.value}
                    value={opt.value}
                    sx={{ fontWeight: 600, display: 'flex', justifyContent: 'center' }}
                    onClick={e => e.stopPropagation()} // Stop click propagation on menu item
                  >
                    <Chip label={opt.label} color={opt.color} size='small' />
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )
        },
        meta: { align: 'center' }
      }),
      columnHelper.accessor('created_at', {
        header: 'Date',
        cell: ({ row }) => (
          <Typography>
            {row.original.created_at ? new Date(row.original.created_at).toLocaleDateString('en-GB') : 'N/A'}
          </Typography>
        )
      }),
      columnHelper.accessor('action', {
        header: 'Action',
        cell: ({ row }) => (
          <Tooltip title='Details'>
            <IconButton
              size='small'
              onClick={e => {
                e.stopPropagation()
                setSelectedOrder(row.original)
                setDetailsOpen(true)
              }}
              aria-label='View order details'
            >
              <i className='tabler-eye text-textSecondary' />
            </IconButton>
          </Tooltip>
        ),
        meta: { align: 'center' },
        enableSorting: false
      })
    ],
    [statusUpdatingId]
  )

  // Initialize table
  const table = useReactTable({
    data: filteredData,
    columns,
    state: { rowSelection },
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel()
  })

  // CSV export data
  const csvData = useMemo(() => {
    const selectedRows = table.getSelectedRowModel().rows
    const rowsToExport = selectedRows.length > 0 ? selectedRows : table.getRowModel().rows

    return rowsToExport.map(row => ({
      id: row.original.id,
      client: row.original.full_name,
      status: row.original.status,
      date: row.original.created_at,
      total: row.original.order_products?.reduce((sum, op) => sum + op.unit_price * op.quantity, 0).toFixed(2),
      products: row.original.order_products?.map(op => op.product?.name).join(', ')
    }))
  }, [table])

  // Loading state
  if (loading) {
    return (
      <Card>
        <CardContent className='flex justify-center items-center p-6'>
          <CircularProgress />
          <Typography className='ml-2'>Loading orders...</Typography>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      {success && (
        <Alert severity='success' className='m-4'>
          {success}
        </Alert>
      )}
      {error && (
        <Alert severity='error' className='m-4'>
          {error}
        </Alert>
      )}
      <CardHeader title='Store Orders' className='pbe-4' />
      <OrderTableFilters setData={setFilteredData} tableData={orders} />
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
            placeholder='Search Orders'
            className='max-sm:is-full'
          />
          <CSVLink
            data={csvData}
            filename='store-orders.csv'
            style={{ textDecoration: 'none' }}
            className='max-sm:is-full'
          >
            <Button
              color='secondary'
              variant='tonal'
              startIcon={<i className='tabler-upload' />}
              className='max-sm:is-full'
            >
              Export
            </Button>
          </CSVLink>
          <Button
            variant='contained'
            startIcon={<i className='tabler-refresh' />}
            onClick={() => {
              setLoading(true)
              setOrders([])
              setFilteredData([])
              setTimeout(async () => {
                try {
                  const res = await apiClient.get(`/suppliers/${storeId}`)
                  const supplier = res.data.data
                  const data = await getSupplierOrders(supplier.id)

                  setOrders(data || [])
                  setFilteredData(data || [])
                } catch (err) {
                  setError('Failed to refresh orders. Please try again.')
                } finally {
                  setLoading(false)
                }
              }, 500)
            }}
            className='max-sm:is-full'
          >
            Refresh
          </Button>
        </div>
      </div>
      <TableContainer>
        <Table className={tableStyles.table}>
          <TableHead>
            {table.getHeaderGroups().map(headerGroup => (
              <TableRow key={headerGroup.id} sx={{ background: '#fafbfc' }}>
                {headerGroup.headers.map(header => (
                  <TableCell
                    key={header.id}
                    align={header.column.columnDef.meta?.align || 'left'}
                    className={classnames('is-full-width font-medium', {
                      'no-wrap': header.column.id !== 'order_products'
                    })}
                    sx={{ borderBottom: '2px solid #e0e0e0' }}
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
                  {orders.length === 0
                    ? 'No orders found for this store.'
                    : 'No matching orders found. Try adjusting the filters or search.'}
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
                  onClick={() => {
                    setSelectedOrder(row.original)
                    setDetailsOpen(true)
                  }}
                  sx={{ borderBottom: '1px solid #f0f0f0' }}
                >
                  {row.getVisibleCells().map(cell => (
                    <TableCell
                      key={cell.id}
                      align={cell.column.columnDef.meta?.align || 'left'}
                      className={classnames({
                        'no-wrap': cell.column.id !== 'order_products'
                      })}
                      sx={{ py: 1.5 }}
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
        count={filteredData.length}
        rowsPerPage={table.getState().pagination.pageSize}
        page={table.getState().pagination.pageIndex}
        onPageChange={(_, page) => {
          table.setPageIndex(page)
        }}
        onRowsPerPageChange={e => {
          table.setPageSize(Number(e.target.value))
        }}
        rowsPerPageOptions={[10, 25, 50]}
      />
      <Dialog open={detailsOpen} onClose={() => setDetailsOpen(false)} maxWidth='md' fullWidth>
        <DialogTitle>Order Details</DialogTitle>
        <DialogContent>{selectedOrder && <ProductOrderDetails order={selectedOrder} />}</DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailsOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Card>
  )
}

/**
 * Retourne l'URL absolue de la première image du produit, ou un placeholder si absent.
 */
function getProductImageUrl(product) {
  if (!product) return '/images/placeholder.jpg'
  const picture = product.pictures?.[0]?.picture

  if (!picture) return '/images/placeholder.jpg'
  if (picture.startsWith('http')) return picture
  const cleanPath = picture.replace(/^(storage\/|public\/)/, '')
  const base = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000'

  return `${base}/storage/${cleanPath}`
}

export default StoreOrders
