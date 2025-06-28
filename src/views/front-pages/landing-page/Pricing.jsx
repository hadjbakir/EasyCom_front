"use client"

// React Imports
import { useState, useRef, useEffect } from "react"

// Next Imports
import Link from "next/link"

// MUI Imports
import Typography from "@mui/material/Typography"
import Grid from "@mui/material/Grid2"
import Card from "@mui/material/Card"
import CardContent from "@mui/material/CardContent"
import Switch from "@mui/material/Switch"
import Chip from "@mui/material/Chip"
import Button from "@mui/material/Button"
import InputLabel from "@mui/material/InputLabel"
import { useTheme } from "@mui/material/styles"

// Third-party Imports
import classnames from "classnames"
import { motion } from "framer-motion"

// Components Imports
import CustomAvatar from "@core/components/mui/Avatar"

// Styles Imports
import frontCommonStyles from "@views/front-pages/styles.module.css"
import styles from "./styles.module.css"

// Hooks Imports
import { useIntersection } from "@/hooks/useIntersection"

const ALL_FEATURES = [
  "Access to the centralized service marketplace",
  "Verified supplier directory (local, wholesale, importers, workshops)",
  "Stock clearance marketplace",
  "Multi-store management for suppliers",
  "Easy booking for creative services (UGC, voice-over, video, etc.)",
  "Local studio & coworking finder",
  "Dedicated customer support",
  "AI-powered product search by image",
  "Smart product recommendation engine",
  "Priority support (faster response times)",
]

const pricingPlans = [
  {
    title: "Basic",
    subtitle: "Perfect for getting started",
    img: "/images/front-pages/landing-page/pricing-basic.png",
    monthlyPay: 2900,
    annualPay: 1900,
    perYearPay: 1900 * 12,
    currency: "DZD",
    features: [
      "Access to the centralized service marketplace",
      "Verified supplier directory (local, wholesale, importers, workshops)",
      "Stock clearance marketplace",
      "Multi-store management for suppliers",
      "Easy booking for creative services (UGC, voice-over, video, etc.)",
      "Local studio & coworking finder",
      "Dedicated customer support",
    ],
    current: false,
    gradient: "from-blue-500 to-cyan-500",
    bgGradient: "from-blue-50 to-cyan-50",
    darkBgGradient: "from-blue-900/20 to-cyan-900/20",
    borderColor: "#3b82f6",
  },
  {
    title: "Premium",
    subtitle: "Most popular choice",
    img: "/images/front-pages/landing-page/pricing-enterprise.png",
    monthlyPay: 3900,
    annualPay: 2900,
    perYearPay: 2900 * 12,
    currency: "DZD",
    features: [
      "Access to the centralized service marketplace",
      "Verified supplier directory (local, wholesale, importers, workshops)",
      "Stock clearance marketplace",
      "Multi-store management for suppliers",
      "Easy booking for creative services (UGC, voice-over, video, etc.)",
      "Local studio & coworking finder",
      "Dedicated customer support",
      "AI-powered product search by image",
      "Smart product recommendation engine",
      "Priority support (faster response times)",
    ],
    current: true,
    gradient: "from-purple-500 to-pink-500",
    bgGradient: "from-purple-50 to-pink-50",
    darkBgGradient: "from-purple-900/20 to-pink-900/20",
    borderColor: "#8b5cf6",
  },
]

const PricingPlan = () => {
  // States
  const [pricingPlan, setPricingPlan] = useState("annually")
  const [hoveredPlan, setHoveredPlan] = useState(null)
  const theme = useTheme()
  const isDark = theme.palette.mode === "dark"

  // Intersection logic
  const skipIntersection = useRef(true)
  const ref = useRef(null)
  const { updateIntersections } = useIntersection()

  useEffect(() => {
    const observer = new window.IntersectionObserver(
      ([entry]) => {
        if (skipIntersection.current) {
          skipIntersection.current = false
          return
        }
        updateIntersections({ [entry.target.id]: entry.isIntersecting })
      },
      { threshold: 0.35 },
    )
    ref.current && observer.observe(ref.current)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleChange = (e) => {
    if (e.target.checked) {
      setPricingPlan("annually")
    } else {
      setPricingPlan("monthly")
    }
  }

  return (
    <section
      id="pricing-plans"
      ref={ref}
      className={classnames(
        "flex flex-col gap-8 lg:gap-12 plb-[100px] relative overflow-hidden",
        styles.sectionStartRadius,
      )}
      style={{
        background: isDark
          ? "linear-gradient(135deg, #0c0a1e 0%, #1a1b3a 30%, #2d1b69 60%, #1e1b4b 100%)"
          : "linear-gradient(135deg, #fef7ff 0%, #f3e8ff 30%, #e0e7ff 60%, #dbeafe 100%)",
      }}
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 overflow-hidden">
        <div
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fillRule='evenodd'%3E%3Cg fill='%23${isDark ? "a855f7" : "6366f1"}' fillOpacity='0.2'%3E%3Ccircle cx='7' cy='7' r='1'/%3E%3Ccircle cx='27' cy='7' r='1'/%3E%3Ccircle cx='47' cy='7' r='1'/%3E%3Ccircle cx='7' cy='27' r='1'/%3E%3Ccircle cx='27' cy='27' r='1'/%3E%3Ccircle cx='47' cy='27' r='1'/%3E%3Ccircle cx='7' cy='47' r='1'/%3E%3Ccircle cx='27' cy='47' r='1'/%3E%3Ccircle cx='47' cy='47' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />

        {/* Floating Elements */}
        <motion.div
          className={`absolute top-20 left-20 w-32 h-32 rounded-full ${
            isDark
              ? "bg-gradient-to-br from-purple-500/20 to-blue-500/20"
              : "bg-gradient-to-br from-indigo-500/15 to-purple-500/15"
          } backdrop-blur-sm`}
          animate={{
            y: [-20, 20, -20],
            rotate: [0, 360],
          }}
          transition={{
            duration: 20,
            repeat: Number.POSITIVE_INFINITY,
            ease: "linear",
          }}
        />
        <motion.div
          className={`absolute bottom-20 right-20 w-24 h-24 rounded-3xl ${
            isDark
              ? "bg-gradient-to-br from-cyan-500/20 to-pink-500/20"
              : "bg-gradient-to-br from-blue-500/15 to-pink-500/15"
          } backdrop-blur-sm`}
          animate={{
            rotate: [0, -360],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 15,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
          }}
        />
      </div>

      <div className={classnames("is-full relative z-10", frontCommonStyles.layoutSpacing)}>
        {/* Header Section */}
        <motion.div
          className="flex flex-col gap-y-4 items-center justify-center"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <motion.div whileHover={{ scale: 1.05 }} transition={{ type: "spring", stiffness: 300 }}>
            <Chip
              size="small"
              variant="tonal"
              color="primary"
              label="Pricing Plans"
              sx={{
                background: isDark
                  ? "linear-gradient(135deg, rgba(99, 102, 241, 0.2) 0%, rgba(139, 92, 246, 0.2) 100%)"
                  : "linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(139, 92, 246, 0.1) 100%)",
                border: `1px solid ${isDark ? "#6366f1" : "#8b5cf6"}`,
                color: isDark ? "#c084fc" : "#8b5cf6",
                fontWeight: 600,
              }}
            />
          </motion.div>

          <div className="flex flex-col items-center gap-y-1 justify-center flex-wrap">
            <div className="flex items-center gap-x-2">
              <Typography
                color="text.primary"
                variant="h4"
                className="text-center"
                sx={{
                  color: isDark ? "#f1f5f9" : "#1e293b",
                  fontWeight: 800,
                }}
              >
                <span className="relative z-[1]">
                  Choose the plan that fits your business
                  <img
                    src="/images/front-pages/landing-page/bg-shape.png"
                    alt="bg-shape"
                    className="absolute block-end-0 z-[1] bs-[40%] is-[125%] sm:is-[132%] -inline-start-[10%] sm:inline-start-[-19%] block-start-[17px] opacity-60"
                  />
                </span>
              </Typography>
            </div>
            <Typography
              className="text-center max-w-2xl"
              sx={{
                color: isDark ? "#cbd5e1" : "#64748b",
                fontSize: "1.1rem",
                lineHeight: 1.6,
              }}
            >
              Start for free, upgrade anytime. All plans include essential tools to grow your e-commerce.
            </Typography>
          </div>
        </motion.div>

        {/* Pricing Toggle */}
        <motion.div
          className="flex justify-center items-center max-sm:mlb-3 mbe-6 mt-8"
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          viewport={{ once: true }}
        >
          <div
            className="flex items-center gap-4 p-2 rounded-2xl backdrop-blur-xl border"
            style={{
              background: isDark ? "rgba(30, 27, 75, 0.7)" : "rgba(255, 255, 255, 0.9)",
              borderColor: isDark ? "#6366f1" : "#a855f7",
            }}
          >
            <InputLabel
              htmlFor="pricing-switch"
              className="cursor-pointer px-4 py-2 rounded-xl transition-all duration-300"
              sx={{
                color: pricingPlan === "monthly" ? (isDark ? "#fff" : "#1e293b") : isDark ? "#94a3b8" : "#64748b",
                fontWeight: pricingPlan === "monthly" ? 600 : 400,
                background:
                  pricingPlan === "monthly"
                    ? isDark
                      ? "rgba(99, 102, 241, 0.3)"
                      : "rgba(139, 92, 246, 0.1)"
                    : "transparent",
              }}
            >
              Pay Monthly
            </InputLabel>

            <Switch
              id="pricing-switch"
              onChange={handleChange}
              checked={pricingPlan === "annually"}
              sx={{
                "& .MuiSwitch-track": {
                  background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
                },
                "& .MuiSwitch-thumb": {
                  background: "#fff",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                },
              }}
            />

            <InputLabel
              htmlFor="pricing-switch"
              className="cursor-pointer px-4 py-2 rounded-xl transition-all duration-300"
              sx={{
                color: pricingPlan === "annually" ? (isDark ? "#fff" : "#1e293b") : isDark ? "#94a3b8" : "#64748b",
                fontWeight: pricingPlan === "annually" ? 600 : 400,
                background:
                  pricingPlan === "annually"
                    ? isDark
                      ? "rgba(99, 102, 241, 0.3)"
                      : "rgba(139, 92, 246, 0.1)"
                    : "transparent",
              }}
            >
              Pay Annually
            </InputLabel>
          </div>

          <motion.div
            className="flex gap-x-1 items-start max-sm:hidden mis-4 mbe-5"
            animate={{
              x: [0, 5, 0],
              rotate: [0, 5, 0],
            }}
            transition={{
              duration: 2,
              repeat: Number.POSITIVE_INFINITY,
              ease: "easeInOut",
            }}
          >
            <img src="/images/front-pages/landing-page/pricing-arrow.png" width="50" />
            <Typography
              className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-500 to-emerald-600"
              sx={{ fontSize: "1rem" }}
            >
              Save 25%
            </Typography>
          </motion.div>
        </motion.div>

        {/* Pricing Cards */}
        <Grid container spacing={6} justifyContent="center">
          {pricingPlans.map((plan, index) => (
            <Grid key={index} size={{ xs: 12, lg: 4 }}>
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -10, scale: 1.02 }}
                onHoverStart={() => setHoveredPlan(index)}
                onHoverEnd={() => setHoveredPlan(null)}
                className="h-full"
              >
                <Card
                  className="h-full relative overflow-hidden"
                  sx={{
                    background: isDark
                      ? `linear-gradient(135deg, rgba(30, 27, 75, 0.8) 0%, rgba(45, 27, 105, 0.7) 100%)`
                      : `linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 250, 252, 0.9) 100%)`,
                    border: plan.current
                      ? `3px solid ${plan.borderColor}`
                      : `1px solid ${isDark ? "rgba(99, 102, 241, 0.3)" : "rgba(139, 92, 246, 0.2)"}`,
                    boxShadow: plan.current ? `0 25px 50px ${plan.borderColor}40` : "0 10px 30px rgba(0,0,0,0.1)",
                    backdropFilter: "blur(20px)",
                    transition: "all 0.3s ease",
                    "&:hover": {
                      boxShadow: `0 30px 60px ${plan.borderColor}50`,
                      transform: "translateY(-5px)",
                    },
                  }}
                >
                  {/* Popular Badge */}
                  {plan.current && (
                    <motion.div
                      className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.5, type: "spring" }}
                    >
                      <Chip
                        label="Most Popular"
                        sx={{
                          background: `linear-gradient(135deg, ${plan.borderColor} 0%, #ec4899 100%)`,
                          color: "white",
                          fontWeight: 700,
                          fontSize: "0.75rem",
                          px: 2,
                          py: 1,
                          boxShadow: `0 8px 25px ${plan.borderColor}60`,
                        }}
                      />
                    </motion.div>
                  )}

                  {/* Background Gradient Overlay */}
                  <div
                    className="absolute inset-0 opacity-5"
                    style={{
                      background: `linear-gradient(135deg, ${plan.borderColor}20 0%, transparent 100%)`,
                    }}
                  />

                  <CardContent className="flex flex-col gap-8 p-8 relative z-10">
                    {/* Plan Image & Title */}
                    <div className="is-full flex flex-col items-center gap-4">
                      <motion.div
                        whileHover={{ scale: 1.1, rotate: 5 }}
                        transition={{ type: "spring", stiffness: 300 }}
                        className="p-4 rounded-2xl"
                        style={{
                          background: `linear-gradient(135deg, ${plan.borderColor}20 0%, ${plan.borderColor}10 100%)`,
                          border: `1px solid ${plan.borderColor}30`,
                        }}
                      >
                        <img src={plan.img || "/placeholder.svg"} alt={plan.title} height="64" width="64" />
                      </motion.div>
                    </div>

                    {/* Plan Details */}
                    <div className="flex flex-col items-center gap-y-2 relative">
                      <Typography
                        variant="h4"
                        className="text-center font-bold"
                        sx={{
                          color: isDark ? "#f1f5f9" : "#1e293b",
                          background: `linear-gradient(135deg, ${plan.borderColor} 0%, #ec4899 100%)`,
                          backgroundClip: "text",
                          WebkitBackgroundClip: "text",
                          WebkitTextFillColor: "transparent",
                        }}
                      >
                        {plan.title}
                      </Typography>

                      <Typography
                        variant="body2"
                        className="text-center"
                        sx={{
                          color: isDark ? "#cbd5e1" : "#64748b",
                          fontWeight: 500,
                        }}
                      >
                        {plan.subtitle}
                      </Typography>

                      <div className="flex items-baseline gap-x-1 mt-2">
                        <Typography
                          variant="h2"
                          className="font-extrabold"
                          sx={{
                            background: `linear-gradient(135deg, ${plan.borderColor} 0%, #ec4899 100%)`,
                            backgroundClip: "text",
                            WebkitBackgroundClip: "text",
                            WebkitTextFillColor: "transparent",
                          }}
                        >
                          {plan.currency} {pricingPlan === "monthly" ? plan.monthlyPay : plan.annualPay}
                        </Typography>
                        <Typography
                          color="text.disabled"
                          className="font-medium"
                          sx={{ color: isDark ? "#94a3b8" : "#64748b" }}
                        >
                          /mo
                        </Typography>
                      </div>

                      {pricingPlan === "annually" && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="absolute top-full mt-2"
                        >
                          <Typography
                            variant="body2"
                            sx={{
                              color: isDark ? "#94a3b8" : "#64748b",
                              background: isDark ? "rgba(99, 102, 241, 0.1)" : "rgba(139, 92, 246, 0.05)",
                              px: 2,
                              py: 0.5,
                              borderRadius: 2,
                              border: `1px solid ${isDark ? "rgba(99, 102, 241, 0.2)" : "rgba(139, 92, 246, 0.1)"}`,
                            }}
                          >
                            {plan.currency} {plan.perYearPay} / year
                          </Typography>
                        </motion.div>
                      )}
                    </div>

                    {/* Features List */}
                    <div className="mt-6">
                      <div className="flex flex-col gap-3">
                        {ALL_FEATURES.map((feature, featureIndex) => {
                          const included = plan.features.includes(feature)
                          return (
                            <motion.div
                              key={featureIndex}
                              className={`flex items-center gap-3 p-2 rounded-lg transition-all duration-300 ${
                                included ? (isDark ? "bg-slate-800/30" : "bg-slate-50/50") : "opacity-50"
                              }`}
                              initial={{ opacity: 0, x: -20 }}
                              whileInView={{ opacity: included ? 1 : 0.5, x: 0 }}
                              transition={{ delay: featureIndex * 0.05 }}
                              viewport={{ once: true }}
                              whileHover={{ x: included ? 5 : 0 }}
                            >
                              <CustomAvatar
                                color={included ? "primary" : "default"}
                                skin={included ? "filled" : "light"}
                                size={24}
                                sx={{
                                  background: included
                                    ? `linear-gradient(135deg, ${plan.borderColor} 0%, #ec4899 100%)`
                                    : isDark
                                      ? "rgba(148, 163, 184, 0.2)"
                                      : "rgba(148, 163, 184, 0.1)",
                                  color: included ? "white" : isDark ? "#94a3b8" : "#64748b",
                                  border: `1px solid ${included ? "transparent" : isDark ? "rgba(148, 163, 184, 0.3)" : "rgba(148, 163, 184, 0.2)"}`,
                                }}
                              >
                                <i className={`tabler-${included ? "check" : "x"} text-sm`} />
                              </CustomAvatar>
                              <Typography
                                variant="body2"
                                sx={{
                                  color: included ? (isDark ? "#f1f5f9" : "#1e293b") : isDark ? "#64748b" : "#94a3b8",
                                  fontWeight: included ? 500 : 400,
                                  fontSize: "0.9rem",
                                }}
                              >
                                {feature}
                              </Typography>
                            </motion.div>
                          )
                        })}
                      </div>
                    </div>

                    {/* CTA Button */}
                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                      <Button
                        component={Link}
                        href="/front-pages/payment"
                        variant={plan.current ? "contained" : "outlined"}
                        size="large"
                        fullWidth
                        sx={{
                          borderRadius: "16px",
                          py: 2,
                          fontSize: "1rem",
                          fontWeight: 600,
                          ...(plan.current
                            ? {
                                background: `linear-gradient(135deg, ${plan.borderColor} 0%, #ec4899 100%)`,
                                "&:hover": {
                                  background: `linear-gradient(135deg, #5b21b6 0%, #db2777 100%)`,
                                  boxShadow: `0 15px 35px ${plan.borderColor}60`,
                                  transform: "translateY(-2px)",
                                },
                              }
                            : {
                                borderColor: plan.borderColor,
                                color: plan.borderColor,
                                "&:hover": {
                                  background: `${plan.borderColor}10`,
                                  borderColor: plan.borderColor,
                                  transform: "translateY(-2px)",
                                },
                              }),
                          transition: "all 0.3s ease",
                        }}
                      >
                        Get Started
                      </Button>
                    </motion.div>
                  </CardContent>
                </Card>
              </motion.div>
            </Grid>
          ))}
        </Grid>
      </div>
    </section>
  )
}

export default PricingPlan
