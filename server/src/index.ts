import cookieParser from "cookie-parser"
import cors from "cors"
import 'dotenv/config'
import express from 'express'
import { createServer } from 'http'
import { Server } from 'socket.io'
import mongoose from 'mongoose'
import helmet from 'helmet'
import { LobbyManager } from './Handlers/lobbyHandlers'
import Lobby from "./models/lobby-model"
import router from './router/router'
import errorMiddleware from "./middlewares/error-middleware"

const app = express()

const server = createServer(app)

const io = new Server(server, {
	cors: {
		origin: process.env.CLIENT_URL!,
		credentials: true,
		methods: ["GET", "POST", "PUT", "DELETE", "PATCH"]
	}
})

const lobbyManager = new LobbyManager(io)

app.use('/uploads', express.static('uploads'))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(helmet())

app.use(cors({
  origin: process.env.CLIENT_URL!,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  optionsSuccessStatus: 200
}))
app.use(cookieParser())
app.use('/api', router)
app.use(errorMiddleware)

io.on('connection', (socket) => {
  console.log('A user connected:', socket.id)

  socket.on('createLobby', (data, callback) => {
    console.log('createLobby event received:', data)
    lobbyManager.createLobby(socket, data, callback)
  })

  socket.on('playerReady', (data, callback) => {
    console.log('playerReady event received:', data)
    lobbyManager.playerReady(socket, data)
  })

  socket.on('joinLobby', (data) => {
    console.log('joinLobby event received:', data)
    lobbyManager.joinLobby(socket, data)
  })

  socket.on('leaveLobby', (data) => {
    console.log('leaveLobby event received:', data)
    lobbyManager.leaveLobby(socket, data)
  })

  socket.on('startGame', (data) => {
    console.log('startGame event received:', data)
    lobbyManager.startGame(socket, data)
  })

  socket.on('submitAnswer', (data) => {
    console.log('submitAnswer event received:', data)
    lobbyManager.submitAnswer(socket, data)
  })

  socket.on('disconnect', async () => {
    console.log('A user disconnected:', socket.id)
    const lobby = await Lobby.findOne({ 'players.id': socket.id })
    if (lobby) {
      await lobbyManager.leaveLobby(socket, { lobbyId: lobby.friendCode })
    }
  })
})

const start = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI!)
    server.listen(process.env.PORT, () => console.log(`Server started on port: ${process.env.PORT}`))
  } catch (err) {
    console.log(err)
  }
}

start()