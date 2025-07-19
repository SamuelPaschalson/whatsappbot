const { log } = require('console')
const express = require('express')
var fs = require('fs')
const router = express.Router()
const User = require('../../../model/User')
const { verify, verifyAdmin } = require('../../verifyToken')

// UPDATE USER
router.put('/:id', verify, async (req, res) => {
    if (req.user.id === req.params.id || req.user.isAdmin) {
        try {
            const updatedUser = await User.findByIdAndUpdate(req.params.id, req.body, { new: true })
            return res.status(200).json({
                success: true,
                status_code: 200,
                message: 'User Data updated successfully',
                data: updatedUser,
            })
        } catch (err) {
            return res.status(500).json({
                success: false,
                status_code: 500,
                message: 'Server error',
                error: err.message,
            })
        }
    } else {
        return res.status(403).json({
            success: false,
            status_code: 403,
            message: 'You can update only your account!',
        })
    }
})

// DELETE USER
router.delete('/:id', verify, async (req, res) => {
    if (req.user.id === req.params.id || req.user.isAdmin) {
        try {
            await User.findByIdAndDelete(req.params.id)
            res.status(200).json('User has been deleted')
        } catch (err) {
            res.status(500).json(err)
        }
    } else {
        res.status(403).json('You can delete only your account!')
    }
})

// GET USER
router.get('/find/:id', verify, async (req, res) => {
    try {
        const user = await User.findById(req.params.id)
        if (!user) return res.status(404).json('User not found')

        const { password, ...userData } = user
        res.status(200).json(userData)
    } catch (err) {
        res.status(500).json(err)
    }
})

// GET ALL USERS (Admin only)
router.get('/', verify, async (req, res) => {
    try {
        if (!req.user.isAdmin) {
            return res.status(403).json({
                success: false,
                message: 'Admin access required',
                required: 'isAdmin: true',
                currentUser: {
                    id: req.user.id,
                    isAdmin: req.user.isAdmin,
                },
            })
        }

        const users = await User.find()
        const sanitizedUsers = users.map((user) => {
            const { password, ...userData } = user
            return userData
        })

        res.status(200).json({
            success: true,
            count: sanitizedUsers.length,
            users: sanitizedUsers,
        })
    } catch (err) {
        res.status(500).json({
            success: false,
            message: 'Error fetching users',
            error: err.message,
        })
    }
})

// ADD TO WATCH HISTORY
router.post('/:id/history', verify, async (req, res) => {
    try {
        const user = await User.findById(req.params.id)
        if (!user) return res.status(404).json('User not found')

        user.watchHistory.push({
            contentId: req.body.movieId,
            progress: req.body.progress || 0,
            lastWatched: new Date(),
        })

        await user.save()
        const { password, ...userData } = user
        res.status(200).json(userData)
    } catch (err) {
        res.status(500).json(err)
    }
})

// ADD TO MY LIST
router.post('/:id/mylist', verify, async (req, res) => {
    try {
        const user = await User.findById(req.params.id)
        if (!user) return res.status(404).json('User not found')

        const alreadyInList = user.myList.some((item) => item.contentId === req.body.movieId)
        if (alreadyInList) {
            return res.status(400).json('Movie already in your list')
        }

        user.myList.push({
            contentId: req.body.movieId,
            addedAt: new Date(),
        })

        await user.save()
        const { password, ...userData } = user
        res.status(200).json(userData)
    } catch (err) {
        res.status(500).json(err)
    }
})

// REMOVE FROM MY LIST
router.delete('/:id/mylist/:movieId', verify, async (req, res) => {
    try {
        const user = await User.findById(req.params.id)
        if (!user) return res.status(404).json('User not found')

        user.myList = user.myList.filter((item) => item.contentId !== req.params.movieId)
        await user.save()

        const { password, ...userData } = user
        res.status(200).json(userData)
    } catch (err) {
        res.status(500).json(err)
    }
})

// ADMIN: GET USER STATS
router.get('/stats', verifyAdmin, async (req, res) => {
    if (!req.user.isAdmin) {
        return res.status(403).json({
            success: false,
            message: 'Admin access required',
            required: 'isAdmin: true',
            currentUser: {
                id: req.user.id,
                isAdmin: req.user.isAdmin,
            },
        })
    }

    try {
        const users = await User.find()
        const today = new Date()
        const lastYear = new Date(today.setFullYear(today.getFullYear() - 1))

        // Filter users created in the last year
        const recentUsers = users.filter((user) => {
            const userDate = new Date(user.createdAt || user._id.getTimestamp())
            return userDate >= lastYear
        })

        // Group by month and count
        const monthlyStats = recentUsers.reduce((stats, user) => {
            const userDate = new Date(user.createdAt || user._id.getTimestamp())
            const month = userDate.getMonth() + 1 // Months are 0-indexed in JS

            if (!stats[month]) {
                stats[month] = { _id: month, total: 0 }
            }
            stats[month].total++

            return stats
        }, {})

        // Convert to array and sort by month
        const stats = Object.values(monthlyStats).sort((a, b) => a._id - b._id)

        res.status(200).json({
            success: true,
            data: {
                period: {
                    start: lastYear.toISOString(),
                    end: new Date().toISOString(),
                },
                stats: stats,
            },
        })
    } catch (err) {
        res.status(500).json({
            success: false,
            message: 'Error calculating user statistics',
            error: err.message,
        })
    }
})
// // UPDATE EXISTING DATA
// router.put('/:id', verify, async (req, res) => {
//     if (req.user.id === req.params.id || req.user.isAdmin) {
//         try {
//             const updatedUser = await User.findByIdAndUpdate(req.params.id, req.body)
//             return res.status(200).json({ success: true, status_code: 200, data: updatedUser })
//         } catch (err) {
//             return res.status(500).json({ success: false, status_code: 500, errror: err })
//         }
//     } else {
//         return res.status(403).json({
//             success: false,
//             status_code: 403,
//             message: 'You can update only your account!',
//         })
//     }
// })

// //DELETE
// router.delete('/:id', verify, async (req, res) => {
//     if (req.user.id === req.params.id || req.user.isAdmin) {
//         try {
//             await User.findByIdAndDelete(req.params.id)
//             return res.status(200).json({
//                 success: true,
//                 status_code: 200,
//                 message: 'User has been deleted...',
//             })
//         } catch (err) {
//             return res.status(500).json({ success: false, status_code: 500, error: err })
//         }
//     } else {
//         return res.status(403).json({
//             success: false,
//             status_code: 403,
//             message: 'You can delete only your account!',
//         })
//     }
// })

// //GET
// router.get('/find/:id', async (req, res) => {
//     try {
//         const user = await User.findById(req.params.id)
//         const { password, ...info } = user._doc
//         return res.status(200).json({ success: true, status_code: 200, data: info })
//     } catch (err) {
//         return res.status(500).json({ success: false, status_code: 500, error: err })
//     }
// })

module.exports = router
