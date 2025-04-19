const express = require('express');
const router = express.Router();
const { getTerrariums, createTerrarium, updateTerrarium, deleteTerrarium, getTerrariumById, getTemperatureHistory } = require('../controllers/terrariumController');
const authenticateToken = require('../middleware/authMiddleware');

router.use(authenticateToken);

router.get('/', getTerrariums);
router.get('/:id', getTerrariumById); // Add this route
router.post('/', createTerrarium);
router.put('/:id', updateTerrarium);
router.delete('/:id', deleteTerrarium);
router.get('/:id/temperature-history', getTemperatureHistory);

module.exports = router;