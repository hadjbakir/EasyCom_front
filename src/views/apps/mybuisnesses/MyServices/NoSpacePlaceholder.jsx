"use client"

// React Imports
import { useState } from "react"

// MUI Imports
import Box from "@mui/material/Box"
import Typography from "@mui/material/Typography"
import Button from "@mui/material/Button"
import Card from "@mui/material/Card"
import CardContent from "@mui/material/CardContent"
import Dialog from "@mui/material/Dialog"
import DialogTitle from "@mui/material/DialogTitle"
import DialogContent from "@mui/material/DialogContent"
import DialogActions from "@mui/material/DialogActions"
import TextField from "@mui/material/TextField"
import FormControl from "@mui/material/FormControl"
import InputLabel from "@mui/material/InputLabel"
import Select from "@mui/material/Select"
import MenuItem from "@mui/material/MenuItem"
import Grid from "@mui/material/Grid2"
import Alert from "@mui/material/Alert"
import CircularProgress from "@mui/material/CircularProgress"

// Icon Imports
import { Plus, Building2 } from "lucide-react"

const NoSpacePlaceholder = () => {
  // States
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const [formData, setFormData] = useState({
    name: "",
    type: "studio",
    description: "",
    address: "",
    city: "",
  })

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // Handle dialog open
  const handleOpenDialog = () => {
    setIsDialogOpen(true)
  }

  // Handle dialog close
  const handleCloseDialog = () => {
    setIsDialogOpen(false)
  }

  // Handle input change
  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
    setError(null)
  }

  // Handle form submit
  const handleSubmit = async () => {
    // Validate form
    if (!formData.name || !formData.description || !formData.address || !formData.city) {
      setError("Please fill in all required fields")

      return
    }

    setLoading(true)
    setError(null)

    try {
      // In a real implementation, you would create via API
      // const response = await apiClient.post('/spaces', formData)

      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 1500))

      // Reload page to show new space
      window.location.reload()
    } catch (err) {
      console.error("Error creating space:", err)
      setError("Failed to create space. Please try again.")
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardContent className="flex flex-col items-center justify-center p-8 text-center">
        <Building2 size={60} className="text-primary mb-4" />
        <Typography variant="h5" className="mb-2">
          No Space Found
        </Typography>
        <Typography variant="body1" color="textSecondary" className="mb-6">
          You haven&apos;t created a space profile yet. Create one to start managing your studio or coworking space.
        </Typography>
        <Button variant="contained" startIcon={<Plus size={18} />} onClick={handleOpenDialog}>
          Create Space Profile
        </Button>

        {/* Create Space Dialog */}
        <Dialog open={isDialogOpen} onClose={loading ? undefined : handleCloseDialog} fullWidth maxWidth="md">
          <DialogTitle>Create Space Profile</DialogTitle>
          <DialogContent>
            {error && (
              <Alert severity="error" className="mt-2 mb-4">
                {error}
              </Alert>
            )}

            <Box className="mt-2 space-y-4">
              <TextField
                label="Space Name"
                fullWidth
                required
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                disabled={loading}
              />

              <FormControl fullWidth required>
                <InputLabel>Space Type</InputLabel>
                <Select
                  value={formData.type}
                  label="Space Type"
                  onChange={(e) => handleInputChange("type", e.target.value)}
                  disabled={loading}
                >
                  <MenuItem value="studio">Studio</MenuItem>
                  <MenuItem value="coworking">Coworking Space</MenuItem>
                  <MenuItem value="meeting">Meeting Room</MenuItem>
                  <MenuItem value="event">Event Space</MenuItem>
                </Select>
              </FormControl>

              <TextField
                label="Description"
                fullWidth
                required
                multiline
                rows={3}
                value={formData.description}
                onChange={(e) => handleInputChange("description", e.target.value)}
                disabled={loading}
              />

              <Grid container spacing={3}>
                <Grid item xs={12} sm={8}>
                  <TextField
                    label="Address"
                    fullWidth
                    required
                    value={formData.address}
                    onChange={(e) => handleInputChange("address", e.target.value)}
                    disabled={loading}
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    label="City"
                    fullWidth
                    required
                    value={formData.city}
                    onChange={(e) => handleInputChange("city", e.target.value)}
                    disabled={loading}
                  />
                </Grid>
              </Grid>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog} disabled={loading}>
              Cancel
            </Button>
            <Button variant="contained" onClick={handleSubmit} disabled={loading}>
              {loading ? (
                <>
                  <CircularProgress size={20} className="mr-2" />
                  Creating...
                </>
              ) : (
                "Create Space"
              )}
            </Button>
          </DialogActions>
        </Dialog>
      </CardContent>
    </Card>
  )
}

export default NoSpacePlaceholder
