import Joi, { ObjectSchema } from 'joi'
import { NextFunction, Request, Response } from 'express'
import { IUser } from '../models/users'
import Logging from '../libraries/Logging'
import { IUserToken } from 'models/user-tokens'
import { ILogin } from 'utils/constants'

export const ValidateJoi = (schema: ObjectSchema) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            await schema.validateAsync(req.body)
            next()
        } catch (error) {
            Logging.error(error)

            return res.status(422).json({ error })
        }
    }
}

export const Schemas = {
    author: {
        create: Joi.object<IUser>({
            name: Joi.string().required(),
            avatar: Joi.string().required()
        }),
        update: Joi.object<IUser>({
            name: Joi.string().required(),
            avatar: Joi.string().required(),
            lang: Joi.string().required(),
            birthday: Joi.date().required(),
            email: Joi.string().required(),
            gender: Joi.string().required(),
            phone: Joi.number().required(),
            status: Joi.number().required(),
        }),
        login: Joi.object<ILogin>({
            email: Joi.string().required(),
            password: Joi.string().required()
        })
    },
}
