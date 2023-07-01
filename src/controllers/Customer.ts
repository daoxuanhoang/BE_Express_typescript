import { NextFunction, Request, Response } from 'express'
import Customers from '../models/Customers'
import { getPaginationParams } from '../utils/constants'
import { BadRequestError } from '@v8dev/common'
import { validateInputString } from '../services/validate'

const readAll = async (req: Request, res: Response, next: NextFunction) => {
    const { page = 1, perPage = 10 } = req.query
    const { skip, limit } = getPaginationParams(page, perPage)
    if (+perPage < 1 || +page < 1) throw new BadRequestError('Invalid Params')
    const data = await Customers.find()
    return Customers.find()
        .then((customers) => res.status(200).json({ customers }))
        .catch((error) => res.status(500).json({ error }))
}

const getCustomer = async (req: Request, res: Response, next: NextFunction) => {
    const { page = 1, perPage = 10, search = '' } = req.query
    const { value, type } = validateInputString(search as string)
    const { skip, limit } = getPaginationParams(page, perPage)
    const sort: Record<string, any> = { score: { $meta: 'textScore' } }

    if (!search || !value) {
        const data = await Customers.aggregate([{ $skip: skip }, { $limit: limit }])
        const [{ total }] = await Customers.aggregate([{ $count: 'total' }])
        return res.status(200).send({ data, page, perPage, total, search })
    }

    // Nếu type là email, chỉ lấy username của email để check email
    const s = type === 'EMAIL' ? value.replace(/(@.+.com)$/, '') : value
    const match = { $text: { $search: decodeURIComponent(search as string) } }

    const [{ data, total }] = await Customers.aggregate()
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

export default { readAll, getCustomer }
