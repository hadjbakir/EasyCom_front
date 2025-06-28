"use client"

import { useState } from "react"

import {
  Box,
  Typography,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Button,
  TextField,
  InputAdornment,
  IconButton,
  Paper,
  Tabs,
  Tab,
} from "@mui/material"
import { Search, X, FileText, Clock, CheckCircle } from "lucide-react"

// Mock data for service orders
const mockOrders = [
  {
    id: "ORD-001",
    providerName: "Sophie Anderson",
    providerAvatar: "https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=600",
    serviceType: "UI Design",
    projectTitle: "E-commerce Website Redesign",
    submittedDate: "2023-10-15",
    deadline: "2023-11-01",
    budget: 750,
    status: "completed",
  },
  {
    id: "ORD-002",
    providerName: "Alex Johnson",
    providerAvatar: "https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=600",
    serviceType: "Full Stack Development",
    projectTitle: "Customer Portal Development",
    submittedDate: "2023-10-20",
    deadline: "2023-12-01",
    budget: 2500,
    status: "in_progress",
  },
  {
    id: "ORD-003",
    providerName: "Maya Chen",
    providerAvatar:
      "https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=600",
    serviceType: "Product Design",
    projectTitle: "Mobile App UI/UX Design",
    submittedDate: "2023-10-25",
    deadline: "2023-11-15",
    budget: 1200,
    status: "pending",
  },
]

const ServiceOrderHistory = () => {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [orders] = useState(mockOrders)

  // Filter orders based on search and status filter
  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.providerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.projectTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.serviceType.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter === "all" || order.status === statusFilter

    return matchesSearch && matchesStatus
  })

  const getStatusChip = (status) => {
    switch (status) {
      case "pending":
        return <Chip icon={<Clock size={16} />} label="Pending" color="warning" size="small" />
      case "in_progress":
        return <Chip icon={<FileText size={16} />} label="In Progress" color="info" size="small" />
      case "completed":
        return <Chip icon={<CheckCircle size={16} />} label="Completed" color="success" size="small" />
      default:
        return <Chip label={status} size="small" />
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  return (
    <Card>
      <CardContent>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
          <Typography variant="h6">My Service Orders</Typography>
          <TextField
            placeholder="Search orders..."
            size="small"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search size={20} />
                </InputAdornment>
              ),
              endAdornment: searchTerm && (
                <InputAdornment position="end">
                  <IconButton size="small" onClick={() => setSearchTerm("")}>
                    <X size={16} />
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
        </Box>

        <Tabs value={statusFilter} onChange={(e, newValue) => setStatusFilter(newValue)} sx={{ mb: 3 }}>
          <Tab label="All Orders" value="all" />
          <Tab label="Pending" value="pending" />
          <Tab label="In Progress" value="in_progress" />
          <Tab label="Completed" value="completed" />
        </Tabs>

        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Order ID</TableCell>
                <TableCell>Provider</TableCell>
                <TableCell>Service</TableCell>
                <TableCell>Project</TableCell>
                <TableCell>Submitted</TableCell>
                <TableCell>Deadline</TableCell>
                <TableCell>Budget</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredOrders.length > 0 ? (
                filteredOrders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell>{order.id}</TableCell>
                    <TableCell>{order.providerName}</TableCell>
                    <TableCell>{order.serviceType}</TableCell>
                    <TableCell>{order.projectTitle}</TableCell>
                    <TableCell>{formatDate(order.submittedDate)}</TableCell>
                    <TableCell>{formatDate(order.deadline)}</TableCell>
                    <TableCell>${order.budget}</TableCell>
                    <TableCell>{getStatusChip(order.status)}</TableCell>
                    <TableCell>
                      <Button size="small" variant="outlined">
                        View Details
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={9} align="center">
                    <Typography variant="body2" sx={{ py: 2 }}>
                      No service orders found
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </CardContent>
    </Card>
  )
}

export default ServiceOrderHistory
