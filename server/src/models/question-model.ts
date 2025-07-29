import { Schema, model, Types } from 'mongoose'

export interface Question {
	title: string
	correctAnswer: string
	incorrectAnswers: string[]
}
const QueSchema = new Schema<Question>({
	title: { type: String, required: true },
	correctAnswer: { type: String, required: true },
	incorrectAnswers: { type: [String], required: true }
})
const QuestionSchema = new Schema({
	categoryId: { type: Schema.Types.ObjectId, ref: 'Quiz', require: true },
	questions: { type: [QueSchema], require: true }
})

const QuestionModel = model('Quesitons', QuestionSchema)
export default QuestionModel
