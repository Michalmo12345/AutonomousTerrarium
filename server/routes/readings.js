// routes/readings.js
const express = require('express')
const router = express.Router()

// Dummy data (replace with DB logic later)
let readings = []

// GET all readings
router.get('/', (req, res) => {
  res.json(readings)
})

// POST create a new reading
router.post('/', (req, res) => {
  const { terrariumId, temperature, humidity } = req.body
  const newReading = { id: Date.now(), terrariumId, temperature, humidity }
  readings.push(newReading)
  res.status(201).json(newReading)
})

module.exports = router
