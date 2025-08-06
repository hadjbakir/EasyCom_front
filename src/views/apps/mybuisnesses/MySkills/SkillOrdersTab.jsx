'use client'

// React Imports
import { useState, useEffect, useCallback, useMemo } from 'react'

// MUI Imports
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
import FormControl from '@mui/material/FormControl'
import Select from '@mui/material/Select'
import Menu from '@mui/material/Menu'
import Snackbar from '@mui/material/Snackbar'
import Grid from '@mui/material/Grid'
import TextField from '@mui/material/TextField'
import InputAdornment from '@mui/material/InputAdornment'
import ListItemIcon from '@mui/material/ListItemIcon'
import ListItemText from '@mui/material/ListItemText'
import Paper from '@mui/material/Paper'
import InputLabel from '@mui/material/InputLabel'

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
  RefreshCw,
  Eye,
  MoreVertical,
  XCircle,
  MessageSquare,
  FileText,
  AlertCircle,
  Clock,
  CheckCircle,
  Filter,
  Calendar,
  Search
} from 'lucide-react'

import CustomTextField from '@core/components/mui/TextField'
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
  { value: 'in-progress', label: 'In Progress', color: 'info', icon: <RefreshCw size={16} /> },
  { value: 'completed', label: 'Completed', color: 'success', icon: <CheckCircle size={16} /> },
  { value: 'cancelled', label: 'Cancelled', color: 'error', icon: <XCircle size={16} /> }
]

// Get status chip component
const getStatusChip = status => {
  const normalizedStatus = status.replace(/-/g, '')
  const opt = statusOptions.find(o => o.value === normalizedStatus) || { label: status, color: 'default', icon: null }

  return <Chip icon={opt.icon} label={opt.label} color={opt.color} size='small' variant='outlined' />
}

// Column Definitions
const columnHelper = createColumnHelper()

/**
 * SkillOrdersTab component - Displays a table of service orders for a service provider
 */
const SkillOrdersTab = ({ profile, skillId }) => {
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
  const [updatingOrderId, setUpdatingOrderId] = useState(null)
  const [actionMenuAnchor, setActionMenuAnchor] = useState(null)
  const [actionOrderId, setActionOrderId] = useState(null)
  const [messageDialog, setMessageDialog] = useState({ open: false, orderId: null })
  const [messageText, setMessageText] = useState('')
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' })
  const [statusFilter, setStatusFilter] = useState('all')
  const [filterDialog, setFilterDialog] = useState(false)

  const [filterOptions, setFilterOptions] = useState({
    dateFrom: '',
    dateTo: '',
    priceMin: '',
    priceMax: ''
  })

  const [searchTerm, setSearchTerm] = useState('')

  // Memoize onChange for DebouncedInput
  const handleSearchChange = useCallback(value => {
    setSearchTerm(value)
    setGlobalFilter(String(value))
  }, [])

  // Apply global filter manually
  useEffect(() => {
    if (!searchTerm) {
      setFilteredData(orders)

      return
    }

    const filtered = orders.filter(order => {
      const searchValue = searchTerm.toLowerCase()

      // Check ID
      if (`ORD-${order.id}`.toLowerCase().includes(searchValue)) return true

      // Check client name
      if ((order.user?.full_name || '').toLowerCase().includes(searchValue)) return true

      // Check project title
      if ((order.title || '').toLowerCase().includes(searchValue)) return true

      // Check status
      if ((order.status || '').toLowerCase().includes(searchValue)) return true

      // Check date
      if (order.created_at) {
        const formattedDate = new Date(order.created_at).toLocaleDateString('en-GB')

        if (formattedDate.toLowerCase().includes(searchValue)) return true
      }

      // Check amount
      if (order.total_amount && order.total_amount.toString().includes(searchValue)) return true

      return false
    })

    setFilteredData(filtered)
  }, [searchTerm, orders])

  // Fetch orders data
  const fetchOrders = useCallback(async () => {
    if (!profile?.id) {
      console.warn('SkillOrdersTab: No profile.id, skipping fetch')
      setError('No service provider profile found. Please create a profile first.')
      setLoading(false)

      return
    }

    setLoading(true)
    setError(null)
    console.log('SkillOrdersTab: Fetching orders for service_provider_id=', profile.id)

    try {
      const response = await apiClient.get(`/service-orders/service-provider/${profile.id}`, {
        timeout: 10000
      })

      console.log('SkillOrdersTab: API response=', response.data)
      const fetchedOrders = Array.isArray(response.data.data) ? response.data.data : []

      setOrders(fetchedOrders)
      setFilteredData(fetchedOrders)
    } catch (err) {
      console.error('SkillOrdersTab: Fetch error:', err)

      const errorMessage =
        err.response?.status === 403
          ? 'You are not authorized to view these orders'
          : err.response?.data?.message || 'Failed to fetch orders'

      setError(errorMessage)
    } finally {
      setLoading(false)
      console.log('SkillOrdersTab: Fetch complete, loading=', false)
    }
  }, [profile])

  useEffect(() => {
    console.log('SkillOrdersTab: profile=', profile, 'skillId=', skillId)
    fetchOrders()
  }, [profile, fetchOrders])

  // Apply status filter
  useEffect(() => {
    if (statusFilter === 'all') {
      // Apply only search filter
      if (searchTerm) {
        const filtered = orders.filter(order => {
          const searchValue = searchTerm.toLowerCase()

          return (
            `ORD-${order.id}`.toLowerCase().includes(searchValue) ||
            (order.user?.full_name || '').toLowerCase().includes(searchValue) ||
            (order.title || '').toLowerCase().includes(searchValue)
          )
        })

        setFilteredData(filtered)
      } else {
        setFilteredData(orders)
      }

      return
    }

    // Apply both status and search filters
    const filtered = orders.filter(order => {
      const matchesStatus = order.status === statusFilter

      if (!searchTerm) return matchesStatus

      const searchValue = searchTerm.toLowerCase()

      const matchesSearch =
        `ORD-${order.id}`.toLowerCase().includes(searchValue) ||
        (order.user?.full_name || '').toLowerCase().includes(searchValue) ||
        (order.title || '').toLowerCase().includes(searchValue)

      return matchesStatus && matchesSearch
    })

    setFilteredData(filtered)
  }, [statusFilter, searchTerm, orders])

  // Apply skill filter
  useEffect(() => {
    if (!skillId) {
      return
    }

    const filtered = orders.filter(order => {
      const matchesSkill = order.skill_id === Number.parseInt(skillId, 10)

      if (!searchTerm && statusFilter === 'all') return matchesSkill

      const matchesStatus = statusFilter === 'all' || order.status === statusFilter

      if (!searchTerm) return matchesSkill && matchesStatus

      const searchValue = searchTerm.toLowerCase()

      const matchesSearch =
        `ORD-${order.id}`.toLowerCase().includes(searchValue) ||
        (order.user?.full_name || '').toLowerCase().includes(searchValue) ||
        (order.title || '').toLowerCase().includes(searchValue)

      return matchesSkill && matchesStatus && matchesSearch
    })

    setFilteredData(filtered)
  }, [skillId, statusFilter, searchTerm, orders])

  const handleStatusChange = async (orderId, newStatus) => {
    setUpdatingOrderId(orderId)

    try {
      const response = await apiClient.patch(`/service-orders/${orderId}/status`, { status: newStatus })

      setOrders(prev => prev.map(order => (order.id === orderId ? { ...order, status: newStatus } : order)))
      setFilteredData(prev => prev.map(order => (order.id === orderId ? { ...order, status: newStatus } : order)))

      setSnackbar({
        open: true,
        message: 'Status updated successfully',
        severity: 'success'
      })
    } catch (err) {
      console.error('Status update error:', err)

      const errorMessage =
        err.response?.status === 403
          ? 'You are not authorized to update this order'
          : err.response?.data?.message || 'Failed to update status'

      setSnackbar({
        open: true,
        message: errorMessage,
        severity: 'error'
      })
    } finally {
      setUpdatingOrderId(null)
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

  const handleViewOrder = () => {
    const order = orders.find(o => o.id === actionOrderId)

    if (order) {
      setSelectedOrder(order)
      setDetailsOpen(true)
    }

    handleActionMenuClose()
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

  const handleDownloadDetails = () => {
    console.log('Download details for order:', actionOrderId)
    handleActionMenuClose()
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
      const totalPrice = Number.parseFloat(order.total_amount) || 0

      if (filterOptions.priceMin && totalPrice < Number.parseFloat(filterOptions.priceMin)) return false
      if (filterOptions.priceMax && totalPrice > Number.parseFloat(filterOptions.priceMax)) return false

      // Apply existing filters
      const matchesStatus = statusFilter === 'all' || order.status === statusFilter
      const matchesSkill = !skillId || order.skill_id === Number.parseInt(skillId, 10)

      const matchesSearch =
        !searchTerm ||
        `ORD-${order.id}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (order.user?.full_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (order.title || '').toLowerCase().includes(searchTerm.toLowerCase())

      return matchesStatus && matchesSkill && matchesSearch
    })

    setFilteredData(filtered)
    handleCloseFilterDialog()
  }

  const handleResetFilters = () => {
    setFilterOptions({
      dateFrom: '',
      dateTo: '',
      priceMin: '',
      priceMax: ''
    })

    // Reset to base filters
    const baseFiltered = orders.filter(order => {
      const matchesStatus = statusFilter === 'all' || order.status === statusFilter
      const matchesSkill = !skillId || order.skill_id === Number.parseInt(skillId, 10)

      const matchesSearch =
        !searchTerm ||
        `ORD-${order.id}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (order.user?.full_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (order.title || '').toLowerCase().includes(searchTerm.toLowerCase())

      return matchesStatus && matchesSkill && matchesSearch
    })

    setFilteredData(baseFiltered)
  }

  const getOrderActions = order => {
    const actions = [
      {
        label: 'View Details',
        icon: <Eye size={16} />,
        onClick: () => {
          setSelectedOrder(order)
          setDetailsOpen(true)
        },
        color: 'primary'
      }
    ]

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
        cell: ({ row }) => <Typography fontWeight={600}>ORD-{row.original.id}</Typography>
      }),
      columnHelper.accessor('user', {
        header: 'Client',
        cell: ({ row }) => (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Avatar
              src={row.original.user?.picture || '/images/avatars/default.png'}
              alt={row.original.user?.full_name || 'Unknown'}
              sx={{ width: 34, height: 34 }}
            />
            <Typography variant='body2' fontWeight={500} color='text.primary'>
              {row.original.user?.full_name || 'Unknown'}
            </Typography>
          </Box>
        )
      }),
      columnHelper.accessor('title', {
        header: 'Project',
        cell: ({ row }) => <Typography>{row.original.title}</Typography>
      }),
      columnHelper.accessor('created_at', {
        header: 'Date',
        cell: ({ row }) => (
          <Typography>
            {row.original.created_at ? new Date(row.original.created_at).toLocaleDateString('en-GB') : '-'}
          </Typography>
        )
      }),
      columnHelper.accessor('deadline', {
        header: 'Deadline',
        cell: ({ row }) => (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Calendar size={16} />
            <Typography>
              {row.original.deadline ? new Date(row.original.deadline).toLocaleDateString('en-GB') : 'Not specified'}
            </Typography>
          </Box>
        )
      }),
      columnHelper.accessor('total_amount', {
        header: 'Amount',
        cell: ({ row }) => (
          <Typography align='center' fontWeight={600} color='primary.main'>
            {row.original.total_amount ? `${Number.parseFloat(row.original.total_amount).toFixed(2)} DZ` : '-'}
          </Typography>
        ),
        meta: { align: 'center' }
      }),
      columnHelper.accessor('status', {
        header: 'Status',
        cell: ({ row }) => (
          <FormControl
            size='small'
            sx={{ minWidth: 120 }}
            disabled={updatingOrderId === row.original.id}
            onClick={e => e.stopPropagation()}
          >
            <Select
              value={row.original.status}
              onChange={e => handleStatusChange(row.original.id, e.target.value)}
              displayEmpty
              renderValue={selected => (
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {getStatusChip(selected)}
                </Box>
              )}
              sx={{ '& .MuiSelect-select': { display: 'flex', justifyContent: 'center' } }}
            >
              {statusOptions.map(option => (
                <MenuItem key={option.value} value={option.value}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography color={`${option.color}.main`} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {option.icon}
                      {option.label}
                    </Typography>
                  </Box>
                </MenuItem>
              ))}
            </Select>
            {updatingOrderId === row.original.id && <CircularProgress size={16} sx={{ ml: 1 }} />}
          </FormControl>
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
    [updatingOrderId]
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
      id: `ORD-${row.original.id}`,
      client: row.original.user?.full_name || 'Unknown',
      project: row.original.title,
      date: row.original.created_at ? new Date(row.original.created_at).toLocaleDateString('en-GB') : '-',
      deadline: row.original.deadline ? new Date(row.original.deadline).toLocaleDateString('en-GB') : '-',
      amount: row.original.total_amount ? `${Number.parseFloat(row.original.total_amount).toFixed(2)} DZ` : '-',
      status: row.original.status
    }))
  }, [table])

  // Order details component
  const OrderDetails = ({ order }) => (
    <Box sx={{ mt: 2 }}>
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Typography variant='subtitle2'>Client Information</Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 1 }}>
            <Avatar
              src={order.user?.picture || '/images/avatars/default.png'}
              alt={order.user?.full_name || 'Unknown'}
              sx={{ width: 50, height: 50 }}
            />
            <Box>
              <Typography variant='body1' fontWeight={500}>
                {order.user?.full_name || 'Unknown'}
              </Typography>
              <Typography variant='body2' color='textSecondary'>
                {order.user?.email || 'No email provided'}
              </Typography>
            </Box>
          </Box>
        </Grid>
        <Grid item xs={12} md={6}>
          <Typography variant='subtitle2'>Order Information</Typography>
          <Box sx={{ mt: 1 }}>
            <Typography variant='body2'>
              <strong>Order ID:</strong> ORD-{order.id}
            </Typography>
            <Typography variant='body2'>
              <strong>Status:</strong> {order.status}
            </Typography>
            <Typography variant='body2'>
              <strong>Created:</strong>{' '}
              {order.created_at ? new Date(order.created_at).toLocaleDateString('en-GB') : '-'}
            </Typography>
            <Typography variant='body2'>
              <strong>Deadline:</strong>{' '}
              {order.deadline ? new Date(order.deadline).toLocaleDateString('en-GB') : 'Not specified'}
            </Typography>
            <Typography variant='body2'>
              <strong>Amount:</strong>{' '}
              {order.total_amount ? `${Number.parseFloat(order.total_amount).toFixed(2)} DZ` : '-'}
            </Typography>
          </Box>
        </Grid>
        <Grid item xs={12}>
          <Typography variant='subtitle2'>Project Details</Typography>
          <Box sx={{ mt: 1 }}>
            <Typography variant='body1' fontWeight={500}>
              {order.title}
            </Typography>
            <Typography variant='body2' color='textSecondary' sx={{ mt: 1 }}>
              {order.description || 'No description provided.'}
            </Typography>
          </Box>
        </Grid>
      </Grid>
    </Box>
  )

  if (!profile?.id) {
    return (
      <Box>
        <Box className='text-center py-10'>
          <AlertCircle size={48} className='mx-auto mb-4 text-textSecondary' />
          <Typography variant='h6'>No Profile Found</Typography>
          <Typography variant='body2' color='textSecondary' className='mt-1'>
            Please create a service provider profile to view orders.
          </Typography>
        </Box>
      </Box>
    )
  }

  if (loading && orders.length === 0) {
    return (
      <Box className='flex justify-center items-center p-6'>
        <CircularProgress />
        <Typography className='ml-2'>Loading orders...</Typography>
      </Box>
    )
  }

  return (
    <Box>
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

      <Grid container spacing={3} className='mb-6'>
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            placeholder='Search'
            value={searchTerm}
            onChange={e => handleSearchChange(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position='start'>
                  <Search size={20} />
                </InputAdornment>
              )
            }}
          />
        </Grid>
        <Grid item xs={12} md={3}>
          <FormControl fullWidth>
            <InputLabel id='status-filter-label'>Status</InputLabel>
            <Select
              labelId='status-filter-label'
              id='status-filter'
              value={statusFilter}
              label='Status'
              onChange={e => setStatusFilter(e.target.value)}
            >
              <MenuItem value='all'>All Orders</MenuItem>
              {statusOptions.map(option => (
                <MenuItem key={option.value} value={option.value}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography color={`${option.color}.main`} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {option.icon}
                      {option.label}
                    </Typography>
                  </Box>
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
      </Grid>

      <Box className='flex justify-between flex-col items-start md:flex-row md:items-center mb-4 gap-4'>
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
          <Button
            variant='outlined'
            startIcon={<Filter size={18} />}
            onClick={handleOpenFilterDialog}
            className='max-sm:is-full'
          >
            Filter
          </Button>
        </div>
      </Box>

      {filteredData.length === 0 ? (
        <Box className='text-center py-10'>
          <AlertCircle size={48} className='mx-auto mb-4 text-textSecondary' />
          <Typography variant='h6'>No Orders Found</Typography>
          <Typography variant='body2' color='textSecondary' className='mt-1'>
            {searchTerm || statusFilter !== 'all' || skillId
              ? "Try adjusting your search or filter to find what you're looking for."
              : "You don't have any orders yet. Orders will appear here when clients request your services."}
          </Typography>
        </Box>
      ) : (
        <Paper elevation={0} variant='outlined'>
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
                        className={classnames('is-full-width font-medium')}
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
                      <TableCell key={cell.id} align={cell.column.columnDef.meta?.align || 'left'} sx={{ py: 1.5 }}>
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
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
        </Paper>
      )}

      {/* Order Details Dialog */}
      <Dialog open={detailsOpen} onClose={() => setDetailsOpen(false)} maxWidth='md' fullWidth>
        <DialogTitle>Order Details</DialogTitle>
        <DialogContent>{selectedOrder && <OrderDetails order={selectedOrder} />}</DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailsOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Message Dialog */}
      <Dialog open={messageDialog.open} onClose={handleCloseMessageDialog} maxWidth='sm' fullWidth>
        <DialogTitle>Send Message to Client</DialogTitle>
        <DialogContent>
          <Typography variant='body2' color='textSecondary' sx={{ mb: 2 }}>
            Send a message to the client about this order.
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
              <ListItemIcon>{action.icon}</ListItemIcon>
              <ListItemText>{action.label}</ListItemText>
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
    </Box>
  )
}

export default SkillOrdersTab
