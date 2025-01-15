const express = require('express')
const { createServer } = require("http")
const cors = require('cors');
require("dotenv").config()

const router = require('./routes');
const { launchSocket } = require('./socket')
const mongoose = require('mongoose');

const app = express()
const server = createServer(app)

mongoose
  .connect(process.env.MONGO_URL)
  .then(() => console.log("Connected to MongoDB"))

app.use(cors({ origin: "*" }))
app.use(router)

launchSocket(server)

server.listen(process.env.PORT, () => {
  console.log(`Server running on port ${process.env.PORT}`)
})
