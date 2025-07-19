const jsonDb = require('@samuelpaschalson/json-db')

const Movie = new jsonDb.Schema(
    {
        // Core identification
        isSeries: { type: Boolean, default: false },
        title: {
            type: String,
            required: true,
            unique: true,
        },

        // Content metadata
        desc: {
            type: String,
            required: true,
        },
        type: {
            type: String,
            enum: ['movie', 'series', 'documentary', 'standup', 'kids'],
            required: true,
        },
        year: {
            type: Number,
            min: 1900,
            max: new Date().getFullYear() + 5,
        },
        limit: {
            type: Number,
            min: 0,
            max: 21,
        },

        // Visual assets for different states
        assets: {
            // Unhovered state (thumbnail)
            thumbnail: {
                type: String,
                required: true,
            },
            // Hover state (larger preview image)
            hoverPreview: {
                type: String,
            },
            // Video preview for hover state
            videoPreview: {
                type: String,
            },
            // Title treatment (logo)
            titleLogo: {
                type: String,
            },
            // Hero image for featured content
            heroImage: {
                type: String,
            },
        },

        // Genres (primary + secondaries)
        genres: {
            primary: {
                type: String,
                required: true,
                enum: ['action', 'comedy', 'drama', 'sci-fi', 'horror', 'romance', 'thriller'],
            },
            secondary: [
                {
                    type: String,
                },
            ],
        },

        // Maturity rating
        rating: {
            type: String,
            enum: ['G', 'PG', 'PG-13', 'R', 'NC-17', 'TV-MA', 'TV-14', 'TV-PG'],
            required: true,
        },

        // Series-specific fields
        seriesInfo: {
            seasons: {
                type: Number,
                min: 1,
            },
            episodes: {
                type: Number,
                min: 1,
            },
            currentEpisode: {
                title: String,
                duration: String, // e.g. "52m"
                description: String,
            },
        },

        // Interactive elements
        actions: {
            playUrl: {
                type: String,
                required: true,
            },
            addToList: {
                type: Boolean,
                default: false,
            },
            isInMyList: {
                type: Boolean,
                default: false,
            },
        },

        // UI state indicators
        uiStates: {
            isFeatured: {
                type: Boolean,
                default: false,
            },
            isTrending: {
                type: Boolean,
                default: false,
            },
            isNewRelease: {
                type: Boolean,
                default: false,
            },
            matchScore: {
                type: Number,
                min: 0,
                max: 100,
            },
        },

        // Technical metadata
        technical: {
            aspectRatio: {
                type: String,
                default: '16:9',
            },
            resolution: {
                type: String,
                enum: ['SD', 'HD', '4K', 'HDR'],
                default: 'HD',
            },
            audioLanguages: [
                {
                    type: String,
                },
            ],
            subtitles: [
                {
                    type: String,
                },
            ],
        },
    },
    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    }
)

// Virtual for formatted title with year
Movie.virtual('displayTitle').get(function () {
    return `${this.title}${this.year ? ` (${this.year})` : ''}`
})

// Or alternatively:
Movie.virtual('hoverData', {
    get: function () {
        return {
            previewMedia: this.assets.videoPreview || this.assets.hoverPreview,
            matchScore: this.uiStates.matchScore,
            currentEpisode: this.seriesInfo.currentEpisode,
            actions: this.actions,
        }
    },
})

module.exports = jsonDb.model('Movie', Movie, 'movie')
