import IUser from '../Interfaces/interface';
import mongoose from "mongoose"

interface ILeaderboard {
  quiz_name: string
  quizId: mongoose.Types.ObjectId
  score: number
}

export class UserDto {
  surname: string
  name: string
  username: string
  email: string
  avatar?: string | null
  isActivated: boolean
  leaderboard?: ILeaderboard[] | null
  id: string

  constructor(model: IUser) { 
    this.surname = model.surname
    this.name = model.name
    this.username = model.username
    this.email = model.email
    this.avatar = model.avatar
    this.isActivated = model.isActivated
    this.id = model._id.toString()
    this.leaderboard = model.leaderboard
  }
}
