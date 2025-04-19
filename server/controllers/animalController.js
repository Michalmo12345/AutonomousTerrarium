const pool = require('../db');

const getAnimals = async (req, res) => {
  try {
    const { id: userId } = req.user;
    const result = await pool.query('SELECT * FROM animals WHERE user_id = $1', [userId]);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Something went wrong' });
  }
};

const createAnimal = async (req, res) => {
  try {
    const { name, species, age } = req.body;
    const { id: userId } = req.user;
    const result = await pool.query(
      'INSERT INTO animals (user_id, name, species, age) VALUES ($1, $2, $3, $4) RETURNING *',
      [userId, name, species, age]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Something went wrong' });
  }
};

module.exports = { getAnimals, createAnimal };