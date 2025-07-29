export type IComment = {
    _id: string
    username: string
    avatar: string | null
    comment: string
}

export type ILeaderboard = {
    _id: string
    userId: string
    username: string
    avatar: string | null
    score: number
}

export type IQuizzes = {
    _id: string
    quiz_name: string
    category_id: number | string
    image: string
    likes: string[]  
    TYPE: string
    leaderboard?: ILeaderboard[]
    comments: IComment[]
    isLiked?: boolean
}