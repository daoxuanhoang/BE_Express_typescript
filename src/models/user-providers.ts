import mongoose from 'mongoose'

export interface IUserProvider {
    userId: mongoose.Types.ObjectId
    uId: string
    type: string
    password: string
    resetPassword: string
}
export interface IAuthorModel extends IUserProvider, Document { }

const userProvidersSchema = new mongoose.Schema(
    {
        userId: { type: mongoose.Types.ObjectId, require: true },
        uId: { type: String },
        type: { type: String, enum: ['EMAIL', 'PHONE', 'FACEBOOK', 'GOOGLE', 'USERNAME', 'APPLE'] },
        password: { type: String, default: null },
        resetPassword: { type: String, default: null }
    },
    { timestamps: true }
)

const UserProvider = mongoose.models.UserProviders || mongoose.model<IUserProvider>('UserProvider', userProvidersSchema)

export { UserProvider }
