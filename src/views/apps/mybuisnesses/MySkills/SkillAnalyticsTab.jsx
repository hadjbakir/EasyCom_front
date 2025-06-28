"use client"

import { useState } from "react"

import { Box, Typography, Grid, Card, CardContent, FormControl, InputLabel, Select, MenuItem } from "@mui/material"
import { TrendingUp, Users, DollarSign, Clock } from "lucide-react"

// Note: In a real app, you would use a charting library like Chart.js, Recharts, or ApexCharts
// For this example, we'll create placeholder components for the charts

const AnalyticsChart = ({ title, data, type }) => {
  return (
    <Card className="h-full">
      <CardContent>
        <Typography variant="h6" className="mb-4">
          {title}
        </Typography>
        <Box className="h-64 bg-background rounded-lg flex items-center justify-center">
          <Typography variant="body2" color="textSecondary">
            {type} chart would be rendered here
          </Typography>
        </Box>
      </CardContent>
    </Card>
  )
}

const SkillAnalyticsTab = ({ skillId }) => {
  const [timeRange, setTimeRange] = useState("30days")

  // Mock analytics data - in a real app, this would be fetched based on skillId and timeRange
  const analyticsData = {
    totalEarnings: 12450,
    totalOrders: 67,
    averageRating: 4.8,
    completionRate: 95,
    viewsData: [
      /* Array of data points for views chart */
    ],
    earningsData: [
      /* Array of data points for earnings chart */
    ],
    ordersData: [
      /* Array of data points for orders chart */
    ],
    popularServices: [
      { name: "UI Design", count: 28 },
      { name: "UX Research", count: 15 },
      { name: "Wireframing", count: 12 },
      { name: "Prototyping", count: 8 },
      { name: "Brand Identity", count: 4 },
    ],
  }

  return (
    <Box>
      <Box className="flex justify-between items-center mb-6">
        <Typography variant="h6">Performance Analytics</Typography>

        <FormControl size="small" className="min-w-[200px]">
          <InputLabel id="time-range-label">Time Range</InputLabel>
          <Select
            labelId="time-range-label"
            value={timeRange}
            label="Time Range"
            onChange={(e) => setTimeRange(e.target.value)}
          >
            <MenuItem value="7days">Last 7 days</MenuItem>
            <MenuItem value="30days">Last 30 days</MenuItem>
            <MenuItem value="90days">Last 90 days</MenuItem>
            <MenuItem value="year">Last year</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {/* Stats cards */}
      <Grid container spacing={3} className="mb-6">
        <Grid item xs={6} sm={3}>
          <Card>
            <CardContent className="p-4">
              <Box className="flex items-center gap-3">
                <Box className="p-2 rounded-full bg-primary/10">
                  <DollarSign size={20} className="text-primary" />
                </Box>
                <Box>
                  <Typography variant="h6" className="font-bold">
                    ${analyticsData.totalEarnings}
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                    Total Earnings
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} sm={3}>
          <Card>
            <CardContent className="p-4">
              <Box className="flex items-center gap-3">
                <Box className="p-2 rounded-full bg-success/10">
                  <Users size={20} className="text-success" />
                </Box>
                <Box>
                  <Typography variant="h6" className="font-bold">
                    {analyticsData.totalOrders}
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                    Total Orders
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} sm={3}>
          <Card>
            <CardContent className="p-4">
              <Box className="flex items-center gap-3">
                <Box className="p-2 rounded-full bg-warning/10">
                  <TrendingUp size={20} className="text-warning" />
                </Box>
                <Box>
                  <Typography variant="h6" className="font-bold">
                    {analyticsData.averageRating}
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                    Average Rating
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} sm={3}>
          <Card>
            <CardContent className="p-4">
              <Box className="flex items-center gap-3">
                <Box className="p-2 rounded-full bg-info/10">
                  <Clock size={20} className="text-info" />
                </Box>
                <Box>
                  <Typography variant="h6" className="font-bold">
                    {analyticsData.completionRate}%
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                    Completion Rate
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Charts */}
      <Grid container spacing={4} className="mb-6">
        <Grid item xs={12} md={8}>
          <AnalyticsChart title="Earnings Overview" data={analyticsData.earningsData} type="Line" />
        </Grid>
        <Grid item xs={12} md={4}>
          <AnalyticsChart title="Orders by Status" data={analyticsData.ordersData} type="Pie" />
        </Grid>
      </Grid>

      <Grid container spacing={4}>
        <Grid item xs={12} md={6}>
          <AnalyticsChart title="Profile Views" data={analyticsData.viewsData} type="Bar" />
        </Grid>
        <Grid item xs={12} md={6}>
          <Card className="h-full">
            <CardContent>
              <Typography variant="h6" className="mb-4">
                Popular Services
              </Typography>
              <Box className="space-y-3">
                {analyticsData.popularServices.map((service, index) => (
                  <Box key={index}>
                    <Box className="flex justify-between mb-1">
                      <Typography variant="body2">{service.name}</Typography>
                      <Typography variant="body2" color="textSecondary">
                        {service.count} orders
                      </Typography>
                    </Box>
                    <Box className="w-full bg-background rounded-full h-2">
                      <Box
                        className="h-2 rounded-full bg-primary"
                        sx={{
                          width: `${(service.count / analyticsData.popularServices[0].count) * 100}%`,
                        }}
                      />
                    </Box>
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  )
}

export default SkillAnalyticsTab
