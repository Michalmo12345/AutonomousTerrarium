const pool = require('../db');

const getTerrariums = async (req, res) => {
  try {
    const { id: userId } = req.user;
    const result = await pool.query('SELECT * FROM terrariums WHERE user_id = $1', [userId]);
    res.json(result.rows);
  } catch (err) {
    console.error('Error in getTerrariums:', err);
    res.status(500).json({ error: 'Something went wrong' });
  }
};

const createTerrarium = async (req, res) => {
  try {
    const { name, temperature, humidity } = req.body;
    const { id: userId } = req.user;
    if (!name || !temperature || !humidity) {
      return res.status(400).json({ error: 'Name, temperature, and humidity are required' });
    }
    const result = await pool.query(
      'INSERT INTO terrariums (user_id, name, temperature, humidity) VALUES ($1, $2, $3, $4) RETURNING *',
      [userId, name, temperature, humidity]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error in createTerrarium:', err);
    res.status(500).json({ error: 'Something went wrong' });
  }
};

const deleteTerrarium = async (req, res) => {
  try {
    const { id } = req.params;
    const { id: userId } = req.user;
    const result = await pool.query(
      'DELETE FROM terrariums WHERE id = $1 AND user_id = $2 RETURNING *',
      [id, userId]
    );
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Terrarium not found or unauthorized' });
    }
    res.json({ message: 'Terrarium deleted successfully' });
  } catch (err) {
    console.error('Error in deleteTerrarium:', err);
    res.status(500).json({ error: 'Something went wrong' });
  }
};

const getTerrariumById = async (req, res) => {
  try {
    const { id } = req.params;
    const { id: userId } = req.user;
    const result = await pool.query(
      'SELECT * FROM terrariums WHERE id = $1 AND user_id = $2',
      [id, userId]
    );
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Terrarium not found or unauthorized' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error in getTerrariumById:', err);
    res.status(500).json({ error: 'Something went wrong' });
  }
};

const getTemperatureHistory = async (req, res) => {
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
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const result = await pool.query(
      'SELECT temperature, created_at FROM readings WHERE terrarium_id = $1 AND created_at >= $2 ORDER BY created_at ASC',
      [id, thirtyDaysAgo]
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Error in getTemperatureHistory:', err);
    res.status(500).json({ error: 'Something went wrong' });
  }
};

const getSettings = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `SELECT 
         day,
         day_temperature,
         night_temperature,
         day_humidity_target,
         night_humidity_target,
         sprinkler_enabled,
         leds_enabled,
         heater_enabled,
         manual_mode,
         color
       FROM terrariums 
       WHERE id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Terrarium not found' });
    }

    const t = result.rows[0];

    const temperature = t.day ? t.day_temperature : t.night_temperature;
    const humidity = t.day ? t.day_humidity_target : t.night_humidity_target;

    res.json({
      temperature,
      humidity,
      sprinkler_enabled: t.sprinkler_enabled,
      leds_enabled: t.leds_enabled,
      heater_enabled: t.heater_enabled,
      manual_mode: t.manual_mode,
      color: t.color
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Something went wrong' });
  }
};

const setDayMode = async (req, res) => {
  try {
    const { id } = req.params
    const { day } = req.body

    const result = await pool.query(
      'UPDATE terrariums SET day = $1 WHERE id = $2 RETURNING day',
      [day, id]
    )

    if (result.rows.length === 0) return res.status(404).json({ error: 'Terrarium not found' })

    res.json(result.rows[0])
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Something went wrong' })
  }
}

const updateTerrarium = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, temperature, humidity } = req.body;
    const { id: userId } = req.user;

    // Fetch current mode (day vs night)
    const { rows } = await pool.query(
      'SELECT day FROM terrariums WHERE id = $1 AND user_id = $2',
      [id, userId]
    );
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Terrarium not found or unauthorized' });
    }
    const { day } = rows[0];

    // Validate inputs
    if (!name || temperature == null || humidity == null) {
      return res.status(400).json({ error: 'Name, temperature, and humidity are required' });
    }
    if (
      typeof temperature !== 'number' || temperature < 0 || temperature > 100 ||
      typeof humidity !== 'number' || humidity < 0 || humidity > 100
    ) {
      return res.status(400).json({ error: 'Temperature and humidity must be numbers between 0 and 100' });
    }

    // Determine which columns to update
    const tempCol = day ? 'day_temperature' : 'night_temperature';
    const humCol = day ? 'day_humidity_target' : 'night_humidity_target';

    // Perform update and return full updated row
    const result = await pool.query(
      `UPDATE terrariums
       SET name = $1,
           ${tempCol} = $2,
           ${humCol} = $3
       WHERE id = $4 AND user_id = $5
       RETURNING *, ${tempCol} AS temperature, ${humCol} AS humidity`,
      [name, temperature, humidity, id, userId]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Terrarium not found or unauthorized' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error in updateTerrarium:', err);
    res.status(500).json({ error: 'Something went wrong' });
  }
};



const setLedsEnabled = async (req, res) => {
  try {
    const { id } = req.params
    const { leds_enabled } = req.body

    const result = await pool.query(
      'UPDATE terrariums SET leds_enabled = $1 WHERE id = $2 RETURNING leds_enabled',
      [leds_enabled, id]
    )

    if (result.rows.length === 0) return res.status(404).json({ error: 'Terrarium not found' })

    res.json(result.rows[0])
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Something went wrong' })
  }
}

const setColor = async (req, res) => {
  try {
    const { id } = req.params

    const result = await pool.query(
      'UPDATE terrariums SET color = 1 WHERE id = $1 RETURNING color',
      [id]
    )

    if (result.rows.length === 0) return res.status(404).json({ error: 'Terrarium not found' })

    res.json(result.rows[0])
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Something went wrong' })
  }
}

const setManualMode = async (req, res) => {
  try {
    const { id } = req.params
    const { manual_mode } = req.body

    let query
    let params

    if (manual_mode === false) {
      query = `
        UPDATE terrariums 
        SET manual_mode = false, heater_enabled = false, sprinkler_enabled = false 
        WHERE id = $1 RETURNING manual_mode, heater_enabled, sprinkler_enabled
      `
      params = [id]
    } else {
      query = `
        UPDATE terrariums 
        SET manual_mode = true 
        WHERE id = $1 RETURNING manual_mode
      `
      params = [id]
    }

    const result = await pool.query(query, params)

    if (result.rows.length === 0) return res.status(404).json({ error: 'Terrarium not found' })

    res.json(result.rows[0])
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Something went wrong' })
  }
}

const setSprinklerEnabled = async (req, res) => {
  try {
    const { id } = req.params
    const { sprinkler_enabled } = req.body

    const check = await pool.query(
      'SELECT manual_mode FROM terrariums WHERE id = $1',
      [id]
    )

    if (check.rows.length === 0) return res.status(404).json({ error: 'Terrarium not found' })
    if (!check.rows[0].manual_mode) return res.status(403).json({ error: 'Manual mode is off' })

    const result = await pool.query(
      'UPDATE terrariums SET sprinkler_enabled = $1 WHERE id = $2 RETURNING sprinkler_enabled',
      [sprinkler_enabled, id]
    )

    res.json(result.rows[0])
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Something went wrong' })
  }
}

const setHeaterEnabled = async (req, res) => {
  try {
    const { id } = req.params
    const { heater_enabled } = req.body

    const check = await pool.query(
      'SELECT manual_mode FROM terrariums WHERE id = $1',
      [id]
    )

    if (check.rows.length === 0) return res.status(404).json({ error: 'Terrarium not found' })
    if (!check.rows[0].manual_mode) return res.status(403).json({ error: 'Manual mode is off' })

    const result = await pool.query(
      'UPDATE terrariums SET heater_enabled = $1 WHERE id = $2 RETURNING heater_enabled',
      [heater_enabled, id]
    )

    res.json(result.rows[0])
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Something went wrong' })
  }
}

module.exports = {
  getTerrariums,
  createTerrarium,
  updateTerrarium,
  deleteTerrarium,
  getTerrariumById,
  getTemperatureHistory,
  getSettings,
  setLedsEnabled,
  setColor,
  setManualMode,
  setSprinklerEnabled,
  setHeaterEnabled,
  setDayMode,
};
