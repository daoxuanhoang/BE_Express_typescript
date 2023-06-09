import express from 'express'
import Logging from './libraries/Logging'
import authorRoutes from './routes/Author'
import customerRoutes from './routes/Customer'
import fileRoutes from './routes/File'

const app = express()

/** Log the request */
app.use((req, res, next) => {
    /** Log the req */
    Logging.info(`Incomming - METHOD: [${req.method}] - URL: [${req.url}] - IP: [${req.socket.remoteAddress}]`)

    res.on('finish', () => {
        /** Log the res */
        Logging.info(`Result - METHOD: [${req.method}] - URL: [${req.url}] - IP: [${req.socket.remoteAddress}] - STATUS: [${res.statusCode}]`)
    })

    next()
})

app.use(express.urlencoded({ extended: true }))
app.use(express.json())

/** Rules of our API */
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*')
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization')

    if (req.method == 'OPTIONS') {
        res.header('Access-Control-Allow-Methods', 'PUT, POST, PATCH, DELETE, GET')
        return res.status(200).json({})
    }

    next()
})

/** Routes */
app.use(authorRoutes)
app.use(customerRoutes)
app.use(fileRoutes)

/** Healthcheck */
app.get('/ping', (req, res, next) => res.status(200).json({ hello: 'world' }))

/** Error handling */
app.use((req, res, next) => {
    const error = new Error('something went wrong!')

    Logging.error(error)

    res.status(404).json({
        message: error.message
    })
})

export default app
