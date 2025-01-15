const express = require('express')
const { createServer } = require("http")
const { Server } = require("socket.io")
const cors = require('cors');
require("dotenv").config()

const route = require('./routes');
const { addUser, getUser, getRoomUsers, removeUser, getUserBySocketId } = require('./users');

const app = express()
const server = createServer(app)
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
})

app.use(cors({ origin: "*" }))
app.use(route)

io.on("connection", (socket) => {
  console.log(`[Connect] Socket id: ${socket.id}`)

  socket.on("join", ({ username, room }) => {
    console.log(`[Join] ${username} -> ${room}`)
    socket.join(room)
    const { isExist, user } = addUser({
      name: username,
      room,
      socketId: socket.id
    })

    io.to(user.room).emit('joinRoom', {
      data: {
        room: user.room,
        users: getRoomUsers(user.room)
      }
    })

    if (isExist)
      return;

    socket.emit("message", {
      data: {
        user: {
          name: 'Admin'
        },
        text: `Hey, my ${username} <3`
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

  socket.on("sendMessage", ({ username, room, text }) => {
    console.log(`[Message] ${username} -> ${room} Text: ${text}`)
    const user = getUser({ name: username, room })

    if (!user) return;
    io.to(user.room).emit('message', {
      data: {
        user,
        text: text
      }
    })
  })

  const leaveRoom = ({ username, room }) => {
    console.log(`[Leave] ${username} <- ${room}`)
    socket.leave(room)
    const user = removeUser({ name: username, room })

    if (!user)
      return;

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
        users: getRoomUsers(user.room)
      }
    })
  }

  socket.on("leave", leaveRoom)

  socket.on("disconnect", (reason) => {
    console.log(`[Disconnect] Socket id: ${socket.id} Reason: ${reason}`)
    const user = getUserBySocketId(socket.id)
    if (user)
      leaveRoom({ username: user.name, room: user.room })
  })
})

server.listen(process.env.PORT, () => {
  console.log(`Server running on port ${process.env.PORT}`)
})
