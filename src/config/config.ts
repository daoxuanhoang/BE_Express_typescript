import dotenv from 'dotenv'

dotenv.config()

const SERVER_PORT = process.env.SERVER_PORT ? Number(process.env.SERVER_PORT) : 3000

export const config = {
    mongoUrl: process.env.MONGO_URL || '',
    imgBucket: "photos",
    server: {
        port: SERVER_PORT,
    }
}
