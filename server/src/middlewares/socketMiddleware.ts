import { Socket } from 'socket.io'
import Lobby from '../models/lobby-model'

export const socketAuthMiddleware = async (socket: Socket, next: Function) => {
  try {
    const lobbyId = socket.handshake.query.lobbyId

    const lobby = await Lobby.findById(lobbyId)
    if (!lobby) {
      socket.emit('error', 'Lobby not found.')
      return
    }

    const user = socket.data.username
    if (!user) {
      socket.emit('error', 'User not found.')
      return
    }

    socket.data.lobbyId = lobby._id 
    next()
  } catch (error) {
    console.error(error)
    socket.emit('error', 'Internal server error.')
  }
}