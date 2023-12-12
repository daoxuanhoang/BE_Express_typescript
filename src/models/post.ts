import mongoose from 'mongoose'
import { nanoid } from 'nanoid'

export interface IPost {
    user: {
        id: string,
        name: string,
        image: string
    },
    media: any[],
    content: string,
    type: string,
    likes: {
        data: any[],
        total: number
    },
    comments: {
        data: any[],
        total: number
    }
}
export interface IPostModel extends IPost, Document { }

const PostSchema = new mongoose.Schema(
    {
        user: {
            id: { type: String, default: null },
            name: { type: String, default: null },
            image: { type: String, default: null }
        },
        content: { type: String, default: null },
        media: { type: Array, default: [] },
        type: { type: String, default: 'post', enum: ['post', 'live'] },
        likes: {
            data: { type: Array, default: [] },
            total: { type: Number, default: 0 }
        },
        comments: {
            data: { type: Array, default: [] },
            total: { type: Number, default: 0 }
        },
    },
    { timestamps: true }
)
PostSchema.clearIndexes()
PostSchema.index({ content: 'text' })

const Posts = mongoose.model<IPost>('u.posts', PostSchema)

export { Posts }
