import { create } from 'zustand'
import axios, { AxiosError } from "axios"
import { PREFIX } from '../src/config/api.config'

interface IComment {
    _id: string
    username: string
    avatar: string
    comment: string
}

interface ILeaderboard {
    _id: string
    userId: string
    username: string
    avatar: string | null
    score: number
}

interface IQuizzes {
    _id: string
    quiz_name: string
    category_id: number | string
    image: string
    likes: string[]  
    TYPE: string
    leaderboard?: ILeaderboard[]
    comments: IComment[]
}

interface IQuizResponse {
    quizzes: IQuizzes[]
    totalPages: number
    type: string | null
}

interface IQuestions {
    title: string
    correctAnswer: string
    incorrectAnwers: string[]
}

interface IQuestionsFromDB {
    _id: string
    categoryId: string
    questions: IQuestions[]
}

interface QuizzesState {
    quizzes: IQuizzes[]
    errorText: string
    totalPages: number
    addQuiz: (formData: FormData, errorMes: string) => Promise<IQuestionsFromDB>
    getQuizzes: (page: number, pageSize: number, sortType: string, type?: string) => Promise<IQuizResponse>
    searchQuizzes: (prompt: string) => Promise<IQuizzes[]>
    quizById: (id: string) => Promise<IQuizzes>
    addComment: (comment: string, quizId: string) => Promise<IComment>
    addLike: (quizId: string) => Promise<{ msg: string, userId: string }> 
}


export const quizzesStore = create<QuizzesState>()((set) => ({
    quizzes: [],
    errorText: '',
    totalPages: 0,

    addQuiz: async (formData: FormData, errorMes: string) => {
        try {
            const response = await axios.post(`${PREFIX}/api/addQuiz`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            })
            return response.data
        } catch (err: any) {
            let errorMessage = 'Ошибка соединения'
            if (err instanceof AxiosError) {
                errorMessage = err.response?.data.message || 'Ошибка соединения'
            } else if (err.request) {
                errorMessage = errorMes
            }
            set({ errorText: errorMessage })
            setTimeout(() => {
                set({ errorText: '' })
            }, 5000)
            throw new Error(errorMessage)
        }
    },

    getQuizzes: async (page: number, pageSize: number, sortType: string, type?: string) => {
        try {
            const { data } = await axios.get(`${PREFIX}/api/quizzes`, {
                params: { page, pageSize, sortType, type }, 
            })
            set({
                quizzes: data.quizzes,
                totalPages: data.totalPages
            })
            return data 
        } catch (err: any) {
            let errorMessage = 'Ошибка соединения'
            if (err instanceof AxiosError) {
                errorMessage = err.response?.data.message || 'Ошибка соединения'
            } else if (err.request) {
                errorMessage = 'Нет ответа от сервера'
            }
            set({ errorText: errorMessage })
            setTimeout(() => {
                set({ errorText: '' })
            }, 5000)
            throw new Error(errorMessage)
        }
    },
    

    searchQuizzes: async (prompt: string) => {
        try {
            const { data } = await axios.get(`${PREFIX}/api/search/${prompt}`)
            set({ quizzes: data }) // Обновление состояния викторин
            return data
        } catch (err: any) {
            let errorMessage = 'Ошибка соединения'
            if (err instanceof AxiosError) {
                errorMessage = err.response?.data.message || 'Ошибка соединения'
            } else if (err.request) {
                errorMessage = 'Нет ответа от сервера'
            }
            set({ errorText: errorMessage })
            setTimeout(() => {
                set({ errorText: '' })
            }, 5000)
            throw new Error(errorMessage)
        }
    },

    quizById: async (id: string) => {
        try {
            const { data } = await axios.get(`${PREFIX}/api/quiz/${id}`)
            return data
        } catch (err: any) {
            let errorMessage = 'Ошибка соединения'
            if (err instanceof AxiosError) {
                errorMessage = err.response?.data.message || 'Ошибка соединения'
            } else if (err.request) {
                errorMessage = 'Нет ответа от сервера'
            }
            set({ errorText: errorMessage })
            setTimeout(() => {
                set({ errorText: '' })
            }, 5000)
            throw new Error(errorMessage)
        }
    },

    addComment: async (comment: string, quizId: string) => {
        try {
            const response = await axios.post(`${PREFIX}/api/comment`, { comment, quizId }, { withCredentials: true })
        
            if (response.data) {
                set((state) => ({
                    quizzes: state.quizzes.map(quiz =>
                        quiz._id === quizId
                        ? {
                            ...quiz,
                            comments: [...quiz.comments, response.data.comment] // Добавляем новый комментарий
                        }
                        : quiz
                    ),
                }))
            }
            console.log(response.data)
            return response.data
      
        } catch (error: any) {
            let errorMessage = 'Ошибка соединения'
            if (error instanceof AxiosError) {
                console.log(error)
                errorMessage = error.response?.data.message || 'Ошибка соединения'
            } else if (error.request) {
                errorMessage = 'Нет ответа от сервера'
            }
        
            set({ errorText: errorMessage })
            setTimeout(() => {
                set({ errorText: '' })
            }, 5000)
      
          throw new Error(errorMessage)
        }
    },

    addLike: async (quizId: string) => {
        try {
            const response = await axios.post(`${PREFIX}/api/like`, { quizId }, { withCredentials: true })
    
            if (response.data) {
                set((state) => ({
                    quizzes: state.quizzes.map(quiz => 
                        quiz._id === quizId
                            ? { 
                                ...quiz, 
                                likes: response.data.msg === 'like' 
                                    ? [...quiz.likes, response.data.userId] // Добавляем лайк
                                    : quiz.likes.filter(like => like !== response.data.userId) // Удаляем лайк
                            }
                            : quiz
                    ),
                }))
            }
            return response.data
        } catch (error: any) {
            let errorMessage = 'Ошибка соединения'
            if (error instanceof AxiosError) {
                errorMessage = error.response?.data.message || 'Ошибка соединения'
            } else if (error.request) {
                errorMessage = 'Нет ответа от сервера'
            }
            set({ errorText: errorMessage })
            setTimeout(() => {
                set({ errorText: '' })
            }, 5000)
            throw new Error(errorMessage)
        }
    }
}))