const express = require('express')
var fs = require('fs') //require file system object
const cors = require('cors')
const api = express()
api.use(express.json())
api.use(cors())

api.listen(8800, () => {
    console.log('Backend server (api) is running!')
})

const movieRoute = require('./routes/movie/Movie')
const listRoute = require('./routes/list/List')
const userRoute = require('./routes/auth/user/User')
const authRoute = require('./routes/auth/Auth')
const watchRoute = require('./routes/watched/Watch')

api.use('/api/movie', movieRoute)
api.use('/api/list', listRoute)
api.use('/api/auth', authRoute)
api.use('/api/watch', watchRoute)
api.use('/api/users', userRoute)
api.use('/api/', (req, res) => {
    return res.status(200).json({
        message: 'Netflix api',
    })
})

module.exports = api
