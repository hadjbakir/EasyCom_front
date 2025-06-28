"use client"

// React Imports
import { useState, useEffect, useCallback, useMemo } from "react"

// Next Imports
import { useSession } from "next-auth/react"

// MUI Imports
import Card from "@mui/material/Card"
import CardHeader from "@mui/material/CardHeader"
import CardContent from "@mui/material/CardContent"
import Typography from "@mui/material/Typography"
import Button from "@mui/material/Button"
import IconButton from "@mui/material/IconButton"
import MenuItem from "@mui/material/MenuItem"
import Table from "@mui/material/Table"
import TableBody from "@mui/material/TableBody"
import TableCell from "@mui/material/TableCell"
import TableContainer from "@mui/material/TableContainer"
import TableHead from "@mui/material/TableHead"
import TableRow from "@mui/material/TableRow"
import TablePagination from "@mui/material/TablePagination"
import CircularProgress from "@mui/material/CircularProgress"
import Alert from "@mui/material/Alert"
import Dialog from "@mui/material/Dialog"
import DialogTitle from "@mui/material/DialogTitle"
import DialogContent from "@mui/material/DialogContent"
import DialogActions from "@mui/material/DialogActions"
import Avatar from "@mui/material/Avatar"
import FormControl from "@mui/material/FormControl"
import Select from "@mui/material/Select"

// Third-party Imports
import classnames from "classnames"
import { rankItem } from "@tanstack/match-sorter-utils"
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
  getSortedRowModel,
} from "@tanstack/react-table"

// Component Imports
import CustomTextField from "@core/components/mui/TextField"
import OrderTableFilters from "./OrderTableFilters"
import ProductOrderDetails from "@/views/components/ProductOrderDetails"

// API Imports
import { getSupplierOrders, updateOrderStatus, getSuppliersByUser } from "@/libs/api/productOrders"

// Style Imports
import tableStyles from "@core/styles/table.module.css"

/**
 * Fuzzy filter function for table search
 */
const fuzzyFilter = (row, columnId, value, addMeta) => {
  // Skip certain columns from global search
  if (columnId === "action") return true

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

  return <CustomTextField {...props} value={value} onChange={(e) => setValue(e.target.value)} />
}

// Order status object for styling
const orderStatusObj = {
  pending: "warning",
  processing: "info",
  delivered: "success",
}

// Column Definitions
const columnHelper = createColumnHelper()

const STORAGE_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";
const buildImageUrl = (picture) => {
  if (!picture) return "/images/avatars/default.png";
  if (picture.startsWith("http")) return picture;
  const cleanPath = picture.replace(/^(storage\/|public\/)/, "");
  return `${STORAGE_BASE_URL}/storage/${cleanPath}`;
};

/**
 * Retourne l'URL absolue de la première image du produit, ou un placeholder si absent.
 */
function getProductImageUrl(product) {
  if (!product) return '/images/placeholder.jpg';
  const picture = product.pictures?.[0]?.picture;
  if (!picture) return '/images/placeholder.jpg';
  if (picture.startsWith('http')) return picture;
  const cleanPath = picture.replace(/^(storage\/|public\/)/, '');
  const base = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';
  return `${base}/storage/${cleanPath}`;
}

/**
 * ProductSupplierOrders component - Displays a table of supplier orders
 */
const ProductSupplierOrders = () => {
  // States
  const [orders, setOrders] = useState([])
  const [filteredData, setFilteredData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const [globalFilter, setGlobalFilter] = useState("")
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [detailsOpen, setDetailsOpen] = useState(false)
  const [statusUpdatingId, setStatusUpdatingId] = useState(null)

  // Hooks
  const { data: session, status } = useSession()

  // Memoize onChange for DebouncedInput
  const handleSearchChange = useCallback((value) => setGlobalFilter(String(value)), [])

  // Fetch orders data
  useEffect(() => {
    const fetchOrders = async () => {
      if (status !== "authenticated" || !session?.user?.id) {
        return
      }

      setError(null)
      setLoading(true)

      try {
        const suppliers = await getSuppliersByUser(session.user.id)

        if (!suppliers || suppliers.length === 0) {
          setOrders([])
          setFilteredData([])
          setLoading(false)
          return
        }

        let allOrders = []
        for (const supplier of suppliers) {
          try {
            const data = await getSupplierOrders(supplier.id)
            if (Array.isArray(data)) {
              allOrders = allOrders.concat(data)
            }
          } catch (err) {
            if (process.env.NODE_ENV !== "production") {
              console.error(`Failed to fetch orders for supplier ${supplier.id}:`, err)
            }
          }
        }

        setOrders(allOrders)
        setFilteredData(allOrders)

        if (process.env.NODE_ENV !== "production") {
          console.log("Orders fetched:", allOrders)
        }
      } catch (err) {
        if (process.env.NODE_ENV !== "production") {
          console.error("Failed to fetch data:", err.message, err.response?.data)
        }

        setError(
          err.response?.status === 401
            ? "Unauthorized. Please log in again."
            : err.response?.status === 404
              ? "No orders found for this user."
              : `Failed to load data: ${err.message}`,
        )
      } finally {
        setLoading(false)
      }
    }

    if (status !== "loading") {
      fetchOrders()
    }
  }, [session?.user?.id, status])

  // Handle order status update
  const handleStatusUpdate = async (orderId, newStatus) => {
    setStatusUpdatingId(orderId)
    setError(null)
    setSuccess(null)

    try {
      await updateOrderStatus(orderId, newStatus)

      setOrders((prev) => prev.map((order) => (order.id === orderId ? { ...order, status: newStatus } : order)))

      setFilteredData((prev) => prev.map((order) => (order.id === orderId ? { ...order, status: newStatus } : order)))

      setSuccess("Order status updated successfully")

      if (process.env.NODE_ENV !== "production") {
        console.log("Order status updated:", { orderId, newStatus })
      }

      setTimeout(() => setSuccess(null), 3000)
    } catch (err) {
      if (process.env.NODE_ENV !== "production") {
        console.error("Failed to update order status:", err)
      }

      setError("Failed to update order status. Please try again.")
    } finally {
      setStatusUpdatingId(null)
    }
  }

  // Define table columns
  const columns = useMemo(
    () => [
      columnHelper.accessor("id", {
        header: "Order ID",
        cell: ({ row }) => <Typography>#{row.original.id}</Typography>,
      }),
      columnHelper.accessor("full_name", {
        header: "Client",
        cell: ({ row }) => <Typography>{row.original.full_name || "N/A"}</Typography>,
      }),
      columnHelper.accessor("order_products", {
        header: "Products",
        cell: ({ row }) => (
          <div className="flex flex-col gap-2">
            {row.original.order_products?.map((op) => (
              <div key={op.id} className="flex items-center gap-2">
                <Avatar
                  src={getProductImageUrl(op.product)}
                  alt={op.product?.name || `Product #${op.product_id} (deleted)`}
                  sx={{ width: 24, height: 24 }}
                  onError={e => { e.target.src = '/images/placeholder.jpg'; }}
                />
                <Typography variant="body2">
                  {op.product?.name || `Product #${op.product_id} (deleted)`}
                </Typography>
              </div>
            )) || <Typography variant="body2" color="text.secondary">No products</Typography>}
          </div>
        ),
      }),
      columnHelper.accessor("quantity", {
        header: "Quantity",
        cell: ({ row }) => (
          <Typography>{row.original.order_products?.reduce((sum, op) => sum + (op.quantity || 0), 0) || 0}</Typography>
        ),
      }),
      columnHelper.accessor("total_price", {
        header: "Total Price",
        cell: ({ row }) => (
          <Typography>
            {row.original.order_products?.reduce((sum, op) => sum + op.unit_price * op.quantity, 0).toFixed(2) ||
              "0.00"}{" "}
            DZ
          </Typography>
        ),
      }),
      columnHelper.accessor("status", {
        header: "Status",
        cell: ({ row }) => {
          const status = row.original.status?.toLowerCase() || "pending"

          return (
            <FormControl size="small" fullWidth>
              <Select
                value={status}
                onChange={(e) => handleStatusUpdate(row.original.id, e.target.value)}
                disabled={statusUpdatingId === row.original.id}
                className="capitalize"
              >
                <MenuItem value="pending">Pending</MenuItem>
                <MenuItem value="processing">Processing</MenuItem>
                <MenuItem value="delivered">Delivered</MenuItem>
              </Select>
            </FormControl>
          )
        },
      }),
      columnHelper.accessor("created_at", {
        header: "Date",
        cell: ({ row }) => (
          <Typography>
            {row.original.created_at ? new Date(row.original.created_at).toLocaleDateString("en-GB") : "N/A"}
          </Typography>
        ),
      }),
      columnHelper.accessor("action", {
        header: "Action",
        cell: ({ row }) => (
          <div className="flex items-center">
            <IconButton
              onClick={() => {
                setSelectedOrder(row.original)
                setDetailsOpen(true)
              }}
              aria-label="View order details"
            >
              <i className="tabler-eye text-textSecondary" />
            </IconButton>
          </div>
        ),
        enableSorting: false,
      }),
    ],
    [statusUpdatingId],
  )

  // Initialize table
  const table = useReactTable({
    data: filteredData,
    columns,
    filterFns: { fuzzy: fuzzyFilter },
    state: { globalFilter },
    initialState: { pagination: { pageSize: 10 } },
    globalFilterFn: fuzzyFilter,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues,
    getFacetedMinMaxValues: getFacetedMinMaxValues(),
  })

  // Loading state
  if (loading || status === "loading") {
    return (
      <Card>
        <CardContent className="flex justify-center items-center p-6">
          <CircularProgress />
          <Typography className="ml-2">Loading orders...</Typography>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      {success && (
        <Alert severity="success" className="m-4">
          {success}
        </Alert>
      )}
      {error && (
        <Alert severity="error" className="m-4">
          {error}
        </Alert>
      )}
      <CardHeader title="Received Product Orders" className="pbe-4" />
      <OrderTableFilters setData={setFilteredData} tableData={orders} />
      <div className="flex justify-between flex-col items-start md:flex-row md:items-center p-6 border-bs gap-4">
        <CustomTextField
          select
          value={table.getState().pagination.pageSize}
          onChange={(e) => table.setPageSize(Number(e.target.value))}
          className="max-sm:is-full sm:is-[70px]"
        >
          <MenuItem value="10">10</MenuItem>
          <MenuItem value="25">25</MenuItem>
          <MenuItem value="50">50</MenuItem>
        </CustomTextField>
        <div className="flex flex-col sm:flex-row max-sm:is-full items-start sm:items-center gap-4">
          <DebouncedInput
            value={globalFilter ?? ""}
            onChange={handleSearchChange}
            placeholder="Search Orders"
            className="max-sm:is-full"
          />
          <Button
            color="secondary"
            variant="tonal"
            startIcon={<i className="tabler-upload" />}
            className="max-sm:is-full"
          >
            Export
          </Button>
          <Button
            variant="contained"
            startIcon={<i className="tabler-refresh" />}
            onClick={() => {
              setLoading(true)
              setOrders([])
              setFilteredData([])
              setTimeout(() => {
                const fetchOrders = async () => {
                  try {
                    const suppliers = await getSuppliersByUser(session.user.id)
                    let allOrders = []
                    for (const supplier of suppliers) {
                      try {
                        const data = await getSupplierOrders(supplier.id)
                        if (Array.isArray(data)) {
                          allOrders = allOrders.concat(data)
                        }
                      } catch (err) {}
                    }
                    setOrders(allOrders)
                    setFilteredData(allOrders)
                  } catch (err) {
                    setError("Failed to refresh orders. Please try again.")
                  } finally {
                    setLoading(false)
                  }
                }
                fetchOrders()
              }, 500)
            }}
            className="max-sm:is-full"
          >
            Refresh
          </Button>
        </div>
      </div>
      <TableContainer>
        <Table className={tableStyles.table}>
          <TableHead>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableCell
                    key={header.id}
                    className={classnames("is-full-width font-medium", {
                      "no-wrap": header.column.id !== "order_products",
                    })}
                  >
                    <div
                      className={classnames("flex items-center gap-2", {
                        "cursor-pointer select-none": header.column.getCanSort(),
                      })}
                      onClick={header.column.getToggleSortingHandler()}
                    >
                      {flexRender(header.column.columnDef.header, header.getContext())}
                      {header.column.getCanSort() && (
                        <i
                          className={classnames("tabler-arrows-sort text-[18px]", {
                            "tabler-chevron-up": header.column.getIsSorted() === "asc",
                            "tabler-chevron-down": header.column.getIsSorted() === "desc",
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
                <TableCell colSpan={table.getVisibleFlatColumns().length} className="text-center">
                  {orders.length === 0
                    ? "No orders found."
                    : "No matching orders found. Try adjusting the filters or search."}
                </TableCell>
              </TableRow>
            </TableBody>
          ) : (
            <TableBody>
              {table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  hover
                  className={classnames({
                    "cursor-pointer": true,
                  })}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      key={cell.id}
                      className={classnames({
                        "no-wrap": cell.column.id !== "order_products",
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
        component="div"
        count={table.getFilteredRowModel().rows.length}
        rowsPerPage={table.getState().pagination.pageSize}
        page={table.getState().pagination.pageIndex}
        onPageChange={(_, page) => {
          table.setPageIndex(page)
        }}
        onRowsPerPageChange={(e) => {
          table.setPageSize(Number(e.target.value))
        }}
        rowsPerPageOptions={[10, 25, 50]}
      />
      <Dialog open={detailsOpen} onClose={() => setDetailsOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Order Details</DialogTitle>
        <DialogContent>{selectedOrder && <ProductOrderDetails order={selectedOrder} />}</DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailsOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Card>
  )
}

export default ProductSupplierOrders
