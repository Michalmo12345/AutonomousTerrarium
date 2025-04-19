const express = require('express')
const router = express.Router()
const {
  getTerrariums,
  createTerrarium,
  updateTerrarium,
  deleteTerrarium,
} = require('../controllers/terrariumController')
const authenticateToken = require('../middleware/authMiddleware')

router.use(authenticateToken)

router.get('/', getTerrariums)
router.post('/', createTerrarium)
router.put('/:id', updateTerrarium)
router.delete('/:id', deleteTerrarium)

module.exports = router
