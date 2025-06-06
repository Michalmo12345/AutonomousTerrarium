const express = require('express')
const cors = require('cors')
require('dotenv').config()

const authRoutes = require('./routes/auth')
const terrariumRoutes = require('./routes/terrariums')
const readingRoutes = require('./routes/readings')

const app = express()
app.use(cors({
    origin: ['http://16.170.162.232', 'http://16.170.162.232:3000'],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  }));
app.use(express.json())

app.use('/api/auth', authRoutes)
app.use('/api/terrariums', terrariumRoutes)
app.use('/api/readings', readingRoutes)

app.listen(5000, () => console.log(`Server running on port 5000`))
