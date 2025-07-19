const { log } = require('console')
const express = require('express')
const _ = require('lodash')
var fs = require('fs')
const router = express.Router()
const Movie = require('../../model/Movie')

/**
 * @route POST /api/movies
 * @description Create a new movie/series with Netflix-style metadata
 * @access Private (Admin)
 * @body {
 *   title: String,
 *   desc: String,
 *   type: String,
 *   isSeries: Boolean,
 *   assets: {
 *     thumbnail: String,
 *     hoverPreview: String,
 *     videoPreview: String,
 *     titleLogo: String,
 *     heroImage: String
 *   },
 *   genres: {
 *     primary: String,
 *     secondary: [String]
 *   },
 *   rating: String,
 *   year: Number,
 *   limit: Number,
 *   seriesInfo: {
 *     seasons: Number,
 *     episodes: Number,
 *     currentEpisode: {
 *       title: String,
 *       duration: String,
 *       description: String
 *     }
 *   },
 *   actions: {
 *     playUrl: String,
 *     addToList: Boolean,
 *     isInMyList: Boolean
 *   },
 *   uiStates: {
 *     isFeatured: Boolean,
 *     isNewRelease: Boolean,
 *     isTrending: Boolean,
 *     matchScore: Number
 *   },
 *   technical: {
 *     aspectRatio: String,
 *     resolution: String,
 *     audioLanguages: String,
 *     subtitles: String
 *   }
 * }
 */

// CREATE NEW DATA
router.post('/', async (req, res) => {
    try {
        // Validate required fields
        const requiredFields = [
            'title',
            'desc',
            'type',
            'assets.thumbnail',
            'genres.primary',
            'rating',
            'year',
            'limit',
        ]

        for (const field of requiredFields) {
            if (!_.get(req.body, field)) {
                return res.status(400).json({
                    success: false,
                    message: `Missing required field: ${field}`,
                })
            }
        }

        // Create the movie
        const moviedata = {
            title: req.body.title,
            desc: req.body.desc,
            type: req.body.type,
            isSeries: req.body.isSeries || false,
            assets: req.body.assets,
            genres: req.body.genres,
            rating: req.body.rating,
            year: req.body.year,
            limit: req.body.limit,
            seriesInfo: req.body.seriesInfo,
            actions: req.body.actions || { playUrl: '', addToList: false },
            uiStates: req.body.uiStates || {},
        }

        // Save to database
        const newMovie = await Movie.save(moviedata)
        return res.status(201).json({
            success: true,
            message: 'Movie created successfully',
            data: newMovie,
        })
    } catch (err) {
        // Handle duplicate key error
        if (err.code === 11000) {
            return res.status(400).json({
                success: false,
                message: 'Movie with this title already exists',
            })
        }

        // Handle validation errors
        if (err.name === 'ValidationError') {
            const messages = Object.values(err.errors).map((val) => val.message)
            return res.status(400).json({
                success: false,
                messages,
            })
        }

        // Generic server error
        return res.status(500).json({
            success: false,
            message: 'Server error',
            error: err.message,
        })
    }
})

/**
 * @route PUT /api/movies/:id
 * @description Update a movie/series
 */
router.put('/:id', async (req, res) => {
    try {
        const movie = await Movie.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true,
        })
        console.log(movie)

        if (!movie) {
            return res.status(404).json({
                success: false,
                message: 'Movie not found',
            })
        }

        return res.status(200).json({
            success: true,
            message: 'Movie updated successfully',
            data: movie,
        })
    } catch (err) {
        // Handle validation errors
        if (err.name === 'ValidationError') {
            const messages = Object.values(err.errors).map((val) => val.message)
            return res.status(400).json({
                success: false,
                messages,
            })
        }

        res.status(500).json({
            success: false,
            message: 'Server error',
            error: err.message,
        })
    }
})

/**
 * @route PUT /api/movies/:id
 * @description Update a movie/series
 */
router.get('/get-all', async (req, res) => {
    try {
        const movie = await Movie.find()

        if (!movie) {
            return res.status(404).json({
                success: false,
                message: 'Movie not found',
            })
        }

        return res.status(200).json({
            success: true,
            message: 'Movie gotten successfully',
            data: movie,
        })
    } catch (err) {
        // Handle validation errors
        if (err.name === 'ValidationError') {
            const messages = Object.values(err.errors).map((val) => val.message)
            return res.status(400).json({
                success: false,
                messages,
            })
        }

        res.status(500).json({
            success: false,
            message: 'Server error',
            error: err.message,
        })
    }
})

/**
 * @route DELETE /api/movies/:id
 * @description Delete a movie/series
 */
router.delete('/:id', async (req, res) => {
    try {
        const movie = await Movie.findByIdAndDelete(req.params.id)

        if (!movie) {
            return res.status(404).json({
                success: false,
                message: 'Movie not found',
            })
        }

        res.status(200).json({
            success: true,
            message: 'Movie deleted successfully',
        })
    } catch (err) {
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: err.message,
        })
    }
})

/**
 * @route GET /api/movies/:id
 * @description Get a single movie/series by ID
 */
router.get('/find/:id', async (req, res) => {
    try {
        const movie = await Movie.findById(req.params.id)

        if (!movie) {
            return res.status(404).json({
                success: false,
                message: 'Movie not found',
            })
        }

        return res.status(200).json({
            success: true,
            data: movie,
        })
    } catch (err) {
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: err.message,
        })
    }
})

/**
 * @route GET /api/movies/random
 * @description Get random movie/series (optionally filtered by type)
 * @query type - Filter by "movie" or "series"
 */
router.get('/random', async (req, res) => {
    try {
        const type = req.query.type
        let filter = {}

        if (type === 'movie') {
            filter.isSeries = false
        } else if (type === 'series') {
            filter.isSeries = true
        }

        const movie = await Movie.aggregate([{ $match: filter }, { $sample: 1 }])

        if (!movie || movie.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'No movies found',
            })
        }

        res.status(200).json({
            success: true,
            data: movie[0],
        })
    } catch (err) {
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: err.message,
        })
    }
})

/**
 * @route GET /api/movies/random-featured
 * @description Get random featured movie/series
 * @query featured - Show featured content if 'uiStates.isFeatured' is true
 */
router.get('/random-featured', async (req, res) => {
    try {
        // Get all movies where uiStates.isFeatured is true
        const featuredMovies = await Movie.find({
            'uiStates.isFeatured': true,
        })

        if (!featuredMovies.length) {
            return res.status(404).json({
                success: false,
                message: 'No featured content found',
            })
        }
        // Select a random movie from the featured list
        const randomIndex = Math.floor(Math.random() * featuredMovies.length)
        const randomFeatured = featuredMovies[randomIndex]

        return res.status(200).json({
            success: true,
            data: randomFeatured,
        })
    } catch (err) {
        return res.status(500).json({
            success: false,
            message: 'Server error',
            error: err.message,
        })
    }
})
/**
 * @route GET /api/movies
 * @description Get all movies/series with optional filtering
 * @query type - Filter by "movie" or "series"
 * @query genre - Filter by genre
 * @query limit - Limit results
 * @query featured - Filter featured content
 * @query trending - Filter trending content
 */
router.get('/', async (req, res) => {
    try {
        const { type, genre, limit, featured, trending } = req.query
        const filter = {}

        // Build filter based on query parameters
        if (type === 'movie') {
            filter.isSeries = false
        } else if (type === 'series') {
            filter.isSeries = true
        }

        if (genre) {
            filter['genres.primary'] = genre
        }

        if (featured === 'true') {
            filter['uiStates.isFeatured'] = true
        }

        if (trending === 'true') {
            filter['uiStates.isTrending'] = true
        }

        // Prepare options
        const options = {}
        if (limit) {
            options.limit = parseInt(limit)
        }

        // Use your custom model's find method
        const movies = await Movie.find(filter, options)

        return res.status(200).json({
            success: true,
            count: movies.length,
            data: movies,
        })
    } catch (err) {
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: err.message,
        })
    }
})

/**
 * @route GET /api/movies/search
 * @description Search movies/series with Netflix-style relevance
 * @query q - Search query string
 * @query type - Filter by "movie" or "series"
 * @query genre - Filter by genre
 * @query limit - Limit results (default: 10)
 * @query page - Pagination page (default: 1)
 */
router.get('/search', async (req, res) => {
    try {
        const { q, type, genre, limit = 10, page = 1 } = req.query

        if (!q || q.trim() === '') {
            return res.status(400).json({
                success: false,
                message: 'Search query is required',
            })
        }

        // Prepare base filter
        const filter = {}
        const searchTerm = q.toLowerCase().trim()

        // Prepare options
        const options = {
            filter: (movie) => {
                // Search in title and description
                const titleMatch = movie.title.toLowerCase().includes(searchTerm)
                const descMatch = movie.desc.toLowerCase().includes(searchTerm)

                // Additional filters
                let typeMatch = true
                if (type === 'movie') typeMatch = !movie.isSeries
                if (type === 'series') typeMatch = movie.isSeries

                let genreMatch = true
                if (genre) genreMatch = movie.genres.primary === genre

                return (titleMatch || descMatch) && typeMatch && genreMatch
            },
            sort: (a, b) => {
                // Netflix-style relevance scoring
                const aScore = calculateRelevanceScore(a, searchTerm)
                const bScore = calculateRelevanceScore(b, searchTerm)
                return bScore - aScore
            },
        }

        // Calculate pagination
        const pageSize = parseInt(limit)
        const currentPage = Math.max(1, parseInt(page))
        options.limit = pageSize
        options.skip = (currentPage - 1) * pageSize

        // Execute search and transform results to include virtuals
        const allResults = await Movie.find(filter, options)
        const total = await Movie.countDocuments(filter)

        // Transform results to include virtual properties
        const formattedResults = allResults.map((movie) => {
            const movieObj = movie.toObject ? movie.toObject() : movie
            return {
                id: movieObj._id,
                title: movieObj.title,
                displayTitle:
                    movieObj.displayTitle ||
                    `${movieObj.title}${movieObj.year ? ` (${movieObj.year})` : ''}`,
                description: movieObj.desc,
                type: movieObj.isSeries ? 'series' : 'movie',
                thumbnail: movieObj.assets?.thumbnail,
                logo: movieObj.assets?.titleLogo,
                year: movieObj.year,
                rating: movieObj.limit,
                genre: movieObj.genres?.primary,
                isFeatured: movieObj.uiStates?.isFeatured,
                isTrending: movieObj.uiStates?.isTrending,
                matchScore:
                    movieObj.uiStates?.matchScore || calculateRelevanceScore(movieObj, searchTerm),
                hoverData: {
                    previewMedia: movieObj.assets?.videoPreview || movieObj.assets?.hoverPreview,
                    matchScore:
                        movieObj.uiStates?.matchScore ||
                        calculateRelevanceScore(movieObj, searchTerm),
                    currentEpisode: movieObj.seriesInfo?.currentEpisode,
                    actions: movieObj.actions,
                },
            }
        })

        res.status(200).json({
            success: true,
            query: q,
            results: formattedResults,
            pagination: {
                page: currentPage,
                limit: pageSize,
                total,
                pages: Math.ceil(total / pageSize),
            },
        })
    } catch (err) {
        console.error('Search error:', err)
        res.status(500).json({
            success: false,
            message: 'Search failed',
            error: err.message,
        })
    }
})

// Helper function to calculate relevance score
function calculateRelevanceScore(movie, searchTerm) {
    const titleMatch = movie.title.toLowerCase().includes(searchTerm) ? 2 : 0
    const descMatch = movie.desc.toLowerCase().includes(searchTerm) ? 1 : 0
    const existingScore = movie.uiStates?.matchScore || 0
    return titleMatch + descMatch + existingScore
}
module.exports = router
