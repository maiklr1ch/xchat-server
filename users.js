
const User = require('./models/User')

const getUser = async (user) => {
  const result = await User.findOne({ name: user.name, room: user.room })
  return result;
}

const getUserBySocketId = async (id) => {
  const result = await User.findOne({ socketIds: id })
  return result
}

const addUser = async (user) => {
  const isExist = await getUser(user)

  const result = isExist
    ? await User.findOneAndUpdate({ name: user.name, room: user.room }, { socketIds: [...isExist.socketIds, user.socketId ?? null] })
    : await User.create({ name: user.name, room: user.room, socketIds: [user.socketId] ?? [null] })
  return { isExist: !!isExist, user: result }
}

const getRoomUsers = async (room) => {
  const result = await User.find({ room })
  return result
}

const removeUser = async (user) => {
  const result = await getUser(user)
  const isManySockets = result.socketIds.length > 1
  if (result) {
    isManySockets
      ? await User.findOneAndUpdate({ name: result.name, room: result.room }, { socketIds: result.socketIds.filter(s => s !== user.socketId) })
      : await User.deleteOne({ name: result.name, room: result.room })
  }
  return { isManySockets, user: result }
}

module.exports = {
  addUser,
  getUser,
  getUserBySocketId,
  getRoomUsers,
  removeUser
}