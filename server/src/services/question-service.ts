import { Question } from './../Interfaces/IQuestion'
import QuestionModel from './../models/question-model'
import { QuizModel } from './../models/quiz-model'
import { v4 as uuidv4 } from 'uuid'
import { Cassiopeia } from 'cassiopeia-starlighter'
import "dotenv/config"
import { ApiError } from './../exceptions/api-errors'
import fs from "fs"

const examp = new Cassiopeia(process.env.CASSIOPEIA_EMAIL!, process.env.CASSIOPEIA_PASSWORD!)
examp.updateTokens()

class QuestionService {
	createQuiz = async (questions: Question[], title: string, image: string) => {
		console.log(image)
		const buffer = fs.readFileSync(image)
		const fileName = image.split('\\').pop()
		if (!fileName) {
		  	throw ApiError.UnauthorizedError()
		}
		const result = await examp.upload(buffer, fileName, true)
		console.log(result)
		if (!result || typeof result !== 'object' || !('uuid' in result)) {
			throw ApiError.UnauthorizedError()
		}
		const thisImage = 'https://cassiopeia-database-195be7295ffe.herokuapp.com/api/v1/files/public/' + result.uuid
		const yourQuiz = await QuizModel.create({
			quiz_name: title,
			category_id: uuidv4(),
			image: thisImage,
			TYPE: "Workshop"
		})
		const addQuestions = await QuestionModel.create({
			categoryId: yourQuiz._id,
			questions
		})
		console.log(addQuestions)
		return addQuestions
	}
	public async getQuizById(quizId: string) {
		return await QuestionModel.findById(quizId).exec()
	}
}
export default new QuestionService()
