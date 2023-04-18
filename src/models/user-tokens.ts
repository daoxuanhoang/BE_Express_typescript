import mongoose from 'mongoose'

export interface IUserToken {
    userId: string
    token: string
    data: any
}

const userTokensSchema = new mongoose.Schema({
    userId: { type: String },
    token: { type: String },
    data: { type: Object, default: Date.now, expires: 365 * 24 * 60 * 60 }
})

const UserTokens = mongoose.models.UserTokens || mongoose.model('UserToken', userTokensSchema)

export default UserTokens
