const express = require('express');
const router = express.Router();
const { 
    getTerrariums, createTerrarium, getSettings, updateTerrarium, 
    deleteTerrarium, getTerrariumById, getTemperatureHistory,
    setDayMode, setLedsEnabled, setColor, setManualMode,
    setSprinklerEnabled, setHeaterEnabled 
} = require('../controllers/terrariumController');
const authenticateToken = require('../middleware/authMiddleware');

router.use(authenticateToken);

router.get('/', getTerrariums);
router.get('/:id', getTerrariumById);
router.get('/:id/temperature-history', getTemperatureHistory);
router.post('/', createTerrarium);
router.put('/:id', updateTerrarium);
router.delete('/:id', deleteTerrarium);
router.get('/:id/settings', getSettings);

router.put('/:id/day', setDayMode)
router.put('/:id/leds', setLedsEnabled)
router.put('/:id/color', setColor)

router.put('/:id/manual-mode', setManualMode)
router.put('/:id/sprinkler', setSprinklerEnabled)
router.put('/:id/heater', setHeaterEnabled)
module.exports = router;
