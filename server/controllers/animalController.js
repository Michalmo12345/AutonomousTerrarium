const pool = require('../db');

const getAnimalsByTerrarium = async (req, res) => {
  try {
    const { id } = req.params;
    const { id: userId } = req.user;
    const terrariumCheck = await pool.query(
      'SELECT id FROM terrariums WHERE id = $1 AND user_id = $2',
      [id, userId]
    );
    if (terrariumCheck.rowCount === 0) {
      return res.status(404).json({ error: 'Terrarium not found or unauthorized' });
    }
    const result = await pool.query('SELECT * FROM animals WHERE terrarium_id = $1', [id]);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
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

module.exports = { getAnimalsByTerrarium, createAnimal };