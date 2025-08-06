'use client'

// React Imports
import { useState, useEffect, useCallback, useMemo } from 'react'

import Grid from '@mui/material/Grid' // Declare Grid variable

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
import TextareaAutosize from '@mui/material/TextareaAutosize'

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
import {
  Search,
  RefreshCw,
  MoreVertical,
  MessageSquare,
  CheckCircle,
  Clock,
  XCircle,
  Download,
  Star,
  Filter,
  Send,
  Paperclip
} from 'lucide-react'

import CustomTextField from '@core/components/mui/TextField'
import OrderTableFilters from './OrderTableFilters'
import TablePaginationComponent from '@components/TablePaginationComponent'

// Icon Imports

// API Imports
import apiClient from '@/libs/api'

// Style Imports
import tableStyles from '@core/styles/table.module.css'

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
  { value: 'pending', label: 'Pending', color: 'warning', icon: <Clock size={16} /> },
  { value: 'confirmed', label: 'Confirmed', color: 'primary', icon: <CheckCircle size={16} /> },
  { value: 'in_progress', label: 'In Progress', color: 'info', icon: <RefreshCw size={16} /> },
  { value: 'completed', label: 'Completed', color: 'success', icon: <CheckCircle size={16} /> },
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
 * ServiceClientOrders component - Displays a table of service orders for a client
 */
const ServiceClientOrders = () => {
  // States
  const [orders, setOrders] = useState([])
  const [filteredData, setFilteredData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const [globalFilter, setGlobalFilter] = useState('')
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [detailsOpen, setDetailsOpen] = useState(false)
  const [rowSelection, setRowSelection] = useState({})
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [sortBy, setSortBy] = useState('created_at')
  const [sortDirection, setSortDirection] = useState('desc')
  const [messageDialog, setMessageDialog] = useState({ open: false, orderId: null })
  const [cancelDialog, setCancelDialog] = useState({ open: false, orderId: null })
  const [reviewDialog, setReviewDialog] = useState({ open: false, orderId: null })
  const [filterDialog, setFilterDialog] = useState(false)
  const [actionMenuAnchor, setActionMenuAnchor] = useState(null)
  const [actionOrderId, setActionOrderId] = useState(null)
  const [reviewData, setReviewData] = useState({ rating: 5, comment: '' })
  const [messageText, setMessageText] = useState('')
  const [cancelLoading, setCancelLoading] = useState(false)
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' })
  const [statusFilter, setStatusFilter] = useState('all') // Declare statusFilter variable

  const [filterOptions, setFilterOptions] = useState({
    dateFrom: '',
    dateTo: '',
    priceMin: '',
    priceMax: '',
    providers: []
  })

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

      // Check title
      if ((order.title || '').toLowerCase().includes(searchValue)) return true

      // Check provider name
      if ((order.provider_name || '').toLowerCase().includes(searchValue)) return true

      // Check status
      if ((order.status || '').toLowerCase().includes(searchValue)) return true

      // Check date
      if (order.created_at) {
        const formattedDate = new Date(order.created_at).toLocaleDateString('en-GB')

        if (formattedDate.toLowerCase().includes(searchValue)) return true
      }

      // Check amount
      if (order.amount && order.amount.toString().includes(searchValue)) return true

      return false
    })

    setFilteredData(filtered)
  }, [globalFilter, orders])

  // Fetch orders data
  useEffect(() => {
    fetchOrders()
  }, [currentPage, sortBy, sortDirection, statusFilter, session])

  const fetchOrders = async () => {
    if (!session?.user?.id) {
      setLoading(false)

      return
    }

    setLoading(true)
    setError(null)

    try {
      const params = new URLSearchParams({
        page: currentPage,
        sort_by: sortBy,
        sort_direction: sortDirection,
        status: statusFilter !== 'all' ? statusFilter : ''
      })

      if (filterOptions.dateFrom) params.append('date_from', filterOptions.dateFrom)
      if (filterOptions.dateTo) params.append('date_to', filterOptions.dateTo)
      if (filterOptions.priceMin) params.append('price_min', filterOptions.priceMin)
      if (filterOptions.priceMax) params.append('price_max', filterOptions.priceMax)
      if (filterOptions.providers.length > 0) params.append('service_provider_ids', filterOptions.providers.join(','))

      const response = await apiClient.get(`/service-orders/user/${session.user.id}?${params.toString()}`)

      const fetchedOrders = (response.data.data || []).map(order => ({
        id: order.id,
        title: order.title,
        provider_name: order.service_provider?.user?.full_name || 'Unknown Provider',
        provider_avatar: order.service_provider?.user?.picture || '/images/avatars/default.png',
        service_name: order.skill?.name || 'Custom Service',
        created_at: order.created_at,
        amount: Number.parseFloat(order.total_amount) || 0,
        status: order.status,
        has_review: false, // Placeholder: Update when backend supports
        has_deliverables: false, // Placeholder: Update when backend supports
        deliverables_url: null // Placeholder: Update when backend supports
      }))

      setOrders(fetchedOrders)
      setFilteredData(fetchedOrders)
      setTotalPages(response.data.meta?.last_page || 1)

      if (process.env.NODE_ENV !== 'production') {
        console.log('Service orders fetched:', response.data)
      }
    } catch (error) {
      const errorMessage =
        error.response?.status === 403
          ? 'You are not authorized to view these orders'
          : error.response?.data?.message || 'Failed to load service orders. Please try again.'

      setError(errorMessage)

      if (process.env.NODE_ENV !== 'production') {
        console.error('Failed to fetch service orders:', error)
      }

      // In development, use mock data so the UI is still functional
      if (process.env.NODE_ENV !== 'production') {
        const mockOrders = [
          {
            id: 1,
            title: 'Website Development',
            provider_name: 'John Developer',
            provider_avatar: '/images/avatars/default.png',
            service_name: 'Web Development',
            created_at: new Date().toISOString(),
            amount: 499.99,
            status: 'in_progress',
            has_review: false,
            has_deliverables: false
          },
          {
            id: 2,
            title: 'Logo Design',
            provider_name: 'Sarah Designer',
            provider_avatar: '/images/avatars/default.png',
            service_name: 'Graphic Design',
            created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
            amount: 149.99,
            status: 'completed',
            has_review: false,
            has_deliverables: true,
            deliverables_url: '#'
          }
        ]

        setOrders(mockOrders)
        setFilteredData(mockOrders)
        console.log('Using mock service orders data')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleActionMenuOpen = (event, orderId) => {
    setActionMenuAnchor(event.currentTarget)
    setActionOrderId(orderId)
  }

  const handleActionMenuClose = () => {
    setActionMenuAnchor(null)
    setActionOrderId(null)
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
      await apiClient.post(`/service-orders/${messageDialog.orderId}/messages`, {
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
      await apiClient.patch(`/service-orders/${cancelDialog.orderId}/status`, { status: 'cancelled' })
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

  const handleOpenReviewDialog = orderId => {
    setReviewDialog({ open: true, orderId })
    handleActionMenuClose()
  }

  const handleCloseReviewDialog = () => {
    setReviewDialog({ open: false, orderId: null })
    setReviewData({ rating: 5, comment: '' })
  }

  const handleReviewChange = (field, value) => {
    setReviewData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmitReview = async () => {
    if (!reviewDialog.orderId) return

    try {
      await apiClient.post(`/service-orders/${reviewDialog.orderId}/reviews`, {
        rating: reviewData.rating,
        comment: reviewData.comment
      })
      setOrders(prev => prev.map(order => (order.id === reviewDialog.orderId ? { ...order, has_review: true } : order)))
      setFilteredData(prev =>
        prev.map(order => (order.id === reviewDialog.orderId ? { ...order, has_review: true } : order))
      )
      setSnackbar({
        open: true,
        message: 'Review submitted successfully',
        severity: 'success'
      })
      handleCloseReviewDialog()
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Failed to submit review. Please try again.',
        severity: 'error'
      })

      if (process.env.NODE_ENV !== 'production') {
        console.error('Failed to submit review:', error)
      }
    }
  }

  const handleOpenFilterDialog = () => {
    setFilterDialog(true)
  }

  const handleCloseFilterDialog = () => {
    setFilterDialog(false)
  }

  const handleApplyFilters = () => {
    setCurrentPage(1)
    fetchOrders()
    handleCloseFilterDialog()
  }

  const handleResetFilters = () => {
    setFilterOptions({
      dateFrom: '',
      dateTo: '',
      priceMin: '',
      priceMax: '',
      providers: []
    })
  }

  const handleSortChange = field => {
    if (sortBy === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(field)
      setSortDirection('desc')
    }
  }

  const handleSnackbarClose = () => {
    setSnackbar({ open: false, message: '', severity: 'info' })
  }

  const formatDate = dateString => {
    return new Date(dateString).toLocaleDateString('en-GB')
  }

  const getOrderActions = order => {
    const actions = []

    actions.push({
      label: 'Details',
      icon: <Search size={16} />,
      onClick: () => setDetailsOpen(true),
      color: 'primary'
    })





    if (order.status === 'completed' && !order.has_review) {
      actions.push({
        label: 'Review',
        icon: <Star size={16} />,
        onClick: () => handleOpenReviewDialog(order.id),
        color: 'success'
      })
    }

    if (order.status === 'completed' && order.has_deliverables) {
      actions.push({
        label: 'Download',
        icon: <Download size={16} />,
        onClick: () => window.open(order.deliverables_url, '_blank'),
        color: 'info'
      })
    }

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
      columnHelper.accessor('title', {
        header: 'Service',
        cell: ({ row }) => <Typography>{row.original.title || 'Custom Service'}</Typography>
      }),
      columnHelper.accessor('provider_name', {
        header: 'Provider',
        cell: ({ row }) => (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Avatar
              src={row.original.provider_avatar}
              alt={row.original.provider_name}
              sx={{ width: 34, height: 34 }}
            />
            <Typography variant='body2' fontWeight={500} color='text.primary'>
              {row.original.provider_name}
            </Typography>
          </Box>
        )
      }),
      columnHelper.accessor('created_at', {
        header: 'Date',
        cell: ({ row }) => <Typography>{formatDate(row.original.created_at)}</Typography>
      }),
      columnHelper.accessor('amount', {
        header: 'Amount',
        cell: ({ row }) => (
          <Typography align='center' fontWeight={600} color='primary.main'>
            {row.original.amount.toFixed(2)} DZ
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
      service: row.original.title,
      provider: row.original.provider_name,
      date: formatDate(row.original.created_at),
      amount: row.original.amount.toFixed(2),
      status: row.original.status
    }))
  }, [table])

  // Loading state
  if (loading && orders.length === 0) {
    return (
      <Card>
        <CardContent className='flex justify-center items-center p-6'>
          <CircularProgress />
          <Typography className='ml-2'>Loading service orders...</Typography>
        </CardContent>
      </Card>
    )
  }

  // Order details component
  const ServiceOrderDetails = ({ order }) => (
    <Box sx={{ mt: 2 }}>
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Typography variant='subtitle2'>Service Provider</Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 1 }}>
            <Avatar
              src={order.provider_avatar}
              alt={order.provider_name}
              sx={{ width: 50, height: 50 }}
              variant='rounded'
            />
            <Box>
              <Typography variant='body1' fontWeight={500}>
                {order.provider_name}
              </Typography>
              <Typography variant='body2' color='textSecondary'>
                {order.service_name}
              </Typography>
            </Box>
          </Box>
        </Grid>
        <Grid item xs={12} md={6}>
          <Typography variant='subtitle2'>Order Information</Typography>
          <Box sx={{ mt: 1 }}>
            <Typography variant='body2'>
              <strong>Order ID:</strong> #{order.id}
            </Typography>
            <Typography variant='body2'>
              <strong>Status:</strong> {order.status}
            </Typography>
            <Typography variant='body2'>
              <strong>Created:</strong> {formatDate(order.created_at)}
            </Typography>
            <Typography variant='body2'>
              <strong>Amount:</strong> {order.amount.toFixed(2)} DZ
            </Typography>
          </Box>
        </Grid>
        <Grid item xs={12}>
          <Typography variant='subtitle2'>Service Details</Typography>
          <Box sx={{ mt: 1 }}>
            <Typography variant='body1' fontWeight={500}>
              {order.title}
            </Typography>
            <Typography variant='body2' color='textSecondary' sx={{ mt: 1 }}>
              This is a {order.service_name} service. Additional details would be displayed here.
            </Typography>
          </Box>
        </Grid>
      </Grid>
    </Box>
  )

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
      <CardHeader title='Service Orders' className='pbe-4' />
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
              <TableRow key={headerGroup.id} sx={{ background: '#fafbfc' }}>
                {headerGroup.headers.map(header => (
                  <TableCell
                    key={header.id}
                    align={header.column.columnDef.meta?.align || 'left'}
                    className={classnames('is-full-width font-medium')}
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
                    ? 'No service orders found.'
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
                    <TableCell key={cell.id} align={cell.column.columnDef.meta?.align || 'left'} sx={{ py: 1.5 }}>
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
      <Dialog open={detailsOpen} onClose={() => setDetailsOpen(false)} maxWidth='md' fullWidth>
        <DialogTitle>Service Order Details</DialogTitle>
        <DialogContent>{selectedOrder && <ServiceOrderDetails order={selectedOrder} />}</DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailsOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Message Dialog */}
      <Dialog open={messageDialog.open} onClose={handleCloseMessageDialog} maxWidth='sm' fullWidth>
        <DialogTitle>Send Message</DialogTitle>
        <DialogContent>
          <Typography variant='body2' color='textSecondary' sx={{ mb: 2 }}>
            Send a message to the service provider about this order.
          </Typography>
          <TextareaAutosize
            minRows={5}
            placeholder='Type your message here...'
            style={{
              width: '100%',
              padding: '12px',
              borderRadius: '4px',
              border: '1px solid #ccc',
              fontFamily: 'inherit',
              fontSize: 'inherit'
            }}
            value={messageText}
            onChange={e => setMessageText(e.target.value)}
          />
          <Box sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
            <Button
              variant='outlined'
              startIcon={<Paperclip size={18} />}
              sx={{ mr: 2 }}
              onClick={() => alert('File upload functionality would go here')}
            >
              Attach File
            </Button>
            <Typography variant='caption' color='textSecondary'>
              Max file size: 10MB
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseMessageDialog}>Cancel</Button>
          <Button
            variant='contained'
            startIcon={<Send size={18} />}
            onClick={handleSendMessage}
            disabled={!messageText.trim()}
          >
            Send Message
          </Button>
        </DialogActions>
      </Dialog>

      {/* Cancel Dialog */}
      <Dialog open={cancelDialog.open} onClose={handleCloseCancelDialog} maxWidth='xs' fullWidth>
        <DialogTitle>Cancel Order</DialogTitle>
        <DialogContent>
          <Typography sx={{ mb: 2 }}>
            Are you sure you want to cancel this order? This action cannot be undone.
          </Typography>
          <Typography variant='body2' color='textSecondary'>
            Cancelling will notify the service provider and update the order status.
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

      {/* Review Dialog */}
      <Dialog open={reviewDialog.open} onClose={handleCloseReviewDialog} maxWidth='sm' fullWidth>
        <DialogTitle>Leave a Review</DialogTitle>
        <DialogContent>
          <Typography variant='body2' color='textSecondary' sx={{ mb: 3 }}>
            Please rate your experience with this service and provider.
          </Typography>
          <Box sx={{ mb: 3, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Typography variant='body1' sx={{ mb: 1 }}>
              Rating
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              {[1, 2, 3, 4, 5].map(star => (
                <IconButton
                  key={star}
                  onClick={() => handleReviewChange('rating', star)}
                  color={reviewData.rating >= star ? 'warning' : 'default'}
                >
                  <Star size={24} />
                </IconButton>
              ))}
            </Box>
          </Box>
          <Typography variant='body1' sx={{ mb: 1 }}>
            Comment
          </Typography>
          <TextareaAutosize
            minRows={4}
            placeholder='Share your experience with this service...'
            style={{
              width: '100%',
              padding: '12px',
              borderRadius: '4px',
              border: '1px solid #ccc',
              fontFamily: 'inherit',
              fontSize: 'inherit'
            }}
            value={reviewData.comment}
            onChange={e => handleReviewChange('comment', e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseReviewDialog}>Cancel</Button>
          <Button
            variant='contained'
            onClick={handleSubmitReview}
            disabled={!reviewData.comment.trim() || reviewData.rating < 1}
          >
            Submit Review
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

export default ServiceClientOrders
