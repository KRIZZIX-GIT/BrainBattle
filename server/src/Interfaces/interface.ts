import mongoose from "mongoose"

interface ILeaderboard {
    quiz_name: string
    quizId: mongoose.Types.ObjectId
    score: number
}

interface IUser {
    surname: string;
    name: string;
    username: string;
    email: string;
    avatar?: string | null; // Обновлено здесь
    isActivated: boolean;
    _id: mongoose.Types.ObjectId;
    password: string; // Пожалуйста, добавьте недостающие поля
    activationLink: string; // Пожалуйста, добавьте недостающие поля
    sub?: string | null; // Обновлено для совместимости
    leaderboard?: ILeaderboard[] | null
}
export default IUser;