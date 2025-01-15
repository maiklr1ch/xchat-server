const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  room: { type: String, required: true },
  socketIds: [String]
})

module.exports = new mongoose.model('User', userSchema)
