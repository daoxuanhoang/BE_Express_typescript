import { string } from 'joi'
import mongoose, { Document, Schema } from 'mongoose'

export interface IAuthor {
    name: string
    userName: string
    passWord: string
    token: string
}

export interface IAuthorModel extends IAuthor, Document {}

const AuthorSchema: Schema = new Schema(
    {
        name: { type: String, required: true },
        userName: { type: String, required: true },
        passWord: { type: String, required: true },
        token: { type: String, required: true }
    },
    {
        versionKey: false
    }
)

export default mongoose.model<IAuthorModel>('Auth', AuthorSchema)
