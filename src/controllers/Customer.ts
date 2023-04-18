import { NextFunction, Request, Response } from 'express'
import Customers from '../models/Customers'

const readAll = (req: Request, res: Response, next: NextFunction) => {
    return Customers.find()
        .then((customers) => res.status(200).json({ customers }))
        .catch((error) => res.status(500).json({ error }))
}

export default { readAll }
