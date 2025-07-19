const jsonDb = require('@samuelpaschalson/json-db')
// console.log(jsonDb.model)

const List = new jsonDb.Schema(
    {
        title: {
            type: String,
            required: true,
            unique: true,
        },
        type: {
            type: String,
            enum: ['movie', 'series', 'documentary', 'standup', 'kids'],
            required: true,
        },
        genre: {
            type: String,
            enum: [
                'action',
                'comedy',
                'drama',
                'horror',
                'sci-fi',
                'thriller',
                'romance',
                'documentary',
                'animation',
            ],
            required: true,
        },
        content: [
            {
                type: String,
                ref: 'Movie',
                required: true,
            },
        ],
        category: {
            type: String,
            enum: [
                'trendingNow',
                'popularOnNetflix',
                'continueWatching',
                'newReleases',
                'watchAgain',
                'awardWinning',
                'becauseYouWatched',
                'myList',
            ],
            required: true,
        },
        rowPosition: {
            type: Number,
            required: true,
        },
        isNetflixOriginal: {
            type: Boolean,
            default: false,
        },
        matchScore: {
            type: Number,
            min: 0,
            max: 100,
            default: 0,
        },
        bullet: [String],
    },
    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    }
)

// Virtual for formatted title
List.virtual('displayTitle').get(function () {
    return `${this.title}${this.isNetflixOriginal ? ' (Netflix)' : ''}`
})

// Add text index for searching
List.index({ title: 'text', genre: 'text' })

module.exports = jsonDb.model('List', List, 'list')
