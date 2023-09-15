import { app, server } from './app'
import mongoose from 'mongoose'
import { config } from './config/config'
import Logging from './libraries/Logging'

/** Connect to Mongo */
mongoose.set('strictQuery', false)
mongoose
    .connect(config.mongoUrl, { retryWrites: true, w: 'majority' })
    .then(() => {
        Logging.info('Mongo connected successfully.')
        StartServer()
    })
    .catch((error) => Logging.error(error))

/** Only Start Server if Mongoose Connects */
const StartServer = async () => {
    Logging.info('Server is checking workflow for merge...')

    /** Throw error if config variable undefine */
    if (!config.mongoUrl) {
        throw new Error('JWT_KEY must be defined')
    }

    try {
        await mongoose.connect(config.mongoUrl, { retryWrites: true, w: 'majority' })
        Logging.success('Mongo connected successfully.')

        Logging.info('Server has started!!!')
        server.listen(config.server.port, () => Logging.success(`Server is running on port ${config.server.port}`))
    } catch (error) {
        Logging.error(error)
    }
}
