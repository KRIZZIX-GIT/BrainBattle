import { Request, Response } from 'express'
import QuestionService from './../services/question-service'
import { ApiError } from './../exceptions/api-errors'
import { deleteFile } from '../middlewares/multer-middleware'

class QuestionController {
	public async addQuiz(req: Request, res: Response): Promise<void> {
		try {
			const { title, questions } = req.body
			const avatarPath = req.file ? req.file.path : null
			console.log(req.body)
			if (!avatarPath) throw ApiError.BadRequest('Необходимо загрузить аватарку')
			const arrayQuestions = JSON.parse(questions)
			if (!title || !Array.isArray(arrayQuestions)) {
				res.status(400).json({ message: 'Invalid quiz data' })
			}

			const newQuiz = await QuestionService.createQuiz(arrayQuestions, title, avatarPath)
			deleteFile(req)
			res.status(201).json(newQuiz)
		} catch (error: any) {
			console.error('Error in addQuiz:', error.message)
			res.status(500).json({ error: 'Server error' })
		}
	}
	public async getQuiz(req: Request, res: Response) {
		try {
			const quizId = req.params.id

			if (!quizId) {
				res.status(400).json({ message: 'Quiz ID is required' })
				return
			}

			const quiz = await QuestionService.getQuizById(quizId)

			if (!quiz) {
				res.status(404).json({ message: 'Quiz not found' })
				return
			}

			res.status(200).json(quiz)
		} catch (error: any) {
			console.error('Error in getQuiz:', error.message)
			res.status(500).json({ error: 'Server error' })
		}
	}
}

export default new QuestionController()
