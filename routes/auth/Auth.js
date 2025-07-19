const router = require('express').Router()
const User = require('../../model/User')
const CryptoJS = require('crypto-js')
const jwt = require('jsonwebtoken')

// ADMIN REGISTER
router.post('/admin/register', async (req, res) => {
    try {
        const existingAdmin = await User.findOne({ isAdmin: true })
        if (existingAdmin) {
            return res
                .status(400)
                .json({ success: false, status_code: 400, message: 'Admin already exists' })
        }

        const newAdmin = {
            username: req.body.username,
            email: req.body.email,
            password: req.body.password,
            isAdmin: true,
        }

        await User.save(newAdmin)
        return res.status(201).json({
            success: true,
            status_code: 201,
            message: 'Admin created successfully',
        })
    } catch (err) {
        console.error('Error creating admin:', err)
        return res
            .status(500)
            .json({ success: true, status_code: 500, message: 'Server error', error: err.message })
    }
})

// USER REGISTER
router.post('/register', async (req, res) => {
    try {
        const newUser = {
            username: req.body.username,
            email: req.body.email,
            password: req.body.password,
            preferences: req.body.preferences,
        }

        const user = await User.save(newUser)
        console.log(process.env.SECRET_KEY)

        const accessToken = jwt.sign({ id: user._id, isAdmin: user.isAdmin }, 'NETFLIX', {
            expiresIn: '5d',
        })

        const { password, ...userInfo } = user
        return res.status(201).json({
            success: true,
            status_code: 201,
            message: 'User created successfully',
            data: { ...userInfo },
            accessToken,
        })
    } catch (err) {
        if (err.message.includes('duplicate')) {
            return res.status(400).json('Username or email already exists')
        }
        return res.status(500).json({
            success: true,
            status_code: 500,
            message: 'Server error',
            error: err.message,
        })
    }
})

// LOGIN
router.post('/login', async (req, res) => {
    try {
        const user = await User.findOne({ email: req.body.email })
        if (!user) {
            return res
                .status(401)
                .json({ success: true, status_code: 401, message: 'Invalid email credentials' })
        }

        if (user.password !== req.body.password) {
            return res
                .status(401)
                .json({ success: true, status_code: 401, message: 'Invalid password credentials' })
        }

        const accessToken = jwt.sign({ id: user._id, isAdmin: user.isAdmin }, 'NETFLIX', {
            expiresIn: '5d',
        })

        const { password, ...info } = user

        return res
            .status(200)
            .json({ success: true, status_code: 200, data: { ...info }, accessToken })
    } catch (err) {
        return res.status(500).json({
            success: true,
            status_code: 500,
            message: 'Server error',
            error: err.message,
        })
    }
})

module.exports = router
