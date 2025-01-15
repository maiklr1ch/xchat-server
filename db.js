const mongoose = require('mongoose');

const launchDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URL)
    console.log("Connected to MongoDB")
  } finally {
    await mongoose.disconnect()
  }
}

module.exports = {
  launchDB
}