import { NextFunction, Request, Response } from 'express'
import _ from 'lodash'
import { Posts } from '../models/post'
import { Files } from '../models/file'
import { Users } from '../models/users'
import { getPaginationParams } from '../utils/constants'
import mongoose from 'mongoose'

const getPosts = async (req: Request, res: Response, next: NextFunction) => {
    const { page = 1, perPage = 10, search = '' } = req.query
    const { skip, limit } = getPaginationParams(page, perPage)
    const sort: Record<string, any> = { createdAt: -1 }

    if (!search) {
        const cursor = await Posts.aggregate([{ $sort: sort }, { $skip: skip }, { $limit: limit }])
        if (cursor?.length > 0) {
            const [{ total }] = await Posts.aggregate([{ $count: 'total' }])
            return res.status(200).send({ message: "lấy dữ liệu thành công!", success: true, data: { result: cursor, page, perPage, total: total ?? 0, search } })
        }

        return res.status(200).send({ message: 'Không có dữ liệu', success: true, data: { result: cursor, page, perPage, total: 0, search } })
    }

    const match = { $text: { $search: decodeURIComponent(search as string) } }

    const [{ result, total }] = await Posts.aggregate()
        .match(match)
        .facet({
            result: [{ $sort: sort }, { $skip: skip }, { $limit: limit }, { $project: { _id: 1, user: 1, content: 1, media: 1, type: 1, likes: 1, comments: 1 } }],
            total: [{ $count: 'total' }]
        })
        .addFields({
            total: {
                $ifNull: [{ $arrayElemAt: ['$total.total', 0] }, 0]
            } as any
        })
    return res.status(200).send({ message: "Tìm kiếm thành công!", success: true, data: { result, page, perPage, total, search } })
}

const createPosts = async (req: Request, res: Response, next: NextFunction) => {
    const { type, user, media, content } = req.body
    const id = user?.id

    if (!content) return res.status(400).send({ message: "Nội dung không được để trống", success: false, data: null })

    if (!user) return res.status(400).send({ message: "user không được để trống!", success: false, data: null })

    if (!mongoose.isObjectIdOrHexString(id)) return res.status(400).send({ message: "userId không đúng định dạng!", success: false, data: null })

    const userc = await Users.findOne({ _id: id }).then(data => {
        if (!data) return null
        return data
    })

    if (!userc) return res.status(400).send({ message: "user không tồn tại!", success: false, data: null })

    const post = await Posts.create({ user, type, media, content })

    res.status(201).send({ message: "tạo bài viết thành công!", success: true, data: { result: post } })

}

const deletePosts = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params
        const post: any = await Posts.findOne({ _id: id }).then(data => {
            if (!data) {
                return res.status(404).send({
                    success: false, data: null, message: "Không có bài Post nào có id:" + id
                })
            }
            return data
        })

        if (post?.media.length > 0) {
            await post?.media?.map(async (file) => {
                await Files.findOneAndRemove({ filename: file?.slice(35) })
            });
        }

        await Posts.findByIdAndRemove({ _id: id }).then(data => {
            if (!data) {
                return res.status(404).send({
                    success: false,
                    data: null,
                    message: "Không có bài Post nào có id: " + id
                });
            }
            return res.status(201).send({ message: "Xóa thành công!", success: true, data: null })
        })
    } catch (error) {
        console.log("error:", error);
        res.status(500).send({
            message: "Error Something went wrong",
            error,
        })
    }
}

export default { getPosts, createPosts, deletePosts }