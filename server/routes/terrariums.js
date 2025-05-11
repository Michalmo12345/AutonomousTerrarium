const express = require('express');
const router = express.Router();
const { getTerrariums, createTerrarium, updateTerrarium, deleteTerrarium, getTerrariumById, getTemperatureHistory, getSettings } = require('../controllers/terrariumController');
const authenticateToken = require('../middleware/authMiddleware');

router.use(authenticateToken);

router.get('/', getTerrariums);
router.get('/:id', getTerrariumById);
router.get('/:id/temperature-history', getTemperatureHistory);
router.post('/', createTerrarium);
router.put('/:id', updateTerrarium);
router.delete('/:id', deleteTerrarium);
router.get('/:id/settings', getSettings)

module.exports = router;