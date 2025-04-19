const pool = require('../db')

const getTerrariums = async (req, res) => {
    try {
      const { id: userId } = req.user;
      const { page = 1, limit = 10 } = req.query;
      const offset = (page - 1) * limit;
      const result = await pool.query(
        'SELECT * FROM terrariums WHERE user_id = $1 LIMIT $2 OFFSET $3',
        [userId, limit, offset]
      );
      res.json(result.rows);
    } catch (err) {
      res.status(500).json({ error: 'Something went wrong' });
    }
  };

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
    console.error(err);
    res.status(500).json({ error: 'Something went wrong' });
  }
};

const getTemperatureHistory = async (req, res) => {
  try {
    const { id } = req.params;
    const { id: userId } = req.user;

    // Verify the terrarium belongs to the user
    const terrariumCheck = await pool.query(
      'SELECT id FROM terrariums WHERE id = $1 AND user_id = $2',
      [id, userId]
    );
    if (terrariumCheck.rowCount === 0) {
      return res.status(404).json({ error: 'Terrarium not found or unauthorized' });
    }

    // Fetch readings from the last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const result = await pool.query(
      'SELECT temperature, created_at FROM readings WHERE terrarium_id = $1 AND created_at >= $2 ORDER BY created_at ASC',
      [id, thirtyDaysAgo]
    );

    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Something went wrong' });
  }
};

module.exports = {
  getTerrariums,
  createTerrarium,
  updateTerrarium,
  deleteTerrarium,
  getTerrariumById,
  getTemperatureHistory,
}
