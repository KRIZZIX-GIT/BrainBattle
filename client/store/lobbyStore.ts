import { create } from 'zustand'

interface IComment {
    _id: string
    username: string
    avatar: string | null
    comment: string
}

interface IQuizzes {
    _id: string
    quiz_name: string
    category_id: number | string
    image: string
    likes: string[] 
    TYPE: string
    comments: IComment[]
}

interface QuizzesState {
    choosedQuiz: IQuizzes | null
    errorText: string
    volume: number
    setVolume: (volume: number) => void
    setChoosedQuiz: (quiz: IQuizzes) => void
}

export const useLobbyStore = create<QuizzesState>()((set) => ({
    choosedQuiz: null,
    errorText: '',
    volume: 0.8,
    setVolume: (volume: number) => {
        set({volume})
    },
    setChoosedQuiz: (quiz: IQuizzes) => {
        set({
            choosedQuiz: quiz
        })
    }
}))