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
import Chip from '@mui/material/Chip'
import Checkbox from '@mui/material/Checkbox'
import Box from '@mui/material/Box'
import Avatar from '@mui/material/Avatar'
import InputAdornment from '@mui/material/InputAdornment'
import TextField from '@mui/material/TextField'
import Menu from '@mui/material/Menu'
import Snackbar from '@mui/material/Snackbar'
import Grid from '@mui/material/Grid'
import { useTheme } from '@mui/material/styles'

// Third-party Imports
import classnames from 'classnames'
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getPaginationRowModel,
  getSortedRowModel
} from '@tanstack/react-table'
import { CSVLink } from 'react-csv'

// Component Imports
import { RefreshCw, Eye, MoreVertical, XCircle, MessageSquare, Filter } from 'lucide-react'

import CustomTextField from '@core/components/mui/TextField'
import OrderTableFilters from './OrderTableFilters'
import ProductOrderDetails from '@/views/components/ProductOrderDetails'
import TablePaginationComponent from '@components/TablePaginationComponent'

// Icon Imports

// API Imports
import apiClient from '@/libs/api'
import { getClientOrders } from '@/libs/api/productOrders'

// Style Imports
import tableStyles from '@core/styles/table.module.css'

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
  { value: 'pending', label: 'Pending', color: 'warning', icon: <RefreshCw size={16} /> },
  { value: 'processing', label: 'Processing', color: 'info', icon: <RefreshCw size={16} /> },
  { value: 'delivered', label: 'Delivered', color: 'success', icon: <RefreshCw size={16} /> },
  { value: 'cancelled', label: 'Cancelled', color: 'error', icon: <XCircle size={16} /> }
]

// Get status chip component
const getStatusChip = status => {
  const opt = statusOptions.find(o => o.value === status) || { label: status, color: 'default', icon: null }

  return <Chip icon={opt.icon} label={opt.label} color={opt.color} size='small' variant='outlined' />
}

// Column Definitions
const columnHelper = createColumnHelper()

/**
 * ProductClientOrders component - Displays a table of product orders for a client
 */
const ProductClientOrders = () => {
  // States
  const [orders, setOrders] = useState([])
  const [filteredData, setFilteredData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const [globalFilter, setGlobalFilter] = useState('')
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [detailsOpen, setDetailsOpen] = useState(false)
  const [cancelDialog, setCancelDialog] = useState({ open: false, orderId: null })
  const [cancelLoading, setCancelLoading] = useState(false)
  const [actionMenuAnchor, setActionMenuAnchor] = useState(null)
  const [actionOrderId, setActionOrderId] = useState(null)
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' })
  const [messageDialog, setMessageDialog] = useState({ open: false, orderId: null })
  const [messageText, setMessageText] = useState('')
  const [rowSelection, setRowSelection] = useState({})
  const [statusFilter, setStatusFilter] = useState('all')
  const [filterDialog, setFilterDialog] = useState(false)

  const [filterOptions, setFilterOptions] = useState({
    dateFrom: '',
    dateTo: '',
    priceMin: '',
    priceMax: '',
    suppliers: []
  })

  // Hooks
  const { data: session, status } = useSession()
  const theme = useTheme()

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

  // Fetch orders data
  useEffect(() => {
    fetchOrders()
  }, [session, statusFilter])

  const fetchOrders = async () => {
    if (!session?.user?.id) {
      setLoading(false)

      return
    }

    setLoading(true)
    setError(null)

    try {
      // First try the endpoint from the documentation
      let response

      try {
        response = await apiClient.get(`/orders/user/${session.user.id}`)
      } catch (firstError) {
        // If that fails, try alternative endpoints
        try {
          // Try without the 'api' prefix as it might be added by the apiClient
          response = await apiClient.get(`/orders/user/${session.user.id}`, {
            baseURL: process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000'
          })
        } catch (secondError) {
          try {
            // Try the product-orders endpoint
            response = await apiClient.get(`/product-orders/user/${session.user.id}`)
          } catch (thirdError) {
            // If all attempts fail, use the getClientOrders function from the original component
            const data = await getClientOrders(session.user.id)

            setOrders(data || [])
            setFilteredData(data || [])

            return
          }
        }
      }

      const data = response?.data || []

      setOrders(data)
      setFilteredData(data)

      if (process.env.NODE_ENV !== 'production') {
        console.log('Product orders fetched:', data)
      }
    } catch (err) {
      // If we get here, all attempts failed
      console.error('Failed to fetch product orders:', err)

      // Show a more helpful error message
      setError(
        'Unable to load product orders. The API endpoint may not be available yet. ' +
          (err.response?.data?.message || 'Please try again later.')
      )

      // In development, use mock data so the UI is still functional
      if (process.env.NODE_ENV !== 'production') {
        const mockOrders = [
          {
            id: 1,
            user_id: session.user.id,
            supplier_id: 1,
            full_name: 'John Doe',
            status: 'pending',
            created_at: new Date().toISOString(),
            order_products: [
              {
                id: 1,
                product_id: 101,
                quantity: 2,
                unit_price: 99.99,
                product: {
                  name: 'Sample Product',
                  pictures: [{ picture: '/images/avatars/default.png' }]
                }
              }
            ]
          },
          {
            id: 2,
            user_id: session.user.id,
            supplier_id: 2,
            full_name: 'John Doe',
            status: 'delivered',
            created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
            order_products: [
              {
                id: 2,
                product_id: 102,
                quantity: 1,
                unit_price: 149.99,
                product: {
                  name: 'Another Product',
                  pictures: [{ picture: '/images/avatars/default.png' }]
                }
              }
            ]
          }
        ]

        setOrders(mockOrders)
        setFilteredData(mockOrders)
        console.log('Using mock product orders data')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleOpenDetails = order => {
    setSelectedOrder(order)
    setDetailsOpen(true)
  }

  const handleCloseDetails = () => {
    setSelectedOrder(null)
    setDetailsOpen(false)
  }

  const handleActionMenuOpen = (event, orderId) => {
    setActionMenuAnchor(event.currentTarget)
    setActionOrderId(orderId)
  }

  const handleActionMenuClose = () => {
    setActionMenuAnchor(null)
    setActionOrderId(null)
  }

  const handleOpenCancelDialog = orderId => {
    setCancelDialog({ open: true, orderId })
    handleActionMenuClose()
  }

  const handleCloseCancelDialog = () => {
    setCancelDialog({ open: false, orderId: null })
    setCancelLoading(false)
  }

  const handleCancelOrder = async () => {
    if (!cancelDialog.orderId) return

    setCancelLoading(true)

    try {
      await apiClient.patch(`/orders/${cancelDialog.orderId}/status`, { status: 'cancelled' })
      setOrders(prev =>
        prev.map(order => (order.id === cancelDialog.orderId ? { ...order, status: 'cancelled' } : order))
      )
      setFilteredData(prev =>
        prev.map(order => (order.id === cancelDialog.orderId ? { ...order, status: 'cancelled' } : order))
      )
      setSnackbar({
        open: true,
        message: 'Order cancelled successfully',
        severity: 'success'
      })
      handleCloseCancelDialog()
    } catch (error) {
      const errorMessage =
        error.response?.status === 403
          ? 'You are not authorized to cancel this order'
          : error.response?.status === 404
            ? 'Order not found'
            : error.response?.data?.message || 'Failed to cancel order. Please try again.'

      setSnackbar({
        open: true,
        message: errorMessage,
        severity: 'error'
      })

      if (process.env.NODE_ENV !== 'production') {
        console.error('Failed to cancel order:', error)
      }
    } finally {
      setCancelLoading(false)
    }
  }

  const handleOpenMessageDialog = orderId => {
    setMessageDialog({ open: true, orderId })
    handleActionMenuClose()
  }

  const handleCloseMessageDialog = () => {
    setMessageDialog({ open: false, orderId: null })
    setMessageText('')
  }

  const handleSendMessage = async () => {
    if (!messageDialog.orderId || !messageText.trim()) return

    try {
      // This endpoint might need to be adjusted based on your API
      await apiClient.post(`/orders/${messageDialog.orderId}/messages`, {
        message: messageText.trim()
      })
      setMessageText('')
      setMessageDialog({ open: false, orderId: null })
      setSnackbar({
        open: true,
        message: 'Message sent successfully',
        severity: 'success'
      })
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Failed to send message. Please try again.',
        severity: 'error'
      })

      if (process.env.NODE_ENV !== 'production') {
        console.error('Failed to send message:', error)
      }
    }
  }

  const handleSnackbarClose = () => {
    setSnackbar({ open: false, message: '', severity: 'info' })
  }

  const handleOpenFilterDialog = () => {
    setFilterDialog(true)
  }

  const handleCloseFilterDialog = () => {
    setFilterDialog(false)
  }

  const handleApplyFilters = () => {
    // Apply filters to the data
    const filtered = orders.filter(order => {
      // Filter by date range
      if (filterOptions.dateFrom && new Date(order.created_at) < new Date(filterOptions.dateFrom)) return false
      if (filterOptions.dateTo && new Date(order.created_at) > new Date(filterOptions.dateTo)) return false

      // Filter by price range
      const totalPrice = order.order_products?.reduce((sum, op) => sum + op.unit_price * op.quantity, 0) || 0

      if (filterOptions.priceMin && totalPrice < Number.parseFloat(filterOptions.priceMin)) return false
      if (filterOptions.priceMax && totalPrice > Number.parseFloat(filterOptions.priceMax)) return false

      // Filter by suppliers
      if (filterOptions.suppliers.length > 0 && !filterOptions.suppliers.includes(order.supplier_id?.toString()))
        return false

      return true
    })

    setFilteredData(filtered)
    handleCloseFilterDialog()
  }

  const handleResetFilters = () => {
    setFilterOptions({
      dateFrom: '',
      dateTo: '',
      priceMin: '',
      priceMax: '',
      suppliers: []
    })
    setFilteredData(orders)
  }

  const getOrderActions = order => {
    const actions = []

    actions.push({
      label: 'Details',
      icon: <Eye size={16} />,
      onClick: () => handleOpenDetails(order),
      color: 'primary'
    })

    return actions
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
      columnHelper.accessor('order_products', {
        header: 'Products',
        cell: ({ row }) => (
          <div className='flex flex-col gap-2'>
            {row.original.order_products?.map(op => (
              <div key={op.id} className='flex items-center gap-2'>
                <Avatar
                  src={getProductImageUrl(op.product)}
                  alt={op.product?.name || `Product #${op.product_id} (deleted)`}
                  sx={{ width: 34, height: 34, borderRadius: 1 }}
                  variant='rounded'
                  imgProps={{
                    onError: e => {
                      e.target.src = '/images/placeholder.jpg'
                    }
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
        cell: ({ row }) => (
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {getStatusChip(row.original.status)}
          </Box>
        ),
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
        header: 'Actions',
        cell: ({ row }) => (
          <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
            {getOrderActions(row.original)
              .slice(0, 2)
              .map((action, index) => (
                <Button
                  key={index}
                  size='small'
                  variant='outlined'
                  color={action.color}
                  startIcon={action.icon}
                  onClick={e => {
                    e.stopPropagation()
                    action.onClick()
                  }}
                >
                  {action.label}
                </Button>
              ))}
            <IconButton
              size='small'
              onClick={e => {
                e.stopPropagation()
                handleActionMenuOpen(e, row.original.id)
              }}
            >
              <MoreVertical size={18} />
            </IconButton>
          </Box>
        ),
        meta: { align: 'center' },
        enableSorting: false
      })
    ],
    []
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
  if (loading && orders.length === 0) {
    return (
      <Card>
        <CardContent className='flex justify-center items-center p-6'>
          <CircularProgress />
          <Typography className='ml-2'>Loading product orders...</Typography>
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
        <Alert
          severity='error'
          className='m-4'
          action={
            <Button color='inherit' size='small' onClick={fetchOrders}>
              Retry
            </Button>
          }
        >
          {error}
        </Alert>
      )}
      <CardHeader title='Product Orders' className='pbe-4' />
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
            filename='product-orders.csv'
            style={{ textDecoration: 'none' }}
            className='max-sm:is-full'
          ></CSVLink>
          <Button
            variant='outlined'
            startIcon={<Filter size={18} />}
            onClick={handleOpenFilterDialog}
            className='max-sm:is-full'
          >
            Filter
          </Button>
        </div>
      </div>
      <TableContainer>
        <Table className={tableStyles.table}>
          <TableHead>
            {table.getHeaderGroups().map(headerGroup => (
              <TableRow
                key={headerGroup.id}
                sx={{
                  background: theme => (theme.palette.mode === 'dark' ? theme.palette.background.paper : '#fafbfc')
                }}
              >
                {headerGroup.headers.map(header => (
                  <TableCell
                    key={header.id}
                    align={header.column.columnDef.meta?.align || 'left'}
                    className={classnames('is-full-width font-medium', {
                      'no-wrap': header.column.id !== 'order_products'
                    })}
                    sx={{
                      borderBottom: theme => `2px solid ${theme.palette.divider}`
                    }}
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
                    ? 'No product orders found.'
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
                  sx={{
                    borderBottom: theme => `1px solid ${theme.palette.divider}`
                  }}
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

      {/* Order Details Dialog */}
      <Dialog open={detailsOpen} onClose={handleCloseDetails} maxWidth='md' fullWidth>
        <DialogTitle>Order Details</DialogTitle>
        <DialogContent>{selectedOrder && <ProductOrderDetails order={selectedOrder} />}</DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDetails}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Cancel Dialog */}
      <Dialog open={cancelDialog.open} onClose={handleCloseCancelDialog} maxWidth='xs' fullWidth>
        <DialogTitle>Cancel Order</DialogTitle>
        <DialogContent>
          <Typography sx={{ mb: 2 }}>
            Are you sure you want to cancel this product order? This action cannot be undone.
          </Typography>
          <Typography variant='body2' color='textSecondary'>
            Cancelling will notify the supplier and update the order status.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseCancelDialog} disabled={cancelLoading}>
            No, Keep Order
          </Button>
          <Button
            variant='contained'
            color='error'
            onClick={handleCancelOrder}
            disabled={cancelLoading}
            startIcon={cancelLoading ? <CircularProgress size={18} /> : <XCircle size={18} />}
          >
            Yes, Cancel Order
          </Button>
        </DialogActions>
      </Dialog>

      {/* Message Dialog */}
      <Dialog open={messageDialog.open} onClose={handleCloseMessageDialog} maxWidth='sm' fullWidth>
        <DialogTitle>Send Message</DialogTitle>
        <DialogContent>
          <Typography variant='body2' color='textSecondary' sx={{ mb: 2 }}>
            Send a message to the supplier about this order.
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={5}
            placeholder='Type your message here...'
            value={messageText}
            onChange={e => setMessageText(e.target.value)}
            sx={{ mb: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseMessageDialog}>Cancel</Button>
          <Button variant='contained' onClick={handleSendMessage} disabled={!messageText.trim()}>
            Send Message
          </Button>
        </DialogActions>
      </Dialog>

      {/* Filter Dialog */}
      <Dialog open={filterDialog} onClose={handleCloseFilterDialog} maxWidth='sm' fullWidth>
        <DialogTitle>Filter Orders</DialogTitle>
        <DialogContent>
          <Grid container spacing={3} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label='Date From'
                type='date'
                InputLabelProps={{ shrink: true }}
                value={filterOptions.dateFrom}
                onChange={e => setFilterOptions({ ...filterOptions, dateFrom: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label='Date To'
                type='date'
                InputLabelProps={{ shrink: true }}
                value={filterOptions.dateTo}
                onChange={e => setFilterOptions({ ...filterOptions, dateTo: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label='Min Price'
                type='number'
                InputProps={{ startAdornment: <InputAdornment position='start'>DZ</InputAdornment> }}
                value={filterOptions.priceMin}
                onChange={e => setFilterOptions({ ...filterOptions, priceMin: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label='Max Price'
                type='number'
                InputProps={{ startAdornment: <InputAdornment position='start'>DZ</InputAdornment> }}
                value={filterOptions.priceMax}
                onChange={e => setFilterOptions({ ...filterOptions, priceMax: e.target.value })}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleResetFilters}>Reset</Button>
          <Button onClick={handleCloseFilterDialog}>Cancel</Button>
          <Button variant='contained' onClick={handleApplyFilters}>
            Apply Filters
          </Button>
        </DialogActions>
      </Dialog>

      {/* Action Menu */}
      <Menu anchorEl={actionMenuAnchor} open={Boolean(actionMenuAnchor)} onClose={handleActionMenuClose}>
        {actionOrderId &&
          getOrderActions(orders.find(o => o.id === actionOrderId)).map((action, index) => (
            <MenuItem key={index} onClick={action.onClick}>
              {action.icon}
              <Typography sx={{ ml: 1 }}>{action.label}</Typography>
            </MenuItem>
          ))}
      </Menu>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={handleSnackbarClose} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Card>
  )
}

export default ProductClientOrders
