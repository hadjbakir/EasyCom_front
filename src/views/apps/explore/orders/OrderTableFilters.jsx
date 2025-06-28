"use client"

// React Imports
import { useState, useEffect, useMemo } from "react"

// MUI Imports
import CardContent from "@mui/material/CardContent"
import Grid from "@mui/material/Grid2"
import MenuItem from "@mui/material/MenuItem"
import Button from "@mui/material/Button"
import Typography from "@mui/material/Typography"
import Box from "@mui/material/Box"

// Component Imports
import CustomTextField from "@core/components/mui/TextField"

/**
 * OrderTableFilters component for filtering order data
 * @param {object} props - Component props
 * @param {function} props.setData - Function to set filtered data
 * @param {array} props.tableData - Original table data
 */
const OrderTableFilters = ({ setData, tableData }) => {
  // States
  const [status, setStatus] = useState("")
  const [date, setDate] = useState("")

  // Memoized unique statuses from tableData
  const uniqueStatuses = useMemo(
    () => [...new Set(tableData.map((order) => order.status).filter(Boolean))],
    [tableData],
  )

  // Apply filters
  useEffect(() => {
    const filteredData = tableData.filter((order) => {
      const orderStatus = order.status?.toLowerCase() || ""
      const orderDate = order.created_at || ""

      if (status && orderStatus !== status.toLowerCase()) return false
      if (date && orderDate && !orderDate.startsWith(date)) return false

      return true
    })

    setData(filteredData)

    if (process.env.NODE_ENV !== "production") {
      console.log("Filters applied:", {
        status,
        date,
        filteredCount: filteredData.length,
        totalCount: tableData.length,
      })
    }
  }, [status, date, tableData, setData])

  // Reset filters
  const resetFilters = () => {
    setStatus("")
    setDate("")
    setData(tableData)

    if (process.env.NODE_ENV !== "production") {
      console.log("Filters reset")
    }
  }

  return (
    <CardContent>
      <Typography variant="h6" sx={{ mb: 4, fontWeight: 700 }}>
        Filters
      </Typography>
      <Grid container spacing={6}>
        <Grid size={{ xs: 12, sm: 4 }}>
          <CustomTextField
            select
            fullWidth
            id="select-status"
            label="Status"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            slotProps={{ select: { displayEmpty: true } }}
          >
            <MenuItem value="">All Statuses</MenuItem>
            {uniqueStatuses.length > 0
              ? uniqueStatuses.map((statusValue) => (
                  <MenuItem key={statusValue} value={statusValue}>
                    {statusValue.charAt(0).toUpperCase() + statusValue.slice(1)}
                  </MenuItem>
                ))
              : [
                  <MenuItem key="pending" value="pending">
                    Pending
                  </MenuItem>,
                  <MenuItem key="processing" value="processing">
                    Processing
                  </MenuItem>,
                  <MenuItem key="delivered" value="delivered">
                    Delivered
                  </MenuItem>,
                ]}
          </CustomTextField>
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <CustomTextField
            fullWidth
            type="date"
            id="select-date"
            label="Order Date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            InputLabelProps={{ shrink: true }}
          />
        </Grid>
        <Grid size={{ xs: 12 }}>
          <Box sx={{ mt: 2 }}>
            <Button variant="outlined" onClick={resetFilters}>
              Reset Filters
            </Button>
          </Box>
        </Grid>
      </Grid>
    </CardContent>
  )
}

export default OrderTableFilters
