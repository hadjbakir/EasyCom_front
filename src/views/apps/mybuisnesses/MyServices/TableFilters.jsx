"use client"

// React Imports
import { useState, useEffect, useMemo } from "react"

// MUI Imports
import CardContent from "@mui/material/CardContent"
import Grid from "@mui/material/Grid2"
import MenuItem from "@mui/material/MenuItem"
import Button from "@mui/material/Button"

// Component Imports
import CustomTextField from "@core/components/mui/TextField"

/**
 * TableFilters component for filtering workspace data
 * @param {object} props - Component props
 * @param {function} props.setFilteredSpaces - Function to set filtered data
 * @param {array} props.spaces - Original workspace data
 */
const TableFilters = ({ setFilteredSpaces, spaces }) => {
  // States
  const [type, setType] = useState("")
  const [location, setLocation] = useState("")
  const [status, setStatus] = useState("")

  // Memoized unique locations and types from spaces data
  const uniqueLocations = useMemo(() => [...new Set(spaces.map((space) => space.location).filter(Boolean))], [spaces])

  const uniqueTypes = useMemo(() => [...new Set(spaces.map((space) => space.type).filter(Boolean))], [spaces])

  // Apply filters
  useEffect(() => {
    const filteredData = spaces.filter((space) => {
      const spaceType = space.type?.toLowerCase() || ""
      const spaceLocation = space.location || ""
      const spaceStatus = space.is_active ? "active" : "inactive"

      if (type && spaceType !== type.toLowerCase()) return false
      if (location && spaceLocation !== location) return false
      if (status && spaceStatus !== status.toLowerCase()) return false

      return true
    })

    setFilteredSpaces(filteredData)

    if (process.env.NODE_ENV !== "production") {
      console.log("Filters applied:", {
        type,
        location,
        status,
        filteredCount: filteredData.length,
        totalCount: spaces.length,
      })
    }
  }, [type, location, status, spaces, setFilteredSpaces])

  // Reset filters
  const resetFilters = () => {
    setType("")
    setLocation("")
    setStatus("")
    setFilteredSpaces(spaces)

    if (process.env.NODE_ENV !== "production") {
      console.log("Filters reset")
    }
  }

  // Capitalize type for display
  const capitalizeType = (type) => {
    return type ? type.charAt(0).toUpperCase() + type.slice(1) : type
  }

  return (
    <CardContent>
      <Grid container spacing={6}>
        <Grid size={{ xs: 12, sm: 4 }}>
          <CustomTextField
            select
            fullWidth
            id="select-type"
            label="Workspace Type"
            value={type}
            onChange={(e) => setType(e.target.value)}
            slotProps={{ select: { displayEmpty: true } }}
          >
            <MenuItem value="">All Types</MenuItem>
            {uniqueTypes.map((type) => (
              <MenuItem key={type} value={type}>
                {capitalizeType(type)}
              </MenuItem>
            ))}
          </CustomTextField>
        </Grid>

        <Grid size={{ xs: 12, sm: 4 }}>
          <CustomTextField
            select
            fullWidth
            id="select-location"
            label="Location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            slotProps={{ select: { displayEmpty: true } }}
          >
            <MenuItem value="">All Locations</MenuItem>
            {uniqueLocations.map((location) => (
              <MenuItem key={location} value={location}>
                {location}
              </MenuItem>
            ))}
          </CustomTextField>
        </Grid>
       
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
            <MenuItem value="active">Active</MenuItem>
            <MenuItem value="inactive">Inactive</MenuItem>
          </CustomTextField>
        </Grid>
        <Grid size={{ xs: 12 }}>
          <Button variant="outlined" onClick={resetFilters}>
            Reset Filters
          </Button>
        </Grid>
      </Grid>
    </CardContent>
  )
}

export default TableFilters
