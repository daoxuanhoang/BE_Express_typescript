import mongoose from 'mongoose'

export interface IFile {
    id: string,
    uploadDate: Date,
    filename: string,
    // contentType: any,
    chunkSize: number,
    length: number
}
export interface IFileModel extends IFile, Document { }

const FilesSchema = new mongoose.Schema(
    {
        id: { type: String, require: true },
        uploadDate: { type: Date },
        filename: { type: String },
        contentType: { type: String },
        chunkSize: { type: Number },
        length: { type: Number }
    },
    { timestamps: true }
)
FilesSchema.clearIndexes()
FilesSchema.index({ filename: 'text' })

const Files = mongoose.model<IFile>('fs.files', FilesSchema)

export { Files }
