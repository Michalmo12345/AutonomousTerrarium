const express = require('express')
const cors = require('cors')
require('dotenv').config()

const authRoutes = require('./routes/auth')
const terrariumRoutes = require('./routes/terrariums')
const animalRoutes = require('./routes/animals')
const readingRoutes = require('./routes/readings')

const app = express()
app.use(cors())
app.use(express.json())

app.use('/api/auth', authRoutes)
app.use('/api/terrariums', terrariumRoutes)
app.use('/api/animals', animalRoutes)
app.use('/api/readings', readingRoutes)

const PORT = process.env.PORT || 5000
app.listen(PORT, () => console.log(`Server running on port ${PORT}`))
