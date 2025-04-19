// routes/terrariums.js
const express = require('express')
const router = express.Router()

// Dummy data (replace with DB logic later)
let terrariums = []

// GET all terrariums
router.get('/', (req, res) => {
  res.json(terrariums)
})

// POST create a new terrarium
router.post('/', (req, res) => {
  const { userId, animalId, temperature, humidity } = req.body
  const newTerrarium = { id: Date.now(), userId, animalId, temperature, humidity }
  terrariums.push(newTerrarium)
  res.status(201).json(newTerrarium)
})

module.exports = router
