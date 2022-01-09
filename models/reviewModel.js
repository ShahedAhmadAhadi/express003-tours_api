const mongoose = require('mongoose')
const Tour = require('./tourModel')

const reviewSchema = new mongoose.Schema({
    review: {type: String, required: [true, "review cannot be empty"]},
    ratting: {
        type: Number,
        min: 1,
        max: 5
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    tour: {
        type: mongoose.Schema.ObjectId,
        ref: "Tour",
        required: [true, "Review must belong to a tour."]
    },
    user: {
        type: mongoose.Schema.ObjectId,
        ref: "User",
        required: [true, "Review must belong to a user."]
    }
}, {
    toJSON: {virtuals: true},
    toObject: {virtuals: true}
})

reviewSchema.pre(/^find/, function(next) {
    // this.populate({
    //     path: 'tour',
    //     select: 'name'
    // }).populate({
    //     path: 'user',
    //     select: 'name photo'
    // })
    this.populate({
        path: 'user',
        select: 'name photo'
    })
    next()
})


reviewSchema.statics.calcAverageRatings = async function(tourId) {
    const stats = await this.aggregate([
        {
            $match: {tour: tourId}
        },
        {
            $group: {
                _id: '$tour',
                nRatings: { $sum: 1 },
                avgRatings: { $avg: '$rating' }
            }
        }
    ])

    await Tour.findByIdAndUpdate(tourId, {
        ratingsQuantity: stats[0].nRatings,
        ratingsAverage: stats[1].nRatings
    })

}

reviewSchema.post('save', function() {
    this.constructor.calcAverageRatings(this.tour)
})

const Review = mongoose.model('Review', reviewSchema)

module.exports = Review
