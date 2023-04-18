import mongoose, { Document, Schema } from 'mongoose'
import { nanoid } from 'nanoid'

export interface IUser {
    name: string
    phone: number
    email: string
    status: string
    birthday: string
    avatar: string
    gender: string
}

export interface IUserModel extends IUser, Document {}

const UserSchema: Schema = new Schema(
    {
        id: { type: String, default: 1, immutable: true },
        name: { type: String, required: true, default: null },
        avatar: { type: String, required: true, default: null },
        email: { type: String, required: true, default: null },
        birthday: { type: Date, default: new Date() },
        gender: { type: String, default: 'male', enum: ['male', 'female', 'other'] },
        status: { type: String, default: 1, enum: [1, 0] }
    },
    {
        timestamps: true,
        versionKey: false
    }
)

UserSchema.clearIndexes()
UserSchema.index({ id: 'text', name: 'text', phone: 'text', email: 'text' })

UserSchema.methods.toJSON = function () {
    var obj = this.toObject()
    // obj.nationalId = encrypt(JSON.stringify(obj.nationalId), process.env.JWT_KEY as string)
    return obj
}

export default mongoose.model<IUserModel>('User', UserSchema)
