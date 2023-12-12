import mongoose, { Document, Schema } from 'mongoose'
import { nanoid } from 'nanoid'

export interface IUser {
    name: string
    phone: string
    email: string
    status: string
    birthday: string
    avatar: string,
    cover: string,
    gender: string,
    lang: string,
    mode: string
}

export interface IUserModel extends IUser, Document { }

const UserSchema: Schema = new Schema(
    {
        name: { type: String, required: true, default: null },
        avatar: { type: String, default: null },
        cover: { type: String, default: null },
        email: { type: String, required: true, default: null },
        phone: { type: String, required: true, default: null },
        birthday: { type: Date, default: new Date() },
        gender: { type: String, default: 'male', enum: ['male', 'female', 'other'] },
        status: { type: String, default: 1, enum: [1, 0] },
        lang: { type: String, default: 'vi', enum: ['vi', 'en'] },
        mode: { type: String, default: "light", enum: ["light", "dark"] }
    },
    {
        timestamps: true,
        versionKey: false
    }
)

UserSchema.clearIndexes()
UserSchema.index({ _id: 'text', name: 'text', phone: 'text', email: 'text' })

UserSchema.methods.toJSON = function () {
    var obj = this.toObject()
    // obj.nationalId = encrypt(JSON.stringify(obj.nationalId), process.env.JWT_KEY as string)
    return obj
}

const Users = mongoose.model<IUser>('User', UserSchema)

export { Users }
