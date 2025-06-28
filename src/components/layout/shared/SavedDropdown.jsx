"use client"

import { useState } from "react"

import { useRouter, useParams } from "next/navigation"
import { getLocalizedUrl } from '@/utils/i18n'

import { Bookmark, ChevronRight, X } from 'lucide-react'

// MUI Imports
import Avatar from "@mui/material/Avatar"
import Badge from "@mui/material/Badge"
import Box from "@mui/material/Box"
import Divider from "@mui/material/Divider"
import IconButton from "@mui/material/IconButton"
import Menu from "@mui/material/Menu"
import MenuItem from "@mui/material/MenuItem"
import Typography from "@mui/material/Typography"
import Tooltip from "@mui/material/Tooltip"

// Custom Component Imports
import CustomAvatar from "@core/components/mui/Avatar"
import CustomChip from "@core/components/mui/Chip"

// Context Import
import { useSaved } from "@/components/contexts/SavedContext"

const SavedDropdownContent = () => {
  // States
  const [anchorEl, setAnchorEl] = useState(null)

  // Hooks
  const router = useRouter()
  const { savedItems, removeItem } = useSaved()
  const { lang: locale } = useParams()

  // Get only the 5 most recent saved items
  const recentSavedItems = savedItems.slice(0, 5)

  const handleDropdownOpen = (event) => {
    setAnchorEl(event.currentTarget)
  }

  const handleDropdownClose = () => {
    setAnchorEl(null)
  }

  const handleRemoveItem = (e, id, type) => {
    e.stopPropagation()
    removeItem(id, type)
  }

  const handleViewAll = () => {
    router.push(getLocalizedUrl('/saved', locale))
    handleDropdownClose()
  }

  const renderItemAvatar = (item) => {
    if (item.avatar) {
      return <Avatar src={item.avatar} alt={item.title} sx={{ width: 38, height: 38 }} />
    } else {
      return (
        <CustomAvatar skin="light" color={item.type === "skill" ? "primary" : "info"} sx={{ width: 38, height: 38 }}>
          {item.title.charAt(0).toUpperCase()}
        </CustomAvatar>
      )
    }
  }

  return (
    <>
      <Tooltip title="Saved Items">
        <IconButton color="inherit" aria-haspopup="true" onClick={handleDropdownOpen} aria-controls="customized-menu">
          <Badge badgeContent={savedItems.length} color="error">
            <Bookmark />
          </Badge>
        </IconButton>
      </Tooltip>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleDropdownClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
        sx={{ "& .MuiPaper-root": { width: 380 } }}
      >
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", px: 4, py: 2 }}>
          <Typography variant="h6">Saved Items</Typography>
          <CustomChip
            skin="light"
            size="small"
            color="primary"
            label={`${savedItems.length} new`}
            sx={{ height: 20, fontSize: "0.75rem", fontWeight: 500 }}
          />
        </Box>
        <Divider sx={{ my: "0 !important" }} />
        <Box sx={{ maxHeight: 350, overflowY: "auto" }}>
          {recentSavedItems.length > 0 ? (
            recentSavedItems.map((item) => (
              <MenuItem
                key={`${item.type}-${item.id}`}
                onClick={handleDropdownClose}
                sx={{ py: 2, px: 4, "&:hover": { backgroundColor: "action.hover" } }}
              >
                <Box sx={{ width: "100%", display: "flex", alignItems: "center" }}>
                  <Box sx={{ mr: 4 }}>{renderItemAvatar(item)}</Box>
                  <Box sx={{ flex: "1 1", display: "flex", overflow: "hidden", flexDirection: "column" }}>
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        width: "100%",
                        overflow: "hidden",
                      }}
                    >
                      <Typography sx={{ fontWeight: 500 }}>{item.title}</Typography>
                      <IconButton
                        size="small"
                        onClick={(e) => handleRemoveItem(e, item.id, item.type)}
                        sx={{ color: "text.secondary" }}
                      >
                        <X fontSize="1.25rem" />
                      </IconButton>
                    </Box>
                    <Typography variant="body2" sx={{ color: "text.disabled" }}>
                      {item.type === "skill" ? "Skill Provider" : "Workspace"}
                    </Typography>
                  </Box>
                </Box>
              </MenuItem>
            ))
          ) : (
            <MenuItem
              disableRipple
              disableTouchRipple
              sx={{ py: 3, px: 4, justifyContent: "center", cursor: "default" }}
            >
              <Typography variant="body2" sx={{ color: "text.secondary" }}>
                No saved items found
              </Typography>
            </MenuItem>
          )}
        </Box>
        <Divider sx={{ my: "0 !important" }} />
        <MenuItem
          disableRipple
          disableTouchRipple
          onClick={handleViewAll}
          sx={{ py: 2, px: 4, color: "primary.main", justifyContent: "center" }}
        >
          <Typography variant="body2" sx={{ fontWeight: 500, display: "flex", alignItems: "center" }}>
            View All Saved Items
            <ChevronRight fontSize="1rem" />
          </Typography>
        </MenuItem>
      </Menu>
    </>
  )
}

// Wrap the component with SavedProvider
import { SavedProvider } from "@/components/contexts/SavedContext"

const SavedDropdown = () => {
  return (
    <SavedProvider>
      <SavedDropdownContent />
    </SavedProvider>
  )
}

export default SavedDropdown
