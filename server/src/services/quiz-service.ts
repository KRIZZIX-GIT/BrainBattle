import { ApiError } from '../exceptions/api-errors'
import axios from "axios"
import 'dotenv/config'
import { QuizModel } from "../models/quiz-model";
import OpenTDBQuestion from 'Interfaces/IOpenTDBQuestion';
import QuizAPIQuestion from 'Interfaces/IQuizAPIQuestion';
import TheTriviaAPIQuestion from 'Interfaces/ITheTriviaAPIQuestion';
import { translate } from '@vitalets/google-translate-api';
import userModel from '../models/user-model'
import tokenService from '../services/token-service'
import mongoose from "mongoose"


interface IComment {
    _id: mongoose.Types.ObjectId
    username: string
    avatar: string | null
    comment: string
}

class QuizService {
    async quizzes(page: number, pageSize: number, sortType: string, type?: string) {
        const skip = (page - 1) * pageSize;
    
        let sortPipeline: any = [];
    
        if (type) {
            sortPipeline.push({ $match: { TYPE: type } });
        }
    
        switch (sortType) {
            case 'likes':
                sortPipeline.push({
                    $addFields: {
                        likesCount: { $size: "$likes" },
                    },
                });
                sortPipeline.push({ $sort: { likesCount: -1 } });
                break;
    
            case 'comments':
                sortPipeline.push({
                    $addFields: {
                        commentsCount: { $size: "$comments" },
                    },
                });
                sortPipeline.push({ $sort: { commentsCount: -1 } });
                break;
    
            case 'date':
                sortPipeline.push({ $sort: { _id: -1 } });
                break;
    
            default:
                break; 
        }
    
        sortPipeline.push(
            { $skip: skip },
            { $limit: pageSize }
        );
    
        const quizzes = await QuizModel.aggregate(sortPipeline);
    
        const totalQuizzes = await QuizModel.countDocuments(type ? { TYPE: type } : {});
        const totalPages = Math.ceil(totalQuizzes / pageSize);
    
        return {
            quizzes,
            totalPages,
        };
    }
    

    async quizById(id: string) {
        const quiz = await QuizModel.findById(id)
        if (!quiz) throw ApiError.BadRequest('Quiz not found')
        return quiz
    }

    async search(searchTerm: string) {
        const results = await QuizModel.find({
            quiz_name: { $regex: searchTerm, $options: 'i' }
        }).limit(6);
        if (!results) throw ApiError.BadRequest('Quizzes not found')
        return results;
    }

    async addComment(comment: string, quizId: string, refreshToken: string | null | undefined) {

        if (!refreshToken) throw ApiError.UnauthorizedError();
    
        const userData = await tokenService.validateRefreshToken(refreshToken);
    
        if (!userData || typeof userData !== 'object' || !('email' in userData)) {
            throw ApiError.UnauthorizedError();
        }
    
        const user = await userModel.findOne({ email: userData.email });
        if (!user) throw ApiError.UnauthorizedError();
    
        const quiz = await QuizModel.findById(quizId);
        if (!quiz) throw ApiError.BadRequest('Quiz not found');
    
        const avatar = typeof user.avatar === 'string' ? user.avatar : null;
        const commentData: IComment = {
            _id: new mongoose.Types.ObjectId(), 
            username: user.username,
            avatar,
            comment
        };
    
        quiz.comments.push(commentData);
        await quiz.save();
    
        const thisQuiz = quiz.comments.find((el) => el._id == commentData._id);
    
        return thisQuiz; 
    }

    async translate(text: string) {
        const result = await translate(text, { to: 'ru' });
        return result.text
    }

    async addLike(quizId: string, refreshToken: string) {
        if (!refreshToken) throw ApiError.UnauthorizedError()
    
        // Проверка и валидация токена
        const userData = await tokenService.validateRefreshToken(refreshToken)
        if (!userData || typeof userData !== 'object' || !userData || !('email' in userData)) {
            throw ApiError.UnauthorizedError();
        }
    
        const user = await userModel.findOne({ email: userData.email })
        if (!user) throw ApiError.UnauthorizedError()
    
        const quiz = await QuizModel.findById(quizId)
        if (!quiz) throw ApiError.BadRequest('Quiz not found')
    
        const isAlreadyLiked = quiz.likes.includes(user._id.toString())
    
        if (isAlreadyLiked) {
            quiz.likes = quiz.likes.filter(like => like !== user._id.toString())
            await quiz.save()
            return {msg: "unlike", userId: user._id.toString()}
        } else {
            quiz.likes.push(user._id.toString())
            await quiz.save()
            return {msg: "like", userId: user._id.toString()}
        }
    }

    async getQuestionsByCategory(id: string) {
        
        const quiz = await QuizModel.findById(id);
        if (!quiz) {
            throw ApiError.BadRequest('Квиз не найден');
        }
        
        let questionsData: Array<OpenTDBQuestion | QuizAPIQuestion | TheTriviaAPIQuestion>;
        
        if (quiz.TYPE === "OpenTDB") {
            const { data } = await axios.get<{ results: OpenTDBQuestion[] }>("https://opentdb.com/api.php", {
                params: {
                    amount: 10,
                    category: quiz.category_id,
                    type: "multiple",
                },
            });
    
            if (!data.results.length) {
                throw ApiError.BadRequest('Не удалось получить вопросы из OpenTDB');
            }
    
            questionsData = data.results.map((question) => ({
                question: question.question,
                correct_answer: question.correct_answer,
                incorrect_answers: question.incorrect_answers,
            }));
        } else if (quiz.TYPE === 'quizapi') {
            const { data } = await axios.get<QuizAPIQuestion[]>('https://quizapi.io/api/v1/questions', {
              params: {
                apiKey: process.env.QUIZ_API_KEY!,
                category: quiz.quiz_name,
                limit: 10,
              },
            });
          
            questionsData = data.map((question: any) => {
              const correctAnswer = question.correct_answer || question.answers.answer_a; 
          
              return {
                question: question.question,
                hint: question.description || '', 
                correctAnswer: correctAnswer,
                incorrectAnswers: Object.values(question.answers)
                  .filter((answer): answer is string => answer !== null && answer !== correctAnswer),
              };
            });
          } else if (quiz.TYPE === "the-trivia-api") {
            const { data } = await axios.get<TheTriviaAPIQuestion[]>("https://the-trivia-api.com/api/questions", {
                params: {
                    amount: 10,
                    category: quiz.category_id, 
                },
            })
    
            if (!data.length) {
                throw ApiError.BadRequest('Не удалось получить вопросы из the-trivia-api');
            }
    
            questionsData = data.map((question) => ({
                question: question.question,
                correct_answer: question.correctAnswer,
                incorrect_answers: question.incorrectAnswers,
            }));
        } else {
            throw ApiError.BadRequest('Неподдерживаемый тип источника для получения вопросов');
        }

        return {
            quiz_name: quiz.quiz_name,
            questions: questionsData,
        }
    }
}
export default new QuizService()