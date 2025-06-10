const pool = require('../db')

const createReading = async (req, res) => {
  try {
    const { terrariumId } = req.params
    const {
      temperature,
      humidity,
      water_level_ok,
      heater_on,
      sprinkler_on,
      leds_on
    } = req.body

    const result = await pool.query(
      `INSERT INTO readings (
        terrarium_id, temperature, humidity,
        water_level_ok, heater_on, sprinkler_on, leds_on
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *`,
      [
        terrariumId,
        temperature,
        humidity,
        water_level_ok ?? false,
        heater_on ?? false,
        sprinkler_on ?? false,
        leds_on ?? false
      ]
    )
    res.status(201).json(result.rows[0])
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Something went wrong' })
  }
}
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
