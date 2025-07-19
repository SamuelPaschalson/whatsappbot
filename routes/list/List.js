const express = require('express')
const router = express.Router()
const List = require('../../model/List')
const Movie = require('../../model/Movie')

/**
 * @route POST /api/lists
 * @description Create a new Netflix-style content list
 * @access Private (Admin only in production)
 * @body {
 *   title: String,          // List title (e.g., "Trending Now")
 *   type: String,           // "movie", "series", etc.
 *   genre: String,          // Primary genre
 *   category: String,       // "trendingNow", "newReleases", etc.
 *   rowPosition: Number,    // Display order
 *   content: [String],      // Array of Movie IDs
 *   isNetflixOriginal: Boolean,
 *   bullet: [String],       // Special indicators
 *   matchScore: Number      // Recommendation score 0-100
 * }
 */
// CREATE NEW LIST
router.post('/', async (req, res) => {
    try {
        // Validate required fields
        const requiredFields = ['title', 'type', 'genre', 'category', 'rowPosition', 'content']
        for (const field of requiredFields) {
            if (!req.body[field]) {
                return res.status(400).json({
                    success: false,
                    message: `Missing required field: ${field}`,
                })
            }
        }

        // Validate content exists
        const contentExists = await Movie.countDocuments({
            _id: { $in: req.body.content },
        })
        console.log(contentExists)
        console.log(req.body.content.length)

        // if (contentExists !== req.body.content.length) {
        //     return res.status(400).json({
        //         success: false,
        //         message: 'One or more content IDs are invalid',
        //     })
        // }

        // Create the list
        const data = {
            title: req.body.title,
            type: req.body.type,
            genre: req.body.genre,
            category: req.body.category,
            rowPosition: req.body.rowPosition,
            content: req.body.content,
            isNetflixOriginal: req.body.isNetflixOriginal || false,
            bullet: req.body.bullet || [],
            matchScore: req.body.matchScore || 0,
        }
        // Save to database
        const newList = await List.save(data)

        // Return the populated list
        const dataList = await List.populate({
            findById: newList._id,
            path: 'content',
            select: 'title img year',
            options: { limit: 5 },
        })
        return res.status(201).json({
            success: true,
            status_code: 201,
            message: 'List created successfully',
            data: dataList,
        })
    } catch (err) {
        // Handle duplicate key error
        if (err.code === 11000) {
            return res.status(400).json({
                success: false,
                status_code: 400,
                message: 'List with this title already exists',
            })
        }

        // Handle validation errors
        if (err.name === 'ValidationError') {
            const messages = Object.values(err.errors).map((val) => val.message)
            return res.status(400).json({
                success: false,
                status_code: 400,
                message: messages,
            })
        }

        // Generic server error
        return res.status(500).json({
            success: false,
            status_code: 500,
            message: 'Server error',
            error: err.message,
        })
    }
})

// GET ALL LISTS WITH FILTERS
router.get('/', async (req, res) => {
    try {
        const { type, genre, category, limit = 10, page = 1, sort = 'rowPosition' } = req.query

        // Build the query object
        const query = {}
        if (type) query.type = type
        if (genre) query.genre = genre
        if (category) query.category = category

        // Prepare options
        const options = {
            limit: parseInt(limit),
            skip: (parseInt(page) - 1) * parseInt(limit),
            sort: { [sort]: 1 }, // Convert sort string to object
        }

        // Get paginated results
        const lists = await List.find(query, options)

        // Get total count (without pagination)
        const total = await List.countDocuments(query)

        // Transform results to include virtual properties
        const transformedLists = lists.map((list) => {
            const listObj = list.toObject ? list.toObject() : list
            return {
                ...listObj,
                displayTitle:
                    listObj.displayTitle ||
                    `${listObj.title}${listObj.isNetflixOriginal ? ' (Netflix)' : ''}`,
            }
        })

        return res.status(200).json({
            success: true,
            status_code: 200,
            data: transformedLists,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / parseInt(limit)),
            },
        })
    } catch (err) {
        console.error('Error fetching lists:', err)
        return res.status(500).json({
            success: false,
            status_code: 500,
            message: 'Server error',
            error: err.message,
        })
    }
})

// GET LIST BY ID
router.get('/:id', async (req, res) => {
    try {
        const list = await List.findById(req.params.id)
        if (!list) {
            return res.status(404).json({
                success: false,
                status_code: 404,
                message: 'List not found',
            })
        }
        return res.status(200).json({
            success: true,
            status_code: 200,
            data: list,
        })
    } catch (err) {
        return res.status(500).json({
            success: false,
            status_code: 500,
            message: 'Server error',
            error: err.message,
        })
    }
})

// UPDATE LIST
router.put('/:id', async (req, res) => {
    try {
        const list = await List.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true,
        })

        if (!list) {
            return res.status(404).json({
                success: false,
                status_code: 404,
                message: 'List not found',
            })
        }

        return res.status(200).json({
            success: true,
            status_code: 200,
            data: list,
            message: 'List updated successfully',
        })
    } catch (err) {
        return res.status(500).json({
            success: false,
            status_code: 500,
            message: 'Server error',
            error: err.message,
        })
    }
})

// DELETE LIST
router.delete('/:id', async (req, res) => {
    try {
        const list = await List.findByIdAndDelete(req.params.id)
        if (!list) {
            return res.status(404).json({
                success: false,
                status_code: 404,
                message: 'List not found',
            })
        }
        return res.status(200).json({
            success: true,
            status_code: 200,
            message: 'List deleted successfully',
        })
    } catch (err) {
        return res.status(500).json({
            success: false,
            status_code: 500,
            message: 'Server error',
            error: err.message,
        })
    }
})

// NETFLIX-SPECIFIC ENDPOINTS

// SEARCH LISTS (Improved version)
router.get('/search/list', async (req, res) => {
    try {
        const { q: query, limit = 10, fields } = req.query

        if (!query) {
            return res.status(400).json({
                success: false,
                message: 'Search query (q) is required',
            })
        }

        const searchFields = fields ? fields.split(',') : ['title', 'genre', 'description']
        const searchLimit = parseInt(limit)

        const lists = await List.find(
            {}, // Empty filter since we'll use custom filtering
            {
                filter: (list) => {
                    // Case-insensitive search across specified fields
                    return searchFields.some(
                        (field) =>
                            list[field] && list[field].toString().includes(query.toLowerCase())
                    )
                },
                sort: (a, b) => {
                    // Simple relevance scoring:
                    // 1. Count matches in all fields
                    // 2. Prioritize title matches
                    const scoreA = searchFields.reduce(
                        (sum, field) =>
                            sum + (a[field]?.toLowerCase().includes(query.toLowerCase()) ? 1 : 0),
                        0
                    )
                    const scoreB = searchFields.reduce(
                        (sum, field) =>
                            sum + (b[field]?.toLowerCase().includes(query.toLowerCase()) ? 1 : 0),
                        0
                    )

                    if (scoreA !== scoreB) return scoreB - scoreA
                    if (a.title?.toLowerCase().includes(query.toLowerCase())) return -1
                    if (b.title?.toLowerCase().includes(query.toLowerCase())) return 1
                    return 0
                },
                limit: searchLimit,
            }
        )

        return res.status(200).json({
            success: true,
            query,
            fields: searchFields,
            results: lists.length,
            data: lists,
        })
    } catch (err) {
        return res.status(500).json({
            success: false,
            message: 'Server error',
            error: err.message,
        })
    }
})

// GET LISTS BY CATEGORY (For homepage rows)
router.get('/category/:category', async (req, res) => {
    try {
        const { limit = 10 } = req.query
        const lists = await List.find(
            {
                category: req.params.category,
            },
            {
                sort: { rowPosition: 1 },
                limit: parseInt(limit),
            }
        )

        res.status(200).json({
            success: true,
            data: lists,
        })
    } catch (err) {
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: err.message,
        })
    }
})

// GET CONTINUE WATCHING LIST
router.get('/continue-watching/:userId', async (req, res) => {
    try {
        const lists = await List.find(
            {
                category: 'continueWatching',
                'content.userId': req.params.userId,
            },
            {
                sort: { updatedAt: -1 },
            }
        )

        res.status(200).json({
            success: true,
            data: lists,
        })
    } catch (err) {
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: err.message,
        })
    }
})

// GET MY LIST (User's saved content)
router.get('/my-list/:userId', async (req, res) => {
    try {
        const lists = await List.find(
            {
                category: 'myList',
                'content.userId': req.params.userId,
            },
            {
                sort: { createdAt: -1 },
            }
        )

        res.status(200).json({
            success: true,
            data: lists,
        })
    } catch (err) {
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: err.message,
        })
    }
})

module.exports = router
