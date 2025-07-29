import mongoose from "mongoose"

export default interface IUserRequestBody {
    _id: mongoose.Types.ObjectId;
    name: string;
    surname: string;
    username: string;
    email: string;
    password: string;
    avatar?: string;
    isActivated: boolean
    activationLink: string
    sub?: string;
}