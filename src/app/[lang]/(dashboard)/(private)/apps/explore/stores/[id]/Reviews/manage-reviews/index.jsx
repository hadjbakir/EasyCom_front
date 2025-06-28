"use client"

// src/views/apps/explore/products/ProductDetails/ProductDescription/Reviews/manage-reviews/index.jsx
import { useEffect, useMemo, useState } from "react"

import Link from "next/link"
import { useParams } from "next/navigation"

import Card from "@mui/material/Card"
import Checkbox from "@mui/material/Checkbox"
import MenuItem from "@mui/material/MenuItem"
import Rating from "@mui/material/Rating"
import TablePagination from "@mui/material/TablePagination"
import Typography from "@mui/material/Typography"
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

import CustomAvatar from "@core/components/mui/Avatar"
import OptionMenu from "@core/components/option-menu"
import CustomTextField from "@core/components/mui/TextField"
import TablePaginationComponent from "@components/TablePaginationComponent"
import { getLocalizedUrl } from "@/utils/i18n"
import tableStyles from "@core/styles/table.module.css"

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

  return <CustomTextField {...props} value={value} onChange={(e) => setValue(e.target.value)} />
}

// Static reviews data
const staticReviews = [
  
]

const columnHelper = createColumnHelper()

const ManageReviewsTable = () => {
  const [status, setStatus] = useState("All")
  const [rowSelection, setRowSelection] = useState({})
  const [allData, setAllData] = useState(staticReviews)
  const [data, setData] = useState(staticReviews)
  const [globalFilter, setGlobalFilter] = useState("")
  const { lang: locale } = useParams()

  const columns = useMemo(
    () => [
      {
        id: "select",
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
        ),
      },

      columnHelper.accessor("reviewer", {
        header: "Reviewer",
        cell: ({ row }) => (
          <div className="flex items-center gap-4">
            <CustomAvatar src={row.original.avatar} size={34} />
            <div className="flex flex-col items-start">
              <Typography
                component={Link}
                href={getLocalizedUrl("/apps/ecommerce/customers/details/879861", locale)}
                color="primary.main"
                className="font-medium"
              >
                {row.original.reviewer}
              </Typography>
              <Typography variant="body2">{row.original.email}</Typography>
            </div>
          </div>
        ),
      }),
      columnHelper.accessor("head", {
        header: "Review",
        sortingFn: (rowA, rowB) => rowA.original.review - rowB.original.review,
        cell: ({ row }) => (
          <div className="flex flex-col gap-1">
            <Rating
              name="product-review"
              readOnly
              value={row.original.review}
              emptyIcon={<i className="tabler-star-filled" />}
            />
            <Typography className="font-medium" color="text.primary">
              {row.original.head}
            </Typography>
            <Typography variant="body2" className="text-wrap">
              {row.original.para}
            </Typography>
          </div>
        ),
      }),
      columnHelper.accessor("date", {
        header: "Date",
        sortingFn: (rowA, rowB) => {
          const dateA = new Date(rowA.original.date)
          const dateB = new Date(rowB.original.date)

          return dateA.getTime() - dateB.getTime()
        },
        cell: ({ row }) => {
          const date = new Date(row.original.date).toLocaleDateString("en-US", {
            month: "short",
            day: "2-digit",
            year: "numeric",
          })

          return <Typography>{date}</Typography>
        },
      }),

      columnHelper.accessor("actions", {
        header: "Actions",
        cell: ({ row }) => (
          <OptionMenu
            iconButtonProps={{ size: "medium" }}
            iconClassName="text-textSecondary"
            options={[
              {
                text: "View",
                icon: "tabler-eye",
                href: getLocalizedUrl("/apps/ecommerce/orders/details/5434", locale),
                linkProps: { className: "flex items-center gap-2 is-full plb-2 pli-4" },
              },
              {
                text: "Delete",
                icon: "tabler-trash",
                menuItemProps: {
                  onClick: () => {
                    const updatedData = allData.filter((review) => review.id !== row.original.id)

                    setAllData(updatedData)
                    setData(updatedData)
                  },
                  className: "flex items-center",
                },
              },
            ]}
          />
        ),
        enableSorting: false,
      }),
    ],
    [allData, locale],
  )



}

export default ManageReviewsTable
