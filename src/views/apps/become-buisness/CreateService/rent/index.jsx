"use client"

import { useState } from "react"

import { Box, Typography, Card, CardContent, Tabs, Tab, Alert, Snackbar } from "@mui/material"

import StudioTab from "./StudioTab"
import CoworkingTab from "./CoworkingTab"

const ServiceTab = () => {
  const [activeTab, setActiveTab] = useState("studio")

  const [notification, setNotification] = useState({
    open: false,
    message: "",
    severity: "success",
  })

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue)
  }

  const handleSuccess = (message) => {
    setNotification({
      open: true,
      message,
      severity: "success",
    })
  }

  const handleError = (message) => {
    setNotification({
      open: true,
      message,
      severity: "error",
    })
  }

  const handleCloseNotification = () => {
    setNotification({
      ...notification,
      open: false,
    })
  }

  return (
    <Box>
      <Typography variant="h5" className="mb-6">
        Create New Space
      </Typography>

      <Card>
        <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
          <Tabs value={activeTab} onChange={handleTabChange} aria-label="space type tabs">
            <Tab label="Studio Space" value="studio" />
            <Tab label="Coworking Space" value="coworking" />
          </Tabs>
        </Box>
        <CardContent>
          {activeTab === "studio" ? (
            <StudioTab onSuccess={handleSuccess} onError={handleError} />
          ) : (
            <CoworkingTab onSuccess={handleSuccess} onError={handleError} />
          )}
        </CardContent>
      </Card>

      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert onClose={handleCloseNotification} severity={notification.severity} sx={{ width: "100%" }}>
          {notification.message}
        </Alert>
      </Snackbar>
    </Box>
  )
}

export default ServiceTab
