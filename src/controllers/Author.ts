import { NextFunction, Request, Response } from 'express'
import mongoose from 'mongoose'
import { validateInputString } from '../services/validate'
import { UserProvider } from './../models/user-providers'
import jwt, { JwtPayload } from 'jsonwebtoken'
import CryptoJS from 'crypto-js'
import _ from 'lodash'
import UserTokens from '../models/user-tokens'
import User from '../models/users'
import { getPaginationParams } from '../utils/constants'

const createAuth = (req: Request, res: Response, next: NextFunction) => {
    const { author, title } = req.body

    const auth = new UserProvider({
        _id: new mongoose.Types.ObjectId(),
        author,
        title
    })

    return auth
        .save()
        .then((auth) => res.status(201).json({ auth }))
        .catch((error) => res.status(500).json({ error }))
}

const getUserId = (req: Request, res: Response, next: NextFunction) => {
    const userId = req.params.useId

    return UserProvider.findById(userId)
        .populate('author')
        .then((user) => (user ? res.status(200).json({ user }) : res.status(404).json({ message: 'not found' })))
        .catch((error) => res.status(500).json({ error }))
}

const getUser = async (req: Request, res: Response, next: NextFunction) => {
    const { page = 1, perPage = 10, search = '' } = req.query
    const { value, type } = validateInputString(search as string)
    const { skip, limit } = getPaginationParams(page, perPage)
    const sort: Record<string, any> = { score: { $meta: 'textScore' } }

    if (!search || !value) {
        const data = await User.aggregate([{ $skip: skip }, { $limit: limit }])
        const [{ total }] = await User.aggregate([{ $count: 'total' }])
        return res.status(200).send({ data, page, perPage, total, search })
    }

    // Nếu type là email, chỉ lấy username của email để check email
    const s = type === 'EMAIL' ? value.replace(/(@.+.com)$/, '') : value
    const match = { $text: { $search: decodeURIComponent(search as string) } }

    const [{ data, total }] = await User.aggregate()
        .match(match)
        .facet({
            data: [{ $sort: sort }, { $skip: skip }, { $limit: limit }, { $project: { id: 1, name: 1, avatar: 1, email: 1, birthday: 1, phone: 1, gender: 1, status: 1 } }],
            total: [{ $count: 'total' }]
        })
        .addFields({
            total: {
                $ifNull: [{ $arrayElemAt: ['$total.total', 0] }, 0]
            } as any
        })

    res.status(200).send({ data, page, perPage, total, s })
}

const updateUser = (req: Request, res: Response, next: NextFunction) => {
    const authId = req.params.authId

    return UserProvider.findById(authId)
        .then((auth) => {
            if (auth) {
                auth.set(req.body)

                return auth
                    .save()
                    .then((auth) => res.status(201).json({ auth }))
                    .catch((error) => res.status(500).json({ error }))
            } else {
                return res.status(404).json({ message: 'not found' })
            }
        })
        .catch((error) => res.status(500).json({ error }))
}

const deleteUser = (req: Request, res: Response, next: NextFunction) => {
    const authId = req.params.authId

    return UserProvider.findByIdAndDelete(authId)
        .then((auth) => (auth ? res.status(201).json({ auth, message: 'Deleted' }) : res.status(404).json({ message: 'not found' })))
        .catch((error) => res.status(500).json({ error }))
}

const login = async (req: Request, res: Response, next: NextFunction) => {
    const { email, password } = req.body
    const { value, type } = validateInputString(email)

    if (!type || email?.length < 8) {
        return res.status(400).send({ errors: [{ field: 'email', message: 'Email/Phone must be valid ', code: 'error_email_phone' }] })
    }
    if (password.length < 4) {
        return res.status(400).send({ errors: [{ field: 'password', message: 'Invalid password', code: 'password_invalid' }] })
    }
    const existingUser = await UserProvider.findOne({ uId: value, type: type })

    if (!existingUser) {
        return res.status(400).send({ errors: [{ field: email, message: 'Invalid email', code: 'email_invalid' }] })
    }

    const user = await User.findOne({ id: existingUser.userId }).select('id name avatar birthday email phone gender status')

    // Generate JWT
    const payload = {
        id: user?.id,
        name: user?.name,
        avatar: user?.avatar,
        birthday: user?.birthday,
        email: user?.email,
        phone: user?.phone,
        gender: user?.gender,
        status: user?.status
    }

    const accessToken = jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '24h' })

    res.cookie('user', user, { httpOnly: true, secure: true, maxAge: 31536000000 }).cookie('accessToken', accessToken, {
        httpOnly: false,
        secure: false,
        maxAge: 31536000000
    })

    await UserTokens.create({ userId: user?.id, token: accessToken, data: { ip: req.ip, agent: req.headers['user-agent'] } })

    res.status(200).send({ accessToken, user })
}

export default { createAuth, getUser, getUserId, updateUser, deleteUser, login }
