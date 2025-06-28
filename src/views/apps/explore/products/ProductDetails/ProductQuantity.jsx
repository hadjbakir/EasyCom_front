"use client"

import { useState, useEffect } from "react"

import { Box, TextField, IconButton } from "@mui/material"
import { Plus, Minus } from "lucide-react"

const ProductQuantity = ({ value = 1, onChange, min = 1, max = 99 }) => {
  const [quantity, setQuantity] = useState(value)

  useEffect(() => {
    setQuantity(value)
  }, [value])

  const handleIncrement = () => {
    if (quantity < max) {
      const newQuantity = quantity + 1

      setQuantity(newQuantity)
      if (onChange) onChange(newQuantity)
    }
  }

  const handleDecrement = () => {
    if (quantity > min) {
      const newQuantity = quantity - 1

      setQuantity(newQuantity)
      if (onChange) onChange(newQuantity)
    }
  }

  const handleChange = (e) => {
    const value = Number.parseInt(e.target.value, 10)

    if (!isNaN(value) && value >= min && value <= max) {
      setQuantity(value)
      if (onChange) onChange(value)
    }
  }

  return (
    <Box sx={{ display: "flex", alignItems: "center" }}>
      <IconButton onClick={handleDecrement} disabled={quantity <= min}>
        <Minus size={16} />
      </IconButton>
      <TextField
        value={quantity}
        onChange={handleChange}
        inputProps={{
          min,
          max,
          type: "number",
          style: { textAlign: "center", width: "40px" },
        }}
        sx={{ mx: 1, width: "60px", "& .MuiOutlinedInput-root": { height: "40px" } }}
      />
      <IconButton onClick={handleIncrement} disabled={quantity >= max}>
        <Plus size={16} />
      </IconButton>
    </Box>
  )
}

export default ProductQuantity
