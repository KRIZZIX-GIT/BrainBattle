export type ILeaderboard = {
    quiz_name: string
    quizId: string
    score: number
}

export type IUser = {
    surname: string
    name: string
    username: string
    email: string
    avatar?: string | null
    isActivated: boolean
    leaderboard?: ILeaderboard[] | null
    id: string
}