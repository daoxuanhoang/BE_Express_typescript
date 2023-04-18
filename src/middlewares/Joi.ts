import Joi, { ObjectSchema } from 'joi'
import { NextFunction, Request, Response } from 'express'
import { IUser } from '../models/users'
import Logging from '../libraries/Logging'
import { IUserToken } from 'models/user-tokens'

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
            name: Joi.string().required()
        })
    },
    customer: {}
    // book: {
    //     create: Joi.object<IBook>({
    //         author: Joi.string()
    //             .regex(/^[0-9a-fA-F]{24}$/)
    //             .required(),
    //         title: Joi.string().required()
    //     }),
    //     update: Joi.object<IBook>({
    //         author: Joi.string()
    //             .regex(/^[0-9a-fA-F]{24}$/)
    //             .required(),
    //         title: Joi.string().required()
    //     })
    // }
}
