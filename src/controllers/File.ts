import { NextFunction, Request, Response } from 'express'
import _ from 'lodash'
import { Files } from '../models/file'
import { getPaginationParams } from '../utils/constants'
import { uploadFilesMiddleware } from '../middlewares/upload'

const getFiles = async (req: Request, res: Response, next: NextFunction) => {
    const { page = 1, perPage = 10, search = '' } = req.query
    const { skip, limit } = getPaginationParams(page, perPage)
    const sort: Record<string, any> = { score: { $meta: 'textScore' } }

    if (!search) {
        const data = await Files.aggregate([{ $skip: skip }, { $limit: limit }])
        const [{ total }] = await Files.aggregate([{ $count: 'total' }])
        return res.status(200).send({ data, page, perPage, total, search })
    }

    const match = { $text: { $search: decodeURIComponent(search as string) } }

    const [{ data, total }] = await Files.aggregate()
        .match(match)
        .facet({
            data: [{ $sort: sort }, { $skip: skip }, { $limit: limit }, { $project: { id: 1, filename: 1, contentType: 1, uploadDate: 1, chunkSize: 1, length: 1 } }],
            total: [{ $count: 'total' }]
        })
        .addFields({
            total: {
                $ifNull: [{ $arrayElemAt: ['$total.total', 0] }, 0]
            } as any
        })

    res.status(200).send({ data, page, perPage, total, search })
}

const uploadFiles = async (req: any, res: Response, next: NextFunction) => {
    try {
        await uploadFilesMiddleware(req, res);
        if (req?.files?.length as any <= 0) {
            return res
                .status(400)
                .send({ message: "You must select at least 1 file." });
        }

        return res.status(200).send({
            message: "Files have been uploaded.",
        });
        // if (req.file == undefined) {
        //     return res.send({
        //         message: "You must select a file.",
        //     });
        // }
        // return res.send({
        //     message: "File has been uploaded.",
        // });
    } catch (error: any) {
        console.log(error);

        if (error.code === "LIMIT_UNEXPECTED_FILE") {
            return res.status(400).send({
                message: "Too many files to upload.",
            });
        }
        return res.status(500).send({
            message: `Error when trying upload many files: ${error}`,
        });

        // return res.send({
        //     message: "Error when trying upload image: ${error}",
        // });
    }
};

export default { getFiles, uploadFiles }