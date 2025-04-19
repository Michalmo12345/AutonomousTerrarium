const pool = require('../db')

const getTerrariums = async (req, res) => {
  try {
    const { id: userId } = req.user
    const result = await pool.query(
      'SELECT * FROM terrariums WHERE user_id = $1',
      [userId]
    )
    res.json(result.rows)
  } catch (err) {
    res.status(500).json({ error: 'Something went wrong' })
  }
}

const createTerrarium = async (req, res) => {
  try {
    const { name, temperature, humidity } = req.body
    const { id: userId } = req.user

    const result = await pool.query(
      'INSERT INTO terrariums (user_id, name, temperature, humidity) VALUES ($1, $2, $3, $4) RETURNING *',
      [userId, name, temperature, humidity]
    )
    res.status(201).json(result.rows[0])
  } catch (err) {
    res.status(500).json({ error: 'Something went wrong' })
  }
}

const updateTerrarium = async (req, res) => {
  try {
    const { id } = req.params
    const { name, temperature, humidity } = req.body
    const { id: userId } = req.user

    const result = await pool.query(
      'UPDATE terrariums SET name = $1, temperature = $2, humidity = $3 WHERE id = $4 AND user_id = $5 RETURNING *',
      [name, temperature, humidity, id, userId]
    )

    if (result.rowCount === 0) return res.status(404).json({ error: 'Terrarium not found' })
    res.json(result.rows[0])
  } catch (err) {
    res.status(500).json({ error: 'Something went wrong' })
  }
}

const deleteTerrarium = async (req, res) => {
  try {
    const { id } = req.params
    const { id: userId } = req.user

    const result = await pool.query(
      'DELETE FROM terrariums WHERE id = $1 AND user_id = $2 RETURNING *',
      [id, userId]
    )

    if (result.rowCount === 0) return res.status(404).json({ error: 'Terrarium not found' })
    res.json({ message: 'Terrarium deleted' })
  } catch (err) {
    res.status(500).json({ error: 'Something went wrong' })
  }
}

module.exports = {
  getTerrariums,
  createTerrarium,
  updateTerrarium,
  deleteTerrarium,
}
