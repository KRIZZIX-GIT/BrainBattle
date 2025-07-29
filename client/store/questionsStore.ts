import { create } from 'zustand'

export interface Question {
	title: string
	id: number
	correctAnswer: string
	incorrectAnswers: string[]
}

interface QuizStore {
	quiz: Question[] 
	setQuiz: (quiz: Question[]) => void 
}

export const useQuizStore = create<QuizStore>(set => ({
	quiz: [],
	setQuiz: quiz => set({ quiz }) 
	
}))
