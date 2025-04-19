const express = require('express')
const router = express.Router()
const { createReading, getReadings } = require('../controllers/readingController')
const authenticateToken = require('../middleware/authMiddleware')

router.use(authenticateToken)

// POST /api/readings/:terrariumId
router.post('/:terrariumId', createReading)

// GET /api/readings/:terrariumId
router.get('/:terrariumId', getReadings)

module.exports = router
