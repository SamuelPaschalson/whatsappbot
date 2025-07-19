// const jwt = require('jsonwebtoken')

// function verify(req, res, next) {
//     const authHeader = req.headers.token
//     // console.log(authHeader);
//     if (authHeader) {
//         const token = authHeader.split(' ')[1]

//         jwt.verify(token, 'samuel', (err, user) => {
//             if (err) res.status(403).json('Token is not valid!')
//             req.user = user
//             next()
//         })
//     } else {
//         return res.status(401).json('You are not authenticated!')
//     }
// }

// module.exports = verify
const jwt = require('jsonwebtoken')

const verify = (req, res, next) => {
    const authHeader = req.headers.token || req.headers.authorization

    if (!authHeader) {
        return res.status(401).json('You are not authenticated!')
    }

    // Support both "Bearer <token>" and just "<token>" formats
    const token = authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : authHeader

    jwt.verify(token, 'NETFLIX', (err, decoded) => {
        if (err) {
            return res.status(403).json('Token is not valid!')
        }

        // Attach the decoded user to the request
        req.user = {
            id: decoded.id,
            isAdmin: decoded.isAdmin,
        }

        next()
    })
}

const verifyAdmin = (req, res, next) => {
    verify(req, res, () => {
        if (req.user && req.user.isAdmin) {
            next()
        } else {
            res.status(403).json('You are not authorized as admin!')
        }
    })
}

module.exports = { verify, verifyAdmin }
