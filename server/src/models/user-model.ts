import { Schema, model, Types, Document } from 'mongoose'

interface ILeaderboard {
    _id: Types.ObjectId
    quiz_name: string
    quizId: Types.ObjectId
    score: number
}

export interface IUserDocument extends Document {
    _id: Types.ObjectId
    username: string
    name: string
    surname: string
    password: string
    email: string
    avatar: string | null
    isActivated: boolean
    activationLink: string
    leaderboard?: ILeaderboard[]
    sub: string
}

const LeaderboardSchema = new Schema<ILeaderboard>({
    quiz_name: { type: String, required: true },
    quizId: { type: Schema.Types.ObjectId, ref: 'Quiz', required: true },
    score: { type: Number, required: true }
})

const UserSchema = new Schema<IUserDocument>({
    username: { type: String, required: true, unique: true },
	name: { type: String, required: true },
    surname: { type: String, required: true },
    password: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    avatar: { type: String, required: false },
    isActivated: { type: Boolean, default: false, required: true },
	activationLink: { type: String, required: true },
    leaderboard: { type: [LeaderboardSchema], required: false },
    sub: { type: String, required: false }
})

const UserModel = model('User', UserSchema)

export default UserModel