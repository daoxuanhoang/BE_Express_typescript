import { NextFunction, Request, Response } from 'express'
import _ from 'lodash'
import { Files } from '../models/file'
import { getPaginationParams } from '../utils/constants'
import { uploadFilesMiddleware } from '../middlewares/upload'
import { config } from '../config/config'
import { GridFSBucket, MongoClient } from "mongodb"

const url = config.mongoUrl

const mongoClient = new MongoClient(url)

const getFiles = async (req: Request, res: Response, next: NextFunction) => {
    const { page = 1, perPage = 10, search = '' } = req.query
    const { skip, limit } = getPaginationParams(page, perPage)
    const sort: Record<string, any> = { uploadDate: -1 }
    const baseUrl = "http://localhost:3001/api/v1/files/";

    if (!search) {
        const cursor = await Files.aggregate([{ $sort: sort }, { $skip: skip }, { $limit: limit }])
        let fileInfos = <any[]>[];
        await cursor.forEach((doc) => {
            fileInfos.push({
                id: doc._id,
                name: doc.filename.toLowerCase().split(' ').join('_'),
                url: baseUrl + doc.filename.toLowerCase().split(' ').join('_'),
            });
        });
        const [{ total }] = await Files.aggregate([{ $count: 'total' }])
        return res.status(200).send({ message: "success", success: true, data: { result: fileInfos, page, perPage, total, search } })
    }

    const match = { $text: { $search: decodeURIComponent(search as string) } }

    const [{ result, total }] = await Files.aggregate()
        .match(match)
        .facet({
            result: [{ $sort: sort }, { $skip: skip }, { $limit: limit }, { $project: { id: 1, filename: 1, contentType: 1, uploadDate: 1, chunkSize: 1, length: 1 } }],
            total: [{ $count: 'total' }]
        })
        .addFields({
            total: {
                $ifNull: [{ $arrayElemAt: ['$total.total', 0] }, 0]
            } as any
        })

    let fileInfos = <any[]>[];
    await result.forEach((doc) => {
        fileInfos.push({
            id: doc._id,
            name: doc.filename.toLowerCase().split(' ').join('_'),
            url: baseUrl + doc.filename.toLowerCase().split(' ').join('_'),
        });
    });

    res.status(200).send({ message: "success", success: true, data: { result: fileInfos, page, perPage, total, search } })
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
            success: true,
            data: null
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

const download = async (req: any, res: Response, next: NextFunction) => {

    try {
        await mongoClient.connect()
        const bucket = new GridFSBucket(mongoClient.db("Product"), { bucketName: config.imgBucket })

        let downloadStream = bucket.openDownloadStreamByName(
            req.params.name
        )

        downloadStream.on("data", function (data) {
            return res.status(200).write(data)
        })

        downloadStream.on("error", function (data) {
            return res.status(404).send({
                message: "Image not found.",
                success: false,
                data: null
            })
        })

        downloadStream.on("end", () => {
            return res.end()
        })

    } catch (error) {
        console.log(error);
        res.status(500).send({
            message: "Error Something went wrong",
            error,
        })
    }

}

const deleteFile = async (req: any, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params

        await Files.findByIdAndRemove({ _id: id }).then(data => {
            if (!data) {
                return res.status(404).send({
                    success: false,
                    data: null,
                    message: "User not found with id " + id
                });
            }
            return res.status(201).send({ message: "success", success: true, data: null })
        })
    } catch (error) {
        console.log(error);
        res.status(500).send({
            message: "Error Something went wrong",
            error,
        })
    }

}

export default { getFiles, uploadFiles, download, deleteFile }