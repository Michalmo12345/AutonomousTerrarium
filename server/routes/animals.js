const express = require('express');
const router = express.Router();
const { getAnimalsByTerrarium } = require('../controllers/animalController');
const authenticateToken = require('../middleware/authMiddleware');

router.use(authenticateToken);

router.get('/:id/animals', getAnimalsByTerrarium);

module.exports = router;