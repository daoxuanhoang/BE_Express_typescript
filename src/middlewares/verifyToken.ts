import { NextFunction, Request, Response } from 'express'
import jwt from 'jsonwebtoken'
import { UserProvider } from '../models/user-providers'
require('dotenv')

interface TokenPayload {
    id: string
    iat: number
    exp: number
}

export const verifyToken = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '')

        if (!token) {
            return res.status(401).json({ message: 'No token, authorization denied' })
        }
        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET) as TokenPayload

        const user = await UserProvider.findById(decoded.id).select('-password')

        if (!user) return res.status(404).json({ message: 'User not found' })
        req.user = user
        console.log(req.user)

        next()
    } catch (err) {
        console.error(err)
        res.status(500).json({ message: 'Server error' })
    }
}
