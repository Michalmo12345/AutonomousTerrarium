const pool = require('../db')

// Create a new reading for a terrarium
const createReading = async (req, res) => {
  try {
    const { terrariumId } = req.params
    const { temperature, humidity } = req.body

    const result = await pool.query(
      'INSERT INTO readings (terrarium_id, temperature, humidity) VALUES ($1, $2, $3) RETURNING *',
      [terrariumId, temperature, humidity]
    )

    res.status(201).json(result.rows[0])
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Something went wrong' })
  }
}

// Get all readings for a specific terrarium
const getReadings = async (req, res) => {
  try {
    const { terrariumId } = req.params
    const result = await pool.query(
      'SELECT * FROM readings WHERE terrarium_id = $1 ORDER BY created_at DESC',
      [terrariumId]
    )

    if (result.rows.length === 0) return res.status(404).json({ error: 'No readings found' })

    res.json(result.rows)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Something went wrong' })
  }
}

module.exports = {
  createReading,
  getReadings,
}
