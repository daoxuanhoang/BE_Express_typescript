import { NextFunction, Request, Response } from 'express'
import mongoose from 'mongoose'
import { validateInputString } from '../services/validate'
import { UserProvider } from './../models/user-providers'
import jwt from 'jsonwebtoken'
import _ from 'lodash'
import UserTokens from '../models/user-tokens'
import { Users } from '../models/users'
import { getPaginationParams } from '../utils/constants'
import { Password } from '../services/password'

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

const getUserId = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { _id } = req.params

        await Users.findOne({ _id: _id }).then(data => {
            if (!data) {
                return res.status(404).send({
                    success: false,
                    data: null,
                    message: "user not found with id " + _id
                });
            }
            return res.status(200).send({ message: "success", success: true, data })
        })
    } catch (error) {
        console.log(error);
        res.status(500).send({
            message: "Error Something went wrong",
            error,
        })
    }
}

const getUser = async (req: Request, res: Response, next: NextFunction) => {
    const { page = 1, perPage = 10, search = '' } = req.query
    const { value, type } = validateInputString(search as string)
    const { skip, limit } = getPaginationParams(page, perPage)
    const sort: Record<string, any> = { score: { $meta: 'textScore' } }

    if (!search || !value) {
        const data = await Users.aggregate([{ $skip: skip }, { $limit: limit }])
        const [{ total }] = await Users.aggregate([{ $count: 'total' }])
        return res.status(200).send({ data, page, perPage, total, search })
    }

    // Nếu type là email, chỉ lấy username của email để check email
    const s = type === 'EMAIL' ? value.replace(/(@.+.com)$/, '') : value
    const match = { $text: { $search: decodeURIComponent(search as string) } }

    const [{ data, total }] = await Users.aggregate()
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

    res.status(200).send({ data, page, perPage, total, search: s })
}

const updateAuth = (req: Request, res: Response, next: NextFunction) => {
    const { _id } = req.params

    return Users.findById({ _id: _id })
        .then((auth) => {
            if (auth) {
                auth.set(req.body)
                return auth
                    .save()
                    .then((auth) => res.status(201).send({ message: "Success", success: true, data: auth }))
                    .catch((error) => res.status(500).send({ message: error, success: false, data: null }))
            } else {
                return res.status(404).json({ message: 'not found', success: false, data: null })
            }
        })
        .catch((error) => res.status(500).send({ message: error, success: false, data: null }))
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
        return res.status(200).send({ success: false, data: null, message: 'Email/Phone must be valid', errors: [{ field: 'email', message: 'Email/Phone must be valid ', code: 'error_email_phone' }] })
    }
    if (password.length < 4) {
        return res.status(200).send({ success: false, data: null, message: 'Invalid password', errors: [{ field: 'password', message: 'Invalid password', code: 'password_invalid' }] })
    }
    const existingUser = await UserProvider.findOne({ uId: value, type: type })

    if (!existingUser) {
        return res.status(200).send({ success: false, data: null, message: 'Invalid email', errors: [{ field: email, message: 'Invalid email', code: 'email_invalid' }] })
    }

    const passwordMatch = Password.compare(existingUser.password, password)
    if (!passwordMatch) {
        return res.status(200).send({ success: false, data: null, message: 'Invalid credentials', errors: [{ field: 'password', message: 'Invalid credentials', code: 'password_not_match' }] })
    }

    const user = await Users.findById({ _id: existingUser.userId }).select('_id name avatar birthday email phone gender status lang mode')

    // Generate JWT
    const payload = {
        id: user?._id,
        name: user?.name,
        avatar: user?.avatar,
        birthday: user?.birthday,
        email: user?.email,
        phone: user?.phone,
        gender: user?.gender,
        status: user?.status,
        lang: user?.lang,
        mode: user?.mode
    }

    const accessToken = jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1h' })

    // res.cookie('user', payload, { httpOnly: true, secure: true, maxAge: 31536000000 }).cookie('accessToken', accessToken, {
    //     httpOnly: false,
    //     secure: false,
    //     maxAge: 31536000000
    // })

    await UserTokens.create({ userId: user?.id, token: accessToken, data: { ip: req.ip, agent: req.headers['user-agent'] } })

    res.status(200).send({ data: { accessToken, data: user }, success: true, message: 'Đăng nhập thành công!' })
}

export default { createAuth, getUser, getUserId, updateAuth, deleteUser, login }
