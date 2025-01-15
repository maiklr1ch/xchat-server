const { Server } = require("socket.io")
const { addUser, getUser, getRoomUsers, removeUser, getUserBySocketId } = require('./users');

const launchSocket = server => {
  const io = new Server(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST']
    }
  })

  io.on("connection", (socket) => {

    socket.on("join", async ({ username, room }) => {
      console.log(`[Join] ${username}[${socket.id}] -> ${room}`)
      socket.join(room)
      const { isExist, user } = await addUser({
        name: username,
        room,
        socketId: socket.id
      })

      const roomUsers = await getRoomUsers(user.room)

      io.to(user.room).emit('joinRoom', {
        data: {
          room: user.room,
          users: roomUsers
        }
      })

      if (isExist)
        return;

      socket.emit("message", {
        data: {
          user: {
            name: 'Admin'
          },
          text: `Hey, ${username}! Nice to see you😊`
        }
      })

      socket.broadcast.to(user.room).emit("message", {
        data: {
          user: {
            name: 'Admin'
          },
          text: `${username} has joined the room!`
        }
      })
    })

    socket.on("sendMessage", async ({ username, room, text }) => {
      console.log(`[Message] ${username}[${socket.id}] -> ${room} Text: ${text}`)
      const user = await getUser({ name: username, room })

      if (!user) return;
      io.to(user.room).emit('message', {
        data: {
          user,
          text: text
        }
      })
    })

    const leaveRoom = async ({ username, room }) => {
      console.log(`[Leave] ${username}[${socket.id}] <- ${room}`)
      socket.leave(room)
      const { isManySockets, user } = await removeUser({ name: username, room, socketId: socket.id })

      if (!user || isManySockets)
        return;

      const roomUsers = await getRoomUsers(user.room)

      io.to(user.room).emit('message', {
        data: {
          user: {
            name: 'Admin'
          },
          text: `${user.name} has left the room!`
        }
      })

      io.to(user.room).emit('leftRoom', {
        data: {
          room: user.room,
          users: roomUsers
        }
      })
    }

    socket.on("leave", leaveRoom)

    socket.on("disconnect", async (reason) => {
      console.log(`[Disconnect] ${socket.id} Reason: ${reason}`)
      const user = await getUserBySocketId(socket.id)
      if (user)
        leaveRoom({ username: user.name, room: user.room })
    })
  })
}

module.exports = {
  launchSocket
}