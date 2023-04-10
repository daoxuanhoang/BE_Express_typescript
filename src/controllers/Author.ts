import { NextFunction, Request, Response } from 'express'
import mongoose from 'mongoose'
import Auth from '../models/Author'

const createAuth = (req: Request, res: Response, next: NextFunction) => {
    const { author, title } = req.body

    const auth = new Auth({
        _id: new mongoose.Types.ObjectId(),
        author,
        title
    })

    return auth
        .save()
        .then((auth) => res.status(201).json({ auth }))
        .catch((error) => res.status(500).json({ error }))
}

const readAuth = (req: Request, res: Response, next: NextFunction) => {
    const authId = req.params.authId

    return Auth.findById(authId)
        .populate('author')
        .then((auth) => (auth ? res.status(200).json({ auth }) : res.status(404).json({ message: 'not found' })))
        .catch((error) => res.status(500).json({ error }))
}

const readAll = (req: Request, res: Response, next: NextFunction) => {
    return Auth.find()
        .then((auths) => res.status(200).json({ auths }))
        .catch((error) => res.status(500).json({ error }))
}

const updateAuth = (req: Request, res: Response, next: NextFunction) => {
    const authId = req.params.authId

    return Auth.findById(authId)
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

const deleteAuth = (req: Request, res: Response, next: NextFunction) => {
    const authId = req.params.authId

    return Auth.findByIdAndDelete(authId)
        .then((auth) => (auth ? res.status(201).json({ auth, message: 'Deleted' }) : res.status(404).json({ message: 'not found' })))
        .catch((error) => res.status(500).json({ error }))
}

const login = (req: Request, res: Response, next: NextFunction) => {}

export default { createAuth, readAuth, readAll, updateAuth, deleteAuth }
