const jsonDb = require('@samuelpaschalson/json-db')

const User = new jsonDb.Schema(
    {
        username: {
            type: String,
            required: true,
            unique: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
            match: [
                /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
                'Please fill a valid email address',
            ],
        },
        password: {
            type: String,
            required: true,
        },
        profilePic: {
            type: String,
            default:
                'https://icon-library.com/images/anonymous-avatar-icon/anonymous-avatar-icon-25.jpg',
        },
        isAdmin: {
            type: Boolean,
            default: false,
        },
        watchHistory: [
            {
                contentId: { type: String, ref: 'Movie' },
                watchedAt: { type: Date, default: Date.now },
                progress: { type: Number, default: 0 },
                lastWatched: { type: Date },
            },
        ],
        myList: [
            {
                contentId: { type: String, ref: 'Movie' },
                addedAt: { type: Date, default: Date.now },
            },
        ],
        preferences: {
            favoriteGenres: [String],
            maturityRating: { type: String, default: 'PG-13' },
        },
    },
    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    }
)

// Password encryption middleware
// User.pre('save', function (next) {
//     if (this.isModified('password')) {
//         this.password = CryptoJS.AES.encrypt(this.password, process.env.SECRET_KEY).toString()
//     }
//     next()
// })

module.exports = jsonDb.model('User', User, 'user')
