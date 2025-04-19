const express = require('express')
const router = express.Router()

let animals = []

router.get('/', (req, res) => {
  res.json(animals)
})

router.post('/', (req, res) => {
  const { name, species, age } = req.body
  const newAnimal = { id: Date.now(), name, species, age }
  animals.push(newAnimal)
  res.status(201).json(newAnimal)
})

module.exports = router
