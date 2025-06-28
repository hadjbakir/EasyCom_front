"use client"

import { Box, Grid, Typography, Switch, FormControlLabel, TextField } from "@mui/material"

const days = [
  { key: "monday", label: "Monday" },
  { key: "tuesday", label: "Tuesday" },
  { key: "wednesday", label: "Wednesday" },
  { key: "thursday", label: "Thursday" },
  { key: "friday", label: "Friday" },
  { key: "saturday", label: "Saturday" },
  { key: "sunday", label: "Sunday" },
]

const OpeningHoursInput = ({ openingHours, onChange, disabled }) => {
  return (
    <Box>
      <Grid container spacing={2}>
        {days.map((day) => (
          <Grid item xs={12} key={day.key}>
            <Box className="flex flex-col sm:flex-row sm:items-center gap-4 p-3 border rounded-md">
              <Box className="flex items-center justify-between sm:w-1/3">
                <Typography variant="body1">{day.label}</Typography>
                <FormControlLabel
                  control={
                    <Switch
                      checked={openingHours[day.key].open}
                      onChange={(e) => onChange(day.key, "open", e.target.checked)}
                      disabled={disabled}
                    />
                  }
                  label={openingHours[day.key].open ? "Open" : "Closed"}
                />
              </Box>
              <Box className="flex items-center gap-4 sm:w-2/3">
                <TextField
                  label="Opening Time"
                  type="time"
                  value={openingHours[day.key].openTime}
                  onChange={(e) => onChange(day.key, "openTime", e.target.value)}
                  disabled={!openingHours[day.key].open || disabled}
                  InputLabelProps={{ shrink: true }}
                  inputProps={{ step: 300 }}
                  fullWidth
                />
                <Typography variant="body2">to</Typography>
                <TextField
                  label="Closing Time"
                  type="time"
                  value={openingHours[day.key].closeTime}
                  onChange={(e) => onChange(day.key, "closeTime", e.target.value)}
                  disabled={!openingHours[day.key].open || disabled}
                  InputLabelProps={{ shrink: true }}
                  inputProps={{ step: 300 }}
                  fullWidth
                />
              </Box>
            </Box>
          </Grid>
        ))}
      </Grid>
    </Box>
  )
}

export default OpeningHoursInput
