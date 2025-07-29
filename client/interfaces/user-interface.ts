interface ResponseMessage {
    message: string
    status: number
}

interface ILeaderboard {
    _id: string
    quiz_name: string
    quizId: string
    score: number
}

interface UserResponse {
    user: {
        surname: string
        name: string
        username: string
        email: string
        avatar?: string | null
        isActivated: boolean
        id: string
    }
    accessToken: string
    refreshToken: string
    message: string
    status: number
}

interface UserInterface {
    //store
    nicknameChange: (nickname: string, userId: string) => Promise<void>
    surnameChange: (surname: string, userId: string) => Promise<void>
    nameChange: (name: string, userId: string) => Promise<void>
    logout: () => Promise<void>
    deleteUser: () => Promise<void>
    ForgotPassword: (email: string) => Promise<void>
    veryfyResetCode: (email: string, code: string) => Promise<void>
    changePassword: (email: string, password: string) => Promise<void>
    newPassword: (oldPassword: string, newPassword: string, email: string) => Promise<void>

    user: {
        surname: string
        name: string
        username: string
        email: string
        avatar?: string | null
        isActivated: boolean
        leaderboard: ILeaderboard[]
        id: string
    } | null
    tokens: {
        accessToken: string
        refreshToken: string
    } | null
    errorText: string
    googleData: {
        email: string
        name: string
        surname: string
        avatar: string
        sub: string
    } | null
    facebookData: {
        email: string
        name: string
        surname: string
        avatar?: string
        sub: string
    } | null
    setError: (errorText: string) => void
    login: (info: { login: string, password: string }) => Promise<string>
    setGoogleData: (data: { email: string, name: string, surname: string, sub: string, avatar: string } | null) => void
    setFacebookData: (data: { email: string, name: string, surname: string, sub: string, avatar: string } | null) => void
    registration: (name: string, surname: string, nickname: string, email: string, password: string, avatar?: string, sub?: string) => Promise<UserResponse>
    googleAuth: (email: string, sub: string) => Promise<UserResponse>
    existenceUser: (email: string, name: string, surname: string) => Promise<ResponseMessage>
    setAvatar: (avatar: FormData) => Promise<void>
    checkAuth: () => Promise<boolean>
}

export default UserInterface