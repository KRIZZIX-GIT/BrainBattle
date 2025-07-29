import 'dotenv/config'
import { Request, Response } from 'express'
import quizService from '../services/quiz-service'

class QuizController {
    async quizzes(req: Request, res: Response) {
        try {
            const page = req.query.page ? +req.query.page : 1
            const pageSize = req.query.pageSize ? +req.query.pageSize : 20
            const sortType = (req.query.sortType as string) || 'date'
            const type = req.query.type as string
        
            const data = await quizService.quizzes(page, pageSize, sortType, type)
            res.json(data)
        } catch (error) {
            console.error("Ошибка:", (error as Error).message)
            res.status(500).json({ error: "Ошибка на сервере" })
        }
    }

    async quizById(req: Request, res: Response) {
        try {
            const { id } = req.params
            const quizz = await quizService.quizById(id)
    
            res.json(quizz)
        } catch (error) {
            console.error("Ошибка:", (error as Error).message)
            res.status(500).json({ error: "Ошибка на сервере" })
        }
    }

    async search(req: Request, res: Response) {
        try {
            const { prompt } = req.params
            const quizzes = await quizService.search(prompt)
    
            res.json(quizzes)
        } catch (error) {
            console.error("Ошибка:", (error as Error).message)
            res.status(500).json({ error: "Ошибка на сервере" })
        }
    }

    async addComment(req: Request, res: Response) {
        try {
            const { comment, quizId } = req.body
            const { refreshToken } = req.cookies 
            const quizzes = await quizService.addComment(comment, quizId, refreshToken)
    
            res.json(quizzes)
        } catch (error) {
            console.error("Ошибка:", (error as Error).message)
            res.status(500).json({ error: "Ошибка на сервере" })
        }
    }

    async translate(req: Request, res: Response) {
        try {
            const { text } = req.body
            console.log(req.body)
            const result = await quizService.translate(text)
    
            res.json(result)
        } catch (error) {
            console.error("Ошибка:", (error as Error).message)
            res.status(500).json({ error: "Ошибка на сервере" })
        }
    }

    async addLike(req: Request, res: Response) {
        try {
            const { quizId } = req.body
            const { refreshToken } = req.cookies
            const result = await quizService.addLike(quizId, refreshToken)
    
            res.json(result)
        } catch (error) {
            console.error("Ошибка:", (error as Error).message)
            res.status(500).json({ error: "Ошибка на сервере" })
        }
    }

    async getQuestionsByCategory(req: Request, res: Response) {
        try {
            const { id } = req.params
            const result = await quizService.getQuestionsByCategory(id)
        
            res.json(result)
        } catch (error) {
            console.error("Ошибка:", (error as Error).message)
            res.status(500).json({ error: "Ошибка на сервере" })
        }
    }
}

export default new QuizController()