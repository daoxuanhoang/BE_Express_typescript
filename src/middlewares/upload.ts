import util from 'util'
import multer from 'multer'
import { GridFsStorage } from 'multer-gridfs-storage'
import { config } from '../config/config'
import mongoose from 'mongoose';

const storage = new GridFsStorage({
    url: config.mongoUrl,
    options: { useNewUrlParser: true, useUnifiedTopology: true, },
    file: (req, file) => {

        if (file.mimetype === "image/jpeg" || file.mimetype === "image/png") {
            return {
                bucketName: "photos",
                filename: `${Date.now()}_${file.originalname.toLowerCase().split(' ').join('_')}`,
            }
        } else {
            //Otherwise save to default bucket
            return `${Date.now()}_${file.originalname.toLowerCase().split(' ').join('_')
                }`
        }
    }

});


const uploadFiles = multer({ storage: storage }).array('file', 50);
const uploadFilesMiddleware = util.promisify(uploadFiles);
export { uploadFilesMiddleware };