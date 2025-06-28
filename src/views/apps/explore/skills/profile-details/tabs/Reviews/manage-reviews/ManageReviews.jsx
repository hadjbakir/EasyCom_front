'use client'

import { useEffect, useMemo, useState } from 'react'

import Link from 'next/link'
import { useParams } from 'next/navigation'

import { Card, Checkbox, MenuItem, Rating, TablePagination, Typography, Alert } from '@mui/material'
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

import apiClient from '@/libs/api'
import CustomAvatar from '@core/components/mui/Avatar'
import OptionMenu from '@core/components/option-menu'
import CustomTextField from '@core/components/mui/TextField'
import TablePaginationComponent from '@components/TablePaginationComponent'
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

const columnHelper = createColumnHelper()

const ManageReviewsTable = ({ reviews: initialReviews = [], serviceProviderId, user }) => {
  const [data, setData] = useState(initialReviews)
  const [status, setStatus] = useState('All')
  const [rowSelection, setRowSelection] = useState({})
  const [globalFilter, setGlobalFilter] = useState('')
  const [error, setError] = useState(null)
  const { lang: locale } = useParams()

  useEffect(() => {
    setData(initialReviews)
  }, [initialReviews])

  const handleDelete = async reviewId => {
    if (!user?.accessToken) {
      setError('You must be logged in to delete reviews.')

      return
    }

    try {
      await apiClient.delete(`/service-providers/${serviceProviderId}/reviews/${reviewId}`, {
        headers: { Authorization: `Bearer ${user.accessToken}` }
      })
      const updatedData = data.filter(review => review.id !== reviewId)

      setData(updatedData)
    } catch (err) {
      console.error('Error deleting review:', err)
      setError(err.response?.data?.message || 'Failed to delete review.')
    }
  }

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
      columnHelper.accessor('author', {
        header: 'Reviewer',
        cell: ({ row }) => (
          <div className='flex items-center gap-4'>
            <CustomAvatar src={row.original.avatar} size={34} />
            <div className='flex flex-col items-start'>
              <Typography color='primary.main' className='font-medium'>
                {row.original.author}
              </Typography>
              <Typography variant='body2'>{row.original.email}</Typography>
            </div>
          </div>
        )
      }),
      columnHelper.accessor('comment', {
        header: 'Review',
        cell: ({ row }) => (
          <div className='flex flex-col gap-1'>
            <Rating
              name='review-rating'
              readOnly
              value={row.original.rating}
              emptyIcon={<i className='tabler-star-filled' />}
            />
            <Typography variant='body2' className='text-wrap'>
              {row.original.comment}
            </Typography>
          </div>
        )
      }),
      columnHelper.accessor('date', {
        header: 'Date',
        sortingFn: (rowA, rowB) => {
          const dateA = new Date(rowA.original.date)
          const dateB = new Date(rowB.original.date)

          return dateA.getTime() - dateB.getTime()
        },
        cell: ({ row }) => <Typography>{row.original.date}</Typography>
      }),
      columnHelper.accessor('actions', {
        header: 'Actions',
        cell: ({ row }) => (
          <OptionMenu
            iconButtonProps={{ size: 'medium' }}
            iconClassName='text-textSecondary'
            options={[
              {
                text: 'Delete',
                icon: 'tabler-trash',
                menuItemProps: {
                  onClick: () => handleDelete(row.original.id),
                  className: 'flex items-center'
                }
              }
            ]}
          />
        ),
        enableSorting: false
      })
    ],
    [data, locale]
  )

  const table = useReactTable({
    data,
    columns,
    filterFns: { fuzzy: fuzzyFilter },
    state: { rowSelection, globalFilter },
    enableRowSelection: true,
    globalFilterFn: fuzzyFilter,
    onRowSelectionChange: setRowSelection,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    getFacetedMinMaxValues: getFacetedMinMaxValues()
  })

  return (
    <Card>
      {error && (
        <Alert severity='error' sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      <div className={classnames(tableStyles.header, 'p-4 flex items-center flex-wrap gap-4')}>
        <DebouncedInput
          value={globalFilter ?? ''}
          onChange={value => setGlobalFilter(String(value))}
          placeholder='Search Review'
          className='is-[250px]'
        />
      </div>
      <div className={tableStyles.tableWrapper}>
        <table className={tableStyles.table}>
          <thead>
            {table.getHeaderGroups().map(headerGroup => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map(header => (
                  <th key={header.id}>
                    {header.isPlaceholder ? null : (
                      <div
                        className={classnames({
                          [tableStyles.sortable]: header.column.getCanSort(),
                          [tableStyles.isSorted]: header.column.getIsSorted(),
                          [tableStyles.desc]: header.column.getIsSorted() === 'desc'
                        })}
                        onClick={header.column.getToggleSortingHandler()}
                      >
                        {flexRender(header.column.columnDef.header, header.getContext())}
                        {header.column.getIsSorted() ? (
                          <i
                            className={classnames('tabler-chevron-down', {
                              [tableStyles.desc]: header.column.getIsSorted() === 'desc'
                            })}
                          />
                        ) : null}
                      </div>
                    )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map(row => (
              <tr key={row.id} className={classnames({ [tableStyles.selected]: row.getIsSelected() })}>
                {row.getVisibleCells().map(cell => (
                  <td key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <TablePagination
        component={TablePaginationComponent}
        count={table.getFilteredRowModel().rows.length}
        page={table.getState().pagination.pageIndex}
        rowsPerPage={table.getState().pagination.pageSize}
        onPageChange={(_, page) => table.setPageIndex(page)}
        onRowsPerPageChange={e => table.setPageSize(Number(e.target.value))}
      />
    </Card>
  )
}

export default ManageReviewsTable
