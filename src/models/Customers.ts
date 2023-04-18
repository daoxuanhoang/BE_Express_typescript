import mongoose, { Document, Schema } from 'mongoose'
import { nanoid } from 'nanoid'

export interface ICustomer {
    name: string
    address: string | number
    phone: number
    email: string
    avatar: string
    birthday: string
}

export interface ICustomerModel extends ICustomer, Document {}

const CustomerSchema: Schema = new Schema(
    {
        id: { type: String, require: true },
        name: { type: String, default: null, require: true },
        address: { type: String, default: null, require: true },
        email: { type: String, default: null, require: true },
        phone: { type: Number, default: null, require: true },
        birthday: { type: String, default: new Date(), require: true }
    },
    {
        timestamps: true,
        versionKey: false
    }
)

CustomerSchema.clearIndexes()
CustomerSchema.index({ id: 'text', name: 'text', phone: 'text', email: 'text' })

CustomerSchema.methods.toJSON = function () {
    var obj = this.toObject()
    // obj.nationalId = encrypt(JSON.stringify(obj.nationalId), process.env.JWT_KEY as string)
    return obj
}

export default mongoose.model<ICustomerModel>('Customer', CustomerSchema)
