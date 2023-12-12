import express from 'express'
import Logging from './libraries/Logging'
import authorRoutes from './routes/Author'
import fileRoutes from './routes/File'
import postRoutes from "./routes/Post"
import swaggerDocs from './utils/swagger'
import { Server } from 'socket.io'
import { createServer } from 'node:http'
import cors from "cors"

const app = express()
const server = createServer(app);
const io = new Server(server);

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

io.on("connection", (socket) => { ///Handle khi có connect từ client tới
    socket.on("disconnecting", async reason => {
        for (const room of socket.rooms as any) {
            if (room !== socket.id) {
                const sockets = await io.in(room).fetchSockets()
                const payload = sockets.reduce((p, c) => ({ ...p, [c.id]: { ...c.handshake.query } } as any))
                const data = { type: 'ROOM.STATUS', payload }
                socket.to(room).emit("data", data)
            }
        }
        console.log(`${socket.id} disconnecting by reason`, reason)
    })

    socket.on('subscribe', async (room, callback) => {
        socket.join(room)
        const sockets = await io.in(room).fetchSockets()
        const payload = sockets.reduce((p, c) => ({ ...p, [c.id]: { ...c.handshake.query } } as any), {})
        const data = { type: 'ROOM.STATUS', payload }
        socket.to(room).emit("data", { room, data })
        if (typeof callback === "function") callback(data)
        console.log(`${socket.id} joined room`, { room, payload })
    })

    socket.on('unsubscribe', async (room, callback) => {
        if (!room) {
            if (typeof callback === 'function') callback('Room name is required.')
        } else {
            socket.leave(room)
            const sockets = await io.in(room).fetchSockets()
            const payload = sockets.reduce((p, c) => ({ ...p, [c.id]: { ...c.handshake.query } }), {})
            const data = { type: 'ROOM.STATUS', payload }
            socket.to(room).emit('data', { room, data })
            if (typeof callback === 'function') callback(data)
            console.log(`${socket.id} leaving room`, room)
        }
    })

    socket.on('send', (data, callback) => {
        console.log(`${socket.id} send`, data)
        if (typeof callback === 'function') callback()
        if (data?.room) {
            socket.to(data.room).emit('data', data)
        }
    })

    socket.on('__testing_client_to_server', () => {
        socket.emit('__testing_server_to_client')
    })

});

app.use(cors())
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

swaggerDocs(app)

/** Routes */
app.use(authorRoutes)
app.use(fileRoutes)
app.use(postRoutes)

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

export { app, server }
