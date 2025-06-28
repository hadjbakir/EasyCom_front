"use client"

// MUI Imports
import Box from "@mui/material/Box"
import Grid from "@mui/material/Grid2"
import FormControlLabel from "@mui/material/FormControlLabel"
import Switch from "@mui/material/Switch"
import TextField from "@mui/material/TextField"

const OpeningHoursInput = ({ value, onChange, disabled }) => {
  // Handle day toggle
  const handleDayToggle = (day, isOpen) => {
    onChange({
      ...value,
      [day]: {
        ...value[day],
        open: isOpen,
      },
    })
  }

  // Handle hours change
  const handleHoursChange = (day, hours) => {
    onChange({
      ...value,
      [day]: {
        ...value[day],
        hours,
      },
    })
  }

  return (
    <Box>
      <Grid container spacing={2}>
        {Object.entries(value).map(([day, data]) => (
          <Grid item xs={12} key={day}>
            <Box className="flex items-center gap-3">
              <FormControlLabel
                control={
                  <Switch
                    checked={data.open}
                    onChange={(e) => handleDayToggle(day, e.target.checked)}
                    disabled={disabled}
                  />
                }
                label={day.charAt(0).toUpperCase() + day.slice(1)}
                className="w-32"
              />
              {data.open && (
                <TextField
                  label="Hours"
                  placeholder="e.g. 9:00 - 18:00"
                  value={data.hours}
                  onChange={(e) => handleHoursChange(day, e.target.value)}
                  disabled={disabled}
                  fullWidth
                />
              )}
            </Box>
          </Grid>
        ))}
      </Grid>
    </Box>
  )
}

export default OpeningHoursInput
