import mongoose, { Schema, Document } from 'mongoose'

interface IQuestion {
  question: string
  hint: string
  correctAnswer: string
  incorrectAnswers: string[]
}

interface IPlayer {
  id: string
  username: string
  name: string
  surname: string
  avatar: string | null
  MongoId: string
}

interface ILobby extends Document {
  quizId: string
  category: string
  hostId: string
  friendCode: string 
  players: IPlayer[]
  createdAt: Date
  questions: IQuestion[] 
  status: "active" | "waiting"
  lastActivity: Date
}

const lobbySchema: Schema = new Schema(
  {
    quizId: { type: Schema.Types.ObjectId, ref: 'QuizModel', required: true },
    category: { type: String, required: true },
    hostId: { type: String, required: true },
    friendCode: { type: String, required: true }, 
    players: [
      {
        id: { type: String, required: true },
        username: { type: String, required: true },
        name: { type: String, required: true },
        surname: { type: String, required: true },
        avatar: { type: String, default: null },
        MongoId: { type: Schema.Types.ObjectId, ref: 'User', required: true }
      }
    ],
    questions: [
      {
        question: { type: String, required: true },
        hint: { type: String, required: true },
        correctAnswer: { type: String, required: true },
        incorrectAnswers: { type: [String], required: true }
      }
    ],
    status: { type: String, required: true },
    lastActivity: { type: Date, required: true }
  },
  { timestamps: true }
)

const Lobby = mongoose.model<ILobby>('Lobby', lobbySchema)

export default Lobby