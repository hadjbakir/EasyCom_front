'use client'

import { useEffect, useMemo, useState } from 'react'

import Link from 'next/link'
import { useParams } from 'next/navigation'

import Card from '@mui/material/Card'
import Checkbox from '@mui/material/Checkbox'
import MenuItem from '@mui/material/MenuItem'
import Rating from '@mui/material/Rating'
import TablePagination from '@mui/material/TablePagination'
import Typography from '@mui/material/Typography'
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

import CustomAvatar from '@core/components/mui/Avatar'
import OptionMenu from '@core/components/option-menu'
import CustomTextField from '@core/components/mui/TextField'
import TablePaginationComponent from '@/components/TablePaginationComponent'
import { getLocalizedUrl } from '@/utils/i18n'
import tableStyles from '@core/styles/table.module.css'

const fuzzyFilter = (row, columnId, value, addMeta) => {
  const itemRank = rankItem(row.getValue(columnId), value)

  addMeta({ itemRank })

  return itemRank.passed
}

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
  }, [value])

  return <CustomTextField {...props} value={value} onChange={e => setValue(e.target.value)} />
}

// Static reviews data
const staticReviews = []

const columnHelper = createColumnHelper()

const ManageReviewsTable = ({ reviews, setReviews, user, workspaceId }) => {
  const [status, setStatus] = useState('All')
  const [rowSelection, setRowSelection] = useState({})
  const [allData, setAllData] = useState(reviews || staticReviews)
  const [data, setData] = useState(reviews || staticReviews)
  const [globalFilter, setGlobalFilter] = useState('')
  const { lang: locale } = useParams()

  // Update data when reviews prop changes
  useEffect(() => {
    setAllData(reviews || [])
    setData(reviews || [])
  }, [reviews])

  const columns = useMemo(
    () => [
      {
        id: 'select',
        header: ({ table }) => (
          <Checkbox
            checked={table.getIsAllRowsSelected()}
            indeterminate={table.getIsSomeRowsSelected()}
            onChange={table.getToggleAllRowsSelectedHandler()}
          />
        ),
        cell: ({ row }) => (
          <Checkbox
            checked={row.getIsSelected()}
            disabled={!row.getCanSelect()}
            indeterminate={row.getIsSomeSelected()}
            onChange={row.getToggleSelectedHandler()}
          />
        )
      },

      columnHelper.accessor('user.full_name', {
        header: 'Reviewer',
        cell: ({ row }) => (
          <div className='flex items-center gap-4'>
            <CustomAvatar src={row.original.user?.picture || '/images/avatars/1.png'} size={34} />
            <div className='flex flex-col items-start'>
              <Typography
                component={Link}
                href={getLocalizedUrl('/apps/ecommerce/customers/details/879861', locale)}
                color='primary.main'
                className='font-medium'
              >
                {row.original.user?.full_name || 'Anonymous'}
              </Typography>
              <Typography variant='body2'>{row.original.user?.email || 'N/A'}</Typography>
            </div>
          </div>
        )
      }),
      columnHelper.accessor('comment', {
        header: 'Review',
        sortingFn: (rowA, rowB) => rowA.original.rating - rowB.original.rating,
        cell: ({ row }) => (
          <div className='flex flex-col gap-1'>
            <Rating
              name='workspace-review'
              readOnly
              value={row.original.rating}
              emptyIcon={<i className='tabler-star-filled' />}
            />
            <Typography className='font-medium' color='text.primary'>
              {row.original.comment.substring(0, 50)}...
            </Typography>
            <Typography variant='body2' className='text-wrap'>
              {row.original.comment}
            </Typography>
          </div>
        )
      }),
      columnHelper.accessor('created_at', {
        header: 'Date',
        sortingFn: (rowA, rowB) => {
          const dateA = new Date(rowA.original.created_at)
          const dateB = new Date(rowB.original.created_at)

          return dateA.getTime() - dateB.getTime()
        },
        cell: ({ row }) => {
          const date = new Date(row.original.created_at).toLocaleDateString('en-US', {
            month: 'short',
            day: '2-digit',
            year: 'numeric'
          })

          return <Typography>{date}</Typography>
        }
      }),

      columnHelper.accessor('actions', {
        header: 'Actions',
        cell: ({ row }) => (
          <OptionMenu
            iconButtonProps={{ size: 'medium' }}
            iconClassName='text-textSecondary'
            options={[
              {
                text: 'View',
                icon: 'tabler-eye',
                href: getLocalizedUrl('/apps/ecommerce/orders/details/5434', locale),
                linkProps: { className: 'flex items-center gap-2 is-full plb-2 pli-4' }
              },
              {
                text: 'Delete',
                icon: 'tabler-trash',
                menuItemProps: {
                  onClick: () => {
                    const updatedData = allData.filter(review => review.id !== row.original.id)

                    setAllData(updatedData)
                    setData(updatedData)

                    if (setReviews) {
                      setReviews(updatedData)
                    }
                  },
                  className: 'flex items-center'
                }
              }
            ]}
          />
        ),
        enableSorting: false
      })
    ],
    [allData, locale, setReviews]
  )

  const table = useReactTable({
    data,
    columns,
    state: {
      rowSelection,
      globalFilter
    },
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    getFacetedMinMaxValues: getFacetedMinMaxValues(),
    filterFns: {
      fuzzy: fuzzyFilter
    }
  })

  if (!reviews || reviews.length === 0) {
    return (
      <Card sx={{ p: 4 }}>
        <Typography variant='h6'>No reviews available to manage.</Typography>
      </Card>
    )
  }

  return (
    <div className='space-y-4'>
      <Card>
        <div className='flex flex-col gap-4 p-4'>
          <div className='flex flex-col gap-2'>
            <Typography variant='h6'>Search</Typography>
            <DebouncedInput
              value={globalFilter ?? ''}
              onChange={value => setGlobalFilter(String(value))}
              className='max-w-sm'
              placeholder='Search all columns...'
            />
          </div>
        </div>
        <div className='overflow-x-auto'>
          <table className={tableStyles.table}>
            <thead>
              {table.getHeaderGroups().map(headerGroup => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map(header => (
                    <th
                      key={header.id}
                      className={classnames(header.column.getCanSort() && 'cursor-pointer select-none')}
                    >
                      {header.isPlaceholder ? null : (
                        <div
                          className={classnames(
                            'flex items-center gap-1',
                            header.column.getCanSort() && 'cursor-pointer select-none'
                          )}
                          onClick={header.column.getToggleSortingHandler()}
                        >
                          {flexRender(header.column.columnDef.header, header.getContext())}
                          {{
                            asc: ' 🔼',
                            desc: ' 🔽'
                          }[header.column.getIsSorted()] ?? null}
                        </div>
                      )}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {table.getRowModel().rows.length ? (
                table.getRowModel().rows.map(row => (
                  <tr key={row.id} data-state={row.getIsSelected() && 'selected'}>
                    {row.getVisibleCells().map(cell => (
                      <td key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>
                    ))}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={columns.length} className='h-24 text-center'>
                    No results.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <TablePaginationComponent table={table} />
      </Card>
    </div>
  )
}

export default ManageReviewsTable
