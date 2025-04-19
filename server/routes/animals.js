const express = require('express');
const router = express.Router();
const { getAnimals, createAnimal } = require('../controllers/animalController');
const authenticateToken = require('../middleware/authMiddleware');

router.use(authenticateToken);

router.get('/', getAnimals);
router.post('/', createAnimal);

module.exports = router;
