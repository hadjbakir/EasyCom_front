'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'

import { useRouter } from 'next/navigation'

import { useSession } from 'next-auth/react'

// MUI Imports
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import IconButton from '@mui/material/IconButton'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import CircularProgress from '@mui/material/CircularProgress'
import Alert from '@mui/material/Alert'
import TablePagination from '@mui/material/TablePagination'
import MenuItem from '@mui/material/MenuItem'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'

// Third-party Imports
import classnames from 'classnames'
import { rankItem } from '@tanstack/match-sorter-utils'
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  getFilteredRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFacetedMinMaxValues,
  flexRender
} from '@tanstack/react-table'

// Component Imports
import AddProductDrawer from './AddProductDrawer'
import EditProductDrawer from './EditProductDrawer'
import ProductTableFilters from './ProductTableFilters'
import CustomTextField from '@core/components/mui/TextField'
import TablePaginationComponent from '@components/TablePaginationComponent'

// API Imports
import apiClient from '@/libs/api'

// Style Imports
import tableStyles from '@core/styles/table.module.css'

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

/**
 * ProductListTable component - Displays a paginated table of products for a specific store
 */
const ProductListTable = ({ storeId, initialProducts = [] }) => {
  // States
  const [productsData, setProductsData] = useState([])
  const [filteredProducts, setFilteredProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [addDrawerOpen, setAddDrawerOpen] = useState(false)
  const [editDrawerOpen, setEditDrawerOpen] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [successMessage, setSuccessMessage] = useState(null)
  const [globalFilter, setGlobalFilter] = useState('')
  const [rowSelection, setRowSelection] = useState({})
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false)
  const [productToDelete, setProductToDelete] = useState(null)

  // Hooks
  const { data: session } = useSession()
  const router = useRouter()

  // Clear success message after 3 seconds
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage(null)
      }, 3000)

      return () => clearTimeout(timer)
    }
  }, [successMessage])

  /**
   * Builds the URL for product images
   */
  const buildImageUrl = picture => {
    if (!picture) return null
    if (picture.startsWith('http')) return picture
    const cleanPath = picture.replace(/^(storage\/|public\/)/, '')

    return `${STORAGE_BASE_URL}/storage/${cleanPath}`
  }

  /**
   * Fetches products and categories data from the API
   */
  const fetchData = useCallback(async () => {
    if (!storeId || !session) return
    setLoading(true)

    try {
      console.log(`Fetching products for storeId: ${storeId}`)

      const [productsResponse, categoriesResponse] = await Promise.all([
        apiClient.get(`/suppliers/${storeId}/products`, {
          headers: { Authorization: `Bearer ${session.access_token}` }
        }),
        apiClient.get('/categories', {
          headers: { Authorization: `Bearer ${session.access_token}` }
        })
      ])

      const fetchedProducts = productsResponse.data.data || []

      console.log('Raw products response:', JSON.stringify(fetchedProducts, null, 2))

      const processedProducts = fetchedProducts.map(product => {
        const pictures =
          Array.isArray(product.pictures) && product.pictures.length > 0
            ? product.pictures.map(pic => ({
                ...pic,
                picture: buildImageUrl(pic.picture)
              }))
            : []

        return {
          ...product,
          id: product.id, // Ensure id is included
          name: product.name || 'Unknown',
          description: product.description || 'N/A',
          price: parseFloat(product.price) || 0,
          quantity: parseInt(product.quantity) || 0,
          minimum_quantity: parseInt(product.minimum_quantity) || 0,
          pictures
        }
      })

      setProductsData(processedProducts)
      setFilteredProducts(processedProducts) // Initialize filtered products
      console.log('Processed products:', JSON.stringify(processedProducts, null, 2))

      const fetchedCategories = categoriesResponse.data.data || []

      setCategories(fetchedCategories)
      console.log('Categories fetched:', fetchedCategories)

      setError(null)
    } catch (err) {
      console.error('Failed to fetch data:', {
        status: err.response?.status,
        message: err.response?.data?.message,
        errors: err.response?.data?.errors,
        url: err.config?.url,
        method: err.config?.method
      })
      setError('Failed to load products or categories. Please try again.')
    } finally {
      setLoading(false)
    }
  }, [storeId, session])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  /**
   * Handles product creation and updates the table
   */
  const handleProductCreated = useCallback(newProduct => {
    setProductsData(prev => {
      if (prev.some(product => product.id === newProduct.id)) {
        console.warn('Duplicate product ID detected:', newProduct.id)

        return prev
      }

      const updatedProducts = [...prev, newProduct]

      setFilteredProducts(updatedProducts) // Update filtered products

      return updatedProducts
    })
    setAddDrawerOpen(false)
    setRowSelection({}) // Clear selection after adding new product
  }, [])

  /**
   * Handles product updates and refreshes the table
   */
  const handleProductUpdated = useCallback(updatedProduct => {
    setProductsData(prev => {
      const updatedProducts = prev.map(product => (product.id === updatedProduct.id ? updatedProduct : product))

      setFilteredProducts(updatedProducts) // Update filtered products

      return updatedProducts
    })
    setEditDrawerOpen(false)
    setSelectedProduct(null)
    setRowSelection({}) // Clear selection after updating product
  }, [])

  /**
   * Opens the edit drawer for a product
   */
  const handleEdit = useCallback(
    product => {
      setSelectedProduct(product)
      setEditDrawerOpen(true)
    },
    [setSelectedProduct, setEditDrawerOpen]
  )

  /**
   * Deletes a product and updates the table
   */
  const handleDelete = useCallback(
    async productId => {
      try {
        await apiClient.delete(`/products/${productId}`, {
          headers: { Authorization: `Bearer ${session.access_token}` }
        })
        setProductsData(prev => {
          const updatedProducts = prev.filter(product => product.id !== productId)
          setFilteredProducts(updatedProducts) // Update filtered products
          return updatedProducts
        })
        setSuccessMessage('Product deleted successfully')
        setRowSelection({}) // Clear selection after deletion
      } catch (err) {
        console.error('Failed to delete product:', {
          status: err.response?.status,
          message: err.response?.data?.message,
          errors: err.response?.data?.errors,
          url: err.config?.url,
          method: err.config?.method
        })
        setError('Failed to delete product. Please try again.')
      }
    },
    [session, setProductsData, setFilteredProducts, setSuccessMessage, setRowSelection, setError]
  )

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
      {
        header: 'ID',
        accessorKey: 'id',
        cell: ({ row }) => <Typography>{row.original.id}</Typography>,
        enableHiding: true // Allow hiding if needed, but keep for sorting
      },
      {
        header: 'Image',
        accessorKey: 'pictures',
        cell: ({ row }) => {
          const picture = row.original.pictures?.[0]?.picture
          const imageUrl = picture ? buildImageUrl(picture) : 'https://via.placeholder.com/50'

          console.log('Image URL for product', row.original.name, ':', imageUrl)

          return (
            <img
              src={imageUrl}
              alt={`${row.original.name} image`}
              className='rounded'
              style={{ width: '50px', height: '50px', objectFit: 'cover' }}
              onError={e => {
                console.error('Failed to load image:', imageUrl)
                e.target.src = 'https://via.placeholder.com/50'
              }}
            />
          )
        }
      },
      {
        header: 'Name',
        accessorKey: 'name',
        cell: ({ row }) => <Typography color='text.primary'>{row.original.name}</Typography>
      },
      {
        header: 'Price',
        accessorKey: 'price',
        cell: ({ row }) => <Typography>{`${row.original.price.toFixed(2)} DA`}</Typography>
      },
      {
        header: 'Quantity',
        accessorKey: 'quantity',
        cell: ({ row }) => <Typography>{row.original.quantity}</Typography>
      },
      {
        header: 'Min Quantity',
        accessorKey: 'minimum_quantity',
        cell: ({ row }) => <Typography>{row.original.minimum_quantity}</Typography>
      },
      {
        header: 'Action',
        cell: ({ row }) => (
          <>
            <IconButton onClick={() => handleEdit(row.original)} aria-label='Edit product'>
              <i className='tabler-edit text-textSecondary text-[22px]' />
            </IconButton>
            <IconButton
              onClick={() => {
                setProductToDelete(row.original.id)
                setOpenDeleteDialog(true)
              }}
              aria-label='Delete product'
            >
              <i className='tabler-trash text-textSecondary text-[22px]' />
            </IconButton>
          </>
        )
      }
    ],
    [handleEdit, handleDelete]
  )

  // Initialize table with pagination, sorting, filtering, and row selection
  const table = useReactTable({
    data: filteredProducts,
    columns,
    filterFns: { fuzzy: fuzzyFilter },
    state: { globalFilter, rowSelection },
    initialState: {
      sorting: [{ id: 'id', desc: true }], // Sort by ID descending (newest first)
      pagination: { pageSize: 10 }
    },
    enableRowSelection: true,
    globalFilterFn: fuzzyFilter,
    onRowSelectionChange: setRowSelection,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    getFacetedMinMaxValues: getFacetedMinMaxValues()
  })

  // Loading state
  if (loading) {
    return (
      <Card>
        <CardHeader title='Product List' />
        <div className='flex justify-center items-center p-6'>
          <CircularProgress />
          <Typography className='ml-2'>Loading products...</Typography>
        </div>
      </Card>
    )
  }

  const confirmDelete = async () => {
    if (!productToDelete) return
    await handleDelete(productToDelete)
    setOpenDeleteDialog(false)
    setProductToDelete(null)
  }

  return (
    <Card>
      <CardHeader
        title='Product List'
        action={
          <Button
            variant='contained'
            color='primary'
            startIcon={<i className='tabler-plus' />}
            onClick={() => setAddDrawerOpen(true)}
          >
            Add Product
          </Button>
        }
      />
      <ProductTableFilters setData={setFilteredProducts} tableData={productsData} />
      {error && (
        <Alert severity='error' className='m-6'>
          {error}
        </Alert>
      )}
      {successMessage && (
        <Alert severity='success' className='m-6'>
          {successMessage}
        </Alert>
      )}
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
            onChange={value => setGlobalFilter(String(value))}
            placeholder='Search Product'
            className='max-sm:is-full'
          />
        </div>
      </div>
      <TableContainer>
        <Table className={tableStyles.table}>
          <TableHead>
            {table.getHeaderGroups().map(headerGroup => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers
                  .filter(header => header.column.columnDef.header !== 'ID') // Hide ID column in UI
                  .map(header => (
                    <TableCell
                      key={header.id}
                      className={classnames('is-full-width font-medium', {
                        'no-wrap': header.column.id !== 'name',
                        'align-center': ['select', 'price', 'quantity', 'minimum_quantity', 'action'].includes(
                          header.column.id
                        )
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
          <TableBody>
            {table.getRowModel().rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={table.getVisibleFlatColumns().length} className='text-center'>
                  <Typography>No products found. Create your first product or adjust filters!</Typography>
                </TableCell>
              </TableRow>
            ) : (
              table.getRowModel().rows.map(row => (
                <TableRow
                  key={row.id}
                  hover
                  className={classnames({
                    selected: row.getIsSelected()
                  })}
                >
                  {row
                    .getVisibleCells()
                    .filter(cell => cell.column.columnDef.header !== 'ID') // Hide ID column in UI
                    .map(cell => (
                      <TableCell
                        key={cell.id}
                        className={classnames({
                          'no-wrap': cell.column.id !== 'name',
                          'align-center': ['select', 'price', 'quantity', 'minimum_quantity', 'action'].includes(
                            cell.column.id
                          )
                        })}
                      >
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                </TableRow>
              ))
            )}
          </TableBody>
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
      <AddProductDrawer
        open={addDrawerOpen}
        handleClose={() => setAddDrawerOpen(false)}
        onProductCreated={handleProductCreated}
        storeId={storeId}
        categories={categories}
        onSuccess={setSuccessMessage}
      />
      <EditProductDrawer
        open={editDrawerOpen}
        handleClose={() => {
          setEditDrawerOpen(false)
          setSelectedProduct(null)
        }}
        onProductUpdated={handleProductUpdated}
        product={selectedProduct}
        storeId={storeId}
        categories={categories}
        onSuccess={setSuccessMessage}
      />
      <Dialog open={openDeleteDialog} onClose={() => setOpenDeleteDialog(false)}>
        <DialogTitle>Confirm Product Deletion</DialogTitle>
        <DialogContent>Are you sure you want to delete this product?</DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDeleteDialog(false)}>Cancel</Button>
          <Button onClick={confirmDelete} variant='contained' color='error'>Delete</Button>
        </DialogActions>
      </Dialog>
    </Card>
  )
}

export default ProductListTable
