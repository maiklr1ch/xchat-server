let users = []

const getUser = (user) => users.find((u) => u.name.toLowerCase() === user.name.toLowerCase() && u.room.toLowerCase() === user.room.toLowerCase())

const getUserBySocketId = (id) => users.find(u => u.socketId === id)

const addUser = (user) => {
  const isExist = getUser(user)

  !isExist && users.push(user)

  const currentUser = isExist ?? user;
  return { isExist: !!isExist, user: currentUser }
}

const getRoomUsers = (room) => users.filter(u => u.room === room)

const removeUser = (user) => {
  const foundIdx = users.findIndex(u => u.room.toLowerCase() === user.room.toLowerCase() && u.name.toLowerCase() === user.name.toLowerCase())
  if (foundIdx === -1)
    return;

  const removedUser = users[foundIdx]
  users.splice(foundIdx, 1)
  return removedUser
}

module.exports = {
  addUser,
  getUser,
  getUserBySocketId,
  getRoomUsers,
  removeUser
}