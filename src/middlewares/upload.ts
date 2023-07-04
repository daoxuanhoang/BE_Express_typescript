import util from 'util'
import multer from 'multer'
import { GridFsStorage } from 'multer-gridfs-storage'
import { config } from '../config/config'
import mongoose from 'mongoose';

const storage = new GridFsStorage({
    url: config.mongoUrl,
    options: { useNewUrlParser: true, useUnifiedTopology: true, },
    file: (req, file) => {
        console.log('file', file);
        console.log('req', req);

        const match = ["application/xml", "text/xml"];


        if (match.indexOf(file.mimetype) === -1) {
            const filename = `${Date.now()}-bezkoder-${file.originalname}`;
            return filename;
        }

        return {
            id: new mongoose.Types.ObjectId(),
            filename: `${Date.now()}-bezkoder-${file.originalname}`
        };
    }

});


const uploadFiles = multer({ storage: storage }).array('file', 50);
const uploadFilesMiddleware = util.promisify(uploadFiles);
export { uploadFilesMiddleware };