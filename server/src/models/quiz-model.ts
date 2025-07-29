import mongoose, { Schema, Document, model, Types } from "mongoose"

export interface IComment {
    _id: mongoose.Types.ObjectId
    username: string
    avatar: string | null
    comment: string
}

export interface ILeaderboard {
    _id: mongoose.Types.ObjectId
    userId: mongoose.Types.ObjectId
    username: string
    avatar: string | null
    score: number
}

export interface IQuizDocument extends Document {
    _id: Types.ObjectId;
    quiz_name: string
    category_id: number | string
    image: string
    likes: string[]
    leaderboard?: ILeaderboard[]
    comments: IComment[]
    TYPE: string
}

const LeaderboardSchema = new Schema<ILeaderboard>({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    username: { type: String, required: true },
    avatar: { type: String, required: false, default: null }, 
    score: { type: Number, required: true },
})

const CommentSchema = new Schema<IComment>({
    username: { type: String, required: true },
    avatar: { type: String, required: false, default: null }, 
    comment: { type: String, required: true },
})

const QuizSchema = new Schema<IQuizDocument>({
    quiz_name: { type: String, required: true },
    category_id: { type: Schema.Types.Mixed, required: true },
    image: { type: String, required: true },
    likes: { type: [String], default: [] },
    leaderboard: { type: [LeaderboardSchema], required: false },
    comments: { type: [CommentSchema], default: [] }, 
    TYPE: { type: String, required: true },
})

export const QuizModel = model<IQuizDocument>("Quiz", QuizSchema)